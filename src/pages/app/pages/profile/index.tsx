import { BottomSheetView } from '@gorhom/bottom-sheet'
import WheelPicker from '@quidone/react-native-wheel-picker'
import * as Haptics from 'expo-haptics'
import { useColorScheme } from 'nativewind'
import { ReactNode, useCallback, useMemo, useState } from 'react'
import { Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native'
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
import {
  UiBottomSheet,
  UiButton,
  UiCard,
  UiHorizontalDivider,
  UiIcon,
  UiScreenScrollable,
  UiSwitcher,
  useUiBottomSheet,
} from '@/ui'

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
            <LangMenuItem />
            <ThemeMenuItem />
            <LocalAuthMethodMenuItem />
          </UiCard>
          <UiCard className='flex gap-4'>
            <AdvancedMenuItem />
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
        leadingIcon={
          <UiIcon libIcon='Fontisto' name='world-o' className='text-textPrimary' size={5 * 4} />
        }
        title='Language'
        trailingContent={
          <Text className='typography-body4 capitalize text-textSecondary'>{language}</Text>
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
            <UiButton variant='text' title='Cancel' onPress={bottomSheet.dismiss} />

            <UiHorizontalDivider className='mx-auto h-3 w-14 rounded-full' />

            <UiButton
              variant='text'
              title='Submit'
              onPress={() => {
                setLanguage(value as Language)
              }}
            />
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
                color: palette.textPrimary,
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
  const { colorScheme } = useColorScheme()

  return (
    <>
      <ProfileCardMenuItem
        leadingIcon={(() => {
          if (!colorScheme) {
            return (
              <UiIcon
                libIcon='FontAwesome'
                name='paint-brush'
                className='text-textPrimary'
                size={4 * 4}
              />
            )
          }

          return {
            light: (
              <UiIcon
                libIcon='Fontisto'
                name='day-sunny'
                className='text-textPrimary'
                size={4.5 * 4}
              />
            ),
            dark: (
              <UiIcon
                libIcon='Fontisto'
                name='night-clear'
                className='text-textPrimary'
                size={4.5 * 4}
              />
            ),
          }[colorScheme]
        })()}
        title='Theme'
        trailingContent={
          <Text className='typography-body4 capitalize text-textSecondary'>{selectedTheme}</Text>
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
            <UiHorizontalDivider className='mx-auto my-4 mb-0 h-3 w-14 rounded-full' />
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
                icon: (
                  <UiIcon
                    libIcon='Fontisto'
                    name='day-sunny'
                    size={6 * 4}
                    className='text-textPrimary'
                  />
                ),
              },
              {
                title: 'dark',
                value: 'dark',
                icon: (
                  <UiIcon
                    libIcon='Fontisto'
                    name='night-clear'
                    size={6 * 4}
                    className='text-textPrimary'
                  />
                ),
              },
              {
                title: 'system',
                value: 'system',
                icon: (
                  <UiIcon
                    libIcon='Entypo'
                    name='mobile'
                    size={6 * 4}
                    className='text-textPrimary'
                  />
                ),
              },
            ].map(({ value, title, icon }, idx) => (
              <TouchableOpacity
                key={idx}
                className={cn(
                  'flex w-1/4 items-center gap-4 rounded-lg border-2 border-componentPrimary p-3',
                  selectedTheme === value ? 'border-primaryMain' : 'border-componentPrimary',
                )}
                onPress={() => setSelectedTheme(value as ColorSchemeType)}
              >
                {icon}
                <Text className='typography-caption1 capitalize text-textSecondary'>{title}</Text>
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
        leadingIcon={
          <UiIcon libIcon='Entypo' name='fingerprint' className='text-textPrimary' size={5 * 4} />
        }
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
            <UiHorizontalDivider className='mx-auto my-4 mb-2 h-3 w-14 rounded-full' />
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
              <Text className='typography-body3 font-semibold text-textPrimary'>Passcode</Text>
              <UiSwitcher value={isPasscodeEnabled} onValueChange={handleChangePasscodeStatus} />
            </View>
            <View className='flex flex-row items-center justify-between'>
              <Text className='typography-body3 font-semibold text-textPrimary'>Biometric</Text>

              {isBiometricsEnrolled && (
                <UiSwitcher
                  value={isBiometricsEnabled}
                  onValueChange={handleChangeBiometricStatus}
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
        leadingIcon={
          <UiIcon libIcon='Entypo' name='cog' className='text-textPrimary' size={5 * 4} />
        }
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
            <UiHorizontalDivider className='mx-auto my-4 mb-0 h-3 w-14 rounded-full' />
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
            <Text className='typography-caption2 ml-4 font-semibold text-textPrimary'>
              Secret key
            </Text>
            <UiCard className='flex-row bg-backgroundPrimary py-6'>
              <TouchableOpacity className='ml-auto'>
                <UiIcon
                  customIcon={isCopied ? 'checkIcon' : 'copySimpleIcon'}
                  className='text-textSecondary'
                  size={5 * 4}
                  onPress={() => copy('')} // FIXME
                />
              </TouchableOpacity>
            </UiCard>

            <ProfileCardMenuItem
              className='mt-auto rounded-full bg-componentPrimary p-3 px-4'
              leadingIcon={
                <UiIcon
                  libIcon='MaterialCommunityIcons'
                  name='logout'
                  className='text-errorMain'
                  size={4 * 4}
                />
              }
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
      <View className='flex aspect-square size-8 items-center justify-center rounded-full bg-componentPrimary'>
        {leadingIcon}
      </View>

      <Text className={cn('typography-buttonMedium mr-auto text-textPrimary')}>{title}</Text>

      {trailingContent}

      {trailingIcon || (
        <UiIcon
          libIcon='FontAwesome'
          name={isRTL ? 'chevron-left' : 'chevron-right'}
          className='ml-2 text-textSecondary'
          size={3 * 4}
        />
      )}
    </TouchableOpacity>
  )
}
