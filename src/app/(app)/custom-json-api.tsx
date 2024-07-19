import { router } from 'expo-router'
import { Button, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useJsonApiTest } from '@/api/modules/json-api'
import { cn } from '@/theme'

export default function Custom() {
  const { data, isLoading, isError, error } = useJsonApiTest()

  if (isLoading) {
    return <Text>Loading...</Text>
  }

  if (isError) {
    console.log(JSON.stringify(error))

    return <Text>Error</Text>
  }

  if (!data) {
    return <Text>No data</Text>
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <View className={cn('flex items-start gap-4 p-4')}>
          {router.canGoBack() && (
            <Button
              title='Go back'
              onPress={() => {
                router.back()
              }}
            />
          )}
          <Button
            title={'fetch shit'}
            onPress={() => {
              console.log(JSON.stringify(data))
            }}
          />
          <Text>{data && JSON.stringify(data)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
