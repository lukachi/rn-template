import { router } from 'expo-router'
import { Button, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { getEventTypes } from '@/api/modules/json-api'
import { ErrorHandler } from '@/core'
import { useLoading } from '@/hooks'
import { cn } from '@/theme'

export default function Custom() {
  const { data, isLoading, isLoadingError, isEmpty } = useLoading([], async () => {
    try {
      const response = await getEventTypes()
      return response.data
    } catch (error) {
      ErrorHandler.process(error)
    }
  })

  if (isLoading) {
    return <Text className={cn('text-textPrimary')}>Loading...</Text>
  }

  if (isLoadingError) {
    return <Text className={cn('text-textPrimary')}>Error</Text>
  }

  if (isEmpty) {
    return <Text className={cn('text-textPrimary')}>No data</Text>
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
          <Text className={cn('text-textPrimary')}>{data && JSON.stringify(data)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
