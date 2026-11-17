# Giải thích chi tiết ElectroGo Super App (tài liệu ôn phỏng vấn)

```
+-------------------+--------------------------------------------------------------------------------------+
| TÓM TẮT           | giai-thich-chi-tiet.md                                                               |
+===================+======================================================================================+
| Dành cho          | Người cần hiểu sâu và giải thích được dự án ElectroGo, và ôn kiến thức React Native  |
|                   | chung cho phỏng vấn                                                                  |
+-------------------+--------------------------------------------------------------------------------------+
| Khác gì SKILL.md  | SKILL.md là tài liệu làm việc (setup, quy tắc). File này giải thích vì sao, hoạt     |
|                   | động thế nào, kèm câu hỏi phỏng vấn và gợi ý trả lời                                 |
+-------------------+--------------------------------------------------------------------------------------+
| Gồm hai phần      | Phần I (mục 1 đến 13): dự án ElectroGo. Phần II (mục 14 đến 27): kiến thức React     |
|                   | Native chung, đã sửa từ ghi chú cá nhân                                              |
+-------------------+--------------------------------------------------------------------------------------+
| Cách đọc          | Hỏi về dự án: mục 1, 3, 4, 7, 9, 10. Hỏi về React Native chung: đọc mục 14 trước,    |
|                   | rồi theo chủ đề trong mục lục                                                        |
+-------------------+--------------------------------------------------------------------------------------+
| Tìm nhanh một mục | Cmd+Shift+O rồi gõ số mục hoặc tên mục                                               |
+-------------------+--------------------------------------------------------------------------------------+
| Nguồn             | Phần I lấy code thật từ repo. Phần II từ ghi chú của bạn, đã bỏ trùng lặp và sửa lỗi |
+-------------------+--------------------------------------------------------------------------------------+
```

## Mục lục

```
+------+------------+------------------------------------------------------------------------+
| Phần | Mục        | Nội dung                                                               |
+======+============+========================================================================+
| I    | 1          | Câu trả lời ngắn: 30 giây và 2 phút                                    |
+------+------------+------------------------------------------------------------------------+
| I    | 2          | Kiến thức nền: Metro, Re.Pack, Module Federation, singleton, submodule |
+------+------------+------------------------------------------------------------------------+
| I    | 3          | Bức tranh tổng thể (sơ đồ dev và production)                           |
+------+------------+------------------------------------------------------------------------+
| I    | 4          | 8 bước từ lúc bấm một ô đến lúc thoát                                  |
+------+------------+------------------------------------------------------------------------+
| I    | 5          | Cấu hình Rspack của host và remote                                     |
+------+------------+------------------------------------------------------------------------+
| I    | 6          | Bên trong một mini app                                                 |
+------+------------+------------------------------------------------------------------------+
| I    | 7          | Quyết định thiết kế và đánh đổi                                        |
+------+------------+------------------------------------------------------------------------+
| I    | 8          | Lỗi thật đã gặp                                                        |
+------+------------+------------------------------------------------------------------------+
| I    | 9          | Điểm yếu thật và hướng cải tiến                                        |
+------+------------+------------------------------------------------------------------------+
| I    | 10         | Câu hỏi phỏng vấn về dự án                                             |
+------+------------+------------------------------------------------------------------------+
| I    | 11, 12, 13 | Thuật ngữ, các con số, cách vẽ sơ đồ                                   |
+------+------------+------------------------------------------------------------------------+
| II   | 14         | Bảng sửa nhanh: ghi chú gốc cần chỉnh                                  |
+------+------------+------------------------------------------------------------------------+
| II   | 15         | React cơ bản: lifecycle, hooks, useEffect, memo                        |
+------+------------+------------------------------------------------------------------------+
| II   | 16         | React Native bên trong: Bridge, JSI, Fabric, Hermes                    |
+------+------------+------------------------------------------------------------------------+
| II   | 17         | Hiệu năng, danh sách, memory leak                                      |
+------+------------+------------------------------------------------------------------------+
| II   | 18         | Quản lý state: Redux, Thunk, Saga, Zustand                             |
+------+------------+------------------------------------------------------------------------+
| II   | 19         | Mạng và xác thực: token, refresh token                                 |
+------+------------+------------------------------------------------------------------------+
| II   | 20         | Bảo mật, OWASP Mobile Top 10                                           |
+------+------------+------------------------------------------------------------------------+
| II   | 21         | Điều hướng, deep link, push notification                               |
+------+------------+------------------------------------------------------------------------+
| II   | 22         | Lưu trữ dữ liệu và offline                                             |
+------+------------+------------------------------------------------------------------------+
| II   | 23         | CI/CD, OTA, rollback, zero downtime                                    |
+------+------------+------------------------------------------------------------------------+
| II   | 24         | Kiến trúc và super app                                                 |
+------+------------+------------------------------------------------------------------------+
| II   | 25         | Thư viện thường gặp                                                    |
+------+------------+------------------------------------------------------------------------+
| II   | 26         | Câu hỏi hành vi, STAR                                                  |
+------+------------+------------------------------------------------------------------------+
| II   | 27         | Ôn nhanh: hỏi một câu, đáp một câu                                     |
+------+------------+------------------------------------------------------------------------+
```

# PHẦN I. DỰ ÁN ELECTROGO (mục 1 đến 13)

## 1. Câu trả lời ngắn: nói được trong 30 giây và 2 phút

Bản 30 giây (khi được hỏi "dự án của bạn là gì"):

  ElectroGo là một super app viết bằng React Native. Có một app chủ (gọi là host) và các
  mini app như Chấm công, Bán hàng. Mini app không nằm sẵn trong app chủ. Mỗi mini app là
  một dự án riêng, chạy như một server riêng, và chỉ được tải về lúc người dùng bấm vào ô
  trên màn hình Home. Mình dùng Re.Pack kết hợp Module Federation để làm việc đó. Nhờ vậy
  khi sửa một mini app, chỉ cần đưa file mới lên server, không phải phát hành lại app trên
  store.

Bản 2 phút (khi được hỏi sâu hơn), nói thêm theo thứ tự:

1. Vấn đề cần giải: nhiều nhóm làm nhiều chức năng khác nhau nhưng người dùng chỉ muốn một
   app. Nếu gộp hết mã vào một app thì mọi thay đổi nhỏ đều phải build và phát hành lại.
2. Cách giải: tách mỗi chức năng thành một mini app, app chủ chỉ giữ địa chỉ của chúng.
3. Công nghệ: Re.Pack (Rspack, thay cho Metro) và Module Federation v2.
4. Điểm tinh tế: React, React Native và safe-area-context phải dùng chung một bản
   (singleton), nếu không sẽ lỗi hook.
5. Độ bền: nếu server mini app tắt hoặc mini app crash, app chủ vẫn sống và hiện màn hình
   báo lỗi có nút Thử lại, không sập cả app.
6. Hiện trạng thật: dữ liệu đang là mock, đã có cờ useMock để chuyển sang API thật.

Cách nói trung thực: đây là dự án có kiến trúc thật nhưng dữ liệu còn mock. Nên nói rõ
"phần kiến trúc nạp động là phần mình tập trung", đừng nói như hệ thống đã chạy production.

## 2. Kiến thức nền (đọc nếu chưa chắc)

### 2.1 Super app và mini app

Super app là một app lớn chứa nhiều dịch vụ nhỏ bên trong (ví dụ Grab, MoMo, Zalo). Mỗi
dịch vụ nhỏ là một mini app. Người dùng cài một app duy nhất, nhưng dùng được nhiều dịch vụ.

Trong ElectroGo:
- Host: app React Native thật, có thư mục ios/ và android/. Chứa màn Home, thanh tab, và
  phần "khung chứa" mini app.
- Mini app: chỉ có code JS/TS, không có ios/ hay android/. Hiện có hai: Chấm công
  (electro-go-work) và Bán hàng (electro-go-sale).

Vì sao tách: mỗi mini app có thể do một nhóm khác làm, có repo riêng, có thể cập nhật độc
lập mà không phải phát hành lại app host.

### 2.2 Bundle và bundler

Code React Native viết bằng nhiều file TypeScript. Trước khi chạy trên máy, một bundler
gom chúng lại thành một hoặc vài file JavaScript gọi là bundle. App trên máy tải bundle này
và chạy bằng engine JavaScript (Hermes).

Bundler làm các việc: đọc file, biên dịch TypeScript/JSX, nối các import lại, tách thành
các phần (chunk) nếu cần, rồi xuất ra file.

### 2.3 Metro và vì sao không dùng

Metro là bundler mặc định của React Native. Nó tạo ra một bundle tự chứa (self-contained), rất
tốt cho một app đóng gói thành một khối. Nhưng Metro không có cơ chế kiểu Module Federation để
chia sẻ module giữa nhiều bundle và nạp bundle khác từ server lúc chạy. Đó chính là thứ super
app cần, nên dự án chuyển sang Re.Pack.

Lưu ý để nói cho đúng: đây là nhận định tổng hợp từ tài liệu và bài viết của Callstack, Theodo,
không phải tuyên bố chính thức của Metro. Re.Pack cũng không phải lựa chọn mặc định: tài liệu
Re.Pack khuyên người mới cứ dùng Metro, chỉ chuyển khi thật sự cần code splitting hoặc Module
Federation. Chuyển khỏi Metro nghĩa là đi lệch khỏi cách làm mặc định của React Native, đó là
một cái giá cần nêu khi phỏng vấn.

metro.config.js vẫn còn trong repo nhưng chỉ ở dạng mặc định, không còn dùng để chạy.

### 2.4 Rspack và Re.Pack

- Rspack: bundler viết bằng Rust, tương thích cách cấu hình của webpack, build nhanh.
- Re.Pack: bộ công cụ của Callstack, cho phép dùng Rspack (hoặc webpack) làm bundler cho
  React Native thay Metro. Nó cung cấp lệnh react-native start / bundle chạy bằng Rspack,
  và ScriptManager để tải script từ xa lúc chạy.

Bộ phiên bản đang dùng: Re.Pack 5.4.3, Rspack 1.7.12 (khóa ở ^1.x), @module-federation/enhanced
2.9.3. Re.Pack 5.4.3 khai báo peerDependency @rspack/core >=1 nên không cấm Rspack 2.x. Dự án giữ
1.x như lựa chọn thận trọng và chưa kiểm chứng 2.x chạy được (Rspack 2.0 đã phát hành).

### 2.5 Module Federation (MF)

Module Federation là cơ chế cho phép một ứng dụng (host) nạp mã từ một ứng dụng khác
(remote) vào lúc chạy, mà hai bên build tách biệt nhau.

Các từ cần nhớ:

```
+--------------------------+---------------------------------------+---------------------------------------+
| Từ                       | Nghĩa                                 | Trong ElectroGo                       |
+==========================+=======================================+=======================================+
| Host                     | Bên nạp mã của người khác             | App ElectroGo chính                   |
+--------------------------+---------------------------------------+---------------------------------------+
| Remote                   | Bên được nạp                          | Mini app work, sale                   |
+--------------------------+---------------------------------------+---------------------------------------+
| Expose                   | Remote công khai một module cho host  | './App' trỏ tới src/index.tsx         |
|                          | dùng                                  |                                       |
+--------------------------+---------------------------------------+---------------------------------------+
| Remote Entry (container) | File JS cổng vào của remote, host tải | work.container.js.bundle              |
|                          | file này đầu tiên                     |                                       |
+--------------------------+---------------------------------------+---------------------------------------+
| Manifest                 | File JSON mô tả remote: tên, expose   | mf-manifest.json                      |
|                          | gì, chunk nào                         |                                       |
+--------------------------+---------------------------------------+---------------------------------------+
| Shared                   | Thư viện hai bên dùng chung           | react, react-native,                  |
|                          |                                       | safe-area-context                     |
+--------------------------+---------------------------------------+---------------------------------------+
| Chunk                    | Một phần nhỏ của bundle, tải khi cần  | __federation_expose_App               |
+--------------------------+---------------------------------------+---------------------------------------+
```

Hình dung dễ nhớ: host là một tòa nhà, mỗi mini app là một cửa hàng có kho riêng ở nơi
khác. Tòa nhà chỉ có địa chỉ cửa hàng (manifest). Khi khách bấm vào, tòa nhà mới gọi
cửa hàng chuyển hàng tới. Điện, nước (React, React Native) dùng chung của tòa nhà, cửa
hàng không tự kéo đường điện riêng.

### 2.6 Singleton, eager, import: false

Ba thư viện (react, react-native, react-native-safe-area-context) phải chỉ có một bản
trong toàn app. Cấu hình:

  Host:   {singleton: true, eager: true,  requiredVersion: <phiên bản trong package.json>}
  Remote: {singleton: true, eager: false, requiredVersion: '*', import: false}

- singleton: true: chỉ cho phép một bản chạy. Nếu có hai bản React thì hook sẽ lỗi
  (thông báo thường gặp: Invalid hook call), vì hook nhớ trạng thái theo bản React đang
  vẽ, hai bản React không chia sẻ trạng thái.
- eager: true ở host: nạp thư viện ngay trong bundle chính. Host chạy index.js đồng bộ lúc
  khởi động, không có ranh giới bất đồng bộ nên phải có sẵn các thư viện này.
- import: false ở remote: remote không đóng gói bản dự phòng của thư viện, luôn dùng bản
  của host. Bundle của mini app nhẹ hơn nhiều và không thể vô tình có bản thứ hai.
- Cái giá: mini app phụ thuộc vào việc host cung cấp đúng phiên bản. Xem mục 9.

### 2.7 Git submodule và pnpm hoisted

- Git submodule: repo A (host) trỏ tới một commit cụ thể của repo B (mini app). Thư mục
  packages/electro-go-work là một repo riêng nằm trong repo host. Host chỉ nhớ commit nào.
  Quy tắc: push repo con trước, commit con trỏ ở host sau (chi tiết ở skill sync-submodules).
- pnpm node-linker=hoisted: mặc định pnpm dùng symlink, các package ở packages/ khó tìm
  thư viện cài ở gốc. Hoisted đưa thư viện lên node_modules gốc như npm, nên các công cụ
  (Re.Pack, Rspack) tìm được.

## 3. Bức tranh tổng thể

Lúc phát triển (dev), có 3 server chạy song song và một app trên máy ảo:

```
  Máy tính của lập trình viên                           Máy ảo / điện thoại
  +--------------------------------+                    +----------------------------------+
  | Server host      cổng 8081     | --index.bundle->   | App ElectroGo (host)             |
  +--------------------------------+                    | Home, RootNavigator              |
  | Server work      cổng 9001     | <--manifest-----   | remotes.ts (nạp mini app)        |
  | Server sale      cổng 9002     |    container,      | React, React Native dùng         |
  +--------------------------------+    chunk           | chung cho mọi mini app           |
                                                        +----------------------------------+
```

Lúc production, bỏ 2 server mini app, thay bằng file tĩnh trên CDN:

```
  Host (đã lên store)  ---- WORK_REMOTE_URL ---->  CDN: work/ios/mf-manifest.json
                       ---- SALE_REMOTE_URL ---->  CDN: sale/ios/mf-manifest.json
  Cập nhật mini app = đưa file mới lên CDN. Không phải phát hành lại host.
```

Ai biết gì về ai:

```
+----------+--------------------------------------------------+--------------------------------------------+
| Bên      | Biết                                             | Không biết                                 |
+==========+==================================================+============================================+
| Host     | Địa chỉ manifest của mini app, tên module        | Mã nguồn, cấu trúc bên trong mini app      |
|          | './App'                                          |                                            |
+----------+--------------------------------------------------+--------------------------------------------+
| Mini app | Mình expose component gốc nào                    | Host là ai, mini app khác có tồn tại không |
+----------+--------------------------------------------------+--------------------------------------------+
```

Vì thế host không có @electrogo/work trong dependencies. Host chỉ có một dòng khai báo
kiểu (declare module 'work/App') để TypeScript hiểu import('work/App').

## 4. Đi qua từng bước khi người dùng bấm một ô

Giả sử người dùng bấm ô "Phiếu lương" trên Home.

### Bước 1. Home báo cho RootNavigator

src/features/home/data/miniApps.ts có 8 dòng, mỗi dòng là một ô. Dòng Phiếu lương:

```
  {key: 'work-payslip', app: 'work', screen: 'payslip', label: 'Phiếu lương', icon: 'cash-outline'}
```

- app: 'work' cho biết mini app nào cần nạp.
- screen: 'payslip' cho biết mở thẳng màn hình nào (xem bước 7).

