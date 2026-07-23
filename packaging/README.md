# Packaging — Mudita Center (MMD monochrome build)

Installs the locally-built AppImage system-wide, AUR-style: AppImage in
`/opt/mudita-center/`, a `mudita-center` launcher in `/usr/bin`, and an icon +
desktop entry in `/usr/share`.

First build the AppImage (once, or after any change):

```sh
cd ..                      # repo root
export PATH="$PWD/.toolchain/node-v24.14.0-linux-x64/bin:$PATH"
npm run build:linux        # -> apps/app/release/Mudita-Center.AppImage
```

## Option A — pacman-tracked (recommended on Arch)

```sh
makepkg -si                # builds mudita-center-mmd and installs via pacman
```

Remove with `sudo pacman -R mudita-center-mmd`. Rebuild after a new AppImage
by bumping `pkgrel` and re-running `makepkg -si`.

## Option B — plain script install (no makepkg)

```sh
sudo bash install.sh
sudo bash uninstall.sh     # to remove
```

Either way you get the `mudita-center` command and a "Mudita Center (MMD)"
entry in your app menu / dmenu. The launcher uses FUSE if present and falls
back to `--appimage-extract-and-run` otherwise.
