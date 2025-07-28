import { useState } from 'react'
import { Dimensions, Pressable, Text, View } from 'react-native'
import Animated, { Extrapolation, interpolate, useSharedValue } from 'react-native-reanimated'
import Carousel, { Pagination } from 'react-native-reanimated-carousel'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import AppContainer from '@/pages/app/components/AppContainer'
import type { AppTabScreenProps } from '@/route-types'
import { useAppPaddings, useAppTheme } from '@/theme'
import {
  UiButton,
  UiCard,
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
import { useTranslation } from 'react-i18next'

import { bus, DefaultBusEvents } from '@/core'
import UiSkeleton from '@/ui/UiSkeleton'

// eslint-disable-next-line no-empty-pattern
export default function HomeScreen({}: AppTabScreenProps<'Home'>) {
  const { palette } = useAppTheme()

  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()

  const progress = useSharedValue<number>(0)
  const [containerHeight, setContainerHeight] = useState(0)

  const { t } = useTranslation()

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
            <Text className='typography-h5 !font-normal text-textPrimary'>
              {t('home-screen.welcome-title')}
            </Text>

            <Pressable className='relative flex size-10 items-center justify-center rounded-full bg-backgroundContainer'>
              <UiIcon libIcon='FontAwesome' name='user-o' size={16} className='text-textPrimary' />
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
                      style={{
                        width: '100%',
                        height: '90%',
                        borderRadius: 32,
                        overflow: 'hidden',
                      }}
                    >
                      {[
                        <UiCard className='flex size-full justify-center gap-6 bg-backgroundContainer p-6'>
                          <UiTextField label='Input 1' />
                          <UiTextField label='Input 2' errorMessage='test error' />
                          <UiTextField label='Input 3 (disabled)' disabled />
                          <UiTextField label='Input 4 (readonly)' readOnly />
                        </UiCard>,
                        <UiCard className='flex size-full justify-center gap-6 bg-backgroundContainer p-6'>
                          <UiSwitcher label='Switcher 1' />
                          <UiHorizontalDivider />
                          <UiSwitcher label='Switcher 2' errorMessage='test error' />
                          <UiHorizontalDivider />
                          <UiSwitcher label='Switcher 3 (disabled)' disabled />
                        </UiCard>,
                        <UiCard className='flex size-full justify-center gap-6 bg-backgroundContainer p-6'>
                          <UiSkeleton className='size-20 rounded-full bg-red-50' />
                          <UiSkeleton className='size-10 w-[300] rounded-full bg-red-50' />
                          <UiSkeleton className='size-10 w-[200] rounded-full bg-red-50' />
                          <UiSkeleton className='size-10 w-[100] rounded-full bg-red-50' />
                        </UiCard>,
                        <UiCard className='flex size-full flex-row flex-wrap items-center justify-center gap-6 bg-backgroundContainer p-6'>
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
                        </UiCard>,
                        <UiCard className='flex size-full justify-center gap-6 bg-backgroundContainer p-6'>
                          <UiButton title='filled' />
                          <UiButton title='outline' variant='outlined' />
                          <UiButton title='text' variant='text' />
                        </UiCard>,
                        <UiCard className='flex size-full justify-center gap-6 bg-backgroundContainer p-6'>
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
                        </UiCard>,
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
