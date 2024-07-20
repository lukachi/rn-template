import { AntDesign } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { Button, ScrollView, Text, View } from 'react-native'

import LangSwitcher from '@/components/Homepage/LangSwitcher'
import Sibling1 from '@/components/Homepage/Sibling1'
import Sibling2 from '@/components/Homepage/Sibling2'
import SimpleForm from '@/components/Homepage/SimpleForm'
import ThemeSwitcher from '@/components/Homepage/ThemeSwitcher'
import { Config } from '@/config'
import { DefaultBusEvents, ErrorHandler, translate, useSoftKeyboardEffect } from '@/core'
import { bus } from '@/core/event-bus'
import {
  formatAmount,
  formatBalance,
  formatDateDiff,
  formatDateDMY,
  formatDateDMYT,
} from '@/helpers'
import { cn, useAppTheme } from '@/theme'
import { UiIcon } from '@/ui'

export default function Homepage() {
  const { palette } = useAppTheme()

  useSoftKeyboardEffect()

  console.log(Config.API_URL)

  return (
    <ScrollView>
      <View className={cn('text-h1 flex w-full flex-col items-center gap-10 px-10 py-5')}>
        <Text className={cn('typography-subtitle1')}>format amount, decimals: 6</Text>
        <Text>
          {Array.from({ length: 20 })
            .fill(0)
            .map((_, index) => formatAmount(`1${Math.pow(10, index + 1).toString()}`, 6))
            .join(' ; ')}
        </Text>

        <Text className={cn('typography-subtitle1')}>format balance, decimals: 6</Text>
        <Text>
          {Array.from({ length: 20 })
            .fill(0)
            .map((_, index) => formatBalance(`1${Math.pow(10, index + 1).toString()}`, 6))
            .join(' ; ')}
        </Text>

        <Button
          title={'test stacktrace'}
          onPress={() => {
            throw new Error('test')
          }}
        />

        <Text className={cn('typography-subtitle1')}>Toasts</Text>
        <View className={cn('flex flex-row flex-wrap gap-4')}>
          <Button
            title={'error'}
            onPress={() => {
              bus.emit(DefaultBusEvents.error, { title: 'error test', message: 'test' })
            }}
          />
          <Button
            title={'warning'}
            onPress={() => {
              bus.emit(DefaultBusEvents.warning, { title: 'warning test', message: 'test' })
            }}
          />
          <Button
            title={'success'}
            onPress={() => {
              bus.emit(DefaultBusEvents.success, { title: 'success test', message: 'test' })
            }}
          />
          <Button
            title={'info'}
            onPress={() => {
              bus.emit(DefaultBusEvents.info, { title: 'info test', message: 'test' })
            }}
          />
        </View>

        <Text className={cn('typography-subtitle1')}>ErrorHandler</Text>
        <View className={cn('flex flex-row flex-wrap gap-4')}>
          <Button
            title={'process'}
            onPress={() => {
              ErrorHandler.process(new Error('test error'))
            }}
          />
          <Button
            title={'process without feedback'}
            onPress={() => {
              ErrorHandler.processWithoutFeedback(new Error('test error without feedback'))
            }}
          />
        </View>
        <Text className='text-center text-textPrimary'>{translate('errors.default')}</Text>

        <Image source={require('@assets/images/stub.jpg')} style={{ width: 120, height: 120 }} />

        <UiIcon
          size={90}
          color={palette.primaryMain}
          className={cn('rotate-90')}
          componentName='arrowCounterClockwiseIcon'
        />

        <AntDesign name='stepforward' size={140} color={palette.secondaryMain} />

        <Sibling1 />
        <Sibling2 />

        <LangSwitcher />

        {/*FORM*/}
        <SimpleForm />
        {/*END FORM*/}

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
