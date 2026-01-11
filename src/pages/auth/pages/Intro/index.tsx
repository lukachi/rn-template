import { useNavigation } from '@react-navigation/native'
import { useState } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { cn } from '@/theme/utils'
import { UiButton } from '@/ui/UiButton'
import { UiCheckbox } from '@/ui/UiCheckbox'
import { UiText, UiTextClassContext } from '@/ui/UiText'

export default function Intro() {
  const insets = useSafeAreaInsets()

  const navigation = useNavigation()

  const [isChecked, setIsChecked] = useState(false)

  return (
    <View
      className='bg-background flex flex-1'
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View className='flex items-center'>
        <UiTextClassContext value={cn('text-white text-center')}>
          <UiText variant='display-large' className='font-medium'>
            Lorem Ipsum
          </UiText>
          <UiText variant='title-large' className='text-muted mt-8 max-w-[80%] font-normal'>
            Dolor sit amet
          </UiText>
        </UiTextClassContext>
      </View>

      <UiButton
        size='lg'
        className='mt-auto'
        onPress={() => {
          navigation.navigate('Auth', { screen: 'SignUp' })
        }}
        isDisabled={!isChecked}
      >
        Get Started
      </UiButton>

      <View className='mt-7 flex max-w-[80%] flex-row gap-4 self-center overflow-hidden'>
        <UiCheckbox isSelected={isChecked} onSelectedChange={setIsChecked} />
        <UiTextClassContext.Provider value={cn('text-white')}>
          <View className='flex flex-row flex-wrap items-center gap-1'>
            <UiText variant='title-small'>I agree to the</UiText>
            <UiText variant='title-small' className='text-accent'>
              Terms of Service
            </UiText>
            <UiText variant='title-small'>and</UiText>
            <UiText variant='title-small' className='text-accent'>
              Privacy Policy
            </UiText>
          </View>
        </UiTextClassContext.Provider>
      </View>
    </View>
  )
}
