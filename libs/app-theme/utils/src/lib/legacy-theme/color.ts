/**
 * Copyright (c) Mudita sp. z o.o. All rights reserved.
 * For licensing, see https://github.com/mudita/mudita-center/blob/master/LICENSE.md
 */

import {
  LegacyPalette,
  legacyDarkPalette,
  legacyLightPalette,
} from "./constants"

const makeLegacyColor = (c: LegacyPalette) => ({
  text: {
    accent: c.grey5,
    action: c.blue2,
    active: c.white,
    disabled: c.grey3,
    error: c.red,
    primary: c.black,
    secondary: c.grey2,
    iconBody: c.white,
    iconUser: c.blue3,
    tabHover: c.grey1,
    actionHover: c.blue1,
    warning: c.orange,
    info: c.grey1,
  },
  background: {
    activity: c.blue2,
    disabled: c.grey4,
    icon: c.blue5,
    main: c.grey6,
    message: c.blue5,
    minor: c.grey5,
    primary: c.grey1,
    primaryHover: c.black,
    row: c.white,
    scroll: c.grey2,
    super: c.black,
    chartBar: c.blue4,
    modal: c.white,
    modalBackdrop: c.transparentBlack3,
    error: c.red,
    lightIcon: c.white,
    green: c.green,
  },
  border: {
    white: c.white,
    error: c.red,
    hover: c.grey1,
    list: c.grey4,
    primary: c.black,
    secondary: c.grey4,
    separator: c.grey4,
    smallSeparator: c.grey4,
    verticalSeparator: c.grey3,
    tetheringSeparator: c.blue3,
    deviceListSeparator: c.grey5,
    deviceListSeparatorHover: c.grey4,
    warning: c.darkOrange,
  },
  boxShadow: {
    full: c.transparentBlack2,
    light: c.transparentBlack1,
  },
})

export const legacyLightColor = makeLegacyColor(legacyLightPalette)
export const legacyDarkColor = makeLegacyColor(legacyDarkPalette)

// Default used by the static theme index; active palette selected in theme.ts.
export const color = legacyDarkColor
