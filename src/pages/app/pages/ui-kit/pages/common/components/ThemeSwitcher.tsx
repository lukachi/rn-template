import { Button, Text, View } from 'react-native'

import { cn, useSelectedTheme } from '@/theme'

export default function ThemeSwitcher() {
  const { selectedTheme, setSelectedTheme } = useSelectedTheme()

  return (
    <View className={cn('flex items-center gap-4')}>
      <Text className={cn('text-textPrimary')}>{selectedTheme}</Text>

      <View className={cn('flex flex-row gap-4')}>
        <Button title='Light' onPress={() => setSelectedTheme('light')} />
        <Button title='Dark' onPress={() => setSelectedTheme('dark')} />
        <Button title='System' onPress={() => setSelectedTheme('system')} />
      </View>
    </View>
  )
}
