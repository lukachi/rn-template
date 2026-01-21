import { AuthenticationType } from 'expo-local-authentication'
import { FingerprintIcon, ScanFaceIcon, SparklesIcon, ZapIcon } from 'lucide-react-native'
import { useCallback, useMemo } from 'react'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ErrorHandler } from '@/core'
import { localAuthStore } from '@/store/modules/local-auth'
import { cn, useAppPaddings } from '@/theme/utils'
import { UiLucideIcon } from '@/ui/icons/UiLucideIcon'
import { UiButton } from '@/ui/UiButton'
import { UiText } from '@/ui/UiText'

import { type LocalAuthStackScreenProps } from '../route-types'

type BiometricConfig = {
  icon: typeof FingerprintIcon
  title: string
  description: string
  buttonText: string
}

const BIOMETRIC_CONFIG: Record<AuthenticationType, BiometricConfig> = {
  [AuthenticationType.FINGERPRINT]: {
    icon: FingerprintIcon,
    title: 'Enable Touch ID',
    description: 'Use your fingerprint for quick and secure access to your app',
    buttonText: 'Enable Touch ID',
  },
  [AuthenticationType.FACIAL_RECOGNITION]: {
    icon: ScanFaceIcon,
    title: 'Enable Face ID',
    description: 'Use facial recognition for quick and secure access to your app',
    buttonText: 'Enable Face ID',
  },
  [AuthenticationType.IRIS]: {
    icon: ScanFaceIcon,
    title: 'Enable Iris Scan',
    description: 'Use iris recognition for quick and secure access to your app',
    buttonText: 'Enable Iris Scan',
  },
}

type FeatureItemProps = {
  icon: typeof SparklesIcon
  title: string
  description: string
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <View className='bg-surface flex-row items-start gap-4 rounded-2xl p-4'>
      <View className='bg-accent/10 rounded-xl p-3'>
        <UiLucideIcon as={icon} className='text-accent' size={22} />
      </View>
      <View className='flex-1 gap-1'>
        <UiText variant='label-large' className='text-foreground'>
          {title}
        </UiText>
        <UiText variant='body-small' className='text-muted'>
          {description}
        </UiText>
      </View>
    </View>
  )
}

// eslint-disable-next-line no-empty-pattern
export default function EnableBiometrics({}: LocalAuthStackScreenProps<'EnableBiometrics'>) {
  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()

  const biometricTypes = localAuthStore.useLocalAuthStore(state => state.biometricAuthTypes)
  const enableBiometrics = localAuthStore.useLocalAuthStore(state => state.enableBiometrics)
  const disableBiometrics = localAuthStore.useLocalAuthStore(state => state.disableBiometrics)

  const biometricType = biometricTypes[0] ?? AuthenticationType.FINGERPRINT
  const config = BIOMETRIC_CONFIG[biometricType]

  const tryToEnableBiometrics = useCallback(async () => {
    try {
      await enableBiometrics()
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error)
    }
  }, [enableBiometrics])

  const skipBiometrics = useCallback(() => {
    disableBiometrics()
  }, [disableBiometrics])

  const BiometricIcon = useMemo(() => config.icon, [config.icon])

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: appPaddings.left,
        paddingRight: appPaddings.right,
      }}
      className={cn('bg-background flex flex-1')}
    >
      {/* Header Section */}
      <View className='mt-12 items-center'>
        <View className='bg-accent/10 mb-6 rounded-3xl p-5'>
          <UiLucideIcon as={BiometricIcon} className='text-accent' size={40} />
        </View>

        <UiText variant='headline-medium' className='text-foreground mb-2 text-center'>
          {config.title}
        </UiText>

        <UiText variant='body-medium' className='text-muted max-w-70 text-center'>
          {config.description}
        </UiText>
      </View>

      {/* Features Section */}
      <View className='mt-10 gap-3'>
        <FeatureItem
          icon={ZapIcon}
          title='Instant Access'
          description='Skip the passcode and unlock your app in a fraction of a second'
        />

        <FeatureItem
          icon={SparklesIcon}
          title='Seamless Experience'
          description='Authenticate sensitive actions without interrupting your flow'
        />
      </View>

      {/* Bottom Section */}
      <View className='mt-auto pb-2'>
        <UiButton size='lg' onPress={tryToEnableBiometrics}>
          {config.buttonText}
        </UiButton>

        <Pressable onPress={skipBiometrics} className='mt-4 py-2'>
          <UiText variant='button-small' className='text-muted text-center'>
            Skip for now
          </UiText>
        </Pressable>
      </View>
    </View>
  )
}
