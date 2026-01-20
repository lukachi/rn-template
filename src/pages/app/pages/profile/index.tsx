import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import AppContainer from '@/pages/app/components/AppContainer'
import { useAppPaddings } from '@/theme/utils'
import { UiCard, UiCardBody } from '@/ui/UiCard'
import UiScreenScrollable from '@/ui/UiScreenScrollable'
import { UiText } from '@/ui/UiText'

import { AppTabScreenProps } from '../../route-types'
import { LangMenuItem } from './components/LangMenuItem'
import { LocalAuthMethodMenuItem } from './components/LocalAuthMethodMenuItem'
import { ThemeMenuItem } from './components/ThemeMenuItem'

// eslint-disable-next-line no-empty-pattern
export default function ProfileScreen({}: AppTabScreenProps<'Profile'>) {
  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()

  return (
    <AppContainer
      className='bg-background'
      style={{
        paddingTop: insets.top,
      }}
    >
      <View
        className='flex flex-row items-center gap-3'
        style={{
          paddingLeft: appPaddings.left,
          paddingRight: appPaddings.right,
        }}
      >
        <UiText variant='title-medium'>Settings</UiText>
      </View>

      <UiScreenScrollable
        style={{
          paddingLeft: appPaddings.left,
          paddingRight: appPaddings.right,
        }}
        className='mt-6 gap-3'
      >
        <View className='flex-col gap-4'>
          <UiCard>
            <UiCardBody>
              <LangMenuItem />
            </UiCardBody>
          </UiCard>
          <UiCard>
            <UiCardBody>
              <ThemeMenuItem />
            </UiCardBody>
          </UiCard>
          <UiCard>
            <UiCardBody>
              <LocalAuthMethodMenuItem />
            </UiCardBody>
          </UiCard>
        </View>
      </UiScreenScrollable>
    </AppContainer>
  )
}
