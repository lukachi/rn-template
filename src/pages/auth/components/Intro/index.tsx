import { BottomSheetView } from '@gorhom/bottom-sheet'
import { useNavigation } from '@react-navigation/native'
import { useCallback, useMemo, useRef } from 'react'
import { Dimensions, Text, View } from 'react-native'
import type { ICarouselInstance } from 'react-native-reanimated-carousel'
import Carousel from 'react-native-reanimated-carousel'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { translate } from '@/core'
import { sleep } from '@/helpers'
import { cn, useAppTheme } from '@/theme'
import {
  UiBottomSheet,
  UiButton,
  UiHorizontalDivider,
  UiIcon,
  UiScreenScrollable,
  useUiBottomSheet,
} from '@/ui'
import { BottomSheetHeader } from '@/ui/UiBottomSheet'

import { StepLayout } from './components'

const screenWidth = Dimensions.get('window').width

export default function Intro() {
  const insets = useSafeAreaInsets()

  const { palette } = useAppTheme()

  const ref = useRef<ICarouselInstance>(null)

  const bottomSheet = useUiBottomSheet()

  const navigation = useNavigation()

  const steps = useMemo(() => {
    return [
      {
        title: translate('auth.intro.step-1.title'),
        subtitle: translate('auth.intro.step-1.subtitle'),
        media: <UiIcon customIcon='starFillIcon' className='size-[150px] text-textSecondary' />,
      },
      {
        title: translate('auth.intro.step-2.title'),
        subtitle: translate('auth.intro.step-2.subtitle'),
        media: <UiIcon customIcon='sealCheckIcon' className='size-[150px] text-textSecondary' />,
      },
      {
        title: translate('auth.intro.step-3.title'),
        subtitle: translate('auth.intro.step-3.subtitle'),
        media: (
          <UiIcon customIcon='suitcaseSimpleFillIcon' className='size-[150px] text-textSecondary' />
        ),
      },
      {
        title: translate('auth.intro.step-4.title'),
        subtitle: translate('auth.intro.step-4.subtitle'),
        media: <UiIcon customIcon='sunIcon' className='size-[150px] text-textSecondary' />,
      },
    ]
  }, [])

  const handleCreatePK = useCallback(async () => {
    bottomSheet.dismiss()
    await sleep(500) // time for animation finish
    navigation.navigate('Auth', {
      screen: 'CreateWallet',
    })
  }, [bottomSheet, navigation])

  const handleImportPK = useCallback(async () => {
    bottomSheet.dismiss()
    await sleep(500) // time for animation finish
    navigation.navigate('Auth', {
      screen: 'CreateWallet',
      params: {
        isImporting: true,
      },
    })
  }, [bottomSheet, navigation])

  return (
    <UiScreenScrollable style={{ paddingBottom: insets.bottom, paddingTop: insets.top }}>
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

      <View className='flex flex-col px-5'>
        <UiButton
          className={cn('w-full')}
          title={translate('auth.intro.next-btn')}
          onPress={() => {
            bottomSheet.present()
          }}
        />
      </View>

      <UiBottomSheet
        headerComponent={
          <BottomSheetHeader
            title={'Authorization'}
            dismiss={bottomSheet.dismiss}
            className={'px-5 text-center'}
          />
        }
        ref={bottomSheet.ref}
        enableDynamicSizing={true}
        backgroundStyle={{
          backgroundColor: palette.backgroundContainer,
        }}
      >
        <BottomSheetView style={{ paddingBottom: insets.bottom }}>
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
    </UiScreenScrollable>
  )
}
