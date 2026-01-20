import { AuthenticationType } from 'expo-local-authentication'
import { FingerprintIcon, ScanFaceIcon } from 'lucide-react-native'

import { localAuthStore } from '@/store/modules/local-auth'
import { UiLucideIcon } from '@/ui/icons/UiLucideIcon'

type Props = {
  size?: number
  color?: string
}

export default function BiometricsIcon({ ...rest }: Props) {
  const biometricTypes = localAuthStore.useLocalAuthStore(state => state.biometricAuthTypes)

  return {
    [AuthenticationType.FINGERPRINT]: (
      <UiLucideIcon {...rest} as={FingerprintIcon} className='text-foreground' size={50} />
    ),
    [AuthenticationType.FACIAL_RECOGNITION]: (
      <UiLucideIcon {...rest} as={ScanFaceIcon} className='text-foreground' size={50} />
    ),
    [AuthenticationType.IRIS]: (
      <UiLucideIcon {...rest} as={FingerprintIcon} className='text-foreground' size={50} />
    ),
  }[biometricTypes[0]]
}
