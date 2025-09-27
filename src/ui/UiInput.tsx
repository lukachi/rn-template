import { ComponentProps, ReactNode } from 'react'
import React from 'react'
import type { FieldValues } from 'react-hook-form'
import type { UseControllerProps } from 'react-hook-form'
import { useController } from 'react-hook-form'
import { Platform, TextInput, TextInputProps, View } from 'react-native'
import { v4 } from 'uuid'

import { cn } from '@/theme'

import { UiCollapsible } from './UiCollapsible'
import { UiLabel } from './UiLabel'
import { UiText } from './UiText'

function Input({ className, ...props }: TextInputProps & React.RefAttributes<TextInput>) {
  return (
    <TextInput
      className={cn(
        'border-input bg-background text-foreground dark:bg-input/30 flex h-10 w-full min-w-0 flex-row items-center rounded-md border px-3 py-1 text-base leading-5 shadow-sm shadow-black/5 sm:h-9',
        props.editable === false &&
          cn(
            'opacity-50',
            Platform.select({ web: 'disabled:pointer-events-none disabled:cursor-not-allowed' }),
          ),
        Platform.select({
          web: cn(
            'selection:bg-primary selection:text-primary-foreground transition-[color,box-shadow] outline-none md:text-sm',
            'placeholder:text-muted-foreground',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          ),
          native: 'placeholder:text-muted-foreground/50',
        }),
        className,
      )}
      {...props}
    />
  )
}

export type ControlledInputProps<T extends FieldValues> = {
  label?: ReactNode
  leadingContent?: ReactNode
  trailingContent?: ReactNode
} & ComponentProps<typeof Input> &
  UseControllerProps<T>

function ControlledUiInput<T extends FieldValues>({
  name,
  control,
  rules,
  label,
  leadingContent,
  trailingContent,
  onChangeText,
  ...rest
}: ControlledInputProps<T>) {
  const id = React.useMemo(() => v4(), [])
  const { field, fieldState } = useController({ control, name, rules: rules })

  return (
    <View className='flex flex-col items-start gap-2'>
      {label &&
        (() => {
          return (
            <UiLabel className='text-muted-foreground' htmlFor={id}>
              {label}
            </UiLabel>
          )
        })()}
      <View className='relative isolate flex w-full'>
        {leadingContent}
        <Input
          {...rest}
          id={id}
          ref={field.ref}
          autoCapitalize='none'
          onChangeText={v => {
            onChangeText?.(v)
            field.onChange(v)
          }}
          value={field.value}
        />
        {trailingContent}
      </View>

      <UiCollapsible open={!!fieldState.error?.message} className='w-full'>
        <UiText variant='body-medium' className='text-destructive'>
          {fieldState.error?.message}
        </UiText>
      </UiCollapsible>
    </View>
  )
}

export { ControlledUiInput as ControlledUiInput, Input as UiInput }
