import Emittery from 'emittery'

import { DefaultToastPayload } from '@/ui/Toasts'

export const emitter = new Emittery<{
  error: Partial<DefaultToastPayload>
  warning: Partial<DefaultToastPayload>
  success: Partial<DefaultToastPayload>
  info: Partial<DefaultToastPayload>
}>()
