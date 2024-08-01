import { Pressable, Text, View } from 'react-native'

import { useSoftKeyboardEffect } from '@/core'
import { authStore } from '@/store'
import { cn } from '@/theme'

export default function SignIn() {
  const login = authStore.useAuthStore(state => state.login)

  useSoftKeyboardEffect()

  return (
    <View className={cn('flex-1 items-center justify-center gap-4')}>
      <Pressable
        onPress={() => {
          login()
        }}
      >
        <Text className={cn('text-textPrimary')}>Sign In</Text>
      </Pressable>
    </View>
  )
}
