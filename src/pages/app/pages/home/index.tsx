import { ScrollView, Text, View } from 'react-native'

export default function HomeScreen() {
  return (
    <View className='flex flex-1 flex-col'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text className={'py-5 text-center text-textPrimary typography-h4'}>Home Screen</Text>
      </ScrollView>
    </View>
  )
}
