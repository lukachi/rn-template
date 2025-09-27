import { BottomSheetView } from '@gorhom/bottom-sheet'
import WheelPicker from '@quidone/react-native-wheel-picker'
import * as Haptics from 'expo-haptics'
import {
  BookIcon,
  BrushIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CogIcon,
  CopyIcon,
  FingerprintIcon,
  LogOutIcon,
  MoonIcon,
  SmartphoneIcon,
  SunIcon,
} from 'lucide-react-native'
import { ReactNode, useCallback, useMemo, useState } from 'react'
import { useColorScheme } from 'react-native'
import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { isRTL, useSelectedLanguage } from '@/core'
import { Language, resources } from '@/core/localization/resources'
import { useCopyToClipboard } from '@/hooks'
import AppContainer from '@/pages/app/components/AppContainer'
import type { AppTabScreenProps } from '@/route-types'
import { BiometricStatuses, localAuthStore, PasscodeStatuses } from '@/store'
import {
  cn,
  ColorSchemeType,
  useAppPaddings,
  useAppTheme,
  useBottomBarOffset,
  useSelectedTheme,
} from '@/theme'
import { UiLucideIcon } from '@/ui/icons/UiLucideIcon'
import { UiBottomSheet, useUiBottomSheet } from '@/ui/UiBottomSheet'
import { UiButton } from '@/ui/UiButton'
import { UiCard, UiCardContent } from '@/ui/UiCard'
import UiScreenScrollable from '@/ui/UiScreenScrollable'
import { UiSeparator } from '@/ui/UiSeparator'
import { UiSwitch } from '@/ui/UiSwitch'
import { UiText } from '@/ui/UiText'

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
          <UiCard className='flex gap-4'>
            <UiCardContent>
              <LangMenuItem />
              <ThemeMenuItem />
              <LocalAuthMethodMenuItem />
            </UiCardContent>
          </UiCard>
          <UiCard className='flex gap-4'>
            <UiCardContent>
              <AdvancedMenuItem />
            </UiCardContent>
          </UiCard>
        </View>
      </UiScreenScrollable>
    </AppContainer>
  )
}

function LangMenuItem() {
  const appPaddings = useAppPaddings()
  const { palette } = useAppTheme()

  // TODO: reload app after change language
  const { language, setLanguage } = useSelectedLanguage()
  const [value, setValue] = useState<string>(language)

  const bottomSheet = useUiBottomSheet()

  return (
    <>
      <ProfileCardMenuItem
        leadingIcon={<UiLucideIcon as={BookIcon} className='text-foreground size-16' />}
        title='Language'
        trailingContent={
          <UiText variant='body-medium' className='text-muted-foreground capitalize'>
            {language}
          </UiText>
        }
        onPress={bottomSheet.present}
      />

      <UiBottomSheet
        title='Select Theme'
        ref={bottomSheet.ref}
        detached
        enableDynamicSizing={false}
        snapPoints={['40%']}
        headerComponent={
          <View className='flex flex-row items-center justify-center'>
            <UiButton variant='ghost' onPress={bottomSheet.dismiss}>
              <UiText>Cancel</UiText>
            </UiButton>

            <UiSeparator className='mx-auto h-3 w-14 rounded-full' />

            <UiButton
              variant='ghost'
              onPress={() => {
                setLanguage(value as Language)
              }}
            >
              <UiText>Submit</UiText>
            </UiButton>
          </View>
        }
      >
        <BottomSheetView
          className='w-full gap-2'
          style={{
            paddingLeft: appPaddings.left,
            paddingRight: appPaddings.right,
          }}
        >
          <View className={cn('flex justify-center gap-2')}>
            <WheelPicker
              data={Object.keys(resources).map(el => ({
                label: {
                  en: 'English',
                  ar: 'العربية',
                  uk: 'Українська',
                }[el],
                value: el,
              }))}
              itemTextStyle={{
                color: palette.foreground,
              }}
              value={value}
              onValueChanged={({ item: { value } }) => setValue(value)}
              onValueChanging={Haptics.selectionAsync}
              enableScrollByTapOnItem
            />
          </View>
        </BottomSheetView>
      </UiBottomSheet>
    </>
  )
}

function ThemeMenuItem() {
  const appPaddings = useAppPaddings()

  const bottomSheet = useUiBottomSheet()

  const { selectedTheme, setSelectedTheme } = useSelectedTheme()
  const colorScheme = useColorScheme()

  return (
    <>
      <ProfileCardMenuItem
        leadingIcon={(() => {
          if (!colorScheme) {
            return <UiLucideIcon as={BrushIcon} className='text-foreground size-4' />
          }

          return {
            light: <UiLucideIcon as={SunIcon} className='text-foreground size-5' />,
            dark: <UiLucideIcon as={MoonIcon} className='text-foreground size-5' />,
          }[colorScheme]
        })()}
        title='Theme'
        trailingContent={
          <UiText variant='body-medium' className='text-muted-foreground capitalize'>
            {selectedTheme}
          </UiText>
        }
        onPress={bottomSheet.present}
      />

      <UiBottomSheet
        title='Select Theme'
        ref={bottomSheet.ref}
        detached
        enableDynamicSizing={false}
        snapPoints={['30%']}
        headerComponent={
          <>
            <UiSeparator className='mx-auto my-4 mb-0 h-3 w-14 rounded-full' />
          </>
        }
      >
        <BottomSheetView
          className='mt-3 flex size-full gap-2 pt-6'
          style={{
            paddingLeft: appPaddings.left,
            paddingRight: appPaddings.right,
          }}
        >
          <View className={cn('flex flex-row justify-center gap-4')}>
            {[
              {
                title: 'light',
                value: 'light',
                icon: <UiLucideIcon as={SunIcon} className='text-foreground size-5' />,
              },
              {
                title: 'dark',
                value: 'dark',
                icon: <UiLucideIcon as={MoonIcon} className='text-foreground size-5' />,
              },
              {
                title: 'system',
                value: 'system',
                icon: <UiLucideIcon as={SmartphoneIcon} className='text-foreground size-5' />,
              },
            ].map(({ value, title, icon }, idx) => (
              <TouchableOpacity
                key={idx}
                className={cn(
                  'flex w-1/4 items-center gap-4 rounded-lg border-2 border-amber-300 p-3',
                  selectedTheme === value ? 'border-primaryMain' : 'border-componentPrimary',
                )}
                onPress={() => setSelectedTheme(value as ColorSchemeType)}
              >
                {icon}
                <UiText variant='title-medium' className='text-muted-foreground capitalize'>
                  {title}
                </UiText>
              </TouchableOpacity>
            ))}
          </View>
        </BottomSheetView>
      </UiBottomSheet>
    </>
  )
}

