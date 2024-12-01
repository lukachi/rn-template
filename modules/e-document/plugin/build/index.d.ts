import type { ConfigPlugin } from '@expo/config-plugins'
export declare const withNfc: ConfigPlugin<{
  includeNdefEntitlement?: boolean
  nfcPermission?: boolean
  selectIdentifiers?: string[]
  systemCodes?: string[]
}>
export default withNfc
