import { useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { InAppRouteNames } from '@/pages/app/in-app-route-names'
import { authStore, localAuthStore } from '@/store'
import { UiBottomSheet, UiButton, useUiBottomSheet } from '@/ui'

import ColorsScreen from './pages/colors'
import CommonScreen from './pages/common'
import TypographyScreen from './pages/typography'
import ZKPScreen from './pages/zkp'

const Stack = createNativeStackNavigator()

export enum UiKitRouteNames {
  Common = 'common',
  Colors = 'colors',
  Typography = 'typography',
  Zkp = 'zkp',
}

export default function ThemeRoot() {
  const logout = authStore.useAuthStore(state => state.logout)
  // optional
  const resetLocalAuthStore = localAuthStore.useLocalAuthStore(state => state.resetStore)

  const bottomSheet = useUiBottomSheet()

  const insets = useSafeAreaInsets()

  const navigation = useNavigation()

  return (
    <View className='flex-1'>
      <View style={{ flex: 1 }}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name={UiKitRouteNames.Common} component={CommonScreen} />
          <Stack.Screen name={UiKitRouteNames.Zkp} component={ZKPScreen} />
          <Stack.Screen name={UiKitRouteNames.Typography} component={TypographyScreen} />
          <Stack.Screen name={UiKitRouteNames.Colors} component={ColorsScreen} />
        </Stack.Navigator>
      </View>

      <View
        style={{
          paddingBottom: insets.bottom,
        }}
        className='flex flex-row justify-between rounded-tl-xl rounded-tr-xl bg-componentPrimary p-2'
      >
        <UiButton
          leadingIcon='keyIcon'
          onPress={() => {
            navigation.navigate(UiKitRouteNames.Common)
          }}
        />
        <UiButton
          leadingIcon='slidersHorizontalIcon'
          onPress={() => {
            navigation.navigate(UiKitRouteNames.Zkp)
          }}
        />
        <UiButton
          leadingIcon='walletFilledIcon'
          onPress={() => {
            navigation.navigate(UiKitRouteNames.Colors)
          }}
        />
        <UiButton
          leadingIcon='xCircleIcon'
          onPress={() => {
            navigation.navigate(UiKitRouteNames.Typography)
          }}
        />

        <UiButton
          leadingIcon='userIcon'
          onPress={() => {
            bottomSheet.present()
          }}
        />

        <UiBottomSheet title='Bottom Sheet title' ref={bottomSheet.ref}>
          <View className='flex flex-col gap-5 px-5 py-10'>
            <UiButton
              title='fetching'
              onPress={() => {
                navigation.navigate(InAppRouteNames.Fetching)
                bottomSheet.dismiss()
              }}
            />
            <UiButton
              title='localization'
              onPress={() => {
                navigation.navigate(InAppRouteNames.Localization)
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
    </View>
  )
}
