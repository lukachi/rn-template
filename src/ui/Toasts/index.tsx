import { useToast } from 'heroui-native'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

// import Toast from 'react-native-toast-message'
import { emitter } from '@/core'

const STATUS_MESSAGE_AUTO_HIDE_DURATION = 5 * 1000

export type DefaultToastPayload = {
  title: string
  message: string
  icon: () => ReactNode
}

const abortController = new AbortController()

/*
  2. Pass the config as prop to the Toast component instance
*/
export default function Toasts() {
  const { toast } = useToast()

  const showSuccessToast = (payload?: Partial<DefaultToastPayload>) => {
    toast.show({
      variant: 'success',
      label: payload?.title,
      description: payload?.message,
      actionLabel: 'Close',
      duration: STATUS_MESSAGE_AUTO_HIDE_DURATION,
      onActionPress: ({ hide }) => hide(),
    })
  }

  const showWarningToast = (payload?: Partial<DefaultToastPayload>) => {
    toast.show({
      variant: 'warning',
      label: payload?.title,
      description: payload?.message,
      actionLabel: 'Close',
      duration: STATUS_MESSAGE_AUTO_HIDE_DURATION,
      onActionPress: ({ hide }) => hide(),
    })
  }

  const showErrorToast = (payload?: Partial<DefaultToastPayload>) => {
    toast.show({
      variant: 'danger',
      label: payload?.title,
      description: payload?.message,
      actionLabel: 'Close',
      duration: STATUS_MESSAGE_AUTO_HIDE_DURATION,
      onActionPress: ({ hide }) => hide(),
    })
  }

  const showInfoToast = (payload?: Partial<DefaultToastPayload>) => {
    toast.show({
      variant: 'default',
      label: payload?.title,
      description: payload?.message,
      actionLabel: 'Close',
      duration: STATUS_MESSAGE_AUTO_HIDE_DURATION,
      onActionPress: ({ hide }) => hide(),
    })
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <></>
}
