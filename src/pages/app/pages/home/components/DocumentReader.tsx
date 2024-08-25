import { scanDocument } from '@modules/e-document'
import { registrationChallenge } from '@modules/rarime-sdk'
import { Buffer } from 'buffer'
import type { FieldRecords } from 'mrz'
import { useCallback, useState } from 'react'
import { Text, View } from 'react-native'

import { walletStore } from '@/store'
import { UiButton } from '@/ui'

export default function DocumentReader({ fields }: { fields: FieldRecords }) {
  const [eDocument, setEDocument] = useState<string>()

  const pk = walletStore.useWalletStore(state => state.privateKey)

  const startScanListener = useCallback(async () => {
    if (!fields.birthDate || !fields.documentNumber || !fields.expirationDate || !pk) return

    try {
      const challenge = await registrationChallenge(pk)

      console.log(challenge)

      const eDocumentBytes = await scanDocument(
        {
          dateOfBirth: fields.birthDate,
          dateOfExpiry: fields.expirationDate,
          documentNumber: fields.documentNumber,
        },
        challenge,
      )

      setEDocument(Buffer.from(eDocumentBytes).toString())
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

  return <Text className='text-textPrimary typography-body3'>{eDocument}</Text>
}
