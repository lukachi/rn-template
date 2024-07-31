import { useCallback, useEffect } from 'react'
import { View } from 'react-native'

import { getEventTypes } from '@/api/modules/json-api'
import { getProducts } from '@/api/modules/simple'
import { ErrorHandler } from '@/core'
import { useLoading } from '@/hooks'
import { UiButton } from '@/ui'

export default function Fetching() {
  const simpleLoader = useLoading(
    null,
    async () => {
      const response = await getProducts()

      return response.data
    },
    {
      loadOnMount: false,
    },
  )

  const jsonApiLoader = useLoading(
    null,
    async () => {
      const response = await getEventTypes()
      return response.data
    },
    {
      loadOnMount: false,
    },
  )

  const fetchSimple = useCallback(async () => {
    try {
      await simpleLoader.reload()
    } catch (error) {
      ErrorHandler.process(error)
    }
  }, [simpleLoader])

  const fetchJsonApi = useCallback(async () => {
    try {
      await jsonApiLoader.reload()
    } catch (error) {
      ErrorHandler.process(error)
    }
  }, [jsonApiLoader])

  useEffect(() => {
    if (!simpleLoader.data) return

    console.log(simpleLoader.data)
  }, [simpleLoader.data])

  useEffect(() => {
    if (!jsonApiLoader.data) return

    console.log(jsonApiLoader.data)
  }, [jsonApiLoader.data])

  return (
    <View className='flex flex-col gap-4 p-10'>
      <UiButton title='simple' onPress={fetchSimple} />
      <UiButton title='json-api' onPress={fetchJsonApi} />
    </View>
  )
}
