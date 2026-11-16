---
name: run-ios
description: Chạy ElectroGo lên iOS simulator (hoặc Android emulator) và xử lý lỗi thường gặp. Dùng khi người dùng muốn chạy app lên máy ảo, đổi icon xong cần build lại, hoặc Metro/build bị lỗi.
---

# Chạy ElectroGo lên máy ảo

> **Tóm tắt**
> - **Skill này là gì:** hướng dẫn chạy app lên iOS simulator / Android emulator và sửa lỗi thường gặp.
> - **Dùng khi:** muốn chạy app, vừa đổi icon, Metro bị kẹt, hoặc build báo lỗi.
> - **Lệnh nhanh:** `pnpm ios --udid 4DC1F4E3-2A4A-47D5-9E24-7AD54E541D18`
> - **Skill liên quan:** `electrogo-superapp` (cấu hình Metro).

Package manager là **pnpm** (không dùng yarn). Chạy ở thư mục gốc project.

## iOS

1. Kiểm tra simulator đang có:
   ```bash
   xcrun simctl list devices available
   ```
2. Máy này có **hai simulator cùng tên "iPhone 14 Pro"** (iOS 17.2 và 18.0). Chọn theo tên sẽ lấy nhầm bản 17.2, nên luôn dùng UDID:
   ```bash
   pnpm ios --udid 4DC1F4E3-2A4A-47D5-9E24-7AD54E541D18   # iPhone 14 Pro, iOS 18.0
   ```
   Nếu UDID đã đổi, chạy lệnh ở bước 1 để lấy UDID mới rồi dùng lại.
3. Lần đầu, hoặc khi đổi thư viện native:
   ```bash
   cd ios && pod install && cd ..
   ```

## Android

Mở Android Emulator từ Android Studio, kiểm tra `adb devices`, rồi `pnpm android`.

## Lỗi thường gặp

| Triệu chứng | Cách xử lý |
|---|---|
| Metro kẹt cache, màn hình trắng | `pnpm start --reset-cache` |
| `Unable to resolve module @electrogo/...` | Kiểm tra `metro.config.js` có `watchFolders` trỏ `packages/`, rồi `pnpm install` lại |
| Lỗi module/symlink của pnpm | `.npmrc` cần `node-linker=hoisted`, xóa `node_modules` và `pnpm install` lại |
| Đổi icon nhưng không thấy đổi | Icon nằm trong bản build: gỡ app khỏi máy ảo rồi build lại |
| Clone mới thiếu code mini app | `git submodule update --init --recursive` |

## Lưu ý

- Chỉ chạy các lệnh trên khi người dùng yêu cầu chạy app.
- Nếu build lỗi, đọc log lỗi đầy đủ trước khi đề xuất cách sửa.
