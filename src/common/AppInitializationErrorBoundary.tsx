import { FileWarningIcon } from 'lucide-react-native'
import type { ViewProps } from 'react-native'
import { View } from 'react-native'

import { cn } from '@/theme'
import { UiLucideIcon } from '@/ui/icons/UiLucideIcon'
import { UiText } from '@/ui/UiText'

export default function AppInitializationErrorBoundary({
  className,
  ...rest
}: {
  error: Error
} & ViewProps) {
  return (
    <View {...rest} className={cn('flex flex-1 items-center justify-center', className)}>
      <UiLucideIcon as={FileWarningIcon} className='text-destructive size-[45]' />

      <UiText variant='h4' className='mt-4 text-center'>
        Something went wrong.
      </UiText>
      <UiText variant='body-large' className='text-muted-foreground mt-4 text-center'>
        Please try again later.
      </UiText>
    </View>
  )
}
