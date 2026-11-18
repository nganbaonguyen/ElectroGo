---
name: electrogo-superapp
description: Kiến trúc và cách setup super app ElectroGo (host + mini app electro-go-work, electro-go-sale) bằng Re.Pack + Module Federation. Dùng khi dựng lại super app từ đầu, thêm/sửa mini app, cấu hình Rspack, hoặc quyết định đặt code ở đâu.
---

# ElectroGo Super App

```
+--------------------------+------------------------------------------------------------------------------+
| TÓM TẮT                  | electrogo-superapp                                                           |
+==========================+==============================================================================+
| Là gì                    | Tài liệu kiến trúc và hướng dẫn setup super app ElectroGo từ đầu             |
+--------------------------+------------------------------------------------------------------------------+
| Hiểu app chạy thế nào    | Hiểu nhanh, Cấu trúc thư mục, Luồng chạy từ host sang mini app               |
+--------------------------+------------------------------------------------------------------------------+
| Dựng lại từ đầu          | Setup từ đầu: Phần A (host), B (mini app), C (nối vào host), D (chạy thử), E |
|                          | (production)                                                                 |
+--------------------------+------------------------------------------------------------------------------+
| Thêm chức năng, sửa code | Quy tắc bắt buộc, Trang chủ host, Màn hình trung tâm (hub), Chuẩn cấu trúc   |
|                          | của một mini app                                                             |
+--------------------------+------------------------------------------------------------------------------+
| Ôn phỏng vấn             | Đọc giai-thich-chi-tiet.md (cùng thư mục): vì sao, hoạt động thế nào, câu    |
|                          | hỏi phỏng vấn kèm gợi ý trả lời                                              |
+--------------------------+------------------------------------------------------------------------------+
| Phát hành                | Upload bundle mini app lên web phân phối rồi tích LIVE, build .apk/.aab/.ipa |
|                          | của host: skill release-deploy                                               |
+--------------------------+------------------------------------------------------------------------------+
| Skill liên quan          | add-mini-app (thêm app con), sync-submodules (đồng bộ), run-ios (chạy app,   |
|                          | lỗi build), release-deploy (phát hành)                                       |
+--------------------------+------------------------------------------------------------------------------+
| Tìm nhanh một mục        | Cmd+Shift+O rồi gõ tên mục để nhảy tới mục đó                                |
+--------------------------+------------------------------------------------------------------------------+
| Khi sửa file này         | Đọc README.md, mục "Quy ước khi sửa tài liệu skill", và mục "Ghi chú cho     |
|                          | người sửa" ở cuối file này                                                   |
+--------------------------+------------------------------------------------------------------------------+
```

## Hiểu nhanh

Super app gồm **một app chủ (host)** và **nhiều app con (mini app)**.

```
+-------------------+--------------------------------------+--------------------------------------------+
|                   | HOST                                 | MINI APP                                   |
|                   | (thư mục gốc ElectroGo)              | (electro-go-work, electro-go-sale)         |
+===================+======================================+============================================+
| Là gì             | App React Native thật,               | Chỉ code JS/TS,                            |
|                   | có ios/ và android/                  | KHÔNG có ios/, android/                    |
+-------------------+--------------------------------------+--------------------------------------------+
| Repo git          | Repo ElectroGo                       | Mỗi mini app một repo riêng,               |
|                   |                                      | gắn vào host bằng git                      |
|                   |                                      | submodule ở packages/                      |
+-------------------+--------------------------------------+--------------------------------------------+
| Chạy ở đâu        | Cài lên máy ảo / điện thoại          | Dev: server riêng (pnpm start:module)      |
|                   |                                      | Production: file tĩnh trên CDN             |
+-------------------+--------------------------------------+--------------------------------------------+
| Biết gì về        | Chỉ biết ĐỊA CHỈ của mini app        | Không biết host,                           |
| nhau              |                                      | chỉ xuất một component gốc ./App           |
+-------------------+--------------------------------------+--------------------------------------------+
```

Cách ghép: người dùng bấm một ô trên Home -> host **tải mini app từ địa chỉ của nó lúc đó** (Module Federation) -> hiển thị. Host không import mã nguồn mini app, nên cập nhật mini app chỉ cần thay file ở địa chỉ remote, **không phải phát hành lại app host**.

Công cụ: **Re.Pack (Rspack) + Module Federation v2**. Dự án **không dùng Metro** để chạy (`metro.config.js` giữ mặc định cho đủ bộ).

