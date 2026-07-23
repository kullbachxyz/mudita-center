# Mudita Center — MMD Monochrome Dark Build

A fork of [mudita/mudita-center](https://github.com/mudita/mudita-center) themed
as a monochrome / e-ink-style **dark** UI. Branch: `mmd-monochrome`.

## What it changes

- **Theme setting** — Settings ▸ Appearance ▸ Theme picker: **System / Light /
  Dark** (default System, following the OS via `prefers-color-scheme`). Light is
  the original upstream palette; Dark is the MMD monochrome one below. Switches
  live. Persisted in `app-settings.json` (`user.theme`).
- **Palette inverted to dark** — neutrals inverted, alpha overlays flipped,
  colour accents (blue/red/green/orange) kept. Files:
  - `libs/app-theme/utils/src/lib/app-theme/color.ts` (modern palette)
  - `libs/app-theme/utils/src/lib/legacy-theme/constants.ts` (legacy screens)
- **Elevated-surface ramp** so boxes/tiles/checkboxes/separators read against
  the near-black base (`grey6`/`white` stay near-black; `grey4/5/7/8` lifted).
- **Illustrations** (`welcome-screen` diagram, `splash.html`) flipped to light
  line-art via CSS `filter: invert(1) grayscale(1) brightness(1.5)`.
- **`::selection`** given a monochrome highlight (was browser-default blue).
- **Baked-dark icons** (status tiles, file categories) inverted per-component
  with `filter: invert(1)` — nav/sidebar icons already follow theme colour.
- Fixed a status value that inherited a dark colour → pinned to primary text.

## Build

Requires **Node 24.14.0** (repo pins it via `engine-strict`). A throwaway copy
lives in `.toolchain/` (git-ignored) so the system Node is untouched:

```sh
export PATH="$PWD/.toolchain/node-v24.14.0-linux-x64/bin:$PATH"
npm ci
```

Two build inputs that Mudita's own infra provides but a public clone lacks —
both already handled in this branch, except the fonts copy which is a one-time
local step (the `main` font dir is git-ignored and normally downloaded from a
private repo):

```sh
# brand fonts are private; use the bundled fallback (Roboto Condensed)
cp -r apps/app/resources/fonts/fallback apps/app/resources/fonts/main
```

(The `sql.js` extensionless-import crash is fixed in source; `electron-builder`'s
private publish config was removed for local builds.)

Then:

```sh
npm start              # dev build with HMR (nx serve app / electron-vite dev)
npm run build:linux    # -> apps/app/release/Mudita-Center.AppImage
```

## Install

See [`packaging/`](packaging/README.md) — `makepkg -si` (pacman-tracked) or
`sudo bash packaging/install.sh`. Gives a `/usr/bin/mudita-center` launcher and
an app-menu entry.

## Updating (rebuild + reinstall after a change)

The full loop after editing the source (assumes `npm ci` + fonts copy already
done once):

Rebuild the AppImage:

```sh
cd ~/.local/src/mudita-center
export PATH="$PWD/.toolchain/node-v24.14.0-linux-x64/bin:$PATH"
npm run build:linux
```

Then bump `pkgrel` in `packaging/PKGBUILD` (e.g. `2` → `3`) so pacman treats it
as an upgrade, and rebuild + install the package:

```sh
cd packaging
makepkg -sfi
```

`makepkg -sfi` = sync deps / force-overwrite existing pkg / install (prompts for
sudo). To just try a change without installing, run `npm start` (dev,
hot-reload) instead.

Note: paste these one line at a time — interactive zsh does not treat `#` as a
comment, so avoid trailing `# ...` comments on command lines.

## Notes

- A **locked** device answers with HTTP 423 and data screens hang at
  "Loading 0%" — unlock the phone (PIN) first.
- Logs: `~/.config/mudita-center/new-logs/*.log`.
- Rebase on upstream releases: `git fetch upstream && git rebase upstream/develop`,
  then rebuild.
