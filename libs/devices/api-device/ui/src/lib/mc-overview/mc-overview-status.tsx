/**
 * Copyright (c) Mudita sp. z o.o. All rights reserved.
 * For licensing, see https://github.com/mudita/mudita-center/blob/master/LICENSE.md
 */

import { FunctionComponent } from "react"
import { IconSize } from "app-theme/models"
import styled from "styled-components"
import { Icon } from "app-theme/ui"
import { McOverview } from "devices/api-device/models"

type Props = Pick<NonNullable<McOverview["status"]>, "fields">

export const McOverviewStatus: FunctionComponent<Props> = ({ fields }) => {
  return (
    <Wrapper>
      {fields.map((field, index) => (
        <IconTextWrapper key={index}>
          <IconWrapper>
            <Icon type={field.icon} size={IconSize.Big} />
          </IconWrapper>
          <TextWrapper>
            <TitleText>{field.text}</TitleText>
            {Boolean(field.subText) && <DetailText>{field.subText}</DetailText>}
          </TextWrapper>
        </IconTextWrapper>
      ))}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 1.6rem;
`

const IconTextWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1.6rem;
  flex: 0;
  min-height: 4.4rem;
  height: 4.4rem;
  align-items: center;
`
const IconWrapper = styled.div`
  /* grey6 is the page background (near-black); use a lifted surface so the
     status icon tile is visible in the dark theme. */
  background-color: ${({ theme }) => theme.app.color.grey7};
  min-width: 4rem;
  min-height: 4rem;
  max-width: 4rem;
  max-height: 4rem;
  border-radius: ${({ theme }) => theme.app.radius.sm};
  display: flex;
  justify-content: center;
  align-items: center;
  /* icon glyphs ship with a dark fill; invert so they read light on the
     dark surface tile. */
  > * {
    filter: invert(1);
  }
`

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
`

const TitleText = styled.h4`
  font-size: ${({ theme }) => theme.app.fontSize.headline4};
  font-weight: 700;
  line-height: ${({ theme }) => theme.app.lineHeight.headline4};
  letter-spacing: 0.032rem;
  margin: 0;
  /* h4 had no explicit colour and inherited a dark value; pin it to the
     primary-text token so the status value is visible on the dark theme. */
  color: ${({ theme }) => theme.app.color.black};
`
const DetailText = styled.span`
  font-size: ${({ theme }) => theme.app.fontSize.detailText};
  line-height: ${({ theme }) => theme.app.lineHeight.detailText};
  letter-spacing: 0.048rem;
  color: ${({ theme }) => theme.app.color.grey2};
`
