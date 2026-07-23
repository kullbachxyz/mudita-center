/**
 * Copyright (c) Mudita sp. z o.o. All rights reserved.
 * For licensing, see https://github.com/mudita/mudita-center/blob/master/LICENSE.md
 */

import { DotNotation } from "app-utils/models"

export const color = {
  // MMD monochrome: neutrals inverted (255-c), alpha overlays flipped to white,
  // accents (blue/red/green/orange) kept at original values.
  // grey4/5/7/8 are further lifted from their pure-inverted near-black values
  // into a visible dark "elevated surface" ramp, so boxes/tiles/checkboxes/
  // separators read against the near-black base (grey6/white). grey6 stays the
  // near-black page background.
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

export type AppColor = DotNotation<typeof color>
