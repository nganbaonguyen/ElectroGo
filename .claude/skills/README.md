# Mục lục skill của ElectroGo

Mỗi skill nằm trong một thư mục riêng và file bên trong luôn tên `SKILL.md` (bắt buộc). **Tên thư mục chính là tên skill.**

## 4 skill

```
+---------------------+---------------------+------------------------------+-------------------------------+
| Skill (tên thư mục) | Gọi bằng            | Dùng khi                     | Việc chính                    |
+=====================+=====================+==============================+===============================+
| electrogo-superapp  | /electrogo-superapp | Cần hiểu kiến trúc, dựng lại | Host và mini app là gì, setup |
|                     |                     | super app từ đầu, quyết định | từ đầu (phần A-E), luồng nạp  |
|                     |                     | đặt code ở đâu               | mini app, quy tắc dependency  |
+---------------------+---------------------+------------------------------+-------------------------------+
| add-mini-app        | /add-mini-app       | Muốn thêm một mini app mới   | Tạo repo, dựng khung, gắn     |
|                     |                     |                              | submodule, nối vào host       |
+---------------------+---------------------+------------------------------+-------------------------------+
| sync-submodules     | /sync-submodules    | Sửa mini app rồi đưa lên     | Push repo con trước, commit   |
|                     |                     | host, hoặc clone thiếu code  | con trỏ ở host, kéo bản mới   |
+---------------------+---------------------+------------------------------+-------------------------------+
| run-ios             | /run-ios            | Muốn chạy app lên máy ảo     | Lệnh chạy iOS/Android, UDID   |
|                     |                     | hoặc gặp lỗi build           | simulator, bảng lỗi thường    |
|                     |                     |                              | gặp                           |
+---------------------+---------------------+------------------------------+-------------------------------+
```

## Muốn làm gì thì đọc skill nào

```
+----------------------------------------------------+-----------------------------------------------------+
| Tôi muốn...                                        | Đọc                                                 |
+====================================================+=====================================================+
| Hiểu super app hoạt động thế nào                   | electrogo-superapp, mục "Hiểu nhanh" và "Luồng      |
|                                                    | chạy"                                               |
+----------------------------------------------------+-----------------------------------------------------+
| Dựng lại super app từ đầu                          | electrogo-superapp, mục "Setup từ đầu"              |
+----------------------------------------------------+-----------------------------------------------------+
| Ôn phỏng vấn, hiểu sâu từng phần                   | electrogo-superapp/giai-thich-chi-tiet.md           |
+----------------------------------------------------+-----------------------------------------------------+
| Thêm một mini app mới                              | add-mini-app (cần đọc thêm Phần B, C của            |
|                                                    | electrogo-superapp)                                 |
+----------------------------------------------------+-----------------------------------------------------+
| Thêm một chức năng mới trong mini app có sẵn       | electrogo-superapp, mục "Màn hình trung tâm (hub)"  |
+----------------------------------------------------+-----------------------------------------------------+
| Đưa code mini app vừa sửa lên host                 | sync-submodules                                     |
+----------------------------------------------------+-----------------------------------------------------+
| Clone về mà thư mục packages/ rỗng                 | sync-submodules, mục "Clone mới hoặc thiếu code"    |
+----------------------------------------------------+-----------------------------------------------------+
| Chạy app, hoặc sửa lỗi build/không tải được mini   | run-ios                                             |
| app                                                |                                                     |
+----------------------------------------------------+-----------------------------------------------------+
```

## Hệ thống chạy ra sao (tóm tắt một dòng)

Host (app React Native thật) + mini app (repo riêng, gắn bằng git submodule vào `packages/`). Dev: mỗi mini app chạy một server riêng (cổng 9001, 9002), host (cổng 8081) tải mini app lúc bấm ô trên Home bằng Re.Pack + Module Federation. **Không dùng Metro.**

## Nên đọc theo thứ tự

1. `electrogo-superapp`: hiểu tổng thể.
2. `add-mini-app` và `sync-submodules`: làm việc hằng ngày với mini app.
3. `run-ios`: khi cần chạy hoặc sửa lỗi.

## Quy ước khi sửa tài liệu skill

**BẮT BUỘC, đọc trước khi sửa bất kỳ file nào ở đây.** Đây là chuẩn chung cho cả 5 file và file giai-thich-chi-tiet.md. Mỗi `SKILL.md` chỉ ghi thêm phần riêng của nó (mục "Ghi chú cho người sửa file này" ở cuối file), không lặp lại chuẩn này.

### 1. Nội dung phải đúng với repo

