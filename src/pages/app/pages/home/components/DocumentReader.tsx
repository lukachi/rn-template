import type { EDocument } from '@modules/e-document'
import { scanDocument } from '@modules/e-document'
import { registrationChallenge } from '@modules/rarime-sdk'
import { Image } from 'expo-image'
import type { FieldRecords } from 'mrz'
import { useCallback, useState } from 'react'
import { View } from 'react-native'

import { walletStore } from '@/store'
import { UiButton } from '@/ui'

export default function DocumentReader({ fields }: { fields: FieldRecords }) {
  const [eDocument, setEDocument] = useState<EDocument>()

  const pk = walletStore.useWalletStore(state => state.privateKey)

  const startScanListener = useCallback(async () => {
    if (!fields.birthDate || !fields.documentNumber || !fields.expirationDate || !pk) return

    console.log('fields', JSON.stringify(fields))

    try {
      const challenge = await registrationChallenge(pk)

      console.log(challenge)

      const eDocumentResponse = await scanDocument(
        {
          dateOfBirth: fields.birthDate,
          dateOfExpiry: fields.expirationDate,
          documentNumber: fields.documentNumber,
        },
        challenge,
      )

      setEDocument(eDocumentResponse)
    } catch (error) {
      console.log(error)
    }
  }, [fields.birthDate, fields.documentNumber, fields.expirationDate, pk])

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
        <Image
          style={{ width: 120, height: 120 }}
          source={{
            uri: `${eDocument.personDetails?.passportImageRaw}`,
          }}
        />
      </View>
    )
  } catch (error) {
    console.log(error)
    return <View />
  }
}
