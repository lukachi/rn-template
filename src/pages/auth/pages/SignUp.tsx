import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAppPaddings } from '@/theme/utils'
import { UiText } from '@/ui/UiText'

export default function SignUp() {
  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()

  return (
    <KeyboardAwareScrollView
      className='bg-background flex w-full flex-1 flex-col'
      style={{
        paddingTop: insets.top + 48,
        paddingBottom: insets.bottom,
        paddingLeft: appPaddings.left,
        paddingRight: appPaddings.right,
      }}
    >
      <UiText variant='display-medium' className='text-foreground text-center font-bold'>
        Activate Your Invitation
      </UiText>
      <UiText variant='title-medium' className='text-muted mt-3 text-center'>
        Contact Support and Get Your Invitation
      </UiText>
    </KeyboardAwareScrollView>
  )
}
