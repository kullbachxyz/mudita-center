/**
 * Copyright (c) Mudita sp. z o.o. All rights reserved.
 * For licensing, see https://github.com/mudita/mudita-center/blob/master/LICENSE.md
 */

import { DotNotation } from "app-utils/models"

// Original upstream light palette.
export const lightColor = {
  white: "#FFFFFF",
  black: "#000000",
  blackAlpha: {
    light: "rgba(0, 0, 0, 0.08)",
    medium: "rgba(0, 0, 0, 0.3)",
  },
  blue1: "#40749A",
  blue2: "#6D9BBC",
  blue3: "#AEBEC9",
  blue4: "#E3F3FF",
  blue5: "#F2F7FA",
  blue6: "#6D9BBC",
  grey0: "#2A2A2A",
  grey1: "#3B3F42",
  grey2: "#6A6A6A",
  grey3: "#A5A5A5",
  grey4: "#D2D6DB",
  grey5: "#F4F5F6",
  grey6: "#FBFBFB",
  grey7: "#EDEDED",
  grey8: "#E7E7E9",
  red: "#E96A6A",
  green: "#DFEFDE",
  orange: "#DD802A",
} as const

// MMD monochrome dark palette: neutrals inverted (255-c), alpha overlays flipped
// to white, accents (blue/red/green/orange) kept. grey4/5/7/8 are lifted from
// their pure-inverted near-black values into a visible "elevated surface" ramp;
// grey6/white stay the near-black page base.
export const darkColor = {
  white: "#000000",
  black: "#FFFFFF",
  blackAlpha: {
    light: "rgba(255, 255, 255, 0.08)",
    medium: "rgba(255, 255, 255, 0.3)",
  },
  blue1: "#40749A",
  blue2: "#6D9BBC",
  blue3: "#AEBEC9",
  blue4: "#E3F3FF",
  blue5: "#F2F7FA",
  blue6: "#6D9BBC",
  grey0: "#D5D5D5",
  grey1: "#C4C0BD",
  grey2: "#959595",
  grey3: "#5A5A5A",
  grey4: "#3A3A3A",
  grey5: "#1C1C1C",
  grey6: "#040404",
  grey7: "#242424",
  grey8: "#2A2A2A",
  red: "#E96A6A",
  green: "#DFEFDE",
  orange: "#DD802A",
} as const

// Default export used by static importers (theme index, colour-swatch list).
// The active palette is selected per mode in theme.ts.
export const color = darkColor

export type AppColor = DotNotation<typeof color>
