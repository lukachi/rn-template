import type { ReactElement } from 'react'
import type { ViewProps } from 'react-native'
import { View } from 'react-native'

import { cn } from '@/theme'
import { UiText } from '@/ui/UiText'

type StepLayoutProps = ViewProps & {
  title: string
  subtitle: string
  media: ReactElement
}

export default function StepLayout({
  title,
  subtitle,
  media,
  className,
  ...rest
}: StepLayoutProps) {
  return (
    <View {...rest} className={cn('flex flex-col items-center justify-end gap-10', className)}>
      <View className={cn('my-auto')}>{media}</View>
      <View className={cn('flex flex-col gap-4')}>
        <UiText className={cn('typography-h5 text-center')}>{title}</UiText>
        <UiText className={cn('typography-body2 text-center')}>{subtitle}</UiText>
      </View>
    </View>
  )
}
