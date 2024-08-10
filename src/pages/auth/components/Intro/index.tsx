import { BottomSheetView } from '@gorhom/bottom-sheet'
import { useMemo, useRef } from 'react'
import { Dimensions, Text, View } from 'react-native'
import type { ICarouselInstance } from 'react-native-reanimated-carousel'
import Carousel from 'react-native-reanimated-carousel'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { translate } from '@/core'
import { cn } from '@/theme'
import { UiBottomSheet, UiButton, UiHorizontalDivider, UiIcon, useUiBottomSheet } from '@/ui'

import { StepLayout } from './components'

const screenWidth = Dimensions.get('window').width

export default function Intro() {
  const insets = useSafeAreaInsets()

  const ref = useRef<ICarouselInstance>(null)

  const bottomSheet = useUiBottomSheet()

  const steps = useMemo(() => {
    return [
      {
        title: translate('auth.intro.step-1.title'),
        subtitle: translate('auth.intro.step-1.subtitle'),
        media: <UiIcon componentName='starFillIcon' className='size-[150px] text-textSecondary' />,
      },
      {
        title: translate('auth.intro.step-2.title'),
        subtitle: translate('auth.intro.step-2.subtitle'),
        media: <UiIcon componentName='sealCheckIcon' className='size-[150px] text-textSecondary' />,
      },
      {
        title: translate('auth.intro.step-3.title'),
        subtitle: translate('auth.intro.step-3.subtitle'),
        media: (
          <UiIcon
            componentName='suitcaseSimpleFillIcon'
            className='size-[150px] text-textSecondary'
          />
        ),
      },
      {
        title: translate('auth.intro.step-4.title'),
        subtitle: translate('auth.intro.step-4.subtitle'),
        media: <UiIcon componentName='sunIcon' className='size-[150px] text-textSecondary' />,
      },
    ]
  }, [])

  return (
    <View
      style={{
        paddingTop: insets.top,
      }}
      className={cn('flex-1')}
    >
      <View className='flex flex-1 flex-col justify-center'>
        <Carousel
          ref={ref}
          width={screenWidth}
          data={steps}
          autoPlay={true}
          autoPlayInterval={5_000}
          style={{
            flex: 1,
          }}
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

      <UiHorizontalDivider className='m-5' />

      <View style={{ paddingBottom: insets.bottom }} className='flex flex-col px-5'>
        <UiButton
          className={cn('w-full')}
          title={translate('auth.intro.next-btn')}
          onPress={() => {
            bottomSheet.present()
          }}
        />
      </View>

      <UiBottomSheet title='Authorization' ref={bottomSheet.ref} enableDynamicSizing={true}>
        <BottomSheetView style={{ paddingBottom: insets.bottom }}>
          <View className={cn('flex flex-col items-center gap-4 p-5 py-0')}>
            <UiHorizontalDivider />

            <Text className='text-textSecondary typography-body2'>Choose a preferred method</Text>

            <View className='mt-auto flex w-full flex-col gap-2'>
              <UiButton size='large' title='Create a new profile' />
              <UiButton size='large' title='Re-activate old profile' />
            </View>
          </View>
        </BottomSheetView>
      </UiBottomSheet>
    </View>
  )
}
