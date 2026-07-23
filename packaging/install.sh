#!/usr/bin/env bash
# AUR-style system install for the MMD monochrome Mudita Center build.
# Layout mirrors a distro package: AppImage in /opt, launcher in /usr/bin,
# icon + desktop entry in /usr/share.
#
#   sudo bash install.sh
#
# For a pacman-tracked install instead, use the PKGBUILD:  makepkg -si
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "This installer writes to /opt, /usr/bin and /usr/share — run it with root:" >&2
  echo "  sudo bash $0" >&2
  exit 1
fi

HERE="$(cd "$(dirname "$(realpath "$0")")" && pwd)"
REPO="$(cd "$HERE/.." && pwd)"
APPIMAGE="$REPO/apps/app/release/Mudita-Center.AppImage"
ICON="$REPO/apps/app/resources/icons/icon.png"

if [ ! -f "$APPIMAGE" ]; then
  echo "AppImage not found at $APPIMAGE" >&2
  echo "Build it first:  cd $REPO && npm run build:linux" >&2
  exit 1
fi

install -Dm755 "$APPIMAGE"                 /opt/mudita-center/Mudita-Center.AppImage
install -Dm755 "$HERE/mudita-center"       /usr/bin/mudita-center
install -Dm644 "$HERE/mudita-center.desktop" /usr/share/applications/mudita-center.desktop
install -Dm644 "$ICON"                     /usr/share/icons/hicolor/512x512/apps/mudita-center.png

# Refresh desktop/icon caches (best-effort; harmless if the tools are absent).
command -v gtk-update-icon-cache >/dev/null 2>&1 && gtk-update-icon-cache -qtf /usr/share/icons/hicolor || true
command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database /usr/share/applications || true

echo "Installed:"
echo "  /usr/bin/mudita-center                 (run from a terminal / dmenu)"
echo "  desktop entry 'Mudita Center (MMD)'    (app menu)"
echo "Uninstall with:  sudo bash $HERE/uninstall.sh"
