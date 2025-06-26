import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import AppContainer from '@/pages/app/components/AppContainer'
import { useAppPaddings } from '@/theme'
import { UiButton, UiScreenScrollable } from '@/ui'

export default function PassportTests() {
  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()
  const bottomBarHeight = useBottomTabBarHeight()

  const test1 = () => {}

  return (
    <AppContainer>
      <UiScreenScrollable
        style={{
          paddingTop: insets.top,
          paddingBottom: bottomBarHeight,
          paddingLeft: appPaddings.left,
          paddingRight: appPaddings.right,
        }}
        className='gap-3'
      >
        <View className='flex gap-4'>
          <UiButton onPress={test1} title='Test 1' />
        </View>
      </UiScreenScrollable>
    </AppContainer>
  )
}
