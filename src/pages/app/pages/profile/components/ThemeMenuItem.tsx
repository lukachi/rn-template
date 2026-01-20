import { BrushIcon, MoonIcon, SmartphoneIcon, SunIcon } from 'lucide-react-native'
import { TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Uniwind, useUniwind } from 'uniwind'

import { cn } from '@/theme/utils'
import { UiLucideIcon } from '@/ui/icons/UiLucideIcon'
import {
  UiBottomSheet,
  UiBottomSheetContent,
  UiBottomSheetOverlay,
  UiBottomSheetPortal,
  UiBottomSheetTrigger,
} from '@/ui/UiBottomSheet'
import { UiText } from '@/ui/UiText'

import { ProfileCardMenuItem } from './ProfileCardMenuItem'

export function ThemeMenuItem() {
  const insets = useSafeAreaInsets()

  const { theme, hasAdaptiveThemes } = useUniwind()
  const activeTheme = hasAdaptiveThemes ? 'system' : theme

  return (
    <>
      <UiBottomSheet>
        <UiBottomSheetTrigger asChild>
          <ProfileCardMenuItem
            leadingIcon={(() => {
              if (!theme) {
                return <UiLucideIcon as={BrushIcon} className='text-accent-foreground' size={16} />
              }

              return {
                light: <UiLucideIcon as={SunIcon} className='text-accent-foreground' size={16} />,
                dark: <UiLucideIcon as={MoonIcon} className='text-accent-foreground' size={16} />,
              }[theme]
            })()}
            title='Theme'
            trailingContent={
              <UiText variant='body-medium' className='text-foreground capitalize'>
                {theme}
              </UiText>
            }
          />
        </UiBottomSheetTrigger>

        <UiBottomSheetPortal>
          <UiBottomSheetOverlay />

          <UiBottomSheetContent className='mx-4' detached bottomInset={insets.bottom}>
            <View className={cn('flex flex-row justify-center gap-4')}>
              {[
                {
                  title: 'light',
                  value: 'light',
                  icon: <UiLucideIcon as={SunIcon} className='text-foreground' size={16} />,
                },
                {
                  title: 'dark',
                  value: 'dark',
                  icon: <UiLucideIcon as={MoonIcon} className='text-foreground' size={16} />,
                },
                {
                  title: 'system',
                  value: 'system',
                  icon: <UiLucideIcon as={SmartphoneIcon} className='text-foreground' size={16} />,
                },
              ].map(({ value, title, icon }, idx) => {
                return (
                  <TouchableOpacity
                    key={idx}
                    className={cn(
                      'flex w-2/7 items-center gap-4 rounded-lg border-2 border-amber-300 p-3',
                      activeTheme === value ? 'border-accent' : 'border-foreground/20',
                    )}
                    onPress={() => Uniwind.setTheme(value as 'light' | 'dark' | 'system')}
                  >
                    {icon}
                    <UiText
                      variant='title-medium'
                      className='text-foreground text-center capitalize'
                    >
                      {title}
                    </UiText>
                  </TouchableOpacity>
                )
              })}
            </View>
          </UiBottomSheetContent>
        </UiBottomSheetPortal>
      </UiBottomSheet>
    </>
  )
}
