import { useNavigation } from '@react-navigation/native'
import { useCallback } from 'react'
import { Button, Text, View } from 'react-native'

import { LocalAuthRoutesNames } from '@/pages/local-auth/local-auth-routes-names'
import { AppRoutesNames } from '@/root-route-names'
import { localAuthStore } from '@/store'
import { cn } from '@/theme'

export default function EnablePasscode() {
  const disablePasscode = localAuthStore.useLocalAuthStore(state => state.disablePasscode)

  const navigation = useNavigation()

  const onConfirm = useCallback(() => {
    navigation.navigate(LocalAuthRoutesNames.SetPasscode)
  }, [navigation])

  const onSkip = useCallback(() => {
    disablePasscode()

    navigation.navigate(AppRoutesNames.App)
  }, [disablePasscode, navigation])

  return (
    <View className={cn('flex flex-1 items-center justify-center')}>
      <Text className={cn('my-auto text-textPrimary typography-h4')}>Enable Passcode</Text>

      <View className={cn('flex w-full gap-6 p-5')}>
        <Button title='Enable' onPress={onConfirm} />
        <Button title='Skip' onPress={onSkip} />
      </View>
    </View>
  )
}
