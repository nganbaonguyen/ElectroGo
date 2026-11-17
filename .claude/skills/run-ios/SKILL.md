---
name: run-ios
description: Chạy ElectroGo lên iOS simulator (hoặc Android emulator) và xử lý lỗi thường gặp. Dùng khi người dùng muốn chạy app lên máy ảo, đổi icon xong cần build lại, hoặc Re.Pack/build bị lỗi, mini app không tải được.
---

# Chạy ElectroGo lên máy ảo

```
+--------------------------+------------------------------------------------------------------------------+
| TÓM TẮT                  | run-ios                                                                      |
+==========================+==============================================================================+
| Là gì                    | Hướng dẫn chạy app lên iOS simulator / Android emulator và sửa lỗi thường    |
|                          | gặp                                                                          |
+--------------------------+------------------------------------------------------------------------------+
| Dùng khi                 | Muốn chạy app, vừa đổi icon, mini app không tải được, hoặc build báo lỗi     |
+--------------------------+------------------------------------------------------------------------------+
| Lệnh nhanh               | pnpm ios --udid 4DC1F4E3-2A4A-47D5-9E24-7AD54E541D18                         |
+--------------------------+------------------------------------------------------------------------------+
| Các mục                  | iOS, Android, Lỗi thường gặp, Lưu ý                                          |
+--------------------------+------------------------------------------------------------------------------+
| Skill liên quan          | electrogo-superapp (kiến trúc, setup), sync-submodules (clone thiếu code     |
|                          | mini app)                                                                    |
+--------------------------+------------------------------------------------------------------------------+
| Khi sửa file này         | Đọc README.md, mục "Quy ước khi sửa tài liệu skill", và mục "Ghi chú cho     |
|                          | người sửa" ở cuối file này                                                   |
+--------------------------+------------------------------------------------------------------------------+
```

Package manager là **pnpm** (không dùng yarn). Chạy ở thư mục gốc project.

**Kiến trúc nạp động (Re.Pack + Module Federation):** ngoài `pnpm start:dev` ở host, phải chạy server của mini app cần dùng, mỗi cái một terminal:
```bash
pnpm start:dev                                        # host, cổng 8081
cd packages/electro-go-work && pnpm start:module      # Chấm công, cổng 9001
cd packages/electro-go-sale && pnpm start:module      # Bán hàng, cổng 9002
```
Bấm ô trên Home mà thấy "Không tải được ..." nghĩa là server mini app đó chưa chạy. Lần đầu (hoặc sau khi đổi thư viện native/rspack config) phải build lại app bằng `pnpm ios` / `pnpm android`.

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

```
+----------------------------------------------------+-----------------------------------------------------+
| Triệu chứng                                        | Cách xử lý                                          |
+====================================================+=====================================================+
| Bundler kẹt cache, màn hình trắng                  | Dừng server, xóa build/ rồi chạy lại pnpm start:dev |
+----------------------------------------------------+-----------------------------------------------------+
| Module not found ở subpath package (vd             | Thiếu enablePackageExports: true trong              |
| @module-federation/runtime/helpers)                | Repack.getResolveOptions(...) của rspack.config.mjs |
+----------------------------------------------------+-----------------------------------------------------+
| Lỗi module/symlink của pnpm                        | .npmrc cần node-linker=hoisted, xóa node_modules và |
|                                                    | pnpm install lại                                    |
+----------------------------------------------------+-----------------------------------------------------+
| Android emulator không tải được mini app           | Host dùng 10.0.2.2 cho Android; thiết bị thật thì   |
|                                                    | đặt REMOTE_HOST=<IP máy> khi chạy pnpm start:dev    |
+----------------------------------------------------+-----------------------------------------------------+
| Đổi icon nhưng không thấy đổi                      | Icon nằm trong bản build: gỡ app khỏi máy ảo rồi    |
|                                                    | build lại                                           |
+----------------------------------------------------+-----------------------------------------------------+
| Clone mới thiếu code mini app                      | git submodule update --init --recursive             |
+----------------------------------------------------+-----------------------------------------------------+
```

## Lưu ý

- Chỉ chạy các lệnh trên khi người dùng yêu cầu chạy app.
- Nếu build lỗi, đọc log lỗi đầy đủ trước khi đề xuất cách sửa.

## Ghi chú cho người sửa file này

Đọc trước README.md, mục "Quy ước khi sửa tài liệu skill". Riêng file này:

- UDID và tên simulator phải kiểm tra lại bằng xcrun simctl list devices trước khi đổi. Không ghi từ trí nhớ.
- Cổng (8081 host, 9001 work, 9002 sale) phải khớp electrogo-superapp. Cách setup và chạy server chi tiết ghi ở đó, ở đây chỉ nhắc ngắn.
- Mỗi dòng trong bảng lỗi phải là lỗi đã gặp thật, có triệu chứng và cách xử lý đã thử.
- Chỉ chạy lệnh build, chạy app khi người dùng yêu cầu.
