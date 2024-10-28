import {
  EDocumentModuleEvents,
  EDocumentModuleListener,
  EDocumentModuleRemoveAllListeners,
  scanDocument,
} from '@modules/e-document'
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

  const [title, setTitle] = useState('Scan NFC')

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

  useEffect(() => {
    EDocumentModuleListener(EDocumentModuleEvents.ScanStarted, () => {
      console.log('ScanStarted')
      setTitle('ScanStarted')
    })
    EDocumentModuleListener(EDocumentModuleEvents.RequestPresentPassport, () => {
      console.log('RequestPresentPassport')
      setTitle('RequestPresentPassport')
    })
    EDocumentModuleListener(EDocumentModuleEvents.AuthenticatingWithPassport, () => {
      console.log('AuthenticatingWithPassport')
      setTitle('AuthenticatingWithPassport')
    })
    EDocumentModuleListener(EDocumentModuleEvents.ReadingDataGroupProgress, () => {
      console.log('ReadingDataGroupProgress')
      setTitle('ReadingDataGroupProgress')
    })
    EDocumentModuleListener(EDocumentModuleEvents.ActiveAuthentication, () => {
      console.log('ActiveAuthentication')
      setTitle('ActiveAuthentication')
    })
    EDocumentModuleListener(EDocumentModuleEvents.SuccessfulRead, () => {
      console.log('SuccessfulRead')
      setTitle('SuccessfulRead')
    })
    EDocumentModuleListener(EDocumentModuleEvents.ScanError, () => {
      console.log('ScanError')
      setTitle('ScanError')
    })
    EDocumentModuleListener(EDocumentModuleEvents.ScanStopped, () => {
      console.log('ScanStopped')
      setTitle('ScanStopped')
    })

    return () => {
      EDocumentModuleRemoveAllListeners(EDocumentModuleEvents.ScanStarted)
      EDocumentModuleRemoveAllListeners(EDocumentModuleEvents.RequestPresentPassport)
      EDocumentModuleRemoveAllListeners(EDocumentModuleEvents.AuthenticatingWithPassport)
      EDocumentModuleRemoveAllListeners(EDocumentModuleEvents.ReadingDataGroupProgress)
      EDocumentModuleRemoveAllListeners(EDocumentModuleEvents.ActiveAuthentication)
      EDocumentModuleRemoveAllListeners(EDocumentModuleEvents.SuccessfulRead)
      EDocumentModuleRemoveAllListeners(EDocumentModuleEvents.ScanError)
      EDocumentModuleRemoveAllListeners(EDocumentModuleEvents.ScanStopped)
    }
  }, [])

  return (
    <View className='flex flex-1 flex-col justify-center'>
      <Text className='text-center text-textPrimary typography-h5'>{title}</Text>
      {isScanning ? (
        <View className={'flex items-center'}>
          <UiIcon customIcon={'bellFillIcon'} className={'size-[120] text-textPrimary'} />
        </View>
      ) : (
        <UiButton onPress={startScanListener} title='Try Scan Again' />
      )}
    </View>
  )
}
