import { useTheme } from '@react-navigation/native'
import { ScrollView, Text, View } from 'react-native'

import { allThemes, typography } from '@/theme'

export default function ColorsScreen() {
  const theme = useTheme()

  return (
    <ScrollView>
      <View
        style={{
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {Object.keys(allThemes.light).map(el => (
          <View
            key={el}
            style={{
              width: 120,
              height: 120,
              backgroundColor: theme[el]?.val,
            }}
          >
            <Text
              style={{
                ...typography.body3,
              }}
            >
              {el}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