## Cấu trúc thư mục

```
ElectroGo/                      host (repo chính)
├── .npmrc                      node-linker=hoisted
├── pnpm-workspace.yaml         packages: ['packages/*']
├── package.json                scripts start / start:dev / ios / android / subs
├── react-native.config.js      bật lệnh Re.Pack cho `react-native start` và `bundle`
├── scripts/                    pull-subs.sh, build-android.sh, build-ios.sh, deploy-url.sh (xem release-deploy)
├── rspack.config.mjs           cấu hình host: REMOTES, shared, ModuleFederationPluginV2
├── index.js  App.tsx           entry của host
├── android/  ios/              code native, CHỈ có ở host
├── src/
│   ├── app/                    RootNavigator.tsx (MiniAppHost), remotes.ts (bảng nạp mini app),
│   │                           deploy.ts (hỏi web bản LIVE)
│   ├── types/remotes.d.ts      khai báo kiểu cho module nạp động ('work/App', ...)
│   ├── features/home/          màn Home (lưới icon), data/miniApps.ts
│   └── shared/                 theme, components dùng chung (MiniAppLoading, MiniAppErrorView, ...)
├── packages/                   mini app, MỖI CÁI LÀ MỘT GIT SUBMODULE (xem .gitmodules)
│   ├── electro-go-work/        name "@electrogo/work", cổng dev 9001
│   └── electro-go-sale/        name "@electrogo/sale", cổng dev 9002
├── sub/                        (tùy chọn, bị .gitignore) bản clone riêng do `pnpm subs` kéo về
└── build/                      file build sinh ra, không sửa tay
```

Bên trong một mini app:

```
packages/electro-go-work/
├── package.json                name, peerDependencies, scripts start:module / build / build:src
├── rspack.config.mjs           cấu hình REMOTE: name, filename, exposes, shared
├── dev/index.js, Harness.tsx   entry khi chạy riêng (host không chạy file này)
├── scripts/                    start-module.sh, build-bundle.sh, build-tar.sh
└── src/                        mã mini app (xem "Chuẩn cấu trúc của một mini app")
```

## Setup từ đầu

Thứ tự cố định: **A (host) -> B (mini app) -> C (nối hai bên) -> D (chạy thử)**. Mỗi phần có ghi "xong khi" để tự kiểm tra.

### Điều kiện cần

Node >= 22.11, pnpm, Xcode + CocoaPods (iOS), Android Studio (Android), Git.

### Phần A. Dựng host

1. **Tạo app React Native** (bản hiện tại: `react-native 0.88`, `react 19.3`). Giữ nguyên `android/`, `ios/`.
2. **Cấu hình pnpm** ở thư mục gốc:
   - `.npmrc`: `node-linker=hoisted` (để package trong `packages/` tìm được thư viện cài ở gốc).
   - `pnpm-workspace.yaml`: `packages: ['packages/*']`.
3. **Cài Re.Pack và Module Federation** (dự án khóa Rspack ở 1.x. Re.Pack 5.4.3 khai báo peerDependency @rspack/core >=1 nên không cấm 2.x, nhưng chưa kiểm chứng 2.x chạy được):
   ```bash
   pnpm add -D @callstack/repack@5.4.3 '@rspack/core@^1.6.0' @swc/helpers
   pnpm add @module-federation/enhanced@2.9.3
   ```
   Thư viện dùng chung: `pnpm add @react-native-vector-icons/ionicons react-native-safe-area-context`.
4. **Tạo `react-native.config.js`**:
   ```js
   module.exports = {commands: require('@callstack/repack/commands')};
   ```
5. **Tạo `rspack.config.mjs`** (host). Các phần bắt buộc:
   - `REMOTES`: bảng mini app, mỗi dòng `{port, env}`, ví dụ `work: {port: 9001, env: 'WORK_REMOTE_URL'}`.
   - Địa chỉ remote ở dev là `http://<host>:<port>/<platform>/mf-manifest.json`, với `<host>` = `localhost` (iOS) hoặc `10.0.2.2` (Android emulator). Production: lấy từ biến môi trường `WORK_REMOTE_URL`, `SALE_REMOTE_URL`.
   - `shared` cho `react`, `react-native`, `react-native-safe-area-context`: `{singleton: true, eager: true, requiredVersion: ...}`.
   - `resolve: Repack.getResolveOptions({enablePackageExports: true})`.
   - Plugin: `Repack.RepackPlugin()`, `DefinePlugin({__REMOTE_MANIFESTS__: ...})` (địa chỉ manifest để kiểm tra kết nối trước khi nạp), `ModuleFederationPluginV2({name: 'host', dts: false, remotes, shared})`.

   Mẫu chạy được: [rspack.config.mjs](../../../rspack.config.mjs) của chính repo này.
