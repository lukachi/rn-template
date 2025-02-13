import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useState } from 'react'
import { Dimensions, Pressable, Text, View } from 'react-native'
import Animated, { useSharedValue } from 'react-native-reanimated'
import Carousel from 'react-native-reanimated-carousel'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import AppContainer from '@/pages/app/components/AppContainer'
import type { AppTabScreenProps } from '@/route-types'
import { useAppPaddings, useAppTheme } from '@/theme'
import { UiScreenScrollable } from '@/ui'

import { parallaxLayout } from './helpers/parallax'

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

const defaultDataWith6Colors = ['#B0604D', '#899F9C', '#B3C680', '#5C6265', '#F5D399', '#F1F1F1']

// eslint-disable-next-line no-empty-pattern
export default function HomeScreen({}: AppTabScreenProps<'Home'>) {
  const { palette } = useAppTheme()

  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()
  const bottomBarHeight = useBottomTabBarHeight()

  const progress = useSharedValue<number>(0)
  const [containerHeight, setContainerHeight] = useState(0)

  return (
    <AppContainer
      style={{
        backgroundColor: 'red',
      }}
    >
      <UiScreenScrollable
        style={{
          backgroundColor: 'green',
          paddingBottom: bottomBarHeight,
        }}
        className='gap-3'
      >
        <View
          className='flex flex-1 bg-blue-700'
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
            <Text className={'text-textPrimary'}>Hi Stranger</Text>

            <Pressable className={'size-10 rounded-full bg-backgroundContainer'}>
              <View></View>
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
                renderItem={({ index }) => {
                  return (
                    <Animated.View
                      style={{
                        width: '100%',
                        height: '95%',
                        backgroundColor: defaultDataWith6Colors[index],
                        borderRadius: 32,
                      }}
                    ></Animated.View>
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
                scrollAnimationDuration={1200}
              />
            )}
          </View>
        </View>
      </UiScreenScrollable>
    </AppContainer>
  )
}
