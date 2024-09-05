import { BottomSheetView } from '@gorhom/bottom-sheet'
import { useNavigation } from '@react-navigation/native'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { cn, useAppTheme } from '@/theme'
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

export default function HomeWithoutDocs() {
  const { palette } = useAppTheme()

  const aboutAppBottomSheet = useUiBottomSheet()
  const startScanBottomSheet = useUiBottomSheet()

  const insets = useSafeAreaInsets()

  const navigation = useNavigation()

  return (
    <UiScreenScrollable className={'gap-3'}>
      <UiCard>
        <UiIcon componentName={'starFillIcon'} className={'m-auto mb-5 size-[110]'} />
        <View className={'flex flex-col gap-2'}>
          <Text className={'text-center text-textPrimary typography-h6'}>Join Rewards Program</Text>
          <Text className={'text-center text-textPrimary typography-body2'}>
            Check your eligibility
          </Text>
        </View>

        <UiHorizontalDivider className={'my-5'} />

        <UiButton
          className={'w-full'}
          size={'large'}
          title={"Let's start"}
          trailingIcon={'arrowRightIcon'}
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
        title={'The App'}
        subtitle={'Learn more about the app'}
        leadingContent={
          <UiIcon componentName={'infoIcon'} className={'size-[40] text-primaryMain'} />
        }
        trailingContent={
          <UiIcon componentName={'arrowRightIcon'} className={'size-[24] text-textPrimary'} />
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
            <UiIcon componentName={'infoIcon'} className={'size-[80] text-primaryMain'} />

            <Text className='text-textPrimary typography-h5'>About the App</Text>

            <UiHorizontalDivider className={'my-4'} />

            <Text className='text-textSecondary typography-body2'>
              This is a sample app built using the following technologies: This is a sample app
              built using the following technologies: This is a sample app built using the following
              technologies:
            </Text>
            <Text className='text-textSecondary typography-body2'>
              This is a sample app built using the following technologies: This is a sample app
              built using the following technologies: This is a sample app built using the following
              technologies:
            </Text>
            <Text className='text-textSecondary typography-body2'>
              This is a sample app built using the following technologies: This is a sample app
              built using the following technologies: This is a sample app built using the following
              technologies:
            </Text>

            <UiButton
              className={'mt-auto w-full'}
              title={'Okay'}
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
            <UiIcon componentName={'infoIcon'} className={'size-[80] text-primaryMain'} />

            <Text className='text-textPrimary typography-h5'>Start scan</Text>

            <UiHorizontalDivider className={'my-4'} />

            <Text className='text-textSecondary typography-body2'>
              This is a sample app built using the following technologies: This is a sample app
              built using the following technologies: This is a sample app built using the following
              technologies:
            </Text>
            <Text className='text-textSecondary typography-body2'>
              This is a sample app built using the following technologies: This is a sample app
              built using the following technologies: This is a sample app built using the following
              technologies:
            </Text>
            <Text className='text-textSecondary typography-body2'>
              This is a sample app built using the following technologies: This is a sample app
              built using the following technologies: This is a sample app built using the following
              technologies:
            </Text>

            <UiButton
              className={'mt-auto w-full'}
              title={'Okay'}
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
  )
}
