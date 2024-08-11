import type { ViewProps } from 'react-native'
import { View } from 'react-native'

import { cn } from '@/theme'

export default function UiHorizontalDivider({ className }: ViewProps) {
  return <View className={cn('h-[1px] w-full bg-componentPrimary', className)} />
}