6. **Scripts trong `package.json`**: `"start": "react-native start"`, `"start:dev": "react-native start"`, `"ios"`, `"android"`.
7. **Viết code nạp mini app trong `src/`:**
   - `src/types/remotes.d.ts`: `declare module 'work/App' {...}` cho từng mini app, và `declare const __REMOTE_MANIFESTS__`.
   - `src/app/remotes.ts`: bảng `LOADERS` (`ensureReachable` rồi `import('work/App')`) và hàm `loadMiniApp(key)`.
   - `src/app/RootNavigator.tsx`: `MiniAppHost` quản lý loading -> ready (bọc `MiniAppErrorBoundary`) hoặc lỗi (`MiniAppErrorView`).
   - `src/features/home/data/miniApps.ts`: mỗi dòng một icon trên Home.
8. **Build native một lần:**
   ```bash
   cd ios && pod install && cd ..     # thêm module native callstack-repack
   ```
   rồi `pnpm ios` hoặc `pnpm android`.

Xong khi: `pnpm start:dev` chạy không lỗi ở cổng 8081 và app mở được Home (bấm ô sẽ báo lỗi kết nối vì mini app chưa chạy, đó là bình thường).

### Phần B. Dựng mini app (lặp lại cho mỗi mini app)

Mini app là repo riêng. Cách nhanh nhất là làm theo skill `add-mini-app` (sao chép từ `packages/electro-go-work` rồi đổi tên). Ý chính:

1. Tạo repo GitHub, dựng khung code theo "Chuẩn cấu trúc của một mini app" bên dưới, đẩy lên `main`.
2. `package.json`:
   - `name`: `@electrogo/<tên>`, `main`: `src/index.tsx`.
   - `peerDependencies` (đều `"*"`): `react`, `react-native`, `react-native-safe-area-context`, `@react-native-vector-icons/ionicons`. **Không** cài thư viện native riêng.
   - scripts: `start:module` (gán cổng, ví dụ `PORT=9001 bash scripts/start-module.sh`), `build`, `build:src`.
3. `rspack.config.mjs` (đóng vai **remote**):
   - `name`: tên remote, trùng khóa trong `REMOTES` của host (ví dụ `work`).
   - `filename`: `<tên>.container.js.bundle` (khác `index.bundle`, nếu trùng sẽ báo `Multiple assets emit different content to the same filename`).
   - `exposes: {'./App': './src/index.tsx'}`.
   - `shared`: cùng 3 thư viện với host nhưng `{singleton: true, eager: false, import: false}` (luôn dùng bản của host).
   - `resolve: Repack.getResolveOptions({enablePackageExports: true})`.
   - `entry: './dev/index.js'` (chỉ dùng khi chạy riêng).
4. `src/index.tsx`: `export {default} from './app/<Tên>App'` và export `manifest`.
5. `dev/index.js`, `dev/Harness.tsx`, `scripts/start-module.sh`, `scripts/build-bundle.sh`: sao chép từ `electro-go-work`.
6. Gắn vào host (chạy ở thư mục gốc ElectroGo):
   ```bash
   git submodule add https://github.com/nganbaonguyen/electro-go-<tên>.git packages/electro-go-<tên>
   ```

Xong khi: trong thư mục mini app chạy `pnpm start:module`, rồi `curl localhost:<cổng>/ios/mf-manifest.json` trả về JSON có `remoteEntry` và `exposes`.

### Phần C. Nối mini app vào host

Mỗi mini app mới cần sửa **5 chỗ** ở host (không thêm `@electrogo/<tên>` vào dependencies của host):

