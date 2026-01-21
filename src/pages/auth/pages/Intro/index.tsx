import { useNavigation } from '@react-navigation/native'
import { RocketIcon, ShieldCheckIcon, SparklesIcon, ZapIcon } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { cn, useAppPaddings } from '@/theme/utils'
import { UiLucideIcon } from '@/ui/icons/UiLucideIcon'
import { UiButton } from '@/ui/UiButton'
import { UiCheckbox } from '@/ui/UiCheckbox'
import { UiText } from '@/ui/UiText'

type FeatureItemProps = {
  icon: typeof SparklesIcon
  title: string
  description: string
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <View className='flex-row items-start gap-3'>
      <View className='bg-accent/10 rounded-xl p-2.5'>
        <UiLucideIcon as={icon} className='text-accent' size={18} />
      </View>
      <View className='flex-1 gap-0.5'>
        <UiText variant='label-medium' className='text-foreground'>
          {title}
        </UiText>
        <UiText variant='body-small' className='text-muted'>
          {description}
        </UiText>
      </View>
    </View>
  )
}

export default function Intro() {
  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()
  const navigation = useNavigation()

  const [isChecked, setIsChecked] = useState(false)

  return (
    <View
      className='bg-background flex flex-1'
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: appPaddings.left,
        paddingRight: appPaddings.right,
      }}
    >
      {/* Hero Section */}
      <View className='mt-16 items-center'>
        <View className='bg-accent/10 mb-8 rounded-3xl p-6'>
          <UiLucideIcon as={RocketIcon} className='text-accent' size={48} />
        </View>

        <UiText variant='display-small' className='text-foreground mb-3 text-center'>
          Welcome
        </UiText>

        <UiText variant='body-large' className='text-muted max-w-72 text-center'>
          Your new app is ready. Build something amazing.
        </UiText>
      </View>

      {/* Features Section */}
      <View className='bg-surface mt-12 gap-5 rounded-3xl p-5'>
        <FeatureItem
          icon={ZapIcon}
          title='Lightning Fast'
          description='Optimized performance out of the box'
        />

        <FeatureItem
          icon={ShieldCheckIcon}
          title='Secure by Default'
          description='Built-in authentication and encryption'
        />

        <FeatureItem
          icon={SparklesIcon}
          title='Beautiful UI'
          description='Modern design system ready to customize'
        />
      </View>

      {/* Bottom Section */}
      <View className='mt-auto pb-2'>
        <UiButton
          size='lg'
          onPress={() => navigation.navigate('Auth', { screen: 'SignUp' })}
          isDisabled={!isChecked}
        >
          Get Started
        </UiButton>

        <Pressable
          onPress={() => setIsChecked(!isChecked)}
          className={cn(
            'mt-5 flex-row items-center justify-center gap-3 rounded-xl py-3',
            'active:opacity-70',
          )}
        >
          <UiCheckbox isSelected={isChecked} onSelectedChange={setIsChecked} />
          <View className='flex-row flex-wrap items-center gap-1'>
            <UiText variant='body-small' className='text-muted'>
              I agree to the
            </UiText>
            <Pressable>
              <UiText variant='body-small' className='text-accent'>
                Terms of Service
              </UiText>
            </Pressable>
            <UiText variant='body-small' className='text-muted'>
              and
            </UiText>
            <Pressable>
              <UiText variant='body-small' className='text-accent'>
                Privacy Policy
              </UiText>
            </Pressable>
          </View>
        </Pressable>
      </View>
    </View>
  )
}
