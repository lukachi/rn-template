import type { ViewProps } from 'react-native'
import { Text, View } from 'react-native'

import { cn, useAppTheme } from '@/theme'
import { UiIcon } from '@/ui'

type Props = {
  error: Error
} & ViewProps

export default function AppInitializationErrorBoundary({ className, ...rest }: Props) {
  const { palette } = useAppTheme()

  return (
    <View
      {...rest}
      className={cn('flex flex-1 items-center justify-center bg-backgroundPrimary', className)}
    >
      <UiIcon libIcon='AntDesign' name='warning' size={170} color={palette.errorMain} />

      <Text className='typography-h5 mt-4 text-center text-textPrimary'>Something went wrong.</Text>
      <Text className='typography-body1 mt-4 text-center text-textSecondary'>
        Please try again later.
      </Text>
    </View>
  )
}
