import { useAppState } from '@react-native-community/hooks'
import { useIsFocused } from '@react-navigation/native'
import { parse } from 'mrz'
import { useMemo } from 'react'
import { Text, View } from 'react-native'
import {
  Camera,
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

  const { scanText } = useTextRecognition({
    language: 'latin',
  })

  const frameProcessor = useFrameProcessor(frame => {
    'worklet'

    const data = scanText(frame)
    const lines = data?.resultText?.split('\n')
    const possibleMRZLines = lines?.slice(-2)
    console.log('possibleMRZLines', possibleMRZLines)
    var result = parse(possibleMRZLines)
    console.log('result', result)
    // try {
    //   console.log(possibleMRZLines)
    // } catch (error) {
    //   console.log('Error:', error)
    // }
  }, [])

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
