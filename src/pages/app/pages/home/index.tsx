import { useState } from 'react'
import { Dimensions, Pressable, Text, View } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  SharedTransitionType,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import Carousel, { Pagination } from 'react-native-reanimated-carousel'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import AppContainer from '@/pages/app/components/AppContainer'
import type { AppTabScreenProps } from '@/route-types'
import { useAppPaddings, useAppTheme } from '@/theme'
import {
  UiButton,
  UiHorizontalDivider,
  UiIcon,
  UiScreenScrollable,
  UiSwitcher,
  UiTextField,
} from '@/ui'

import { parallaxLayout } from './helpers/parallax'

const screenWidth = Dimensions.get('window').width

const defaultDataWith6Colors = ['#899F9C', '#B0604D', '#B3C680', '#5C6265', '#F5D399', '#F1F1F1']

import * as Haptics from 'expo-haptics'
import { SharedTransition } from 'react-native-reanimated'

import { bus, DefaultBusEvents } from '@/core'
import UiSkeleton from '@/ui/UiSkeleton'

const transition = SharedTransition.custom(values => {
  'worklet'
  return {
    height: withSpring(values.targetHeight),
    width: withSpring(values.targetWidth),
  }
})
  .progressAnimation((values, progress) => {
    'worklet'
    const getValue = (progress: number, target: number, current: number): number => {
      return progress * (target - current) + current
    }

    return {
      width: getValue(progress, values.targetWidth, values.currentWidth),
      height: getValue(progress, values.targetHeight, values.currentHeight),
    }
  })
  .defaultTransitionType(SharedTransitionType.ANIMATION)

