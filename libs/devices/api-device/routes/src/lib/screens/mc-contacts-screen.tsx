/**
 * Copyright (c) Mudita sp. z o.o. All rights reserved.
 * For licensing, see https://github.com/mudita/mudita-center/blob/master/LICENSE.md
 */

import {
  ComponentProps,
  FunctionComponent,
  useCallback,
  useMemo,
  useRef,
} from "react"
import { ApiDevice, ApiDevicePaths } from "devices/api-device/models"
import { ScreenLoader } from "app-theme/ui"
import {
  contactsMapper,
  patchEntityData,
  postEntityData,
  sendEntities,
  useApiDeviceDeleteEntitiesMutation,
  useApiEntitiesDataQuery,
  useApiFeatureQuery,
} from "devices/api-device/feature"
import {
  detectContactsDuplicates,
  useActiveDeviceQuery,
} from "devices/common/feature"
import styled from "styled-components"
import { DashboardHeaderTitle } from "app-routing/feature"
import { ContactFormValues, Contacts, ImportState } from "devices/common/ui"
import { Contact } from "devices/common/models"
import { defineMessages, formatMessage } from "app-localize/utils"
import { useQueryClient } from "@tanstack/react-query"
import { cloneDeep } from "lodash"
import { useHelpShortcut } from "help/feature"
import {
  AppActions,
  AppFileSystem,
  ExternalAuthProviders,
} from "app-utils/renderer"
import {
  ExternalAuthProvider,
  ExternalAuthProvidersScope,
} from "app-utils/models"
import path from "node:path"
import { useAppNavigate } from "app-routing/utils"

const messages = defineMessages({
  loaderTitle: {
    id: "apiDevice.contacts.loadingState.title",
  },
  fileDialogTitle: {
    id: "apiDevice.contacts.import.fileDialog.title",
  },
  fileDialogFilterName: {
    id: "apiDevice.contacts.import.fileDialog.filterName",
  },
  exportDialogTitle: {
    id: "apiDevice.contacts.export.fileDialog.title",
  },
})

