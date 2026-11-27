import React, {ComponentType, useEffect, useState, useSyncExternalStore} from 'react';
import {AppState, DevSettings, Platform} from 'react-native';
import type {ReleaseHistoryInterface, UpdateCheckRequest} from '@bravemobile/react-native-code-push';
import otaConfig from '../../ota.config.json';

/**
 * Cập nhật OTA cho app host (JS bundle) bằng @bravemobile/react-native-code-push.
 * Bản OTA và lịch sử phát hành nằm trên GitHub Releases của repo (release `ota-<identifier>`),
 * do `pnpm code-push-live` (chạy tay trên nhánh release/v<phiên bản>) đưa lên. Tên file phải khớp code-push.config.js.
 *
 * Luồng:
 * - Kiểm tra khi mở app và mỗi lần app quay lại từ nền.
 * - Tải ngầm, thanh cập nhật trên Home (OtaUpdateBanner) hiện tiến trình; tải xong tự cài và khởi động lại
 *   ngay, người dùng không phải bấm gì. Việc kiểm tra chỉ chạy lúc mở app / quay lại app nên thường rơi vào
 *   vài giây đầu sau khi mở.
 * - Bản mới làm app sập trước khi chạy xong thì lần mở sau tự quay về bản trước (rollback của CodePush).
 */

/** "1.0" -> "1.0.0": lịch sử OTA đặt tên theo semver đủ 3 số (giống scripts/ota/release.mjs). */
export function toSemver(version: string): string {
  const parts = `${version}`.split('.').concat(['0', '0']).slice(0, 3);
  return parts.map(p => String(parseInt(p, 10) || 0)).join('.');
}

/** Đọc lịch sử phát hành của đúng bản app đang chạy (versionName / CFBundleShortVersionString). */
async function releaseHistoryFetcher(request: UpdateCheckRequest): Promise<ReleaseHistoryInterface> {
  const {repo, identifier} = otaConfig;
  const binary = toSemver(request.app_version);
  const url =
    `https://github.com/${repo}/releases/download/ota-${identifier}/` +
    `history-${Platform.OS}-${identifier}-${binary}.json`;
  const res = await fetch(url, {headers: {'Cache-Control': 'no-cache'}});
  if (!res.ok) {
    // 404: bản app này chưa có bản OTA nào. Thư viện coi như không có cập nhật.
    throw new Error(`OTA: không đọc được lịch sử phát hành (HTTP ${res.status})`);
  }
  return res.json();
}

// ── Trạng thái cập nhật, để giao diện (OtaUpdateBanner) hiển thị ──

export type OtaPhase = 'idle' | 'downloading' | 'installing' | 'ready';
export type OtaState = {
  phase: OtaPhase;
  /** 0..1, khi đang tải */
  progress: number;
  /** Đang xem thử trong chế độ dev (menu dev "Xem thử thanh cập nhật OTA"), không có bản thật. */
  preview: boolean;
};

let state: OtaState = {phase: 'idle', progress: 0, preview: false};
const listeners = new Set<() => void>();

