import type { EDocument } from '@modules/e-document'
import { scanDocument } from '@modules/e-document'
import { registrationChallenge } from '@modules/rarime-sdk'
import { Image } from 'expo-image'
import type { FieldRecords } from 'mrz'
import { useCallback, useEffect, useState } from 'react'
import { Text, View } from 'react-native'

import { walletStore } from '@/store'
import { UiButton, UiCard } from '@/ui'

export default function DocumentReader({ fields }: { fields: FieldRecords }) {
  const [eDocument, setEDocument] = useState<EDocument>()

  const pk = walletStore.useWalletStore(state => state.privateKey)

  const startScanListener = useCallback(async () => {
    if (!fields.birthDate || !fields.documentNumber || !fields.expirationDate || !pk) return

    try {
      const challenge = await registrationChallenge(pk)

      const eDocumentResponse = await scanDocument(
        {
          dateOfBirth: fields.birthDate,
          dateOfExpiry: fields.expirationDate,
          documentNumber: fields.documentNumber,
        },
        challenge,
      )

      const { personDetails, ...restEDoc } = eDocumentResponse
      const { passportImageRaw: _, ...restPersonDetails } = personDetails!

      console.log({
        ...restEDoc,
        personDetails: {
          ...restPersonDetails,
        },
      })

      setEDocument(eDocumentResponse)
    } catch (error) {
      console.log(error)
    }
  }, [fields, pk])

  useEffect(() => {
    if (eDocument) return

    startScanListener()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!eDocument) {
    return (
      <View>
        <UiButton onPress={startScanListener} title='Scan Document' />
      </View>
    )
  }

  try {
    return (
      <View>
        <UiCard>
          <View className='flex flex-row'>
            <View className='flex flex-1 flex-col gap-2'>
              <Text className='text-textPrimary'>{`${eDocument?.personDetails?.firstName} ${eDocument?.personDetails?.lastName}`}</Text>
              <Text className='text-textPrimary'>{eDocument?.personDetails?.gender}</Text>
            </View>

            <Image
              style={{ width: 120, height: 120 }}
              source={{
                uri: `data:image/png;base64,${eDocument?.personDetails?.passportImageRaw}`,
              }}
            />
          </View>
        </UiCard>
      </View>
    )
  } catch (error) {
    console.log(error)
    return <View />
  }
}
