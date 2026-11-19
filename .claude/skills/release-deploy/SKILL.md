---
name: release-deploy
description: Phát hành ElectroGo: upload bundle mini app (.tar) lên web phân phối rồi tích LIVE, và build file .apk, .aab, .ipa của app host. Dùng khi cập nhật mini app không cần phát hành lại host, build bản cài lên máy thật, hoặc app Release không tải được mini app.
---

# Phát hành ElectroGo

```
+------------------------+--------------------------------------------------------------------------------+
| TÓM TẮT                | release-deploy                                                                 |
+========================+================================================================================+
| Là gì                  | Quy trình phát hành ElectroGo: upload bundle mini app (.tar) lên web phân phối |
|                        | rồi tích LIVE, và build file .apk, .aab, .ipa của app host                     |
+------------------------+--------------------------------------------------------------------------------+
| Dùng khi               | Cập nhật mini app mà không phát hành lại host, build bản cài lên máy thật, app |
|                        | Release không tải được mini app, hoặc thêm ứng dụng mới vào web                |
+------------------------+--------------------------------------------------------------------------------+
| Lệnh nhanh             | Mini app: pnpm build (trong thư mục mini app), upload ở tab Bundle mini app,   |
|                        | tích LIVE. Host: pnpm build:android, pnpm build:ios                            |
+------------------------+--------------------------------------------------------------------------------+
| Các mục                | Tổng quan, Hai việc tách biệt, Web phân phối, Cập nhật một mini app, Ý nghĩa   |
|                        | các ô, Build app host, Lỗi thường gặp                                          |
+------------------------+--------------------------------------------------------------------------------+
| Skill liên quan        | electrogo-superapp (kiến trúc, quy tắc), run-ios (chạy máy ảo),                |
|                        | sync-submodules (đưa code mini app lên host)                                   |
+------------------------+--------------------------------------------------------------------------------+
| Chi tiết vì sao        | electrogo-superapp/giai-thich-chi-tiet.md, mục 13A                             |
+------------------------+--------------------------------------------------------------------------------+
| Khi sửa file này       | Đọc README.md, mục "Quy ước khi sửa tài liệu skill", và mục "Ghi chú cho người |
|                        | sửa" ở cuối file này                                                           |
+------------------------+--------------------------------------------------------------------------------+
```

## Tổng quan

Mini app và app host phát hành tách nhau. Mini app là file .tar đưa lên web phân phối; app host chỉ cần biết địa chỉ web. Mỗi lần người dùng bấm ô trên Home, host hỏi web "bản LIVE của mini app này là bản nào", rồi nạp đúng bản đó.

```
  Mini app (repo riêng)      Web phân phối (máy bạn)           App host (điện thoại)
  pnpm build
  -> build/<tên>-<ver>.tar -> tab Bundle mini app: upload,
                              giải nén, tích LIVE một bản
                                   ^                          bấm ô trên Home
                                   |  GET .../bundles/work/resolve?platform=...&env=live
                                   +------------------------ host hỏi "bản LIVE là bản nào"
                              trả manifestUrl -------------> nạp mf-manifest.json đó
```

App không "nhìn thấy" checkbox. Tích LIVE chỉ đổi một trường trong bundles/registry.json trên web; app biết được vì nó hỏi web mỗi lần mở mini app. Web không gửi thông báo nào xuống app: người dùng đang mở sẵn mini app sẽ thấy bản mới từ lần mở sau (lý do và các cách đẩy khác: giai-thich-chi-tiet.md, mục 13A.3).

## Hai việc tách biệt