function setState(patch: Partial<OtaState>) {
  state = {...state, ...patch};
  listeners.forEach(l => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useOtaState(): OtaState {
  return useSyncExternalStore(subscribe, () => state);
}

// ── Gọi thư viện (chỉ bản Release) ──

let CodePush: any = null; // nạp trong withOta: chế độ dev và jest không có phần native

function sync() {
  if (!CodePush || state.phase === 'downloading' || state.phase === 'installing') {
    return;
  }
  const S = CodePush.SyncStatus;
  CodePush.sync(
    {
      // Tải xong là cài và khởi động lại luôn (cả bản thường lẫn bản bắt buộc)
      installMode: CodePush.InstallMode.IMMEDIATE,
      mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE,
    },
    (status: number) => {
      switch (status) {
        case S.DOWNLOADING_PACKAGE:
          setState({phase: 'downloading', progress: 0});
          break;
        case S.INSTALLING_UPDATE:
          setState({phase: 'installing', progress: 1});
          break;
        case S.UPDATE_INSTALLED:
          // Bản mới tải: thư viện tự khởi động lại (IMMEDIATE). Bản tải từ trước còn đang chờ áp dụng
          // (app cũ cài theo kiểu "lần mở sau"): tự khởi động lại sau một nhịp để người dùng kịp thấy thông báo.
          setState({phase: 'ready', progress: 1});
          setTimeout(applyOtaUpdate, 1200);
          break;
        case S.UP_TO_DATE:
        case S.UPDATE_IGNORED:
        case S.UNKNOWN_ERROR:
          if (state.phase !== 'ready') {
            setState({phase: 'idle', progress: 0});
          }
          break;
      }
    },
    ({receivedBytes, totalBytes}: {receivedBytes: number; totalBytes: number}) => {
      if (totalBytes > 0) {
        setState({progress: receivedBytes / totalBytes});
      }
    },
  ).catch(() => {
    // Lỗi mạng...: thử lại ở lần quay lại app kế tiếp
  });
}

/** Áp dụng bản đã tải ngay: khởi động lại JS (nút "Cập nhật" trên thanh cập nhật). */
export function applyOtaUpdate() {
  if (state.preview) {
    setState({phase: 'idle', progress: 0, preview: false});
    return;
  }
  CodePush?.restartApp(true); // true: chỉ khởi động lại khi thật sự có bản đang chờ
}

/**
 * Dòng phiên bản để hiển thị (màn Hồ sơ): bản app và bản OTA đang chạy, ví dụ "Phiên bản 1.0 · Bản cập nhật 1.0.1".
 * Giúp biết máy người dùng đã nhận OTA chưa.
 */
export function useAppVersionText(): string {
  const [text, setText] = useState(`Phiên bản ${otaConfig.binaryVersion}${__DEV__ ? ' · dev' : ''}`);
  useEffect(() => {
    if (!CodePush) {
      return;
    }
    let cancelled = false;
    CodePush.getUpdateMetadata(CodePush.UpdateState.RUNNING)
      .then((pkg: {appVersion?: string; label?: string} | null) => {
        if (!cancelled && pkg?.label) {
          setText(`Phiên bản ${pkg.appVersion ?? otaConfig.binaryVersion} · Bản cập nhật ${pkg.label}`);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return text;
}

/** Chế độ dev: giả lập tải rồi xong một bản cập nhật để xem giao diện thanh cập nhật. */
export function previewOtaUpdate() {
  let progress = 0;
  setState({phase: 'downloading', progress, preview: true});
  const timer = setInterval(() => {
    progress += 0.07;
    if (progress >= 1) {
      clearInterval(timer);
      setState({phase: 'ready', progress: 1});
    } else {
      setState({progress});
    }
  }, 150);
}

/**
 * Bọc component gốc để tự kiểm tra và cài bản OTA.
 * Chế độ dev không bọc (JS lấy từ dev server); thay vào đó thêm mục "Xem thử thanh cập nhật OTA" vào menu dev.
 */
export function withOta<P extends object>(App: ComponentType<P>): ComponentType<P> {
  if (__DEV__) {
    try {
      DevSettings.addMenuItem('Xem thử thanh cập nhật OTA', previewOtaUpdate);
    } catch {
      // jest không có menu dev
    }
    return App;
  }

  // Thư viện xuất kiểu CommonJS (module.exports = CodePush): require trả thẳng hàm, không có .default.
  // Giữ cả hai cách để không vỡ nếu thư viện đổi sang ES module.
  const mod = require('@bravemobile/react-native-code-push');
  CodePush = mod.default ?? mod;
  // MANUAL: thư viện chỉ báo "app chạy ổn" (chống rollback nhầm); việc kiểm tra do sync() ở trên làm để lấy tiến trình
  const Wrapped: ComponentType<P> = CodePush({
    checkFrequency: CodePush.CheckFrequency.MANUAL,
    releaseHistoryFetcher,
  })(App);

  return function OtaRoot(props: P) {
    useEffect(() => {
      sync();
      const sub = AppState.addEventListener('change', next => {
        if (next === 'active') {
          sync();
        }
      });
      return () => sub.remove();
    }, []);
    return <Wrapped {...props} />;
  };
}
