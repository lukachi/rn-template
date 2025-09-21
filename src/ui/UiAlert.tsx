import type { LucideIcon } from 'lucide-react-native'
import * as React from 'react'
import { View, type ViewProps } from 'react-native'

import { cn } from '@/theme/utils'

import { UiLucideIcon } from './UiLucideIcon'
import { UiText, UiTextClassContext } from './UiText'

function Alert({
  className,
  variant,
  children,
  icon,
  iconClassName,
  ...props
}: ViewProps &
  React.RefAttributes<View> & {
    icon: LucideIcon
    variant?: 'default' | 'destructive'
    iconClassName?: string
  }) {
  return (
    <UiTextClassContext.Provider
      value={cn(
        'text-sm text-foreground',
        variant === 'destructive' && 'text-destructive',
        className,
      )}
    >
      <View
        role='alert'
        className={cn(
          'relative w-full rounded-lg border border-border bg-card px-4 pb-2 pt-3.5',
          className,
        )}
        {...props}
      >
        <View className='absolute left-3.5 top-3'>
          <UiLucideIcon
            as={icon}
            className={cn('size-4', variant === 'destructive' && 'text-destructive', iconClassName)}
          />
        </View>
        {children}
      </View>
    </UiTextClassContext.Provider>
  )
}

function AlertTitle({
  className,
  ...props
}: React.ComponentProps<typeof UiText> & React.RefAttributes<Text>) {
  return (
    <UiText
      className={cn('mb-1 ml-0.5 min-h-4 pl-6 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<typeof UiText> & React.RefAttributes<Text>) {
  const textClass = React.useContext(UiTextClassContext)
  return (
    <UiText
      className={cn(
        'ml-0.5 pb-1.5 pl-6 text-sm leading-relaxed text-muted-foreground',
        textClass?.includes('text-destructive') && 'text-destructive/90',
        className,
      )}
      {...props}
    />
  )
}

export { Alert as UiAlert, AlertDescription as UiAlertDescription, AlertTitle as UiAlertTitle }
