import { BottomSheetView } from '@gorhom/bottom-sheet'
import { useNavigation } from '@react-navigation/native'
import { useCallback, useMemo, useRef } from 'react'
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

  const navigation = useNavigation()

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

  const handleCreatePK = useCallback(() => {
    bottomSheet.dismiss()
    navigation.navigate('Auth', {
      screen: 'CreateWallet',
    })
  }, [bottomSheet, navigation])

  const handleImportPK = useCallback(() => {
    bottomSheet.dismiss()
    navigation.navigate('Auth', {
      screen: 'CreateWallet',
      params: {
        isImporting: true,
      },
    })
  }, [bottomSheet, navigation])

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
          loop={false}
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

      <View className='p-5'>
        <UiHorizontalDivider />
      </View>

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
        <BottomSheetView
          style={{ paddingBottom: insets.bottom }}
          className='bg-backgroundContainer'
        >
          <View className={cn('py-0, flex flex-col items-center gap-4 p-5')}>
            <UiHorizontalDivider />

            <Text className='text-textSecondary typography-body2'>Choose a preferred method</Text>

            <View className='mt-auto flex w-full flex-col gap-2'>
              <UiButton size='large' title='Create a new profile' onPress={handleCreatePK} />
              <UiButton size='large' title='Re-activate old profile' onPress={handleImportPK} />
            </View>
          </View>
        </BottomSheetView>
      </UiBottomSheet>
    </View>
  )
}
