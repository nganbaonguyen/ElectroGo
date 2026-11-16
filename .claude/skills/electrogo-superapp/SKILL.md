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
Metro sẽ:
1. Theo dõi file trong phạm vi watchFolders.
2. Phát hiện file thay đổi khi đang chạy Metro ở chế độ watch.
3. Cập nhật dependency graph.
4. Bundle lại phần code cần thiết.
5. Gửi cập nhật đến ứng dụng thông qua Fast Refresh nếu có thể.

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

### Manifest và Remote Entry

Hai file do Re.Pack **tự sinh lúc build**, không viết tay:

| | Là gì | Tên trong dự án |
|---|---|---|
| Manifest | JSON mô tả mini app: tên, expose gì, chunk nào, thư viện dùng chung | `mf-manifest.json` |
| Remote Entry (container) | File JS cổng vào để host nạp mini app | `work.container.js.bundle`, `sale.container.js.bundle` |

Host chỉ cần biết **địa chỉ manifest** (`REMOTES` trong `rspack.config.mjs` của host); manifest trỏ tiếp tới Remote Entry và chunk. Phía mini app: `name` (tên remote), `filename` (tên Remote Entry), `exposes: {'./App': './src/index.tsx'}` trong `rspack.config.mjs` của package. Xem thử khi server đang chạy: `curl localhost:9001/ios/mf-manifest.json` (có `remoteEntry` và `exposes`).

### Luồng chạy từ host sang mini app

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

Sau khi vào mini app: `WorkApp -> MiniNavigator -> AttendanceScreen`. Mini app chạy **cùng app, cùng JS runtime, cùng bản React** với host, nên vẽ trực tiếp lên màn hình (không phải app khác chạy song song).

Phân chia trách nhiệm:

| Việc | Ai lo |
|---|---|
| Loading, lỗi kết nối, Đóng / Thử lại, nút "‹ Trang chủ" | Host (`MiniAppHost`) |
| Crash khi mini app đang chạy | `MiniAppErrorBoundary` của host (hiện lại `MiniAppErrorView`) |
| Header riêng, điều hướng nội bộ, loading/lỗi của **dữ liệu** (API) | Mini app (`MiniNavigator`, `StateView`) |

Phân biệt ba component trong `src/shared/components/` của host: `MiniAppLoading` (đang tải), `MiniAppErrorView` (lỗi tải), `MiniAppErrorBoundary` (bọc ngoài màn thành công, chỉ hoạt động khi mini app crash). **Màn thành công chính là `<state.Component />`**, không nằm trong `shared/components`.

**Dev và production**

| | Dev | Production |
|---|---|---|
| Địa chỉ remote | `localhost:9001` (Android: `10.0.2.2`) | `WORK_REMOTE_URL` |
| Nguồn file | Server `pnpm start:module` | Nơi đưa file trong `build/*.tar` lên |
| Sửa mã mini app | Lưu, rồi mở lại ô hoặc bấm Thử lại | Build và đưa bản mới lên, không phải phát hành lại app host |

Điểm mạnh: sau khi host đã lên store, cập nhật mini app chỉ cần thay file ở địa chỉ remote.

Thêm mini app mới: thêm vào `REMOTES` (host), `src/types/remotes.d.ts`, `src/app/remotes.ts`, khóa trong `MiniAppKey` và dòng trong `data/miniApps.ts` của feature home, rồi dựng package theo skill `add-mini-app`.

### Trang chủ host hiển thị nhiều module, mở thẳng màn hình đích

Trang chủ của host liệt kê **từng chức năng** của các mini app (8 icon: Chấm công, Lịch làm việc, Nghỉ phép, Phiếu lương, Đơn hàng, Sản phẩm, Khách hàng, Báo cáo), không chỉ một icon cho mỗi mini app. Bấm một icon thì host nạp mini app tương ứng rồi **mở thẳng đúng màn hình đó**.

- `src/features/home/data/miniApps.ts`: mỗi dòng là một icon, gồm `key` (duy nhất), `app` (mini app chứa module: `work`/`sale`), `screen` (màn hình mở thẳng), `label`, `icon` (Ionicons).
- Host truyền `screen` vào mini app qua prop `initialRoute` (`<state.Component initialRoute={item.screen} />`, kiểu `MiniAppProps` trong `src/app/remotes.ts`).
- Mini app nhận prop ở `app/<Tên>App.tsx` và `MiniNavigator.resolveInitialRoute`: `initialRoute` khớp một `ModuleKey` (`features/hub/data/modules.ts`) thì vào thẳng route đó, không khớp hoặc rỗng thì vào hub. Nên `screen` ở host **phải trùng `ModuleKey`** của mini app.
- Khi mở thẳng, ngăn xếp màn hình của mini app chỉ có một màn, nên không có nút quay lại bên trong mini app; thoát bằng "‹ Trang chủ" của host. Màn loading hiển thị tên module (ví dụ "Đang tải Phiếu lương...").
- Mini app cũ chưa có `initialRoute` vẫn chạy (prop bị bỏ qua, mở hub).

Thêm một chức năng mới lên Trang chủ: làm xong feature trong mini app (xem bước bên dưới), rồi thêm **một dòng** vào `MINI_APPS` của host với `screen` đúng bằng khóa module mới.

### Màn hình trung tâm (hub) và các chức năng của mini app

Mỗi mini app mở vào **một màn hình trung tâm** `features/hub`: thẻ chào (`HubHero`) và lưới icon 4 cột (`FeatureGrid`, cùng ngôn ngữ thiết kế với Home của host, nền ô icon dùng chung `colors.iconTile`). Mỗi icon mở một chức năng, và mỗi chức năng là một feature độc lập có **giao diện riêng**:

| Mini app | Chức năng (feature) |
|---|---|
| Chấm công (`electro-go-work`) | `attendance` (chấm công, lịch sử), `schedule` (lịch làm việc: dải 7 ngày + thẻ ca), `leave` (nghỉ phép: số dư + đơn kèm nhãn trạng thái), `payslip` (phiếu lương: chọn tháng, thực nhận, khoản cộng/trừ) |
| Bán hàng (`electro-go-sale`) | `sales` (đơn hàng, chi tiết đơn), `products` (tìm kiếm, lưới sản phẩm, nhãn tồn kho), `customers` (danh sách khách, hạng Vàng/Bạc/Thường), `report` (KPI, biểu đồ cột vẽ bằng View, top bán chạy) |

Thêm một chức năng mới vào mini app:
1. Tạo `src/features/<tên>/` đủ khung (types, data, services, hooks, screens, components, index.ts); luồng dữ liệu screen -> hook (`useAsync`) -> service -> mock/http.
2. Thêm khóa vào `ModuleKey` (`features/hub/types.ts`) và một dòng vào `MODULES` (`features/hub/data/modules.ts`, chọn icon Ionicons).
3. Trong `app/navigation/MiniNavigator.tsx`: thêm vào `Route`, `TITLES` và nhánh `renderScreen`. Tên route trùng `ModuleKey` để hub gọi `push({name: key})`.
4. Muốn module này hiện cả trên Trang chủ host: thêm một dòng vào `src/features/home/data/miniApps.ts` của host (`screen` = khóa module).
5. Dùng lại component dùng chung trong `shared/components/` (`Chip` cho nhãn trạng thái, `StateView` cho loading/lỗi, `HubHero`, `FeatureGrid`) và màu từ `shared/theme.ts`.

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