```
+----------------------------------------+--------------------+--------------------------------------------+
| Việc                                   | Cần build lại      | Cách làm                                   |
|                                        | host?              |                                            |
+========================================+====================+============================================+
| Đổi code, đổi bản của một mini app     | Không              | pnpm build trong mini app, upload .tar lên |
|                                        |                    | web, tích LIVE                             |
+----------------------------------------+--------------------+--------------------------------------------+
| Rollback mini app về bản cũ            | Không              | Tích LIVE ở bản cũ rồi Lưu                 |
+----------------------------------------+--------------------+--------------------------------------------+
| Đổi thư viện native, icon, quyền,      | Có                 | pnpm build:android, pnpm build:ios rồi cài |
| Bundle ID                              |                    | lại app                                    |
+----------------------------------------+--------------------+--------------------------------------------+
| Đổi địa chỉ web phân phối (đổi mạng,   | Có                 | Địa chỉ nhúng trong app lúc build; build   |
| đổi IP)                                |                    | lại host                                   |
+----------------------------------------+--------------------+--------------------------------------------+
| Tăng số phiên bản gửi lên store        | Có                 | ELECTROGO_VERSION_CODE tăng rồi build lại  |
+----------------------------------------+--------------------+--------------------------------------------+
```

## Web phân phối

```
+--------------------+------------------------------------------------------------------------------------+
| Mục                | Giá trị                                                                            |
+====================+====================================================================================+
| Thư mục            | /Users/ngannguyenbao/web-deployment-apk (repo nganbaonguyen/web-deployment-apk,    |
|                    | tách khỏi repo ElectroGo)                                                          |
+--------------------+------------------------------------------------------------------------------------+
| Chạy web           | npm run mobile trong thư mục đó, mở http://localhost:8080. Sửa code server thì     |
|                    | dừng rồi chạy lại                                                                  |
+--------------------+------------------------------------------------------------------------------------+
| Ứng dụng           | Sidebar bên trái có mục Ứng dụng: ElectroGo (mặc định) và Hypertech. Nút + thêm    |
|                    | ứng dụng. Mỗi ứng dụng có kho APK/IPA và danh sách bundle riêng                    |
+--------------------+------------------------------------------------------------------------------------+
| Hai tab chính      | Tổng quan, Phát hành gói... (kho APK/IPA) và Bundle mini app (tar của mini app)    |
+--------------------+------------------------------------------------------------------------------------+
| Dữ liệu            | data/apps.json (danh sách ứng dụng), uploads/ (APK, IPA), bundles/ (bundle đã giải |
|                    | nén và registry.json). Cả ba không đưa lên git                                     |
+--------------------+------------------------------------------------------------------------------------+
| URL                | ElectroGo dùng /api/...; ứng dụng khác dùng /api/apps/<mã>/.... Bundle:            |
|                    | /bundles/<module>/<phiên bản>/<nền tảng>/                                          |
+--------------------+------------------------------------------------------------------------------------+
```

API (dùng khi cần gọi tay hoặc viết thêm công cụ):

```
+----------------------------------+----------------------------------------------------------------------+
| Việc                             | API (thêm /api/apps/<mã> thay cho /api nếu không phải ElectroGo)     |
+==================================+======================================================================+
| Danh sách module và phiên bản    | GET /api/bundles                                                     |
+----------------------------------+----------------------------------------------------------------------+
| Khai báo module                  | POST /api/bundles/modules (key, label, tarPrefix)                    |
+----------------------------------+----------------------------------------------------------------------+
| Upload bundle                    | POST /api/bundles/<module>/upload (file .tar, version, live)         |
+----------------------------------+----------------------------------------------------------------------+
| Lưu STAGING, PROD, Active, LIVE  | PATCH /api/bundles/<module>/versions                                 |
+----------------------------------+----------------------------------------------------------------------+
| Xóa phiên bản, xóa module        | DELETE /api/bundles/<module>/versions/<ver>, DELETE                  |
|                                  | /api/bundles/<module>                                                |
+----------------------------------+----------------------------------------------------------------------+
| App hỏi bản cần nạp              | GET /api/bundles/<module>/resolve?platform=ios|android&env=live|prod |
|                                  | |staging                                                             |
+----------------------------------+----------------------------------------------------------------------+
| Thêm, đổi, xóa ứng dụng          | POST, PATCH, DELETE /api/apps (luôn là /api/apps, không có tiền tố)  |
+----------------------------------+----------------------------------------------------------------------+
```

