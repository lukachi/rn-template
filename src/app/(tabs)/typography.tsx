import { ScrollView, Text, useTheme, View, YStack } from 'tamagui'

import { typography } from '@/theme'

export default function TypographyScreen() {
  const theme = useTheme()

  return (
    <ScrollView>
      <YStack paddingVertical={24} gap={24} overflow={'scroll'}>
        {Object.entries(typography).map(([key, value]) => (
          <View key={key}>
            <Text {...value} color={theme.textPrimary.val}>
              This is a {key} text
            </Text>
          </View>
        ))}
      </YStack>
    </ScrollView>
  )
}
