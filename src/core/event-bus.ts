import { EventEmitter } from '@distributedlab/tools'

import type { ToastPayload } from '@/ui/Toasts'

export enum DefaultBusEvents {
  error = 'error',
  warning = 'warning',
  success = 'success',
  info = 'info',
}

export const bus = new EventEmitter<{
  [DefaultBusEvents.success]: ToastPayload
  [DefaultBusEvents.error]: ToastPayload
  [DefaultBusEvents.warning]: ToastPayload
  [DefaultBusEvents.info]: ToastPayload
}>()
