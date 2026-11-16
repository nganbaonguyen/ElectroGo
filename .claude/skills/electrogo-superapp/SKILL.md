---
name: electrogo-superapp
description: Kiến trúc super app ElectroGo (host + 2 mini app electro-go-work, electro-go-sale) dạng pnpm monorepo. Dùng khi thêm/sửa mini app, cấu hình workspace, Metro, hoặc quyết định đặt code ở đâu.
---

# ElectroGo Super App

> **Tóm tắt**
> - **Skill này là gì:** tài liệu kiến trúc tổng thể của super app.
> - **Đọc khi:** cần biết code đặt ở đâu, dependency cài ở đâu, cấu hình Metro thế nào.
> - **Skill liên quan:** `add-mini-app` (thêm app), `sync-submodules` (đồng bộ), `run-ios` (chạy app).

App `ElectroGo` (thư mục gốc) là **host / super app**. Hai app con là package JS/TS nằm trong `packages/`, host import vào để render. Code native (`android/`, `ios/`) chỉ có ở host.

## Cấu trúc

```
ElectroGo/                      (root = host, giữ nguyên app main)
├── pnpm-workspace.yaml
├── package.json
├── metro.config.js             (watchFolders trỏ tới packages/)
├── .npmrc                      (node-linker=hoisted)
├── android/  ios/  App.tsx     (host, chứa code native duy nhất)
└── packages/
    ├── electro-go-work/        (mini app, chỉ code JS/TS)
    │   ├── package.json        name: "@electrogo/work"
    │   └── src/index.tsx       export default WorkApp
    ├── electro-go-sale/
    │   ├── package.json        name: "@electrogo/sale"
    │   └── src/index.tsx       export default SaleApp
    └── shared/                 (tùy chọn: UI kit, auth, API client)
```

## Host nạp mini app như thế nào (quan trọng)

**Kiến trúc: Re.Pack (Rspack) + Module Federation v2.** Mini app là **remote** chạy server riêng; host chỉ biết địa chỉ và nạp **động lúc chạy** khi người dùng bấm ô trên Home. Host **không** import mã nguồn mini app và không phụ thuộc `@electrogo/*`. Dự án không còn dùng Metro để chạy (giữ `metro.config.js` mặc định).

| # | Việc | Ở đâu |
|---|---|---|
| 1 | Khai báo địa chỉ remote (dev: `http://localhost:<cổng>/<platform>/mf-manifest.json`; Android emulator dùng `10.0.2.2`) | `rspack.config.mjs` của host, biến `REMOTES` (work 9001, sale 9002). Production: đặt `WORK_REMOTE_URL`, `SALE_REMOTE_URL` |
| 2 | Khai báo kiểu cho module nạp động | `src/types/remotes.d.ts` (`declare module 'work/App'`) |
| 3 | Bảng nạp động + kiểm tra kết nối trước khi nạp | `src/app/remotes.ts`: `LOADERS` (`ensureReachable` rồi `import('work/App')`), hàm `loadMiniApp(key)` trả `Promise<ComponentType>` |
| 4 | Hiển thị lúc bấm ô | `src/app/RootNavigator.tsx`, `MiniAppHost`: tự quản lý trạng thái loading (vòng xoay thường) -> ready (mini app, bọc `MiniAppErrorBoundary`) hoặc error (`MiniAppErrorView` trắng: nút Thử lại / Đóng). **Không dùng `lazy`/`Suspense`** để lỗi tải không bị ném lúc render (sẽ bật màn đỏ LogBox ở dev) |
| 5 | Phía mini app: expose component gốc | `rspack.config.mjs` của package: `exposes: {'./App': './src/index.tsx'}`, `name` trùng tên remote, `filename: '<tên>.container.js.bundle'` |

