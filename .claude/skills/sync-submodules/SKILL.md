---
name: sync-submodules
description: Cập nhật, đồng bộ và commit các mini app (git submodule) trong super app ElectroGo. Dùng khi sửa code ở electro-go-work/sale rồi cần host trỏ sang bản mới, hoặc khi clone mới bị thiếu code mini app.
---

# Làm việc với submodule của ElectroGo

> **Tóm tắt**
> - **Skill này là gì:** cách đồng bộ code giữa host và các mini app (git submodule).
> - **Dùng khi:** sửa mini app rồi cần host nhận bản mới, kéo bản mới của người khác, hoặc clone mà thiếu code.
> - **Quy tắc quan trọng nhất:** push repo con **trước**, rồi mới commit con trỏ ở host.
> - **Skill liên quan:** `add-mini-app` (thêm app mới).

Host chỉ ghi nhớ **một commit cụ thể** của mỗi mini app. Push ở repo con chưa đủ: phải commit ở host thì host mới trỏ sang bản mới.

## Các tình huống

### Clone mới hoặc thiếu code mini app

**Vì sao bị thiếu:** `git clone` thường chỉ tải repo host. Thư mục `packages/electro-go-work` và `packages/electro-go-sale` sẽ **tồn tại nhưng rỗng**, vì chúng là repo riêng chưa được tải.

**Cách 1: clone mới, tải đủ một lần**
```bash
git clone --recurse-submodules https://github.com/nganbaonguyen/ElectroGo.git
cd ElectroGo
```

**Cách 2: đã clone rồi mà thấy `packages/` rỗng**
```bash
cd ElectroGo
git submodule update --init --recursive
```
- `--init`: đăng ký submodule từ `.gitmodules` (cần ở lần đầu).
- `--recursive`: tải cả submodule lồng bên trong (nếu có).

**Kiểm tra đã đủ chưa**
```bash
git submodule status
ls packages/electro-go-work packages/electro-go-sale
```
Kết quả đúng: mỗi dòng bắt đầu bằng một khoảng trắng và mã commit, và hai thư mục có `package.json` và `src/`. Nếu dòng bắt đầu bằng dấu `-` nghĩa là submodule **chưa được tải**, chạy lại lệnh ở Cách 2.

**Các bước cần làm tiếp sau khi tải đủ** (làm đúng thứ tự):
```bash
pnpm install                 # cài dependency và nối workspace
cd ios && pod install && cd ..   # chỉ khi chạy iOS, lần đầu
pnpm ios --udid <UDID>       # xem skill run-ios
```

**Lỗi thường gặp khi tải submodule**

| Triệu chứng | Nguyên nhân | Cách xử lý |
|---|---|---|
| `packages/electro-go-*` rỗng | Chưa chạy `submodule update --init` | Chạy Cách 2 |
| `Authentication failed` / `Repository not found` | Repo con là private, tài khoản chưa có quyền hoặc chưa đăng nhập | Đăng nhập GitHub (token/SSH) và đảm bảo tài khoản có quyền đọc cả hai repo con |
| `fatal: remote error: upload-pack: not our ref <commit>` | Host trỏ tới commit của repo con chưa được push | Người làm host cần push repo con **trước** (xem mục "Sửa code mini app" bên dưới) |
| `Unable to resolve module @electrogo/work` sau khi tải | Chưa `pnpm install` hoặc Metro còn cache | `pnpm install`, rồi `pnpm start --reset-cache` |
| Đổi URL repo con nhưng vẫn tải về chỗ cũ | `.gitmodules` đã đổi nhưng cấu hình cục bộ chưa đồng bộ | `git submodule sync --recursive` rồi chạy lại Cách 2 |

### Sửa code mini app rồi đưa lên host

**Hiểu đúng trước khi làm:** host không lưu code mini app, chỉ lưu **một con trỏ tới commit cụ thể** của repo con. Vì vậy cần hai lần commit ở hai nơi, và **thứ tự bắt buộc là repo con trước, host sau**.

**Bước 0: đảm bảo repo con đang ở nhánh, không phải detached HEAD**
```bash
cd packages/electro-go-work
git status                  # nếu thấy "HEAD detached at ..." thì chạy lệnh dưới
git checkout main
git pull                    # lấy bản mới nhất trước khi sửa
```
Sửa code khi đang detached HEAD thì commit rất dễ bị mất.

**Bước 1: commit và push ở repo con**
```bash
git add -A
git commit -m "feat(work): <mô tả>"
git push
```

**Bước 2: quay về host và xem con trỏ đã đổi**
```bash
cd ../..
git status
```
Kết quả đúng: thấy dòng `modified: packages/electro-go-work (new commits)`. Nếu không thấy gì, nghĩa là bước 1 chưa commit.

**Bước 3: commit con trỏ ở host rồi push**
```bash
git add packages/electro-go-work
git commit -m "chore: bump work submodule"
git push
```

**Kiểm tra lại:** `git submodule status` không còn dấu `+` ở đầu dòng.

| Lỗi | Nguyên nhân | Cách xử lý |
|---|---|---|
| Bước 2 không thấy thay đổi | Chưa commit ở repo con | Quay lại bước 1 |
| `git push` ở repo con bị từ chối | Nhánh con cũ hơn remote | `git pull --rebase` rồi push lại |
| Người khác pull host báo `not our ref` | Push host nhưng quên push repo con | Vào repo con chạy `git push`, rồi để họ chạy lại `git submodule update --init` |

### Kéo bản mới của mini app do người khác push

**Dùng khi:** đồng đội đã push thêm commit vào `electro-go-work` hoặc `electro-go-sale` và bạn muốn host dùng bản đó.

```bash
git submodule update --remote            # kéo commit mới nhất của nhánh main từng repo con
git status                               # kiểm tra con trỏ nào đã đổi
git add packages
git commit -m "chore: update submodules"
git push
```

Chỉ cập nhật một mini app: `git submodule update --remote packages/electro-go-work`.

**Phân biệt hai lệnh dễ nhầm:**

| Lệnh | Ý nghĩa |
|---|---|
| `git submodule update --init --recursive` | Đưa repo con về **đúng commit host đang ghi nhận** (dùng khi clone, hoặc sau khi `git pull` host) |
| `git submodule update --remote` | Đưa repo con lên **commit mới nhất trên remote** (rồi phải commit ở host để ghi nhận) |

**Sau khi `git pull` ở host**, nếu thấy con trỏ submodule đổi, hãy chạy `git submodule update --init --recursive` để code mini app khớp với host.

### Kiểm tra trạng thái

```bash
git submodule status
```

| Ký hiệu đầu dòng | Ý nghĩa | Cần làm |
|---|---|---|
| (khoảng trắng) | Đúng commit host ghi nhận | Không cần |
| `-` | Chưa được tải | `git submodule update --init --recursive` |
| `+` | Repo con đang ở commit khác host ghi nhận | Nếu muốn giữ: commit con trỏ ở host. Nếu không: `git submodule update` để về lại |
| `U` | Đang xung đột | Giải quyết xung đột trong repo con rồi `git add` |

## Cạm bẫy

- Push host mà quên push repo con: người khác pull về sẽ lỗi vì commit con trỏ chưa tồn tại trên remote. Luôn push repo con **trước**.
- Commit trong submodule khi đang ở detached HEAD sẽ dễ mất: chạy `git checkout main` trong repo con trước khi sửa.
- Mini app không chứa `node_modules` riêng; luôn chạy `pnpm install` ở **thư mục gốc host**, không chạy trong từng repo con.
- Chỉ commit hoặc push khi người dùng yêu cầu.
