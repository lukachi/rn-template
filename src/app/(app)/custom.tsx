import { Link, router } from 'expo-router'
import { Button, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useProducts } from '@/api/modules/simple'
import { cn } from '@/theme'

export default function Custom() {
  const { data, isLoading, isError } = useProducts()

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

  if (!data?.products.length) {
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
              title='log data'
              onPress={() => {
                console.log(JSON.stringify(data))
              }}
            />

            <Link href='/custom-json-api' asChild>
              <Pressable>
                <Text>JsonApi</Text>
              </Pressable>
            </Link>
          </View>
          <Text>{JSON.stringify(data)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