Quy tắc bắt buộc:
- `react`, `react-native`, `react-native-safe-area-context` là **singleton**: host khai báo `eager: true`, remote khai báo `import: false` (luôn dùng bản của host, không đóng gói bản dự phòng).
- `__REMOTE_MANIFESTS__` (địa chỉ manifest) do `DefinePlugin` trong `rspack.config.mjs` chèn lúc build. Sửa `rspack.config.mjs` thì **phải khởi động lại** `pnpm start:dev`; không có biến này thì bước kiểm tra kết nối tự bỏ qua.
- Cổng 8081 chỉ được một server: dừng Metro cũ trước khi chạy `pnpm start:dev`.
- Mọi `rspack.config.mjs` phải dùng `Repack.getResolveOptions({enablePackageExports: true})`; thiếu thì Module Federation báo `Module not found` ở các subpath như `@module-federation/runtime/helpers`.
- Container của remote phải có `filename` riêng, khác `index.bundle`, nếu không báo `Multiple assets emit different content to the same filename`.
- Thư viện **native** mới chỉ cài ở host (cần `pod install` và build lại app). Thư viện JS thuần chỉ một mini app dùng thì mini app tự đóng gói.
- `react-native.config.js` của host chứa lệnh Re.Pack: `react-native start` và `react-native bundle` chạy Rspack.

Luồng chạy khi người dùng bấm một ô trên Home:

```
Bấm ô (HomeScreen, key = 'work')
  -> RootNavigator: MiniAppHost (hiện MiniAppLoading: vòng xoay thường, không logo)
  -> loadMiniApp('work'): ensureReachable (thử gọi mf-manifest.json, tối đa 4 giây) rồi import('work/App')
  -> runtime Module Federation đọc http://localhost:9001/<platform>/mf-manifest.json
  -> tải work.container.js.bundle và chunk __federation_expose_App
  -> packages/electro-go-work/src/index.tsx (export default WorkApp) hiển thị
```

Thêm mini app mới: thêm vào `REMOTES` (host), `src/types/remotes.d.ts`, `src/app/remotes.ts`, khóa trong `MiniAppKey` và dòng trong `data/miniApps.ts` của feature home, rồi dựng package theo skill `add-mini-app`.

## Cấu trúc source của host (feature-based)

Code host nằm trong `src/`, chia theo **tính năng** thay vì theo loại file. Mỗi feature tự chứa màn hình, component, dữ liệu và kiểu của nó.

```
App.tsx                         chỉ gắn provider (SafeAreaProvider), không chứa giao diện
src/
├── app/
│   └── RootNavigator.tsx       điều hướng gốc + bảng đăng ký mini app (khóa -> component)
├── features/
│   └── home/                   một feature
│       ├── index.ts            cổng xuất khẩu công khai: bên ngoài chỉ import từ đây
│       ├── types.ts            kiểu dữ liệu của feature
│       ├── screens/            màn hình (HomeScreen)
│       ├── components/         component riêng của feature (HomeHeader, MiniAppGrid, MiniAppTile)
│       └── data/               dữ liệu cấu hình/mẫu (miniApps.ts, currentUser.ts)
└── shared/                     dùng chung nhiều feature
    ├── theme/                  design tokens: màu, spacing, bo góc, typography, đổ bóng
    └── components/             component dùng lại (Avatar, IconButton)
```

Quy ước:
- Feature mới tạo `src/features/<tên>/` với cùng khung trên (ví dụ `auth`, `notifications`).
- Feature **không import ruột của feature khác**, chỉ import qua `index.ts` của feature đó.
- Component dùng ở từ hai feature trở lên thì chuyển sang `src/shared/components/`.
- Không gõ màu/số trực tiếp trong component; lấy từ `src/shared/theme`.
- Thêm mini app lên Home: thêm khóa vào `MiniAppKey` (`types.ts`), một dòng vào `data/miniApps.ts`, và đăng ký component trong `RootNavigator.tsx`.

## Chuẩn cấu trúc của một mini app

Mỗi mini app (`electro-go-work`, `electro-go-sale`) dùng đúng một khung. Chi tiết nằm trong `README.md` của từng repo; mini app mới phải theo khung này (xem skill `add-mini-app`).