// eslint-disable-next-line no-empty-pattern
export default function HomeScreen({}: AppTabScreenProps<'Home'>) {
  const { palette } = useAppTheme()

  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()

  const progress = useSharedValue<number>(0)
  const [containerHeight, setContainerHeight] = useState(0)

  return (
    <AppContainer>
      <UiScreenScrollable className='gap-3'>
        <View
          className='flex flex-1'
          style={{
            paddingTop: insets.top,
          }}
        >
          <View
            className='flex w-full flex-row items-center justify-between py-5'
            style={{
              paddingLeft: appPaddings.left,
              paddingRight: appPaddings.right,
            }}
          >
            <Text className='typography-h5 !font-normal text-textPrimary'>Hi Stranger</Text>

            <Pressable className='relative size-10 rounded-full bg-backgroundContainer'>
              <UiIcon
                libIcon='FontAwesome'
                name='user-o'
                size={16}
                className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-textPrimary'
              />
            </Pressable>
          </View>
          <View
            id='carousel-component'
            className='flex-1'
            onLayout={e => setContainerHeight(e.nativeEvent.layout.height)}
          >
            {!!containerHeight && (
              <Carousel
                data={defaultDataWith6Colors}
                height={containerHeight}
                loop={false}
                pagingEnabled={true}
                snapEnabled={false}
                vertical={true}
                mode='parallax'
                onProgressChange={progress}
                onScrollStart={() => {
                  Haptics.selectionAsync()
                }}
                renderItem={({ index }) => {
                  return (
                    <Animated.View
                      sharedTransitionTag={`my-tag-${index}`}
                      sharedTransitionStyle={transition}
                      style={{
                        width: '100%',
                        height: '90%',
                        borderRadius: 32,
                        overflow: 'hidden',
                      }}
                    >
                      {[
                        <View className='flex size-full justify-center gap-6 bg-backgroundContainer p-6'>
                          <UiTextField label='Input 1' />
                          <UiTextField label='Input 2' errorMessage='test error' />
                          <UiTextField label='Input 3 (disabled)' disabled />
                          <UiTextField label='Input 4 (readonly)' readOnly />
                        </View>,
                        <View className='flex size-full justify-center gap-6 bg-backgroundContainer p-6'>
                          <UiSwitcher label='Switcher 1' />
                          <UiHorizontalDivider />
                          <UiSwitcher label='Switcher 2' errorMessage='test error' />
                          <UiHorizontalDivider />
                          <UiSwitcher label='Switcher 3 (disabled)' disabled />
                        </View>,
                        <View className='flex size-full justify-center gap-6 bg-backgroundContainer p-6'>
                          <UiSkeleton className='size-20 rounded-full bg-red-50' />
                          <UiSkeleton className='size-10 w-[300] rounded-full bg-red-50' />
                          <UiSkeleton className='size-10 w-[200] rounded-full bg-red-50' />
                          <UiSkeleton className='size-10 w-[100] rounded-full bg-red-50' />
                        </View>,
                        <View className='flex size-full flex-row flex-wrap items-center justify-center gap-6 bg-backgroundContainer p-6'>
                          <UiIcon
                            size={40}
                            customIcon='calendarBlankIcon'
                            className='text-textPrimary'
                          />
                          <UiIcon
                            size={40}
                            customIcon='arrowDownIcon'
                            className='text-textPrimary'
                          />
                          <UiIcon
                            size={40}
                            customIcon='cardholderFillIcon'
                            className='text-textPrimary'
                          />
                          <UiIcon
                            size={40}
                            libIcon='Entypo'
                            name='facebook'
                            className='text-textPrimary'
                          />
                          <UiIcon
                            size={40}
                            libIcon='Ionicons'
                            name='logo-html5'
                            className='text-textPrimary'
                          />
                        </View>,
                        <View className='flex size-full justify-center gap-6 bg-backgroundContainer p-6'>
                          <UiButton title='filled' />
                          <UiButton title='outline' variant='outlined' />
                          <UiButton title='text' variant='text' />
                        </View>,
                        <View className='flex size-full justify-center gap-6 bg-backgroundContainer p-6'>
                          <UiButton
                            title='error'
                            color='error'
                            onPress={() => {
                              bus.emit(DefaultBusEvents.error, {
                                message: 'lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                              })
                            }}
                          />
                          <UiButton
                            title='success'
                            variant='outlined'
                            color='success'
                            onPress={() => {
                              bus.emit(DefaultBusEvents.success, {
                                message: 'lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                              })
                            }}
                          />
                          <UiButton
                            title='warning'
                            variant='text'
                            color='warning'
                            onPress={() => {
                              bus.emit(DefaultBusEvents.warning, {
                                message: 'lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                              })
                            }}
                          />
                        </View>,
                      ][index] ?? (
                        <View
                          className='size-full'
                          style={{ backgroundColor: defaultDataWith6Colors[index] }}
                        ></View>
                      )}
                    </Animated.View>
                  )
                }}
                customAnimation={parallaxLayout(
                  {
                    size: screenWidth,
                    vertical: true,
                  },
                  {
                    parallaxScrollingScale: 0.85,
                    parallaxAdjacentItemScale: 0.7,
                    parallaxScrollingOffset: -140,
                  },
                )}
                scrollAnimationDuration={500}
                withAnimation={{
                  type: 'spring',
                  config: {
                    mass: 0.6,
                    stiffness: 92,
                  },
                }}
              />
            )}

            <Pagination.Custom<{ color: string }>
              progress={progress}
              data={defaultDataWith6Colors.map(color => ({ color }))}
              dotStyle={{
                width: 6,
                height: 6,
                borderRadius: 999,
                backgroundColor: palette.backgroundContainer,
              }}
              activeDotStyle={{
                overflow: 'hidden',
                height: 16,
                backgroundColor: palette.textPrimary,
              }}
              containerStyle={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                gap: 8,
              }}
              horizontal={false}
              customReanimatedStyle={(progress, index, length) => {
                let val = Math.abs(progress - index)
                if (index === 0 && progress > length - 1) {
                  val = Math.abs(progress - length)
                }

                return {
                  transform: [
                    {
                      translateY: interpolate(val, [0, 1], [0, 0], Extrapolation.CLAMP),
                    },
                  ],
                }
              }}
            />
          </View>
        </View>
      </UiScreenScrollable>
    </AppContainer>
  )
}
