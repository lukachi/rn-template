import { FingerprintIcon } from 'lucide-react-native'
import { useCallback, useMemo } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { BiometricStatuses, localAuthStore, PasscodeStatuses } from '@/store/modules/local-auth'
import { cn } from '@/theme/utils'
import { UiLucideIcon } from '@/ui/icons/UiLucideIcon'
import {
  UiBottomSheet,
  UiBottomSheetContent,
  UiBottomSheetOverlay,
  UiBottomSheetPortal,
  UiBottomSheetTitle,
  UiBottomSheetTrigger,
} from '@/ui/UiBottomSheet'
import { UiSwitch } from '@/ui/UiSwitch'
import { UiText } from '@/ui/UiText'

import { ProfileCardMenuItem } from './ProfileCardMenuItem'

export function LocalAuthMethodMenuItem() {
  const insets = useSafeAreaInsets()

  const passcodeStatus = localAuthStore.useLocalAuthStore(state => state.passcodeStatus)
  const biometricStatus = localAuthStore.useLocalAuthStore(state => state.biometricStatus)
  const disablePasscode = localAuthStore.useLocalAuthStore(state => state.disablePasscode)
  const disableBiometric = localAuthStore.useLocalAuthStore(state => state.disableBiometrics)

  const setPasscodeStatus = localAuthStore.useLocalAuthStore(state => state.setPasscodeStatus)
  const setBiometricsStatus = localAuthStore.useLocalAuthStore(state => state.setBiometricsStatus)

  const isPasscodeEnabled = useMemo(
    () => passcodeStatus === PasscodeStatuses.Enabled,
    [passcodeStatus],
  )

  const isBiometricsEnrolled = useMemo(() => {
    return ![BiometricStatuses.NotSupported, BiometricStatuses.NotEnrolled].includes(
      biometricStatus,
    )
  }, [biometricStatus])

  const isBiometricsEnabled = useMemo(
    () => biometricStatus === BiometricStatuses.Enabled,
    [biometricStatus],
  )

  const handleChangePasscodeStatus = useCallback(() => {
    if (isPasscodeEnabled) {
      disablePasscode()

      return
    }

    setPasscodeStatus(PasscodeStatuses.NotSet)
  }, [disablePasscode, isPasscodeEnabled, setPasscodeStatus])

  const handleChangeBiometricStatus = useCallback(() => {
    if (biometricStatus === BiometricStatuses.Enabled) {
      disableBiometric()

      return
    }

    setBiometricsStatus(BiometricStatuses.NotSet)
  }, [biometricStatus, disableBiometric, setBiometricsStatus])

  return (
    <>
      <UiBottomSheet>
        <UiBottomSheetTrigger asChild>
          <ProfileCardMenuItem
            leadingIcon={
              <UiLucideIcon as={FingerprintIcon} className='text-accent-foreground' size={16} />
            }
            title='Auth method'
          />
        </UiBottomSheetTrigger>

        <UiBottomSheetPortal>
          <UiBottomSheetOverlay />

          <UiBottomSheetContent className='mx-4' detached bottomInset={insets.bottom}>
            <UiBottomSheetTitle>Select Auth method</UiBottomSheetTitle>

            <View className={cn('mt-4 flex gap-5')}>
              <View className='flex flex-row items-center justify-between'>
                <UiText variant='body-medium' className='text-foreground font-semibold'>
                  Passcode
                </UiText>
                <UiSwitch
                  isSelected={isPasscodeEnabled}
                  onSelectedChange={handleChangePasscodeStatus}
                />
              </View>
              <View className='flex flex-row items-center justify-between'>
                <UiText variant='body-medium' className='text-foreground font-semibold'>
                  Biometric
                </UiText>

                {isBiometricsEnrolled && (
                  <UiSwitch
                    isSelected={isBiometricsEnabled}
                    onSelectedChange={handleChangeBiometricStatus}
                    isDisabled={!isPasscodeEnabled}
                  />
                )}
              </View>
            </View>
          </UiBottomSheetContent>
        </UiBottomSheetPortal>
      </UiBottomSheet>
    </>
  )
}
