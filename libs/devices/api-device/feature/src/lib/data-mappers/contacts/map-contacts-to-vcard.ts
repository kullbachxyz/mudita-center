/**
 * Copyright (c) Mudita sp. z o.o. All rights reserved.
 * For licensing, see https://github.com/mudita/mudita-center/blob/master/LICENSE.md
 */

import { Contact } from "devices/common/models"

// Escape a value for a vCard 3.0 text field (RFC 2426 §5).
const escapeValue = (value: string | undefined): string =>
  (value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")

const composeFullName = (contact: Contact): string => {
  const parts = [
    contact.namePrefix,
    contact.firstName,
    contact.middleName,
    contact.lastName,
    contact.nameSuffix,
  ].filter((part): part is string => Boolean(part && part.trim()))
  if (parts.length > 0) {
    return parts.join(" ")
  }
  return (
    contact.displayName1 ||
    contact.nickName ||
    contact.company ||
    contact.phoneNumbers?.[0]?.phoneNumber ||
    "Unknown"
  )
}

const contactToVcard = (contact: Contact): string => {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"]

  lines.push(
    "N:" +
      [
        escapeValue(contact.lastName),
        escapeValue(contact.firstName),
        escapeValue(contact.middleName),
        escapeValue(contact.namePrefix),
        escapeValue(contact.nameSuffix),
      ].join(";")
  )
  lines.push("FN:" + escapeValue(composeFullName(contact)))

  if (contact.nickName) {
    lines.push("NICKNAME:" + escapeValue(contact.nickName))
  }
  if (contact.company || contact.department) {
    lines.push(
      "ORG:" +
        [escapeValue(contact.company), escapeValue(contact.department)]
          .join(";")
          .replace(/;$/, "")
    )
  }
  if (contact.workTitle) {
    lines.push("TITLE:" + escapeValue(contact.workTitle))
  }

  // Mudita's vCard import matches TYPE against its own lowercase tokens
  // (mobile|home|work|other); RFC types like CELL would import as "other".
  for (const phone of contact.phoneNumbers ?? []) {
    lines.push(`TEL;TYPE=${phone.phoneType}:${escapeValue(phone.phoneNumber)}`)
  }
  for (const email of contact.emailAddresses ?? []) {
    lines.push(
      `EMAIL;TYPE=${email.emailType}:${escapeValue(email.emailAddress)}`
    )
  }

  const address = contact.address
  if (address) {
    lines.push(
      // Mudita's ADR order: poBox; street; second-street; city; state; zip;
      // country (street before extended — matches Mudita's own parser).
      `ADR;TYPE=${address.type}:` +
        [
          escapeValue(address.poBox),
          escapeValue(address.streetAddress),
          escapeValue(address.secondStreetAddress),
          escapeValue(address.city),
          escapeValue(address.state),
          escapeValue(address.zipCode),
          escapeValue(address.country),
        ].join(";")
    )
  }

  if (contact.website) {
    lines.push("URL:" + escapeValue(contact.website))
  }
  if (contact.notes) {
    lines.push("NOTE:" + escapeValue(contact.notes))
  }

  lines.push("END:VCARD")
  return lines.join("\r\n")
}

// Serialise contacts to a single vCard 3.0 document.
export const mapContactsToVcard = (contacts: Contact[]): string =>
  contacts.map(contactToVcard).join("\r\n") + "\r\n"
