#!/usr/bin/env bash
# Được `source` bởi build-android.sh và build-ios.sh. Xác định địa chỉ web phân phối bundle (DEPLOY_API_URL)
# để NHÚNG vào app Release. Thiếu địa chỉ này app sẽ nạp mini app từ địa chỉ cố định của dev
# (10.0.2.2:9001), điện thoại thật không bao giờ tải được.
#
# Thứ tự: biến DEPLOY_API_URL (build.local.env hoặc môi trường) > web đang chạy ở máy này (cổng 8080)
# > IP LAN của máy. Đặt DEPLOY_API_URL=none để cố ý build không dùng web (nạp từ địa chỉ cố định).

DEPLOY_WEB_PORT="${DEPLOY_WEB_PORT:-8080}"

if [ "${DEPLOY_API_URL:-}" = "none" ]; then
  export DEPLOY_API_URL=""
  echo "==> DEPLOY_API_URL=none: app nạp mini app từ địa chỉ cố định (chỉ dùng được khi dev)"
else
  if [ -z "${DEPLOY_API_URL:-}" ]; then
    # Hỏi chính web đang chạy: nó đã xếp sẵn các địa chỉ LAN theo độ ưu tiên (hotspot, WiFi...)
    DEPLOY_API_URL="$(curl -s -m 3 "http://localhost:$DEPLOY_WEB_PORT/api/network" 2>/dev/null \
      | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const d=JSON.parse(s);console.log((d.links&&d.links[0]&&d.links[0].url)||"")}catch{console.log("")}})' 2>/dev/null || true)"
  fi
  if [ -z "${DEPLOY_API_URL:-}" ]; then
    IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
    [ -n "$IP" ] && DEPLOY_API_URL="http://$IP:$DEPLOY_WEB_PORT"
  fi
  if [ -z "${DEPLOY_API_URL:-}" ]; then
    echo "Không xác định được địa chỉ web phân phối. Đặt DEPLOY_API_URL=http://<IP>:8080 trong scripts/build.local.env" >&2
    echo "(hoặc DEPLOY_API_URL=none nếu cố ý không dùng web)." >&2
    exit 1
  fi
  DEPLOY_API_URL="${DEPLOY_API_URL%/}"
  export DEPLOY_API_URL

  echo "==> Nhúng địa chỉ web phân phối vào app: $DEPLOY_API_URL"
  case "$DEPLOY_API_URL" in
    http://*) export ELECTROGO_ALLOW_CLEARTEXT=1 ;; # Android Release chặn http thường nếu không bật
  esac

  # Kiểm tra từ máy này (điện thoại có thể vẫn bị chặn bởi mạng; xem cảnh báo cuối script)
  if curl -s -m 4 -o /dev/null "$DEPLOY_API_URL/api/health"; then
    echo "    Web trả lời được từ máy này."
  else
    echo "    CẢNH BÁO: máy này không gọi được $DEPLOY_API_URL (web chưa chạy? chạy: npm run mobile)." >&2
  fi
fi
