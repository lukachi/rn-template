import WheelPicker from '@quidone/react-native-wheel-picker'
import * as Haptics from 'expo-haptics'
import { BookIcon } from 'lucide-react-native'
import { useState } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useResolveClassNames } from 'uniwind'

import { useSelectedLanguage } from '@/core'
import { Language, resources } from '@/core/localization/resources'
import { cn } from '@/theme/utils'
import { UiLucideIcon } from '@/ui/icons/UiLucideIcon'
import {
  UiBottomSheet,
  UiBottomSheetClose,
  UiBottomSheetContent,
  UiBottomSheetOverlay,
  UiBottomSheetPortal,
  UiBottomSheetTrigger,
} from '@/ui/UiBottomSheet'
import { UiButton } from '@/ui/UiButton'
import { UiText } from '@/ui/UiText'

import { ProfileCardMenuItem } from './ProfileCardMenuItem'

export function LangMenuItem() {
  const insets = useSafeAreaInsets()

  // TODO: reload app after change language
  const { language, setLanguage } = useSelectedLanguage()
  const [value, setValue] = useState<string>(language)

  const bgStyles = useResolveClassNames('text-overlay-foreground')

  return (
    <>
      <UiBottomSheet>
        <UiBottomSheetTrigger asChild>
          <ProfileCardMenuItem
            leadingIcon={
              <UiLucideIcon as={BookIcon} className='text-accent-foreground' size={16} />
            }
            title='Language'
            trailingContent={
              <UiText variant='body-medium' className='text-foreground capitalize'>
                {language}
              </UiText>
            }
          />
        </UiBottomSheetTrigger>

        <UiBottomSheetPortal>
          <UiBottomSheetOverlay />

          <UiBottomSheetContent className='mx-4' detached bottomInset={insets.bottom}>
            <View className='flex w-full flex-row items-center justify-between'>
              <UiBottomSheetClose asChild>
                <UiButton variant='ghost'>
                  <UiText>Cancel</UiText>
                </UiButton>
              </UiBottomSheetClose>

              <UiButton
                variant='ghost'
                onPress={() => {
                  setLanguage(value as Language)
                }}
              >
                <UiText>Submit</UiText>
              </UiButton>
            </View>

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
                itemTextStyle={bgStyles}
                value={value}
                onValueChanged={({ item: { value } }) => setValue(value)}
                onValueChanging={Haptics.selectionAsync}
                enableScrollByTapOnItem
              />
            </View>
          </UiBottomSheetContent>
        </UiBottomSheetPortal>
      </UiBottomSheet>
    </>
  )
}
