const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration (KHÔNG còn dùng để chạy app).
 * App này dùng Re.Pack (Rspack): xem rspack.config.mjs và react-native.config.js.
 * File này giữ lại ở dạng mặc định để công cụ nào còn đọc Metro vẫn hoạt động.
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
module.exports = mergeConfig(getDefaultConfig(__dirname), {});