```
src/
├── index.tsx              export default component gốc + export manifest (host chỉ import từ đây)
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
- Mini app là repo riêng nên **không import từ host**. `shared/theme.ts` là bản sao theme của host; nếu đổi theme ở host phải đổi cả hai mini app (hoặc tách package `shared` chung).
- Icon dùng `@react-native-vector-icons/ionicons/static`; khai báo ở `peerDependencies` của package.

## Quy tắc

- Mỗi mini app **expose một component gốc** (`./App`, kèm navigator riêng). Host nạp động, không import mã nguồn.
- Thư viện **native** (navigation, reanimated, safe-area, vector-icons, ...) chỉ cài ở **host**. Mini app khai báo ở `peerDependencies` (`"*"`) và đưa vào `shared` nếu là singleton bắt buộc (react, react-native, safe-area-context).
- Dependency:

  | Loại dependency | Cài ở đâu |
  |---|---|
  | Native, hoặc dùng chung nhiều app | Host (`dependencies`), mini app ghi `peerDependencies` (`"*"`) |
  | JS thuần, chỉ một mini app dùng | `package.json` của mini app đó |
  | Công cụ build/dev (Re.Pack, Rspack, eslint, jest, typescript) | Root host, cài một lần (`node-linker=hoisted` để package ở `packages/` và `sub/` tìm được) |

- Mini app **không** chứa thư mục `android/` hay `ios/`; nó mượn app native của host.
- Mini app **không** import mã của host hoặc của mini app khác. Code dùng chung đặt ở package `shared` (chưa có; hiện mỗi mini app giữ một bản `shared/theme.ts`).
- Màn hình Home của host là lưới các mini app; bấm vào thì nạp mini app tương ứng (xem mục "Host nạp mini app như thế nào").

## Các bước thiết lập (đã làm, ghi lại để dựng lại)

1. Host: `pnpm add -D @callstack/repack@5.4.3 '@rspack/core@^1.6.0' @swc/helpers` và `pnpm add @module-federation/enhanced@2.9.3` (Re.Pack tương thích Rspack 1.x; không dùng Rspack 2.x).
2. Host: tạo `react-native.config.js` (`commands: require('@callstack/repack/commands')`) và `rspack.config.mjs` (`ModuleFederationPluginV2` với `remotes`).
3. Host: scripts `start` và `start:dev` = `react-native start`. Chạy `cd ios && pod install` (thêm module native `callstack-repack`), rồi build lại app.
4. Mỗi mini app: `rspack.config.mjs` (remote: `exposes`, `filename`, `shared`), `dev/Harness.tsx` + `dev/index.js` (entry khi chạy riêng), scripts `start:module`, `build`.
5. `.npmrc`: `node-linker=hoisted`.

## Chạy app (2 terminal)

Mini app nạp động nên **phải chạy server của từng mini app** song song với host:

```bash
# Terminal 1 - host
pnpm start:dev                       # server Re.Pack cổng 8081

# Terminal 2 - mini app Chấm công
cd packages/electro-go-work && pnpm start:module     # cổng 9001

# Terminal 3 - mini app Bán hàng (nếu cần)
cd packages/electro-go-sale && pnpm start:module     # cổng 9002

# Mở app trên máy ảo (build native một lần)
pnpm ios --udid 4DC1F4E3-2A4A-47D5-9E24-7AD54E541D18
pnpm android
```

Bấm ô trên Home: hiện loading (vòng xoay) rồi vào mini app. Nếu server mini app chưa chạy, màn trắng báo "Không tải được ..." với hai nút: Đóng (về Trang chủ) và Thử lại.

`start:module` chạy được cả từ `packages/` lẫn `sub/` (cùng cách host 2 cấp). `pnpm start:module` và `pnpm build` luôn chạy lệnh từ thư mục gốc host.

Build triển khai mini app: `pnpm build` trong package, ra `build/<tên>-<version>.tar` chứa bundle iOS + Android (`mf-manifest.json`, `<tên>.container.js.bundle`, chunk, assets). Đưa lên nơi `*_REMOTE_URL` của host trỏ tới. `pnpm build:src` ra tar mã nguồn.

Khi đổi `rspack.config.mjs` hoặc thêm thư viện native: khởi động lại server và build lại app. Lỗi Metro cũ (`--reset-cache`, `watchFolders`) không còn áp dụng.

## Khi nào chọn hướng khác

| Nhu cầu | Giải pháp |
|---|---|
| Hai app con do hai nhóm khác nhau làm, phát hành độc lập | Đang dùng: Re.Pack + Module Federation, mỗi mini app một repo |
| Chỉ cần gộp mã, không cần nạp động | Monorepo import trực tiếp (`workspace:*`) và Metro; đơn giản hơn nhưng phải phát hành cùng host |

## Câu hỏi còn mở (cần chủ project xác nhận)

1. Nơi triển khai bundle mini app production (CDN/URL nào) để đặt `WORK_REMOTE_URL`, `SALE_REMOTE_URL`.
2. Có dùng chung đăng nhập và API giữa các app không? Nếu có thì tách thêm package `shared`.
3. Có cần ký bundle (code signing của Re.Pack) khi triển khai production không?
