import {
  EDocumentModuleEvents,
  EDocumentModuleListener,
  EDocumentModuleRemoveAllListeners,
  scanDocument,
} from '@modules/e-document'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Text, View } from 'react-native'

import { ErrorHandler } from '@/core'
import { useDocumentScanContext } from '@/pages/app/pages/document-scan/context'
import { walletStore } from '@/store'
import { UiButton, UiIcon } from '@/ui'

export default function ScanNfcStep() {
  const { mrz, setEDoc } = useDocumentScanContext()

  const pk = walletStore.useWalletStore(state => state.privateKey)
  const registrationChallenge = walletStore.useRegistrationChallenge()

  const isScanning = useRef(false)

  const [title, setTitle] = useState('Scan NFC')

  const startScanListener = useCallback(async () => {
    if (!mrz) throw new TypeError('MRZ data is not available')

    if (!mrz.documentCode) throw new TypeError('Document code is not available in MRZ data')

    if (!mrz.birthDate) throw new TypeError('Birth date is not available in MRZ data')

    if (!mrz.expirationDate) throw new TypeError('Expiration date is not available in MRZ data')

    if (!mrz.documentNumber) throw new TypeError('Document number is not available in MRZ data')

    if (!pk) return

    try {
      const eDocumentResponse = await scanDocument(
        mrz.documentCode,
        {
          dateOfBirth: mrz.birthDate,
          dateOfExpiry: mrz.expirationDate,
          documentNumber: mrz.documentNumber,
        },
        registrationChallenge,
      )

      setEDoc(eDocumentResponse)
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error)
    }
  }, [mrz, pk, registrationChallenge, setEDoc])

  useEffect(() => {
    if (isScanning.current) return

    isScanning.current = true

    startScanListener()
  }, [startScanListener])

  useEffect(() => {
    EDocumentModuleListener(EDocumentModuleEvents.ScanStarted, () => {
      setTitle('ScanStarted')
    })
    EDocumentModuleListener(EDocumentModuleEvents.RequestPresentPassport, () => {
      setTitle('RequestPresentPassport')
    })
    EDocumentModuleListener(EDocumentModuleEvents.AuthenticatingWithPassport, () => {
      setTitle('AuthenticatingWithPassport')
    })
    EDocumentModuleListener(EDocumentModuleEvents.ReadingDataGroupProgress, () => {
      setTitle('ReadingDataGroupProgress')
    })
    EDocumentModuleListener(EDocumentModuleEvents.ActiveAuthentication, () => {
      setTitle('ActiveAuthentication')
    })
    EDocumentModuleListener(EDocumentModuleEvents.SuccessfulRead, () => {
      setTitle('SuccessfulRead')
    })
    EDocumentModuleListener(EDocumentModuleEvents.ScanError, () => {
      setTitle('ScanError')
    })
    EDocumentModuleListener(EDocumentModuleEvents.ScanStopped, () => {
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
        <View className='flex items-center'>
          <UiIcon customIcon='bellFillIcon' className='size-[120] text-textPrimary' />
        </View>
      ) : (
        <UiButton onPress={startScanListener} title='Try Scan Again' />
      )}
    </View>
  )
}
