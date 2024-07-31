import { ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { cn, useAppTheme } from '@/theme/utils'

export default function ColorsScreen() {
  const insets = useSafeAreaInsets()

  const { palette } = useAppTheme()

  return (
    <View style={{ paddingTop: insets.top }} className={cn('flex-1')}>
      <ScrollView>
        <View className={cn('flex flex-row flex-wrap items-center justify-center gap-4')}>
          {Object.keys(palette).map(el => (
            <View
              key={el}
              className={cn(
                'flex size-[150px] items-center justify-center rounded-md shadow-md',
                `bg-${el}`,
              )}
            >
              <View className={cn('bg-baseBlack p-4')}>
                <Text className={cn('text-center text-baseWhite')}>{el}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
