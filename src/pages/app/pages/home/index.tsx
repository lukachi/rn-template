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

import { bus, DefaultBusEvents } from '@/core'
import { UiButton } from '@/ui/UiButton'
import { UiCard, UiCardContent } from '@/ui/UiCard'
import {
  UiDialog,
  UiDialogClose,
  UiDialogContent,
  UiDialogDescription,
  UiDialogFooter,
  UiDialogHeader,
  UiDialogTitle,
  UiDialogTrigger,
} from '@/ui/UiDialog'
import UiIcon from '@/ui/UiIcon'
import { UiInput } from '@/ui/UiInput'
import { UiLabel } from '@/ui/UiLabel'
import UiScreenScrollable from '@/ui/UiScreenScrollable'
import { UiSeparator } from '@/ui/UiSeparator'
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

            <TouchableOpacity className='relative flex size-10 items-center justify-center rounded-full bg-muted'>
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
                        <UiCard className='flex size-full justify-center gap-6 p-6'>
                          <UiCardContent>
                            <UiDialog>
                              <UiDialogTrigger asChild>
                                <UiButton variant='outline'>
                                  <UiText>Open Dialog</UiText>
                                </UiButton>
                              </UiDialogTrigger>
                              <UiDialogContent className='sm:max-w-[425px]'>
                                <UiDialogHeader>
                                  <UiDialogTitle>Edit profile</UiDialogTitle>
                                  <UiDialogDescription>
                                    Make changes to your profile here. Click save when you&apos;re
                                    done.
                                  </UiDialogDescription>
                                </UiDialogHeader>
                                <View className='grid gap-4'>
                                  <View className='grid gap-3'>
                                    <UiLabel htmlFor='name-1'>Name</UiLabel>
                                    <UiInput id='name-1' defaultValue='Pedro Duarte' />
                                  </View>
                                  <View className='grid gap-3'>
                                    <UiLabel htmlFor='username-1'>Username</UiLabel>
                                    <UiInput id='username-1' defaultValue='@peduarte' />
                                  </View>
                                </View>
                                <UiDialogFooter>
                                  <UiDialogClose asChild>
                                    <UiButton variant='outline'>
                                      <UiText>Cancel</UiText>
                                    </UiButton>
                                  </UiDialogClose>
                                  <UiButton>
                                    <UiText>Save changes</UiText>
                                  </UiButton>
                                </UiDialogFooter>
                              </UiDialogContent>
                            </UiDialog>
                            <UiSeparator className='my-5' />
                            <UiInput placeholder='yopta' />
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
                              bus.emit(DefaultBusEvents.error, {
                                message: 'lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                              })
                            }}
                          >
                            <UiText>Error</UiText>
                          </UiButton>
                          <UiButton
                            variant='outline'
                            onPress={() => {
                              bus.emit(DefaultBusEvents.success, {
                                message: 'lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                              })
                            }}
                          >
                            <UiText>success</UiText>
                          </UiButton>
                          <UiButton
                            variant='ghost'
                            onPress={() => {
                              bus.emit(DefaultBusEvents.warning, {
                                message: 'lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                              })
                            }}
                          >
                            <UiText>warning</UiText>
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
