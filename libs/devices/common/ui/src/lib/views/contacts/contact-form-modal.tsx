/**
 * Copyright (c) Mudita sp. z o.o. All rights reserved.
 * For licensing, see https://github.com/mudita/mudita-center/blob/master/LICENSE.md
 */

import { FunctionComponent, useEffect } from "react"
import styled from "styled-components"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { Button, IconButton, Modal, TextInput, Typography } from "app-theme/ui"
import {
  ButtonSize,
  ButtonType,
  IconSize,
  IconType,
  TextInputVariant,
} from "app-theme/models"
import { defineMessages, formatMessage } from "app-localize/utils"
import {
  AddressType,
  Contact,
  EmailAddressType,
  PhoneNumberType,
} from "devices/common/models"

const messages = defineMessages({
  addTitle: { id: "apiDevice.contacts.form.addTitle" },
  editTitle: { id: "apiDevice.contacts.form.editTitle" },
  firstName: { id: "apiDevice.contacts.form.firstName" },
  lastName: { id: "apiDevice.contacts.form.lastName" },
  phone: { id: "apiDevice.contacts.form.phone" },
  email: { id: "apiDevice.contacts.form.email" },
  company: { id: "apiDevice.contacts.form.company" },
  notes: { id: "apiDevice.contacts.form.notes" },
  other: { id: "apiDevice.contacts.form.other" },
  addPhone: { id: "apiDevice.contacts.form.addPhone" },
  addEmail: { id: "apiDevice.contacts.form.addEmail" },
  address: { id: "apiDevice.contacts.form.address" },
  street: { id: "apiDevice.contacts.form.street" },
  street2: { id: "apiDevice.contacts.form.street2" },
  zip: { id: "apiDevice.contacts.form.zip" },
  city: { id: "apiDevice.contacts.form.city" },
  state: { id: "apiDevice.contacts.form.state" },
  country: { id: "apiDevice.contacts.form.country" },
  save: { id: "general.app.saveButton.text" },
  cancel: { id: "general.app.cancelButton.text" },
})

export interface ContactFormAddress {
  streetAddress: string
  secondStreetAddress: string
  poBox: string
  city: string
  state: string
  zipCode: string
  country: string
  type: AddressType
}

export interface ContactFormValues {
  contactId?: string
  firstName: string
  lastName: string
  company: string
  notes: string
  phoneNumbers: {
    id?: string
    phoneNumber: string
    phoneType: PhoneNumberType
  }[]
  emailAddresses: {
    id?: string
    emailAddress: string
    emailType: EmailAddressType
  }[]
  address: ContactFormAddress
}

const emptyAddress: ContactFormAddress = {
  streetAddress: "",
  secondStreetAddress: "",
  poBox: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  type: AddressType.Home,
}

const emptyPhone = { phoneNumber: "", phoneType: PhoneNumberType.Mobile }
const emptyEmail = { emailAddress: "", emailType: EmailAddressType.Home }

const emptyValues: ContactFormValues = {
  firstName: "",
  lastName: "",
  company: "",
  notes: "",
  phoneNumbers: [{ ...emptyPhone }],
  emailAddresses: [{ ...emptyEmail }],
  address: emptyAddress,
}

// Device may emit types in any case (e.g. "OTHER"); match case-insensitively.
const coercePhoneType = (value: unknown): PhoneNumberType => {
  const v = String(value ?? "").toLowerCase()
  return (Object.values(PhoneNumberType) as string[]).includes(v)
    ? (v as PhoneNumberType)
    : PhoneNumberType.Mobile
}

const coerceEmailType = (value: unknown): EmailAddressType => {
  const v = String(value ?? "").toLowerCase()
  return (Object.values(EmailAddressType) as string[]).includes(v)
    ? (v as EmailAddressType)
    : EmailAddressType.Home
}

const coerceAddressType = (value: unknown): AddressType => {
  const v = String(value ?? "").toLowerCase()
  return (Object.values(AddressType) as string[]).includes(v)
    ? (v as AddressType)
    : AddressType.Home
}

