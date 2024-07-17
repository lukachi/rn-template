import { Button, ScrollView, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'

import LangSwitcher from '@/app/LangSwitcher'
import ThemeSwitcher from '@/app/ThemeSwitcher'
import { translate } from '@/core'
import { formatDateDiff, formatDateDMY, formatDateDMYT } from '@/helpers'
import { cn } from '@/theme/utils'

export default function TabOneScreen() {
  const showToast = () => {
    Toast.show({
      type: 'success',
      text1: 'Hello',
      text2: 'Lorem ipsum dolor sit amet concestetur! 👋',
    })
  }
  const showToastCustom = () => {
    Toast.show({
      type: 'myCustomToast',
      props: {
        title: 'Hello',
        subtitle: 'Lorem ipsum dolor sit amet concestetur yopta! 👋',
      },
    })
  }

  return (
    <ScrollView>
      <View className={cn('text-h1 flex w-full flex-col items-center gap-10 px-10 py-5')}>
        <Button title={'show toast'} onPress={showToast} />
        <Button title={'show toast custom'} onPress={showToastCustom} />
        <Text className='text-center text-textPrimary'>{translate('errors.default')}</Text>

        <LangSwitcher />

        <Text className={cn('text-textPrimary typography-body1')}>{formatDateDMY(1720949121)}</Text>
        <Text className={cn('text-primaryMain typography-h2')}>{formatDateDMYT(1720949121)}</Text>
        <Text className={cn('text-textPrimary typography-h3')}>{formatDateDiff(1720949121)}</Text>

        <ThemeSwitcher />

        {/*<Text>{translate('plurals.key', { count: 1 })}</Text>*/}
        {/*<Text>{translate('plurals.key', { count: 2 })}</Text>*/}
        {/*<Text>{translate('plurals.key', { count: 3 })}</Text>*/}
        {/*<Text>{translate('plurals.key', { count: 4 })}</Text>*/}
        {/*<Text>{translate('plurals.key', { count: 4 })}</Text>*/}
        {/*<Text>{translate('plurals.key', { count: 4 })}</Text>*/}
        {/*<Text>{translate('plurals.key', { count: 4 })}</Text>*/}
        {/*<Text>{translate('plurals.key', { count: 4 })}</Text>*/}
        {/*<Text>{translate('plurals.key', { count: 4 })}</Text>*/}
        {/*<Text>{translate('plurals.key', { count: 5 })}</Text>*/}
        {/*<Text>{translate('plurals.key', { count: 25 })}</Text>*/}
        {/*<Text>{translate('plurals.key', { count: 205 })}</Text>*/}
      </View>
    </ScrollView>
  )
}
