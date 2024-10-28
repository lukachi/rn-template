import { AuthenticationType } from 'expo-local-authentication'

import { localAuthStore } from '@/store'
import { useAppTheme } from '@/theme'
import { UiIcon } from '@/ui'

type Props = {
  size?: number
  color?: string
}

export default function BiometricsIcon({ ...rest }: Props) {
  const { palette } = useAppTheme()
  const biometricTypes = localAuthStore.useLocalAuthStore(state => state.biometricAuthTypes)

  return {
    [AuthenticationType.FINGERPRINT]: (
      <UiIcon customIcon='fingerprintIcon' size={50} color={palette.baseWhite} {...rest} />
    ),
    [AuthenticationType.FACIAL_RECOGNITION]: (
      <UiIcon
        libIcon='MaterialCommunityIcons'
        name='face-recognition'
        size={50}
        color={palette.baseWhite}
        {...rest}
      />
    ),
    [AuthenticationType.IRIS]: (
      <UiIcon customIcon='fingerprintIcon' size={50} color={palette.baseWhite} {...rest} />
    ),
  }[biometricTypes[0]]
}
