# Mục lục skill của ElectroGo

Mỗi skill nằm trong một thư mục riêng và file bên trong luôn tên `SKILL.md` (bắt buộc). **Tên thư mục chính là tên skill.**

| Skill (tên thư mục) | Gọi bằng | Dùng khi | Việc chính |
|---|---|---|---|
| `electrogo-superapp` | `/electrogo-superapp` | Cần hiểu kiến trúc, quyết định đặt code ở đâu | Cấu trúc host + mini app, quy tắc dependency, cấu hình Metro, lệnh chạy |
| `add-mini-app` | `/add-mini-app` | Muốn thêm một mini app mới | Tạo repo, dựng khung, gắn submodule, cài vào host |
| `run-ios` | `/run-ios` | Muốn chạy app lên máy ảo hoặc gặp lỗi build | Lệnh chạy iOS/Android, UDID simulator, bảng lỗi thường gặp |
| `sync-submodules` | `/sync-submodules` | Sửa mini app rồi đưa lên host, hoặc clone thiếu code | Push repo con trước, commit con trỏ ở host, kéo bản mới |

## Nên đọc theo thứ tự

1. `electrogo-superapp`: hiểu tổng thể.
2. `add-mini-app` và `sync-submodules`: làm việc hằng ngày với mini app.
3. `run-ios`: khi cần chạy hoặc sửa lỗi.
