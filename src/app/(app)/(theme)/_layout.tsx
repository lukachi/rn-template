import { router, Stack } from 'expo-router'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { authStore, localAuthStore } from '@/store'
import { UiBottomSheet, UiButton, useUiBottomSheet } from '@/ui'

// export const unstable_settings = {
//   initialRouteName: 'ui-kit',
// }

export default function ThemeLayout() {
  const logout = authStore.useAuthStore(state => state.logout)
  // optional
  const resetLocalAuthStore = localAuthStore.useLocalAuthStore(state => state.resetStore)

  const bottomSheet = useUiBottomSheet()

  const insets = useSafeAreaInsets()

  return (
    <View className='flex-1'>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name='index'
            options={{
              title: 'ui-kit',
            }}
          />
          <Stack.Screen
            name='zkp'
            options={{
              title: 'zkp',
            }}
          />
          <Stack.Screen
            name='typography'
            options={{
              title: 'typography',
            }}
          />
          <Stack.Screen
            name='colors'
            options={{
              title: 'colors',
            }}
          />
        </Stack>
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
            router.navigate('(app)/(theme)')
          }}
        />
        <UiButton
          leadingIcon='slidersHorizontalIcon'
          onPress={() => {
            router.navigate('/zkp')
          }}
        />
        <UiButton
          leadingIcon='walletFilledIcon'
          onPress={() => {
            router.navigate('/colors')
          }}
        />
        <UiButton
          leadingIcon='xCircleIcon'
          onPress={() => {
            router.navigate('/typography')
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
                router.navigate('/fetching')
                bottomSheet.dismiss()
              }}
            />
            <UiButton
              title='localization'
              onPress={() => {
                router.navigate('/localization')
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
          {/*<UiButton*/}
          {/*  leadingIcon='xCircleIcon'*/}
          {/*  onPress={() => {*/}
          {/*    router.navigate('/typography')*/}
          {/*  }}*/}
          {/*/>*/}
        </UiBottomSheet>
      </View>
    </View>
  )
}
