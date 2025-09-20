import { BottomSheetView } from '@gorhom/bottom-sheet'
import { useMemo, useRef } from 'react'
import { Dimensions, TouchableOpacity, View } from 'react-native'
import type { ICarouselInstance } from 'react-native-reanimated-carousel'
import Carousel from 'react-native-reanimated-carousel'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTranslate } from '@/core'
import { cn, useAppTheme } from '@/theme'
import { BottomSheetHeader, UiBottomSheet, useUiBottomSheet } from '@/ui/UiBottomSheet'
import { UiButton } from '@/ui/UiButton'
import UiIcon from '@/ui/UiIcon'
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
        media: <UiIcon customIcon='starFillIcon' className='size-[150px] text-muted-foreground' />,
      },
      {
        title: translate('auth.intro.step-2.title'),
        subtitle: translate('auth.intro.step-2.subtitle'),
        media: <UiIcon customIcon='sealCheckIcon' className='size-[150px] text-muted-foreground' />,
      },
      {
        title: translate('auth.intro.step-3.title'),
        subtitle: translate('auth.intro.step-3.subtitle'),
        media: (
          <UiIcon
            customIcon='suitcaseSimpleFillIcon'
            className='size-[150px] text-muted-foreground'
          />
        ),
      },
      {
        title: translate('auth.intro.step-4.title'),
        subtitle: translate('auth.intro.step-4.subtitle'),
        media: <UiIcon customIcon='sunIcon' className='size-[150px] text-muted-foreground' />,
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
          borderRadius: 40,
        }}
      >
        <BottomSheetView className={cn('flex h-full flex-1 items-center gap-2')}>
          <UiText className='typography-body2'>Choose a preferred method</UiText>

          <View className='mb-6 mt-auto flex flex-row gap-4 px-5'>
            {[
              {
                title: 'Create new',
                handler: () => {},
                icon: (
                  <UiIcon
                    libIcon='Ionicons'
                    name='create-outline'
                    className='text-foreground'
                    size={48}
                  />
                ),
              },
              {
                title: 'Import',
                handler: () => {},
                icon: (
                  <UiIcon
                    libIcon='MaterialCommunityIcons'
                    name='import'
                    className='text-foreground'
                    size={48}
                  />
                ),
              },
            ].map((el, idx) => (
              <TouchableOpacity
                key={idx}
                className='flex flex-1 items-center gap-2 rounded-[30] border-2 border-border p-4 py-12 font-semibold'
                onPress={el.handler}
              >
                {el.icon}
                <UiText className='typography-subtitle2 text-foreground'>{el.title}</UiText>
              </TouchableOpacity>
            ))}
          </View>
        </BottomSheetView>
      </UiBottomSheet>
    </View>
  )
}
