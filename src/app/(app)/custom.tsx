import { Link, router } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Button, Pressable, ScrollView, Text, View } from 'react-native'

import { getProducts } from '@/api/modules/simple'
import type { Product } from '@/api/modules/simple/types'
import { ErrorHandler } from '@/core'
import { cn } from '@/theme'

export default function Custom() {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadFailed, setIsLoadFailed] = useState(false)
  const [data, setData] = useState<Product[]>()

  const init = useCallback(async () => {
    try {
      const response = await getProducts()
      setData(response.data.products)
    } catch (error) {
      ErrorHandler.process(error)
      setIsLoadFailed(true)
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading) {
    return <Text className={cn('text-textPrimary')}>Loading...</Text>
  }

  if (isLoadFailed) {
    return <Text className={cn('text-textPrimary')}>Error</Text>
  }

  if (!data?.length) {
    return <Text className={cn('text-textPrimary')}>No data</Text>
  }

  return (
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
              <Text className={cn('text-textPrimary')}>JsonApi</Text>
            </Pressable>
          </Link>
        </View>
        <Text className={cn('text-textPrimary')}>{JSON.stringify(data)}</Text>
      </View>
    </ScrollView>
  )
}
