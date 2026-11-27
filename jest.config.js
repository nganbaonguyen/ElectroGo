// pnpm để file thật trong node_modules/.pnpm/<gói>/node_modules/<gói>, nên mẫu bỏ qua mặc định của preset
// khớp ngay đoạn "node_modules/.pnpm" và không biên dịch các gói react-native (lỗi "Cannot use import statement").
// Bỏ qua ".pnpm" để mẫu xét tới đoạn node_modules/<gói> phía sau.
const TRANSFORM_PACKAGES = [
  '\\.pnpm',
  '(jest-)?react-native',
  '@react-native(-community)?',
  '@react-native-vector-icons',
  '@react-native-firebase',
  '@bravemobile',
  '@module-federation',
  '@callstack',
];

module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [`node_modules/(?!(${TRANSFORM_PACKAGES.join('|')})/)`],
};
