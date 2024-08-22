import { ScrollView, Text, View } from 'react-native'

import { CameraWrapper } from './components'

export default function HomeScreen() {
  return (
    <View className='flex flex-1 flex-col'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className='flex flex-1 flex-col gap-4 p-5'>
          <Text className='text-center text-textPrimary typography-h4'>Home Screen</Text>

          <CameraWrapper />
        </View>
      </ScrollView>
    </View>
  )
}