```
+---+------------------------------------+-----------------------------------------------------------------+
| # | File ở host                        | Sửa gì                                                          |
+===+====================================+=================================================================+
| 1 | rspack.config.mjs                  | Thêm dòng vào REMOTES (tên, cổng, biến <TÊN>_REMOTE_URL)        |
+---+------------------------------------+-----------------------------------------------------------------+
| 2 | src/types/remotes.d.ts             | Thêm declare module '<tên>/App', thêm khóa vào kiểu             |
|   |                                    | __REMOTE_MANIFESTS__                                            |
+---+------------------------------------+-----------------------------------------------------------------+
| 3 | src/app/remotes.ts                 | Thêm dòng vào LOADERS                                           |
+---+------------------------------------+-----------------------------------------------------------------+
| 4 | src/features/home/types.ts         | Thêm khóa vào MiniAppKey                                        |
+---+------------------------------------+-----------------------------------------------------------------+
| 5 | src/features/home/data/miniApps.ts | Thêm dòng icon: key, app, screen, label, icon                   |
+---+------------------------------------+-----------------------------------------------------------------+
```

Tên phải **khớp xuyên suốt**: `name` trong `rspack.config.mjs` của mini app = khóa trong `REMOTES` = tên module `'<tên>/App'` = khóa `MiniAppKey`.

Xong khi: bấm ô mới trên Home thì thấy loading rồi vào được mini app.

### Phần D. Chạy thử (mỗi server một terminal)

```bash
# Terminal 1 - host (cổng 8081)
pnpm start:dev

# Terminal 2 - mini app Chấm công (cổng 9001): chạy trong thư mục mini app
cd packages/electro-go-work && pnpm start:module

# Terminal 3 - mini app Bán hàng (cổng 9002), nếu cần
cd packages/electro-go-sale && pnpm start:module

# Terminal 4 - mở app trên máy ảo (build native một lần)
pnpm ios --udid 4DC1F4E3-2A4A-47D5-9E24-7AD54E541D18
pnpm android
```

- `pnpm start:module` và `pnpm build` chạy trong thư mục mini app; script tự nhảy lên thư mục gốc host (package nằm cách host đúng 2 cấp) vì `react-native.config.js` và `node_modules` ở đó.
- Cổng 8081 chỉ một server dùng được: dừng Metro cũ trước khi chạy `pnpm start:dev`.
- Server mini app chưa chạy thì bấm ô sẽ ra màn trắng "Không tải được ..." với hai nút Đóng / Thử lại.
- Đổi `rspack.config.mjs` hoặc thêm thư viện native: khởi động lại server (và build lại app nếu là thư viện native).
- Lỗi build hoặc máy ảo: xem skill `run-ios`.

### Phần E. Triển khai production (khi cần)

Cách đang dùng: **web phân phối** (upload file .tar, tích LIVE, host hỏi web bản LIVE). Từng bước, build host và bảng lỗi nằm ở skill `release-deploy`. Ba bước thủ công dưới đây chỉ dùng khi không có web: đặt cứng địa chỉ bằng `WORK_REMOTE_URL`.

1. Trong thư mục mini app: `pnpm build` -> `build/<tên>-<version>.tar`, chứa bundle iOS + Android (`mf-manifest.json`, `<tên>.container.js.bundle`, chunk, assets). `pnpm build:src` ra tar mã nguồn.
2. Giải nén và đưa từng thư mục `ios/`, `android/` lên nơi lưu trữ (CDN).
3. Khi build host, đặt `WORK_REMOTE_URL`, `SALE_REMOTE_URL` trỏ tới nơi đó (không gồm `/mf-manifest.json`, nhưng gồm phần `/<platform>`).

```
+-----------------+--------------------------------------+-------------------------------------------------+
|                 | Dev                                  | Production                                      |
+=================+======================================+=================================================+
| Địa chỉ remote  | localhost:<cổng> (Android: 10.0.2.2) | WORK_REMOTE_URL, SALE_REMOTE_URL                |
+-----------------+--------------------------------------+-------------------------------------------------+
| Nguồn file      | Server pnpm start:module             | Nơi đưa file trong build/*.tar lên              |
+-----------------+--------------------------------------+-------------------------------------------------+
| Sửa mã mini app | Lưu, rồi mở lại ô hoặc bấm Thử lại   | Build và đưa bản mới lên, không phải phát hành  |
|                 |                                      | lại app host                                    |
+-----------------+--------------------------------------+-------------------------------------------------+
```

## Luồng chạy từ host sang mini app

**Giai đoạn 1: lúc khởi động (chưa bấm gì)**

