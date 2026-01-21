import { useNavigation } from '@react-navigation/native'
import { AuthenticationType } from 'expo-local-authentication'
import {
  AlertTriangleIcon,
  FingerprintIcon,
  LockKeyholeIcon,
  LogOutIcon,
  ScanFaceIcon,
  ShieldOffIcon,
  TimerIcon,
} from 'lucide-react-native'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ErrorHandler } from '@/core'
import { BiometricStatuses, localAuthStore, MAX_ATTEMPTS } from '@/store/modules/local-auth'
import { cn, useAppPaddings } from '@/theme/utils'
import { UiLucideIcon } from '@/ui/icons/UiLucideIcon'
import { UiButton } from '@/ui/UiButton'
import UiNumPad from '@/ui/UiNumPad'
import { UiText } from '@/ui/UiText'

import type { LocalAuthStackScreenProps } from '../route-types'

const PASSCODE_LENGTH = 4

type PasscodeDotProps = {
  filled: boolean
  hasError: boolean
}

function PasscodeDot({ filled, hasError }: PasscodeDotProps) {
  return (
    <View
      className={cn(
        'size-4 rounded-full border-2 transition-all',
        hasError && 'border-danger bg-danger',
        !hasError && filled && 'border-accent bg-accent',
        !hasError && !filled && 'border-muted bg-transparent',
      )}
    />
  )
}

const useUnlockWithBiometrics = () => {
  const tryUnlockWithBiometrics = localAuthStore.useLocalAuthStore(
    state => state.tryUnlockWithBiometrics,
  )

  const [isAttemptFailed, setIsAttemptFailed] = useState(false)

  const unlockWithBiometrics = useCallback(async () => {
    setIsAttemptFailed(false)
    try {
      const unlockStatus = await tryUnlockWithBiometrics()

      if (unlockStatus) {
        return
      }

      setIsAttemptFailed(true)
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error)
      setIsAttemptFailed(true)
    }
  }, [tryUnlockWithBiometrics])

  return {
    unlockWithBiometrics,
    isAttemptFailed,
  }
}

// eslint-disable-next-line no-empty-pattern
export default function Lockscreen({}: LocalAuthStackScreenProps<'Lockscreen'>) {
  const biometricStatus = localAuthStore.useLocalAuthStore(state => state.biometricStatus)
  const attemptsLeft = localAuthStore.useLocalAuthStore(state => state.attemptsLeft)
  const lockDeadline = localAuthStore.useLocalAuthStore(state => state.lockDeadline)
  const resetLocalAuthStore = localAuthStore.useLocalAuthStore(state => state.resetStore)
  const checkLockDeadline = localAuthStore.useCheckLockDeadline()

  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()

  const [passcode, setPasscode] = useState('')
  const [usePasscodeFallback, setUsePasscodeFallback] = useState(false)
  const [hasError, setHasError] = useState(false)

  const tryUnlockWithPasscode = localAuthStore.useLocalAuthStore(
    state => state.tryUnlockWithPasscode,
  )

  const { unlockWithBiometrics } = useUnlockWithBiometrics()

  const navigation = useNavigation()

  const submit = useCallback(
    async (value: string) => {
      if (!value) return

      if (tryUnlockWithPasscode(value)) {
        return
      }

      setHasError(true)
      setTimeout(() => {
        setPasscode('')
        setHasError(false)
      }, 500)
    },
    [tryUnlockWithPasscode],
  )

  const tryLogout = useCallback(async () => {
    await resetLocalAuthStore()

    navigation.navigate('Auth', {
      screen: 'Intro',
    })
  }, [navigation, resetLocalAuthStore])

  const handleSetPasscode = useCallback(
    async (value: string) => {
      if (value.length > PASSCODE_LENGTH) return

      setPasscode(value)

      if (value.length === PASSCODE_LENGTH) {
        await submit(value)
      }
    },
    [submit],
  )

  const handleFallbackToPasscode = useCallback(() => {
    setUsePasscodeFallback(true)
  }, [])

  const handleRetryBiometrics = useCallback(() => {
    setUsePasscodeFallback(false)
    unlockWithBiometrics()
  }, [unlockWithBiometrics])

  const showBiometricsOption = usePasscodeFallback && biometricStatus === BiometricStatuses.Enabled

  // Biometrics Lock Screen
  if (biometricStatus === BiometricStatuses.Enabled && !usePasscodeFallback) {
    return <BiometricsLockScreen onFallbackToPasscode={handleFallbackToPasscode} />
  }

  // Locked State (Temporary or Permanent)
  if (lockDeadline || lockDeadline === Infinity) {
    return (
      <LockedScreen
        lockDeadline={lockDeadline}
        onLogout={tryLogout}
        onLockExpired={checkLockDeadline}
      />
    )
  }

  // Passcode Lock Screen
  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: appPaddings.left,
        paddingRight: appPaddings.right,
      }}
      className='bg-background flex-1'
    >
      {/* Header Section */}
      <View className='mt-8 items-center'>
        <View className='bg-accent/10 mb-5 rounded-2xl p-4'>
          <UiLucideIcon as={LockKeyholeIcon} className='text-accent' size={28} />
        </View>

        <UiText variant='headline-small' className='text-foreground mb-2 text-center'>
          Welcome Back
        </UiText>

        <UiText variant='body-small' className='text-muted text-center'>
          Enter your passcode to unlock
        </UiText>
      </View>

      {/* Passcode Dots */}
      <View className='mt-8 items-center'>
        <View className='bg-surface flex-row gap-5 rounded-2xl px-8 py-5'>
          {Array.from({ length: PASSCODE_LENGTH }).map((_, i) => (
            <PasscodeDot key={i} filled={i < passcode.length} hasError={hasError} />
          ))}
        </View>

        {attemptsLeft < MAX_ATTEMPTS && (
          <View className='bg-danger/10 mt-4 flex-row items-center gap-2 rounded-xl px-4 py-2'>
            <UiLucideIcon as={AlertTriangleIcon} className='text-danger' size={16} />
            <UiText variant='caption1' className='text-danger'>
              {attemptsLeft} {attemptsLeft === 1 ? 'attempt' : 'attempts'} remaining
            </UiText>
          </View>
        )}
      </View>

      {/* NumPad Section */}
      <View className='mt-auto'>
        <UiNumPad
          value={passcode}
          setValue={handleSetPasscode}
          className='mb-6'
          extra={
            showBiometricsOption ? <BiometricButton onPress={handleRetryBiometrics} /> : undefined
          }
        />

        <Pressable onPress={tryLogout} className='flex-row items-center justify-center gap-2 py-3'>
          <UiLucideIcon as={LogOutIcon} className='text-muted' size={18} />
          <UiText variant='button-small' className='text-muted'>
            Forgot passcode? Log out
          </UiText>
        </Pressable>
      </View>
    </View>
  )
}

