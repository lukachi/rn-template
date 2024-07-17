import { Text, View } from 'react-native'
import Toast from 'react-native-toast-message'

import { cn } from '@/theme'

/*
  2. Pass the config as prop to the Toast component instance
*/
export default function Toasts() {
  return (
    <Toast
      config={{
        myCustomToast: ({ props }) => (
          <View className={cn('flex w-[90%] flex-col gap-4 rounded-2xl bg-primaryDark p-4')}>
            <Text className={cn('text-textPrimary typography-h5')}>{props.title}</Text>
            <Text className={cn('text-textPrimary typography-h5')}>{props.subtitle}</Text>
          </View>
        ),
      }}
    />
  )
}
