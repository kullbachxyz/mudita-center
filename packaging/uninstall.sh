#!/usr/bin/env bash
# Remove the files placed by install.sh.  (For a makepkg/pacman install use
# `sudo pacman -R mudita-center-mmd` instead.)
#
#   sudo bash uninstall.sh
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Run with root:  sudo bash $0" >&2
  exit 1
fi

rm -f  /usr/bin/mudita-center
rm -f  /usr/share/applications/mudita-center.desktop
rm -f  /usr/share/icons/hicolor/512x512/apps/mudita-center.png
rm -rf /opt/mudita-center

command -v gtk-update-icon-cache >/dev/null 2>&1 && gtk-update-icon-cache -qtf /usr/share/icons/hicolor || true
command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database /usr/share/applications || true

echo "Uninstalled mudita-center."
