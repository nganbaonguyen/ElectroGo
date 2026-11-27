// "Dấu vân tay" phần native của app host: đổi thì bản JS mới có thể cần code native mà app đã cài không có,
// nên KHÔNG được phát OTA, phải build và phát hành bản app mới.
//
// Gồm: nội dung mọi file git đang theo dõi trong ios/ và android/ (trừ file sinh tự động / riêng từng máy)
// và danh sách `dependencies` trong package.json (thư viện của host phần lớn có native; thêm thư viện JS thuần
// vào host hiếm khi xảy ra, chặn nhầm vẫn an toàn hơn để lọt).
//
// Chạy trực tiếp:
//   node scripts/ota/native-fingerprint.mjs          in ra dấu vân tay hiện tại
//   node scripts/ota/native-fingerprint.mjs --write  ghi vào ota.config.json (pnpm ota:fingerprint)
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const IGNORED = [/^ios\/build\//, /^ios\/\.xcode\.env\.local$/, /^android\/app\/build\//];

export function nativeFingerprint() {
  const hash = createHash('sha256');
  const files = execFileSync('git', ['ls-files', '-z', 'ios', 'android'], {cwd: ROOT, encoding: 'utf8'})
    .split('\0')
    .filter(f => f && !IGNORED.some(re => re.test(f)))
    .sort();
  for (const file of files) {
    const full = path.join(ROOT, file);
    if (fs.existsSync(full)) {
      hash.update(`${file}\0`).update(fs.readFileSync(full)).update('\0');
    }
  }
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const deps = Object.entries(pkg.dependencies ?? {}).sort(([a], [b]) => a.localeCompare(b));
  hash.update(JSON.stringify(deps));
  return hash.digest('hex').slice(0, 16);
}

export function readOtaConfig() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'ota.config.json'), 'utf8'));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const fingerprint = nativeFingerprint();
  if (process.argv.includes('--write')) {
    const config = readOtaConfig();
    config.nativeFingerprint = fingerprint;
    fs.writeFileSync(path.join(ROOT, 'ota.config.json'), JSON.stringify(config, null, 2) + '\n');
    console.log(`Đã ghi nativeFingerprint=${fingerprint} cho bản app ${config.binaryVersion} vào ota.config.json`);
  } else {
    console.log(fingerprint);
  }
}
