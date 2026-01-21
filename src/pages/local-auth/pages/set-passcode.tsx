import { useNavigation } from '@react-navigation/native'
import { LockKeyholeIcon } from 'lucide-react-native'
import { useCallback, useMemo, useState } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ErrorHandler } from '@/core'
import { BiometricStatuses, localAuthStore } from '@/store/modules/local-auth'
import { cn, useAppPaddings } from '@/theme/utils'
import { UiLucideIcon } from '@/ui/icons/UiLucideIcon'
import { UiButton } from '@/ui/UiButton'
import UiNumPad from '@/ui/UiNumPad'
import { UiText } from '@/ui/UiText'

import type { LocalAuthStackScreenProps } from '../route-types'

const PASSCODE_LENGTH = 4

type PasscodeDotProps = {
  filled: boolean
  index: number
  totalFilled: number
}

function PasscodeDot({ filled, index, totalFilled }: PasscodeDotProps) {
  const isLastFilled = filled && index === totalFilled - 1

  return (
    <View
      className={cn(
        'size-4 rounded-full border-2 transition-all',
        filled ? 'border-accent bg-accent' : 'border-muted bg-transparent',
        isLastFilled && 'scale-110',
      )}
    />
  )
}

// eslint-disable-next-line no-empty-pattern
export default function SetPasscode({}: LocalAuthStackScreenProps<'SetPasscode'>) {
  const [passcode, setPasscode] = useState('')
  const setPasscodeStore = localAuthStore.useLocalAuthStore(state => state.setPasscode)
  const biometricStatus = localAuthStore.useLocalAuthStore(state => state.biometricStatus)

  const navigation = useNavigation()

  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()

  const isPasscodeComplete = useMemo(() => passcode.length === PASSCODE_LENGTH, [passcode])

  const submit = useCallback(async () => {
    if (!isPasscodeComplete) return

    try {
      setPasscodeStore(passcode)

      if (biometricStatus === BiometricStatuses.NotSet) {
        navigation.navigate('LocalAuth', {
          screen: 'EnableBiometrics',
        })

        return
      }
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error)
    }
  }, [biometricStatus, isPasscodeComplete, navigation, passcode, setPasscodeStore])

  const handleSetPasscode = useCallback((value: string) => {
    if (value.length > PASSCODE_LENGTH) return

    setPasscode(value)
  }, [])

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: appPaddings.left,
        paddingRight: appPaddings.right,
      }}
      className='bg-background flex-1'
    >
      {/* Header Section */}
      <View className='mt-8 items-center'>
        <View className='bg-accent/10 mb-5 rounded-2xl p-4'>
          <UiLucideIcon as={LockKeyholeIcon} className='text-accent' size={28} />
        </View>

        <UiText variant='headline-small' className='text-foreground mb-2 text-center'>
          Create Your Passcode
        </UiText>

        <UiText variant='body-small' className='text-muted text-center'>
          Enter a {PASSCODE_LENGTH}-digit code to secure your app
        </UiText>
      </View>

      {/* Passcode Dots */}
      <View className='mt-10 items-center'>
        <View className='bg-surface flex-row gap-5 rounded-2xl px-8 py-5'>
          {Array.from({ length: PASSCODE_LENGTH }).map((_, i) => (
            <PasscodeDot
              key={i}
              filled={i < passcode.length}
              index={i}
              totalFilled={passcode.length}
            />
          ))}
        </View>

        <UiText variant='caption2' className='text-muted mt-3'>
          {passcode.length} of {PASSCODE_LENGTH} digits entered
        </UiText>
      </View>

      {/* NumPad Section */}
      <View className='mt-auto'>
        <UiNumPad value={passcode} setValue={handleSetPasscode} className='mb-6' />

        <UiButton size='lg' onPress={submit} isDisabled={!isPasscodeComplete}>
          {isPasscodeComplete
            ? 'Confirm Passcode'
            : `Enter ${PASSCODE_LENGTH - passcode.length} more digits`}
        </UiButton>
      </View>
    </View>
  )
}
