import { Link, router } from 'expo-router'
import { Button, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useProducts } from '@/api/modules/simple'
import { cn } from '@/theme'

export default function Custom() {
  const { data, isLoading, isError } = useProducts({
    throwOnError: true,
  })

  if (isLoading) {
    return <Text>Loading...</Text>
  }

  if (isError) {
    return <Text>Error</Text>
  }

  if (!data?.products.length) {
    return <Text>No data</Text>
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <Link href='/custom-json-api' asChild>
          <Pressable>
            <Text>JsonApi</Text>
          </Pressable>
        </Link>
        <View className={cn('flex items-start gap-4 p-4')}>
          {router.canGoBack() && (
            <Button
              title='Go back'
              onPress={() => {
                router.back()
              }}
            />
          )}
          <Text>{JSON.stringify(data)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}