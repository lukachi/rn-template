import { ScrollView, Text, View } from 'react-native'

import { cn } from '@/theme'

export default function TypographyScreen() {
  return (
    <ScrollView>
      <View className='flex flex-col gap-6 typography-h1'>
        {[
          'typography-h1',
          'typography-h2',
          'typography-h3',
          'typography-h4',
          'typography-h5',
          'typography-h6',
          'typography-subtitle1',
          'typography-subtitle2',
          'typography-subtitle3',
          'typography-subtitle4',
          'typography-subtitle5',
          'typography-body1',
          'typography-body2',
          'typography-body3',
          'typography-body4',
          'typography-buttonLarge',
          'typography-buttonMedium',
          'typography-buttonSmall',
          'typography-caption1',
          'typography-caption2',
          'typography-caption3',
          'typography-overline1',
          'typography-overline2',
          'typography-overline3',
        ].map(key => (
          <View key={key}>
            <Text className={cn(key, 'typography-h1')}>This is a {key} text</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
