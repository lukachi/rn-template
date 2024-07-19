import { router } from 'expo-router'
import { Text, View } from 'react-native'

import { authStore } from '@/store'

export default function SignIn() {
  const login = authStore.useAuthStore(state => state.login)
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text
        onPress={() => {
          login()
          // Navigate after signing in. You may want to tweak this to ensure sign-in is
          // successful before navigating.
          router.replace('/')
        }}
      >
        Sign In
      </Text>
    </View>
  )
}
