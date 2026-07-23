/**
 * Copyright (c) Mudita sp. z o.o. All rights reserved.
 * For licensing, see https://github.com/mudita/mudita-center/blob/master/LICENSE.md
 */

export const columnWidth = 7.2
export const gutterWidth = 3.2

// Raw palettes consumed by legacy-theme/color.ts. Light = original upstream;
// dark = MMD monochrome (neutrals inverted + surface ramp, accents kept).
export const legacyLightPalette = {
  blue1: "#40749a",
  blue2: "#6d9bbc",
  blue3: "#aebec9",
  blue4: "#e3f3ff",
  blue5: "#f2f7fa",
  black: "#000000",
  grey1: "#3b3f42",
  grey2: "#6a6a6a",
  grey3: "#a5a5a5",
  grey4: "#d2d6db",
  grey5: "#f4f5f6",
  grey6: "#fbfbfb",
  transparentBlack1: "rgba(0, 0, 0, 0.05)",
  transparentBlack2: "rgba(0, 0, 0, 0.08)",
  transparentBlack3: "rgba(0, 0, 0, 0.3)",
  red: "#e96a6a",
  green: "#dfefde",
  orange: "#FD9900",
  darkOrange: "#DD802A",
  white: "#ffffff",
} as const

export const legacyDarkPalette = {
  blue1: "#40749a",
  blue2: "#6d9bbc",
  blue3: "#aebec9",
  blue4: "#e3f3ff",
  blue5: "#f2f7fa",
  black: "#ffffff",
  grey1: "#c4c0bd",
  grey2: "#959595",
  grey3: "#5a5a5a",
  grey4: "#3a3a3a",
  grey5: "#1c1c1c",
  grey6: "#040404",
  transparentBlack1: "rgba(255, 255, 255, 0.05)",
  transparentBlack2: "rgba(255, 255, 255, 0.08)",
  transparentBlack3: "rgba(255, 255, 255, 0.3)",
  red: "#e96a6a",
  green: "#dfefde",
  orange: "#FD9900",
  darkOrange: "#DD802A",
  white: "#000000",
} as const

export type LegacyPalette = typeof legacyLightPalette
