import { Text, View } from 'react-native'

import { typography } from '@/theme'

export default function TabTwoScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text {...typography.body1}>Tab Two</Text>
    </View>
  )
}