- **Kiểm tra thật rồi mới ghi:** lệnh, cổng, đường dẫn, tên file, tên biến phải đối chiếu bằng `ls`, `cat`, `grep` trên repo. Không ghi từ trí nhớ hay từ bản cũ của tài liệu.
- Sửa kiến trúc hoặc cấu hình trong code (Rspack, cổng, tên remote, submodule) thì cập nhật skill tương ứng **trong cùng lần sửa**.
- Chưa chắc thì ghi vào mục "Câu hỏi còn mở" của `electrogo-superapp`, không đoán.
- **Một thông tin chỉ ghi ở một nơi**, nơi khác trỏ tới tên skill/mục đó:
  - setup từ đầu, cách chạy server, quy tắc Module Federation: `electrogo-superapp`
  - thêm mini app mới: `add-mini-app`
  - thao tác submodule: `sync-submodules`
  - lỗi build, lệnh chạy máy ảo: `run-ios`

### 2. Bảng: luôn kẻ khung, không dùng bảng markdown

- Mọi bảng là dạng kẻ khung (`+---+` và `|`), đặt **trong code block**. Không dùng `| --- |`.
- Dòng ngăn tiêu đề dùng `=` (`+===+`), dòng ngăn các hàng dùng `-`.
- Mọi dòng của một bảng phải **cùng độ dài**, tối đa **108 ký tự**. Ô dài thì xuống dòng trong khung.
- Trong bảng không dùng dấu backtick và `**đậm**` (code block không render được, chỉ thành rác).
- Sửa hoặc thêm ô thì căn lại cả khung. Ví dụ đúng:
  ```
  +-----------+-----------------+
  | Cột 1     | Cột 2           |
  +===========+=================+
  | Ô dài hơn | Nội dung        |
  +-----------+-----------------+
  ```

### 3. Cấu trúc và cách viết

- Tiếng Việt có dấu. Thuật ngữ kỹ thuật, tên lệnh, tên file giữ nguyên tiếng Anh.
- Đầu mỗi `SKILL.md`: frontmatter (`name` trùng tên thư mục, `description` một câu nói rõ "dùng khi nào") rồi **bảng "TÓM TẮT" kẻ khung** (là gì, dùng khi nào, các mục chính, skill liên quan, dòng "Khi sửa file này" trỏ về README). Không dùng khối trích dẫn `>`, `**đậm**` hay link ở phần đầu: người đọc xem file thô trong editor, các ký hiệu này rất rối mắt, và link `#mục` không bấm được trong editor.
- Cuối mỗi `SKILL.md`: mục "Ghi chú cho người sửa file này" (vài gạch đầu dòng, chữ thường), chứa những điều riêng của file đó. Không đặt ghi chú sửa file ở đầu file.
- Ưu tiên chữ thường dễ đọc ở dạng thô: hạn chế `**đậm**` và backtick dày đặc trong cùng một câu.
- Cây thư mục, sơ đồ luồng, lệnh: đặt trong code block. Lệnh dùng ` ```bash ` và có comment ngắn.
- Viết ngắn, từng bước đánh số, mỗi bước có chỗ "xong khi" hoặc "kết quả đúng" nếu kiểm tra được.
- Thêm hoặc xóa skill thì cập nhật bảng mục lục ở đầu file này.

### 4. Những điều đã lỗi thời, KHÔNG được ghi lại

- **Không dùng Metro** để chạy app (`metro.config.js` chỉ giữ mặc định). Dùng Re.Pack + Module Federation.
- Host **không import** mã mini app và **không** phụ thuộc `@electrogo/*`.
- Mini app là **git submodule** ở `packages/`, mỗi cái một repo. `sub/` chỉ là bản clone của `pnpm subs` (bị `.gitignore`), không phải nơi chạy app.
- Package `packages/shared` **chưa tồn tại**.
- `pnpm start:module` và `pnpm build` chạy **trong thư mục mini app**, không phải ở gốc host.

### 5. Làm việc với git

- Chỉ sửa file trong `.claude/skills/`. Không tự `commit` hay `push` khi người dùng chưa yêu cầu.

### 6. Kiểm tra sau khi sửa (chạy ở thư mục gốc ElectroGo, không in gì nghĩa là đạt)

```bash
python3 -I -c "
import sys
for p in sys.argv[1:]:
    blk=[]
    for n,l in enumerate(open(p,encoding='utf-8').read().split('\n')+[''],1):
        if l.startswith('| ---') or l.startswith('|---'): print(p,n,'bảng markdown, phải đổi sang kẻ khung')
        if l[:1] in ('+','|'): blk.append((n,len(l)))
        else:
            if blk and (len({w for _,w in blk})>1 or blk[0][1]>108): print(p,blk[0][0],'bảng lệch hoặc rộng quá 108')
            blk=[]
" .claude/skills/README.md .claude/skills/*/*.md
```
