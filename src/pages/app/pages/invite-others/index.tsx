import { useNavigation } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import * as Sharing from 'expo-sharing'
import { Pressable, Text, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ErrorHandler } from '@/core'
import { AppStackScreenProps } from '@/route-types'
import { useAppPaddings } from '@/theme'
import { UiIcon, UiImage, UiScreenScrollable } from '@/ui'

export default function InviteOthers({ route }: AppStackScreenProps<'InviteOthers'>) {
  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()

  const navigation = useNavigation()

  const shareInvite = async (uri: string) => {
    Haptics.selectionAsync()
    if (!(await Sharing.isAvailableAsync())) {
      ErrorHandler.process('Device not support sharing') // TODO: localization
      return
    }

    try {
      await Sharing.shareAsync(uri)
    } catch (error) {
      ErrorHandler.process(error)
    }
  }

  return (
    <Animated.View
      sharedTransitionTag={route.params?.tag}
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <LinearGradient
        colors={['#CBE7EC', '#F2F8EE']}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      />

      <UiScreenScrollable className='gap-3' style={{ paddingBottom: insets.bottom }}>
        <View
          className='flex flex-1'
          style={{
            paddingTop: insets.top,
          }}
        >
          <View
            style={{
              position: 'relative',
              paddingLeft: appPaddings.left,
              paddingRight: appPaddings.right,
            }}
          >
            <Text className='typography-h4 text-textPrimary'>Invite</Text>
            <Text className='typography-h3 text-textSecondary'>Others</Text>

            <Pressable
              className='absolute size-10 rounded-full bg-componentPrimary'
              style={{
                top: 0,
                right: appPaddings.right,
              }}
              onPress={() => {
                navigation.goBack()
              }}
            >
              <UiIcon
                libIcon='MaterialCommunityIcons'
                name='close'
                size={20}
                className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-textPrimary'
              />
            </Pressable>
          </View>

          <View className='my-12'>
            <UiImage
              source={require('@assets/images/bg-invite-others-screen.png')}
              style={{
                width: '100%',
                height: 150,
              }}
            />
          </View>

          <View
            className='flex-1'
            style={{
              paddingLeft: appPaddings.left,
              paddingRight: appPaddings.right,
            }}
          >
            <Text className='typography-subtitle3 text-textPrimary'>Invited 4/5</Text>

            <View className='mt-5 flex flex-1 gap-2'>
              {['', '', '', '', ''].map((el, idx) => (
                <View
                  key={idx}
                  className='flex flex-row items-center justify-between rounded-[12] bg-componentPrimary px-4 py-3'
                >
                  <View className='flex gap-1'>
                    <Text className='typography-subtitle4 text-textPrimary'>14925-1592</Text>
                    <Text className='typography-body3 text-textSecondary'>
                      Rarime.app/QrisPfszkps
                    </Text>
                    <Text className='typography-body4 text-textPrimary'>Active</Text>
                  </View>

                  <Pressable className='size-8' onPress={() => shareInvite('')}>
                    <UiIcon libIcon='AntDesign' name='sharealt' size={24} />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        </View>
      </UiScreenScrollable>
    </Animated.View>
  )
}
