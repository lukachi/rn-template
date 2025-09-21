import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CircleQuestionMarkIcon,
  TriangleAlertIcon,
} from 'lucide-react-native'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

import { emitter } from '@/core'
import { sleep } from '@/helpers/promise'
import { cn } from '@/theme'

import { UiLucideIcon } from '../UiLucideIcon'
import { UiText, UiTextClassContext } from '../UiText'

const STATUS_MESSAGE_AUTO_HIDE_DURATION = 55 * 1000

export type DefaultToastPayload = {
  title: string
  message: string
  icon: () => ReactNode
}

const abortController = new AbortController()

const showSuccessToast = async (payload?: Partial<DefaultToastPayload>) => {
  Toast.hide()

  await sleep(250)

  Toast.show({
    type: 'defaultToast',
    props: {
      title: 'Success',
      icon: () => <UiLucideIcon as={CheckCircle2Icon} className='size-16 text-green-500' />,
      ...payload,
    },
    visibilityTime: STATUS_MESSAGE_AUTO_HIDE_DURATION,
  })
}
const showWarningToast = async (payload?: Partial<DefaultToastPayload>) => {
  Toast.hide()

  await sleep(250)

  Toast.show({
    type: 'defaultToast',
    props: {
      title: 'Warning',
      icon: () => <UiLucideIcon as={TriangleAlertIcon} className='size-16 text-yellow-500' />,
      ...payload,
    },
    visibilityTime: STATUS_MESSAGE_AUTO_HIDE_DURATION,
  })
}
const showErrorToast = async (payload?: Partial<DefaultToastPayload>) => {
  Toast.hide()

  await sleep(250)

  Toast.show({
    type: 'defaultToast',
    props: {
      title: 'Success',
      icon: () => <UiLucideIcon as={AlertCircleIcon} className='size-16 text-red-500' />,
      ...payload,
    },
    visibilityTime: STATUS_MESSAGE_AUTO_HIDE_DURATION,
  })
}
const showInfoToast = async (payload?: Partial<DefaultToastPayload>) => {
  Toast.hide()

  await sleep(250)

  Toast.show({
    type: 'defaultToast',
    props: {
      title: 'Success',
      icon: () => <UiLucideIcon as={CircleQuestionMarkIcon} className='size-16 text-blue-500' />,
      ...payload,
    },
    visibilityTime: STATUS_MESSAGE_AUTO_HIDE_DURATION,
  })
}

/*
  2. Pass the config as prop to the Toast component instance
*/
export default function Toasts() {
  const insets = useSafeAreaInsets()

  useEffect(() => {
    emitter.on('success', showSuccessToast)
    emitter.on('warning', showWarningToast)
    emitter.on('error', showErrorToast)
    emitter.on('info', showInfoToast)

    return () => {
      emitter.off('success', showSuccessToast)
      emitter.off('warning', showWarningToast)
      emitter.off('error', showErrorToast)
      emitter.off('info', showInfoToast)
      abortController.abort()
    }
  }, [])

  return (
    <Toast
      topOffset={insets.top}
      config={{
        defaultToast: ({ props: { title, message, icon } }) => {
          // Fast solution, just for showcase, implement your own toast container
          return (
            <View className='flex w-full flex-row justify-center overflow-hidden px-4'>
              <View
                className={cn(
                  'flex w-11/12 flex-row gap-4 rounded-2xl px-4 py-2',
                  'relative w-full border border-border bg-card',
                )}
              >
                {!!icon && <View className='self-center'>{icon()}</View>}
                <View className='flex gap-1'>
                  <UiTextClassContext.Provider value={cn('max-w-[80%]')}>
                    {title && <UiText variant='title-large'>{title}</UiText>}
                    {message && <UiText variant='body-large'>{message}</UiText>}
                  </UiTextClassContext.Provider>
                </View>
              </View>
            </View>
          )
        },
      }}
    />
  )
}
