import type { ViewProps } from 'react-native'
import { View } from 'react-native'

import { cn, useAppTheme } from '@/theme'
import UiIcon from '@/ui/UiIcon'
import { UiText } from '@/ui/UiText'

export default function AppInitializationErrorBoundary({
  className,
  ...rest
}: {
  error: Error
} & ViewProps) {
  const { palette } = useAppTheme()

  return (
    <View {...rest} className={cn('flex flex-1 items-center justify-center', className)}>
      <UiIcon libIcon='AntDesign' name='warning' size={170} color={palette.destructive} />

      <UiText className='typography-h5 mt-4 text-center'>Something went wrong.</UiText>
      <UiText className='typography-body1 mt-4 text-center text-muted-foreground'>
        Please try again later.
      </UiText>
    </View>
  )
}
