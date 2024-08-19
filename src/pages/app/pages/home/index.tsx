import { ScrollView, Text, View } from 'react-native'

export default function HomeScreen() {
  return (
    <View className='flex flex-1 flex-col'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className='flex flex-1 flex-col gap-4 p-5'>
          <Text className='text-center text-textPrimary typography-h4'>Home Screen</Text>
          <Text className='text-center text-textPrimary'>Hello</Text>
          <Text className='text-center text-textPrimary'>this is a development build</Text>
          <Text className='text-center text-textPrimary'>With hot module replacement</Text>
          <Text className='text-center text-textPrimary'>Wittnescalc</Text>
          <Text className='text-center text-textPrimary'>And proof gen</Text>
          <Text className='text-center text-textPrimary'>Native development sasat'</Text>
        </View>
      </ScrollView>
    </View>
  )
}
