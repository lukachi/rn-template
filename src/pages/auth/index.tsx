import { useNavigation } from '@react-navigation/native'
import { Pressable, Text, View } from 'react-native'

import { useSoftKeyboardEffect } from '@/core'
import { AppRoutesNames } from '@/root-route-names'
import { authStore } from '@/store'
import { cn } from '@/theme'

export default function SignIn() {
  const login = authStore.useAuthStore(state => state.login)

  const navigation = useNavigation()

  useSoftKeyboardEffect()

  return (
    <View className={cn('flex-1 items-center justify-center gap-4')}>
      <Pressable
        onPress={() => {
          login()
          // Navigate after signing in. You may want to tweak this to ensure sign-in is
          // successful before navigating.
          navigation.navigate(AppRoutesNames.App) // TODO: replace
        }}
      >
        <Text className={cn('text-textPrimary')}>Sign In</Text>
      </Pressable>
    </View>
  )
}
