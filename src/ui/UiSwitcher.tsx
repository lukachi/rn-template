import { cssInterop } from 'nativewind'
import type { ElementRef } from 'react'
import { useMemo } from 'react'
import { forwardRef } from 'react'
import { type FieldValues, useController, type UseControllerProps } from 'react-hook-form'
import type { SwitchProps, ViewProps } from 'react-native'
import { Text } from 'react-native'
import { I18nManager, StyleSheet, View } from 'react-native'
import { Switch as RNSwitch } from 'react-native'
import { tv } from 'tailwind-variants'
import { v4 as uuid } from 'uuid'

import { cn } from '@/theme'

type Props = SwitchProps & {
  label?: string
  errorMessage?: string
  disabled?: boolean
  viewProps?: ViewProps
}

const switchTv = tv({
  slots: {
    base: '',
    label: cn('typography-subtitle4 text-textPrimary'),
  },

  variants: {
    error: {
      true: {
        base: cn('border-errorMain'),
        label: cn('text-errorMain'),
      },
    },
    disabled: {
      true: {
        label: cn('text-textDisabled'),
      },
    },
  },
  defaultVariants: {
    focused: false,
    error: false,
    disabled: false,
  },
})

// FIXME: on props value change, actual switch-rn value not changing(iOS only)
export const UiSwitcher = forwardRef<ElementRef<typeof RNSwitch>, Props>(
  ({ id = uuid(), label, errorMessage, disabled, value, viewProps, ...rest }, ref) => {
    const styles = useMemo(
      () =>
        switchTv({
          error: Boolean(errorMessage),
          disabled: Boolean(disabled),
        }),
      [errorMessage, disabled],
    )

    return (
      <View {...viewProps}>
        <View className='flex flex-row items-center gap-2'>
          {label && <Text className={styles.label()}>{label}</Text>}

          <RNSwitch
            {...rest}
            ref={ref}
            id={id}
            className={styles.base()}
            style={StyleSheet.flatten([
              { direction: I18nManager.isRTL ? 'rtl' : 'ltr' },
              rest.style,
            ])}
            disabled={disabled}
            value={value}
          />
        </View>

        {errorMessage && <Text className={cn('mt-2 text-errorMain')}>{errorMessage}</Text>}
      </View>
    )
  },
)

cssInterop(UiSwitcher, { className: 'style' })

type ControlledSwitchProps<T extends FieldValues> = Props & UseControllerProps<T> & {}

export function ControlledUiSwitcher<T extends FieldValues>({
  name,
  control,
  rules,
  ...rest
}: ControlledSwitchProps<T>) {
  const { field, fieldState } = useController({ control, name, rules: rules })

  return (
    <UiSwitcher
      ref={field.ref}
      onChange={field.onChange}
      value={field.value}
      errorMessage={fieldState.error?.message}
      {...rest}
    />
  )
}
