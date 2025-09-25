import { useState } from 'react'
import { Dimensions, TouchableOpacity, View } from 'react-native'
import Animated, { Extrapolation, interpolate, useSharedValue } from 'react-native-reanimated'
import Carousel, { Pagination } from 'react-native-reanimated-carousel'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import AppContainer from '@/pages/app/components/AppContainer'
import type { AppTabScreenProps } from '@/route-types'
import { useAppPaddings, useAppTheme } from '@/theme'

import { parallaxLayout } from './helpers/parallax'

const screenWidth = Dimensions.get('window').width

const defaultDataWith6Colors = ['#899F9C', '#B0604D', '#B3C680', '#5C6265', '#F5D399', '#F1F1F1']

import * as Haptics from 'expo-haptics'
import { useTranslation } from 'react-i18next'

import { emitter } from '@/core'
import { UiButton } from '@/ui/UiButton'
import { UiCard, UiCardContent } from '@/ui/UiCard'
import UiIcon from '@/ui/UiIcon'
import UiImage from '@/ui/UiImage'
import { UiLabel } from '@/ui/UiLabel'
import UiScreenScrollable from '@/ui/UiScreenScrollable'
import { UiSkeleton } from '@/ui/UiSkeleton'
import { UiSwitch } from '@/ui/UiSwitch'
import { UiText } from '@/ui/UiText'

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
            <UiText variant='h4' className='text-foreground'>
              {t('home-screen.welcome-title')}
            </UiText>

            <TouchableOpacity className='bg-muted relative flex size-10 items-center justify-center rounded-full'>
              <UiIcon libIcon='FontAwesome' name='user-o' size={16} className='text-foreground' />
            </TouchableOpacity>
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
                      }}
                    >
                      {[
                        <UiCard className='bg-primary relative flex size-full gap-6 overflow-hidden p-0'>
                          <View className='absolute-center size-[300] animate-pulse bg-red-300'>
                            <UiImage
                              className='size-[300]'
                              source={require('@assets/images/home-img-1.jpg')}
                            />
                          </View>
                          <UiCardContent className='p-6'>
                            <UiText variant='display-large' className='text-center'>
                              React Native boilerplate
                            </UiText>

                            <UiText variant='body-large' className='mt-5 text-center'>
                              Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum tempore
                              mollitia voluptatem ex iusto, impedit sed fuga esse explicabo, minus,
                              recusandae laudantium dolorem! Sed odio autem blanditiis illum ut
                              tempore.
                            </UiText>
                          </UiCardContent>
                        </UiCard>,
                        <UiCard className='flex size-full justify-center gap-6 p-6'>
                          <View className='flex flex-row items-center justify-center gap-2'>
                            <UiLabel>Switcher 1</UiLabel>
                            <UiSwitch
                              checked={false}
                              onCheckedChange={function (): void {
                                throw new Error('Function not implemented.')
                              }}
                            />
                          </View>
                        </UiCard>,
                        <UiCard className='flex size-full justify-center gap-6 p-6'>
                          <UiSkeleton className='size-20 rounded-full bg-red-50' />
                          <UiSkeleton className='size-10 w-[300] rounded-full bg-red-50' />
                          <UiSkeleton className='size-10 w-[200] rounded-full bg-red-50' />
                          <UiSkeleton className='size-10 w-[100] rounded-full bg-red-50' />
                        </UiCard>,
                        <UiCard className='flex size-full flex-row flex-wrap items-center justify-center gap-6 p-6'>
                          <UiIcon
                            size={40}
                            customIcon='calendarBlankIcon'
                            className='text-foreground'
                          />
                          <UiIcon
                            size={40}
                            customIcon='arrowDownIcon'
                            className='text-foreground'
                          />
                          <UiIcon
                            size={40}
                            customIcon='cardholderFillIcon'
                            className='text-foreground'
                          />
                          <UiIcon
                            size={40}
                            libIcon='Entypo'
                            name='facebook'
                            className='text-foreground'
                          />
                          <UiIcon
                            size={40}
                            libIcon='Ionicons'
                            name='logo-html5'
                            className='text-foreground'
                          />
                        </UiCard>,
                        <UiCard className='flex size-full justify-center gap-6 p-6'>
                          <UiButton>
                            <UiText>Filled</UiText>
                          </UiButton>
                          <UiButton variant='outline'>
                            <UiText>outline</UiText>
                          </UiButton>
                          <UiButton variant='ghost'>
                            <UiText>text</UiText>
                          </UiButton>
                        </UiCard>,
                        <UiCard className='flex size-full justify-center gap-6 p-6'>
                          <UiButton
                            onPress={() => {
                              emitter.emit('error', {
                                title: 'some title',
                                message: 'lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                              })
                            }}
                          >
                            <UiText>Error</UiText>
                          </UiButton>
                          <UiButton
                            variant='outline'
                            onPress={() => {
                              emitter.emit('success', {
                                message: 'lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                              })
                            }}
                          >
                            <UiText>success</UiText>
                          </UiButton>
                          <UiButton
                            onPress={() => {
                              emitter.emit('warning', {
                                message: 'lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                              })
                            }}
                          >
                            <UiText>warning</UiText>
                          </UiButton>
                          <UiButton
                            onPress={() => {
                              emitter.emit('info', {
                                message: 'lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                              })
                            }}
                          >
                            <UiText>info</UiText>
                          </UiButton>
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
                backgroundColor: palette.card,
              }}
              activeDotStyle={{
                overflow: 'hidden',
                height: 16,
                backgroundColor: palette.foreground,
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