```
pnpm start:dev (Re.Pack :8081)           pnpm start:module (Re.Pack :9001, mini app work)
   build bundle HOST                        build bundle mini app khi có yêu cầu
        │
        ▼
App trên máy ảo tải index.bundle từ :8081
```
Bundle host chỉ chứa **địa chỉ** của mini app (`work -> http://localhost:9001/ios/mf-manifest.json`), chưa chứa mã của nó, và khai báo `react`, `react-native`, `react-native-safe-area-context` là thư viện dùng chung (singleton).

**Giai đoạn 2: lúc bấm ô trên Home**

```
HomeScreen            bấm ô, key = 'work'
   │
RootNavigator
   └─ MiniAppHost     hiện MiniAppLoading (vòng xoay thường, không logo, tối thiểu 0,9 giây)
        │
   loadMiniApp('work')                         [src/app/remotes.ts]
        │ 1. ensureReachable: fetch mf-manifest.json (tối đa 4 giây)
        │      lỗi -> MiniAppErrorView (màn trắng, nút Đóng / Thử lại)
        │ 2. import('work/App')  <- Module Federation chạy từ đây
        ▼
Runtime Module Federation (nằm trong bundle host)
   3. đọc mf-manifest.json từ :9001 -> biết Remote Entry là work.container.js.bundle
   4. tải work.container.js.bundle (qua ScriptManager của Re.Pack, module native)
      -> mini app đăng ký mình là container "work"
   5. "bắt tay" thư viện: host đưa react / react-native của nó cho mini app dùng
   6. container.get('./App') -> tải chunk __federation_expose_App
      (WorkApp, MiniNavigator, màn hình, Ionicons...)
   7. trả về module, default export = WorkApp
        │
loadMiniApp resolve -> state = ready
   └─ <state.Component /> = WorkApp      <- từ đây là mã của mini app
```

Bản build phát hành có `DEPLOY_API_URL` (xem `release-deploy`): bước 1 và 2 ở trên được thay bằng `resolveManifestUrl` (`src/app/deploy.ts`) hỏi web bản LIVE, rồi `registerRemotes` + `loadRemote` (`src/app/remotes.ts`) nạp địa chỉ manifest mà web trả về. Các bước 3 đến 7 giữ nguyên. Không có `DEPLOY_API_URL` (dev) thì dùng đường cũ ở trên.

Sau khi vào mini app: `WorkApp -> MiniNavigator -> màn hình`. Mini app chạy **cùng app, cùng JS runtime, cùng bản React** với host, nên vẽ trực tiếp lên màn hình (không phải app khác chạy song song).

### Manifest và Remote Entry

Hai file do Re.Pack **tự sinh lúc build**, không viết tay:

```
+--------------------------+---------------------------------------+---------------------------------------+
|                          | Là gì                                 | Tên trong dự án                       |
+==========================+=======================================+=======================================+
| Manifest                 | JSON mô tả mini app: tên, expose gì,  | mf-manifest.json                      |
|                          | chunk nào, thư viện dùng chung        |                                       |
+--------------------------+---------------------------------------+---------------------------------------+
| Remote Entry (container) | File JS cổng vào để host nạp mini app | work.container.js.bundle,             |
|                          |                                       | sale.container.js.bundle              |
+--------------------------+---------------------------------------+---------------------------------------+
```

Host chỉ cần biết **địa chỉ manifest**; manifest trỏ tiếp tới Remote Entry và chunk. Xem thử khi server đang chạy: `curl localhost:9001/ios/mf-manifest.json`.

### Phân chia trách nhiệm

```
+----------------------------------------------------+-----------------------------------------------------+
| Việc                                               | Ai lo                                               |
+====================================================+=====================================================+
| Loading, lỗi kết nối, Đóng / Thử lại, nút "‹ Trang | Host (MiniAppHost)                                  |
| chủ"                                               |                                                     |
+----------------------------------------------------+-----------------------------------------------------+
| Crash khi mini app đang chạy                       | MiniAppErrorBoundary của host (hiện lại             |
|                                                    | MiniAppErrorView)                                   |
+----------------------------------------------------+-----------------------------------------------------+
| Header riêng, điều hướng nội bộ, loading/lỗi của   | Mini app (MiniNavigator, StateView)                 |
| dữ liệu (API)                                      |                                                     |
+----------------------------------------------------+-----------------------------------------------------+
```

Ba component trong `src/shared/components/` của host: `MiniAppLoading` (đang tải), `MiniAppErrorView` (lỗi tải), `MiniAppErrorBoundary` (bọc ngoài màn thành công, chỉ hoạt động khi mini app crash). Màn thành công chính là `<state.Component />`, không nằm trong `shared/components`.

