/**
 * Copyright (c) Mudita sp. z o.o. All rights reserved.
 * For licensing, see https://github.com/mudita/mudita-center/blob/master/LICENSE.md
 */

import { FunctionComponent, useState } from "react"
import styled from "styled-components"
import {
  Data,
  SettingsActionsWrapper,
  SettingsLabel,
  SettingsTableRow,
  SettingsWrapper,
} from "../settings/settings-ui.styled"
import { ButtonSize, ButtonType, TextDisplayStyle } from "app-theme/models"
import { borderColor } from "app-theme/utils"
import { FormattedMessage } from "react-intl"
import { Button, Modal, RadioInput } from "app-theme/ui"
import { defineMessages, formatMessage } from "app-localize/utils"

export type ThemeSetting = "system" | "light" | "dark"

const messages = defineMessages({
  label: { id: "page.settingsAppearance.label" },
  modalTitle: { id: "page.settingsAppearance.modalTitle" },
  system: { id: "page.settingsAppearance.system" },
  light: { id: "page.settingsAppearance.light" },
  dark: { id: "page.settingsAppearance.dark" },
})

const options: ThemeSetting[] = ["system", "light", "dark"]

const AppearanceTableRow = styled(SettingsTableRow)`
  grid-template-columns: 1fr 20.8rem;
  border-bottom: solid 0.1rem ${borderColor("list")};
  width: 100%;
`

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  width: 100%;
  margin-top: 1.6rem;
`

interface AppearanceProps {
  theme: ThemeSetting
  onChange: (value: ThemeSetting) => void
}

export const Appearance: FunctionComponent<AppearanceProps> = ({
  theme,
  onChange,
}) => {
  const [opened, setOpened] = useState(false)

  return (
    <SettingsWrapper>
      <AppearanceTableRow>
        <Data>
          <SettingsLabel displayStyle={TextDisplayStyle.Paragraph1}>
            <FormattedMessage id={messages.label.id} />
          </SettingsLabel>
        </Data>
        <SettingsActionsWrapper>
          <Button
            type={ButtonType.Secondary}
            size={ButtonSize.Large}
            onClick={() => setOpened(true)}
            data-testid="settings-theme-button"
          >
            {formatMessage(messages[theme])}
          </Button>
        </SettingsActionsWrapper>
      </AppearanceTableRow>

      <Modal opened={opened} onAfterClose={() => setOpened(false)}>
        <Modal.CloseButton onClick={() => setOpened(false)} />
        <Modal.Title text={formatMessage(messages.modalTitle)} />
        <OptionList>
          {options.map((option) => (
            <RadioInput
              key={option}
              name="settings-theme"
              checked={theme === option}
              onChange={() => onChange(option)}
            >
              {formatMessage(messages[option])}
            </RadioInput>
          ))}
        </OptionList>
      </Modal>
    </SettingsWrapper>
  )
}
