import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useNavigation } from '@react-navigation/native'
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
import { UiIcon, UiScreenScrollable } from '@/ui'

import { parallaxLayout } from './helpers/parallax'

const screenWidth = Dimensions.get('window').width

const defaultDataWith6Colors = ['#B0604D', '#899F9C', '#B3C680', '#5C6265', '#F5D399', '#F1F1F1']

import * as Haptics from 'expo-haptics'
import { SharedTransition } from 'react-native-reanimated'

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
  const bottomBarHeight = useBottomTabBarHeight()

  const progress = useSharedValue<number>(0)
  const [containerHeight, setContainerHeight] = useState(0)

  const navigation = useNavigation()

  return (
    <AppContainer>
      <UiScreenScrollable
        style={{
          paddingBottom: bottomBarHeight,
        }}
        className='gap-3'
      >
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
                    <Pressable
                      onPress={() => {
                        navigation.navigate('App', {
                          screen: 'InviteOthers',
                          params: {
                            tag: `my-tag-${index}`,
                          },
                        })
                      }}
                    >
                      <Animated.View
                        sharedTransitionTag={`my-tag-${index}`}
                        sharedTransitionStyle={transition}
                        style={{
                          width: '100%',
                          height: '95%',
                          backgroundColor: defaultDataWith6Colors[index],
                          borderRadius: 32,
                        }}
                      />
                    </Pressable>
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
                    parallaxScrollingOffset: -120,
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