**Không dùng `lazy`/`Suspense`** để nạp mini app: lỗi tải sẽ bị ném lúc render và bật màn đỏ LogBox ở dev. `MiniAppHost` tự quản lý trạng thái bằng Promise.

## Quy tắc bắt buộc (vi phạm là lỗi)

- `react`, `react-native`, `react-native-safe-area-context` là **singleton**: host `eager: true`, remote `import: false`.
- Mọi `rspack.config.mjs` (host và mini app) dùng `Repack.getResolveOptions({enablePackageExports: true})`; thiếu thì Module Federation báo `Module not found` ở các subpath như `@module-federation/runtime/helpers`.
- Container của remote có `filename` riêng, khác `index.bundle`.
- `__REMOTE_MANIFESTS__` do `DefinePlugin` chèn lúc build. Sửa `rspack.config.mjs` thì **phải khởi động lại** `pnpm start:dev`; không có biến này thì bước kiểm tra kết nối tự bỏ qua.
- Mini app **không** có `android/`, `ios/`; **không** import mã của host hoặc của mini app khác. Code dùng chung đặt ở package `shared` (chưa có; hiện mỗi mini app giữ một bản `shared/theme.ts`).
- Thư viện **native** chỉ cài ở host (cần `pod install` và build lại app); mini app ghi `peerDependencies` `"*"`.
- `__DEPLOY_CONFIG__` (`apiUrl`, `appId`, `env`) do `DefinePlugin` chèn từ `DEPLOY_API_URL`, `DEPLOY_APP_ID`, `DEPLOY_ENV`. Bản Release phải có địa chỉ này (script build tự tìm và nhúng), thiếu thì điện thoại thật nạp từ địa chỉ cố định của dev (`10.0.2.2:9001`) và báo không kết nối được.
- iOS: `ios/.xcode.env` phải giữ dòng `export CLI_PATH=...react-native/cli.js`. Thiếu thì Xcode Archive đóng gói JS bằng Metro và lỗi `Unable to resolve module work/App`.
- Android Release chặn `http://`. Cờ `usesCleartextTraffic` đặt bằng Variant API trong `android/app/build.gradle` (biến `ELECTROGO_ALLOW_CLEARTEXT`); đặt trong `buildTypes` sẽ bị plugin React Native ghi đè.

```
+----------------------------------------------------+-----------------------------------------------------+
| Loại dependency                                    | Cài ở đâu                                           |
+====================================================+=====================================================+
| Native, hoặc dùng chung nhiều app                  | Host (dependencies), mini app ghi peerDependencies  |
|                                                    | ("*")                                               |
+----------------------------------------------------+-----------------------------------------------------+
| JS thuần, chỉ một mini app dùng                    | package.json của mini app đó                        |
+----------------------------------------------------+-----------------------------------------------------+
| Công cụ build/dev (Re.Pack, Rspack, eslint, jest,  | Root host, cài một lần (node-linker=hoisted để      |
| typescript)                                        | package ở packages/ tìm được)                       |
+----------------------------------------------------+-----------------------------------------------------+
```

## Trang chủ host: nhiều module, mở thẳng màn hình đích

Trang chủ liệt kê **từng chức năng** của các mini app (8 icon: Chấm công, Lịch làm việc, Nghỉ phép, Phiếu lương, Đơn hàng, Sản phẩm, Khách hàng, Báo cáo). Bấm một icon thì host nạp mini app tương ứng rồi **mở thẳng đúng màn hình đó**.

- `src/features/home/data/miniApps.ts`: mỗi dòng là một icon, gồm `key` (duy nhất), `app` (`work`/`sale`), `screen` (màn hình mở thẳng), `label`, `icon` (Ionicons).
- Host truyền `screen` vào mini app qua prop `initialRoute` (`<state.Component initialRoute={item.screen} />`, kiểu `MiniAppProps` trong `src/app/remotes.ts`).
- Mini app nhận prop ở `app/<Tên>App.tsx` và `MiniNavigator.resolveInitialRoute`: `initialRoute` khớp một `ModuleKey` (`features/hub/data/modules.ts`) thì vào thẳng route đó, không khớp hoặc rỗng thì vào hub. Nên `screen` ở host **phải trùng `ModuleKey`** của mini app.
- Khi mở thẳng, ngăn xếp màn hình mini app chỉ có một màn, nên không có nút quay lại bên trong; thoát bằng "‹ Trang chủ" của host.

