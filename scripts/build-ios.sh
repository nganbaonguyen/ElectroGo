#!/usr/bin/env bash
# Build app host ra file .ipa (iOS). Chạy: `pnpm build:ios` ở thư mục gốc ElectroGo, cần máy Mac có Xcode.
#
# Kết quả: build/release/ElectroGo-<versionName>-<versionCode>.ipa  (build/ đã được .gitignore)
#
# Biến môi trường:
#   ELECTROGO_IOS_TEAM_ID        BẮT BUỘC. Team ID ký app (10 ký tự). Quên thì chạy script, nó sẽ liệt kê
#                                các Team ID tìm thấy trong Keychain.
#   ELECTROGO_IOS_EXPORT_METHOD  development (mặc định) | ad-hoc | app-store-connect | enterprise
#                                  development       cài lên máy đã đăng ký UDID trong provisioning profile
#                                  ad-hoc            như trên, dùng chứng chỉ Distribution
#                                  app-store-connect upload lên App Store Connect / TestFlight
#                                                    (cần chứng chỉ Distribution và Bundle ID đã tạo trên Apple)
#   ELECTROGO_VERSION_NAME       hiển thị, ví dụ 1.0.3 (mặc định 1.0)
#   ELECTROGO_VERSION_CODE       build number, phải tăng mỗi lần upload App Store Connect (mặc định 1)
#   ELECTROGO_IOS_BUNDLE_ID      ghi đè Bundle ID (mặc định giữ giá trị trong Xcode project)
#
# Xcode cần đăng nhập Apple ID của team (Xcode > Settings > Accounts) để tự tạo provisioning profile.

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

if [ -z "${ELECTROGO_IOS_TEAM_ID:-}" ]; then
  echo "Thiếu ELECTROGO_IOS_TEAM_ID. Các Team ID tìm thấy trong Keychain:" >&2
  security find-identity -v -p codesigning 2>/dev/null | grep -oE '"[^"]+"' | tr -d '"' | while read -r name; do
    ou="$(security find-certificate -c "$name" -p 2>/dev/null | openssl x509 -noout -subject 2>/dev/null \
      | sed -n 's/.*OU=\([A-Z0-9]*\).*/\1/p')"
    [ -n "$ou" ] && echo "  $ou   ($name)" >&2
  done
  echo "Ví dụ: ELECTROGO_IOS_TEAM_ID=ABCDE12345 pnpm build:ios" >&2
  exit 1
fi

TEAM="$ELECTROGO_IOS_TEAM_ID"
METHOD="${ELECTROGO_IOS_EXPORT_METHOD:-development}"
VERSION_NAME="${ELECTROGO_VERSION_NAME:-1.0}"
VERSION_CODE="${ELECTROGO_VERSION_CODE:-1}"

OUT="$ROOT/build/release"
WORK="$OUT/.ios"
ARCHIVE="$WORK/ElectroGo.xcarchive"
rm -rf "$WORK"
mkdir -p "$WORK"

EXTRA=()
[ -n "${ELECTROGO_IOS_BUNDLE_ID:-}" ] && EXTRA+=("PRODUCT_BUNDLE_IDENTIFIER=$ELECTROGO_IOS_BUNDLE_ID")

echo "==> Archive iOS (team $TEAM, versionName $VERSION_NAME, build $VERSION_CODE)"
xcodebuild archive \
  -workspace ios/ElectroGo.xcworkspace \
  -scheme ElectroGo \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVE" \
  -allowProvisioningUpdates \
  DEVELOPMENT_TEAM="$TEAM" \
  CODE_SIGN_STYLE=Automatic \
  MARKETING_VERSION="$VERSION_NAME" \
  CURRENT_PROJECT_VERSION="$VERSION_CODE" \
  ${EXTRA[@]+"${EXTRA[@]}"} \
  > "$WORK/archive.log" 2>&1 || {
    echo "Archive lỗi, xem $WORK/archive.log (dòng cuối):" >&2
    grep -E "error:|\*\* ARCHIVE FAILED" "$WORK/archive.log" | tail -8 >&2
    exit 1
  }

cat > "$WORK/ExportOptions.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key><string>$METHOD</string>
  <key>teamID</key><string>$TEAM</string>
  <key>signingStyle</key><string>automatic</string>
  <key>stripSwiftSymbols</key><true/>
</dict>
</plist>
PLIST

echo "==> Export .ipa (method $METHOD)"
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE" \
  -exportPath "$WORK/export" \
  -exportOptionsPlist "$WORK/ExportOptions.plist" \
  -allowProvisioningUpdates \
  > "$WORK/export.log" 2>&1 || {
    echo "Export lỗi, xem $WORK/export.log (dòng cuối):" >&2
    grep -E "error:|\*\* EXPORT FAILED" "$WORK/export.log" | tail -8 >&2
    exit 1
  }

IPA="$(ls "$WORK"/export/*.ipa | head -1)"
DEST="$OUT/ElectroGo-${VERSION_NAME}-${VERSION_CODE}.ipa"
cp "$IPA" "$DEST"
rm -rf "$WORK/export" "$ARCHIVE"

echo ""
echo "Đã build:"
ls -lh "$DEST"
