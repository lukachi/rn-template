import { AntDesign } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { Button, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import LangSwitcher from '@/components/UiKit/components/LangSwitcher'
import Sibling1 from '@/components/UiKit/components/Sibling1'
import Sibling2 from '@/components/UiKit/components/Sibling2'
import SimpleForm from '@/components/UiKit/components/SimpleForm'
import ThemeSwitcher from '@/components/UiKit/components/ThemeSwitcher'
import { bus, DefaultBusEvents, ErrorHandler, translate } from '@/core'
import {
  formatAmount,
  formatBalance,
  formatDateDiff,
  formatDateDMY,
  formatDateDMYT,
} from '@/helpers'
import { cn, useAppTheme } from '@/theme'
import { UiBottomSheet, UiIcon, useUiBottomSheet } from '@/ui'
import { FileSystemUtil } from '@/utils'

import { Buttons } from './components'

export default function UiKit() {
  const insets = useSafeAreaInsets()
  const bottomSheet = useUiBottomSheet()
  const { palette } = useAppTheme()

  return (
    <View
      className='flex-1'
      style={{
        paddingTop: insets.top,
      }}
    >
      <ScrollView>
        <View className={cn('flex-1 gap-10 px-5')}>
          <Buttons />

          <Text className={cn('text-textPrimary typography-subtitle1')}>
            format amount, decimals: 6
          </Text>
          <Text className={cn('text-textPrimary')}>
            {Array.from({ length: 20 })
              .fill(0)
              .map((_, index) => formatAmount(`1${Math.pow(10, index + 1).toString()}`, 6))
              .join(' ; ')}
          </Text>

          <Text className={cn('text-textPrimary typography-subtitle1')}>
            format balance, decimals: 6
          </Text>
          <Text className={cn('text-textPrimary')}>
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

          <Text className={cn('text-textPrimary typography-subtitle1')}>Toasts</Text>
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

          <Text className={cn('text-textPrimary typography-subtitle1')}>ErrorHandler</Text>
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
            className={cn('size-[90px] rotate-90 text-primaryMain')}
            componentName='arrowRightIcon'
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

          <Text className={cn('text-textPrimary typography-subtitle1')}>File System</Text>

          <TestFiles />

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

          <Button onPress={bottomSheet.present} title='Present Modal' />

          <UiBottomSheet title='Bottom Sheet title' ref={bottomSheet.ref}>
            <Text className={cn('text-textPrimary')}>
              Lorem ipsum dolor sit amet concestetur! Lorem ipsum dolor sit amet concestetur! Lorem
              ipsum dolor sit amet concestetur! Lorem ipsum dolor sit amet concestetur!
            </Text>
          </UiBottomSheet>
        </View>
      </ScrollView>
    </View>
  )
}

function TestFiles() {
  const writeFile = async () => {
    try {
      let oldContent = ''
      try {
        oldContent = await FileSystemUtil.getFileContent(FileSystemUtil.appFiles.RuntimeLog)
      } catch (error) {}

      await FileSystemUtil.writeFile(
        FileSystemUtil.appFiles.RuntimeLog,
        oldContent + Date.now().toString() + '\n',
      )
    } catch (error) {
      ErrorHandler.process(Error)
    }
  }

  const logFile = async () => {
    try {
      console.log(await FileSystemUtil.getFileContent(FileSystemUtil.appFiles.RuntimeLog))
    } catch (error) {
      ErrorHandler.process(error)
    }
  }

  const deleteFile = async () => {
    try {
      console.log(await FileSystemUtil.deleteFile(FileSystemUtil.appFiles.RuntimeLog))
    } catch (error) {
      ErrorHandler.process(error)
    }
  }

  return (
    <View className={cn('flex flex-row gap-4')}>
      <Button title={'write'} onPress={writeFile} />
      <Button title={'log'} onPress={logFile} />
      <Button title={'delete'} onPress={deleteFile} />
    </View>
  )
}
