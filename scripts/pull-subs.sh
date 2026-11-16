#!/usr/bin/env bash
# Kéo code 2 mini app (electro-go-work, electro-go-sale) về thành 2 thư mục riêng
# nằm chung trong một thư mục cha. Chưa có thì clone, đã có thì pull.
#
# Dùng:
#   pnpm subs            hiện menu chọn
#   pnpm subs all        kéo cả hai (không hỏi)
#   pnpm subs work|sale  kéo riêng một cái (không hỏi)
#
# Thư mục đích mặc định: sub/ ngay trong project ElectroGo (đã được .gitignore).
#   sub/electro-go-sale  và  sub/electro-go-work
# Đổi bằng biến môi trường:  SUBS_DIR=~/code/subs pnpm subs

set -euo pipefail

OWNER_URL="https://github.com/nganbaonguyen"
SUBS_DIR="${SUBS_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/sub}"

pull_one() {
  local name="$1" dir="$SUBS_DIR/$1"
  echo ""
  echo "==> $name"
  if [ -d "$dir/.git" ]; then
    echo "Đã có, đang pull..."
    git -C "$dir" pull --ff-only
  else
    echo "Chưa có, đang clone vào $dir ..."
    git clone "$OWNER_URL/$name.git" "$dir"
  fi
}

run() {
  mkdir -p "$SUBS_DIR"
  case "$1" in
    all)  pull_one electro-go-sale; pull_one electro-go-work ;;
    sale) pull_one electro-go-sale ;;
    work) pull_one electro-go-work ;;
    *)    echo "Lựa chọn không hợp lệ: $1" >&2; exit 1 ;;
  esac
  echo ""
  echo "Xong. Code nằm ở: $(cd "$SUBS_DIR" && pwd)"
}

# Có tham số thì chạy thẳng, không hiện menu
if [ "$#" -ge 1 ]; then
  run "$1"
  exit 0
fi

echo "Kéo code mini app về: $SUBS_DIR"
echo ""
echo "  1) Tất cả (sale + work)"
echo "  2) Kéo sale  (electro-go-sale)"
echo "  3) Kéo work  (electro-go-work)"
echo "  0) Thoát"
echo ""
read -r -p "Chọn [0-3]: " choice

case "$choice" in
  1) run all ;;
  2) run sale ;;
  3) run work ;;
  0) echo "Đã thoát." ;;
  *) echo "Lựa chọn không hợp lệ: $choice" >&2; exit 1 ;;
esac
