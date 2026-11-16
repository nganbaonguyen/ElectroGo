---
name: add-mini-app
description: Thêm một mini app mới (package riêng, repo git riêng) vào super app ElectroGo qua git submodule. Dùng khi người dùng muốn tạo thêm app con ngoài electro-go-work và electro-go-sale.
---

# Thêm mini app mới vào ElectroGo

> **Tóm tắt**
> - **Skill này là gì:** quy trình từng bước để thêm một mini app (repo riêng) vào super app.
> - **Dùng khi:** muốn tạo thêm app con ngoài `electro-go-work` và `electro-go-sale`.
> - **Kết quả:** repo mới trên GitHub, được gắn vào `packages/` và cài vào host.
> - **Skill liên quan:** `electrogo-superapp` (kiến trúc), `sync-submodules` (đồng bộ sau này).

Mỗi mini app là **một repo git riêng**, gắn vào host ở `packages/<tên-repo>` bằng submodule. Xem kiến trúc đầy đủ ở skill `electrogo-superapp`.

Quy ước đặt tên: repo `electro-go-<tên>`, package `@electrogo/<tên>`, component gốc `<Tên>App`.

## Quy trình

1. **Hỏi người dùng** tên mini app và URL repo GitHub trống (hoặc xác nhận tạo repo). Không tự push khi chưa được đồng ý.
2. **Dựng khung ở thư mục tạm** (không nằm trong ElectroGo), vì submodule không gắn được vào repo trống:
   - `package.json`: `name: "@electrogo/<tên>"`, `main: "src/index.tsx"`, `react` và `react-native` ở `peerDependencies: "*"`, không có dependency cài đặt riêng.
   - `src/index.tsx`: `export default function <Tên>App()` trả về một màn hình đơn giản.
   - `.gitignore` (`node_modules/`, `.DS_Store`) và `README.md`.
3. `git init -b main`, commit, thêm `origin`, `git push -u origin main`.
4. **Gắn vào host** (chạy ở thư mục gốc ElectroGo):
   ```bash
   git submodule add <url-repo> packages/electro-go-<tên>
   pnpm add '@electrogo/<tên>@workspace:*'   # bắt buộc bọc nháy trong zsh
   ```
5. Đăng ký mini app vào màn hình Home của host (`App.tsx`).
6. Báo người dùng các thay đổi chưa commit ở host (`.gitmodules`, `packages/...`, `package.json`, `pnpm-lock.yaml`) và hỏi trước khi commit.

## Lưu ý

- Mini app không có thư mục `android/` hay `ios/`; thư viện native chỉ cài ở host.
- Mini app không import lẫn nhau, chỉ import từ `packages/shared`.
- Nếu `git submodule add` báo repo không có commit nào, repo đang trống: quay lại bước 2-3.
