/**
 * Copyright (c) Mudita sp. z o.o. All rights reserved.
 * For licensing, see https://github.com/mudita/mudita-center/blob/master/LICENSE.md
 */

import { appTheme } from "./app-theme"
import { darkColor, lightColor } from "./app-theme/color"
import { legacyTheme } from "./legacy-theme"
import { legacyDarkColor, legacyLightColor } from "./legacy-theme/color"

export type { AppColor } from "./app-theme/color"

export type ThemeMode = "light" | "dark"

// Light and dark share every non-colour token; only the palettes differ.
const buildTheme = (mode: ThemeMode) => ({
  app: { ...appTheme, color: mode === "dark" ? darkColor : lightColor },
  legacy: {
    ...legacyTheme,
    color: mode === "dark" ? legacyDarkColor : legacyLightColor,
  },
  mode,
})

export const darkTheme = buildTheme("dark")
export const lightTheme = buildTheme("light")

export const themes = {
  light: lightTheme,
  dark: darkTheme,
}

// Static default (dark) for code that imports the theme object directly.
export const theme = darkTheme

export type Theme = typeof darkTheme
