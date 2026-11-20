import type {Crashlytics} from '@react-native-firebase/crashlytics';

type CrashlyticsModule = typeof import('@react-native-firebase/crashlytics');

/**
 * Gửi lỗi lên Firebase Crashlytics. Mọi hàm đều nuốt lỗi: thiếu phần native (iOS hiện chưa có),
 * chưa có file cấu hình Firebase (google-services.json) hoặc chạy trong test thì app vẫn chạy bình thường.
 * Dùng require trong try vì thiếu module native thì ngay lúc import đã ném lỗi.
 */
function safely(action: (api: CrashlyticsModule, crashlytics: Crashlytics) => void) {
  try {
    const api = require('@react-native-firebase/crashlytics') as CrashlyticsModule;
    action(api, api.getCrashlytics());
  } catch {
    // Firebase chưa sẵn sàng trên nền tảng này
  }
}

/** Gọi một lần khi mở app. Chế độ dev không gửi báo cáo để khỏi lẫn lỗi lúc đang viết code. */
export function initMonitoring() {
  safely((api, crashlytics) => {
    api.setCrashlyticsCollectionEnabled(crashlytics, !__DEV__).catch(() => {});
  });
}

/** Ghi lỗi của một mini app (không làm sập app), kèm tên mini app để lọc trên Firebase. */
export function reportMiniAppError(error: unknown, miniApp: string) {
  safely((api, crashlytics) => {
    api.setAttributes(crashlytics, {miniApp}).catch(() => {});
    api.recordError(crashlytics, error instanceof Error ? error : new Error(String(error)));
  });
}
