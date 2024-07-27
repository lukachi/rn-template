import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { AuthenticationType } from 'expo-local-authentication'
import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Pressable, Text, View } from 'react-native'

import { ErrorHandler } from '@/core'
import { authStore, BiometricStatuses, localAuthStore, MAX_ATTEMPTS } from '@/store'
import { cn, useAppTheme } from '@/theme'
import { UiIcon, UiTextField } from '@/ui'

export default function Lockscreen() {
  const biometricStatus = localAuthStore.useLocalAuthStore(state => state.biometricStatus)
  const attemptsLeft = localAuthStore.useLocalAuthStore(state => state.attemptsLeft)
  const lockDeadline = localAuthStore.useLocalAuthStore(state => state.lockDeadline)
  const logout = authStore.useAuthStore(state => state.logout)
  const resetLocalAuthStore = localAuthStore.useLocalAuthStore(state => state.resetStore)
  const checkLockDeadline = localAuthStore.useCheckLockDeadline()

  const [passcode, setPasscode] = useState('')

  const tryUnlockWithPasscode = localAuthStore.useLocalAuthStore(
    state => state.tryUnlockWithPasscode,
  )

  const submit = useCallback(async () => {
    if (!passcode) return

    if (tryUnlockWithPasscode(passcode)) {
      router.replace('(app)')

      return
    }

    console.log('resetting passcode')
    setPasscode('')
  }, [passcode, tryUnlockWithPasscode])

  const tryLogout = useCallback(async () => {
    logout()

    await resetLocalAuthStore()

    router.replace('/sign-in')
  }, [logout, resetLocalAuthStore])

  if (biometricStatus === BiometricStatuses.Enabled) {
    return <BiometricsLockScreen />
  }

  return (
    <View className={cn('flex flex-1 items-center justify-center')}>
      <View className={cn('my-auto flex w-full items-center gap-4 p-5')}>
        {lockDeadline || lockDeadline === Infinity ? (
          <>
            {lockDeadline === Infinity ? (
              <>
                <Text className={cn('text-center text-textPrimary typography-h4')}>
                  Account locked permanently, until logout
                </Text>
                <Button title={'Logout'} onPress={tryLogout} />
              </>
            ) : (
              <>
                <Text className={cn('text-center text-textPrimary typography-h4')}>
                  Account locked
                </Text>
                <Text className={cn('text-textPrimary typography-subtitle1')}>
                  <Countdown deadline={lockDeadline} onFinish={checkLockDeadline} />
                </Text>
              </>
            )}
          </>
        ) : (
          <>
            <Text className={cn('text-center text-textPrimary typography-h4')}>Enter Passcode</Text>

            <UiTextField
              placeholder='passcode'
              value={passcode}
              onChangeText={value => setPasscode(value)}
              inputMode='numeric'
            />

            {attemptsLeft < MAX_ATTEMPTS && (
              <Text className={cn('text-textPrimary typography-subtitle1')}>
                Attempts Left: {attemptsLeft}
              </Text>
            )}

            <View className={cn('flex w-full gap-6 p-5')}>
              <Button title='Enter' onPress={submit} disabled={!passcode} />
              <Button title='Forgot password' onPress={tryLogout} />
            </View>
          </>
        )}
      </View>
    </View>
  )
}

function BiometricsLockScreen() {
  const biometricTypes = localAuthStore.useLocalAuthStore(state => state.biometricAuthTypes)
  const tryUnlockWithBiometrics = localAuthStore.useLocalAuthStore(
    state => state.tryUnlockWithBiometrics,
  )

  const { palette } = useAppTheme()

  const biometricIcon = useMemo(() => {
    return {
      [AuthenticationType.FINGERPRINT]: (
        <UiIcon componentName='fingerprintIcon' size={50} color={palette.primaryMain} />
      ),
      [AuthenticationType.FACIAL_RECOGNITION]: (
        <MaterialCommunityIcons name='face-recognition' size={50} color={palette.primaryMain} />
      ),
      [AuthenticationType.IRIS]: (
        <UiIcon componentName='fingerprintIcon' size={50} color={palette.primaryMain} />
      ),
    }[biometricTypes[0]]
  }, [biometricTypes, palette.primaryMain])

  const unlockWithBiometrics = useCallback(async () => {
    try {
      if (await tryUnlockWithBiometrics()) {
        router.replace('(app)')
      }
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error)
    }
  }, [tryUnlockWithBiometrics])

  useEffect(() => {
    unlockWithBiometrics()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View className={cn('flex flex-1 items-center justify-center')}>
      <View className={cn('my-auto flex w-full items-center gap-4 p-5')}>
        <Text className={cn('text-center text-textPrimary typography-h4')}>
          Unlock with Biometrics
        </Text>
        <Pressable onPress={unlockWithBiometrics}>{biometricIcon}</Pressable>
      </View>
    </View>
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

  return <Text>{timeLeftInSeconds} Sec</Text>
}