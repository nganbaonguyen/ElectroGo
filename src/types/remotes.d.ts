/**
 * Khai báo kiểu cho các mini app nạp động qua Module Federation.
 * Tên module = <tên remote>/<tên expose>; khớp với `name` trong rspack.config.mjs của host
 * và `exposes: {'./App': ...}` trong rspack.config.mjs của từng mini app.
 */
declare module 'work/App' {
  const WorkApp: import('react').ComponentType<{initialRoute?: string}>;
  export default WorkApp;
}

declare module 'sale/App' {
  const SaleApp: import('react').ComponentType<{initialRoute?: string}>;
  export default SaleApp;
}

/** Cấu hình phân phối bundle (DEPLOY_STATIC_URL, DEPLOY_API_URL, DEPLOY_APP_ID, DEPLOY_ENV), do rspack.config.mjs chèn lúc build. */
declare const __DEPLOY_CONFIG__: {apiUrl: string; staticUrl: string; appId: string; env: 'live' | 'prod' | 'staging'};

/** Địa chỉ mf-manifest.json của từng mini app, do rspack.config.mjs (DefinePlugin) chèn lúc build. */
declare const __REMOTE_MANIFESTS__: Record<'work' | 'sale', string>;
