// import * as IdentitySdk from 'identity-sdk'
import { ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { UiButton } from '@/ui'

export default function TestIdentitySDK() {
  const insets = useSafeAreaInsets()

  const doMyAction = async () => {
    try {
      // const result = await IdentitySdk.multiply(2, 3)
      // console.log('result', result)
    } catch (error) {
      console.error('error', error)
    }
  }

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
      }}
    >
      <ScrollView className='flex-1'>
        <View className='px-4'>
          <Text>TestIdentitySDK</Text>

          <UiButton title={'Do my action'} onPress={doMyAction} />
        </View>
      </ScrollView>
    </View>
  )
}