const toFormValues = (contact?: Contact): ContactFormValues => {
  if (!contact) {
    return emptyValues
  }
  return {
    contactId: contact.contactId,
    firstName: contact.firstName ?? "",
    lastName: contact.lastName ?? "",
    company: contact.company ?? "",
    notes: contact.notes ?? "",
    // Always show at least one phone/email field for a consistent layout;
    // empty ones are dropped on save.
    phoneNumbers: contact.phoneNumbers?.length
      ? contact.phoneNumbers.map((p) => ({
          id: p.id,
          phoneNumber: p.phoneNumber,
          phoneType: coercePhoneType(p.phoneType),
        }))
      : [{ ...emptyPhone }],
    emailAddresses: contact.emailAddresses?.length
      ? contact.emailAddresses.map((e) => ({
          id: e.id,
          emailAddress: e.emailAddress,
          emailType: coerceEmailType(e.emailType),
        }))
      : [{ ...emptyEmail }],
    address: contact.address
      ? {
          streetAddress: contact.address.streetAddress ?? "",
          secondStreetAddress: contact.address.secondStreetAddress ?? "",
          poBox: contact.address.poBox ?? "",
          city: contact.address.city ?? "",
          state: contact.address.state ?? "",
          zipCode: contact.address.zipCode ?? "",
          country: contact.address.country ?? "",
          type: coerceAddressType(contact.address.type),
        }
      : { ...emptyAddress },
  }
}

interface Props {
  opened: boolean
  contact?: Contact
  onClose: () => void
  onSave: (values: ContactFormValues) => Promise<void>
}

