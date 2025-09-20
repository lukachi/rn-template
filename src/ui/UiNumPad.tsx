import type { ReactNode } from 'react'
import { useCallback, useMemo } from 'react'
import { TouchableOpacity, TouchableOpacityProps, View, type ViewProps } from 'react-native'

import { cn } from '@/theme'

import UiIcon from './UiIcon'
import { UiText } from './UiText'

type Props = {
  value: string
  setValue: (value: string) => void
  extra?: ReactNode
} & ViewProps

export default function UiNumPad({ value, setValue, className, extra, ...rest }: Props) {
  const numArray = useMemo(() => {
    return [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', '<-'],
    ]
  }, [])

  const handlePress = useCallback(
    (num: string) => {
      if (num === '<-') {
        setValue(value.slice(0, -1))
      } else {
        setValue(value + num)
      }
    },
    [setValue, value],
  )

  return (
    <View {...rest} className={cn('flex w-full gap-2', className)}>
      {numArray.map((row, i) => (
        <View key={i} className='flex w-full flex-row gap-2'>
          {row.map((num, j) => {
            if (!num) {
              if (extra) {
                return <NumKey key={i + j}>{extra}</NumKey>
              }

              return <NumKey key={i + j} className='flex flex-1 items-center justify-center' />
            }

            if (num === '<-') {
              return (
                <NumKey key={i + j} onPress={() => handlePress(num)}>
                  <UiIcon customIcon='backspaceIcon' size={32} className='text-foreground' />
                </NumKey>
              )
            }

            return (
              <NumKey key={i + j} onPress={() => handlePress(num)}>
                <UiText variant='h3' className='typography-h3'>
                  {num}
                </UiText>
              </NumKey>
            )
          })}
        </View>
      ))}
    </View>
  )
}

function NumKey({ children, className, ...rest }: TouchableOpacityProps) {
  return (
    <TouchableOpacity
      {...rest}
      className={cn(
        'flex size-[75] w-full flex-1 items-center justify-center rounded-xl',
        className,
      )}
    >
      {children}
    </TouchableOpacity>
  )
}
