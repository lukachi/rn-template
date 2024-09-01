import { scanDocument } from '@modules/e-document'
import { registrationChallenge } from '@modules/rarime-sdk'
import { useCallback, useEffect, useState } from 'react'
import { Text, View } from 'react-native'

import { useDocumentScanContext } from '@/pages/app/pages/document-scan/context'
import { walletStore } from '@/store'
import { UiButton, UiIcon } from '@/ui'

export default function ScanNfcStep() {
  const { mrz, setEDoc } = useDocumentScanContext()

  const pk = walletStore.useWalletStore(state => state.privateKey)

  const [isScanning, setIsScanning] = useState(false)

  const startScanListener = useCallback(async () => {
    if (
      !pk ||
      !mrz?.birthDate ||
      !mrz?.documentNumber ||
      !mrz?.expirationDate ||
      !mrz?.documentCode
    )
      return

    setIsScanning(true)

    try {
      const challenge = await registrationChallenge(pk)

      // TODO: implement isNfcScanning, and every step of doc scanning markers
      const eDocumentResponse = await scanDocument(
        mrz.documentCode,
        {
          dateOfBirth: mrz.birthDate,
          dateOfExpiry: mrz.expirationDate,
          documentNumber: mrz.documentNumber,
        },
        challenge,
      )

      setEDoc(eDocumentResponse)
    } catch (error) {
      console.log(error)
    }

    setIsScanning(false)
  }, [mrz?.birthDate, mrz?.documentCode, mrz?.documentNumber, mrz?.expirationDate, pk, setEDoc])

  useEffect(() => {
    if (isScanning) return

    startScanListener()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View className='flex flex-1 flex-col justify-center'>
      {isScanning ? (
        <View className={'flex items-center'}>
          <UiIcon componentName={'bellFillIcon'} className={'size-[120] text-textPrimary'} />
          <Text className='text-center text-textPrimary typography-h4'>scan nfc</Text>
        </View>
      ) : (
        <UiButton onPress={startScanListener} title='Try Scan Again' />
      )}
    </View>
  )
}