HomeScreen gọi onOpenMiniApp(item). RootNavigator giữ state miniApp bằng useState. Khi
state khác null thì không vẽ Home nữa mà vẽ MiniAppHost chiếm toàn màn hình.

Vì sao dùng state thay vì react-navigation: hiện chỉ có hai trạng thái (Home hoặc một
mini app), state đơn giản là đủ. Trong code có ghi chú: khi cần nhiều màn thì thay bằng
react-navigation.

### Bước 2. MiniAppHost bắt đầu tải

MiniAppHost (src/app/RootNavigator.tsx) tự quản lý một máy trạng thái có 3 trạng thái:

```
  loading ──(tải xong)──> ready  (hiện mini app)
     │                        
     └──(tải lỗi)────────> error  (màn trắng, nút Thử lại / Đóng)
  error ──(bấm Thử lại)──> loading
```

Kiểu dữ liệu trong code:

```
  type LoadState =
    | {status: 'loading'}
    | {status: 'ready'; Component: ComponentType<MiniAppProps>}
    | {status: 'error'; message: string};
```

Việc tải chạy trong useEffect với hai điểm đáng nói:

1. Cờ cancelled: nếu người dùng bấm Đóng giữa chừng, component bị gỡ, kết quả về sau
   không được gọi setState nữa (tránh cập nhật state trên component đã gỡ).
2. MIN_LOADING_MS = 900: màn loading hiện tối thiểu 0,9 giây, kể cả khi kết quả về ngay.
   Code dùng Promise.all([result, minWait]). Lý do: khi lỗi về tức thì, nếu không giữ lại
   thì màn hình chớp nhoáng và người dùng không biết app vừa thử lại.

### Bước 3. loadMiniApp gọi bảng LOADERS

src/app/remotes.ts có bảng LOADERS: mỗi khóa mini app ứng với một hàm import động.

```
  const LOADERS = {
    work: async () => { await ensureReachable('work'); return import('work/App'); },
    sale: async () => { await ensureReachable('sale'); return import('sale/App'); },
  };
```

import('work/App') trông như import thường nhưng thực ra do Module Federation xử lý. Rspack
nhìn thấy 'work' là một remote đã khai báo nên không tìm file trong dự án mà sinh code tải
từ xa.

### Bước 4. ensureReachable: kiểm tra trước khi nạp

Hàm này gọi fetch tới địa chỉ mf-manifest.json với giới hạn 4 giây (AbortController).
Nếu lỗi thì ném Error("Không kết nối được tới mini app (...)").

Vì sao cần: nếu để Module Federation tự tải mà server tắt, runtime của nó ném lỗi nội bộ,
và ở chế độ dev React Native hiện màn đỏ (LogBox) rất khó coi. Kiểm tra trước giúp báo lỗi
gọn, nhanh, và lỗi trở thành một Promise bị từ chối bình thường để MiniAppHost bắt được.

Địa chỉ manifest lấy từ biến __REMOTE_MANIFESTS__, do DefinePlugin trong
rspack.config.mjs chèn lúc build. Nếu biến không tồn tại (server dev còn chạy cấu hình cũ)
thì bỏ qua bước kiểm tra thay vì làm sập app.

### Bước 5. Module Federation tải mini app (các việc bên trong)

```
  1. Đọc mf-manifest.json từ :9001 -> biết remote entry là work.container.js.bundle
  2. Tải work.container.js.bundle (qua ScriptManager của Re.Pack, có phần native)
     -> mini app đăng ký mình là container tên "work"
  3. "Bắt tay" thư viện: host đưa react, react-native của nó cho mini app dùng
  4. Gọi container.get('./App') -> tải chunk __federation_expose_App
     (WorkApp, MiniNavigator, các màn hình, Ionicons...)
  5. Trả về module, export default = WorkApp
```

Điểm mấu chốt để giải thích khi phỏng vấn là bước 3: vì mini app khai báo import: false,
nó không tự mang React theo mà nhận React từ host. Do đó mini app và host chạy cùng một
bản React, hook chạy bình thường.

### Bước 6. Hiển thị mini app

loadMiniApp trả về component, MiniAppHost chuyển sang ready và vẽ:

```
  <MiniAppErrorBoundary name={name} onClose={onClose}>
    <state.Component initialRoute={item.screen} />
  </MiniAppErrorBoundary>
```

Từ đây mini app chạy cùng app, cùng JS runtime, cùng bản React với host. Nó vẽ trực tiếp
lên màn hình, không phải một app khác chạy song song, cũng không phải WebView.

### Bước 7. Mở thẳng đúng màn hình (initialRoute)

Host truyền prop initialRoute = 'payslip'. Trong mini app:

```
  function resolveInitialRoute(initialRoute?: string): Route {
    const isModule = MODULES.some(m => m.key === initialRoute);
    return isModule ? ({name: initialRoute} as Route) : {name: 'hub'};
  }
```

Nếu initialRoute khớp một module hợp lệ thì vào thẳng, ngược lại vào màn trung tâm (hub).
Đây là một dạng deep link nội bộ. Quy ước bắt buộc: screen ở host phải trùng ModuleKey của
mini app, vì hai bên không import của nhau mà chỉ thống nhất bằng chuỗi.

### Bước 8. Thoát

Nút "‹ Trang chủ" của host gọi onClose, setMiniApp(null), React gỡ mini app khỏi cây.

### Ba loại lỗi và ai xử lý

```
+--------------------+---------------------------+----------------------------+----------------------------+
| Loại lỗi           | Khi nào                   | Ai bắt                     | Người dùng thấy            |
+====================+===========================+============================+============================+
| Lỗi tải            | Server mini app tắt, mạng | MiniAppHost (Promise bị từ | MiniAppErrorView: nút Thử  |
|                    | lỗi, manifest sai         | chối)                      | lại, Đóng                  |
+--------------------+---------------------------+----------------------------+----------------------------+
| Lỗi crash lúc chạy | Mini app ném lỗi khi      | MiniAppErrorBoundary của   | MiniAppErrorView, bấm Thử  |
|                    | render                    | host                       | lại thì dựng lại           |
+--------------------+---------------------------+----------------------------+----------------------------+
| Lỗi dữ liệu        | API trả lỗi hoặc hết thời | Mini app (useAsync,        | Màn lỗi của mini app, có   |
|                    | gian                      | StateView)                 | Thử lại                    |
+--------------------+---------------------------+----------------------------+----------------------------+
```

Cả ba lớp độc lập: một mini app hỏng không làm sập host hay mini app khác.

### Vì sao không dùng React.lazy và Suspense

React.lazy kết hợp Suspense là cách quen thuộc để nạp component động. Nhưng với nó, lỗi tải
bị ném ngay lúc render, và ở chế độ dev bật màn đỏ LogBox trước khi Error Boundary kịp xử lý.
Dự án chọn tự quản lý bằng Promise và state, nên lỗi tải luôn đi qua đường có kiểm soát.
Đây là một quyết định thiết kế đáng nói trong phỏng vấn.

## 5. Cấu hình Rspack, giải thích từng phần

### 5.1 Host (rspack.config.mjs ở thư mục gốc)

- REMOTES: bảng mini app. work cổng 9001, sale cổng 9002, mỗi dòng có tên biến môi trường
  (WORK_REMOTE_URL, SALE_REMOTE_URL) để production ghi đè địa chỉ.
- devHost: iOS simulator dùng localhost. Android emulator dùng 10.0.2.2 vì trong emulator,
  localhost là chính emulator, còn 10.0.2.2 là địa chỉ đặc biệt trỏ về máy tính. Có thể ghi
  đè bằng biến REMOTE_HOST (dùng cho điện thoại thật).
- Địa chỉ remote dạng: work@http://localhost:9001/ios/mf-manifest.json. Có thành phần
  platform (ios hoặc android) vì mỗi nền tảng có bundle riêng.
- shared: ba thư viện singleton, eager.
- resolve: Repack.getResolveOptions({enablePackageExports: true}): bắt buộc, vì Module
  Federation 2 đọc trường exports của package. Thiếu thì báo Module not found ở các đường
  dẫn như @module-federation/runtime/helpers.
- DefinePlugin: chèn __REMOTE_MANIFESTS__ để code ensureReachable biết địa chỉ.
- ModuleFederationPluginV2: name 'host', dts: false (không sinh file kiểu), remotes, shared.

### 5.2 Remote (rspack.config.mjs trong mỗi mini app)

- name: 'work'. Phải trùng khóa trong REMOTES của host.
- filename: 'work.container.js.bundle'. Phải khác index.bundle, nếu trùng sẽ báo
  Multiple assets emit different content to the same filename.
- exposes: {'./App': './src/index.tsx'}: công khai component gốc.
- shared: cùng ba thư viện, nhưng eager: false, import: false.
- entry: './dev/index.js': chỉ dùng khi chạy mini app riêng (khung Harness). Host không
  chạy file này.

### 5.3 So sánh host và remote

```
+--------------------+----------------------------+---------------------------------+
| Mục                | Host                       | Remote (mini app)               |
+====================+============================+=================================+
| name               | host                       | work, sale                      |
+--------------------+----------------------------+---------------------------------+
| Khai báo chính     | remotes (địa chỉ mini app) | exposes (công khai ./App)       |
+--------------------+----------------------------+---------------------------------+
| shared eager       | true                       | false                           |
+--------------------+----------------------------+---------------------------------+
| shared import      | mặc định (có bản của mình) | false (dùng bản của host)       |
+--------------------+----------------------------+---------------------------------+
| filename container | không cần                  | work.container.js.bundle        |
+--------------------+----------------------------+---------------------------------+
| entry              | ./index.js (app thật)      | ./dev/index.js (chỉ chạy riêng) |
+--------------------+----------------------------+---------------------------------+
```

### 5.4 Ba lệnh và hai loại server

- pnpm start:dev: chạy server Re.Pack của host, cổng 8081.
- pnpm start:module (trong thư mục mini app): chạy server Re.Pack của mini app. Script
  nhảy lên thư mục gốc host vì react-native.config.js và node_modules nằm ở đó, rồi chạy
  react-native start --port <cổng> --config <rspack.config.mjs của mini app>.
- pnpm build (trong thư mục mini app): đóng gói bundle production cho cả iOS và Android
  thành file .tar để đưa lên CDN.

## 6. Bên trong một mini app

### 6.1 Luồng dữ liệu một chiều

```
  Screen  ->  Hook (useAsync)  ->  Service  ->  mock  hoặc  http
```

- Screen chỉ lo giao diện, không biết dữ liệu từ đâu.
- Hook (ví dụ useHistory) gói lại logic và trạng thái.
- Service là nơi duy nhất biết dữ liệu đến từ mock hay API. Ví dụ attendanceService.ts:

```
  const all = config.useMock
    ? await delay(MOCK_HISTORY)
    : await http.get<AttendanceRecord[]>('/attendance/history');
```

Lợi ích: đổi từ mock sang API thật chỉ cần đổi config.useMock = false và viết đúng endpoint,
không sửa màn hình. Cũng dễ test từng tầng.

### 6.2 useAsync

Hook chạy một hàm bất đồng bộ và theo dõi 3 trạng thái: loading, ready, error. Có hàm
reload để thử lại (tăng biến tick làm effect chạy lại). Cũng có cờ cancelled để không cập
nhật state sau khi component đã gỡ. Mọi màn hình xử lý đủ ba trạng thái qua useAsync cộng
StateView.

### 6.3 httpClient

- Dùng fetch bọc AbortController: quá config.timeoutMs (10 giây) thì hủy yêu cầu.
- Mọi lỗi quy về một kiểu ApiError(status, message): status 0 nghĩa là lỗi mạng hoặc hết
  thời gian, còn lại là mã HTTP.
- finally clearTimeout để không rò timer.

### 6.4 Điều hướng tự viết: useStack

Mini app không dùng react-navigation. useStack giữ một mảng route, có push, pop, canGoBack.
Nó cũng đăng ký BackHandler để nút Back của Android quay về màn trước, và nhường lại cho
host khi ngăn xếp chỉ còn một màn. MiniNavigator dùng switch trên current.name để chọn
màn hình.

Vì sao: mini app là JS thuần, càng ít phụ thuộc càng tốt. react-navigation có phần native,
mà thư viện native chỉ được cài ở host. Một ngăn xếp đơn giản đủ cho nhu cầu hiện tại.

### 6.5 ErrorBoundary riêng của mini app

WorkApp bọc nội dung bằng ErrorBoundary của chính nó. Lỗi render trong mini app thường
được bắt ở đây trước. MiniAppErrorBoundary của host là lớp bảo vệ thứ hai.

### 6.6 Chạy riêng bằng Harness

dev/Harness.tsx thay vai trò của host: cấp SafeAreaProvider và StatusBar rồi render
WorkApp. Nhờ đó có thể phát triển mini app độc lập, không cần chạy cả host.

### 6.7 Cấu trúc thư mục chuẩn của mini app

```
  src/
    index.tsx      export default component gốc + manifest
    manifest.ts    id, name, icon, version
    app/           WorkApp.tsx, navigation/MiniNavigator.tsx
    features/      attendance, schedule, leave, payslip, hub ...
    services/api/  httpClient.ts, ApiError.ts
    config/env.ts  apiBaseUrl, timeoutMs, useMock
    assets/        images, icons
    shared/        theme, components, hooks, navigation, utils
```

Mỗi feature có khung: types, data, services, hooks, screens, components, index.ts. Feature
chỉ import feature khác qua index.ts (cổng công khai).

## 7. Quyết định thiết kế và đánh đổi

```
+----------------------------------+-----------------------------------+-----------------------------------+
| Quyết định                       | Vì sao chọn                       | Cái giá phải trả                  |
+==================================+===================================+===================================+
| Re.Pack thay Metro               | Nạp mini app từ xa lúc chạy, cập  | Cấu hình phức tạp hơn, phải theo  |
|                                  | nhật không cần phát hành lại host | dõi tương thích phiên bản         |
|                                  |                                   | Re.Pack, Rspack, React Native     |
+----------------------------------+-----------------------------------+-----------------------------------+
| Module Federation thay vì import | Host và mini app build và phát    | Hai bên phải thống nhất phiên bản |
| trực tiếp                        | hành độc lập                      | thư viện dùng chung, lỗi chỉ lộ   |
|                                  |                                   | lúc chạy                          |
+----------------------------------+-----------------------------------+-----------------------------------+
| Mỗi mini app một repo            | Nhóm khác nhau làm độc lập, quyền | Quy trình git phức tạp hơn: phải  |
| (submodule)                      | truy cập riêng                    | push repo con trước, rồi commit   |
|                                  |                                   | con trỏ ở host                    |
+----------------------------------+-----------------------------------+-----------------------------------+
| Thư viện native chỉ cài ở host   | Mini app không có ios/ android/,  | Mini app cần thư viện native mới  |
|                                  | chỉ là JS                         | thì phải phát hành lại host       |
+----------------------------------+-----------------------------------+-----------------------------------+
| Điều hướng tự viết (useStack)    | Không thêm phụ thuộc native, nhẹ  | Không có animation chuyển màn,    |
|                                  |                                   | deep link phức tạp phải tự làm    |
+----------------------------------+-----------------------------------+-----------------------------------+
| Kiểm tra manifest trước khi nạp  | Báo lỗi gọn, tránh màn đỏ         | Thêm một request, thêm một chỗ có |
|                                  |                                   | thể sai                           |
+----------------------------------+-----------------------------------+-----------------------------------+
| Tự quản lý state thay vì         | Lỗi tải đi qua đường có kiểm soát | Tự viết nhiều code hơn            |
| Suspense                         |                                   |                                   |
+----------------------------------+-----------------------------------+-----------------------------------+
| Cờ useMock                       | Phát triển giao diện không chờ    | Có nguy cơ quên tắt khi lên       |
|                                  | backend                           | production                        |
+----------------------------------+-----------------------------------+-----------------------------------+
| Singleton cho react,             | Tránh hai bản React gây lỗi hook  | Mini app phụ thuộc phiên bản mà   |
| react-native                     |                                   | host cung cấp                     |
+----------------------------------+-----------------------------------+-----------------------------------+
```

## 8. Lỗi thật đã gặp và cách xử lý

Đây là phần rất có giá trị khi phỏng vấn: kể một lỗi thật, nguyên nhân, cách sửa.

