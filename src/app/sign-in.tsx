import { router } from 'expo-router'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import SimpleForm from '@/components/Homepage/SimpleForm'
import { useSoftKeyboardEffect } from '@/core'
import { authStore } from '@/store'
import { cn } from '@/theme'

export default function SignIn() {
  const login = authStore.useAuthStore(state => state.login)

  useSoftKeyboardEffect()

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <ScrollView
        style={{
          flex: 1,
        }}
      >
        <View className={cn('flex-1 items-center gap-4')}>
          {/*FORM*/}
          <SimpleForm />
          {/*END FORM*/}

          <Pressable
            onPress={() => {
              login()
              // Navigate after signing in. You may want to tweak this to ensure sign-in is
              // successful before navigating.
              router.replace('/')
            }}
          >
            <Text className={cn('text-textPrimary')}>Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
