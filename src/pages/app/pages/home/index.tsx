import { ScrollView, Text, View } from 'react-native'

export default function HomeScreen() {
  return (
    <View className='flex flex-1 flex-col'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className='flex flex-1 flex-col gap-4 p-5'>
          <Text>Home Screen</Text>
        </View>
      </ScrollView>
    </View>
  )
}
