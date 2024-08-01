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

export enum PasscodeStatuses {
  NotSet = 'not-set',
  Enabled = 'enabled',
  Disabled = 'disabled',
}

export enum BiometricStatuses {
  NotSupported = 'not-supported',
  NotEnrolled = 'not-enrolled',
  NotSet = 'not-set',
  Enabled = 'enabled',
  Disabled = 'disabled',
}

export enum AppLockStatuses {
  Locked = 'locked',
  Unlocked = 'unlocked',
}

export enum UserActionsInLocalAuth {
  NeedToEnablePasscode = 'need-to-enable-passcode',
  NeedToEnableBiometrics = 'need-to-enable-biometrics',
  NeedToUnlock = 'need-to-unlock',
}

export const MAX_ATTEMPTS = 5
const MAX_FAILED_ATTEMPTS = 3
const START_LOCK_DURATION = 1000 * 60 * 0.5

const getRawBiometricStatus = async (): Promise<BiometricStatuses> => {
  const isBiometricSupported = await hasHardwareAsync()

  if (!isBiometricSupported) {
    return BiometricStatuses.NotSupported
  }

  const isBiometricEnrolled = await isEnrolledAsync()

  if (!isBiometricEnrolled) {
    return BiometricStatuses.NotEnrolled
  }

  const enrollmentLevel = await getEnrolledLevelAsync()

  if (enrollmentLevel === SecurityLevel.SECRET || enrollmentLevel === SecurityLevel.NONE) {
    return BiometricStatuses.NotEnrolled
  }

  return BiometricStatuses.NotSet
}

