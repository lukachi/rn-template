import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StackActions, useNavigation } from '@react-navigation/native'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AppRouterNames } from '@/route-names'
import { authStore, localAuthStore } from '@/store'
import { useUiBottomSheet } from '@/ui'
import { UiBottomSheet, UiButton } from '@/ui'

import ColorsScreen from './pages/colors'
import CommonScreen from './pages/common'
import TypographyScreen from './pages/typography'
import ZKPScreen from './pages/zkp'

const Tab = createBottomTabNavigator()

export default function UiKitRoot() {
  return (
    <View className='flex-1'>
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName={AppRouterNames.App.UiKit.Common}
          tabBar={props => <CustomTapBar {...props} />}
        >
          <Tab.Screen name={AppRouterNames.App.UiKit.Common} component={CommonScreen} />
          <Tab.Screen name={AppRouterNames.App.UiKit.Zkp} component={ZKPScreen} />
          <Tab.Screen name={AppRouterNames.App.UiKit.Typography} component={TypographyScreen} />
          <Tab.Screen name={AppRouterNames.App.UiKit.Colors} component={ColorsScreen} />
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

  return (
    <View
      style={{
        paddingBottom: insets.bottom,
      }}
      className='flex flex-row items-center justify-between gap-4 overflow-x-auto rounded-tl-xl rounded-tr-xl bg-componentPrimary px-2'
    >
      {props.state.routes.map((el, index) => {
        const { options } = props.descriptors[el.key]
        const label =
          options.tabBarLabel !== undefined && typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : el.name

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

        return (
          <UiButton
            key={index}
            title={label ?? el.name}
            onPress={onPress}
            onLongPress={onLongPress}
            color={isFocused ? 'success' : 'primary'}
            size={'small'}
          />
        )
      })}

      <UiButton
        leadingIcon='userIcon'
        size='small'
        onPress={() => {
          bottomSheet.present()
        }}
      />

      <UiBottomSheet title='Bottom Sheet title' ref={bottomSheet.ref}>
        <View
          // FIXME: nativeWind not works here
          style={{
            flex: 1,
            gap: 4,
            paddingHorizontal: 4,
          }}
        >
          <UiButton
            title='fetching'
            onPress={() => {
              navigation.dispatch(StackActions.push(AppRouterNames.App.Fetching))
              bottomSheet.dismiss()
            }}
          />
          <UiButton
            title='localization'
            onPress={() => {
              navigation.dispatch(StackActions.push(AppRouterNames.App.Localization))
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
