import { Button, Text, View } from 'react-native'

import { useSelectedLanguage } from '@/core'
import type { Language } from '@/core/localization/resources'
import { resources } from '@/core/localization/resources'

export default function LangSwitcher() {
  const { language, setLanguage } = useSelectedLanguage()

  return (
    <View style={{ gap: 24, alignItems: 'center' }}>
      <Text>current lang: {language}</Text>

      <View style={{ gap: 8 }}>
        {Object.keys(resources).map(el => (
          <Button
            key={el}
            title={el}
            onPress={() => {
              setLanguage(el as Language)
            }}
          />
        ))}
      </View>
    </View>
  )
}
