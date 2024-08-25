import type { FieldRecords } from 'mrz'
import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

import { CameraWrapper, DocumentReader } from './components'

export default function HomeScreen() {
  const [mrz, setMrz] = useState<FieldRecords>()

  return (
    <View className='flex flex-1 flex-col'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className='flex flex-1 flex-col gap-4 p-5'>
          <Text className='text-center text-textPrimary typography-h4'>Home Screen</Text>

          {mrz ? <DocumentReader fields={mrz} /> : <CameraWrapper setParseResult={setMrz} />}
        </View>
      </ScrollView>
    </View>
  )
}
