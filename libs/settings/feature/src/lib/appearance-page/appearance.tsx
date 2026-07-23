/**
 * Copyright (c) Mudita sp. z o.o. All rights reserved.
 * For licensing, see https://github.com/mudita/mudita-center/blob/master/LICENSE.md
 */

import { FunctionComponent } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  AppSettings,
  settingsQueryKeys,
  useSettings,
} from "app-settings/renderer"
import { Appearance, ThemeSetting } from "settings/ui"

export const SettingsAppearancePage: FunctionComponent = () => {
  const { data: settings } = useSettings()
  const queryClient = useQueryClient()

  const theme: ThemeSetting = settings?.user?.theme ?? "system"

  const onChange = async (value: ThemeSetting) => {
    const current = await AppSettings.get()
    await AppSettings.set({
      ...current,
      user: {
        ...current.user,
        theme: value,
      },
    })
    // Refresh the settings query so AppThemeProvider re-themes immediately.
    await queryClient.invalidateQueries({
      queryKey: [settingsQueryKeys.all],
    })
  }

  return <Appearance theme={theme} onChange={onChange} />
}