export const McContactsScreen: FunctionComponent = () => {
  const queryClient = useQueryClient()
  const helpShortcut = useHelpShortcut()
  const importAbortController = useRef(new AbortController())
  const navigate = useAppNavigate()

  const { data: device } = useActiveDeviceQuery<ApiDevice>()
  const { data: feature } = useApiFeatureQuery("mc-contacts", device)
  const {
    data: contacts,
    progress,
    refetch,
    isSuccess,
  } = useApiEntitiesDataQuery<Contact[]>(feature?.entityType, device)

  const isLoading = !feature || !contacts || !isSuccess

  const { mutateAsync: deleteEntities } =
    useApiDeviceDeleteEntitiesMutation(device)

  const handleDelete = useCallback(
    async (ids: string[]) => {
      if (!feature || !feature.entityType || !device) {
        return { failedIds: ids }
      }

      const { failedIds = [] } = await deleteEntities({
        entityType: feature.entityType,
        ids,
      })
      queryClient.setQueryData(
        useApiEntitiesDataQuery.queryKey(feature.entityType, device.id),
        (oldData: Contact[] = []) => {
          const newData = cloneDeep(oldData)
          return newData.filter((contact) => {
            const aboutToBeDeleted = ids.includes(contact.contactId)
            const failedToDelete = failedIds.includes(contact.contactId)
            const actuallyDeleted = aboutToBeDeleted && !failedToDelete
            return !actuallyDeleted
          })
        }
      )
      return { failedIds }
    },
    [deleteEntities, device, feature, queryClient]
  )

  const handleImportFromFile = useCallback(
    async (onStartImporting?: VoidFunction) => {
      const [filePath] = await AppActions.openFileDialog({
        title: formatMessage(messages.fileDialogTitle),
        filters: [
          {
            name: formatMessage(messages.fileDialogFilterName),
            extensions: ["vcf", "csv"],
          },
        ],
        properties: ["openFile"],
      })
      if (!filePath) {
        return
      }
      onStartImporting?.()

      const file = await AppFileSystem.readFile({
        absolute: true,
        fileAbsolutePath: filePath,
      })
      if (!file.ok) {
        return
      }
      return {
        data: file.data,
        extension: path.extname(filePath).toLowerCase() as ".vcf" | ".csv",
      }
    },
    []
  )

  const handleImportProviderSelect: ComponentProps<
    typeof Contacts
  >["onProviderSelect"] = useCallback(
    async (provider, onStartImporting) => {
      if (provider === "file") {
        const fileData = await handleImportFromFile(onStartImporting)
        if (!fileData) {
          return { error: "aborted" }
        }
        switch (fileData.extension) {
          case ".vcf":
            return contactsMapper.fromVcard(fileData.data)
          case ".csv":
            return contactsMapper.fromCsv(fileData.data)
        }
      }

      if (provider === ExternalAuthProvider.Google) {
        ExternalAuthProviders.listenToScopesDataTransferStart(onStartImporting)
        const response = await ExternalAuthProviders.getScopesData(
          ExternalAuthProvider.Google,
          [ExternalAuthProvidersScope.Contacts]
        )

        if ("error" in response) {
          return response
        }

        return contactsMapper.fromGoogleApi(response.contacts)
      }

      if (provider === ExternalAuthProvider.Outlook) {
        ExternalAuthProviders.listenToScopesDataTransferStart(onStartImporting)
        const response = await ExternalAuthProviders.getScopesData(
          ExternalAuthProvider.Outlook,
          [ExternalAuthProvidersScope.Contacts]
        )

        if ("error" in response) {
          return response
        }
        return contactsMapper.fromOutlookApi(response.contacts)
      }

      return { error: "unsupported provider" }
    },
    [handleImportFromFile]
  )

  const handleImport: ComponentProps<typeof Contacts>["onImport"] = useCallback(
    async (contacts, onProgress) => {
      if (!device) {
        return { failed: true }
      }
      importAbortController.current = new AbortController()
      let sendingProgress = 0
      let refetchingProgress = 0

      const handleTotalProgress = () => {
        const totalProgress = sendingProgress * 0.6 + refetchingProgress * 0.4
        const importState =
          sendingProgress < 100
            ? ImportState.Transferring
            : ImportState.Refreshing
        onProgress(Math.floor(totalProgress), importState)
      }

      const response = await sendEntities({
        device,
        entityType: "contacts",
        mode: "file",
        data: contacts,
        onProgress: (progressSending) => {
          sendingProgress = progressSending
          handleTotalProgress()
        },
        abortController: importAbortController.current,
      })

      if (response?.failedEntities?.length) {
        return { failed: true }
      }
      if (importAbortController.current.signal.aborted) {
        void refetch()
        return { cancelled: true }
      }

      const data = await useApiEntitiesDataQuery.queryFn(
        "contacts",
        device,
        (progress) => {
          refetchingProgress = progress
          handleTotalProgress()
        },
        importAbortController.current.signal
      )
      queryClient.setQueryData(
        useApiEntitiesDataQuery.queryKey("contacts", device.id),
        data
      )
      onProgress(100, ImportState.Refreshing)

      const newContacts =
        queryClient.getQueryData<Contact[]>(
          useApiEntitiesDataQuery.queryKey("contacts", device.id)
        ) || []

      const duplicates = detectContactsDuplicates(newContacts)

      return {
        duplicatesCount: duplicates.length,
      }
    },
    [device, queryClient, refetch]
  )

  const handleImportCancel = useCallback(() => {
    importAbortController.current.abort()
  }, [])

  const handleExport = useCallback(async () => {
    if (!contacts || contacts.length === 0) {
      return
    }
    const [dirPath] = await AppActions.openFileDialog({
      title: formatMessage(messages.exportDialogTitle),
      properties: ["openDirectory"],
    })
    if (!dirPath) {
      return
    }
    await AppFileSystem.writeFile({
      absolute: true,
      fileAbsolutePath: path.join(dirPath, "mudita-contacts.vcf"),
      data: contactsMapper.toVcard(contacts),
    })
  }, [contacts])

  const handleSaveContact = useCallback(
    async (values: ContactFormValues) => {
      if (!device || !feature?.entityType) {
        return
      }
      const entityType = feature.entityType

      // Preserve every existing field; only override what the form edits.
      // Without this, an edit (e.g. renaming) would wipe address, nickname,
      // department, etc. Device-computed/identity fields are stripped so they
      // get recalculated from the new data.
      const original = contacts?.find((c) => c.contactId === values.contactId)
      const preserved: Record<string, unknown> = { ...(original ?? {}) }
      for (const key of [
        "contactId",
        "searchName",
        "sortField",
        "displayName1",
        "displayName2",
        "displayName3",
        "displayName4",
      ]) {
        delete preserved[key]
      }

      const addressFilled = [
        values.address.streetAddress,
        values.address.secondStreetAddress,
        values.address.poBox,
        values.address.city,
        values.address.state,
        values.address.zipCode,
        values.address.country,
      ].some((v) => v.trim())

      const data = {
        ...preserved,
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
        company: values.company || undefined,
        notes: values.notes || undefined,
        // IMPORTANT: send phones/emails WITHOUT their existing id. The device's
        // PATCH drops entries that carry an id it already knows, but re-creates
        // id-less ones — so we always send them id-less (device assigns fresh
        // ids). This is what preserves them across an edit.
        // Types are sent UPPERCASE (MOBILE/HOME/WORK/OTHER): the device's PATCH
        // only recognises its canonical uppercase tokens and defaults anything
        // else (incl. lowercase) to OTHER.
        phoneNumbers: values.phoneNumbers.map((p) => ({
          phoneNumber: p.phoneNumber,
          phoneType: p.phoneType.toUpperCase(),
        })),
        emailAddresses: values.emailAddresses.map((e) => ({
          emailAddress: e.emailAddress,
          emailType: e.emailType.toUpperCase(),
        })),
        address: addressFilled
          ? { ...values.address, type: values.address.type.toUpperCase() }
          : undefined,
        entityType,
      }
      if (values.contactId) {
        await patchEntityData(device, {
          entityType,
          entityId: values.contactId,
          data,
        })
      } else {
        await postEntityData(device, { entityType, data })
      }
      await refetch()
    },
    [device, feature, refetch, contacts]
  )

  const handleManageDuplicates = useCallback(() => {
    navigate(`${ApiDevicePaths.Index}/mc-contacts/mc-contacts-duplicates`)
  }, [navigate])

  const handleImportHelpClick = useCallback(() => {
    helpShortcut("kompakt-contacts-import")
  }, [helpShortcut])

  const sortedContacts = useMemo(() => {
    return (
      contacts?.sort((a, b) => {
        const patterns = [
          /^\p{L}.*/u, // Compare letter values
          /^\d+$/, // Compare numeric values
          /^[^a-zA-Z\d\s@]+$/, // Compare special character values
        ]

        for (const pattern of patterns) {
          const aMatches = pattern.test(a.sortField)
          const bMatches = pattern.test(b.sortField)

          if (aMatches && !bMatches) return -1
          if (!aMatches && bMatches) return 1
        }
        return a.sortField.localeCompare(b.sortField)
      }) || []
    )
  }, [contacts])

  const headerTitle =
    (contacts || []).length > 0
      ? `${feature?.title} (${(contacts || []).length})`
      : feature?.title || "Contacts"

  return (
    <>
      <DashboardHeaderTitle title={headerTitle} />
      <ScreenLoader
        loading={isLoading}
        message={messages.loaderTitle.id}
        progress={progress}
      >
        <Content>
          <Contacts
            contacts={sortedContacts}
            onDelete={handleDelete}
            onProviderSelect={handleImportProviderSelect}
            onImport={handleImport}
            onImportCancel={handleImportCancel}
            onManageDuplicates={handleManageDuplicates}
            onHelpClick={handleImportHelpClick}
            onExport={handleExport}
            onSave={handleSaveContact}
          />
        </Content>
      </ScreenLoader>
    </>
  )
}

const Content = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  overflow-x: hidden;
`
