import { StackActions, useNavigation } from '@react-navigation/native'
import { useCallback } from 'react'
import { Button, Text, View } from 'react-native'

import { AppRouterNames } from '@/route-names'
import { localAuthStore } from '@/store'
import { cn } from '@/theme'

export default function EnablePasscode() {
  const disablePasscode = localAuthStore.useLocalAuthStore(state => state.disablePasscode)

  const navigation = useNavigation()

  const onConfirm = useCallback(() => {
    navigation.dispatch(StackActions.push(AppRouterNames.LocalAuth.SetPasscode))
  }, [navigation])

  const onSkip = useCallback(() => {
    disablePasscode()
  }, [disablePasscode])

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
