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

## Quy tắc

- Mỗi mini app export **một component gốc** (kèm navigator riêng). Host chỉ render hoặc đăng ký vào menu:
  ```tsx
  import WorkApp from '@electrogo/work';
  import SaleApp from '@electrogo/sale';
  ```
- Thư viện native (navigation, reanimated, safe-area, ...) chỉ cài ở **host**. Mini app khai báo chúng (và `react`, `react-native`) ở `peerDependencies` để tránh trùng hai bản React.
- Dependency chỉ quản lý chính ở `package.json` của host:

  | Loại dependency | Cài ở đâu |
  |---|---|
  | Native, hoặc dùng chung nhiều app | Host (`dependencies`), sub package ghi `peerDependencies` (`"*"`) |
  | JS thuần, chỉ một mini app dùng | `package.json` của mini app đó |
  | Công cụ dev (eslint, jest, typescript, babel) | Root, cài một lần |

  Sub package không khai báo gì vẫn chạy được với `node-linker=hoisted`, nhưng ESLint/TS có thể báo lỗi import và khó tách độc lập sau này, nên vẫn khai báo `peerDependencies`.
- Mini app **không** chứa thư mục `android/` hay `ios/`.
- Code dùng chung (auth, API client, UI kit) đặt ở `packages/shared`, đừng copy giữa hai app.
- Màn hình Home của host là lưới các mini app; bấm vào thì điều hướng sang `WorkApp` hoặc `SaleApp`.

## Các bước thiết lập

1. Tạo `pnpm-workspace.yaml` ở root:
   ```yaml
   packages:
     - 'packages/*'
   ```
2. Tạo hai thư mục package, mỗi cái có `package.json` riêng (`"main": "src/index.tsx"`, `react` và `react-native` ở `peerDependencies`).
3. Ở root, thêm dependency nội bộ:
   ```bash
   pnpm add @electrogo/work@workspace:* @electrogo/sale@workspace:*
   ```
4. `metro.config.js`: thêm `watchFolders` trỏ tới `packages/` để Metro thấy code mini app.
5. `.npmrc`: thêm `node-linker=hoisted` (Metro hay lỗi với symlink mặc định của pnpm). Sau đó xóa `node_modules` và chạy lại `pnpm install`.

## metro.config.js dùng làm gì

`metro.config.js` là file cấu hình của Metro (bundler của React Native). Metro gom code JS/TS thành bundle gửi cho app. Mặc định Metro chỉ nhìn thấy file trong thư mục project gốc, nên cần báo thêm `packages/`:

1. `watchFolders`: theo dõi thêm `packages/`, để sửa code mini app thì Fast Refresh vẫn cập nhật.
2. `resolver.nodeModulesPaths`: chỉ tìm thư viện ở `node_modules` của root, tránh lỗi trùng hai bản React.

```js
const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const root = __dirname;

const config = {
  watchFolders: [path.resolve(root, 'packages')],
  resolver: {
    nodeModulesPaths: [path.resolve(root, 'node_modules')],
  },
};

module.exports = mergeConfig(getDefaultConfig(root), config);
```

File này đã có sẵn từ template React Native, chỉ cần thêm hai mục trên. Thiếu cấu hình thì hay gặp `Unable to resolve module @electrogo/work`, hoặc sửa mini app mà app không tự cập nhật.

## Chạy app

```bash
pnpm install
pnpm ios --udid 4DC1F4E3-2A4A-47D5-9E24-7AD54E541D18   # iPhone 14 Pro, iOS 18.0
pnpm android
pnpm start --reset-cache                                # khi Metro kẹt cache
```

Lưu ý: máy có hai simulator cùng tên "iPhone 14 Pro" (iOS 17.2 và 18.0), nên dùng `--udid` thay vì `--simulator` theo tên.

## Khi nào chọn hướng khác

| Nhu cầu | Giải pháp |
|---|---|
| Hai app con phát hành/cập nhật độc lập, không qua store | Module Federation với **Re.Pack** (thay Metro bằng Webpack/Rspack, phức tạp hơn nhiều) |
| Hai app do hai nhóm khác nhau làm, tách repo | Mỗi app một repo, publish thành private npm package rồi host cài vào |
| Cùng một nhóm, phát hành chung | Monorepo như tài liệu này (mặc định) |

Cấu trúc package ở trên là tiền đề để sau này nâng lên Re.Pack mà không phải viết lại.

## Câu hỏi còn mở (cần chủ project xác nhận)

1. Hai app con có cần chạy độc lập (build ra app riêng để test) hay chỉ chạy bên trong super app?
2. Có cần cập nhật riêng từng app con mà không qua store không?
3. Có dùng chung đăng nhập và API giữa các app không? Nếu có thì tách thêm `packages/shared`.
