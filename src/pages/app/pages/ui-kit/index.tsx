import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useNavigation } from '@react-navigation/native'
import type { ReactNode } from 'react'
import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { AppStackScreenProps, UiKitTabParamList } from '@/route-types'
import { authStore, localAuthStore } from '@/store'
import { cn, useAppTheme } from '@/theme'
import { UiBottomSheet, UiButton, UiIcon, useUiBottomSheet } from '@/ui'

import ColorsScreen from './pages/colors'
import CommonScreen from './pages/common'
import TypographyScreen from './pages/typography'

const Tab = createBottomTabNavigator<UiKitTabParamList>()

export default function UiKitRoot({}: AppStackScreenProps<'UiKit'>) {
  return (
    <View className='flex-1'>
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName={'Common'}
          tabBar={props => <CustomTapBar {...props} />}
        >
          <Tab.Screen
            name={'Common'}
            component={CommonScreen}
            options={{
              tabBarLabel: ({ color }) => {
                return (
                  <View className='flex flex-row items-center gap-2'>
                    {/*<Text className='text-baseWhite'>{children}</Text>*/}
                    <UiIcon componentName='arrowRightIcon' color={color} />
                  </View>
                )
              },
            }}
          />
          <Tab.Screen
            name={'Typography'}
            component={TypographyScreen}
            options={{
              tabBarLabel: ({ color }) => {
                return <UiIcon componentName='warningIcon' color={color} />
              },
            }}
          />
          <Tab.Screen
            name={'Colors'}
            component={ColorsScreen}
            options={{
              tabBarLabel: ({ color }) => {
                return <UiIcon componentName='slidersHorizontalIcon' color={color} />
              },
            }}
          />
        </Tab.Navigator>
      </View>
    </View>
  )
}

function CustomTapBar(props: BottomTabBarProps) {
  const logout = authStore.useAuthStore(state => state.logout)
  // optional
  const resetLocalAuthStore = localAuthStore.useLocalAuthStore(state => state.resetStore)

  const bottomSheet = useUiBottomSheet()

  const insets = useSafeAreaInsets()

  const navigation = useNavigation()

  const { palette } = useAppTheme()

  return (
    <View
      style={{
        paddingBottom: insets.bottom,
      }}
      className='rounded-tl-xl rounded-tr-xl bg-componentPrimary px-2 pt-4'
    >
      <ScrollView horizontal={true}>
        <View className='flex flex-row items-center justify-between gap-4'>
          {props.state.routes.map((el, index) => {
            const { options } = props.descriptors[el.key]
            const label = options.tabBarLabel || options.title || el.name

            const isFocused = props.state.index === index

            const onPress = () => {
              const event = props.navigation.emit({
                type: 'tabPress',
                target: el.key,
                canPreventDefault: true,
              })

              if (!isFocused && !event.defaultPrevented) {
                props.navigation.navigate(el.name, el.params)
              }
            }

            const onLongPress = () => {
              props.navigation.emit({
                type: 'tabLongPress',
                target: el.key,
              })
            }

            const btnContent = (): string | ReactNode => {
              if (typeof label !== 'string') {
                return label({
                  focused: isFocused,
                  color: isFocused ? palette.primaryDark : palette.primaryLight,
                  position: 'beside-icon',
                  children: el.name,
                })
              }

              return label
            }

            return (
              <UiButton
                key={index}
                onPress={onPress}
                onLongPress={onLongPress}
                color={isFocused ? 'success' : 'primary'}
                size={'small'}
              >
                {btnContent()}
              </UiButton>
            )
          })}

          <UiButton
            leadingIcon='userIcon'
            size='small'
            onPress={() => {
              bottomSheet.present()
            }}
          />
        </View>
      </ScrollView>

      <UiBottomSheet title='Bottom Sheet title' ref={bottomSheet.ref}>
        <View className={cn('flex-1 gap-4 px-4')}>
          <UiButton
            title='fetching'
            onPress={() => {
              navigation.navigate('App', {
                screen: 'Fetching',
              })
              bottomSheet.dismiss()
            }}
          />
          <UiButton
            title='localization'
            onPress={() => {
              navigation.navigate('App', {
                screen: 'Localization',
              })
              bottomSheet.dismiss()
            }}
          />
          <UiButton
            title='logout'
            color='error'
            onPress={() => {
              logout()
              resetLocalAuthStore()
              bottomSheet.dismiss()
            }}
          />
        </View>
      </UiBottomSheet>
    </View>
  )
}
