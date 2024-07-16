import { ScrollView, Text, View } from 'react-native'

import { colors } from '@/theme/config'
import { cn } from '@/theme/utils'

export default function ColorsScreen() {
  return (
    <ScrollView>
      <View className={cn('flex flex-row flex-wrap items-center justify-center gap-4')}>
        {Object.keys(colors).map(el => (
          <View
            key={el}
            className={cn(
              'flex size-[150px] items-center justify-center rounded-md shadow-md',
              `bg-${el}`,
            )}
          >
            <View className={cn('bg-baseBlack p-4')}>
              <Text className={cn('text-baseWhite text-center')}>{el}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