## Cập nhật một mini app

1. Sửa code mini app, tăng version trong package.json của mini app, đưa code lên repo con (xem skill sync-submodules).
2. Trong thư mục mini app chạy `pnpm build` (không phải `pnpm build:src`). Kết quả: `build/electro-go-<tên>-<version>.tar`, giải nén ra thư mục `ios/` và `android/` chứa mf-manifest.json, container và chunk.
   Xong khi: file .tar nặng cỡ vài MB và có `ios/`, `android/` bên trong (`tar -tf <file> | head`).
3. Mở web, chọn ứng dụng ở sidebar, vào tab Bundle mini app, bấm "Upload bundle (.tar)", chọn file. Module và phiên bản tự điền theo tên file; sửa nếu cần rồi bấm Upload.
   Xong khi: web báo "Đã upload ... (ios, android)" và phiên bản mới xuất hiện trong `versions`, đang ở STAGING.
4. Bấm `versions` ở thẻ module, tick LIVE cho phiên bản mới, bấm Lưu.
   Xong khi: thẻ module hiện "LIVE v<phiên bản>".
5. Trên điện thoại, mở lại mini app (tắt hẳn app nếu vẫn thấy bản cũ).

Rollback: tick LIVE ở bản cũ rồi Lưu. Chặn khẩn cấp một bản: tắt công tắc Active của bản đó.

Module phải khai báo trước (nút "Khai báo module"); `work` và `sale` đã có sẵn ở ứng dụng ElectroGo. Mã module phải trùng tên remote trong host (rspack.config.mjs, bảng REMOTES).

## Ý nghĩa các ô

```
+------------+----------------------------------------------------+----------------------------------------+
| Giá trị    | Ý nghĩa                                            | Ai dùng                                |
+============+====================================================+========================================+
| LIVE       | Bản phục vụ người dùng. Mỗi module tối đa một bản  | App Release (env=live, mặc định)       |
|            | LIVE                                               |                                        |
+------------+----------------------------------------------------+----------------------------------------+
| STAGING    | Cờ môi trường thử. Bản mới upload mặc định có cờ   | env=staging                            |
|            | này                                                |                                        |
+------------+----------------------------------------------------+----------------------------------------+
| PROD       | Cờ môi trường production                           | env=prod                               |
+------------+----------------------------------------------------+----------------------------------------+
| Active     | Tắt thì web trả 403, app không tải được bản đó;    | Server                                 |
|            | bản LIVE bị tắt Active thì mất LIVE                |                                        |
+------------+----------------------------------------------------+----------------------------------------+
```

## Build app host

Chạy ở thư mục gốc ElectroGo. Kết quả nằm trong `build/release/` (đã được .gitignore), tên dạng `ElectroGo-<versionName>-<versionCode>`.

```bash
pnpm build:android   # ra .apk (cài trực tiếp, upload web) và .aab (Google Play)
pnpm build:ios       # ra .ipa (cần Mac có Xcode, Team ID trong build.local.env)
```

Cấu hình đặt một lần trong `scripts/build.local.env` (sao từ `scripts/build.local.env.example`, file này không đưa lên git):