export const ContactFormModal: FunctionComponent<Props> = ({
  opened,
  contact,
  onClose,
  onSave,
}) => {
  const { register, control, handleSubmit, reset } = useForm<ContactFormValues>(
    {
      defaultValues: toFormValues(contact),
    }
  )

  useEffect(() => {
    if (opened) {
      reset(toFormValues(contact))
    }
  }, [opened, contact, reset])

  // keyName "_key" so react-hook-form's internal key doesn't clobber our
  // data "id" field (needed to update phones/emails in place on the device).
  const phones = useFieldArray({
    control,
    name: "phoneNumbers",
    keyName: "_key",
  })
  const emails = useFieldArray({
    control,
    name: "emailAddresses",
    keyName: "_key",
  })

  const submit = handleSubmit(async (values) => {
    await onSave({
      ...values,
      contactId: contact?.contactId,
      phoneNumbers: values.phoneNumbers.filter((p) => p.phoneNumber.trim()),
      emailAddresses: values.emailAddresses.filter((e) =>
        e.emailAddress.trim()
      ),
    })
    onClose()
  })

  return (
    <Modal
      opened={opened}
      onAfterClose={onClose}
      customStyles={{ width: "48rem", maxHeight: "80vh" }}
    >
      <Modal.CloseButton onClick={onClose} />
      <Modal.Title
        text={formatMessage(contact ? messages.editTitle : messages.addTitle)}
      />
      <Fields>
        <Row>
          <TextInput
            variant={TextInputVariant.Outlined}
            placeholder={formatMessage(messages.firstName)}
            {...register("firstName")}
          />
          <TextInput
            variant={TextInputVariant.Outlined}
            placeholder={formatMessage(messages.lastName)}
            {...register("lastName")}
          />
        </Row>

        <SectionHeader>
          <SectionLabelText message={messages.phone.id} />
          <Button
            type={ButtonType.Text}
            size={ButtonSize.AutoMin}
            icon={IconType.Plus}
            iconSize={2.4}
            onClick={() =>
              phones.append({
                phoneNumber: "",
                phoneType: PhoneNumberType.Mobile,
              })
            }
            aria-label={formatMessage(messages.addPhone)}
          />
        </SectionHeader>
        {phones.fields.map((field, index) => (
          <Row key={field._key}>
            <TextInput
              type={"tel"}
              variant={TextInputVariant.Outlined}
              placeholder={formatMessage(messages.phone)}
              {...register(`phoneNumbers.${index}.phoneNumber`)}
            />
            <Controller
              control={control}
              name={`phoneNumbers.${index}.phoneType`}
              render={({ field }) => (
                <Select {...field} value={field.value}>
                  {Object.values(PhoneNumberType).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              )}
            />
            <TrashSlot>
              <IconButton
                icon={IconType.Trash}
                size={IconSize.Medium}
                onClick={() => phones.remove(index)}
                aria-label="Remove phone"
              />
            </TrashSlot>
          </Row>
        ))}
        <SectionHeader>
          <SectionLabelText message={messages.email.id} />
          <Button
            type={ButtonType.Text}
            size={ButtonSize.AutoMin}
            icon={IconType.Plus}
            iconSize={2.4}
            onClick={() =>
              emails.append({
                emailAddress: "",
                emailType: EmailAddressType.Home,
              })
            }
            aria-label={formatMessage(messages.addEmail)}
          />
        </SectionHeader>
        {emails.fields.map((field, index) => (
          <Row key={field._key}>
            <TextInput
              type={"email"}
              variant={TextInputVariant.Outlined}
              placeholder={formatMessage(messages.email)}
              {...register(`emailAddresses.${index}.emailAddress`)}
            />
            <Controller
              control={control}
              name={`emailAddresses.${index}.emailType`}
              render={({ field }) => (
                <Select {...field} value={field.value}>
                  {Object.values(EmailAddressType).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              )}
            />
            <TrashSlot>
              <IconButton
                icon={IconType.Trash}
                size={IconSize.Medium}
                onClick={() => emails.remove(index)}
                aria-label="Remove email"
              />
            </TrashSlot>
          </Row>
        ))}

        <SectionLabel message={messages.address.id} />
        <Row>
          <TextInput
            variant={TextInputVariant.Outlined}
            placeholder={formatMessage(messages.street)}
            {...register("address.streetAddress")}
          />
          <Controller
            control={control}
            name={"address.type"}
            render={({ field }) => (
              <Select {...field} value={field.value}>
                {Object.values(AddressType).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            )}
          />
        </Row>
        <TextInput
          variant={TextInputVariant.Outlined}
          placeholder={formatMessage(messages.street2)}
          {...register("address.secondStreetAddress")}
        />
        <Grid2>
          <TextInput
            variant={TextInputVariant.Outlined}
            placeholder={formatMessage(messages.zip)}
            {...register("address.zipCode")}
          />
          <TextInput
            variant={TextInputVariant.Outlined}
            placeholder={formatMessage(messages.city)}
            {...register("address.city")}
          />
        </Grid2>
        <Grid2>
          <TextInput
            variant={TextInputVariant.Outlined}
            placeholder={formatMessage(messages.state)}
            {...register("address.state")}
          />
          <TextInput
            variant={TextInputVariant.Outlined}
            placeholder={formatMessage(messages.country)}
            {...register("address.country")}
          />
        </Grid2>

        <SectionLabel message={messages.other.id} />
        <TextInput
          variant={TextInputVariant.Outlined}
          placeholder={formatMessage(messages.company)}
          {...register("company")}
        />
        <TextInput
          variant={TextInputVariant.Outlined}
          placeholder={formatMessage(messages.notes)}
          {...register("notes")}
        />
      </Fields>

      <Modal.Buttons>
        <Button
          type={ButtonType.Secondary}
          size={ButtonSize.AutoMax}
          onClick={onClose}
          message={messages.cancel.id}
        />
        <Button
          type={ButtonType.Primary}
          size={ButtonSize.AutoMax}
          onClick={submit}
          message={messages.save.id}
        />
      </Modal.Buttons>
    </Modal>
  )
}

const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  /* Extend to the modal's inner edges so the scrollbar sits flush at the edge
     with the same minimal look as the rest of the app's lists/modals. The
     content stays inset by the modal padding. */
  margin: 0 calc(-1 * var(--modal-padding));
  padding: 0.4rem var(--modal-padding);
  width: calc(100% + var(--modal-padding) * 2 - 0.3rem);

  &::-webkit-scrollbar {
    width: 0.4rem;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.app.color.grey2};
  }
`

const Row = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.8rem;
  /* The TextInput wrapper is align-self:stretch with its visible 4rem box
     anchored at the top, so top-align the row and keep the controls at 4rem. */
  align-items: flex-start;

  > *:first-child {
    flex: 1;
  }
`

// Keeps the trash icon vertically centred against the 4rem input/select.
const TrashSlot = styled.div`
  flex-shrink: 0;
  height: 4rem;
  display: flex;
  align-items: center;
`

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
`

const SectionLabel = styled(Typography.P3)`
  align-self: flex-start;
  /* clear separation above each grouped section, tight to its own field */
  margin-top: 1.2rem;
  margin-bottom: -0.2rem;
  color: ${({ theme }) => theme.app.color.grey2};
`

// Header for repeatable sections: label + an inline "+" add button.
const SectionHeader = styled.div`
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  margin-top: 1.2rem;
  margin-bottom: -0.2rem;
`

const SectionLabelText = styled(Typography.P3)`
  color: ${({ theme }) => theme.app.color.grey2};
`

const Select = styled.select`
  flex-shrink: 0;
  width: 11rem;
  height: 4rem;
  padding: 0 2.8rem 0 1.2rem;
  border: 0.1rem solid ${({ theme }) => theme.app.color.grey4};
  border-radius: ${({ theme }) => theme.app.radius.xs};
  background-color: ${({ theme }) => theme.app.color.white};
  color: ${({ theme }) => theme.app.color.black};
  font: inherit;
  font-size: 1.4rem;
  line-height: 1.6rem;
  text-transform: capitalize;
  cursor: pointer;
  appearance: none;
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-image: ${({ theme }) =>
    `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" fill="none" stroke="${encodeURIComponent(
      theme.app.color.grey2
    )}" stroke-width="1.5"><path d="M1 1l4 4 4-4"/></svg>')`};
`