type BiometricButtonProps = {
  onPress: () => void
}

function BiometricButton({ onPress }: BiometricButtonProps) {
  const biometricTypes = localAuthStore.useLocalAuthStore(state => state.biometricAuthTypes)
  const biometricType = biometricTypes[0] ?? AuthenticationType.FINGERPRINT

  const Icon = useMemo(() => {
    return {
      [AuthenticationType.FINGERPRINT]: FingerprintIcon,
      [AuthenticationType.FACIAL_RECOGNITION]: ScanFaceIcon,
      [AuthenticationType.IRIS]: ScanFaceIcon,
    }[biometricType]
  }, [biometricType])

  return (
    <Pressable onPress={onPress} className='flex-center'>
      <UiLucideIcon as={Icon} className='text-accent' size={24} />
    </Pressable>
  )
}

type BiometricsLockScreenProps = {
  onFallbackToPasscode: () => void
}

function BiometricsLockScreen({ onFallbackToPasscode }: BiometricsLockScreenProps) {
  const { isAttemptFailed, unlockWithBiometrics } = useUnlockWithBiometrics()
  const biometricTypes = localAuthStore.useLocalAuthStore(state => state.biometricAuthTypes)
  const biometricType = biometricTypes[0] ?? AuthenticationType.FINGERPRINT

  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()

  useEffect(() => {
    unlockWithBiometrics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const BiometricIcon = useMemo(() => {
    return {
      [AuthenticationType.FINGERPRINT]: FingerprintIcon,
      [AuthenticationType.FACIAL_RECOGNITION]: ScanFaceIcon,
      [AuthenticationType.IRIS]: ScanFaceIcon,
    }[biometricType]
  }, [biometricType])

  const biometricLabel = useMemo(() => {
    return {
      [AuthenticationType.FINGERPRINT]: 'Touch ID',
      [AuthenticationType.FACIAL_RECOGNITION]: 'Face ID',
      [AuthenticationType.IRIS]: 'Iris Scan',
    }[biometricType]
  }, [biometricType])

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: appPaddings.left,
        paddingRight: appPaddings.right,
      }}
      className='bg-background flex-1'
    >
      {/* Main Content */}
      <View className='my-auto items-center'>
        <Pressable onPress={unlockWithBiometrics} className='bg-accent/10 mb-6 rounded-3xl p-6'>
          <UiLucideIcon as={BiometricIcon} className='text-accent' size={56} />
        </Pressable>

        <UiText variant='headline-medium' className='text-foreground mb-2 text-center'>
          Welcome Back
        </UiText>

        <UiText variant='body-medium' className='text-muted text-center'>
          Tap to unlock with {biometricLabel}
        </UiText>

        {isAttemptFailed && (
          <View className='bg-danger/10 mt-6 flex-row items-center gap-2 rounded-xl px-4 py-3'>
            <UiLucideIcon as={AlertTriangleIcon} className='text-danger' size={18} />
            <UiText variant='body-small' className='text-danger'>
              Authentication failed. Try again.
            </UiText>
          </View>
        )}
      </View>

      {/* Bottom Actions */}
      <View className='pb-2'>
        {isAttemptFailed ? (
          <View className='gap-3'>
            <UiButton size='lg' onPress={unlockWithBiometrics}>
              Try Again
            </UiButton>
            <UiButton size='lg' variant='secondary' onPress={onFallbackToPasscode}>
              Use Passcode Instead
            </UiButton>
          </View>
        ) : (
          <Pressable onPress={onFallbackToPasscode} className='py-3'>
            <UiText variant='button-small' className='text-muted text-center'>
              Use passcode instead
            </UiText>
          </Pressable>
        )}
      </View>
    </View>
  )
}

