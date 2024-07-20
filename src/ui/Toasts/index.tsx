import type { ReactElement } from 'react'
import { useEffect } from 'react'
import { View } from 'react-native'
import Toast, { BaseToast } from 'react-native-toast-message'

import { DefaultBusEvents, translate } from '@/core'
import { bus } from '@/core'
import { sleep } from '@/helpers'
import { cn, getAppTheme, useAppTheme } from '@/theme'
import Icon from '@/ui/Icon'

const STATUS_MESSAGE_AUTO_HIDE_DURATION = 2 * 1000

export type ToastPayload = {
  messageType?: DefaultBusEvents

  title?: string
  message?: string | ReactElement
  iconComponent?: ReactElement
}

const defaultTitles = {
  [DefaultBusEvents.success]: translate('notifications.default-title-success'),
  [DefaultBusEvents.error]: translate('notifications.default-title-error'),
  [DefaultBusEvents.warning]: translate('notifications.default-title-warning'),
  [DefaultBusEvents.info]: translate('notifications.default-title-info'),
}

const defaultMessages = {
  [DefaultBusEvents.success]: translate('notifications.default-message-success'),
  [DefaultBusEvents.error]: translate('notifications.default-message-error'),
  [DefaultBusEvents.warning]: translate('notifications.default-message-warning'),
  [DefaultBusEvents.info]: translate('notifications.default-message-info'),
}

const defaultIcons = {
  [DefaultBusEvents.success]: () => {
    const { palette } = getAppTheme()
    return <Icon componentName='checkIcon' color={palette.successMain} />
  },
  [DefaultBusEvents.error]: () => {
    const { palette } = getAppTheme()
    return <Icon componentName='warningIcon' color={palette.errorMain} />
  },
  [DefaultBusEvents.warning]: () => {
    const { palette } = getAppTheme()
    return <Icon componentName='warningIcon' color={palette.warningMain} />
  },
  [DefaultBusEvents.info]: () => {
    const { palette } = getAppTheme()
    return <Icon componentName='infoIcon' color={palette.secondaryMain} />
  },
}

/**
 * Currently shows only one toast at a time
 */
const showToast = async (messageType = DefaultBusEvents.info, payload: ToastPayload) => {
  const title = payload?.title || defaultTitles[messageType]
  const message = payload?.message || defaultMessages[messageType]
  const icon = payload?.iconComponent || defaultIcons[messageType]

  Toast.hide()

  await sleep(250)

  try {
    Toast.show({
      type: 'defaultToast',
      props: {
        title,
        message,
        icon,
      },
      visibilityTime: STATUS_MESSAGE_AUTO_HIDE_DURATION,
    })
  } catch (e) {
    console.log(e)
  }
}

const showSuccessToast = (payload?: unknown) =>
  showToast(DefaultBusEvents.success, payload as ToastPayload)
const showWarningToast = (payload?: unknown) =>
  showToast(DefaultBusEvents.warning, payload as ToastPayload)
const showErrorToast = (payload?: unknown) =>
  showToast(DefaultBusEvents.error, payload as ToastPayload)
const showInfoToast = (payload?: unknown) =>
  showToast(DefaultBusEvents.info, payload as ToastPayload)

/*
  2. Pass the config as prop to the Toast component instance
*/
export default function Toasts() {
  const { palette } = useAppTheme()

  useEffect(() => {
    bus.on(DefaultBusEvents.success, showSuccessToast)
    bus.on(DefaultBusEvents.warning, showWarningToast)
    bus.on(DefaultBusEvents.error, showErrorToast)
    bus.on(DefaultBusEvents.info, showInfoToast)

    return () => {
      bus.off(DefaultBusEvents.success, showSuccessToast)
      bus.off(DefaultBusEvents.warning, showWarningToast)
      bus.off(DefaultBusEvents.error, showErrorToast)
      bus.off(DefaultBusEvents.info, showInfoToast)
    }
  }, [])

  return (
    <Toast
      config={{
        defaultToast: ({ props: { title, message, icon, messageType } }) => {
          // Fast solution, just for showcase, implement your own toast container
          return (
            <BaseToast
              text1={title}
              text2={message}
              renderLeadingIcon={() => (
                <View className={cn('flex items-center justify-center pl-4')}>{icon()}</View>
              )}
              style={{
                // currently not working
                borderLeftColor: {
                  [DefaultBusEvents.success]: palette.successMain,
                  [DefaultBusEvents.error]: palette.errorMain,
                  [DefaultBusEvents.warning]: palette.warningMain,
                  [DefaultBusEvents.info]: palette.secondaryMain,
                }[messageType],
              }}
            />
          )
        },
      }}
    />
  )
}
