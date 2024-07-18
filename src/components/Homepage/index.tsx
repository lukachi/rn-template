import { AntDesign } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { Button, ScrollView, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'

import LangSwitcher from '@/components/Homepage/LangSwitcher'
import Sibling1 from '@/components/Homepage/Sibling1'
import Sibling2 from '@/components/Homepage/Sibling2'
import ThemeSwitcher from '@/components/Homepage/ThemeSwitcher'
import { translate } from '@/core'
import {
  formatAmount,
  formatBalance,
  formatDateDiff,
  formatDateDMY,
  formatDateDMYT,
} from '@/helpers'
import { cn, useAppTheme } from '@/theme'
import { Icon } from '@/ui'

export default function Homepage() {
  const { palette } = useAppTheme()

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
        <Text className={cn('typography-subtitle1')}>format amount, decimals: 6</Text>

        {Array.from({ length: 20 })
          .fill(0)
          .map((_, index) => (
            <Text key={index}>{formatAmount(`1${Math.pow(10, index + 1).toString()}`, 6)}</Text>
          ))}
        <Text className={cn('typography-subtitle1')}>format balance, decimals: 6</Text>
        {Array.from({ length: 20 })
          .fill(0)
          .map((_, index) => (
            <Text key={index}>{formatBalance(`1${Math.pow(10, index + 1).toString()}`, 6)}</Text>
          ))}

        <Button
          title={'test stacktrace'}
          onPress={() => {
            throw new Error('test')
          }}
        />

        <Button title={'show toast'} onPress={showToast} />
        <Button title={'show toast custom'} onPress={showToastCustom} />
        <Text className='text-center text-textPrimary'>{translate('errors.default')}</Text>

        <Image source={require('@assets/images/stub.jpg')} style={{ width: 120, height: 120 }} />

        <Icon
          size={90}
          color={palette.primaryMain}
          className={cn('rotate-90')}
          componentName='arrowCounterClockwiseIcon'
        />

        <AntDesign name='stepforward' size={140} color={palette.secondaryMain} />

        <Sibling1 />
        <Sibling2 />

        <LangSwitcher />

        <Text className={cn('text-textPrimary')}>{formatDateDMY(1720949121)}</Text>
        <Text className={cn('text-primaryMain')}>{formatDateDMYT(1720949121)}</Text>
        <Text className={cn('text-textPrimary')}>{formatDateDiff(1720949121)}</Text>

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
