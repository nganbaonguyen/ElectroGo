/**
 * Cấu hình CLI `code-push` (@bravemobile/react-native-code-push): nơi lưu bản OTA của app host.
 *
 * Lưu trên GitHub Releases của repo trong ota.config.json, release cố định tên `ota-<identifier>` (ví dụ ota-live):
 *   <nền tảng>-<hash>.zip                                gói OTA (JS bundle + ảnh)
 *   history-<nền tảng>-<identifier>-<bản app>.json       lịch sử phát hành của một bản app; app đọc file này
 *                                                        (tên phải khớp src/app/ota.tsx)
 * Repo public nên app tải được không cần đăng nhập. Ghi lên cần GITHUB_TOKEN (quyền contents: write):
 * trên GitHub Actions có sẵn; chạy ở máy thì tạo token rồi `export GITHUB_TOKEN=...`.
 *
 * File .js (không phải .ts) để CLI nạp thẳng, không cần cài tsx/ts-node.
 */
const fs = require('node:fs');
const path = require('node:path');
const ota = require('./ota.config.json');

const API = 'https://api.github.com';
const REPO = process.env.OTA_REPO || ota.repo;

function token() {
  const t = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!t) {
    throw new Error('Thiếu GITHUB_TOKEN: cần token có quyền ghi Releases của ' + REPO);
  }
  return t;
}

async function gh(method, url, {body, headers} = {}) {
  return fetch(url.startsWith('http') ? url : API + url, {
    method,
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...headers,
    },
    body,
  });
}

async function ensureOk(res, what) {
  if (!res.ok) {
    throw new Error(`${what}: GitHub trả ${res.status} ${await res.text()}`);
  }
  return res;
}

const tagOf = identifier => `ota-${identifier || ota.identifier}`;
const historyName = (platform, identifier, binaryVersion) =>
  `history-${platform}-${identifier || ota.identifier}-${binaryVersion}.json`;

/** Release chứa bản OTA của một identifier; chưa có thì tạo (prerelease, không đánh dấu latest). */
const releases = {};
async function getRelease(identifier) {
  const tag = tagOf(identifier);
  if (!releases[tag]) {
    releases[tag] = (async () => {
      let res = await gh('GET', `/repos/${REPO}/releases/tags/${tag}`);
      if (res.status === 404) {
        res = await gh('POST', `/repos/${REPO}/releases`, {
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            tag_name: tag,
            name: `OTA ${identifier || ota.identifier}`,
            body: 'Bản cập nhật OTA của app host, do `pnpm code-push-live` tạo. Đừng xóa: app đang đọc file ở đây.',
            prerelease: true,
            make_latest: 'false',
          }),
        });
      }
      await ensureOk(res, `Lấy release ${tag}`);
      return res.json();
    })();
  }
  return releases[tag];
}

async function findAsset(release, name) {
  for (let page = 1; ; page++) {
    const res = await ensureOk(
      await gh('GET', `/repos/${REPO}/releases/${release.id}/assets?per_page=100&page=${page}`),
      'Liệt kê file của release',
    );
    const assets = await res.json();
    const found = assets.find(a => a.name === name);
    if (found || assets.length < 100) {
      return found;
    }
  }
}

/** Đưa file lên release, ghi đè file cùng tên (GitHub không cho upload trùng tên nên xóa trước). */
async function uploadAsset(identifier, filePath, name, contentType) {
  const release = await getRelease(identifier);
  const existing = await findAsset(release, name);
  if (existing) {
    await ensureOk(await gh('DELETE', `/repos/${REPO}/releases/assets/${existing.id}`), `Xóa ${name} cũ`);
  }
  const data = fs.readFileSync(filePath);
  await ensureOk(
    await gh('POST', `https://uploads.github.com/repos/${REPO}/releases/${release.id}/assets?name=${encodeURIComponent(name)}`, {
      headers: {'Content-Type': contentType, 'Content-Length': String(data.length)},
      body: data,
    }),
    `Upload ${name}`,
  );
  return `https://github.com/${REPO}/releases/download/${tagOf(identifier)}/${name}`;
}

module.exports = {
  bundleUploader: async (source, platform, identifier) => {
    const downloadUrl = await uploadAsset(identifier, source, `${platform}-${path.basename(source)}.zip`, 'application/zip');
    return {downloadUrl};
  },

  getReleaseHistory: async (targetBinaryVersion, platform, identifier) => {
    const release = await getRelease(identifier);
    const asset = await findAsset(release, historyName(platform, identifier, targetBinaryVersion));
    if (!asset) {
      return {};
    }
    // Đọc qua API (không qua link tải công khai) để luôn lấy bản vừa ghi, không dính cache
    const res = await ensureOk(
      await gh('GET', `/repos/${REPO}/releases/assets/${asset.id}`, {headers: {Accept: 'application/octet-stream'}}),
      'Tải lịch sử phát hành',
    );
    return res.json();
  },

  setReleaseHistory: async (targetBinaryVersion, jsonFilePath, _releaseInfo, platform, identifier) => {
    await uploadAsset(identifier, jsonFilePath, historyName(platform, identifier, targetBinaryVersion), 'application/json');
  },
};
