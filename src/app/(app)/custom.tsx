import { router } from 'expo-router'
import { Button, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { cn } from '@/theme'

export default function Custom() {
  return (
    <SafeAreaView>
      <View className={cn('flex items-start gap-4 p-4')}>
        {router.canGoBack() && (
          <Button
            title='Go back'
            onPress={() => {
              router.back()
            }}
          />
        )}
        <Text>Custom</Text>
      </View>
    </SafeAreaView>
  )
}
