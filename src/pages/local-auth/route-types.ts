import { NativeStackScreenProps } from '@react-navigation/native-stack'

export type LocalAuthStackParamsList = {
  EnableBiometrics: undefined
  EnablePasscode: undefined
  Lockscreen: undefined
  SetPasscode: undefined
}

export type LocalAuthStackScreenProps<T extends keyof LocalAuthStackParamsList> =
  NativeStackScreenProps<LocalAuthStackParamsList, T>
