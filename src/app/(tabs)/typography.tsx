import { useTheme } from '@react-navigation/native'
import { ScrollView, Text, View } from 'react-native'

import { typography } from '@/theme'

export default function TypographyScreen() {
  const theme = useTheme()

  return (
    <ScrollView>
      <View
        style={{
          gap: 24,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {Object.entries(typography).map(([key, value]) => (
          <View key={key}>
            <Text
              {...value}
              style={{
                color: theme.colors.text,
              }}
            >
              This is a {key} text
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