Thêm một chức năng mới lên Trang chủ: làm xong feature trong mini app (xem bên dưới), rồi thêm **một dòng** vào `MINI_APPS` của host với `screen` đúng bằng khóa module mới.

## Màn hình trung tâm (hub) và các chức năng của mini app

Mỗi mini app mở vào **một màn hình trung tâm** `features/hub`: thẻ chào (`HubHero`) và lưới icon 4 cột (`FeatureGrid`, cùng ngôn ngữ thiết kế với Home của host, nền ô icon dùng `colors.iconTile`). Mỗi icon mở một chức năng, mỗi chức năng là một feature độc lập có giao diện riêng:

```
+-----------------------------+----------------------------------------------------------------------------+
| Mini app                    | Chức năng (feature)                                                        |
+=============================+============================================================================+
| Chấm công (electro-go-work) | attendance (chấm công, lịch sử), schedule (lịch làm việc: dải 7 ngày + thẻ |
|                             | ca), leave (nghỉ phép: số dư + đơn kèm nhãn trạng thái), payslip (phiếu    |
|                             | lương: chọn tháng, thực nhận, khoản cộng/trừ)                              |
+-----------------------------+----------------------------------------------------------------------------+
| Bán hàng (electro-go-sale)  | sales (đơn hàng, chi tiết đơn), products (tìm kiếm, lưới sản phẩm, nhãn    |
|                             | tồn kho), customers (danh sách khách, hạng Vàng/Bạc/Thường), report (KPI,  |
|                             | biểu đồ cột vẽ bằng View, top bán chạy)                                    |
+-----------------------------+----------------------------------------------------------------------------+
```

Thêm một chức năng mới vào mini app:
1. Tạo `src/features/<tên>/` đủ khung (types, data, services, hooks, screens, components, index.ts); luồng dữ liệu screen -> hook (`useAsync`) -> service -> mock/http.
2. Thêm khóa vào `ModuleKey` (`features/hub/types.ts`) và một dòng vào `MODULES` (`features/hub/data/modules.ts`, chọn icon Ionicons).
3. Trong `app/navigation/MiniNavigator.tsx`: thêm vào `Route`, `TITLES` và nhánh `renderScreen`. Tên route trùng `ModuleKey` để hub gọi `push({name: key})`.
4. Muốn hiện cả trên Trang chủ host: thêm một dòng vào `src/features/home/data/miniApps.ts` của host (`screen` = khóa module).
5. Dùng lại component trong `shared/components/` (`Chip`, `StateView`, `HubHero`, `FeatureGrid`) và màu từ `shared/theme.ts`.

## Chuẩn cấu trúc source của host (feature-based)

Code host nằm trong `src/`, chia theo **tính năng** thay vì theo loại file. Mỗi feature tự chứa màn hình, component, dữ liệu và kiểu của nó.

```
App.tsx                         chỉ gắn provider (SafeAreaProvider), không chứa giao diện
src/
├── app/                        RootNavigator.tsx (điều hướng gốc, MiniAppHost), remotes.ts
├── types/                      remotes.d.ts
├── features/
│   └── home/                   một feature
│       ├── index.ts            cổng xuất khẩu công khai: bên ngoài chỉ import từ đây
│       ├── types.ts            kiểu dữ liệu của feature
│       ├── screens/            màn hình (HomeScreen)
│       ├── components/         component riêng của feature
│       └── data/               dữ liệu cấu hình/mẫu (miniApps.ts, currentUser.ts)
└── shared/
    ├── theme/                  design tokens: màu, spacing, bo góc, typography, đổ bóng
    └── components/             component dùng lại (Avatar, IconButton, MiniApp*...)
```

Quy ước:
- Feature mới tạo `src/features/<tên>/` với cùng khung trên (ví dụ `auth`, `notifications`).
- Feature **không import ruột của feature khác**, chỉ import qua `index.ts` của feature đó.
- Component dùng ở từ hai feature trở lên chuyển sang `src/shared/components/`.
- Không gõ màu/số trực tiếp trong component; lấy từ `src/shared/theme`.

## Chuẩn cấu trúc của một mini app

Mỗi mini app dùng đúng một khung. Chi tiết nằm trong `README.md` của từng repo.