```
+----------------------------------+------------------+----------------------------------------------------+
| Biến                             | Nơi đặt          | Ý nghĩa                                            |
+==================================+==================+====================================================+
| DEPLOY_STATIC_URL                | build.local.env  | Địa chỉ GitHub Pages (https) nhúng vào app. Chạy   |
|                                  |                  | ở mọi WiFi, không cần Mac bật. Có biến này thì     |
|                                  |                  | DEPLOY_API_URL bị bỏ qua                           |
+----------------------------------+------------------+----------------------------------------------------+
| DEPLOY_API_URL                   | build.local.env  | Địa chỉ web trong mạng LAN (chỉ khi không dùng     |
|                                  |                  | Pages). Bỏ trống: script tự tìm. none: cố ý không  |
|                                  |                  | dùng web                                           |
+----------------------------------+------------------+----------------------------------------------------+
| DEPLOY_APP_ID, DEPLOY_ENV        | build.local.env  | Ứng dụng trên web (mặc định electrogo) và môi      |
|                                  |                  | trường (mặc định live)                             |
+----------------------------------+------------------+----------------------------------------------------+
| ELECTROGO_VERSION_NAME, _CODE    | build.local.env  | versionName và versionCode (Android), số build     |
|                                  |                  | (iOS). Code phải tăng mỗi lần lên store            |
+----------------------------------+------------------+----------------------------------------------------+
| ELECTROGO_KEYSTORE,              | build.local.env  | Khóa ký release Android. Thiếu thì ký bằng khóa    |
| _KEYSTORE_PASSWORD, _KEY_ALIAS,  |                  | debug                                              |
| _KEY_PASSWORD                    |                  |                                                    |
+----------------------------------+------------------+----------------------------------------------------+
| ELECTROGO_IOS_TEAM_ID            | build.local.env  | Team ID ký iOS (bắt buộc). Thiếu thì script liệt   |
|                                  |                  | kê các Team ID có trong Keychain                   |
+----------------------------------+------------------+----------------------------------------------------+
| ELECTROGO_IOS_EXPORT_METHOD      | build.local.env  | development (mặc định), ad-hoc, app-store-connect, |
|                                  |                  | enterprise                                         |
+----------------------------------+------------------+----------------------------------------------------+
| ELECTROGO_IOS_BUNDLE_ID          | build.local.env  | Ghi đè Bundle ID (mặc định giữ giá trị trong Xcode |
|                                  |                  | project)                                           |
+----------------------------------+------------------+----------------------------------------------------+
| ELECTROGO_ALLOW_CLEARTEXT        | tự đặt           | Script tự bật khi địa chỉ web là http://, cho phép |
|                                  |                  | Android Release gọi http                           |
+----------------------------------+------------------+----------------------------------------------------+
```

Điểm quan trọng: địa chỉ web được nhúng vào app lúc build (DefinePlugin trong rspack.config.mjs). Vì vậy đổi mạng hoặc đổi IP thì phải build lại host. Script `scripts/deploy-url.sh` tự tìm địa chỉ (hỏi web đang chạy ở cổng 8080, hoặc dùng IP LAN), in ra "Nhúng địa chỉ web phân phối vào app: ..." và dừng nếu không xác định được. Nếu bạn thấy dòng này chỉ địa chỉ không đúng, đặt DEPLOY_API_URL trong build.local.env.

Build không có DEPLOY_API_URL (đặt none, hoặc chạy pnpm start:dev) thì app nạp mini app từ địa chỉ cố định ở REMOTES (dev): xem skill run-ios.

Chữ ký:
- Android: AAB đưa lên Google Play phải ký bằng khóa upload của bạn (ELECTROGO_KEYSTORE...). APK ký bằng khóa debug vẫn cài và upload web được.
- iOS: máy hiện chỉ có chứng chỉ Apple Development nên `.ipa` mặc định chỉ cài được lên máy đã đăng ký UDID. Đưa lên App Store Connect cần chứng chỉ Distribution, Bundle ID thật và ELECTROGO_IOS_EXPORT_METHOD=app-store-connect.

## GitHub Pages: chạy ở mọi WiFi

Web phân phối chạy trên Mac nên địa chỉ LAN đổi theo mạng. Dùng GitHub Pages để app có một địa chỉ https cố định, đổi WiFi hay tắt Mac vẫn nạp được mini app.