type LockedScreenProps = {
  lockDeadline: number
  onLogout: () => void
  onLockExpired: () => void
}

function LockedScreen({ lockDeadline, onLogout, onLockExpired }: LockedScreenProps) {
  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()
  const isPermanentlyLocked = lockDeadline === Infinity

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: appPaddings.left,
        paddingRight: appPaddings.right,
      }}
      className='bg-background flex-1'
    >
      {/* Main Content */}
      <View className='my-auto items-center'>
        <View className='bg-danger/10 mb-6 rounded-3xl p-5'>
          <UiLucideIcon
            as={isPermanentlyLocked ? ShieldOffIcon : TimerIcon}
            className='text-danger'
            size={40}
          />
        </View>

        <UiText variant='headline-medium' className='text-foreground mb-2 text-center'>
          {isPermanentlyLocked ? 'App Locked' : 'Too Many Attempts'}
        </UiText>

        <UiText variant='body-medium' className='text-muted max-w-70 text-center'>
          {isPermanentlyLocked
            ? 'Your app has been locked due to too many failed attempts. Please log out to continue.'
            : 'Please wait before trying again'}
        </UiText>

        {!isPermanentlyLocked && (
          <View className='bg-surface mt-8 items-center rounded-2xl px-8 py-5'>
            <UiText variant='caption2' className='text-muted mb-1'>
              Try again in
            </UiText>
            <Countdown deadline={lockDeadline} onFinish={onLockExpired} />
          </View>
        )}
      </View>

      {/* Bottom Actions */}
      <View className='pb-2'>
        {isPermanentlyLocked ? (
          <UiButton size='lg' variant='danger' onPress={onLogout}>
            <View className='flex-row items-center gap-2'>
              <UiLucideIcon as={LogOutIcon} className='text-danger-foreground' size={20} />
              <UiText className='text-danger-foreground'>Log Out</UiText>
            </View>
          </UiButton>
        ) : (
          <UiText variant='caption2' className='text-muted text-center'>
            You&apos;ll be able to try again once the timer expires
          </UiText>
        )}
      </View>
    </View>
  )
}

type CountdownProps = {
  deadline: number
  onFinish: () => void
}

function Countdown({ deadline, onFinish }: CountdownProps) {
  const [timeLeftInSeconds, setTimeLeftInSeconds] = useState(
    Math.max(0, Math.trunc((deadline - Date.now()) / 1000)),
  )

  useEffect(() => {
    const interval = setInterval(() => {
      const timeLeftMilliSec = deadline - Date.now()

      if (timeLeftMilliSec <= 0) {
        onFinish()
        return
      }

      setTimeLeftInSeconds(Math.trunc(timeLeftMilliSec / 1000))
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const minutes = Math.floor(timeLeftInSeconds / 60)
  const seconds = timeLeftInSeconds % 60

  return (
    <UiText variant='display-small' className='text-foreground font-mono'>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </UiText>
  )
}
