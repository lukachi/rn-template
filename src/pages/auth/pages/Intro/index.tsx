import { BottomSheetView } from '@gorhom/bottom-sheet'
import {
  CaseLowerIcon,
  ImportIcon,
  PencilIcon,
  SearchSlashIcon,
  SunIcon,
} from 'lucide-react-native'
import { useMemo, useRef } from 'react'
import { Dimensions, TouchableOpacity, View } from 'react-native'
import type { ICarouselInstance } from 'react-native-reanimated-carousel'
import Carousel from 'react-native-reanimated-carousel'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTranslate } from '@/core'
import { cn, useAppTheme } from '@/theme'
import UiCustomIcon from '@/ui/icons/UiCustomIcon'
import { UiLucideIcon } from '@/ui/icons/UiLucideIcon'
import { BottomSheetHeader, UiBottomSheet, useUiBottomSheet } from '@/ui/UiBottomSheet'
import { UiButton } from '@/ui/UiButton'
import { UiCard, UiCardContent, UiCardHeader } from '@/ui/UiCard'
import { UiText } from '@/ui/UiText'

import { StepLayout } from './components'

const screenWidth = Dimensions.get('window').width

export default function Intro() {
  const insets = useSafeAreaInsets()

  const { palette } = useAppTheme()

  const ref = useRef<ICarouselInstance>(null)

  const bottomSheet = useUiBottomSheet()

  const translate = useTranslate()

  const steps = useMemo(() => {
    return [
      {
        title: translate('auth.intro.step-1.title'),
        subtitle: translate('auth.intro.step-1.subtitle'),
        media: (
          <UiCustomIcon
            name='trophyFillIcon'
            className='text-muted-foreground size-[150px]'
            width={150}
            height={150}
          />
        ),
      },
      {
        title: translate('auth.intro.step-2.title'),
        subtitle: translate('auth.intro.step-2.subtitle'),
        media: <UiLucideIcon as={SearchSlashIcon} className='text-muted-foreground size-[150px]' />,
      },
      {
        title: translate('auth.intro.step-3.title'),
        subtitle: translate('auth.intro.step-3.subtitle'),
        media: <UiLucideIcon as={CaseLowerIcon} className='text-muted-foreground size-[150px]' />,
      },
      {
        title: translate('auth.intro.step-4.title'),
        subtitle: translate('auth.intro.step-4.subtitle'),
        media: <UiLucideIcon as={SunIcon} className='text-muted-foreground size-[150px]' />,
      },
    ]
  }, [translate])

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
      <View
        style={{
          paddingTop: insets.top,
        }}
        className='flex flex-1 flex-col justify-center rounded-b-[50] pb-10'
      >
        <Carousel
          ref={ref}
          width={screenWidth}
          data={steps}
          autoPlayInterval={5_000}
          renderItem={({ index }) => (
            <StepLayout
              className='flex-1'
              title={steps[index].title}
              subtitle={steps[index].subtitle}
              media={steps[index].media}
            />
          )}
        />
      </View>

      <View className='flex flex-col px-5 pt-5'>
        <UiButton
          size='lg'
          className={cn('w-full')}
          onPress={() => {
            bottomSheet.present()
          }}
        >
          {translate('auth.intro.next-btn')}
        </UiButton>
      </View>

      <UiBottomSheet
        detached
        snapPoints={['40%']}
        headerComponent={
          <BottomSheetHeader
            title='Authorization'
            dismiss={bottomSheet.dismiss}
            className='px-5 text-center'
          />
        }
        ref={bottomSheet.ref}
        backgroundStyle={{
          backgroundColor: palette.card,
        }}
      >
        <BottomSheetView className={cn('flex h-full flex-1 items-center gap-2')}>
          <UiText variant='body-large' className='text-muted-foreground'>
            Choose a preferred method
          </UiText>

          <View className='mt-auto mb-6 flex flex-row gap-4 px-5'>
            {[
              {
                title: 'Create new',
                handler: () => {},
                icon: <UiLucideIcon as={PencilIcon} className='text-foreground size-12' />,
              },
              {
                title: 'Import',
                handler: () => {},
                icon: <UiLucideIcon as={ImportIcon} className='text-foreground size-12' />,
              },
            ].map((el, idx) => (
              <TouchableOpacity
                key={idx}
                className='flex-1 p-4 py-12 font-semibold'
                onPress={el.handler}
              >
                <UiCard>
                  <UiCardHeader>{el.icon}</UiCardHeader>
                  <UiCardContent className='flex items-center gap-2'>
                    <UiText variant='title-small'>{el.title}</UiText>
                  </UiCardContent>
                </UiCard>
              </TouchableOpacity>
            ))}
          </View>
        </BottomSheetView>
      </UiBottomSheet>
    </View>
  )
}