```
+----------------------------------+----------------------------------------------------------------------+
| Bước (làm một lần)               | Cách làm                                                             |
+==================================+======================================================================+
| 1. Tạo repo public               | Ví dụ nganbaonguyen/electrogo-bundles (Pages chỉ chạy repo private   |
|                                  | với gói trả phí, nên bundle sẽ đọc được công khai)                   |
+----------------------------------+----------------------------------------------------------------------+
| 2. Khai báo trong web            | Tab Bundle mini app, khung GitHub Pages: dán địa chỉ repo .git, bấm  |
|                                  | Lưu rồi Đưa lên ngay (lần đầu tạo nhánh gh-pages)                    |
+----------------------------------+----------------------------------------------------------------------+
| 3. Bật Pages                     | Repo > Settings > Pages > Source: Deploy from a branch, nhánh        |
|                                  | gh-pages, thư mục / (root)                                           |
+----------------------------------+----------------------------------------------------------------------+
| 4. Build host                    | Đặt DEPLOY_STATIC_URL=https://<tên>.github.io/<repo> trong           |
|                                  | build.local.env, chạy pnpm build:android, cài lại app                |
+----------------------------------+----------------------------------------------------------------------+
```

Sau đó mỗi lần upload bundle, tick LIVE hoặc xóa phiên bản trên web, server tự đẩy lại lên Pages (server/pages.js): sinh file resolve/<module>/<nền tảng>/<môi trường>.json và chép các bundle đang được phục vụ, rồi `git push --force` nhánh gh-pages (luôn một commit). App đọc file tĩnh này thay vì gọi API. Cập nhật mini app không cần build lại host.

- Độ trễ: GitHub cần khoảng 1 đến 2 phút để dựng Pages. App thêm `?t=` vào URL để không dính cache CDN.
- Đăng nhập git dùng sẵn của máy (keychain hoặc ssh), web không lưu token. Có thể đặt PAGES_REPO và PAGES_URL trong môi trường để ghi đè.
- Kho APK/IPA vẫn chỉ ở web LAN, không lên Pages.

## Lỗi thường gặp

