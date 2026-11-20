// Dùng Re.Pack (Rspack) thay cho Metro cho các lệnh `react-native start` và `react-native bundle`.
module.exports = {
  commands: require('@callstack/repack/commands'),
  // Firebase Crashlytics tạm chỉ chạy trên Android: iOS chưa build được với React Native 0.88.1 + Firebase 27
  // (bản này bắt buộc dynamic frameworks, không liên kết được với lõi React Native). Bỏ hai dòng ios: null khi đã xử lý xong.
  dependencies: {
    '@react-native-firebase/app': {platforms: {ios: null}},
    '@react-native-firebase/crashlytics': {platforms: {ios: null}},
  },
};
