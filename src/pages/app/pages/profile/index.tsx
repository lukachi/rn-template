import { useCallback, useMemo } from 'react'
import { Button, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ErrorHandler, useSelectedLanguage } from '@/core'
import { type Language, resources } from '@/core/localization/resources'
import { useCopyToClipboard } from '@/hooks'
import type { AppTabScreenProps } from '@/route-types'
import {
  authStore,
  BiometricStatuses,
  localAuthStore,
  PasscodeStatuses,
  walletStore,
} from '@/store'
import { cn, useAppPaddings, useBottomBarOffset, useSelectedTheme } from '@/theme'
import { UiButton, UiCard, UiScreenScrollable, UiSwitcher } from '@/ui'

import AppContainer from '../../components/AppContainer'

// eslint-disable-next-line no-empty-pattern
export default function ProfileScreen({}: AppTabScreenProps<'Profile'>) {
  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()
  const offset = useBottomBarOffset()

  return (
    <AppContainer>
      <UiScreenScrollable
        style={{
          paddingTop: insets.top,
          paddingLeft: appPaddings.left,
          paddingRight: appPaddings.right,
          paddingBottom: offset,
        }}
        className='gap-3'
      >
        <View className='flex flex-1 flex-col gap-4'>
          <WalletCard />
          <LangCard />
          <ThemeCard />
          <LocalAuthMethodCard />
          <LogoutCard />
          <TestsCard />
        </View>
      </UiScreenScrollable>
    </AppContainer>
  )
}

function WalletCard() {
  const privateKey = walletStore.useWalletStore(state => state.privateKey)
  const { isCopied, copy } = useCopyToClipboard()

  return (
    <UiCard>
      <UiCard className='bg-backgroundPrimary'>
        <Text className='typography-body3 text-textPrimary'>{privateKey}</Text>
      </UiCard>

      <UiButton
        variant='text'
        color='text'
        leadingIconProps={{
          customIcon: isCopied ? 'checkIcon' : 'copySimpleIcon',
        }}
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
      <Text className='typography-subtitle3 mb-4 text-center text-textPrimary'>Auth methods</Text>
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
        trailingIconProps={{
          customIcon: 'trashSimpleIcon',
        }}
        onPress={logout}
      />
    </UiCard>
  )
}

function TestsCard() {
  const pk = walletStore.useWalletStore(state => state.privateKey)
  const genAuthProof = authStore.useAuthProof({ byFilePath: true })

  const testAuthProof = async () => {
    try {
      const zkProof = await genAuthProof(pk)
      /* eslint-disable-next-line no-console */
      console.log(zkProof)
    } catch (error) {
      ErrorHandler.process(error)
    }
  }

  return (
    <UiCard>
      <UiButton title='testAuthProof' onPress={testAuthProof} />
    </UiCard>
  )
}
