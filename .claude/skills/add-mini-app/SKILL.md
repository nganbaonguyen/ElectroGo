---
name: add-mini-app
description: Thêm một mini app mới (package riêng, repo git riêng) vào super app ElectroGo qua git submodule. Dùng khi người dùng muốn tạo thêm app con ngoài electro-go-work và electro-go-sale.
---
repo: Kho lưu trữ

# Thêm mini app mới vào ElectroGo

```
+--------------------------+------------------------------------------------------------------------------+
| TÓM TẮT                  | add-mini-app                                                                 |
+==========================+==============================================================================+
| Là gì                    | Quy trình từng bước thêm một mini app (repo riêng) vào super app             |
+--------------------------+------------------------------------------------------------------------------+
| Dùng khi                 | Muốn tạo thêm app con ngoài electro-go-work và electro-go-sale               |
+--------------------------+------------------------------------------------------------------------------+
| Kết quả                  | Repo mới trên GitHub, gắn vào packages/ và nối vào host                      |
+--------------------------+------------------------------------------------------------------------------+
| Đọc kèm                  | electrogo-superapp: Phần B (dựng mini app) và Phần C (nối vào host)          |
+--------------------------+------------------------------------------------------------------------------+
| Skill liên quan          | electrogo-superapp (kiến trúc), sync-submodules (đồng bộ sau này)            |
+--------------------------+------------------------------------------------------------------------------+
| Khi sửa file này         | Đọc README.md, mục "Quy ước khi sửa tài liệu skill", và mục "Ghi chú cho     |
|                          | người sửa" ở cuối file này                                                   |
+--------------------------+------------------------------------------------------------------------------+
```

Mỗi mini app là **một repo git riêng**, gắn vào host ở `packages/<tên-repo>` bằng submodule. Xem kiến trúc đầy đủ ở skill `electrogo-superapp`.

Quy ước đặt tên: repo `electro-go-<tên>`, package `@electrogo/<tên>`, component gốc `<Tên>App`.

## Quy trình

1. **Hỏi người dùng** tên mini app và URL repo GitHub trống (hoặc xác nhận tạo repo). Không tự push khi chưa được đồng ý.
2. **Dựng khung ở thư mục tạm** (không nằm trong ElectroGo), vì submodule không gắn được vào repo trống. Khung phải đúng **chuẩn cấu trúc mini app** trong skill `electrogo-superapp` (nên sao chép từ `packages/electro-go-work` rồi đổi tên cho nhanh):
   - `package.json`: `name: "@electrogo/<tên>"`, `main: "src/index.tsx"`, `peerDependencies: "*"` cho `react`, `react-native`, `react-native-safe-area-context`, `@react-native-vector-icons/ionicons`; không có dependency cài đặt riêng.
   - `src/index.tsx` (export default + `manifest`), `manifest.ts`, `app/<Tên>App.tsx`, `app/navigation/MiniNavigator.tsx`.
   - `features/<feature>/` (screens, components, hooks, services, data, types, index.ts), `services/api/`, `config/env.ts`, `assets/` (images/index.ts, icons.ts), `shared/` (theme, components, hooks, navigation, utils).
   - `.gitignore` (`node_modules/`, `.DS_Store`) và `README.md` mô tả cấu trúc.
   - Viết README bằng công cụ không bị shell thay thế biến (ví dụ Python hoặc heredoc có nháy `'EOF'`); heredoc không nháy với `${...}` từng làm README bị ghi rỗng.
3. `git init -b main`, commit, thêm `origin`, `git push -u origin main`.
4. **Cấu hình remote cho mini app** (sao chép từ `packages/electro-go-work` rồi đổi tên): `rspack.config.mjs` (`name` = khóa mini app, `exposes: {'./App': './src/index.tsx'}`, `filename: '<tên>.container.js.bundle'`, `shared` với `import: false`, `getResolveOptions({enablePackageExports: true})`), `dev/Harness.tsx`, `dev/index.js`, `scripts/start-module.sh`, `scripts/build-bundle.sh`; scripts `start:module` (cổng mới, ví dụ 9003), `build`, `build:src` trong `package.json`.
5. **Gắn vào host** (chạy ở thư mục gốc ElectroGo):
   ```bash
   git submodule add <url-repo> packages/electro-go-<tên>
   ```
   Rồi sửa host: thêm remote vào `REMOTES` trong `rspack.config.mjs` (tên, cổng, biến `<TÊN>_REMOTE_URL`), khai báo `declare module '<tên>/App'` trong `src/types/remotes.d.ts`, thêm dòng vào `LOADERS` trong `src/app/remotes.ts`, thêm khóa vào `MiniAppKey` và một dòng vào `data/miniApps.ts` của feature home. **Không** thêm `@electrogo/<tên>` vào dependencies của host (host không import mã nguồn).
6. Chạy thử: terminal 1 `pnpm start:dev`, terminal 2 `pnpm start:module` trong package mới, bấm ô trên Home. Báo người dùng các thay đổi chưa commit ở host (`.gitmodules`, `packages/...`, `package.json`, `pnpm-lock.yaml`) và hỏi trước khi commit.

## Lưu ý

- Mini app không có thư mục `android/` hay `ios/`; thư viện native chỉ cài ở host.
- Mini app không import mã của host hay của mini app khác. Package `packages/shared` chưa có; hiện mỗi mini app giữ một bản `shared/theme.ts` riêng.
- Tên phải **khớp xuyên suốt**: `name` trong `rspack.config.mjs` của mini app = khóa trong `REMOTES` của host = `'<tên>/App'` trong `remotes.d.ts` = khóa `MiniAppKey`.
- Bước 4 và 5 chính là Phần B và Phần C của mục "Setup từ đầu" trong skill `electrogo-superapp`, có thêm bảng 5 file cần sửa ở host.
- Mini app mới thêm xong thì push repo con trước, rồi commit `.gitmodules` và con trỏ ở host (xem skill `sync-submodules`).
- Nếu `git submodule add` báo repo không có commit nào, repo đang trống: quay lại bước 2-3.

## Ghi chú cho người sửa file này

Đọc trước README.md, mục "Quy ước khi sửa tài liệu skill". Riêng file này:

- Chi tiết cấu hình Rspack và 5 file cần sửa ở host ghi ở electrogo-superapp (Phần B, C). Ở đây chỉ nêu việc cần làm, không chép lại chi tiết.
- Danh sách peerDependencies phải khớp package.json của packages/electro-go-work.
- Không tự tạo repo GitHub hay push khi người dùng chưa đồng ý (bước 1).
