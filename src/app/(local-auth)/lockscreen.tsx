import { router } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Button, Text, View } from 'react-native'

import { authStore, localAuthStore, MAX_ATTEMPTS } from '@/store'
import { cn } from '@/theme'
import { UiTextField } from '@/ui'

export default function Lockscreen() {
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

// 1721569772593
// 1721569773497
