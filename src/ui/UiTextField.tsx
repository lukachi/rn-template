import type { ReactElement } from 'react'
import { forwardRef, useCallback, useMemo, useState } from 'react'
import type { FieldValues } from 'react-hook-form'
import type { UseControllerProps } from 'react-hook-form'
import { useController } from 'react-hook-form'
import type { TextInput, TextInputProps, ViewProps } from 'react-native'
import { I18nManager, StyleSheet } from 'react-native'
import { Text, TextInput as NTextInput } from 'react-native'
import { View } from 'react-native'
import { tv } from 'tailwind-variants'
import { v4 as uuid } from 'uuid'

import { cn, useAppTheme } from '@/theme'

const inputTv = tv({
  slots: {
    label: cn('typography-subtitle4 text-textPrimary mb-2'),
    container: cn(
      'flex flex-row items-center gap-2 rounded-xl border-[1px] border-componentPrimary bg-transparent px-4 py-3',
    ),
    input: cn('placeholder-textSecondary text-textPrimary typography-body3'),
  },

  variants: {
    focused: {
      true: {
        container: cn('border-componentPressed'),
      },
    },
    error: {
      true: {
        container: cn('border-errorMain'),
      },
    },
    disabled: {
      true: {
        container: cn(
          'text-textDisabled placeholder-textDisabled border-transparent bg-componentDisabled',
        ),
        label: cn('text-textDisabled'),
        input: cn('text-textDisabled'),
      },
    },
  },
  defaultVariants: {
    focused: false,
    error: false,
    disabled: false,
  },
})

type Props = TextInputProps & {
  label?: string
  errorMessage?: string
  disabled?: boolean
  leadingContent?: ReactElement
  trailingContent?: ReactElement
  containerProps?: ViewProps
}

export const UiTextField = forwardRef<TextInput, Props>(
  (
    {
      label,
      errorMessage,
      disabled,
      id = uuid(),
      leadingContent,
      trailingContent,
      containerProps,
      ...rest
    }: Props,
    ref,
  ) => {
    const { palette } = useAppTheme()
    const [isFocussed, setIsFocussed] = useState(false)

    const styles = useMemo(
      () =>
        inputTv({
          error: Boolean(errorMessage),
          focused: isFocussed,
          disabled: Boolean(disabled),
        }),
      [errorMessage, isFocussed, disabled],
    )

    const onBlur = useCallback(() => setIsFocussed(false), [])
    const onFocus = useCallback(() => setIsFocussed(true), [])

    return (
      <View {...containerProps} className={cn('w-full', containerProps?.className)}>
        {label && <Text className={styles.label()}>{label}</Text>}

        <View className={cn(styles.container())}>
          {leadingContent && leadingContent}

          <NTextInput
            ref={ref}
            id={id}
            onBlur={onBlur}
            onFocus={onFocus}
            {...rest}
            className={styles.input()}
            // not supported by NativeWind
            placeholderTextColor={palette.textPlaceholder}
            style={StyleSheet.flatten([
              { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
              { textAlign: I18nManager.isRTL ? 'right' : 'left' },
              { flex: 1 },
              rest.style,
            ])}
            editable={!disabled}
          />

          {trailingContent && trailingContent}
        </View>
        {errorMessage && <Text className={cn('mt-2 text-errorMain')}>{errorMessage}</Text>}
      </View>
    )
  },
)

export type ControlledInputProps<T extends FieldValues> = Props & UseControllerProps<T>

export function ControlledUiTextField<T extends FieldValues>({
  name,
  control,
  rules,
  onChangeText,
  ...rest
}: ControlledInputProps<T>) {
  const { field, fieldState } = useController({ control, name, rules: rules })

  return (
    <UiTextField
      ref={field.ref}
      autoCapitalize='none'
      onChangeText={v => {
        onChangeText?.(v)
        field.onChange(v)
      }}
      value={(field.value as string) || ''}
      {...rest}
      errorMessage={fieldState.error?.message}
    />
  )
}