```
+--------------------------------------------+-------------------------+-----------------------------------+
| Triệu chứng                                | Nguyên nhân             | Cách sửa                          |
+============================================+=========================+===================================+
| Module not found ở                         | Module Federation 2 đọc | Thêm enablePackageExports: true   |
| @module-federation/runtime/helpers         | trường exports của      | vào Repack.getResolveOptions      |
|                                            | package, mà Rspack mặc  |                                   |
|                                            | định không đọc          |                                   |
+--------------------------------------------+-------------------------+-----------------------------------+
| Multiple assets emit different content to  | Container của remote    | Đặt filename riêng:               |
| the same filename                          | trùng tên với file      | work.container.js.bundle          |
|                                            | entry index.bundle      |                                   |
+--------------------------------------------+-------------------------+-----------------------------------+
| Màn đỏ LogBox khi server mini app tắt      | Runtime Module          | Kiểm tra manifest trước           |
|                                            | Federation ném lỗi nội  | (ensureReachable) và dùng Promise |
|                                            | bộ lúc render           | cộng state thay Suspense          |
+--------------------------------------------+-------------------------+-----------------------------------+
| Android emulator không tải được mini app   | Trong emulator,         | Dùng 10.0.2.2, hoặc REMOTE_HOST   |
|                                            | localhost là chính      | cho điện thoại thật               |
|                                            | emulator                |                                   |
+--------------------------------------------+-------------------------+-----------------------------------+
| Sửa rspack.config.mjs mà không có tác dụng | DefinePlugin chèn biến  | Khởi động lại pnpm start:dev      |
|                                            | lúc build, server cũ    |                                   |
|                                            | vẫn dùng cấu hình cũ    |                                   |
+--------------------------------------------+-------------------------+-----------------------------------+
| Cổng 8081 bị chiếm                         | Metro cũ vẫn đang chạy  | Dừng Metro cũ rồi chạy lại        |
+--------------------------------------------+-------------------------+-----------------------------------+
| Package ở packages/ không tìm thấy thư     | pnpm mặc định dùng      | .npmrc đặt node-linker=hoisted    |
| viện                                       | symlink                 |                                   |
+--------------------------------------------+-------------------------+-----------------------------------+
| packages/ rỗng sau khi clone               | Submodule chưa được tải | git submodule update --init       |
|                                            |                         | --recursive                       |
+--------------------------------------------+-------------------------+-----------------------------------+
| Không rõ nên dùng Rspack 1.x hay 2.x       | Re.Pack 5.4.3 khai báo  | Khóa Rspack ở ^1.x (đang dùng     |
|                                            | peerDependency          | 1.7.12) cho tới khi kiểm chứng    |
|                                            | @rspack/core >=1 nên    | 2.x                               |
|                                            | không cấm 2.x, nhưng dự |                                   |
|                                            | án chưa kiểm chứng 2.x  |                                   |
|                                            | chạy được               |                                   |
+--------------------------------------------+-------------------------+-----------------------------------+
```

## 9. Điểm yếu thật và hướng cải tiến

Người phỏng vấn thường hỏi "có gì chưa tốt, nếu làm lại thì sao". Trả lời thẳng các điểm
sau, kèm hướng xử lý, sẽ ghi điểm hơn là nói mọi thứ đều ổn.

```
+----------------------------------+-----------------------------------+-----------------------------------+
| Điểm yếu                         | Vì sao là vấn đề                  | Hướng cải tiến                    |
+==================================+===================================+===================================+
| Lệch phiên bản giữa host và mini | Mini app build với một React khác | Ghi phiên bản host cần trong      |
| app                              | host có thể lỗi lúc chạy, không   | manifest, host kiểm tra tương     |
|                                  | phát hiện lúc build               | thích trước khi nạp; có bản host  |
|                                  |                                   | tối thiểu cho mỗi mini app        |
+----------------------------------+-----------------------------------+-----------------------------------+
| Chưa ký bundle (code signing)    | Host chạy mã tải từ mạng, nếu     | Dùng code signing của Re.Pack,    |
|                                  | server bị chiếm thì chạy mã lạ    | chỉ tin domain nằm trong danh     |
|                                  |                                   | sách cho phép, bắt buộc HTTPS     |
+----------------------------------+-----------------------------------+-----------------------------------+
| Chưa có đăng nhập và API dùng    | Mỗi mini app tự lo, người dùng    | Host giữ phiên đăng nhập và       |
| chung                            | phải đăng nhập nhiều lần          | truyền token qua props hoặc       |
|                                  |                                   | package shared                    |
+----------------------------------+-----------------------------------+-----------------------------------+
| Theme bị sao chép vào từng mini  | Đổi theme ở host phải sửa nhiều   | Tách package shared chung (design |
| app                              | nơi                               | tokens, component)                |
+----------------------------------+-----------------------------------+-----------------------------------+
| Chưa có bộ nhớ đệm, mỗi lần mở   | Mở chậm khi mạng yếu, không dùng  | Cache bundle theo phiên bản, tải  |
| đều tải                          | được khi offline                  | trước (prefetch) mini app hay     |
|                                  |                                   | dùng                              |
+----------------------------------+-----------------------------------+-----------------------------------+
| Không có rollback                | Đưa bản hỏng lên CDN thì mọi      | Lưu bản cũ trên CDN, manifest trỏ |
|                                  | người dùng dính ngay              | tới phiên bản, quay lại bằng cách |
|                                  |                                   | đổi con trỏ                       |
+----------------------------------+-----------------------------------+-----------------------------------+
| Dữ liệu vẫn là mock              | Chưa kiểm chứng với API thật      | Nối API thật, giữ cờ useMock cho  |
|                                  |                                   | môi trường dev                    |
+----------------------------------+-----------------------------------+-----------------------------------+
| Test mới ở mức tối thiểu         | Luồng nạp động chưa được kiểm thử | Viết test cho MiniAppHost (3      |
|                                  | tự động                           | trạng thái) bằng cách mock        |
|                                  |                                   | loadMiniApp                       |
+----------------------------------+-----------------------------------+-----------------------------------+
| Điều hướng tự viết               | Khó mở rộng khi nhiều màn hình,   | Chuyển sang react-navigation khi  |
|                                  | không có animation                | cần (cài ở host, mini app dùng    |
|                                  |                                   | chung)                            |
+----------------------------------+-----------------------------------+-----------------------------------+
| Chưa xác định nơi đặt bundle     | Chưa có URL thật cho              | Chọn CDN, quy trình CI build rồi  |
| production                       | WORK_REMOTE_URL                   | tải lên                           |
+----------------------------------+-----------------------------------+-----------------------------------+
```

Lưu ý về chính sách: tải và chạy mã từ xa trong app di động cần được kiểm tra với quy định
của App Store và Google Play (ví dụ quy định về tải mã thực thi). Nên đọc kỹ quy định hiện
hành trước khi phát hành, không nên khẳng định chắc chắn trong phỏng vấn nếu chưa kiểm tra.

## 10. Câu hỏi phỏng vấn và gợi ý trả lời

Cách luyện: che phần trả lời, tự nói thành tiếng, rồi so với gợi ý. Gợi ý viết ngắn, nói
bằng lời của bạn.

### Nhóm A. Khái niệm

A1. Super app là gì? Khác gì app thường?
  App thường là một khối: mọi chức năng build chung, phát hành chung. Super app có một khung
  chủ và nhiều mini app. Mỗi mini app có thể phát triển, cập nhật riêng. Người dùng thấy một
  app nhưng dùng được nhiều dịch vụ.

A2. Module Federation là gì?
  Cơ chế để một ứng dụng nạp mã của ứng dụng khác lúc chạy, trong khi hai bên build tách
  biệt. Có host nạp, remote được nạp. Remote công khai (expose) một số module, host import
  chúng như import thường nhưng thực chất tải qua mạng.

A3. Vì sao không dùng Metro?
  Metro tạo một bundle tự chứa và không có cơ chế kiểu Module Federation để nạp bundle khác từ
  xa lúc chạy. Re.Pack dùng Rspack, hỗ trợ Module Federation, nên làm được điều này. Cái giá là
  cấu hình phức tạp hơn và đi lệch khỏi cách làm mặc định của React Native.

A4. Re.Pack là gì, khác Rspack thế nào?
  Rspack là bundler tổng quát. Re.Pack là lớp tích hợp để Rspack (hoặc webpack) hiểu React
  Native: transform code RN, xử lý asset, cung cấp lệnh react-native start/bundle, và
  ScriptManager để tải script từ xa.

A5. Singleton shared nghĩa là gì và vì sao cần?
  Là chỉ cho phép một bản của một thư viện trong toàn app. Với React, hai bản gây lỗi hook
  vì trạng thái hook gắn với bản React đang vẽ. Với react-native và safe-area-context, hai
  bản có thể cùng đăng ký một module native hai lần.

A6. Manifest và remote entry khác nhau thế nào?
  Manifest (mf-manifest.json) là JSON mô tả: tên, expose, chunk, thư viện chung. Remote entry
  là file JS cổng vào mà host tải để mini app đăng ký mình. Host chỉ cần biết địa chỉ
  manifest, manifest trỏ tới remote entry.

### Nhóm B. Kiến trúc và luồng

B1. Khi người dùng bấm một ô, chuyện gì xảy ra?
  Trả lời theo mục 4: Home báo RootNavigator, MiniAppHost vào trạng thái loading, loadMiniApp
  kiểm tra manifest rồi import('work/App'), Module Federation tải container và chunk, host
  đưa React cho mini app, component được trả về, MiniAppHost chuyển sang ready và vẽ mini app
  với initialRoute.

