import {ComponentType} from 'react';
import {MiniAppKey} from '../features/home';

const PROBE_TIMEOUT_MS = 4000;

/** Props mà mọi mini app nhận: `initialRoute` là màn hình mở thẳng (rỗng = màn hình trung tâm của mini app). */
export type MiniAppProps = {initialRoute?: string};

/**
 * Kiểm tra server của mini app có trả lời không TRƯỚC khi nạp.
 * Nếu bỏ qua bước này, khi server chưa chạy thì runtime Module Federation tự ném lỗi nội bộ
 * và React Native hiện màn đỏ (LogBox) ở chế độ dev. Kiểm tra trước giúp báo lỗi gọn, nhanh.
 */
async function ensureReachable(key: MiniAppKey): Promise<void> {
  // Biến do rspack.config.mjs chèn lúc build. Nếu thiếu (server dev còn chạy cấu hình cũ,
  // cần khởi động lại `pnpm start:dev`) thì bỏ qua bước kiểm tra thay vì làm sập app.
  if (typeof __REMOTE_MANIFESTS__ === 'undefined') {
    return;
  }
  const url = __REMOTE_MANIFESTS__[key];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(url, {signal: controller.signal});
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch {
    throw new Error(`Không kết nối được tới mini app (${url})`);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Bảng nạp mini app: khóa -> hàm import động (Module Federation).
 * Mini app được tải từ server của nó lúc người dùng bấm vào ô trên Home, không nằm sẵn trong bundle host.
 * Thêm mini app mới: thêm dòng ở đây, khai báo kiểu trong src/types/remotes.d.ts và thêm remote
 * vào rspack.config.mjs.
 */
const LOADERS: Record<MiniAppKey, () => Promise<{default: ComponentType<MiniAppProps>}>> = {
  work: async () => {
    await ensureReachable('work');
    return import('work/App');
  },
  sale: async () => {
    await ensureReachable('sale');
    return import('sale/App');
  },
};

/**
 * Tải mini app và trả về component gốc. Lỗi được trả về dưới dạng Promise bị từ chối
 * (không ném lỗi trong lúc render) để màn hình báo lỗi tự xử lý, không bật màn đỏ của chế độ dev.
 */
export function loadMiniApp(key: MiniAppKey): Promise<ComponentType<MiniAppProps>> {
  return LOADERS[key]().then(module => module.default);
}
