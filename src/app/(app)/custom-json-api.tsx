import { router } from 'expo-router'
import { Button, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useJsonApiTest } from '@/api/modules/json-api'
import { cn } from '@/theme'

export default function Custom() {
  const { data, isLoading, isError, error } = useJsonApiTest()

  if (isLoading) {
    return (
      <SafeAreaView>
        <Text>Loading...</Text>
      </SafeAreaView>
    )
  }

  if (isError) {
    return (
      <SafeAreaView>
        <Text>Error</Text>
      </SafeAreaView>
    )
  }

  if (!data) {
    return (
      <SafeAreaView>
        <Text>No data</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <View className={cn('flex items-start gap-4 p-4')}>
          <View className={cn('flex w-full flex-row items-center justify-between')}>
            {router.canGoBack() && (
              <Button
                title='Go back'
                onPress={() => {
                  router.back()
                }}
              />
            )}
            <Button
              title={'log data'}
              onPress={() => {
                console.log(JSON.stringify(data))
              }}
            />
          </View>
          <Text>{data && JSON.stringify(data)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
