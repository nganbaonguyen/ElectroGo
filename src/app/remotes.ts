import {ComponentType} from 'react';
import {loadRemote, registerRemotes} from '@module-federation/enhanced/runtime';
import {MiniAppKey} from '../features/home';
import {isDeployEnabled, resolveManifestUrl} from './deploy';

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

type MiniAppModule = {default: ComponentType<MiniAppProps>};

/**
 * Nạp mini app theo bản LIVE trên web phân phối: hỏi web địa chỉ manifest hiện tại, đăng ký lại remote
 * với địa chỉ đó (force: thay địa chỉ cũ) rồi nạp. Nhờ vậy đổi bản LIVE trên web là app nạp bản mới,
 * không cần build lại host.
 */
async function loadFromDeploy(key: MiniAppKey): Promise<MiniAppModule> {
  const entry = await resolveManifestUrl(key);
  registerRemotes([{name: key, entry}], {force: true});
  const mod = await loadRemote<MiniAppModule>(`${key}/App`);
  if (!mod) {
    throw new Error(`Không nạp được mini app "${key}" (${entry})`);
  }
  return mod;
}

/**
 * Bảng nạp mini app: khóa -> hàm import động (Module Federation).
 * Có DEPLOY_API_URL (bản build phát hành) thì nạp bản LIVE từ web; không có thì nạp từ địa chỉ cố định (dev).
 * Mini app được tải từ server của nó lúc người dùng bấm vào ô trên Home, không nằm sẵn trong bundle host.
 * Thêm mini app mới: thêm dòng ở đây, khai báo kiểu trong src/types/remotes.d.ts và thêm remote
 * vào rspack.config.mjs.
 */
const LOADERS: Record<MiniAppKey, () => Promise<{default: ComponentType<MiniAppProps>}>> = {
  work: async () => {
    if (isDeployEnabled()) {
      return loadFromDeploy('work');
    }
    await ensureReachable('work');
    return import('work/App');
  },
  sale: async () => {
    if (isDeployEnabled()) {
      return loadFromDeploy('sale');
    }
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
