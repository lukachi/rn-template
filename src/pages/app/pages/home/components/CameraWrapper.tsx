import { Text, View } from 'react-native'
// import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera'

// import { UiButton } from '@/ui'

export default function CameraWrapper() {
  // const device = useCameraDevice('back')
  // const { hasPermission, requestPermission } = useCameraPermission()
  //
  // if (!hasPermission) {
  //   return (
  //     <View>
  //       <Text className='text-textPrimary typography-h4'>Requesting Camera Permission</Text>
  //
  //       <UiButton onPress={requestPermission} title='Request Permission' />
  //     </View>
  //   )
  // }
  //
  // if (!device) {
  //   return (
  //     <View>
  //       <Text className='text-textPrimary typography-h4'>Loading Camera</Text>
  //     </View>
  //   )
  // }

  return (
    // <Camera
    //   style={{
    //     position: 'absolute',
    //     left: 0,
    //     right: 0,
    //     top: 0,
    //     bottom: 0,
    //   }}
    //   device={device}
    //   isActive={true}
    // />
    <View>
      <Text className='text-textPrimary typography-h4'>Camera here</Text>
    </View>
  )
}