function LocalAuthMethodMenuItem() {
  const appPaddings = useAppPaddings()

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

  const bottomSheet = useUiBottomSheet()

  return (
    <>
      <ProfileCardMenuItem
        leadingIcon={<UiLucideIcon as={FingerprintIcon} className='text-foreground size-5' />}
        title='Auth method'
        onPress={bottomSheet.present}
      />

      <UiBottomSheet
        title='Select Auth method'
        ref={bottomSheet.ref}
        detached
        enableDynamicSizing={false}
        snapPoints={['20%']}
        headerComponent={
          <>
            <UiSeparator className='mx-auto my-4 mb-2 h-3 w-14 rounded-full' />
          </>
        }
      >
        <BottomSheetView
          className='mt-3 w-full gap-2'
          style={{
            paddingLeft: appPaddings.left,
            paddingRight: appPaddings.right,
          }}
        >
          <View className={cn('flex gap-5')}>
            <View className='flex flex-row items-center justify-between'>
              <UiText variant='body-medium' className='text-foreground font-semibold'>
                Passcode
              </UiText>
              <UiSwitch checked={isPasscodeEnabled} onCheckedChange={handleChangePasscodeStatus} />
            </View>
            <View className='flex flex-row items-center justify-between'>
              <UiText variant='body-medium' className='text-foreground font-semibold'>
                Biometric
              </UiText>

              {isBiometricsEnrolled && (
                <UiSwitch
                  checked={isBiometricsEnabled}
                  onCheckedChange={handleChangeBiometricStatus}
                  disabled={!isPasscodeEnabled}
                />
              )}
            </View>
          </View>
        </BottomSheetView>
      </UiBottomSheet>
    </>
  )
}

function AdvancedMenuItem() {
  const appPaddings = useAppPaddings()

  const { isCopied, copy } = useCopyToClipboard()
  const logout = () => {} // FIXME

  const bottomSheet = useUiBottomSheet()

  return (
    <>
      <ProfileCardMenuItem
        leadingIcon={<UiLucideIcon as={CogIcon} className='text-foreground size-5' />}
        title='Advanced'
        onPress={bottomSheet.present}
      />

      <UiBottomSheet
        title='Advanced'
        ref={bottomSheet.ref}
        detached
        enableDynamicSizing={false}
        snapPoints={['30%']}
        headerComponent={
          <>
            <UiSeparator className='mx-auto my-4 mb-0 h-3 w-14 rounded-full' />
          </>
        }
      >
        <BottomSheetView
          className='mt-3 flex size-full gap-2 pb-6'
          style={{
            paddingLeft: appPaddings.left,
            paddingRight: appPaddings.right,
          }}
        >
          <View className={cn('flex size-full flex-1 gap-2')}>
            <UiText variant='body-medium' className='text-foreground ml-4 font-semibold'>
              Secret key
            </UiText>
            <UiCard className='flex-row py-6'>
              <TouchableOpacity className='ml-auto'>
                <UiLucideIcon
                  as={isCopied ? CheckIcon : CopyIcon}
                  className='text-muted-foreground size-5'
                  onPress={() => copy('')} // FIXME
                />
              </TouchableOpacity>
            </UiCard>

            <ProfileCardMenuItem
              className='bg-muted mt-auto rounded-full p-3 px-4'
              leadingIcon={<UiLucideIcon as={LogOutIcon} className='text-destructive size-4' />}
              trailingIcon={<></>}
              title='Log out'
              onPress={logout}
            />
          </View>
        </BottomSheetView>
      </UiBottomSheet>
    </>
  )
}

/* ================================================================================================ */

function ProfileCardMenuItem({
  leadingIcon,
  trailingIcon,

  title,
  trailingContent,

  className,
  ...rest
}: {
  leadingIcon: ReactNode
  trailingIcon?: ReactNode
  title: string
  trailingContent?: ReactNode
} & Omit<TouchableOpacityProps, 'children'>) {
  return (
    <TouchableOpacity
      {...rest}
      className={cn('flex w-full flex-row items-center gap-2 py-2', className)}
    >
      <View className='bg-muted flex aspect-square size-8 items-center justify-center rounded-full'>
        {leadingIcon}
      </View>

      <UiText variant='body-medium' className={cn('text-foreground mr-auto')}>
        {title}
      </UiText>

      {trailingContent}

      {trailingIcon || (
        <UiLucideIcon
          as={isRTL ? ChevronLeftIcon : ChevronRightIcon}
          className='text-muted-foreground ml-2 size-3'
        />
      )}
    </TouchableOpacity>
  )
}
