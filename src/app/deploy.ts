import {Platform} from 'react-native';
import {MiniAppKey} from '../features/home';

const RESOLVE_TIMEOUT_MS = 6000;

/**
 * Cấu hình hệ thống phân phối bundle (web web-deployment-apk), do rspack.config.mjs chèn lúc build
 * từ biến môi trường DEPLOY_API_URL / DEPLOY_APP_ID / DEPLOY_ENV. Chưa đặt DEPLOY_API_URL thì
 * app nạp mini app từ địa chỉ cố định trong REMOTES (chế độ dev: server pnpm start:module).
 */
export function isDeployEnabled(): boolean {
  return typeof __DEPLOY_CONFIG__ !== 'undefined' && __DEPLOY_CONFIG__.apiUrl !== '';
}

/**
 * Hỏi web xem bản nào của mini app đang được phục vụ (bản tích LIVE) và lấy địa chỉ mf-manifest.json.
 * Lỗi (web không trả lời, chưa có bản LIVE...) được ném ra để MiniAppHost hiện màn báo lỗi có nút Thử lại.
 */
export async function resolveManifestUrl(key: MiniAppKey): Promise<string> {
  const {apiUrl, appId, env} = __DEPLOY_CONFIG__;
  // Ứng dụng mặc định dùng /api, ứng dụng khác dùng /api/apps/<id> (xem server/apps.js của web)
  const base = appId === 'electrogo' ? '/api' : `/api/apps/${appId}`;
  const url = `${apiUrl}${base}/bundles/${key}/resolve?platform=${Platform.OS}&env=${env}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RESOLVE_TIMEOUT_MS);
  try {
    const res = await fetch(url, {signal: controller.signal});
    const data = (await res.json().catch(() => ({}))) as {manifestUrl?: string; error?: string};
    if (!res.ok || !data.manifestUrl) {
      throw new Error(data.error ?? `HTTP ${res.status}`);
    }
    return data.manifestUrl;
  } catch (e) {
    const reason = e instanceof Error && e.name !== 'AbortError' ? e.message : 'không kết nối được';
    throw new Error(`Không lấy được bản mini app "${key}" từ ${apiUrl} (${reason})`);
  } finally {
    clearTimeout(timer);
  }
}
