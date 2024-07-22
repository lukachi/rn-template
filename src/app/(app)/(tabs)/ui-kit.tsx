import { Button, ScrollView, Text, View } from 'react-native'

import { cn } from '@/theme'
import { UiBottomSheet, useUiBottomSheet } from '@/ui'
import { UiButton } from '@/ui'

const buttonRowClasses = cn('flex flex-row flex-wrap items-center gap-4')

export default function UiKit() {
  const bottomSheet = useUiBottomSheet()

  return (
    <ScrollView>
      <View className={cn('flex-1 gap-10 p-5')}>
        <View className={cn('flex gap-10')}>
          <Text className={'text-textPrimary typography-h6'}>Buttons</Text>

          <View className={cn('flex gap-4')}>
            {/* FILLED */}

            <View className={cn(buttonRowClasses)}>
              <UiButton title='Button' />
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
              <UiButton
                title='Disabled'
                leadingIcon={'checkIcon'}
                variant='outlined'
                color='success'
              />
            </View>
            <View className={cn(buttonRowClasses)}>
              <UiButton title='Button' variant='outlined' color='error' />
              <UiButton title='Disabled' variant='outlined' color='error' disabled />
              <UiButton
                title='Disabled'
                leadingIcon={'checkIcon'}
                variant='outlined'
                color='error'
              />
            </View>
            <View className={cn(buttonRowClasses)}>
              <UiButton title='Button' variant='outlined' color='warning' />
              <UiButton title='Disabled' variant='outlined' color='warning' disabled />
              <UiButton
                title='Disabled'
                leadingIcon={'checkIcon'}
                variant='outlined'
                color='warning'
              />
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
              <UiButton
                title='Disabled'
                leadingIcon={'checkIcon'}
                variant='text'
                color='secondary'
              />
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

        <Button onPress={bottomSheet.present} title='Present Modal' />

        <UiBottomSheet title='Bottom Sheet title' ref={bottomSheet.ref}>
          <Text className={cn('text-textPrimary')}>
            Lorem ipsum dolor sit amet concestetur! Lorem ipsum dolor sit amet concestetur! Lorem
            ipsum dolor sit amet concestetur! Lorem ipsum dolor sit amet concestetur!
          </Text>
        </UiBottomSheet>
      </View>
    </ScrollView>
  )
}
