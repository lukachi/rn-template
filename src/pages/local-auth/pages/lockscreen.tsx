import { useNavigation } from '@react-navigation/native'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ErrorHandler, useTranslate } from '@/core'
import BiometricsIcon from '@/pages/local-auth/components/BiometricsIcon'
import HiddenPasscodeView from '@/pages/local-auth/components/HiddenPasscodeView'
import { BiometricStatuses, localAuthStore, MAX_ATTEMPTS } from '@/store/modules/local-auth'
import { cn } from '@/theme/utils'
import { UiButton } from '@/ui/UiButton'
import UiNumPad from '@/ui/UiNumPad'
import UiScreenScrollable from '@/ui/UiScreenScrollable'
import { UiText } from '@/ui/UiText'

import type { LocalAuthStackScreenProps } from '../route-types'

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

  const [passcode, setPasscode] = useState('')

  const tryUnlockWithPasscode = localAuthStore.useLocalAuthStore(
    state => state.tryUnlockWithPasscode,
  )

  // const { unlockWithBiometrics } = useUnlockWithBiometrics()

  const translate = useTranslate()

  const navigation = useNavigation()

  const submit = useCallback(
    async (value: string) => {
      if (!value) return

      if (tryUnlockWithPasscode(value)) {
        return
      }

      setPasscode('')
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
      if (value.length > 4) return

      setPasscode(value)

      if (value.length === 4) {
        await submit(value)
      }
    },
    [submit],
  )

  if (biometricStatus === BiometricStatuses.Enabled) {
    return <BiometricsLockScreen />
  }

  return (
    <UiScreenScrollable className={cn('bg-background flex flex-1 items-center justify-center')}>
      {lockDeadline || lockDeadline === Infinity ? (
        <View
          style={{
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
          className='w-full flex-1'
        >
          {lockDeadline === Infinity ? (
            <View className='flex flex-1 items-center gap-2 px-2'>
              <UiText variant='body-small' className={cn('text-foreground my-auto text-center')}>
                {translate('lockscreen.locked-permanently')}
              </UiText>
              <UiButton className='mt-auto w-full' onPress={tryLogout}>
                {translate('lockscreen.logout-btn')}
              </UiButton>
            </View>
          ) : (
            <View className='my-auto flex items-center gap-2'>
              <UiText variant='title-small' className={cn('text-foreground text-center')}>
                {translate('lockscreen.locked-temp')}
              </UiText>
              <UiText variant='title-small' className={cn('text-foreground')}>
                <Countdown deadline={lockDeadline} onFinish={checkLockDeadline} />
              </UiText>
            </View>
          )}
        </View>
      ) : (
        <View
          style={{
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
          className='w-full flex-1'
        >
          <View className={cn('my-auto flex w-full items-center gap-4 p-5')}>
            <UiText variant='title-small' className={cn('text-foreground text-center')}>
              {translate('lockscreen.default-title')}
            </UiText>

            <HiddenPasscodeView length={passcode.length} />

            {attemptsLeft < MAX_ATTEMPTS && (
              <UiText variant='title-medium' className={cn('text-foreground')}>
                {translate('lockscreen.attempts-left', {
                  attemptsLeft,
                })}
              </UiText>
            )}
          </View>

          <View className={cn('flex w-full gap-10 p-5')}>
            <UiNumPad
              value={passcode}
              setValue={handleSetPasscode}
              // TODO: is it necessary? The BiometricsLockScreen will handle it
              // extra={
              //   <Pressable onPress={unlockWithBiometrics}>
              //     <BiometricsIcon size={20} />
              //   </Pressable>
              // }
            />
            <UiButton variant='secondary' onPress={tryLogout}>
              {translate('lockscreen.forgot-btn')}
            </UiButton>
          </View>
        </View>
      )}
    </UiScreenScrollable>
  )
}

function BiometricsLockScreen() {
  const { isAttemptFailed, unlockWithBiometrics } = useUnlockWithBiometrics()

  const insets = useSafeAreaInsets()

  useEffect(() => {
    unlockWithBiometrics()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <UiScreenScrollable
      className={cn('bg-background flex flex-1 items-center justify-center px-4')}
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View className={cn('my-auto flex w-full items-center gap-4 p-5')}>
        <UiText variant='title-small' className={cn('text-foreground text-center')}>
          Unlock with Biometrics
        </UiText>
        <Pressable onPress={unlockWithBiometrics}>
          <BiometricsIcon />
        </Pressable>
      </View>

      {isAttemptFailed && (
        <UiButton onPress={unlockWithBiometrics} className='mt-auto w-full'>
          Try again
        </UiButton>
      )}
    </UiScreenScrollable>
  )
}

function Countdown({ deadline, onFinish }: { deadline: number; onFinish: () => void }) {
  const [timeLeftInSeconds, setTimeLeftInSeconds] = useState(
    Math.trunc((deadline - Date.now()) / 1000),
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

  return <UiText>{timeLeftInSeconds} Sec</UiText>
}
