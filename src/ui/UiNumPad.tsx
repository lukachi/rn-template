import type { ReactNode } from 'react'
import { useCallback, useMemo } from 'react'
import { Pressable, View, type ViewProps } from 'react-native'

import { cn } from '@/theme'

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
        <View key={i} className='flex flex-row justify-between gap-2'>
          {row.map((num, j) => {
            if (!num) {
              if (extra) {
                return (
                  <View
                    key={i + j}
                    className='flex flex-1 items-center justify-center rounded-xl bg-muted'
                  >
                    {extra}
                  </View>
                )
              }

              return <View key={i + j} className='flex flex-1 items-center justify-center' />
            }

            return (
              <View key={i + j} className='flex flex-1 items-center justify-center'>
                <Pressable
                  className='w-full rounded-xl'
                  onPress={() => {
                    handlePress(num)
                  }}
                >
                  <View className='flex items-center justify-center rounded-xl bg-muted'>
                    <UiText variant='h4'>{num}</UiText>
                  </View>
                </Pressable>
              </View>
            )
          })}
        </View>
      ))}
    </View>
  )
}
