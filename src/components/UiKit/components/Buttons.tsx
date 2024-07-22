import { Text, View } from 'react-native'

import { bus, DefaultBusEvents } from '@/core'
import { cn } from '@/theme'
import { UiButton } from '@/ui'

const buttonRowClasses = cn('flex flex-row flex-wrap items-center gap-4')

export default function Buttons() {
  return (
    <View className={cn('flex gap-10')}>
      <Text className={'text-textPrimary typography-h6'}>Buttons</Text>

      <View className={cn('flex gap-4')}>
        {/* FILLED */}

        <View className={cn(buttonRowClasses)}>
          <UiButton
            title='Button'
            onPress={() => {
              bus.emit(DefaultBusEvents.success, {
                title: 'WORKS!',
                message: 'Button pressed!',
              })
            }}
          />
          <UiButton title='Disabled' disabled />
          <UiButton title='Disabled' leadingIcon={'checkIcon'} />
        </View>
        <View className={cn(buttonRowClasses)}>
          <UiButton title='Button' color='secondary' />
          <UiButton title='Disabled' color='secondary' disabled />
          <UiButton title='Disabled' leadingIcon={'checkIcon'} color='secondary' />
        </View>
        <View className={cn(buttonRowClasses)}>
          <UiButton title='Button' color='success' />
          <UiButton title='Disabled' color='success' disabled />
          <UiButton title='Disabled' leadingIcon={'checkIcon'} color='success' />
        </View>
        <View className={cn(buttonRowClasses)}>
          <UiButton title='Button' color='error' />
          <UiButton title='Disabled' color='error' disabled />
          <UiButton title='Disabled' leadingIcon={'checkIcon'} color='error' />
        </View>
        <View className={cn(buttonRowClasses)}>
          <UiButton title='Button' color='warning' />
          <UiButton title='Disabled' color='warning' disabled />
          <UiButton title='Disabled' leadingIcon={'checkIcon'} color='warning' />
        </View>

        {/* OUTLINED */}

        <View className={cn(buttonRowClasses)}>
          <UiButton title='Button' variant='outlined' />
          <UiButton title='Disabled' variant='outlined' disabled />
          <UiButton title='Disabled' leadingIcon={'checkIcon'} variant='outlined' />
        </View>
        <View className={cn(buttonRowClasses)}>
          <UiButton title='Button' variant='outlined' color='secondary' />
          <UiButton title='Disabled' variant='outlined' color='secondary' disabled />
          <UiButton
            title='Disabled'
            leadingIcon={'checkIcon'}
            variant='outlined'
            color='secondary'
          />
        </View>
        <View className={cn(buttonRowClasses)}>
          <UiButton title='Button' variant='outlined' color='success' />
          <UiButton title='Disabled' variant='outlined' color='success' disabled />
          <UiButton title='Disabled' leadingIcon={'checkIcon'} variant='outlined' color='success' />
        </View>
        <View className={cn(buttonRowClasses)}>
          <UiButton title='Button' variant='outlined' color='error' />
          <UiButton title='Disabled' variant='outlined' color='error' disabled />
          <UiButton title='Disabled' leadingIcon={'checkIcon'} variant='outlined' color='error' />
        </View>
        <View className={cn(buttonRowClasses)}>
          <UiButton title='Button' variant='outlined' color='warning' />
          <UiButton title='Disabled' variant='outlined' color='warning' disabled />
          <UiButton title='Disabled' leadingIcon={'checkIcon'} variant='outlined' color='warning' />
        </View>

        {/* TEXT */}

        <View className={cn(buttonRowClasses)}>
          <UiButton title='Button' variant='text' />
          <UiButton title='Disabled' variant='text' disabled />
          <UiButton title='Disabled' leadingIcon={'checkIcon'} variant='text' />
        </View>
        <View className={cn(buttonRowClasses)}>
          <UiButton title='Button' variant='text' color='secondary' />
          <UiButton title='Disabled' variant='text' color='secondary' disabled />
          <UiButton title='Disabled' leadingIcon={'checkIcon'} variant='text' color='secondary' />
        </View>
        <View className={cn(buttonRowClasses)}>
          <UiButton title='Button' variant='text' color='success' />
          <UiButton title='Disabled' variant='text' color='success' disabled />
          <UiButton title='Disabled' leadingIcon={'checkIcon'} variant='text' color='success' />
        </View>
        <View className={cn(buttonRowClasses)}>
          <UiButton title='Button' variant='text' color='error' />
          <UiButton title='Disabled' variant='text' color='error' disabled />
          <UiButton title='Disabled' leadingIcon={'checkIcon'} variant='text' color='error' />
        </View>
        <View className={cn(buttonRowClasses)}>
          <UiButton title='Button' variant='text' color='warning' />
          <UiButton title='Disabled' variant='text' color='warning' disabled />
          <UiButton title='Disabled' leadingIcon={'checkIcon'} variant='text' color='warning' />
        </View>
      </View>
    </View>
  )
}
