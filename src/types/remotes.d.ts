/**
 * Khai báo kiểu cho các mini app nạp động qua Module Federation.
 * Tên module = <tên remote>/<tên expose>; khớp với `name` trong rspack.config.mjs của host
 * và `exposes: {'./App': ...}` trong rspack.config.mjs của từng mini app.
 */
declare module 'work/App' {
  const WorkApp: import('react').ComponentType;
  export default WorkApp;
}

declare module 'sale/App' {
  const SaleApp: import('react').ComponentType;
  export default SaleApp;
}

/** Địa chỉ mf-manifest.json của từng mini app, do rspack.config.mjs (DefinePlugin) chèn lúc build. */
declare const __REMOTE_MANIFESTS__: Record<'work' | 'sale', string>;
