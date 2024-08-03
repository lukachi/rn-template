import { Button, Text, View } from 'react-native'

import { translate, useSelectedLanguage } from '@/core'
import { type Language, resources } from '@/core/localization/resources'
import { formatDateDiff, formatDateDMY, formatDateDMYT } from '@/helpers'
import { cn } from '@/theme'

export default function Localization() {
  return (
    <View>
      <LangSwitcher />

      <Text className={cn('text-textPrimary')}>{formatDateDMY(1720949121)}</Text>
      <Text className={cn('text-primaryMain')}>{formatDateDMYT(1720949121)}</Text>
      <Text className={cn('text-textPrimary')}>{formatDateDiff(1720949121)}</Text>

      <Text className='text-center text-textPrimary'>{translate('errors.default')}</Text>
    </View>
  )
}

function LangSwitcher() {
  const { language, setLanguage } = useSelectedLanguage()

  return (
    <View className={cn('flex flex-col items-center gap-4')}>
      <Text className={cn('text-textPrimary')}>current lang: {language}</Text>

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
