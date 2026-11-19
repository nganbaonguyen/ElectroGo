import path from 'node:path';
import {createRequire} from 'node:module';
import * as Repack from '@callstack/repack';
import rspack from '@rspack/core';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');
const __dirname = Repack.getDirname(import.meta.url);

/**
 * Cấu hình Re.Pack cho HOST (super app).
 * Host nạp các mini app (remote) lúc chạy qua Module Federation. Địa chỉ remote:
 *   - dev:   mỗi mini app chạy server riêng (pnpm start:module): work 9001, sale 9002
 *   - build: đặt biến môi trường WORK_REMOTE_URL / SALE_REMOTE_URL trỏ tới nơi triển khai bundle
 * Thêm mini app mới: thêm một dòng vào REMOTES bên dưới.
 */
const REMOTES = {
  work: {port: 9001, env: 'WORK_REMOTE_URL'},
  sale: {port: 9002, env: 'SALE_REMOTE_URL'},
};

// Thư viện dùng chung giữa host và remote: phải là một bản duy nhất (singleton).
// Danh sách đọc từ federation.shared trong package.json; các mini app cũng đọc danh sách này khi build.
const shared = Object.fromEntries(
  (pkg.federation?.shared ?? []).map(name => {
    if (!pkg.dependencies[name]) {
      throw new Error(`federation.shared có "${name}" nhưng package.json chưa khai báo trong dependencies`);
    }
    return [name, {singleton: true, eager: true, requiredVersion: pkg.dependencies[name]}];
  }),
);

export default Repack.defineRspackConfig(env => {
  const {mode, platform} = env;

  // Android emulator gọi máy host qua 10.0.2.2; iOS simulator dùng localhost.
  const devHost = process.env.REMOTE_HOST ?? (platform === 'android' ? '10.0.2.2' : 'localhost');
  const remotes = Object.fromEntries(
    Object.entries(REMOTES).map(([name, {port, env: envName}]) => {
      const base = process.env[envName] ?? `http://${devHost}:${port}/${platform}`;
      return [name, `${name}@${base}/mf-manifest.json`];
    }),
  );

  // Địa chỉ manifest của từng remote (bỏ phần "<tên>@"), để app kiểm tra kết nối trước khi nạp.
  const manifestUrls = Object.fromEntries(
    Object.entries(remotes).map(([name, entry]) => [name, entry.slice(entry.indexOf('@') + 1)]),
  );

  // Phân phối bundle (web-deployment-apk). Thứ tự ưu tiên:
  //   DEPLOY_STATIC_URL: GitHub Pages (https cố định, web tự đưa bundle lên), chạy ở mọi WiFi. Khuyên dùng cho Release.
  //   DEPLOY_API_URL:    web chạy trong mạng LAN, phụ thuộc IP máy Mac.
  //   bỏ trống:          nạp từ địa chỉ cố định ở REMOTES (dev).
  const deployConfig = {
    apiUrl: (process.env.DEPLOY_API_URL ?? '').replace(/\/+$/, ''),
    staticUrl: (process.env.DEPLOY_STATIC_URL ?? '').replace(/\/+$/, ''),
    appId: process.env.DEPLOY_APP_ID ?? 'electrogo',
    env: ['live', 'prod', 'staging'].includes(process.env.DEPLOY_ENV) ? process.env.DEPLOY_ENV : 'live',
  };

  return {
    mode,
    context: __dirname,
    entry: './index.js',
    // enablePackageExports: Module Federation 2 cần đọc trường `exports` của package
    resolve: {...Repack.getResolveOptions({enablePackageExports: true})},
    output: {
      path: path.join(__dirname, 'build/generated', platform),
      uniqueName: 'electrogo-host',
    },
    module: {
      rules: [...Repack.getJsTransformRules(), ...Repack.getAssetTransformRules()],
    },
    plugins: [
      new Repack.RepackPlugin(),
      new rspack.DefinePlugin({
        __REMOTE_MANIFESTS__: JSON.stringify(manifestUrls),
        __DEPLOY_CONFIG__: JSON.stringify(deployConfig),
      }),
      new Repack.plugins.ModuleFederationPluginV2({
        name: 'host',
        dts: false,
        remotes,
        shared,
      }),
    ],
  };
});
