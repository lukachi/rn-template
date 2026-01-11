import { AuthenticationType } from 'expo-local-authentication'
import { FingerprintIcon, ScanFaceIcon } from 'lucide-react-native'
import { useCallback, useMemo } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ErrorHandler } from '@/core'
import { localAuthStore } from '@/store/modules/local-auth'
import { cn, useAppPaddings } from '@/theme/utils'
import { UiLucideIcon } from '@/ui/icons/UiLucideIcon'
import { UiButton } from '@/ui/UiButton'
import { UiText } from '@/ui/UiText'

import { type LocalAuthStackScreenProps } from '../route-types'

// eslint-disable-next-line no-empty-pattern
export default function EnableBiometrics({}: LocalAuthStackScreenProps<'EnableBiometrics'>) {
  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()

  const biometricTypes = localAuthStore.useLocalAuthStore(state => state.biometricAuthTypes)
  const enableBiometrics = localAuthStore.useLocalAuthStore(state => state.enableBiometrics)

  const tryToEnableBiometrics = useCallback(async () => {
    try {
      await enableBiometrics()
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error)
    }
  }, [enableBiometrics])

  const biometricIcon = useMemo(() => {
    return {
      [AuthenticationType.FINGERPRINT]: (
        <UiLucideIcon as={FingerprintIcon} className='text-foreground' size={20} />
      ),
      [AuthenticationType.FACIAL_RECOGNITION]: (
        <UiLucideIcon as={ScanFaceIcon} className='text-foreground' size={20} />
      ),
      [AuthenticationType.IRIS]: (
        <UiLucideIcon as={FingerprintIcon} className='text-foreground' size={20} />
      ),
    }[biometricTypes[0]]
  }, [biometricTypes])

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: appPaddings.left,
        paddingRight: appPaddings.right,
      }}
      className={cn('flex flex-1 items-center')}
    >
      <View className='my-auto flex items-center'>
        <UiText variant='display-medium' className={cn('text-foreground text-center')}>
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
        <UiText variant='headline-medium' className='text-muted text-center'>
          Device Identifier
        </UiText>
        <UiText variant='body-small' className='text-muted text-center'>
          3F8F A0C4 71B8 1B8F
        </UiText>
      </View>

      <View className={cn('mt-7 flex w-full gap-6')}>
        <UiButton size='lg' onPress={tryToEnableBiometrics}>
          <View className='flex flex-row items-center gap-1'>
            {biometricIcon}
            <UiText>Continue with biometrics</UiText>
          </View>
        </UiButton>
      </View>
    </View>
  )
}
