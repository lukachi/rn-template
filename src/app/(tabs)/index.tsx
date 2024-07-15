import { ScrollView, Text, View } from 'react-native'

import LangSwitcher from '@/app/LangSwitcher'
import { translate } from '@/core'
import { formatDateDiff, formatDateDMY, formatDateDMYT } from '@/helpers'
import { typography } from '@/theme'

export default function TabOneScreen() {
  return (
    <ScrollView>
      <View
        style={{
          alignItems: 'center',
          gap: 48,
          paddingHorizontal: 40,
          paddingTop: 20,
        }}
      >
        <Text
          style={{
            textAlign: 'center',
          }}
        >
          {translate('errors.default')}
        </Text>

        <LangSwitcher />

        <Text
          style={{
            ...typography.testCursive,
          }}
        >
          {formatDateDMY(1720949121)}
        </Text>
        <Text>{formatDateDMYT(1720949121)}</Text>
        <Text>{formatDateDiff(1720949121)}</Text>

        <Text>Plurals</Text>

        {/*<Text>{translate('plurals.key', { count: 1 })}</Text>*/}
        {/*<Text>{translate('plurals.key', { count: 2 })}</Text>*/}
        {/*<Text>{translate('plurals.key', { count: 3 })}</Text>*/}
        {/*<Text>{translate('plurals.key', { count: 4 })}</Text>*/}
        {/*<Text>{translate('plurals.key', { count: 5 })}</Text>*/}
        {/*<Text>{translate('plurals.key', { count: 25 })}</Text>*/}
        {/*<Text>{translate('plurals.key', { count: 205 })}</Text>*/}
      </View>
    </ScrollView>
  )
}