B2. Host biết gì về mini app?
  Chỉ biết địa chỉ manifest và tên module expose. Không import mã, không có @electrogo/*
  trong dependencies. Kiểu TypeScript được khai báo thủ công trong remotes.d.ts.

B3. Mini app mở thẳng một màn hình bằng cách nào?
  Host truyền prop initialRoute. MiniNavigator.resolveInitialRoute so với danh sách module
  hợp lệ, khớp thì vào thẳng, không thì vào hub. Hai bên thống nhất bằng chuỗi trùng
  ModuleKey, không import lẫn nhau.

B4. Dữ liệu chảy thế nào trong một mini app?
  Screen gọi hook (useAsync), hook gọi service, service quyết định dùng mock hay http theo
  config.useMock. Màn hình không biết nguồn dữ liệu.

B5. Mini app có dùng thư viện native được không?
  Không tự mang theo được, vì mini app không có ios/ android/. Thư viện native phải cài ở
  host, mini app khai báo peerDependencies. Cần thư viện native mới thì phải phát hành lại host.

B6. Dev và production khác nhau ở đâu?
  Dev: mỗi mini app một server Re.Pack (cổng 9001, 9002), địa chỉ localhost (Android là
  10.0.2.2). Production: file tĩnh trên CDN, địa chỉ lấy từ biến môi trường
  WORK_REMOTE_URL, SALE_REMOTE_URL lúc build host.

### Nhóm C. Xử lý lỗi và độ bền

C1. Nếu server của mini app tắt thì sao?
  ensureReachable thử tải manifest tối đa 4 giây, lỗi thì ném Error. MiniAppHost bắt lỗi,
  chuyển sang trạng thái error, hiện màn trắng báo lỗi có nút Thử lại và Đóng. Host không
  sập.

C2. Nếu mini app crash lúc đang chạy?
  Có hai lớp: ErrorBoundary riêng của mini app và MiniAppErrorBoundary của host. Lỗi hiện
  màn báo lỗi, bấm Thử lại thì dựng lại. Mini app khác không bị ảnh hưởng.

C3. Vì sao không dùng React.lazy và Suspense?
  Lỗi tải bị ném lúc render, ở chế độ dev bật màn đỏ LogBox trước khi Error Boundary xử lý.
  Tự quản lý bằng Promise và state cho lỗi tải đi qua đường có kiểm soát.

C4. Lỗi khó nhất bạn gặp là gì?
  Chọn một lỗi ở mục 8, ví dụ Module not found ở @module-federation/runtime/helpers. Nói
  theo cấu trúc: triệu chứng, bạn nghi ngờ gì, cách xác minh, nguyên nhân thật
  (enablePackageExports), cách sửa.

C5. Vì sao có thời gian loading tối thiểu 900ms?
  Khi lỗi hoặc thành công về gần như tức thì, màn hình chớp nhoáng, người dùng không biết
  app vừa thử lại. Giữ tối thiểu 0,9 giây cho phản hồi rõ ràng.

### Nhóm D. Đánh đổi và nâng cao

D1. Vì sao không làm monorepo import trực tiếp (workspace:*)?
  Đơn giản hơn nhưng mọi mini app phải build và phát hành cùng host. Mục tiêu của dự án là
  các mini app phát hành độc lập, nên chọn Module Federation.

D2. Làm sao đảm bảo mini app tương thích với host?
  Hiện dựa vào singleton shared và requiredVersion. Hướng cải tiến: ghi phiên bản host tối
  thiểu vào manifest, host kiểm tra trước khi nạp, có phiên bản hợp đồng giữa hai bên.

D3. Vấn đề bảo mật khi nạp mã từ mạng?
  Nếu server bị chiếm thì app chạy mã lạ. Cần HTTPS, danh sách domain được phép, và code
  signing của Re.Pack để host chỉ chạy bundle đã ký.

D4. Làm sao cập nhật và rollback mini app?
  Cập nhật: build, đưa file mới lên CDN, không cần phát hành host. Rollback: giữ bản cũ trên
  CDN, manifest hoặc địa chỉ trỏ về bản cũ.

D5. Dùng chung đăng nhập giữa các mini app thế nào?
  Host giữ phiên, truyền token hoặc đối tượng ngữ cảnh qua props (như đang truyền
  initialRoute), hoặc tách package shared dùng chung. Mini app không tự đăng nhập riêng.

D6. Hiệu năng lần mở đầu tiên?
  Lần mở phải tải manifest, container và chunk qua mạng. Cải tiến: cache theo phiên bản,
  tải trước mini app hay dùng, chia chunk hợp lý.

D7. Nếu làm lại, bạn đổi gì?
  Chọn 2 hoặc 3 điểm ở mục 9: package shared cho theme, kiểm tra tương thích phiên bản, test
  cho MiniAppHost.

D8. Test thế nào?
  Mỗi tầng test được riêng: service (mock), hook, màn hình. Với luồng nạp, mock loadMiniApp
  để test 3 trạng thái của MiniAppHost (loading, ready, error). Hiện test mới ở mức tối
  thiểu, đây là chỗ nên bổ sung.

## 11. Bảng thuật ngữ

```
+-------------------------+------------------------------------------------------------+
| Thuật ngữ               | Nghĩa ngắn                                                 |
+=========================+============================================================+
| Host                    | App chủ, nạp mini app                                      |
+-------------------------+------------------------------------------------------------+
| Remote                  | Mini app, được host nạp                                    |
+-------------------------+------------------------------------------------------------+
| Expose                  | Công khai một module để bên kia dùng                       |
+-------------------------+------------------------------------------------------------+
| Container, Remote Entry | File JS cổng vào của remote                                |
+-------------------------+------------------------------------------------------------+
| Manifest                | File JSON mô tả remote                                     |
+-------------------------+------------------------------------------------------------+
| Shared                  | Thư viện dùng chung giữa host và remote                    |
+-------------------------+------------------------------------------------------------+
| Singleton               | Chỉ cho phép một bản trong toàn app                        |
+-------------------------+------------------------------------------------------------+
| Eager                   | Nạp ngay trong bundle chính, không chờ                     |
+-------------------------+------------------------------------------------------------+
| Chunk                   | Một mảnh bundle, tải khi cần                               |
+-------------------------+------------------------------------------------------------+
| Bundle                  | File JS đã gom, app tải về chạy                            |
+-------------------------+------------------------------------------------------------+
| Hermes                  | Engine JS của React Native                                 |
+-------------------------+------------------------------------------------------------+
| ScriptManager           | Phần của Re.Pack tải script từ xa                          |
+-------------------------+------------------------------------------------------------+
| Submodule               | Repo con nằm trong repo cha, cha chỉ nhớ một commit        |
+-------------------------+------------------------------------------------------------+
| Hoisted                 | pnpm đưa thư viện lên node_modules gốc, không dùng symlink |
+-------------------------+------------------------------------------------------------+
| initialRoute            | Prop host truyền để mở thẳng một màn của mini app          |
+-------------------------+------------------------------------------------------------+
| Harness                 | Khung chạy riêng mini app, thay vai host khi dev           |
+-------------------------+------------------------------------------------------------+
| 10.0.2.2                | Địa chỉ trong Android emulator trỏ về máy tính             |
+-------------------------+------------------------------------------------------------+
```

## 12. Các con số cần nhớ

```
+--------------------------------------+-------------------------------------------+
| Mục                                  | Giá trị                                   |
+======================================+===========================================+
| Cổng server host                     | 8081                                      |
+--------------------------------------+-------------------------------------------+
| Cổng mini app work, sale             | 9001, 9002                                |
+--------------------------------------+-------------------------------------------+
| Địa chỉ Android emulator về máy tính | 10.0.2.2                                  |
+--------------------------------------+-------------------------------------------+
| Thời gian chờ kiểm tra manifest      | 4 giây                                    |
+--------------------------------------+-------------------------------------------+
| Thời gian loading tối thiểu          | 900 ms                                    |
+--------------------------------------+-------------------------------------------+
| Thời gian chờ API của mini app       | 10 giây (config.timeoutMs)                |
+--------------------------------------+-------------------------------------------+
| Số ô trên Home                       | 8 (4 của work, 4 của sale)                |
+--------------------------------------+-------------------------------------------+
| React Native, React                  | 0.88.1, 19.3.0                            |
+--------------------------------------+-------------------------------------------+
| Re.Pack, @module-federation/enhanced | 5.4.3, 2.9.3                              |
+--------------------------------------+-------------------------------------------+
| Rspack                               | ^1.7.12 (khóa ở 1.x, chưa kiểm chứng 2.x) |
+--------------------------------------+-------------------------------------------+
| Node                                 | từ 22.11 trở lên                          |
+--------------------------------------+-------------------------------------------+
```

## 13. Cách vẽ trên bảng trong 1 phút

Khi được yêu cầu "vẽ kiến trúc", vẽ theo 4 bước:

1. Vẽ hộp lớn "Host" có Home, RootNavigator, React dùng chung.
2. Vẽ bên cạnh hai hộp nhỏ "work" và "sale", ghi dưới mỗi hộp: cổng 9001, 9002 (dev) hoặc CDN
   (production).
3. Vẽ mũi tên từ Host sang mini app, ghi: "manifest, container, chunk (lúc người dùng bấm)".
4. Vẽ mũi tên ngược lại, ghi: "React, React Native (shared, singleton)". Rồi nói câu chốt:
   "Host chỉ biết địa chỉ, mini app chỉ biết mình expose gì, nên hai bên phát hành độc lập."

# PHẦN II. KIẾN THỨC REACT NATIVE CHUNG (mục 14 đến 27)

Phần này là ghi chú phỏng vấn chung về React Native, được gom từ ghi chú của bạn, bỏ phần
trùng lặp (bộ 30 câu bị chép hai lần), sắp theo chủ đề, và sửa những chỗ chưa đúng. Phần I
nói về dự án ElectroGo, phần II nói về kiến thức nền mà người phỏng vấn hay hỏi.

Quy ước trình bày:
- Mỗi mục bắt đầu bằng ý chính, sau đó là bảng so sánh hoặc ví dụ.
- Câu hỏi viết dạng "Hỏi", câu trả lời gợi ý viết dạng "Đáp" (nói được trong 20 đến 30 giây).
- Chỗ nào liên quan đến dự án ElectroGo thì có dòng "Trong ElectroGo".

## 14. Bảng sửa nhanh: những chỗ ghi chú gốc cần chỉnh

Ghi chú gốc có chỗ trộn kiến thức web với React Native, có chỗ đã lỗi thời. Đọc bảng này
trước, các mục sau đã viết lại cho đúng.

```
+----+----------------------------------------+------------------------------------------------------------+
| #  | Ghi chú gốc                            | Chỉnh lại cho đúng                                         |
+====+========================================+============================================================+
| 1  | Code splitting bằng lazy() và Suspense | Đó là cách của web. React Native gom thành một bundle,     |
|    | giúp giảm bundle size                  | lazy chỉ hoãn việc chạy module chứ không giảm dung lượng   |
|    |                                        | tải. Tách bundle thật cần Re.Pack với Module Federation    |
|    |                                        | (chính là dự án này)                                       |
+----+----------------------------------------+------------------------------------------------------------+
| 2  | Virtualization dùng react-window       | react-window là thư viện của web. React Native dùng        |
|    |                                        | FlatList, SectionList hoặc FlashList                       |
+----+----------------------------------------+------------------------------------------------------------+
| 3  | Nén ảnh WebP, minify JS/CSS, dùng CDN  | Đây là tối ưu web. React Native: dùng Hermes, resize ảnh   |
|    |                                        | từ server, cache ảnh, CDN cho ảnh và bundle OTA            |
+----+----------------------------------------+------------------------------------------------------------+
| 4  | Virtual DOM trong React Native         | React Native không có DOM. React giữ một cây mô tả UI, so  |
|    |                                        | sánh cây cũ và mới (reconciliation), rồi áp thay đổi lên   |
|    |                                        | view native. Với Fabric, cây đó là Shadow Tree viết bằng   |
|    |                                        | C++                                                        |
+----+----------------------------------------+------------------------------------------------------------+
| 5  | Debug bằng Flipper                     | Flipper không còn là công cụ mặc định. Dùng React Native   |
|    |                                        | DevTools (từ RN 0.76) và React DevTools Profiler           |
+----+----------------------------------------+------------------------------------------------------------+
| 6  | Không dùng MD5, dùng RSA, AES          | MD5 là hàm băm (hash), không phải mã hóa. Mật khẩu: băm có |
|    |                                        | salt bằng bcrypt hoặc argon2 ở backend. Dữ liệu cần giải   |
|    |                                        | mã lại: AES. RSA dùng cho trao đổi khóa và chữ ký          |
+----+----------------------------------------+------------------------------------------------------------+
| 7  | OWASP Mobile Top 10 (phiên bản mới)    | Nên nói rõ năm. Bản mới nhất bạn cần biết là bản 2024,     |
|    |                                        | danh sách ở mục 20                                         |
+----+----------------------------------------+------------------------------------------------------------+
| 8  | CodePush cho OTA                       | Microsoft đã ngừng App Center và CodePush (31/03/2025),    |
|    |                                        | kho mã CodePush đã lưu trữ. Có thể dùng Expo EAS Update,   |
|    |                                        | dịch vụ OTA của bên thứ ba, hoặc tự dựng OTA riêng. Bản    |
|    |                                        | CodePush server tự host không còn được hỗ trợ chính thức   |
+----+----------------------------------------+------------------------------------------------------------+
| 9  | Tích hợp Firebase Dynamic Links        | Dịch vụ này đã ngừng hoạt động (25/08/2025). Dùng          |
|    |                                        | Universal Link, App Link, hoặc dịch vụ như Branch,         |
|    |                                        | AppsFlyer                                                  |
+----+----------------------------------------+------------------------------------------------------------+
| 10 | Rollback là deploy lại image cũ        | Đúng cho backend. App mobile đã lên store thì không thu    |
|    |                                        | hồi tức thì được: dùng staged rollout, feature flag,       |
|    |                                        | rollback OTA, bắt buộc cập nhật. Xem mục 23                |
+----+----------------------------------------+------------------------------------------------------------+
| 11 | npx react-native init                  | Lệnh cũ đã bị loại. Dùng npx                               |
|    |                                        | @react-native-community/cli@latest init TênApp             |
+----+----------------------------------------+------------------------------------------------------------+
| 12 | Super app là thư mục apps/home,        | Đó là modular monolith: mọi module build chung một bundle, |
|    | payment, shopping và monorepo          | phát hành chung. Super app tách bundle thật dùng Module    |
|    | Nx/Turborepo                           | Federation, như ElectroGo. Xem mục 24                      |
+----+----------------------------------------+------------------------------------------------------------+
| 13 | Tích hợp AI bằng cách gọi OpenAI,      | Không đặt API key trong app (có thể bị trích xuất). Gọi    |
|    | Claude, Gemini                         | qua backend của bạn, app chỉ nhận kết quả                  |
+----+----------------------------------------+------------------------------------------------------------+
| 14 | Ví dụ STAR có số liệu 500.000 người    | Đó là ví dụ mẫu, không phải của bạn. Chỉ nói số liệu có    |
|    | dùng, 4 giây còn 1,5 giây, tăng 40%    | thật. Nói sai số liệu rồi bị hỏi sâu là mất điểm. Dùng ví  |
|    |                                        | dụ thật ở mục 26                                           |
+----+----------------------------------------+------------------------------------------------------------+
| 15 | SecureStore                            | Là của Expo (expo-secure-store). React Native thuần dùng   |
|    |                                        | react-native-keychain                                      |
+----+----------------------------------------+------------------------------------------------------------+
| 16 | Foreground notification: hệ điều hành  | Gần đúng. Theo tài liệu React Native Firebase, thông báo   |
|    | không tự hiển thị                      | kiểu notification không tự hiện khi app đang mở: app nhận  |
|    |                                        | ở onMessage và tự hiển thị (thường dùng Notifee). Hành vi  |
|    |                                        | iOS tùy cấu hình, nên kiểm tra tài liệu phiên bản đang     |
|    |                                        | dùng                                                       |
+----+----------------------------------------+------------------------------------------------------------+
| 17 | useMemo, useCallback, React.memo ở mọi | Không. Chỉ dùng khi đã đo thấy vấn đề hoặc cần giữ         |
|    | nơi                                    | reference ổn định. Lạm dụng làm code phức tạp và có thể    |
|    |                                        | chậm hơn                                                   |
+----+----------------------------------------+------------------------------------------------------------+
| 18 | Bật New Architecture khi RN từ 0.76    | Từ RN 0.82, ứng dụng chạy hoàn toàn trên New Architecture  |
|    | trở lên, kiểm tra thư viện trước       | và không thể bật lại kiến trúc cũ (theo thông báo chính    |
|    |                                        | thức). Dự án này dùng RN 0.88.1 nên luôn dùng kiến trúc    |
|    |                                        | mới. Việc còn lại là kiểm tra thư viện bên thứ ba có hỗ    |
|    |                                        | trợ không                                                  |
+----+----------------------------------------+------------------------------------------------------------+
| 19 | Obfuscation bằng ProGuard, R8 để chống | R8 và ProGuard chỉ xử lý code Java, Kotlin. Bundle JS      |
|    | dịch ngược bundle RN                   | (Hermes bytecode) không được chúng làm rối và vẫn dịch     |
|    |                                        | ngược được. Xem mục 20                                     |
+----+----------------------------------------+------------------------------------------------------------+
| 20 | Realm để lưu dữ liệu offline           | Atlas Device SDKs (Realm) và Device Sync đã ngừng hỗ trợ   |
|    |                                        | từ 30/09/2025. Dự án mới nên chọn SQLite, WatermelonDB     |
|    |                                        | hoặc MMKV                                                  |
+----+----------------------------------------+------------------------------------------------------------+
| 21 | Không dùng Rspack 2.x vì Re.Pack chỉ   | Re.Pack 5.4.3 khai báo peerDependency @rspack/core >=1.    |
|    | tương thích 1.x (ghi chú của dự án)    | Chưa kiểm chứng 2.x chạy được, nên dự án giữ 1.x như lựa   |
|    |                                        | chọn thận trọng. Không nên nói chắc là không tương thích   |
+----+----------------------------------------+------------------------------------------------------------+
```

### 14.1 Kết quả kiểm chứng (ngày 17/11/2026)

Các thông tin dễ đổi theo thời gian đã được tra lại. Thông tin nào chưa xác minh được thì ghi rõ.

```
+---------------------------------------------------+--------------------------------+---------------------+
| Thông tin                                         | Kết quả                        | Nguồn               |
+===================================================+================================+=====================+
| New Architecture bật mặc định từ RN 0.76, React   | Đúng                           | [1]                 |
| Native DevTools thay Flipper                      |                                |                     |
+---------------------------------------------------+--------------------------------+---------------------+
| RN 0.82 chạy hoàn toàn trên New Architecture      | Đúng. Code kiến trúc cũ chưa   | [2]                 |
|                                                   | gỡ hết, sẽ gỡ ở bản sau        |                     |
+---------------------------------------------------+--------------------------------+---------------------+
| App Center và CodePush ngừng 31/03/2025           | Đúng. Kho mã CodePush đã lưu   | [3]                 |
|                                                   | trữ                            |                     |
+---------------------------------------------------+--------------------------------+---------------------+
| Firebase Dynamic Links ngừng 25/08/2025           | Đúng ngày. Cách xử lý link cũ  | [4]                 |
|                                                   | sau ngày đó các nguồn nói chưa |                     |
|                                                   | thống nhất                     |                     |
+---------------------------------------------------+--------------------------------+---------------------+
| OWASP Mobile Top 10 bản 2024, M1 đến M10          | Đúng, danh sách ở mục 20 khớp  | [5]                 |
|                                                   | trang OWASP                    |                     |
+---------------------------------------------------+--------------------------------+---------------------+
| Realm, Atlas Device Sync ngừng 30/09/2025         | Đúng                           | [6]                 |
+---------------------------------------------------+--------------------------------+---------------------+
| React Compiler 1.0 ổn định, hỗ trợ React Native   | Đúng, ra ngày 07/10/2025       | [7]                 |
+---------------------------------------------------+--------------------------------+---------------------+
| Lệnh khởi tạo mới: npx @react-native-             | Đúng theo bài đăng chính thức  | [8]                 |
| community/cli@latest init                         | 06/2024                        |                     |
+---------------------------------------------------+--------------------------------+---------------------+
| R8, ProGuard không làm rối bundle JS              | Đúng theo nhiều bài kỹ thuật,  | bài viết bảo mật RN |
|                                                   | không có tài liệu chính thức   |                     |
+---------------------------------------------------+--------------------------------+---------------------+
| Thông báo foreground không tự hiện                | Đúng theo tài liệu React       | [9]                 |
|                                                   | Native Firebase. iOS cần kiểm  |                     |
|                                                   | tra theo cấu hình              |                     |
+---------------------------------------------------+--------------------------------+---------------------+
| Metro không hỗ trợ kiểu Module Federation         | Chưa có tuyên bố chính thức.   | [10]                |
|                                                   | Dựa trên bài viết của          |                     |
|                                                   | Callstack và Theodo            |                     |
+---------------------------------------------------+--------------------------------+---------------------+
| Re.Pack 5.4.3 chỉ tương thích Rspack 1.x          | Không xác minh được.           | [11]                |
|                                                   | package.json của Re.Pack ghi   |                     |
|                                                   | peerDependency >=1             |                     |
+---------------------------------------------------+--------------------------------+---------------------+
| Code, tên file, con số ở Phần I                   | Đã đối chiếu với file thật     | repo                |
|                                                   | trong repo                     |                     |
+---------------------------------------------------+--------------------------------+---------------------+
| Kiến thức nền (lifecycle, hooks, Redux, JSI,      | Kiến thức ổn định, không tra   | -                   |
| Fabric, Hermes)                                   | lại từng điểm                  |                     |
+---------------------------------------------------+--------------------------------+---------------------+
```

Nguồn (địa chỉ rút gọn, thêm https:// phía trước):
  [1] reactnative.dev/blog/2024/10/23/release-0.76-new-architecture
  [2] reactnative.dev/blog/2025/10/08/react-native-0.82
  [3] learn.microsoft.com/appcenter/retirement
  [4] bài viết của Branch, AppsFlyer về việc ngừng Firebase Dynamic Links
  [5] owasp.org/projects/mobile-top-10 và devguide.owasp.org
  [6] mongodb.com/docs/atlas/device-sdks/deprecation
  [7] react.dev/blog/2025/10/07/react-compiler-1
  [8] reactnative.dev/blog/2024/06/25/use-a-framework-to-build-react-native-apps
  [9] rnfirebase.io/messaging/notifications
  [10] callstack.com/blog/implementing-code-splitting-in-react-native-with-re-pack
  [11] node_modules/@callstack/repack/package.json trong repo (phần peerDependencies)

## 15. React cơ bản

### 15.1 React Native khác ReactJS

- ReactJS dùng cho web, render ra DOM (div, span, CSS).
- React Native dùng cho mobile, render ra view native của iOS và Android (View, Text, StyleSheet).
- Cùng nền React: component, props, state, hook. Khác thư viện UI và cách style (flexbox,
  mặc định xếp theo chiều dọc, không có CSS).

### 15.2 "Virtual DOM" nói cho đúng trong React Native

React giữ trong bộ nhớ một cây mô tả giao diện. Mỗi lần state hoặc props đổi, React tạo cây
mới, so sánh với cây cũ (diffing, còn gọi là reconciliation), chỉ áp phần khác biệt.

- Web: áp lên DOM.
- React Native: áp lên view native thông qua renderer. Với Fabric, bước trung gian là Shadow
  Tree viết bằng C++.

Khi trả lời, tránh nói "DOM" trong ngữ cảnh React Native.

### 15.3 Vòng đời (lifecycle)

```
+----------------------------+-------------------------------------------+---------------------------------+
| Giai đoạn                  | Class Component                           | Function Component              |
+============================+===========================================+=================================+
| Mount (xuất hiện lần đầu)  | constructor, render, componentDidMount    | render, rồi useEffect chạy sau  |
|                            |                                           | khi vẽ xong                     |
+----------------------------+-------------------------------------------+---------------------------------+
| Update (state hoặc props   | shouldComponentUpdate, render,            | render, cleanup của effect cũ,  |
| đổi)                       | componentDidUpdate                        | rồi effect mới (nếu             |
|                            |                                           | dependencies đổi)               |
+----------------------------+-------------------------------------------+---------------------------------+
| Unmount (biến mất)         | componentWillUnmount                      | cleanup (hàm return trong       |
|                            |                                           | useEffect)                      |
+----------------------------+-------------------------------------------+---------------------------------+
```

Ghi chú thêm:
- Class còn getDerivedStateFromProps và getSnapshotBeforeUpdate, rất ít dùng.
- Hiện nay ưu tiên Function Component và Hook.
- Ở chế độ dev có StrictMode (React 18 trở lên), effect được chạy hai lần để lộ lỗi quên dọn
  dẹp. Đó không phải bug.

### 15.4 useEffect và vòng đời của nó

useEffect dùng cho tác dụng phụ (side effect): gọi API, đăng ký listener, timer, theo dõi
thay đổi state hoặc props.

```
  Mount -> render -> useEffect chạy
  State/props đổi -> render -> cleanup của lần trước -> useEffect mới chạy
  Unmount -> cleanup cuối cùng
```

```
+-----------------------+--------------------------------------------+
| Cách viết             | Khi nào chạy                               |
+=======================+============================================+
| useEffect(fn, [])     | Một lần sau lần render đầu                 |
+-----------------------+--------------------------------------------+
| useEffect(fn, [a, b]) | Lần đầu, và mỗi khi a hoặc b đổi           |
+-----------------------+--------------------------------------------+
| useEffect(fn)         | Sau mỗi lần render (hiếm khi muốn như vậy) |
+-----------------------+--------------------------------------------+
```

Ví dụ có dọn dẹp:

```
  useEffect(() => {
    const timer = setInterval(() => {}, 1000);
    return () => clearInterval(timer);   // cleanup
  }, []);
```

Trong ElectroGo: hook useAsync và MiniAppHost đều dùng cờ cancelled trong cleanup để không
setState sau khi component đã gỡ.

### 15.5 Các hook hay hỏi

```
+-------------+---------------------------------------------+----------------------------------------------+
| Hook        | Dùng khi                                    | Lưu ý                                        |
+=============+=============================================+==============================================+
| useState    | Dữ liệu đổi và cần vẽ lại UI                | Mỗi lần set là một lần render                |
+-------------+---------------------------------------------+----------------------------------------------+
| useReducer  | State phức tạp, nhiều loại hành động        | Thay cho nhiều useState rời rạc              |
+-------------+---------------------------------------------+----------------------------------------------+
| useRef      | Lưu giá trị qua các lần render mà không vẽ  | Đổi ref.current không gây render. Ví dụ: id  |
|             | lại; giữ tham chiếu tới component           | timer, giá trị trước đó, vị trí cuộn         |
+-------------+---------------------------------------------+----------------------------------------------+
| useMemo     | Cache một giá trị tính toán tốn kém, hoặc   | Không dùng cho phép tính rẻ                  |
|             | giữ nguyên reference của object hoặc array  |                                              |
+-------------+---------------------------------------------+----------------------------------------------+
| useCallback | Cache một hàm, khi truyền xuống component   | Mỗi lần dùng cũng có chi phí lưu             |
|             | con bọc React.memo hoặc hàm nằm trong       | dependencies                                 |
|             | dependencies                                |                                              |
+-------------+---------------------------------------------+----------------------------------------------+
| useContext  | Chia sẻ dữ liệu cho cây con không cần       | Khi value đổi, mọi component dùng context đó |
|             | truyền props nhiều tầng (theme, ngôn ngữ,   | đều render lại                               |
|             | người dùng)                                 |                                              |
+-------------+---------------------------------------------+----------------------------------------------+
```

### 15.6 useMemo, useCallback và React.memo

- React.memo: bỏ qua render lại component nếu props không đổi.
- useCallback giữ nguyên reference của hàm, useMemo giữ nguyên reference của giá trị. Hai hook
  này chỉ có ích khi đi cùng React.memo hoặc khi nằm trong dependencies của hook khác.
- React.memo vô tác dụng nếu props luôn là giá trị mới mỗi lần render:

```
  <MyComponent style={{ flex: 1 }} />        // object mới mỗi lần -> vẫn render lại
  <MyComponent onPress={() => submit()} />    // hàm mới mỗi lần -> vẫn render lại
```

Hỏi: Có nên dùng useMemo và useCallback ở mọi nơi không?
  Đáp: Không. Tôi chỉ dùng khi đã đo thấy vấn đề hiệu năng, hoặc cần giữ reference ổn định.
  Với phép tính đơn giản, chi phí memoization có thể cao hơn chi phí tính toán. Nếu dự án bật
  React Compiler (bản 1.0 ổn định từ 10/2025, hỗ trợ React Native) thì phần lớn việc này được làm
  tự động. Dự án ElectroGo chưa bật React Compiler.

### 15.7 useEffect và useLayoutEffect

```
+--------------------------+------------------------------------+------------------------------------------+
|                          | useEffect                          | useLayoutEffect                          |
+==========================+====================================+==========================================+
| Chạy khi nào             | Sau khi render xong và màn hình đã | Ngay sau render nhưng trước khi vẽ       |
|                          | vẽ                                 |                                          |
+--------------------------+------------------------------------+------------------------------------------+
| Có chặn việc vẽ UI không | Không (bất đồng bộ)                | Có (đồng bộ)                             |
+--------------------------+------------------------------------+------------------------------------------+
| Dùng cho                 | Hầu hết trường hợp: API, listener, | Đo kích thước view rồi chỉnh ngay, tránh |
|                          | timer                              | nháy hình                                |
+--------------------------+------------------------------------+------------------------------------------+
```

Mặc định dùng useEffect. Chỉ dùng useLayoutEffect khi thấy UI bị nháy vì đo rồi mới chỉnh.

### 15.8 Thêm prop mới vào component đang dùng ở 100 màn hình

Làm cho prop mới là tùy chọn (optional) và có giá trị mặc định, để 100 chỗ cũ không phải sửa:

```
  type Props = { title: string; isNewFeature?: boolean };

  const CommonComponent = ({ title, isNewFeature = false }: Props) => { ... };
```

Trong ElectroGo: prop initialRoute của mini app làm đúng như vậy. Mini app cũ không có prop
này vẫn chạy bình thường.

### 15.9 interface và type (TypeScript)

```
+------------------+--------------------------------------------------+------------------------------------+
|                  | interface                                        | type                               |
+==================+==================================================+====================================+
| Mở rộng          | extends, và có thể khai báo lại để gộp           | Dùng & (intersection)              |
|                  | (declaration merging)                            |                                    |
+------------------+--------------------------------------------------+------------------------------------+
| Union (A hoặc B) | Không                                            | Có                                 |
+------------------+--------------------------------------------------+------------------------------------+
| Dùng cho         | Hình dạng của object, class                      | Union, intersection, kiểu phức tạp |
+------------------+--------------------------------------------------+------------------------------------+
```

Quy tắc đơn giản: object thì ưu tiên interface, cần union hoặc kiểu phức tạp thì dùng type.

## 16. React Native bên trong

### 16.1 Ba luồng chính

```
+----------------------+-----------------------------------------------+
| Luồng                | Làm gì                                        |
+======================+===============================================+
| JS thread            | Chạy code JavaScript: logic, render của React |
+----------------------+-----------------------------------------------+
| UI (main) thread     | Vẽ view native, xử lý chạm                    |
+----------------------+-----------------------------------------------+
| Luồng nền cho layout | Tính bố cục (Shadow Tree)                     |
+----------------------+-----------------------------------------------+
```

App lag thường do JS thread bận (animation bị giật) hoặc UI thread phải vẽ quá nhiều.

### 16.2 Kiến trúc cũ (Bridge) và kiến trúc mới

```
+------------------------+--------------------------------------+------------------------------------------+
| Mục                    | Kiến trúc cũ (Bridge)                | Kiến trúc mới (New Architecture)         |
+========================+======================================+==========================================+
| Giao tiếp JS và native | Bất đồng bộ qua Bridge, dữ liệu phải | JSI: JS gọi trực tiếp C++ hoặc native,   |
|                        | serialize thành JSON                 | có thể gọi đồng bộ, không cần JSON       |
+------------------------+--------------------------------------+------------------------------------------+
| Nạp native module      | Nạp tất cả khi app khởi động         | TurboModules: nạp khi cần dùng           |
+------------------------+--------------------------------------+------------------------------------------+
| Vẽ giao diện           | UIManager cũ                         | Fabric: renderer mới, đồng bộ tốt hơn,   |
|                        |                                      | hỗ trợ concurrent React                  |
+------------------------+--------------------------------------+------------------------------------------+
| Kiểm tra kiểu          | Không kiểm tra lúc build             | Codegen sinh code từ khai báo kiểu, lỗi  |
|                        |                                      | lộ lúc build                             |
+------------------------+--------------------------------------+------------------------------------------+
| Hạn chế                | Truyền nhiều dữ liệu thì tốn CPU, bộ | Giảm các hạn chế trên                    |
|                        | nhớ, tăng độ trễ (camera, animation, |                                          |
|                        | streaming)                           |                                          |
+------------------------+--------------------------------------+------------------------------------------+
```

Bốn thành phần của New Architecture:
- JSI (JavaScript Interface): lớp cho phép JS và C++ gọi nhau trực tiếp.
- TurboModules: thế hệ Native Module mới, nạp lười, có kiểu.
- Fabric: hệ thống render mới.
- Codegen: sinh code kết nối từ file khai báo kiểu.

Về việc bật New Architecture: từ RN 0.76 kiến trúc mới được bật mặc định. Từ RN 0.82, ứng dụng
chạy hoàn toàn trên kiến trúc mới và không thể bật lại kiến trúc cũ (code của kiến trúc cũ chưa
gỡ hết, sẽ gỡ ở các bản sau, theo thông báo chính thức). Dự án ElectroGo dùng RN 0.88.1 nên luôn
dùng kiến trúc mới. Việc còn phải làm khi nâng cấp là kiểm tra các thư viện chính đã hỗ trợ
chưa: reanimated, react-navigation, gesture-handler, firebase.

Hỏi: Bạn đã migrate sang New Architecture chưa?
  Đáp (nếu có): Có. Khó nhất là thư viện bên thứ ba chưa hỗ trợ hoặc hỗ trợ chưa đầy đủ.
  Đáp (nếu chưa): Chưa trực tiếp migrate, nhưng nắm cách hoạt động và biết cần kiểm tra thư
  viện phụ thuộc trước. Dự án mới của tôi chạy trên RN 0.88.1.

### 16.3 Hermes

Engine JavaScript mặc định của React Native. Code JS được biên dịch trước thành bytecode lúc
build, nên khởi động nhanh và dùng ít RAM hơn. Hermes không phải biện pháp bảo mật.

### 16.4 Native Module và Native UI Component

```
+-----------+-----------------------------------------------+----------------------------------------------+
|           | Native Module                                 | Native UI Component                          |
+===========+===============================================+==============================================+
| Là gì     | Cầu nối để JS gọi tính năng của hệ điều hành  | View vẽ bằng code native, dùng trong cây     |
|           |                                               | React                                        |
+-----------+-----------------------------------------------+----------------------------------------------+
| Ví dụ     | Camera API, sinh trắc học, thông tin thiết    | Bản đồ native, trình phát video native       |
|           | bị, NFC                                       |                                              |
+-----------+-----------------------------------------------+----------------------------------------------+
| Viết bằng | Kotlin hoặc Java (Android), Swift hoặc        | Giống bên trái                               |
|           | Objective-C (iOS)                             |                                              |
+-----------+-----------------------------------------------+----------------------------------------------+
```

Khi nào cần viết: JS và thư viện sẵn có không truy cập được tính năng cần dùng.

Trong ElectroGo: thư viện native chỉ được cài ở host. Mini app cần thư viện native mới thì
phải phát hành lại host (xem mục 7).

## 17. Hiệu năng

### 17.1 Nguyên tắc: đo trước, tối ưu sau

Công cụ đo:
- Performance Monitor (xem FPS của JS thread và UI thread).
- React DevTools Profiler, Flame Graph (component nào render nhiều lần).
- React Native DevTools (từ RN 0.76), Hermes profiler, Systrace.
- Xcode Instruments, Android Studio Profiler (CPU, RAM).

### 17.2 Nguyên nhân lag thường gặp và cách xử lý

```
+-----------------------------------+----------------------------------------------------------------------+
| Nguyên nhân                       | Cách xử lý                                                           |
+===================================+======================================================================+
| Render lại không cần thiết        | React.memo, useCallback, useMemo; tách component lớn thành nhỏ; giữ  |
|                                   | state ở gần nơi dùng; tránh tạo object, hàm mới trong props          |
+-----------------------------------+----------------------------------------------------------------------+
| Danh sách lớn                     | FlatList hoặc FlashList thay ScrollView; keyExtractor,               |
|                                   | getItemLayout, windowSize, initialNumToRender; removeClippedSubviews |
|                                   | (Android); phân trang                                                |
+-----------------------------------+----------------------------------------------------------------------+
| Ảnh quá lớn                       | Resize từ server, lazy loading, cache ảnh (expo-image,               |
|                                   | react-native-fast-image), CDN                                        |
+-----------------------------------+----------------------------------------------------------------------+
| Animation giật                    | JS thread đang bận thì animation chạy bằng JS sẽ rớt khung hình.     |
|                                   | Dùng Reanimated (chạy trên UI thread) hoặc useNativeDriver           |
+-----------------------------------+----------------------------------------------------------------------+
| JS thread bị chặn bởi tác vụ nặng | Chia nhỏ việc, InteractionManager, chuyển sang native module hoặc    |
|                                   | worklet                                                              |
+-----------------------------------+----------------------------------------------------------------------+
| Nhiều API gọi cùng lúc            | Gom bằng Promise.all, cache, debounce, hủy request thừa              |
|                                   | (AbortController), loading riêng cho từng khối                       |
+-----------------------------------+----------------------------------------------------------------------+
| Khởi động chậm                    | Hermes, giảm thư viện, nạp lười màn hình. Với super app: tách bundle |
|                                   | (Module Federation)                                                  |
+-----------------------------------+----------------------------------------------------------------------+
```

### 17.3 Các loại danh sách

```
+-------------+---------------------+----------------------+----------------------+------------------------+
|             | ScrollView          | FlatList             | SectionList          | FlashList              |
+=============+=====================+======================+======================+========================+
| Cách render | Toàn bộ item        | Chỉ item đang hiển   | Như FlatList, có     | Tái sử dụng view       |
|             |                     | thị (windowing)      | nhóm                 | (recycling), nhanh hơn |
+-------------+---------------------+----------------------+----------------------+------------------------+
| Dùng khi    | Ít item, nội dung   | Danh sách dài đơn    | Danh sách có phân    | Danh sách rất lớn cần  |
|             | cố định             | giản                 | nhóm, tiêu đề nhóm   | hiệu năng cao          |
+-------------+---------------------+----------------------+----------------------+------------------------+
```

Hỏi: FlatList có 10.000 item thì làm sao?
  Đáp: Phân trang (không tải hết một lần), getItemLayout nếu chiều cao cố định, keyExtractor ổn
  định, giảm windowSize, bọc item bằng React.memo, ảnh lazy loading. Cần nữa thì chuyển
  sang FlashList.

### 17.4 Memory leak (rò rỉ bộ nhớ)

Là khi bộ nhớ không còn dùng nhưng không được giải phóng, nên app ngày càng tốn RAM, giật,
lag và có thể crash vì hết bộ nhớ.

Nguyên nhân thường gặp:
- Timer, listener, subscription không hủy khi component bị gỡ.
- Closure giữ tham chiếu tới dữ liệu lớn.
- Biến toàn cục hoặc cache không giới hạn.
- Ảnh lớn không giải phóng.

Cách phòng: luôn có cleanup trong useEffect.

```
  useEffect(() => {
    const sub = AppState.addEventListener('change', handler);
    return () => sub.remove();       // dọn dẹp
  }, []);
```

Cách phát hiện: Xcode Instruments (Leaks, Allocations), Android Studio Profiler, LeakCanary,
Heap Snapshot của Hermes.

Hỏi: Bạn xử lý memory leak như thế nào?
  Đáp: Tôi theo dõi RAM bằng profiler khi mở và đóng một màn nhiều lần. Nếu RAM tăng mãi thì
  tìm timer, listener, subscription chưa được hủy và thêm cleanup trong useEffect.

### 17.5 Khi app bị lag, debug thế nào

1. Bật Performance Monitor xem FPS của JS thread hay UI thread tụt.
2. JS thread tụt: dùng React Profiler tìm render lặp, logic nặng trong render.
3. UI thread tụt: xem view quá phức tạp, ảnh lớn, shadow, animation.
4. Sửa đúng chỗ rồi đo lại để chắc có cải thiện.

## 18. Quản lý state

### 18.1 Phân loại state

```
+---------------------------------+--------------------------------------+---------------------------------+
| Loại                            | Ví dụ                                | Công cụ thường dùng             |
+=================================+======================================+=================================+
| UI state cục bộ (một component) | Modal đang mở, nội dung ô nhập       | useState, useReducer            |
+---------------------------------+--------------------------------------+---------------------------------+
| State dùng chung (global)       | Người dùng đăng nhập, theme, giỏ     | Redux Toolkit, Zustand, Context |
|                                 | hàng                                 |                                 |
+---------------------------------+--------------------------------------+---------------------------------+
| Server state (dữ liệu từ API)   | Danh sách sản phẩm, hồ sơ            | React Query, RTK Query          |
+---------------------------------+--------------------------------------+---------------------------------+
| Props                           | Dữ liệu truyền từ cha xuống con      | Props                           |
+---------------------------------+--------------------------------------+---------------------------------+
```

Phân biệt rõ ba loại state là điểm cộng khi phỏng vấn, vì nhiều người dồn hết vào Redux.

### 18.2 Redux và Redux Toolkit

Redux là thư viện quản lý state tập trung: toàn bộ state nằm trong một store duy nhất, chỉ
đổi được qua action và reducer, nên dễ dự đoán và dễ debug.

```
  UI -> dispatch(action) -> reducer -> store cập nhật -> UI render lại
```

Redux Toolkit (RTK) là cách viết Redux hiện nay:
- Giảm code lặp (boilerplate): chỉ cần createSlice thay cho actions, constants, reducers.
- Có Immer: viết như đổi trực tiếp state nhưng thực chất tạo bản sao bất biến.
- configureStore cấu hình sẵn middleware và DevTools.
- RTK Query: lấy dữ liệu API có cache, tự tải lại, trạng thái loading và lỗi.

### 18.3 Redux Thunk và Redux Saga

```
+----------------------------------+---------------------------------+-------------------------------------+
| Tiêu chí                         | Redux Thunk                     | Redux Saga                          |
+==================================+=================================+=====================================+
| Cách viết                        | Hàm async, dùng async/await     | Generator function, dùng yield      |
+----------------------------------+---------------------------------+-------------------------------------+
| Độ khó                           | Dễ, học nhanh                   | Khó hơn                             |
+----------------------------------+---------------------------------+-------------------------------------+
| Lượng code                       | Ít                              | Nhiều hơn                           |
+----------------------------------+---------------------------------+-------------------------------------+
| Workflow nhiều bước, chạy nền    | Khó                             | Rất mạnh                            |
+----------------------------------+---------------------------------+-------------------------------------+
| Hủy request, debounce, retry,    | Phải tự viết                    | Có sẵn (takeLatest, debounce,       |
| polling                          |                                 | retry, race)                        |
+----------------------------------+---------------------------------+-------------------------------------+
| Chạy song song                   | Tự dùng Promise.all             | Có sẵn (all, fork)                  |
+----------------------------------+---------------------------------+-------------------------------------+
| Phù hợp                          | Dự án nhỏ và vừa, CRUD đơn giản | Dự án lớn, nhiều luồng bất đồng bộ  |
|                                  |                                 | phức tạp                            |
+----------------------------------+---------------------------------+-------------------------------------+
```

Hỏi: Khi nào dùng Thunk, khi nào dùng Saga?
  Đáp: Thunk cho dự án nhỏ hoặc vừa, logic bất đồng bộ đơn giản, vì dễ viết và ít code. Saga
  khi có workflow nhiều bước, cần hủy, debounce, retry, polling. Với dữ liệu API đơn thuần tôi
  ưu tiên RTK Query hơn là tự viết thunk.

### 18.4 Context API, Zustand và Redux Toolkit

```
+----------------------+----------------------------+---------------------------+--------------------------+
|                      | Context API                | Zustand                   | Redux Toolkit            |
+======================+============================+===========================+==========================+
| Quy mô               | State nhỏ, ít đổi (theme,  | Vừa, muốn nhẹ và nhanh    | Ứng dụng lớn, nhiều      |
|                      | ngôn ngữ)                  |                           | người làm                |
+----------------------+----------------------------+---------------------------+--------------------------+
| Boilerplate          | Ít                         | Rất ít                    | Vừa phải                 |
+----------------------+----------------------------+---------------------------+--------------------------+
| Middleware, DevTools | Không có sẵn               | Có (đơn giản hơn)         | Đầy đủ                   |
+----------------------+----------------------------+---------------------------+--------------------------+
| Lưu ý                | Khi value đổi, mọi         | Store là một hook, dùng   | Chuẩn hóa cách làm, dễ   |
|                      | component dùng context đều | selector để tránh render  | scale                    |
|                      | render lại                 | thừa                      |                          |
+----------------------+----------------------------+---------------------------+--------------------------+
```

Zustand là thư viện state nhẹ cho React và React Native: tạo store bằng một hàm, dùng như hook.

Trong ElectroGo: mini app dùng useState và hook useAsync, chưa cần Redux vì dữ liệu còn nhỏ
và mỗi màn tự tải dữ liệu. Nếu cần state dùng chung trong một mini app thì Zustand phù hợp.
State không chia sẻ trực tiếp giữa host và mini app, host truyền qua props (như initialRoute).

## 19. Mạng và xác thực

### 19.1 Gọi API

- fetch có sẵn trong React Native. Axios thêm tiện ích: interceptor, timeout, hủy request.
- Trong ElectroGo: httpClient của mini app bọc fetch với AbortController (timeout 10 giây) và
  quy mọi lỗi về ApiError, nên không cần thêm thư viện.

### 19.2 Access Token và Refresh Token

```
+----------------+-----------------------------------+----------------------------------------+
|                | Access Token                      | Refresh Token                          |
+================+===================================+========================================+
| Dùng để        | Gọi API                           | Xin Access Token mới                   |
+----------------+-----------------------------------+----------------------------------------+
| Thời gian sống | Ngắn (ví dụ 15 phút)              | Dài hơn (ví dụ 7 ngày)                 |
+----------------+-----------------------------------+----------------------------------------+
| Nếu bị lộ      | Hại giới hạn trong thời gian ngắn | Nghiêm trọng hơn, nên lưu thật an toàn |
+----------------+-----------------------------------+----------------------------------------+
```

Câu trả lời chuẩn: Access token có thời gian sống ngắn để gọi API. Khi hết hạn, dùng refresh
token để lấy token mới mà không bắt người dùng đăng nhập lại.

### 19.3 Luồng xử lý khi token hết hạn

```
  Gọi API (kèm access token)
        │
        ├── 200 OK -> xong
        └── 401 -> gọi refresh token -> lấy token mới -> thử lại request ban đầu
                        └── refresh cũng lỗi -> đăng xuất
```

### 19.4 Vấn đề kinh điển: nhiều request cùng gặp 401

Khi token hết hạn, API A, B, C cùng trả 401 và cả ba cùng gọi refresh. Ba lần refresh chạy
đồng thời có thể làm token bị vô hiệu lẫn nhau và người dùng bị đăng xuất ngẫu nhiên.

Cách xử lý: chỉ cho một lần refresh chạy, các request còn lại chờ kết quả đó (hoặc xếp hàng
đợi, nếu dùng Redux Saga). Ví dụ với Axios:

```
  let refreshPromise: Promise<string> | null = null;

  api.interceptors.response.use(undefined, async error => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      throw error;
    }
    original._retry = true;
    if (!refreshPromise) {
      refreshPromise = refreshToken().finally(() => { refreshPromise = null; });
    }
    const token = await refreshPromise;          // mọi request cùng chờ một lần refresh
    original.headers.Authorization = `Bearer ${token}`;
    return api(original);                         // thử lại request ban đầu
  });
```

### 19.5 Xử lý lỗi API

- Xử lý lỗi tập trung ở một chỗ (interceptor hoặc httpClient).
- Ánh xạ mã lỗi thành thông báo dễ hiểu.
- Có timeout. Chỉ retry với request an toàn (GET) và tăng dần thời gian chờ giữa các lần.
- Ghi log và theo dõi lỗi bằng Sentry hoặc Crashlytics. Với ngân hàng, đây là yêu cầu bắt buộc.

## 20. Bảo mật

Bảo mật không thể chỉ làm ở app. Phải kết hợp: app, backend, mạng, DevOps và thiết bị người
dùng. Nguyên tắc cốt lõi của ngân hàng: không tin bất cứ dữ liệu nào từ client, backend phải
kiểm tra lại mọi thứ.

### 20.1 Các biện pháp chính

```
+---------------------------+------------------------------+-----------------------------------------------+
| Biện pháp                 | Chống gì                     | Cách làm trong React Native                   |
+===========================+==============================+===============================================+
| Lưu token an toàn         | Lấy token từ máy root, từ    | Keychain (iOS), Keystore (Android) qua        |
|                           | file backup                  | react-native-keychain. Không dùng             |
|                           |                              | AsyncStorage                                  |
+---------------------------+------------------------------+-----------------------------------------------+
| SSL Pinning               | Tấn công chen giữa (MITM),   | App chỉ tin chứng chỉ đã khai báo. Nên pin    |
|                           | Charles, Burp                | public key và có kế hoạch xoay khóa, vì chứng |
|                           |                              | chỉ hết hạn sẽ làm app không gọi được API     |
+---------------------------+------------------------------+-----------------------------------------------+
| Phát hiện root, jailbreak | Máy bị can thiệp hệ thống    | jail-monkey. Chỉ là lớp phụ, không tuyệt đối  |
+---------------------------+------------------------------+-----------------------------------------------+
| Làm khó dịch ngược        | Giải nén APK, đọc bundle     | R8, ProGuard (minifyEnabled, shrinkResources  |
|                           |                              | trong build.gradle) chỉ làm rối code Java,    |
|                           |                              | Kotlin, không đụng tới bundle JS. Bundle JS   |
|                           |                              | (Hermes bytecode) vẫn dịch ngược được bằng    |
|                           |                              | công cụ như hermes-dec. Muốn làm khó thì      |
|                           |                              | obfuscate JS trước khi biên dịch (ví dụ       |
|                           |                              | javascript-obfuscator) hoặc dùng giải pháp    |
|                           |                              | bảo vệ ứng dụng. Chỉ làm khó, không chặn hoàn |
|                           |                              | toàn                                          |
+---------------------------+------------------------------+-----------------------------------------------+
| Không hardcode secret     | API key bị trích xuất từ APK | Để secret ở backend, app chỉ nhận token tạm   |
|                           |                              | thời                                          |
+---------------------------+------------------------------+-----------------------------------------------+
| Mã hóa dữ liệu nhạy cảm   | Lộ CCCD, số tài khoản khi    | AES, khóa lưu trong Keychain hoặc Keystore    |
|                           | lưu local                    |                                               |
+---------------------------+------------------------------+-----------------------------------------------+
| Xác thực sinh trắc học    | Người lạ dùng máy            | react-native-biometrics hoặc                  |
|                           |                              | expo-local-authentication (Face ID, vân tay)  |
+---------------------------+------------------------------+-----------------------------------------------+
| Toàn vẹn ứng dụng         | App bị sửa, ký lại, chạy     | Play Integrity API (Android), App Attest hoặc |
|                           | trên máy không tin cậy       | DeviceCheck (iOS)                             |
+---------------------------+------------------------------+-----------------------------------------------+
| Chống chụp màn hình       | Lộ OTP, số tài khoản         | FLAG_SECURE (Android), ẩn nội dung khi app    |
|                           |                              | vào nền (iOS)                                 |
+---------------------------+------------------------------+-----------------------------------------------+
| Ràng buộc thiết bị        | Mang token sang máy khác     | Đăng ký thiết bị, token chỉ hợp lệ trên thiết |
|                           | dùng                         | bị đã đăng ký                                 |
+---------------------------+------------------------------+-----------------------------------------------+
```

### 20.2 Mã hóa khác băm

```
+-----------------------+----------------+--------------------------------+--------------------------------+
| Loại                  | Ví dụ          | Dùng khi                       | Lưu ý                          |
+=======================+================+================================+================================+
| Băm (hash), một chiều | MD5, SHA-256   | Kiểm tra toàn vẹn              | MD5 đã yếu, không dùng cho bảo |
|                       |                |                                | mật                            |
+-----------------------+----------------+--------------------------------+--------------------------------+
| Băm mật khẩu          | bcrypt, argon2 | Lưu mật khẩu ở backend         | Có salt, cố ý chậm             |
+-----------------------+----------------+--------------------------------+--------------------------------+
| Mã hóa đối xứng       | AES            | Mã hóa dữ liệu cần giải mã lại | Một khóa dùng cho cả mã hóa và |
|                       |                |                                | giải mã                        |
+-----------------------+----------------+--------------------------------+--------------------------------+
| Mã hóa bất đối xứng   | RSA            | Trao đổi khóa, chữ ký số       | Có khóa công khai và khóa      |
|                       |                |                                | riêng                          |
+-----------------------+----------------+--------------------------------+--------------------------------+
```

### 20.3 OWASP Mobile Top 10 (bản 2024)

```
+-----+------------------------------------------+---------------------------------------------------+
| Mã  | Rủi ro                                   | Ví dụ trong React Native                          |
+=====+==========================================+===================================================+
| M1  | Dùng thông tin đăng nhập không đúng cách | Hardcode API key, mật khẩu trong code             |
+-----+------------------------------------------+---------------------------------------------------+
| M2  | An toàn chuỗi cung ứng kém               | Thư viện npm có lỗ hổng hoặc độc hại              |
+-----+------------------------------------------+---------------------------------------------------+
| M3  | Xác thực, phân quyền không an toàn       | Chỉ kiểm tra quyền ở client                       |
+-----+------------------------------------------+---------------------------------------------------+
| M4  | Kiểm tra dữ liệu vào, ra chưa đủ         | Tin dữ liệu từ deep link, WebView                 |
+-----+------------------------------------------+---------------------------------------------------+
| M5  | Giao tiếp không an toàn                  | Dùng HTTP, không SSL Pinning                      |
+-----+------------------------------------------+---------------------------------------------------+
| M6  | Kiểm soát quyền riêng tư chưa đủ         | Ghi log thông tin cá nhân                         |
+-----+------------------------------------------+---------------------------------------------------+
| M7  | Bảo vệ file nhị phân chưa đủ             | Không làm khó dịch ngược, không kiểm tra toàn vẹn |
+-----+------------------------------------------+---------------------------------------------------+
| M8  | Cấu hình bảo mật sai                     | Bật debug ở bản release                           |
+-----+------------------------------------------+---------------------------------------------------+
| M9  | Lưu trữ dữ liệu không an toàn            | Lưu token trong AsyncStorage                      |
+-----+------------------------------------------+---------------------------------------------------+
| M10 | Mật mã học chưa đủ mạnh                  | Dùng MD5 cho dữ liệu nhạy cảm                     |
+-----+------------------------------------------+---------------------------------------------------+
```

Hỏi: Làm sao bảo mật app React Native?
  Đáp: Tôi chia theo lớp: lưu trữ (token trong Keychain, Keystore), mạng (HTTPS, SSL
  Pinning), ứng dụng (làm khó dịch ngược, phát hiện root, kiểm tra toàn vẹn), và backend (không
  tin client, kiểm tra lại mọi dữ liệu). Tôi dùng OWASP Mobile Top 10 làm danh sách kiểm tra.

Trong ElectroGo: đây cũng là lý do mục 9 nhắc tới việc ký bundle và chỉ nạp mini app từ domain
tin cậy, vì app đang chạy mã tải từ mạng.

## 21. Điều hướng, Deep link và Push notification

### 21.1 Điều hướng với React Navigation

- Các loại: Stack Navigator, Bottom Tab Navigator, Drawer Navigator.
- Truyền dữ liệu giữa màn hình:

```
  navigation.navigate('Detail', { id: 1 });     // gửi
  const { id } = route.params;                   // nhận ở màn Detail
```

Trong ElectroGo: không dùng React Navigation. Host dùng state đơn giản, mini app dùng useStack
tự viết, vì thư viện navigation có phần native mà mini app chỉ là JS (xem mục 7).

### 21.2 Deep link

Deep link mở thẳng một màn hình cụ thể, ví dụ myapp://product/123.

```
+------------------+----------------------------------+----------------------------------------------------+
|                  | Deep Link (custom scheme)        | Universal Link (iOS), App Link (Android)           |
+==================+==================================+====================================================+
| Dạng             | myapp://                         | https://...                                        |
+------------------+----------------------------------+----------------------------------------------------+
| Bảo mật          | Thấp hơn, scheme có thể bị app   | Cao hơn, gắn với domain của bạn, cần file xác minh |
|                  | khác đăng ký trùng               |                                                    |
+------------------+----------------------------------+----------------------------------------------------+
| Cấu hình         | Khai báo scheme                  | apple-app-site-association (iOS), assetlinks.json  |
|                  |                                  | (Android)                                          |
+------------------+----------------------------------+----------------------------------------------------+
| Khi chưa cài app | Không làm gì                     | Mở trang web                                       |
+------------------+----------------------------------+----------------------------------------------------+
```

Cách xử lý trong app:
- App đang tắt (mở nguội): lấy link ban đầu bằng Linking.getInitialURL().
- App đang mở: lắng nghe sự kiện Linking 'url', rồi điều hướng tới màn tương ứng.

Trong ElectroGo: initialRoute là deep link nội bộ giữa host và mini app (xem mục 4, bước 7).

### 21.3 Push notification

```
  Server -> FCM (Android) hoặc APNs (iOS, thường qua FCM) -> thiết bị -> app
```

```
+-----------------------+----------------------------------------------------------------------------------+
| Trạng thái app        | Hành vi                                                                          |
+=======================+==================================================================================+
| Foreground (đang mở)  | Thông báo kiểu notification không tự hiện (theo tài liệu React Native Firebase). |
|                       | App nhận ở onMessage và tự hiển thị, thường dùng Notifee. iOS tùy cấu hình       |
+-----------------------+----------------------------------------------------------------------------------+
| Background (chạy nền) | Hệ điều hành tự hiển thị thông báo                                               |
+-----------------------+----------------------------------------------------------------------------------+
| Quit (đã tắt hẳn)     | Hệ điều hành hiển thị, bấm vào thì mở app và xử lý dữ liệu đính kèm              |
+-----------------------+----------------------------------------------------------------------------------+
```

Khi người dùng không nhận được thông báo, kiểm tra theo thứ tự:
1. Quyền thông báo (Android 13 trở lên cần xin quyền POST_NOTIFICATIONS).
2. Token thiết bị còn hợp lệ, đã gửi lên server chưa.
3. Cấu hình APNs (iOS), notification channel (Android).
4. Log của FCM, thử gửi thử từ bảng điều khiển Firebase.

## 22. Lưu trữ dữ liệu và offline

### 22.1 So sánh các nơi lưu

```
+--------------+---------------------+----------------------+-----------------------+----------------------+
|              | AsyncStorage        | MMKV                 | Keychain, Keystore    | SQLite, WatermelonDB |
|              |                     |                      | (SecureStore)         |                      |
+==============+=====================+======================+=======================+======================+
| Bản chất     | Key-value, văn bản  | Key-value, viết bằng | Kho bảo mật của hệ    | Cơ sở dữ liệu quan   |
|              | thường              | C++, dùng            | điều hành             | hệ trên máy          |
|              |                     | memory-mapped file   |                       |                      |
+--------------+---------------------+----------------------+-----------------------+----------------------+
| Tốc độ       | Vừa, bất đồng bộ    | Rất nhanh, đồng bộ   | Chậm hơn              | Tốt cho truy vấn     |
+--------------+---------------------+----------------------+-----------------------+----------------------+
| Bảo mật      | Không mã hóa        | Có thể mã hóa, nhưng | Cao, hệ điều hành     | Tùy cấu hình         |
|              |                     | khóa phải cất ở nơi  | quản lý               |                      |
|              |                     | an toàn              |                       |                      |
+--------------+---------------------+----------------------+-----------------------+----------------------+
| Dùng cho     | Cấu hình, dữ liệu   | Cache, dữ liệu cần   | Token, mật khẩu, khóa | Dữ liệu có cấu trúc, |
|              | không nhạy cảm      | đọc nhanh            |                       | offline              |
+--------------+---------------------+----------------------+-----------------------+----------------------+
| Không dùng   | Token, dữ liệu nhạy | Bí mật nếu chưa mã   | Dữ liệu lớn           | Dữ liệu rất nhỏ, đơn |
| cho          | cảm                 | hóa                  |                       | giản                 |
+--------------+---------------------+----------------------+-----------------------+----------------------+
```

SecureStore là của Expo. React Native thuần dùng react-native-keychain.
Realm: Atlas Device SDKs (Realm) và Device Sync đã ngừng hỗ trợ từ 30/09/2025. Không chọn cho dự án
mới; dự án mới nên cân nhắc SQLite, WatermelonDB hoặc MMKV.

### 22.2 Offline-first

Offline-first nghĩa là app vẫn dùng được khi mất mạng (ngân hàng, logistics, bán hàng tại quầy).

```
  UI  <-  Local DB  <-  đồng bộ  <-  API
```

- Ưu tiên đọc từ Local DB, mạng chỉ dùng để đồng bộ.
- Khi người dùng sửa lúc offline: ghi vào một hàng đợi (queue) các thao tác, ví dụ tạo đơn,
  sửa hồ sơ, xóa sản phẩm. Khi có mạng thì gửi lần lượt lên server.
- Cần tính tới xung đột (hai nơi cùng sửa) và gửi trùng. Giải quyết bằng quy tắc xung đột
  (bản mới nhất thắng, hoặc số phiên bản) và khóa chống trùng (idempotency key).

## 23. CI/CD, OTA, phát hành và rollback

### 23.1 CI/CD là gì

- CI (Continuous Integration): mỗi lần push, hệ thống tự kiểm tra: lint, test, build.
- CD (Continuous Delivery hoặc Deployment): tự động đưa bản build tới nơi dùng (tester, store).

```
  Push code -> Pipeline -> Lint -> Test -> Build (APK, IPA) -> Phân phối -> Phát hành
```

Công cụ pipeline: GitHub Actions, GitLab CI, Bitrise, Jenkins. Phân phối thử: Firebase App
Distribution, TestFlight.

Fastlane không phải CI/CD. Nó là bộ script giúp các việc mobile (build, ký, upload lên
store) làm bằng một lệnh, được gọi bên trong pipeline.

### 23.2 Rollback

Rollback là khôi phục phiên bản trước sau khi phát hành lỗi, mục tiêu là hệ thống chạy lại
bình thường trong vài phút.

```
+----------+------------------------------------------------+----------------------------------------------+
|          | Backend                                        | App mobile                                   |
+==========+================================================+==============================================+
| Cách làm | Triển khai lại artifact cũ (ví dụ kéo lại      | Bản đã lên store không thu hồi tức thì được  |
|          | image v1.2 thay v1.3), hoặc chuyển traffic về  |                                              |
|          | bản cũ (blue-green)                            |                                              |
+----------+------------------------------------------------+----------------------------------------------+
| Công cụ  | Pipeline, Kubernetes, Helm rollback            | Phát hành theo giai đoạn (staged rollout),   |
|          |                                                | dừng phát hành, feature flag, Remote Config, |
|          |                                                | rollback OTA, bắt buộc cập nhật, phát hành   |
|          |                                                | bản hotfix                                   |
+----------+------------------------------------------------+----------------------------------------------+
```

### 23.3 Zero downtime deploy

Cập nhật mà người dùng không bị gián đoạn: không lỗi 500, không mất request. Nguyên tắc:
không tắt bản cũ trước khi bản mới sẵn sàng, và chuyển traffic an toàn.

```
+-------------------------------------------+--------------------------------------------------------------+
| Kỹ thuật                                  | Cách làm                                                     |
+===========================================+==============================================================+
| Rolling update                            | Thay dần từng instance cũ bằng instance mới                  |
+-------------------------------------------+--------------------------------------------------------------+
| Blue-green                                | Chạy song song hai môi trường, chuyển traffic sang môi       |
|                                           | trường mới khi sẵn sàng, giữ môi trường cũ để quay lại       |
+-------------------------------------------+--------------------------------------------------------------+
| Canary                                    | Cho một phần nhỏ người dùng dùng bản mới trước, ổn mới mở    |
|                                           | rộng                                                         |
+-------------------------------------------+--------------------------------------------------------------+
| Health check                              | Chỉ nhận traffic khi instance báo sẵn sàng                   |
+-------------------------------------------+--------------------------------------------------------------+
| Graceful shutdown                         | Instance cũ xử lý nốt request đang chạy rồi mới tắt          |
+-------------------------------------------+--------------------------------------------------------------+
| Migration cơ sở dữ liệu tương thích ngược | Thêm trước, bỏ sau, để bản cũ và bản mới cùng chạy được      |
+-------------------------------------------+--------------------------------------------------------------+
```

### 23.4 OTA Update (cập nhật không qua store)

OTA chỉ cập nhật JavaScript bundle và asset, không cập nhật code native.

```
  App v1.0.0 đang chạy bundle v1
  Bạn sửa UI, logic JS, API call -> build bundle mới -> đưa lên OTA server
  Người dùng mở app -> app hỏi OTA server -> có bundle mới -> tải -> chạy bundle v2
```

```
+------------------------------------------------------------------------+-------------------------------+
| Tình huống                                                             | OTA có dùng được không        |
+========================================================================+===============================+
| Sửa UI, logic JS, Redux, gọi API                                       | Dùng được                     |
+------------------------------------------------------------------------+-------------------------------+
| Thêm Native Module mới, SDK mới (Firebase, Camera, Push)               | Không, phải phát hành bản mới |
+------------------------------------------------------------------------+-------------------------------+
| Sửa AndroidManifest, Info.plist, code Kotlin, Java, Swift, Objective-C | Không                         |
+------------------------------------------------------------------------+-------------------------------+
```

Quy tắc quan trọng: bundle mới chỉ được tải cho bản app có code native tương thích (quản lý
bằng phiên bản runtime). Nếu không, app có thể crash. Cần thêm: rollback khi bundle lỗi,
theo dõi tỷ lệ crash sau mỗi lần phát hành, và kiểm tra chính sách của App Store, Google Play.

Giải pháp: Expo EAS Update, dịch vụ OTA của bên thứ ba, hoặc tự dựng OTA riêng. CodePush của
Microsoft đã ngừng cùng App Center (31/03/2025), kho mã đã lưu trữ; bản CodePush server tự host
không còn được hỗ trợ chính thức.

So sánh với ElectroGo:

```
+---------------------------+------------------------------------+-----------------------------------------+
|                           | OTA bundle toàn app                | Module Federation (ElectroGo)           |
+===========================+====================================+=========================================+
| Cập nhật được gì          | Toàn bộ JS của app                 | Từng mini app riêng lẻ                  |
+---------------------------+------------------------------------+-----------------------------------------+
| Phạm vi ảnh hưởng khi lỗi | Cả app                             | Chỉ mini app bị lỗi                     |
+---------------------------+------------------------------------+-----------------------------------------+
| Host (khung, native)      | Phải cập nhật qua store nếu đổi    | Giống vậy                               |
|                           | native                             |                                         |
+---------------------------+------------------------------------+-----------------------------------------+
| Phù hợp                   | App một khối cần hotfix nhanh      | Nhiều nhóm, nhiều chức năng phát hành   |
|                           |                                    | độc lập                                 |
+---------------------------+------------------------------------+-----------------------------------------+
```

Hai cách có thể dùng cùng nhau.

## 24. Kiến trúc và Super App

### 24.1 Hai kiểu super app

```
+--------------+---------------------------------------------+---------------------------------------------+
|              | Modular monolith (ghi chú gốc)              | Federated (ElectroGo)                       |
+==============+=============================================+=============================================+
| Cách tổ chức | Mỗi chức năng là một thư mục trong cùng một | Mỗi chức năng là một dự án và một bundle    |
|              | dự án (apps/home, payment...)               | riêng                                       |
+--------------+---------------------------------------------+---------------------------------------------+
| Build        | Một bundle chung                            | Mỗi mini app build riêng                    |
+--------------+---------------------------------------------+---------------------------------------------+
| Phát hành    | Cùng nhau, qua store                        | Độc lập, đưa file mới lên server            |
+--------------+---------------------------------------------+---------------------------------------------+
| Ưu điểm      | Đơn giản, dễ chia sẻ code                   | Nhóm độc lập, cập nhật nhanh, lỗi khoanh    |
|              |                                             | vùng                                        |
+--------------+---------------------------------------------+---------------------------------------------+
| Nhược điểm   | Mọi thay đổi phải phát hành lại app         | Phải thống nhất phiên bản thư viện chung,   |
|              |                                             | cấu hình phức tạp                           |
+--------------+---------------------------------------------+---------------------------------------------+
```

Nên nói khi phỏng vấn: nhiều người chỉ biết kiểu thứ nhất. Biết kiểu thứ hai và vì sao chọn
nó là điểm khác biệt của bạn.

### 24.2 Danh sách việc khi dựng super app kiểu modular (từ ghi chú gốc, đã gọn lại)

```
+----+---------------------------------------+-------------------------------------------------------------+
| #  | Việc                                  | Công cụ gợi ý                                               |
+====+=======================================+=============================================================+
| 1  | Khởi tạo dự án                        | npx @react-native-community/cli@latest init, hoặc Expo      |
+----+---------------------------------------+-------------------------------------------------------------+
| 2  | Cấu trúc thư mục theo chức năng       | apps/, shared/, navigation/, services/, store/,             |
|    |                                       | design-system/                                              |
+----+---------------------------------------+-------------------------------------------------------------+
| 3  | Điều hướng: Root, Auth, Main, Tab     | React Navigation                                            |
+----+---------------------------------------+-------------------------------------------------------------+
| 4  | Quản lý state                         | Redux Toolkit hoặc Zustand                                  |
+----+---------------------------------------+-------------------------------------------------------------+
| 5  | Lớp API                               | Axios hoặc fetch, tách file theo nghiệp vụ                  |
+----+---------------------------------------+-------------------------------------------------------------+
| 6  | Xác thực: đăng nhập, refresh token,   | react-native-keychain, react-native-biometrics              |
|    | sinh trắc học                         |                                                             |
+----+---------------------------------------+-------------------------------------------------------------+
| 7  | Design system: màu, chữ, khoảng cách, | Tự xây hoặc thư viện UI                                     |
|    | component dùng chung                  |                                                             |
+----+---------------------------------------+-------------------------------------------------------------+
| 8  | Lưu trữ cục bộ                        | MMKV, AsyncStorage                                          |
+----+---------------------------------------+-------------------------------------------------------------+
| 9  | Push notification                     | Firebase Messaging                                          |
+----+---------------------------------------+-------------------------------------------------------------+
| 10 | Analytics, theo dõi lỗi               | Firebase Analytics, Sentry, Crashlytics                     |
+----+---------------------------------------+-------------------------------------------------------------+
| 11 | Deep link                             | Universal Link, App Link                                    |
+----+---------------------------------------+-------------------------------------------------------------+
| 12 | OTA                                   | Expo Updates hoặc OTA riêng                                 |
+----+---------------------------------------+-------------------------------------------------------------+
| 13 | CI/CD                                 | GitHub Actions, GitLab CI, Fastlane                         |
+----+---------------------------------------+-------------------------------------------------------------+
| 14 | Monorepo (nếu cần)                    | Nx, Turborepo (ElectroGo dùng pnpm workspace và git         |
|    |                                       | submodule)                                                  |
+----+---------------------------------------+-------------------------------------------------------------+
| 15 | Checklist trước khi phát hành         | SSL Pinning, lưu trữ an toàn, nạp lười, tối ưu ảnh, giám    |
|    |                                       | sát, OTA                                                    |
+----+---------------------------------------+-------------------------------------------------------------+
```

Tích hợp AI: gọi qua backend của bạn, không đặt API key trong app.

### 24.3 Clean Architecture và cấu trúc theo chức năng

Clean Architecture chia ba tầng để dễ test, dễ thay đổi API và dễ mở rộng:

```
  Presentation   màn hình, component
       │
  Domain         use case, entity (logic nghiệp vụ, không phụ thuộc framework)
       │
  Data           API, repository, lưu trữ
```

Cấu trúc thư mục thường gặp:

```
  src/
    api  components  screens  navigation  hooks  store  services  utils  assets
```

Dự án lớn nên chia theo chức năng (feature-based): mỗi chức năng tự chứa màn hình, hook,
service, kiểu dữ liệu.

Trong ElectroGo: đã làm đúng cách này. Mỗi feature có screens, hooks, services, data, types,
index.ts và luồng một chiều screen, hook, service, mock hoặc http (xem mục 6.1).

### 24.4 Thiết kế hệ thống cho Mobile Banking (mức tổng quát)

```
  App -> API Gateway -> Auth Service
                     -> Account Service
                     -> Transaction Service
                     -> Notification Service
```

Trong app dùng Clean Architecture (Presentation, Domain, Data). Điểm cần nhấn mạnh: bảo mật
(mục 20), offline (mục 22), theo dõi lỗi, kiểm tra phiên bản bắt buộc cập nhật.

### 24.5 Câu hỏi cấp senior: app có 1 triệu người dùng thì cải thiện kiến trúc thế nào

Hỏi: Nếu app có 1 triệu người dùng, bạn cải thiện kiến trúc hiện tại thế nào?
  Đáp: Tôi chia thành các hướng: kiến trúc theo chức năng và tách module (có thể tách bundle
  độc lập), Clean Architecture, offline-first, tự động hóa CI/CD, giám sát lỗi và analytics,
  Remote Config và feature flag để bật tắt chức năng, chiến lược OTA và phát hành theo giai
  đoạn, đặt ngân sách hiệu năng (thời gian khởi động, FPS, dung lượng).

## 25. Thư viện thường gặp

```
+-------------------------------------+---------------------------------+----------------------------------+
| Thư viện                            | Chức năng                       | Ghi chú                          |
+=====================================+=================================+==================================+
| React Navigation                    | Điều hướng màn hình             | Stack, Tab, Drawer, deep link    |
+-------------------------------------+---------------------------------+----------------------------------+
| Redux Toolkit, react-redux          | Quản lý state toàn app          | Cách viết Redux hiện nay         |
+-------------------------------------+---------------------------------+----------------------------------+
| redux-thunk, redux-saga             | Xử lý bất đồng bộ trong Redux   | Thunk đơn giản, Saga mạnh cho    |
|                                     |                                 | luồng phức tạp                   |
+-------------------------------------+---------------------------------+----------------------------------+
| Axios                               | Gọi API HTTP                    | Interceptor, timeout, hủy        |
|                                     |                                 | request                          |
+-------------------------------------+---------------------------------+----------------------------------+
| React Native Reanimated             | Animation hiệu năng cao         | Chạy trên UI thread              |
+-------------------------------------+---------------------------------+----------------------------------+
| React Native Gesture Handler        | Cử chỉ: vuốt, kéo               | Dùng cùng Reanimated             |
+-------------------------------------+---------------------------------+----------------------------------+
| React Native Firebase               | Analytics, Push, Crashlytics    | Dynamic Links đã ngừng           |
+-------------------------------------+---------------------------------+----------------------------------+
| react-native-mmkv                   | Lưu dữ liệu cục bộ rất nhanh    | Nhanh hơn AsyncStorage           |
+-------------------------------------+---------------------------------+----------------------------------+
| AsyncStorage                        | Lưu key-value đơn giản          | Không dùng cho dữ liệu nhạy cảm  |
+-------------------------------------+---------------------------------+----------------------------------+
| react-native-keychain               | Lưu token an toàn               | Keychain (iOS), Keystore         |
|                                     |                                 | (Android)                        |
+-------------------------------------+---------------------------------+----------------------------------+
| react-native-config                 | Đọc biến môi trường từ file     | Tách cấu hình theo môi trường    |
|                                     | .env                            |                                  |
+-------------------------------------+---------------------------------+----------------------------------+
| react-native-device-info            | Thông tin thiết bị (model,      |                                  |
|                                     | phiên bản, ID)                  |                                  |
+-------------------------------------+---------------------------------+----------------------------------+
| react-native-fs                     | Đọc, ghi file trên máy          |                                  |
+-------------------------------------+---------------------------------+----------------------------------+
| react-native-webview                | Hiển thị web trong app          | Cẩn thận dữ liệu từ web (OWASP   |
|                                     |                                 | M4)                              |
+-------------------------------------+---------------------------------+----------------------------------+
| react-native-image-picker           | Chọn ảnh, chụp ảnh              |                                  |
+-------------------------------------+---------------------------------+----------------------------------+
| react-native-toast-message          | Thông báo nhanh dạng toast      |                                  |
+-------------------------------------+---------------------------------+----------------------------------+
| FlashList                           | Danh sách hiệu năng cao         | Thay thế FlatList khi danh sách  |
|                                     |                                 | rất lớn                          |
+-------------------------------------+---------------------------------+----------------------------------+
| expo-image, react-native-fast-image | Tải và cache ảnh                |                                  |
+-------------------------------------+---------------------------------+----------------------------------+
| react-native-biometrics             | Face ID, vân tay                |                                  |
+-------------------------------------+---------------------------------+----------------------------------+
| jail-monkey                         | Phát hiện root, jailbreak       |                                  |
+-------------------------------------+---------------------------------+----------------------------------+
| Sentry                              | Theo dõi lỗi, hiệu năng         |                                  |
+-------------------------------------+---------------------------------+----------------------------------+
```

## 26. Câu hỏi hành vi (behavioral)

### 26.1 Cách trả lời: STAR

```
+-----+----------------------+------------------------------------+
| Chữ | Nghĩa                | Nội dung                           |
+=====+======================+====================================+
| S   | Situation (bối cảnh) | Dự án gì, vấn đề gì                |
+-----+----------------------+------------------------------------+
| T   | Task (nhiệm vụ)      | Bạn chịu trách nhiệm điều gì       |
+-----+----------------------+------------------------------------+
| A   | Action (hành động)   | Bạn đã làm gì, vì sao chọn cách đó |
+-----+----------------------+------------------------------------+
| R   | Result (kết quả)     | Kết quả, càng có thật càng tốt     |
+-----+----------------------+------------------------------------+
```

Nhà tuyển dụng muốn thấy: cách giải quyết vấn đề, tư duy kỹ thuật, vai trò của bạn, kết quả.
Quan trọng: chỉ nói con số thật. Ví dụ mẫu trong ghi chú gốc (500.000 người dùng, 4 giây còn
1,5 giây) không phải của bạn.

### 26.2 Câu trả lời mẫu cho "kể về một dự án khó" bằng chính ElectroGo (đúng sự thật)

  Situation: cần đưa nhiều chức năng (Chấm công, Bán hàng) vào một app nhưng mỗi chức năng
  phải phát hành độc lập, không phải build lại cả app.
  Task: thiết kế cách nạp mini app lúc chạy; Metro không làm được điều này.
  Action: chuyển sang Re.Pack với Module Federation v2. Khai báo react, react-native,
  safe-area-context là singleton để tránh hai bản React. Viết kiểm tra manifest trước khi nạp
  và quản lý trạng thái tải bằng Promise thay vì Suspense để lỗi tải không bật màn đỏ. Ghi lại
  các lỗi gặp (enablePackageExports, trùng tên container, 10.0.2.2 trên Android) thành tài
  liệu setup.
  Result: mini app mở động từ server riêng, lỗi tải hoặc crash không làm sập app chủ, có quy
  trình thêm mini app mới. Hiện dữ liệu còn mock, chưa chạy production.

### 26.3 Các câu hỏi hành vi hay gặp và hướng trả lời

```
+-------------------------------------------+--------------------------------------------------------------+
| Câu hỏi                                   | Hướng trả lời                                                |
+===========================================+==============================================================+
| Deadline gấp mà code chưa tốt?            | Thống nhất phạm vi tối thiểu (MVP) với người phụ trách; giữ  |
|                                           | chất lượng ở phần cốt lõi, có test đường chính; ghi nợ kỹ    |
|                                           | thuật thành ticket rõ ràng; có kế hoạch trả nợ sau khi phát  |
|                                           | hành                                                         |
+-------------------------------------------+--------------------------------------------------------------+
| Xử lý mâu thuẫn trong team?               | Lắng nghe hai phía; quay về mục tiêu chung và dữ liệu thay   |
|                                           | vì ý kiến cá nhân; thử nghiệm nhỏ nếu còn tranh cãi; nhờ     |
|                                           | lead quyết khi cần; ghi lại quyết định và lý do              |
+-------------------------------------------+--------------------------------------------------------------+
| Mentor junior thế nào?                    | Giao việc vừa sức rồi tăng dần; review code kèm giải thích   |
|                                           | lý do, không chỉ sửa; pair programming; chia sẻ tài liệu; để |
|                                           | họ tự làm, không làm hộ                                      |
+-------------------------------------------+--------------------------------------------------------------+
| Quyết định kỹ thuật sai thì xử lý ra sao? | Nhận sớm và nói rõ; đánh giá mức ảnh hưởng; đề xuất cách sửa |
|                                           | (quay lại hoặc chuyển dần); rút bài học, họp rút kinh nghiệm |
|                                           | không đổ lỗi                                                 |
+-------------------------------------------+--------------------------------------------------------------+
| Production crash thì làm gì đầu tiên?     | Xác định phạm vi và mức ảnh hưởng (Crashlytics, Sentry);     |
|                                           | giảm thiểu ngay (rollback, tắt bằng feature flag, dừng       |
|                                           | staged rollout); báo cho các bên; tìm nguyên nhân gốc; phát  |
|                                           | hành hotfix; họp rút kinh nghiệm                             |
+-------------------------------------------+--------------------------------------------------------------+
| Debug lỗi không tái hiện được?            | Thu thập dữ liệu (log, breadcrumb, phiên bản app, hệ điều    |
|                                           | hành, thiết bị); tìm điểm chung giữa người bị lỗi; thử các   |
|                                           | điều kiện hiếm (mạng chậm, ít bộ nhớ, dữ liệu rỗng, race     |
|                                           | condition); thêm log hoặc giám sát có mục tiêu; bật thử cho  |
|                                           | nhóm nhỏ bằng feature flag                                   |
+-------------------------------------------+--------------------------------------------------------------+
```

## 27. Ôn nhanh: hỏi một câu, đáp một câu

```
+-------------------------------------------+--------------------------------------------------------------+
| Hỏi                                       | Đáp ngắn                                                     |
+===========================================+==============================================================+
| React Native hoạt động thế nào?           | JS và React mô tả UI, renderer chuyển thành view native.     |
|                                           | Kiến trúc mới dùng JSI và Fabric                             |
+-------------------------------------------+--------------------------------------------------------------+
| FlatList khác SectionList?                | FlatList đơn giản, SectionList có phân nhóm                  |
+-------------------------------------------+--------------------------------------------------------------+
| FlatList khác ScrollView?                 | ScrollView render hết, FlatList chỉ render phần đang hiển    |
|                                           | thị                                                          |
+-------------------------------------------+--------------------------------------------------------------+
| useEffect khác useLayoutEffect?           | useEffect chạy sau khi vẽ, không chặn. useLayoutEffect chạy  |
|                                           | trước khi vẽ, chặn UI                                        |
+-------------------------------------------+--------------------------------------------------------------+
| Bridge khác JSI?                          | Bridge: bất đồng bộ, serialize JSON. JSI: gọi trực tiếp C++  |
|                                           | hoặc native, không cần JSON                                  |
+-------------------------------------------+--------------------------------------------------------------+
| JSI là gì?                                | Lớp cho JS gọi trực tiếp code C++ hoặc native                |
+-------------------------------------------+--------------------------------------------------------------+
| TurboModules là gì?                       | Native Module thế hệ mới, nạp khi cần, có kiểu               |
+-------------------------------------------+--------------------------------------------------------------+
| Fabric là gì?                             | Renderer mới, đồng bộ tốt hơn, hỗ trợ concurrent React       |
+-------------------------------------------+--------------------------------------------------------------+
| Hermes là gì?                             | Engine JS tối ưu cho React Native, biên dịch trước thành     |
|                                           | bytecode                                                     |
+-------------------------------------------+--------------------------------------------------------------+
| AsyncStorage khác SecureStore?            | AsyncStorage không mã hóa. SecureStore dùng Keychain,        |
|                                           | Keystore, an toàn hơn nhưng chậm hơn                         |
+-------------------------------------------+--------------------------------------------------------------+
| MMKV khác AsyncStorage?                   | MMKV nhanh hơn nhiều (C++, memory-mapped file, đồng bộ)      |
+-------------------------------------------+--------------------------------------------------------------+
| Memory leak là gì?                        | Bộ nhớ không được giải phóng, RAM tăng dần. Phòng bằng       |
|                                           | cleanup trong useEffect                                      |
+-------------------------------------------+--------------------------------------------------------------+
| Context API khác Redux?                   | Context cho state nhỏ ít đổi. Redux cho app lớn, có          |
|                                           | middleware và DevTools                                       |
+-------------------------------------------+--------------------------------------------------------------+
| Thunk khác Saga?                          | Thunk đơn giản dùng async/await. Saga dùng generator, mạnh   |
|                                           | cho luồng phức tạp                                           |
+-------------------------------------------+--------------------------------------------------------------+
| Zustand là gì?                            | Thư viện state nhẹ, ít boilerplate                           |
+-------------------------------------------+--------------------------------------------------------------+
| Access Token khác Refresh Token?          | Access ngắn hạn để gọi API. Refresh dài hạn để xin Access    |
|                                           | mới                                                          |
+-------------------------------------------+--------------------------------------------------------------+
| Deep Link khác Universal Link?            | Deep Link dùng custom scheme. Universal Link dùng HTTPS, an  |
|                                           | toàn hơn                                                     |
+-------------------------------------------+--------------------------------------------------------------+
| OTA Update là gì?                         | Cập nhật JS bundle không qua store. Không cập nhật được code |
|                                           | native                                                       |
+-------------------------------------------+--------------------------------------------------------------+
| CI khác CD?                               | CI tự build và test khi push. CD tự đưa bản build đi phát    |
|                                           | hành                                                         |
+-------------------------------------------+--------------------------------------------------------------+
| Fastlane là gì?                           | Bộ script tự động hóa build, ký, upload app mobile           |
+-------------------------------------------+--------------------------------------------------------------+
| Native Module là gì?                      | Cầu nối để JS gọi tính năng native (Kotlin, Swift)           |
+-------------------------------------------+--------------------------------------------------------------+
| interface khác type?                      | interface mở rộng bằng extends. type linh hoạt với union,    |
|                                           | intersection                                                 |
+-------------------------------------------+--------------------------------------------------------------+
| React.memo khi nào vô tác dụng?           | Khi props là object hoặc hàm mới ở mỗi lần render            |
+-------------------------------------------+--------------------------------------------------------------+
| Thêm prop mới vào component dùng 100 nơi? | Cho prop optional và có giá trị mặc định                     |
+-------------------------------------------+--------------------------------------------------------------+
```

## Ghi chú cho người sửa file này

Đọc trước README.md (thư mục skills), mục "Quy ước khi sửa tài liệu skill". Riêng file này:

- Đây là tài liệu ôn phỏng vấn, viết cho người cần hiểu và giải thích được. Giữ giọng giải
  thích dễ hiểu, có ví dụ, không rút gọn thành bullet khô.
- Phần I (mục 1 đến 13): mọi đoạn code, tên file, con số phải lấy từ repo thật. Đổi code ở
  rspack.config.mjs, remotes.ts, RootNavigator.tsx thì sửa lại mục 4, 5 và 12.
- Phần II (mục 14 đến 27): kiến thức chung. Khi thêm ghi chú mới, kiểm chứng trước. Nếu ghi
  chú gốc sai hoặc lỗi thời thì ghi vào bảng sửa nhanh ở mục 14, rồi viết lại cho đúng ở
  mục chủ đề.
- Không đưa số liệu giả vào ví dụ trả lời (ví dụ "giảm từ 4 giây xuống 1,5 giây"). Chỉ dùng
  số thật của dự án.
- Chỗ nào phụ thuộc phiên bản hoặc ngày tháng (Flipper, CodePush, Dynamic Links, OWASP, New
  Architecture) thì nên kiểm tra lại khi đọc sau một thời gian.
- Thông tin setup từng bước và quy tắc nằm ở SKILL.md. Ở đây chỉ giải thích vì sao và cách
  hoạt động.
- Bảng dùng dạng kẻ khung theo README, sơ đồ nằm trong code block thụt lề 2 khoảng trắng.
- Giữ mục 9 (điểm yếu) trung thực. Không viết như hệ thống đã chạy production khi dữ liệu
  còn mock.
