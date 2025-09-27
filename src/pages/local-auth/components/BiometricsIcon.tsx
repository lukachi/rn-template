import { AuthenticationType } from 'expo-local-authentication'
import { FingerprintIcon, ScanFaceIcon } from 'lucide-react-native'
import { ComponentProps } from 'react'

import { localAuthStore } from '@/store'
import { cn } from '@/theme'
import { UiLucideIcon } from '@/ui/icons/UiLucideIcon'

export default function BiometricsIcon({
  className,
  ...rest
}: Omit<ComponentProps<typeof UiLucideIcon>, 'as'>) {
  const biometricTypes = localAuthStore.useLocalAuthStore(state => state.biometricAuthTypes)

  const commonClassName = cn('size-13 text-foreground')

  return {
    [AuthenticationType.FINGERPRINT]: (
      <UiLucideIcon {...rest} as={FingerprintIcon} className={cn(commonClassName, className)} />
    ),
    [AuthenticationType.FACIAL_RECOGNITION]: (
      <UiLucideIcon {...rest} as={ScanFaceIcon} className={cn(commonClassName, className)} />
    ),
    [AuthenticationType.IRIS]: (
      <UiLucideIcon {...rest} as={FingerprintIcon} className={cn(commonClassName, className)} />
    ),
  }[biometricTypes[0]]
}
