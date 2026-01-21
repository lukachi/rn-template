import { useNavigation } from '@react-navigation/native'
import { LockKeyholeIcon, ShieldCheckIcon, SmartphoneIcon } from 'lucide-react-native'
import { useCallback } from 'react'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { localAuthStore } from '@/store/modules/local-auth'
import { cn, useAppPaddings } from '@/theme/utils'
import { UiLucideIcon } from '@/ui/icons/UiLucideIcon'
import { UiButton } from '@/ui/UiButton'
import { UiText } from '@/ui/UiText'

import type { LocalAuthStackScreenProps } from '../route-types'

type FeatureItemProps = {
  icon: typeof ShieldCheckIcon
  title: string
  description: string
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <View className='bg-surface flex-row items-start gap-4 rounded-2xl p-4'>
      <View className='bg-accent/10 rounded-xl p-3'>
        <UiLucideIcon as={icon} className='text-accent' size={22} />
      </View>
      <View className='flex-1 gap-1'>
        <UiText variant='label-large' className='text-foreground'>
          {title}
        </UiText>
        <UiText variant='body-small' className='text-muted'>
          {description}
        </UiText>
      </View>
    </View>
  )
}

// eslint-disable-next-line no-empty-pattern
export default function EnablePasscode({}: LocalAuthStackScreenProps<'EnablePasscode'>) {
  const navigation = useNavigation()
  const disablePasscode = localAuthStore.useLocalAuthStore(state => state.disablePasscode)

  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()

  const onConfirm = useCallback(() => {
    navigation.navigate('LocalAuth', {
      screen: 'SetPasscode',
    })
  }, [navigation])

  const onSkip = useCallback(() => {
    disablePasscode()
  }, [disablePasscode])

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: appPaddings.left,
        paddingRight: appPaddings.right,
      }}
      className={cn('bg-background flex flex-1')}
    >
      {/* Header Section */}
      <View className='mt-12 items-center'>
        <View className='bg-accent/10 mb-6 rounded-3xl p-5'>
          <UiLucideIcon as={LockKeyholeIcon} className='text-accent' size={40} />
        </View>

        <UiText variant='headline-medium' className='text-foreground mb-2 text-center'>
          Secure Your App
        </UiText>

        <UiText variant='body-medium' className='text-muted max-w-70 text-center'>
          Set up a passcode to protect your data and enable quick access
        </UiText>
      </View>

      {/* Features Section */}
      <View className='mt-10 gap-3'>
        <FeatureItem
          icon={ShieldCheckIcon}
          title='Enhanced Security'
          description='Keep your sensitive information protected with an additional layer of security'
        />

        <FeatureItem
          icon={SmartphoneIcon}
          title='Quick Access'
          description='Unlock the app instantly without entering your full credentials'
        />
      </View>

      {/* Bottom Section */}
      <View className='mt-auto pb-2'>
        <UiButton size='lg' onPress={onConfirm}>
          Set Up Passcode
        </UiButton>

        <Pressable onPress={onSkip} className='mt-4 py-2'>
          <UiText variant='button-small' className='text-muted text-center'>
            Skip for now
          </UiText>
        </Pressable>
      </View>
    </View>
  )
}
