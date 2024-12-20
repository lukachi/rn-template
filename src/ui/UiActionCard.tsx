import type { PressableProps } from 'react-native'
import { Pressable, Text, View, type ViewProps } from 'react-native'

import { cn } from '@/theme'
import UiCard from '@/ui/UiCard'

type Props = {
  title: string
  subtitle: string
  leadingContent?: React.ReactNode
  trailingContent?: React.ReactNode

  pressProps?: PressableProps
} & ViewProps

export default function UiActionCard({
  title,
  subtitle,
  leadingContent,
  trailingContent,
  className,
  children,

  pressProps,
  ...rest
}: Props) {
  return (
    <Pressable {...pressProps}>
      <UiCard {...rest} className={cn('flex flex-row items-center gap-4', className)}>
        {leadingContent && <View>{leadingContent}</View>}

        <View className='flex flex-1 flex-col gap-2'>
          {children || (
            <>
              <Text className='text-textPrimary typography-subtitle3'>{title}</Text>
              <Text className='text-textPrimary typography-body3'>{subtitle}</Text>
            </>
          )}
        </View>

        {trailingContent && <View>{trailingContent}</View>}
      </UiCard>
    </Pressable>
  )
}
