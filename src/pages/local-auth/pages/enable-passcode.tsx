import { useNavigation } from '@react-navigation/native'
import { useCallback } from 'react'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { translate } from '@/core'
import type { LocalAuthStackScreenProps } from '@/route-types'
import { localAuthStore } from '@/store'
import { cn, useAppTheme } from '@/theme'
import { UiButton, UiIcon, UiScreenScrollable } from '@/ui'

export default function EnablePasscode({}: LocalAuthStackScreenProps<'EnablePasscode'>) {
  const disablePasscode = localAuthStore.useLocalAuthStore(state => state.disablePasscode)

  const navigation = useNavigation()

  const insets = useSafeAreaInsets()

  const { palette } = useAppTheme()

  const onConfirm = useCallback(() => {
    navigation.navigate('LocalAuth', {
      screen: 'SetPasscode',
    })
  }, [navigation])

  const onSkip = useCallback(() => {
    disablePasscode()
  }, [disablePasscode])

  return (
    <UiScreenScrollable
      style={{
        bottom: insets.bottom,
      }}
      className={cn('flex flex-1 items-center justify-center')}
    >
      <View className='my-auto flex items-center gap-6'>
        <Text className={cn('text-textPrimary typography-h4')}>
          {translate('enable-passcode.title')}
        </Text>

        <View className='flex size-[120] items-center justify-center rounded-full bg-primaryMain'>
          <UiIcon customIcon='lockIcon' size={64} color={palette.baseWhite} />
        </View>
      </View>

      <View className={cn('flex w-full gap-6 p-5')}>
        <UiButton title={translate('enable-passcode.enable-btn')} onPress={onConfirm} />
        <UiButton title={translate('enable-passcode.skip-btn')} onPress={onSkip} />
      </View>
    </UiScreenScrollable>
  )
}
