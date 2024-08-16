import { useCallback, useMemo } from 'react'
import { Button, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useSelectedLanguage } from '@/core'
import { type Language, resources } from '@/core/localization/resources'
import { useCopyToClipboard } from '@/hooks'
import {
  authStore,
  BiometricStatuses,
  localAuthStore,
  PasscodeStatuses,
  walletStore,
} from '@/store'
import { cn, useSelectedTheme } from '@/theme'
import { UiButton, UiCard, UiSwitcher } from '@/ui'

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View style={{ paddingBottom: insets.bottom }} className='flex flex-1 flex-col'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className='flex flex-1 flex-col gap-4 p-5'>
          <WalletCard />
          <LangCard />
          <ThemeCard />
          <LocalAuthMethodCard />
          <LogoutCard />
        </View>
      </ScrollView>
    </View>
  )
}

function WalletCard() {
  const privateKey = walletStore.useWalletStore(state => state.privateKey)
  const { isCopied, copy } = useCopyToClipboard()

  return (
    <UiCard>
      <UiCard className='bg-backgroundPrimary'>
        <Text>{privateKey}</Text>
      </UiCard>

      <UiButton
        variant='text'
        color='text'
        leadingIcon={isCopied ? 'checkIcon' : 'copySimpleIcon'}
        title='Copy to Clipboard'
        onPress={() => copy(privateKey)}
      />
    </UiCard>
  )
}

function LangCard() {
  // TODO: reload app after change language
  const { language, setLanguage } = useSelectedLanguage()

  return (
    <UiCard className={cn('flex flex-col items-center gap-4')}>
      <Text className={cn('text-textPrimary')}>current lang: {language}</Text>

      <View className={cn('flex flex-row gap-2')}>
        {Object.keys(resources).map(el => (
          <Button
            key={el}
            title={el}
            onPress={() => {
              setLanguage(el as Language)
            }}
          />
        ))}
      </View>
    </UiCard>
  )
}

function ThemeCard() {
  const { selectedTheme, setSelectedTheme } = useSelectedTheme()

  return (
    <UiCard className={cn('flex items-center gap-4')}>
      <Text className={cn('text-textPrimary')}>{selectedTheme}</Text>

      <View className={cn('flex flex-row gap-4')}>
        <Button title='Light' onPress={() => setSelectedTheme('light')} />
        <Button title='Dark' onPress={() => setSelectedTheme('dark')} />
        <Button title='System' onPress={() => setSelectedTheme('system')} />
      </View>
    </UiCard>
  )
}

function LocalAuthMethodCard() {
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
    <UiCard className='flex flex-col gap-4'>
      <Text className='mb-4 text-center typography-subtitle3'>Auth methods</Text>
      <UiSwitcher
        label='Passcode'
        value={isPasscodeEnabled}
        onValueChange={handleChangePasscodeStatus}
      />
      {isBiometricsEnrolled && (
        <UiSwitcher
          label='Biometric'
          value={isBiometricsEnabled}
          onValueChange={handleChangeBiometricStatus}
          disabled={!isPasscodeEnabled}
        />
      )}
    </UiCard>
  )
}

function LogoutCard() {
  const logout = authStore.useLogout()

  return (
    <UiCard>
      <UiButton
        color='error'
        title='delete account'
        trailingIcon='trashSimpleIcon'
        onPress={logout}
      />
    </UiCard>
  )
}
