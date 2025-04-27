import {
  EDocumentModuleEvents,
  EDocumentModuleListener,
  EDocumentModuleRemoveAllListeners,
  scanDocument,
} from '@modules/e-document'
import eDocumentScanner from '@modules/e-document/src'
import { DocumentScanEvents } from '@modules/e-document/src/index'
import { registrationChallenge } from '@modules/rarime-sdk'
import { useCallback, useEffect, useState } from 'react'
import { Text, View } from 'react-native'

import { ErrorHandler } from '@/core'
import { useDocumentScanContext } from '@/pages/app/pages/document-scan/context'
import { walletStore } from '@/store'
import { UiButton, UiIcon } from '@/ui'

export default function ScanNfcStep() {
  const { mrz, setEDoc } = useDocumentScanContext()

  const [newEdoc, setNewEDoc] = useState()

  const pk = walletStore.useWalletStore(state => state.privateKey)

  const [isScanning, setIsScanning] = useState(false)

  const [title, setTitle] = useState('Scan NFC')
  const [useNewImplementation, setUseNewImplementation] = useState(false)

  // Original implementation using module event listeners
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
      ErrorHandler.processWithoutFeedback(error)
    }

    setIsScanning(false)
  }, [mrz?.birthDate, mrz?.documentCode, mrz?.documentNumber, mrz?.expirationDate, pk, setEDoc])

  // New implementation using our improved e-document scanner
  const startScanListenerNew = useCallback(async () => {
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

      // Initialize scanner
      const isInitialized = await eDocumentScanner.initialize()
      if (!isInitialized) {
        throw new Error('Failed to initialize NFC scanner')
      }

      // Convert challenge to hex string
      const challengeHex = Buffer.from(challenge).toString('hex')

      // Scan document using the new implementation
      const eDocumentResponse = await eDocumentScanner.scanDocument(
        {
          dateOfBirth: mrz.birthDate,
          dateOfExpiry: mrz.expirationDate,
          documentNumber: mrz.documentNumber,
        },
        challengeHex,
      )

      // Convert the new document format to the expected format
      const convertedDocument = {
        personDetails: eDocumentResponse.personDetails,
        dataGroups: {
          dg1: eDocumentResponse.dg1,
          dg15: eDocumentResponse.dg15,
          dg11: eDocumentResponse.dg11,
          sod: eDocumentResponse.sod,
        },
        signature: eDocumentResponse.signature,
      }

      setNewEDoc(convertedDocument)
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error)
    }

    setIsScanning(false)
  }, [mrz, pk])

  useEffect(() => {
    if (isScanning) return

    if (useNewImplementation) {
      startScanListenerNew()
    } else {
      startScanListener()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useNewImplementation])

  useEffect(() => {
    if (useNewImplementation) {
      // Setup listeners for the new implementation
      const setupEventListeners = async () => {
        await eDocumentScanner.on(DocumentScanEvents.SCAN_STARTED, () => {
          setTitle('ScanStarted')
        })
        await eDocumentScanner.on(DocumentScanEvents.REQUEST_PRESENT_PASSPORT, () => {
          setTitle('RequestPresentPassport')
        })
        await eDocumentScanner.on(DocumentScanEvents.AUTHENTICATING_WITH_PASSPORT, () => {
          setTitle('AuthenticatingWithPassport')
        })
        await eDocumentScanner.on(DocumentScanEvents.READING_DATA_GROUP_PROGRESS, () => {
          setTitle('ReadingDataGroupProgress')
        })
        await eDocumentScanner.on(DocumentScanEvents.ACTIVE_AUTHENTICATION, () => {
          setTitle('ActiveAuthentication')
        })
        await eDocumentScanner.on(DocumentScanEvents.SUCCESSFUL_READ, () => {
          setTitle('SuccessfulRead')
        })
        await eDocumentScanner.on(DocumentScanEvents.SCAN_ERROR, error => {
          setTitle('ScanError: ' + error.message)
        })
        await eDocumentScanner.on(DocumentScanEvents.SCAN_STOPPED, () => {
          setTitle('ScanStopped')
        })
      }

      setupEventListeners()

      return () => {
        // Clean up all listeners
        eDocumentScanner.disableScan()
      }
    } else {
      // Original event listeners
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
    }
  }, [useNewImplementation])

  return (
    <View className='flex flex-1 flex-col justify-center'>
      <Text className='text-center text-textPrimary typography-h5'>{title}</Text>
      {isScanning ? (
        <View className='flex items-center'>
          <UiIcon customIcon='bellFillIcon' className='size-[120] text-textPrimary' />
        </View>
      ) : (
        <View className='flex flex-col gap-4'>
          <UiButton
            onPress={() => {
              setUseNewImplementation(false)
              startScanListener()
            }}
            title='Try Scan (Original)'
          />
          <UiButton
            onPress={() => {
              setUseNewImplementation(true)
              startScanListenerNew()
            }}
            title='Try Scan (New Implementation)'
          />
        </View>
      )}
    </View>
  )
}
