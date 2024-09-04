import { useCallback } from 'react'
import { ScrollView, Text, View } from 'react-native'

import { getLeaderboard } from '@/api/modules/points'
import { ErrorHandler } from '@/core'
import { UiButton } from '@/ui'

export default function HomeScreen() {
  const testGetLeaderboard = useCallback(async () => {
    try {
      const leaderboard = await getLeaderboard({
        count: true,
      })

      console.log('leaderboard', leaderboard)
    } catch (error) {
      ErrorHandler.process(error)
    }
  }, [])

  return (
    <View className='flex flex-1 flex-col'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text className={'py-5 text-center text-textPrimary typography-h4'}>Home Screen</Text>

        <UiButton onPress={testGetLeaderboard}>Test getLeaderboard</UiButton>
      </ScrollView>
    </View>
  )
}
