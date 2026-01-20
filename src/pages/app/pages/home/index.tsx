import * as Haptics from 'expo-haptics'
import { useState } from 'react'
import { Dimensions, View } from 'react-native'
import Animated, { Extrapolation, interpolate, useSharedValue } from 'react-native-reanimated'
import Carousel, { Pagination } from 'react-native-reanimated-carousel'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCSSVariable } from 'uniwind'

import AppContainer from '@/pages/app/components/AppContainer'
import type { AppTabScreenProps } from '@/pages/app/route-types'
import { useAppPaddings } from '@/theme/utils'
import UiScreenScrollable from '@/ui/UiScreenScrollable'
import { UiText } from '@/ui/UiText'

import { parallaxLayout } from './helpers/parallax'

const screenWidth = Dimensions.get('window').width

const defaultDataWith6Colors = ['#899F9C', '#B0604D', '#B3C680', '#5C6265', '#F5D399', '#F1F1F1']

// eslint-disable-next-line no-empty-pattern
export default function HomeScreen({}: AppTabScreenProps<'Home'>) {
  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()

  const progress = useSharedValue<number>(0)
  const [containerHeight, setContainerHeight] = useState(0)

  const backgroundColor = useCSSVariable('--background')
  const foregroundColor = useCSSVariable('--foreground')

  return (
    <AppContainer
      className='bg-background'
      style={{
        paddingTop: insets.top,
        paddingLeft: appPaddings.left,
        paddingRight: appPaddings.right,
      }}
    >
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
            <UiText className='typography-h5 text-textPrimary'>Welcome Yopta</UiText>
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
                      style={{
                        width: '100%',
                        height: '90%',
                        borderRadius: 32,
                        overflow: 'hidden',
                      }}
                    >
                      {[
                        <View
                          className='size-full'
                          style={{ backgroundColor: defaultDataWith6Colors[index] }}
                        ></View>,
                        <View
                          className='size-full'
                          style={{ backgroundColor: defaultDataWith6Colors[index] }}
                        ></View>,
                        <View
                          className='size-full'
                          style={{ backgroundColor: defaultDataWith6Colors[index] }}
                        ></View>,
                        <View
                          className='size-full'
                          style={{ backgroundColor: defaultDataWith6Colors[index] }}
                        ></View>,
                        <View
                          className='size-full'
                          style={{ backgroundColor: defaultDataWith6Colors[index] }}
                        ></View>,
                        <View
                          className='size-full'
                          style={{ backgroundColor: defaultDataWith6Colors[index] }}
                        ></View>,
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
                backgroundColor: String(backgroundColor),
              }}
              activeDotStyle={{
                overflow: 'hidden',
                height: 16,
                backgroundColor: String(foregroundColor),
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
