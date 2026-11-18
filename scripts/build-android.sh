#!/usr/bin/env bash
# Build app host ra file .apk và .aab để upload (web phân phối, Google Play).
# Chạy: `pnpm build:android` ở thư mục gốc ElectroGo.
#
# Kết quả (build/release/, đã được .gitignore):
#   ElectroGo-<versionName>-<versionCode>.apk   cài trực tiếp / upload web phân phối
#   ElectroGo-<versionName>-<versionCode>.aab   upload lên Google Play Console
#
# Biến môi trường (tùy chọn):
#   ELECTROGO_VERSION_CODE   số nguyên, phải tăng mỗi lần đưa lên Google Play (mặc định 1)
#   ELECTROGO_VERSION_NAME   chuỗi hiển thị, ví dụ 1.0.3 (mặc định 1.0)
#   ELECTROGO_KEYSTORE, ELECTROGO_KEYSTORE_PASSWORD, ELECTROGO_KEY_ALIAS, ELECTROGO_KEY_PASSWORD
#                            khóa ký release. Không có thì ký bằng debug.keystore (xem cảnh báo cuối).
#
# Tạo khóa upload một lần (cất file ở ngoài repo, nhớ sao lưu):
#   keytool -genkeypair -v -keystore ~/keys/electrogo-upload.jks -alias electrogo \
#     -keyalg RSA -keysize 2048 -validity 10000

set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$PWD"

# Đọc cấu hình cục bộ (không đưa lên git) nếu có: scripts/build.local.env, xem build.local.env.example
if [ -f scripts/build.local.env ]; then
  set -a
  # shellcheck disable=SC1091
  . scripts/build.local.env
  set +a
fi

# Địa chỉ web phân phối bundle: tự tìm nếu chưa đặt, rồi nhúng vào app
# shellcheck disable=SC1091
. scripts/deploy-url.sh

# Gradle 9 + Android Gradle Plugin chạy ổn với JDK 17; JDK mới hơn (25) dễ lỗi.
if JDK17="$(/usr/libexec/java_home -v 17 2>/dev/null)"; then
  export JAVA_HOME="$JDK17"
fi

if [ -z "${ANDROID_HOME:-}" ] && [ ! -f android/local.properties ]; then
  if [ -d "$HOME/Library/Android/sdk" ]; then
    export ANDROID_HOME="$HOME/Library/Android/sdk"
  else
    echo "Không tìm thấy Android SDK. Cài Android Studio hoặc đặt ANDROID_HOME." >&2
    exit 1
  fi
fi

VERSION_NAME="${ELECTROGO_VERSION_NAME:-1.0}"
VERSION_CODE="${ELECTROGO_VERSION_CODE:-1}"

echo "==> Build release APK + AAB (versionName $VERSION_NAME, versionCode $VERSION_CODE)"
# Chỉ build module app (:app:). Không ghi rõ thì Gradle chạy cả bước kiểm tra tài nguyên của từng thư viện và lỗi.
# --rerun: Gradle không coi biến môi trường (DEPLOY_API_URL) là đầu vào của bước đóng gói JS, nên có thể dùng lại
# bundle cũ và app vẫn mang địa chỉ cũ. Ép chạy lại bước này mỗi lần.
(cd android && ./gradlew :app:createBundleReleaseJsAndAssets --rerun :app:assembleRelease :app:bundleRelease)

OUT="$ROOT/build/release"
BASE="ElectroGo-${VERSION_NAME}-${VERSION_CODE}"
mkdir -p "$OUT"
cp android/app/build/outputs/apk/release/app-release.apk "$OUT/$BASE.apk"
cp android/app/build/outputs/bundle/release/app-release.aab "$OUT/$BASE.aab"

echo ""
echo "Đã build:"
ls -lh "$OUT/$BASE.apk" "$OUT/$BASE.aab"

if [ -z "${ELECTROGO_KEYSTORE:-}" ] && ! grep -qs "ELECTROGO_KEYSTORE" "$HOME/.gradle/gradle.properties"; then
  echo ""
  echo "CẢNH BÁO: chưa cấu hình ELECTROGO_KEYSTORE nên file được ký bằng khóa debug."
  echo "          APK cài và upload web phân phối được, nhưng Google Play sẽ từ chối AAB này."
fi
