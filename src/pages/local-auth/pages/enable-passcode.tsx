import { useNavigation } from '@react-navigation/native'
import { useCallback } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { cn, useAppPaddings } from '@/theme/utils'
import { UiButton } from '@/ui/UiButton'
import { UiText } from '@/ui/UiText'

import type { LocalAuthStackScreenProps } from '../route-types'

// eslint-disable-next-line no-empty-pattern
export default function EnablePasscode({}: LocalAuthStackScreenProps<'EnablePasscode'>) {
  // const disablePasscode = localAuthStore.useLocalAuthStore(state => state.disablePasscode)

  const navigation = useNavigation()

  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()

  const onConfirm = useCallback(() => {
    navigation.navigate('LocalAuth', {
      screen: 'SetPasscode',
    })
  }, [navigation])

  // const onSkip = useCallback(() => {
  //   disablePasscode()
  // }, [disablePasscode])

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: appPaddings.left,
        paddingRight: appPaddings.right,
      }}
      className={cn('bg-background flex flex-1 items-center')}
    >
      <View className='my-auto flex items-center'>
        <UiText variant='title-medium' className={cn('text-foreground text-center')}>
          Activate the device for approvals
        </UiText>
        <UiText variant='body-small' className={cn('text-muted mt-3 text-center')}>
          Optional sub text here if needed.
        </UiText>

        <View className='mt-8 flex items-center gap-2'>
          <UiText variant='button-medium' className='text-foreground'>
            Use biometrics to approve:
          </UiText>
          <UiText variant='button-medium' className='text-foreground'>
            Workspace updates
          </UiText>
          <UiText variant='button-medium' className='text-foreground'>
            Transactions
          </UiText>
        </View>
      </View>

      <View className='mt-auto flex items-center gap-2'>
        <UiText variant='label-medium' className='text-muted text-center'>
          Device Identifier
        </UiText>
        <UiText variant='body-small' className='text-muted text-center'>
          3F8F A0C4 71B8 1B8F
        </UiText>
      </View>

      <View className={cn('mt-7 flex w-full gap-6')}>
        <UiButton size='lg' onPress={onConfirm}>
          Continue with biometrics
        </UiButton>
        {/* <UiButton title='Skip' onPress={onSkip} /> */}
      </View>
    </View>
  )
}
