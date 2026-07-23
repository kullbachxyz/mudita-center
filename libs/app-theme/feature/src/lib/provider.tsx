/**
 * Copyright (c) Mudita sp. z o.o. All rights reserved.
 * For licensing, see https://github.com/mudita/mudita-center/blob/master/LICENSE.md
 */

import {
  ComponentProps,
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from "react"
import styled, { StyleSheetManager, ThemeProvider } from "styled-components"
import isPropValid from "@emotion/is-prop-valid"
import { Normalize } from "styled-normalize"
import { GlobalStyle } from "./global-style"
import { themes, ThemeMode } from "app-theme/utils"
import { useSettings } from "app-settings/renderer"

const prefersDarkQuery = "(prefers-color-scheme: dark)"

// Tracks the OS colour-scheme preference (used when the setting is "system").
const useSystemPrefersDark = (): boolean => {
  const [prefersDark, setPrefersDark] = useState<boolean>(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia(prefersDarkQuery).matches
      : true
  )

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return
    }
    const mq = window.matchMedia(prefersDarkQuery)
    const handler = (event: MediaQueryListEvent) => setPrefersDark(event.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  return prefersDark
}

export const AppThemeProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const { data: settings } = useSettings()
  const prefersDark = useSystemPrefersDark()

  const setting = settings?.user?.theme ?? "system"
  const mode: ThemeMode =
    setting === "light"
      ? "light"
      : setting === "dark"
        ? "dark"
        : prefersDark
          ? "dark"
          : "light"

  return (
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <ThemeProvider theme={themes[mode]}>
        <GlobalStyle />
        <Normalize />
        {children}
        <TooltipPortalContainer id={"tooltip-portal"} />
      </ThemeProvider>
    </StyleSheetManager>
  )
}

type ShouldForwardProp = ComponentProps<
  typeof StyleSheetManager
>["shouldForwardProp"]

const shouldForwardProp: ShouldForwardProp = (prop, target) => {
  if (typeof target === "string") {
    return isPropValid(prop)
  }
  return true
}

const TooltipPortalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99999;
  pointer-events: none;
`
