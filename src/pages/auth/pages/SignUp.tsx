import { useNavigation } from '@react-navigation/native'
import { ArrowLeftIcon, EyeIcon, EyeOffIcon, MailIcon, UserIcon } from 'lucide-react-native'
import { useCallback, useMemo, useState } from 'react'
import { type LayoutChangeEvent, Pressable, View } from 'react-native'
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller'
import Animated from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAppPaddings } from '@/theme/utils'
import { UiLucideIcon } from '@/ui/icons/UiLucideIcon'
import { UiButton } from '@/ui/UiButton'
import { UiText } from '@/ui/UiText'
import { UiTextField, UiTextFieldInput, UiTextFieldLabel } from '@/ui/UiTextField'

export default function SignUp() {
  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()
  const navigation = useNavigation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [footerHeight, setFooterHeight] = useState(0)

  const handleSignUp = useCallback(() => {
    // TODO: Implement sign up logic
  }, [])

  const handleFooterLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout

      if (height !== footerHeight) {
        setFooterHeight(height)
      }
    },
    [footerHeight],
  )

  const isFormValid = email.length > 0 && password.length > 0
  const stickyOffset = useMemo(() => ({ closed: 0, opened: insets.bottom }), [insets.bottom])

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className='bg-background flex-1'
    >
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps='handled'
        bottomOffset={999}
        contentContainerStyle={{
          paddingLeft: appPaddings.left,
          paddingRight: appPaddings.right,
          flexGrow: 1,
        }}
        style={{ flex: 1 }}
      >
        <View className='gap-6'>
          {/* Header */}
          <View className='-ml-2 flex-row items-center pt-4'>
            <Pressable
              onPress={() => navigation.goBack()}
              className='bg-surface rounded-xl p-2 active:opacity-70'
            >
              <UiLucideIcon as={ArrowLeftIcon} className='text-foreground' size={20} />
            </Pressable>
          </View>

          {/* Title Section */}
          <Animated.View className='items-center'>
            <View className='bg-accent/10 mb-4 rounded-3xl p-4'>
              <UiLucideIcon as={UserIcon} className='text-accent' size={32} />
            </View>

            <UiText variant='headline-small' className='text-foreground mb-1 text-center'>
              Create Account
            </UiText>

            <UiText variant='body-small' className='text-muted max-w-64 text-center'>
              Enter your details to get started
            </UiText>
          </Animated.View>

          {/* Form Section */}
          <View className='mt-8 gap-4'>
            <UiTextField>
              <UiTextFieldLabel>Email</UiTextFieldLabel>
              <View className='relative'>
                <View className='absolute top-1/2 left-4 z-10 -translate-y-1/2'>
                  <UiLucideIcon as={MailIcon} className='text-muted' size={20} />
                </View>
                <UiTextFieldInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder='your@email.com'
                  keyboardType='email-address'
                  autoCapitalize='none'
                  autoComplete='email'
                  className='pl-12'
                />
              </View>
            </UiTextField>

            <UiTextField>
              <UiTextFieldLabel>Password</UiTextFieldLabel>
              <View className='relative'>
                <UiTextFieldInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder='Enter your password'
                  secureTextEntry={!showPassword}
                  autoCapitalize='none'
                  autoComplete='password'
                  className='pr-12'
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className='absolute top-1/2 right-4 z-10 -translate-y-1/2'
                >
                  <UiLucideIcon
                    as={showPassword ? EyeOffIcon : EyeIcon}
                    className='text-muted'
                    size={20}
                  />
                </Pressable>
              </View>
            </UiTextField>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <KeyboardStickyView offset={stickyOffset}>
        <View
          onLayout={handleFooterLayout}
          style={{
            paddingLeft: appPaddings.left,
            paddingRight: appPaddings.right,
          }}
          className='bg-background w-full pt-4 pb-2'
        >
          <UiButton size='lg' onPress={handleSignUp} isDisabled={!isFormValid}>
            Create Account
          </UiButton>

          <View className='mt-5 flex-row items-center justify-center gap-1'>
            <UiText variant='body-small' className='text-muted'>
              Already have an account?
            </UiText>
            <Pressable>
              <UiText variant='body-small' className='text-accent'>
                Sign In
              </UiText>
            </Pressable>
          </View>
        </View>
      </KeyboardStickyView>
    </View>
  )
}