```
+----------------------------------+------------------------------------+----------------------------------+
| Triệu chứng                      | Nguyên nhân                        | Cách sửa                         |
+==================================+====================================+==================================+
| Máy thật báo "Không kết nối được | App build không có địa chỉ web nên | Build bằng pnpm build:android    |
| tới mini app                     | dùng địa chỉ cố định của dev       | hoặc build:ios (tự nhúng địa     |
| (http://10.0.2.2:9001/...)"      | (10.0.2.2 chỉ có trong Android     | chỉ), gỡ app cũ rồi cài lại      |
|                                  | emulator)                          |                                  |
+----------------------------------+------------------------------------+----------------------------------+
| Android báo "Network request     | Android Release chặn http thường   | Script tự bật cleartext khi địa  |
| failed" dù đã có địa chỉ web     |                                    | chỉ là http://. Dùng https cho   |
|                                  |                                    | bản phát hành thật               |
+----------------------------------+------------------------------------+----------------------------------+
| "Không lấy được bản mini app ... | Chưa tích LIVE, bản LIVE bị tắt    | Mở versions của module trên web, |
| (Chưa có bản LIVE cho work       | Active, hoặc bản đó không có nền   | tick LIVE, Lưu                   |
| (ios))"                          | tảng này                           |                                  |
+----------------------------------+------------------------------------+----------------------------------+
| Điện thoại không mở được         | Mạng chặn kết nối giữa các thiết   | Đưa điện thoại và Mac vào cùng   |
| http://<IP>:8080                 | bị (WiFi công ty hay bị)           | mạng khác (hotspot), rồi build   |
|                                  |                                    | lại host vì IP nằm trong app     |
+----------------------------------+------------------------------------+----------------------------------+
| thiếu ios/ hoặc android/"        | đuôi -src.tar do pnpm build:src)   | do pnpm build tạo (nặng khoảng   |
|                                  |                                    | 1,9 MB)                          |
+----------------------------------+------------------------------------+----------------------------------+
| Web báo "Tar này là của mini app | Chọn nhầm module khi upload        | Chọn đúng module, hoặc đúng file |
| X, không phải Y"                 | (manifest ghi tên mini app khác)   | tar của module đó                |
+----------------------------------+------------------------------------+----------------------------------+
| App báo "[ScriptManager] Failed  | Bản LIVE của module thực chất là   | Tắt hoặc xóa bản sai ở nút       |
| to prefetch script"              | bundle của mini app khác (upload   | versions, upload lại đúng tar,   |
|                                  | nhầm từ trước khi web có kiểm tra) | tích LIVE                        |
+----------------------------------+------------------------------------+----------------------------------+
| Lỗi tải mini app vài chục giây   | GitHub Pages đang chuyển bản       | App tự thử lại; nếu vẫn lỗi chờ  |
| sau khi vừa upload               |                                    | khoảng 2 phút rồi mở lại mini    |
|                                  |                                    | app                              |
+----------------------------------+------------------------------------+----------------------------------+
| Xcode Archive lỗi "Unable to     | Xcode đóng gói JS bằng Metro       | Giữ dòng export CLI_PATH trong   |
| resolve module work/App"         | (scripts/bundle.js) thay vì        | ios/.xcode.env                   |
|                                  | Re.Pack                            |                                  |
+----------------------------------+------------------------------------+----------------------------------+
| Gradle lỗi                       | Chạy assembleRelease không chỉ     | Dùng :app:assembleRelease        |
| verifyReleaseResources ở một thư | định module nên chạy cả thư viện   | :app:bundleRelease (script đã    |
| viện                             |                                    | làm)                             |
+----------------------------------+------------------------------------+----------------------------------+
| Android build xong vẫn mang địa  | Gradle không coi biến môi trường   | Script dùng --rerun cho bước     |
| chỉ web cũ                       | là đầu vào nên dùng lại bundle JS  | createBundleReleaseJsAndAssets.  |
|                                  | cũ                                 | Tự chạy gradle thì thêm --rerun  |
+----------------------------------+------------------------------------+----------------------------------+
| Sidebar web hiện "Ứng dụng (0)"  | Server web đang chạy bản cũ, chưa  | Dừng rồi chạy lại npm run mobile |
|                                  | có /api/apps                       |                                  |
+----------------------------------+------------------------------------+----------------------------------+
| Google Play từ chối .aab         | File ký bằng khóa debug            | Đặt ELECTROGO_KEYSTORE và các    |
|                                  |                                    | biến đi kèm, tạo khóa bằng       |
|                                  |                                    | keytool (lệnh ở đầu              |
|                                  |                                    | scripts/build-android.sh)        |
+----------------------------------+------------------------------------+----------------------------------+
| .ipa không cài được lên máy      | Chữ ký development chỉ cài lên máy | Đăng ký UDID trên Apple          |
|                                  | đã đăng ký UDID trong provisioning | Developer, hoặc dùng ad-hoc,     |
|                                  | profile                            | app-store-connect                |
+----------------------------------+------------------------------------+----------------------------------+
```

## Ghi chú cho người sửa file này

Đọc trước README.md, mục "Quy ước khi sửa tài liệu skill". Riêng file này:

- Biến môi trường, tên script, đường dẫn phải đối chiếu scripts/build-android.sh, scripts/build-ios.sh, scripts/deploy-url.sh, src/app/deploy.ts và rspack.config.mjs. API đối chiếu server/apps.js, server/packages.js, server/bundles.js của web-deployment-apk.
- Web phân phối nằm ngoài repo ElectroGo (/Users/ngannguyenbao/web-deployment-apk). Đổi API hoặc cách lưu dữ liệu ở đó thì sửa mục "Web phân phối" và bảng API.
- Lý do thiết kế và các lỗi đã gặp giải thích sâu ở giai-thich-chi-tiet.md, mục 13A. Ở đây chỉ ghi cách làm và cách sửa lỗi.
- Địa chỉ web trong app là địa chỉ LAN; chưa có https, chưa có đăng nhập cho web, chưa ký bundle. Ghi vào "Câu hỏi còn mở" của electrogo-superapp, không ghi như đã hoàn thiện.