const useLocalAuthStore = create(
  persist(
    combine(
      {
        passcode: '',
        passcodeStatus: PasscodeStatuses.NotSet,
        biometricStatus: BiometricStatuses.NotSupported,
        // TODO: for android, the response would be [1, 2], check on iphone if there will be [2, 1]
        biometricAuthTypes: [] as AuthenticationType[],
        lockStatus: AppLockStatuses.Unlocked,

        attemptsLeft: MAX_ATTEMPTS,
        failedAttempts: 0,
        lockDeadline: null as number | null,
      },
      (setState, getState) => ({
        checkBiometricStatus: async (): Promise<void> => {
          const currentBiometricStatus = getState().biometricStatus

          if (
            [BiometricStatuses.Disabled, BiometricStatuses.Enabled].includes(currentBiometricStatus)
          )
            return

          setState({ biometricStatus: await getRawBiometricStatus() })
        },
        checkBiometricAuthTypes: async (): Promise<void> => {
          const biometricAuthTypesToSet = await supportedAuthenticationTypesAsync()

          setState({ biometricAuthTypes: biometricAuthTypesToSet })
        },
        // currently if user failed all biometrics authentication, device will fallback him to passcode,
        // and any retries will open a device passcode enable screen
        enableBiometrics: async (): Promise<void> => {
          const result = await authenticateAsync()

          if (!result.success) {
            throw new TypeError('Biometrics authentication failed')
          }

          setState({ biometricStatus: BiometricStatuses.Enabled })
        },
        disableBiometrics: (): void => {
          setState({ biometricStatus: BiometricStatuses.Disabled })
        },

        setPasscode: (passcode: string): void => {
          setState({ passcode, passcodeStatus: PasscodeStatuses.Enabled })
        },
        disablePasscode: (): void => {
          setState({ passcode: '', passcodeStatus: PasscodeStatuses.Disabled })
        },

        setLockStatus: (lockStatus: AppLockStatuses): void => {
          setState({ lockStatus })
        },

        tryUnlockWithPasscode: (value: string): boolean => {
          if (value === getState().passcode) {
            setState({
              lockStatus: AppLockStatuses.Unlocked,
              attemptsLeft: MAX_ATTEMPTS,
              failedAttempts: 0,
              lockDeadline: null,
            })

            return true
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

              return false
            }

            setState({
              lockStatus: AppLockStatuses.Locked,
              attemptsLeft: 0,
              failedAttempts: currentFailedAttempts,
              lockDeadline: Date.now() + START_LOCK_DURATION * currentFailedAttempts,
            })

            return false
          }

          setState({ attemptsLeft: currentAttemptsLeft })

          return false
        },
        tryUnlockWithBiometrics: async (): Promise<boolean> => {
          const result = await authenticateAsync()

          if (!result.success) {
            return false
          }

          setState({
            lockStatus: AppLockStatuses.Unlocked,
            attemptsLeft: MAX_ATTEMPTS,
            failedAttempts: 0,
            lockDeadline: null,
          })

          return true
        },

        resetLockDeadline: (): void => {
          const currentAttemptsLeft = getState().attemptsLeft

          setState({ lockDeadline: null, attemptsLeft: currentAttemptsLeft + 1 })
        },

        resetStore: async (): Promise<void> => {
          setState({
            passcode: '',
            passcodeStatus: PasscodeStatuses.NotSet,
            biometricStatus: await getRawBiometricStatus(),
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

const useIsHydrated = () => {
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

const useCheckLockDeadline = () => {
  const lockDeadline = useLocalAuthStore(state => state.lockDeadline)
  const resetLockDeadline = useLocalAuthStore(state => state.resetLockDeadline)

  return () => {
    if (lockDeadline) {
      if (lockDeadline < Date.now()) {
        resetLockDeadline()
      }
    }
  }
}

const useInitLocalAuthStore = () => {
  const checkBiometricStatus = useLocalAuthStore(state => state.checkBiometricStatus)
  const checkBiometricAuthTypes = useLocalAuthStore(state => state.checkBiometricAuthTypes)
  const passcodeStatus = useLocalAuthStore(state => state.passcodeStatus)
  const setLockStatus = useLocalAuthStore(state => state.setLockStatus)

  const checkLockDeadline = useCheckLockDeadline()

  return async () => {
    await checkBiometricStatus()
    await checkBiometricAuthTypes()

    setLockStatus(
      passcodeStatus === PasscodeStatuses.Enabled
        ? AppLockStatuses.Locked
        : AppLockStatuses.Unlocked,
    )

    checkLockDeadline()
  }
}

const useUserActionsInLocalAuth = (onDecided: (action: UserActionsInLocalAuth) => void) => {
  const passcodeStatus = useLocalAuthStore(state => state.passcodeStatus)
  const biometricStatus = useLocalAuthStore(state => state.biometricStatus)

  if (passcodeStatus === PasscodeStatuses.NotSet) {
    onDecided(UserActionsInLocalAuth.NeedToEnablePasscode)

    return
  }

  if (passcodeStatus === PasscodeStatuses.Enabled) {
    if (biometricStatus === BiometricStatuses.NotSet) {
      onDecided(UserActionsInLocalAuth.NeedToEnableBiometrics)

      return
    }

    onDecided(UserActionsInLocalAuth.NeedToUnlock)

    return
  }
}

const useUserNeedToLocalAuth = () => {
  const passcodeStatus = useLocalAuthStore(state => state.passcodeStatus)
  const biometricStatus = useLocalAuthStore(state => state.biometricStatus)

  const isUnlocked = useIsUnlocked()
  const isPasscodeEnabled = passcodeStatus === PasscodeStatuses.Enabled
  const isPasscodeNotSet = passcodeStatus === PasscodeStatuses.NotSet
  const isBiometricNotSet = biometricStatus === BiometricStatuses.NotSet
  const isBiometricEnabled = biometricStatus === BiometricStatuses.Enabled

  if (
    isPasscodeNotSet ||
    isBiometricNotSet ||
    ((isPasscodeEnabled || isBiometricEnabled) && !isUnlocked)
  )
    return true

  return false
}

export const localAuthStore = {
  useLocalAuthStore: useLocalAuthStore,

  useIsHydrated: useIsHydrated,
  useIsUnlocked: useIsUnlocked,

  useInitLocalAuthStore: useInitLocalAuthStore,
  useUserActionsInLocalAuth: useUserActionsInLocalAuth,
  useUserNeedToLocalAuth: useUserNeedToLocalAuth,

  useCheckLockDeadline: useCheckLockDeadline,
}

// LOG  store after reset           {"passcode":"3333", "passcodeStatus":"enabled","biometricStatus":"enabled","biometricAuthTypes":[1,2],"lockStatus":"unlocked","attemptsLeft":5,"failedAttempts":0,"lockDeadline":null}
// LOG  SignIn                      {"passcode":"",     "passcodeStatus":"not-set","biometricStatus":"not-supported","biometricAuthTypes":[],"lockStatus":"unlocked","attemptsLeft":5,"failedAttempts":0,"lockDeadline":null}
// LOG  store after reset and sleep {"passcode":"3333", "passcodeStatus":"enabled","biometricStatus":"enabled","biometricAuthTypes":[1,2],"lockStatus":"unlocked","attemptsLeft":5,"failedAttempts":0,"lockDeadline":null}
// LOG  SignIn                      {"passcode":"",     "passcodeStatus":"not-set","biometricStatus":"not-set","biometricAuthTypes":[],"lockStatus":"unlocked","attemptsLeft":5,"failedAttempts":0,"lockDeadline":null}
// LOG  SignIn                      {"passcode":"",     "passcodeStatus":"not-set","biometricStatus":"not-set","biometricAuthTypes":[1,2],"lockStatus":"unlocked","attemptsLeft":5,"failedAttempts":0,"lockDeadline":null}
// LOG  SignIn                      {"passcode":"",     "passcodeStatus":"not-set","biometricStatus":"not-set","biometricAuthTypes":[1,2],"lockStatus":"locked","attemptsLeft":5,"failedAttempts":0,"lockDeadline":null}

// after app reload

// LOG  SignIn {"passcode":"","passcodeStatus":"not-set","biometricStatus":"not-set","biometricAuthTypes":[1,2],"lockStatus":"unlocked","attemptsLeft":5,"failedAttempts":0,"lockDeadline":null}
