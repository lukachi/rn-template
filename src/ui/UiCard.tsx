import type { ViewProps } from 'react-native'
import { View } from 'react-native'

import { cn } from '@/theme'

export default function UiCard({ children, className, ...rest }: ViewProps) {
  return (
    <View {...rest} className={cn('rounded-3xl bg-backgroundContainer p-4', className)}>
      {children}
    </View>
  )
}
