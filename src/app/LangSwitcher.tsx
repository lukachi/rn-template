import { Button, Text, View } from 'react-native'

import { useSelectedLanguage } from '@/core'
import type { Language } from '@/core/localization/resources'
import { resources } from '@/core/localization/resources'
import { cn } from '@/theme'

export default function LangSwitcher() {
  const { language, setLanguage } = useSelectedLanguage()

  return (
    <View className={cn('flex flex-col items-center gap-4')}>
      <Text>current lang: {language}</Text>

      <View className={cn('flex flex-row gap-2')}>
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
