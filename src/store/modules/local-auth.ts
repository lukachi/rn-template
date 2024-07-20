import type { AuthenticationType } from 'expo-local-authentication'
import { authenticateAsync } from 'expo-local-authentication'
import { supportedAuthenticationTypesAsync } from 'expo-local-authentication'
import {
  getEnrolledLevelAsync,
  hasHardwareAsync,
  isEnrolledAsync,
  SecurityLevel,
} from 'expo-local-authentication'
import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { combine, createJSONStorage, persist } from 'zustand/middleware'

import { zustandSecureStorage } from '@/store/helpers'

enum PasscodeStatuses {
  NotSet = 'not-set',
  Enabled = 'enabled',
  Disabled = 'disabled',
}

enum BiometricStatuses {
  NotSupported = 'not-supported',
  NotEnrolled = 'not-enrolled',
  NotSet = 'not-set',
  Enabled = 'enabled',
  Disabled = 'disabled',
}

enum AppLockStatuses {
  Locked = 'locked',
  Unlocked = 'unlocked',
}

const MAX_ATTEMPTS = 3
const MAX_FAILED_ATTEMPTS = 3
const START_LOCK_DURATION = 1000 * 60 * 5

const useLocalAuthStore = create(
  persist(
    combine(
      {
        passcode: '',
        passcodeStatus: PasscodeStatuses.NotSet,
        biometricStatus: BiometricStatuses.NotSupported,
        biometricAuthTypes: [] as AuthenticationType[],
        lockStatus: AppLockStatuses.Unlocked,

        attemptsLeft: MAX_ATTEMPTS,
        failedAttempts: 0,
        lockDeadline: null as number | null,
      },
      (setState, getState) => ({
        checkBiometricStatus: async (): Promise<void> => {
          const currentBiometricStatus = getState().biometricStatus

          if (currentBiometricStatus === BiometricStatuses.Disabled) return

          const isBiometricSupported = await hasHardwareAsync()

          if (!isBiometricSupported) {
            setState({ biometricStatus: BiometricStatuses.NotSupported })
            return
          }

          const isBiometricEnrolled = await isEnrolledAsync()

          if (!isBiometricEnrolled) {
            setState({ biometricStatus: BiometricStatuses.NotEnrolled })
            return
          }

          const enrollmentLevel = await getEnrolledLevelAsync()

          if (enrollmentLevel === SecurityLevel.SECRET || enrollmentLevel === SecurityLevel.NONE) {
            setState({ biometricStatus: BiometricStatuses.NotEnrolled })
            return
          }

          const currentBiometricAuthTypes = getState().biometricAuthTypes

          if (!currentBiometricAuthTypes.length) {
            const biometricAuthTypesToSet = await supportedAuthenticationTypesAsync()

            setState({ biometricAuthTypes: biometricAuthTypesToSet })
          }

          if (currentBiometricStatus === BiometricStatuses.Enabled) {
            return
          }

          setState({ biometricStatus: BiometricStatuses.NotSet })
        },
        enableBiometric: (): void => {
          setState({ biometricStatus: BiometricStatuses.Enabled })
        },

        setPasscode: (passcode: string): void => {
          setState({ passcode, passcodeStatus: PasscodeStatuses.Enabled })
        },
        disablePasscode: (): void => {
          setState({ passcode: '', passcodeStatus: PasscodeStatuses.Disabled })
        },

        tryUnlockWithPasscode: (value: string): void => {
          if (value === getState().passcode) {
            setState({
              lockStatus: AppLockStatuses.Unlocked,
              attemptsLeft: MAX_ATTEMPTS,
              failedAttempts: 0,
              lockDeadline: null,
            })

            return
          }

          const currentAttemptsLeft = getState().attemptsLeft - 1

          if (currentAttemptsLeft === 0) {
            const currentFailedAttempts = getState().failedAttempts + 1

            if (currentFailedAttempts >= MAX_FAILED_ATTEMPTS) {
              setState({
                lockStatus: AppLockStatuses.Locked,
                attemptsLeft: 0,
                failedAttempts: 0,
                lockDeadline: Infinity,
              })

              return
            }

            setState({
              lockStatus: AppLockStatuses.Locked,
              attemptsLeft: 0,
              failedAttempts: currentFailedAttempts,
              lockDeadline: Date.now() + START_LOCK_DURATION * currentFailedAttempts,
            })

            return
          }

          setState({ attemptsLeft: currentAttemptsLeft })
        },
        tryUnlockWithBiometrics: async (): Promise<void> => {
          const result = await authenticateAsync()

          if (!result.success) {
            // TODO: check if biometrics authentication has limitted attempts on device
            //  if so, we need to offer to user to unlock with passcode, and block biometrics temporarily
            return
          }

          setState({
            lockStatus: AppLockStatuses.Unlocked,
            attemptsLeft: MAX_ATTEMPTS,
            failedAttempts: 0,
            lockDeadline: null,
          })
        },
      }),
    ),
    {
      name: 'local-auth-store',
      version: 1,
      storage: createJSONStorage(() => zustandSecureStorage),

      partialize: state => ({
        passcode: state.passcode,
        passcodeStatus: state.passcodeStatus,
        biometricStatus: state.biometricStatus,
        biometricAuthTypes: state.biometricAuthTypes,

        attemptsLeft: state.attemptsLeft,
        failedAttempts: state.failedAttempts,
        lockDeadline: state.lockDeadline,
      }),
    },
  ),
)

export const useIsHydrated = () => {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Note: This is just in case you want to take into account manual rehydration.
    // You can remove the following line if you don't need it.
    const unsubHydrate = useLocalAuthStore.persist.onHydrate(() => setHydrated(false))

    const unsubFinishHydration = useLocalAuthStore.persist.onFinishHydration(() =>
      setHydrated(true),
    )

    setHydrated(useLocalAuthStore.persist.hasHydrated())

    return () => {
      unsubHydrate()
      unsubFinishHydration()
    }
  }, [])

  return hydrated
}

const useIsUnlocked = () => {
  const lockStatus = useLocalAuthStore(state => state.lockStatus)

  return lockStatus === AppLockStatuses.Unlocked
}

export const authStore = {
  useLocalAuthStore,
  useIsUnlocked,
}
