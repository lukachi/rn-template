import { DocType } from '@modules/e-document'
import { useAppState } from '@react-native-community/hooks'
import { useIsFocused } from '@react-navigation/native'
import type { FieldRecords } from 'mrz'
import { parse } from 'mrz'
import { useCallback, useMemo } from 'react'
import { Text, View } from 'react-native'
import {
  Camera,
  runAsync,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera'
import { useTextRecognition } from 'react-native-vision-camera-text-recognition'
import { Worklets } from 'react-native-worklets-core'

import { UiButton } from '@/ui'

const useMrzParser = (docType: DocType) => {
  const idCardParser = useCallback((lines: string[]) => {
    const numlinesToCheck = 3

    const possibleMRZLines = lines?.slice(-numlinesToCheck)

    if (!possibleMRZLines?.length || possibleMRZLines.length !== numlinesToCheck) return

    // const tdLength = possibleMRZLines[1].length
    const tdLength = 30

    const sanitizedMRZLines = possibleMRZLines.map(el => {
      return el.replaceAll('«', '<<').replaceAll(' ', '').toUpperCase()
    })

    sanitizedMRZLines[2] = sanitizedMRZLines[2].padEnd(tdLength, '<').toUpperCase()

    return parse(sanitizedMRZLines, {
      autocorrect: true,
    })
  }, [])

  const passportParser = useCallback((lines: string[]) => {
    const numlinesToCheck = 2

    const possibleMRZLines = lines?.slice(-numlinesToCheck)

    if (!possibleMRZLines?.length || possibleMRZLines.length !== numlinesToCheck) return

    // const tdLength = possibleMRZLines[1].length
    const tdLength = 44

    const sanitizedMRZLines = possibleMRZLines.map(el => {
      return el.replaceAll('«', '<<').replaceAll(' ', '').toUpperCase()
    })

    sanitizedMRZLines[0] = sanitizedMRZLines[0].padEnd(tdLength, '<').toUpperCase()

    return parse(sanitizedMRZLines, {
      autocorrect: true,
    })
  }, [])

  return {
    [DocType.ID]: idCardParser,
    [DocType.PASSPORT]: passportParser,
  }[docType]
}

export default function CameraWrapper({
  setParseResult,
  docType,
}: {
  setParseResult: (result: FieldRecords) => void
  docType: DocType
}) {
  const isFocused = useIsFocused()
  const currentAppState = useAppState()

  const device = useCameraDevice('back')
  const { hasPermission, requestPermission } = useCameraPermission()

  const { scanText } = useTextRecognition({
    language: 'latin',
  })

  const mrzParser = useMrzParser(docType)

  console.log(mrzParser)

  const onMRZDetected = Worklets.createRunOnJS((lines: string[]) => {
    try {
      const result = mrzParser(lines)

      if (result?.valid) {
        setParseResult(result.fields)
      }
    } catch (error) {
      console.log(error)
    }
  })

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet'

      runAsync(frame, async () => {
        'worklet'

        const data = scanText(frame)

        const lines = data?.resultText?.split('\n') as string[]

        await onMRZDetected(lines)
      })
    },
    [scanText, onMRZDetected],
  )

  const isActive = useMemo(() => {
    return isFocused && currentAppState === 'active'
  }, [currentAppState, isFocused])

  if (!hasPermission) {
    return (
      <View>
        <Text className='text-textPrimary typography-h4'>Requesting Camera Permission</Text>

        <UiButton onPress={requestPermission} title='Request Permission' />
      </View>
    )
  }

  // !isActive is a quickfix, cuz camera ain't pause, if app is not active
  if (!device || !isActive) {
    return (
      <View>
        <Text className='text-textPrimary typography-h4'>Loading Camera</Text>
      </View>
    )
  }

  return (
    <Camera
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      }}
      device={device}
      isActive={isActive}
      enableFpsGraph={true}
      frameProcessor={frameProcessor}
    />
  )
}
