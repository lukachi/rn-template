import { BottomSheetView } from '@gorhom/bottom-sheet'
import { useNavigation } from '@react-navigation/native'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import AppContainer from '@/pages/app/components/AppContainer'
import { cn, useAppPaddings, useAppTheme, useBottomBarOffset } from '@/theme'
import {
  UiActionCard,
  UiBottomSheet,
  UiButton,
  UiCard,
  UiHorizontalDivider,
  UiIcon,
  UiScreenScrollable,
  useUiBottomSheet,
} from '@/ui'

export default function DocumentsWithoutDocs() {
  const { palette } = useAppTheme()

  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()
  const offset = useBottomBarOffset()

  const aboutAppBottomSheet = useUiBottomSheet()
  const startScanBottomSheet = useUiBottomSheet()

  const navigation = useNavigation()

  return (
    <AppContainer>
      <UiScreenScrollable
        style={{
          paddingTop: insets.top,
          paddingLeft: appPaddings.left,
          paddingRight: appPaddings.right,
          paddingBottom: offset,
        }}
        className='gap-3'
      >
        <UiCard>
          <UiIcon customIcon='starFillIcon' className='m-auto mb-5 size-[110]' />
          <View className='flex flex-col gap-2'>
            <Text className='typography-h6 text-center text-textPrimary'>Join Rewards Program</Text>
            <Text className='typography-body2 text-center text-textPrimary'>
              Check your eligibility
            </Text>
          </View>

          <UiHorizontalDivider className='my-5' />

          <UiButton
            className='w-full'
            size='large'
            title="Let's start"
            trailingIconProps={{
              customIcon: 'arrowRightIcon',
            }}
            onPress={() => {
              startScanBottomSheet.present()
            }}
          />
        </UiCard>

        <UiActionCard
          pressProps={{
            onPress: () => {
              aboutAppBottomSheet.present()
            },
          }}
          title='The App'
          subtitle='Learn more about the app'
          leadingContent={<UiIcon customIcon='infoIcon' className='size-[40] text-primaryMain' />}
          trailingContent={
            <UiIcon customIcon='arrowRightIcon' className='size-[24] text-textPrimary' />
          }
        />

        <UiBottomSheet
          ref={aboutAppBottomSheet.ref}
          backgroundStyle={{
            backgroundColor: palette.backgroundContainer,
          }}
          enableDynamicSizing={true}
        >
          <BottomSheetView style={{ paddingBottom: insets.bottom }}>
            <View className={cn('py-0, flex flex-col items-center gap-4 p-5')}>
              <UiIcon customIcon='infoIcon' className='size-[80] text-primaryMain' />

              <Text className='typography-h5 text-textPrimary'>About the App</Text>

              <UiHorizontalDivider className='my-4' />

              <Text className='typography-body2 text-textSecondary'>
                This is a sample app built using the following technologies: This is a sample app
                built using the following technologies: This is a sample app built using the
                following technologies:
              </Text>
              <Text className='typography-body2 text-textSecondary'>
                This is a sample app built using the following technologies: This is a sample app
                built using the following technologies: This is a sample app built using the
                following technologies:
              </Text>
              <Text className='typography-body2 text-textSecondary'>
                This is a sample app built using the following technologies: This is a sample app
                built using the following technologies: This is a sample app built using the
                following technologies:
              </Text>

              <UiButton
                className='mt-auto w-full'
                title='Okay'
                onPress={() => {
                  aboutAppBottomSheet.dismiss()
                }}
              />
            </View>
          </BottomSheetView>
        </UiBottomSheet>

        <UiBottomSheet
          ref={startScanBottomSheet.ref}
          backgroundStyle={{
            backgroundColor: palette.backgroundContainer,
          }}
          enableDynamicSizing={true}
        >
          <BottomSheetView style={{ paddingBottom: insets.bottom }}>
            <View className={cn('py-0, flex flex-col items-center gap-4 p-5')}>
              <UiIcon customIcon='infoIcon' className='size-[80] text-primaryMain' />

              <Text className='typography-h5 text-textPrimary'>Start scan</Text>

              <UiHorizontalDivider className='my-4' />

              <Text className='typography-body2 text-textSecondary'>
                This is a sample app built using the following technologies: This is a sample app
                built using the following technologies: This is a sample app built using the
                following technologies:
              </Text>
              <Text className='typography-body2 text-textSecondary'>
                This is a sample app built using the following technologies: This is a sample app
                built using the following technologies: This is a sample app built using the
                following technologies:
              </Text>
              <Text className='typography-body2 text-textSecondary'>
                This is a sample app built using the following technologies: This is a sample app
                built using the following technologies: This is a sample app built using the
                following technologies:
              </Text>

              <UiButton
                className='mt-auto w-full'
                title='Okay'
                onPress={() => {
                  startScanBottomSheet.dismiss()
                  navigation.navigate('App', {
                    screen: 'Scan',
                  })
                }}
              />
            </View>
          </BottomSheetView>
        </UiBottomSheet>
      </UiScreenScrollable>
    </AppContainer>
  )
}
