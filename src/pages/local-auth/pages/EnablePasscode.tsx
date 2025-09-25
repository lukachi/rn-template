import { useNavigation } from '@react-navigation/native'
import { useCallback } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTranslate } from '@/core'
import type { LocalAuthStackScreenProps } from '@/route-types'
import { localAuthStore } from '@/store'
import { cn, useAppTheme } from '@/theme'
import { UiButton } from '@/ui/UiButton'
import UiIcon from '@/ui/UiIcon'
import UiScreenScrollable from '@/ui/UiScreenScrollable'
import { UiText } from '@/ui/UiText'

// eslint-disable-next-line no-empty-pattern
export default function EnablePasscode({}: LocalAuthStackScreenProps<'EnablePasscode'>) {
  const disablePasscode = localAuthStore.useLocalAuthStore(state => state.disablePasscode)

  const navigation = useNavigation()

  const insets = useSafeAreaInsets()

  const { palette } = useAppTheme()

  const translate = useTranslate()

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
        <UiText variant='h4' className={cn('')}>
          {translate('enable-passcode.title')}
        </UiText>

        <View className='bg-primary flex size-[120] items-center justify-center rounded-full'>
          <UiIcon customIcon='lockIcon' size={64} color={palette.foreground} />
        </View>
      </View>

      <View className={cn('flex w-full gap-6 p-5')}>
        <UiButton onPress={onConfirm}>{translate('enable-passcode.enable-btn')}</UiButton>
        <UiButton onPress={onSkip}>{translate('enable-passcode.skip-btn')}</UiButton>
      </View>
    </UiScreenScrollable>
  )
}