```
src/
├── index.tsx              export default component gốc + export manifest (host chỉ nạp từ đây)
├── manifest.ts            hồ sơ: id, name, icon, version
├── app/
│   ├── <Tên>App.tsx       ErrorBoundary + MiniNavigator
│   └── navigation/MiniNavigator.tsx   ngăn xếp màn hình nội bộ (Route, TITLES)
├── features/<feature>/    screens/ components/ hooks/ services/ data/ types.ts index.ts
├── services/api/          httpClient.ts (timeout, ApiError), ApiError.ts
├── config/env.ts          apiBaseUrl, timeoutMs, useMock
├── assets/                images/ (khai báo ở images/index.ts), icons.ts (tên icon Ionicons)
└── shared/                theme.ts, components/ (ScreenHeader, StateView, ErrorBoundary),
                           hooks/useAsync.ts, navigation/useStack.ts, utils/
```

Quy ước bắt buộc:
- **Luồng dữ liệu một chiều:** screen -> hook -> service -> (mock | http). Màn hình không gọi `http` trực tiếp; service là nơi duy nhất biết dữ liệu từ mock hay API (chuyển bằng `config.useMock`).
- Điều hướng nội bộ dùng `useStack` (không cần thư viện). Thêm màn: thêm vào `Route` và `TITLES` trong `MiniNavigator.tsx`. Nút Back Android tự quay về màn trước.
- Mỗi feature có `index.ts` là cổng công khai; feature chỉ import feature khác qua cổng này. Code dùng từ hai feature trở lên chuyển vào `shared/`.
- Không gõ màu/số trong component (lấy từ `shared/theme.ts`), không `require` ảnh trực tiếp (dùng `assets/images`), không gõ tên icon rải rác (dùng `assets/icons.ts`).
- Màn hình xử lý đủ 3 trạng thái dữ liệu qua `useAsync` + `StateView`: đang tải, lỗi (có Thử lại), sẵn sàng.
- `shared/theme.ts` là bản sao theme của host; đổi theme ở host thì phải đổi cả các mini app (hoặc tách package `shared` chung).
- Icon dùng `@react-native-vector-icons/ionicons/static`; khai báo ở `peerDependencies`.

## Khi nào chọn hướng khác

```
+----------------------------------------------------+-----------------------------------------------------+
| Nhu cầu                                            | Giải pháp                                           |
+====================================================+=====================================================+
| Các app con do nhóm khác nhau làm, phát hành độc   | Đang dùng: Re.Pack + Module Federation, mỗi mini    |
| lập                                                | app một repo                                        |
+----------------------------------------------------+-----------------------------------------------------+
| Chỉ cần gộp mã, không cần nạp động                 | Monorepo import trực tiếp (workspace:*) và Metro;   |
|                                                    | đơn giản hơn nhưng phải phát hành cùng host         |
+----------------------------------------------------+-----------------------------------------------------+
```

## Câu hỏi còn mở (cần chủ project xác nhận)

1. Nơi triển khai bundle mini app production. Hiện dùng web phân phối chạy trên máy cá nhân trong mạng LAN (http, cổng 8080). Còn mở: máy chủ có địa chỉ cố định và https cho bản phát hành thật.
2. Có dùng chung đăng nhập và API giữa các app không? Nếu có thì tách thêm package `shared`.
3. Có cần ký bundle (code signing của Re.Pack) khi triển khai production không?
4. Web phân phối chưa có đăng nhập: ai vào được cũng upload bundle và đặt LIVE được, mà bundle chạy thẳng trong app của người dùng. Cần xác thực trước khi dùng thật.

## Ghi chú cho người sửa file này

Đọc trước README.md, mục "Quy ước khi sửa tài liệu skill". Riêng file này:

- Tên phải khớp xuyên suốt: name trong rspack.config.mjs của mini app = khóa trong REMOTES của host = '<tên>/App' trong remotes.d.ts = khóa MiniAppKey.
- Mọi số cổng (8081, 9001, 9002) và tên container phải đối chiếu rspack.config.mjs của host và của mini app.
- Thêm bước setup thì đặt đúng phần A-E và có dòng "Xong khi".
- Cách phát hành (web phân phối, build apk/aab/ipa) chỉ ghi ở skill `release-deploy`; ở đây chỉ trỏ tới. Đổi `src/app/deploy.ts` hoặc `remotes.ts` thì sửa đoạn "Bản build phát hành" ở mục Luồng chạy.
- Cây thư mục phải khớp thực tế (dùng ls). packages/shared chưa có thì không vẽ vào.
