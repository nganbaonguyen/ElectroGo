// Phát bản OTA (JS bundle của app host) cho người dùng đang cài bản app `binaryVersion` trong ota.config.json.
// Chạy: `pnpm code-push-live` trên nhánh release/v<phiên bản app>
// (CI tự chạy khi merge develop vào nhánh release: .github/workflows/ota-release.yml).
//
// Các bước:
//   0. Chặn nếu không ở nhánh release/v<phiên bản>, hoặc phiên bản trong tên nhánh khác binaryVersion.
//   1. Chặn nếu phần native đã đổi so với bản app đang phát hành (dấu vân tay khác ota.config.json).
//   2. Chặn nếu thiếu DEPLOY_STATIC_URL: bundle OTA phải nhúng địa chỉ GitHub Pages giống bản Release,
//      thiếu thì app sẽ nạp mini app từ địa chỉ dev và lỗi.
//   3. Mỗi nền tảng: tạo lịch sử phát hành nếu chưa có, tính số bản OTA kế tiếp, chạy `code-push release`.
//
// Biến môi trường:
//   GITHUB_TOKEN        bắt buộc, quyền ghi Releases (GitHub Actions có sẵn)
//   DEPLOY_STATIC_URL   bắt buộc (CI: biến repo; máy: scripts/build.local.env)
//   OTA_MANDATORY=true  bản bắt buộc: app áp dụng ngay thay vì chờ lần mở sau
//   OTA_ROLLOUT=20      chỉ phát cho 20% người dùng
//   OTA_PLATFORMS=ios   chỉ phát một nền tảng (mặc định ios,android)
//   OTA_BRANCH          tên nhánh (CI truyền vào; ở máy lấy nhánh git hiện tại)
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {nativeFingerprint, readOtaConfig, ROOT} from './native-fingerprint.mjs';

const require = createRequire(import.meta.url);
const fail = message => {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
};

/** "1.0" -> "1.0.0" (giống src/app/ota.tsx). */
const toSemver = v => `${v}`.split('.').concat(['0', '0']).slice(0, 3).map(p => String(parseInt(p, 10) || 0)).join('.');
const parse = v => toSemver(v).split('.').map(Number);
const compare = (a, b) => {
  const [x, y] = [parse(a), parse(b)];
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};

// Chạy ở máy: lấy biến từ scripts/build.local.env nếu môi trường chưa có (giống build-android.sh / build-ios.sh)
const localEnv = path.join(ROOT, 'scripts/build.local.env');
if (fs.existsSync(localEnv)) {
  for (const line of fs.readFileSync(localEnv, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  }
}

const config = readOtaConfig();
const identifier = config.identifier;
const binary = toSemver(config.binaryVersion);
const platforms = (process.env.OTA_PLATFORMS || 'ios,android').split(',').map(s => s.trim()).filter(Boolean);

// 0. Nhánh release mang phiên bản app: OTA chỉ nhắm vào đúng phiên bản đó
const branch =
  process.env.OTA_BRANCH || execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {cwd: ROOT, encoding: 'utf8'}).trim();
const branchVersion = branch.match(/^release\/v?(\d+(?:\.\d+){0,2})$/)?.[1];
if (!branchVersion) {
  fail(`OTA chỉ phát từ nhánh release/v<phiên bản app>, ví dụ release/v1.0.0 (đang ở "${branch}").`);
}
if (toSemver(branchVersion) !== binary) {
  fail(
    `Nhánh ${branch} là app ${toSemver(branchVersion)} nhưng ota.config.json có binaryVersion ${config.binaryVersion} (${binary}).\n` +
      '  Sửa binaryVersion cho khớp phiên bản app của nhánh này (và build app bằng đúng số đó).',
  );
}

// 1. Phần native
const fingerprint = nativeFingerprint();
if (!config.nativeFingerprint) {
  fail('ota.config.json chưa có nativeFingerprint. Sau khi build bản app gửi lên store, chạy `pnpm ota:fingerprint` rồi commit.');
}
if (fingerprint !== config.nativeFingerprint) {
  fail(
    `Phần native đã đổi (dấu vân tay ${fingerprint}, bản app ${config.binaryVersion} là ${config.nativeFingerprint}).\n` +
      '  Bản JS này cần app mới, không phát OTA được. Cách làm:\n' +
      '  1. Tăng binaryVersion trong ota.config.json, build app bằng đúng số đó (ELECTROGO_VERSION_NAME) rồi phát hành lên store.\n' +
      '  2. Chạy `pnpm ota:fingerprint`, commit ota.config.json. Từ đó OTA nhắm vào bản app mới.',
  );
}

// 2. Địa chỉ phân phối mini app
if (!process.env.DEPLOY_STATIC_URL || !process.env.DEPLOY_STATIC_URL.startsWith('https://')) {
  fail('Thiếu DEPLOY_STATIC_URL (https://...github.io/...). CI: Settings > Secrets and variables > Actions > Variables.');
}
if (!process.env.GITHUB_TOKEN && !process.env.GH_TOKEN) {
  fail('Thiếu GITHUB_TOKEN (quyền ghi Releases của ' + config.repo + ').');
}

// 3. Phát hành
const storage = require(path.join(ROOT, 'code-push.config.js'));
const cli = path.join(ROOT, 'node_modules/.bin/code-push');
const run = args => execFileSync(cli, args, {cwd: ROOT, stdio: 'inherit', env: process.env});

const histories = {};
for (const platform of platforms) {
  histories[platform] = await storage.getReleaseHistory(binary, platform, identifier);
  if (Object.keys(histories[platform]).length === 0) {
    console.log(`==> ${platform}: tạo lịch sử phát hành cho bản app ${binary}`);
    run(['create-history', '--binary-version', binary, '--platform', platform, '--identifier', identifier]);
    histories[platform] = {[binary]: {}};
  }
}

// Cùng một số bản OTA cho cả hai nền tảng: lớn nhất hiện có + 1 (bản app 1.0.0 -> OTA 1.0.1, 1.0.2, ...)
const latest = Object.values(histories)
  .flatMap(h => Object.keys(h))
  .reduce((max, v) => (compare(v, max) > 0 ? toSemver(v) : max), binary);
const [major, minor, patch] = parse(latest);
const appVersion = `${major}.${minor}.${patch + 1}`;

const extra = [];
if (process.env.OTA_MANDATORY === 'true') {
  extra.push('--mandatory', 'true');
}
if (process.env.OTA_ROLLOUT) {
  extra.push('--rollout', process.env.OTA_ROLLOUT);
}

for (const platform of platforms) {
  console.log(`\n==> ${platform}: phát OTA ${appVersion} cho bản app ${binary} (${identifier})`);
  run([
    'release',
    '--binary-version', binary,
    '--app-version', appVersion,
    '--platform', platform,
    '--identifier', identifier,
    '--entry-file', 'index.js',
    ...extra,
  ]);
}

console.log(`\n✓ Đã phát OTA ${appVersion} (${platforms.join(', ')}). App nhận ở lần mở hoặc quay lại app kế tiếp.`);
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### OTA ${appVersion}\n\n- Bản app: ${binary}\n- Nền tảng: ${platforms.join(', ')}\n- Môi trường: ${identifier}\n` +
      `- Bắt buộc: ${process.env.OTA_MANDATORY === 'true' ? 'có' : 'không'}\n` +
      `- Rollback: \`npx code-push update-history --binary-version ${binary} --app-version ${appVersion} --platform <ios|android> --identifier ${identifier} --enable false\`\n`,
  );
}
