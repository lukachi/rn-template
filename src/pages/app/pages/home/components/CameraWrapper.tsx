import { useAppState } from '@react-native-community/hooks'
import { useIsFocused } from '@react-navigation/native'
import type { FieldRecords } from 'mrz'
import { parse } from 'mrz'
import { useMemo, useState } from 'react'
import { Text, View } from 'react-native'
import {
  Camera,
  runAsync,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera'
import { useTextRecognition } from 'react-native-vision-camera-text-recognition'

import { UiButton } from '@/ui'

export default function CameraWrapper() {
  const isFocused = useIsFocused()
  const currentAppState = useAppState()

  const device = useCameraDevice('back')
  const { hasPermission, requestPermission } = useCameraPermission()

  const [parseResult, setParseResult] = useState<FieldRecords>()

  const { scanText } = useTextRecognition({
    language: 'latin',
  })

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet'

      runAsync(frame, async () => {
        'worklet'

        const data = scanText(frame)

        const lines = data?.resultText?.split('\n') as string[]
        const possibleMRZLines = lines?.slice(-2)

        if (!possibleMRZLines?.length || possibleMRZLines.length !== 2) return

        const sanitizedMRZLines = possibleMRZLines.map(el =>
          el
            .replaceAll('«', '<<')
            // .replaceAll('O', '0')
            .replaceAll(' ', '')
            .padEnd(44, '<')
            .toUpperCase(),
        )

        console.log('sanitizedMRZLines:\n', sanitizedMRZLines)

        const result = parse(sanitizedMRZLines, {
          autocorrect: true,
        })

        console.log(JSON.stringify(result))
        if (!parseResult && result.valid) {
          console.log('setting parseResult')
          setParseResult(result.fields)
        }

        //
        // try {
        //   const result = parse(sanitizedMRZLines, {
        //     autocorrect: true,
        //   })
        //   if (!parseResult && result.valid) {
        //     setParseResult(result.fields)
        //   }
        // } catch (error) {
        //   console.error(error)
        // }
      })
    },
    [parseResult, scanText],
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

  if (parseResult) {
    return <Text>{JSON.stringify(parseResult)}</Text>
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
