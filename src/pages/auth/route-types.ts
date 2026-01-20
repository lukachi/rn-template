import { NativeStackScreenProps } from '@react-navigation/native-stack'

export type AuthStackParamsList = {
  Intro: undefined
  // SignIn: undefined
  SignUp: undefined
}

export type AuthStackScreenProps<T extends keyof AuthStackParamsList> = NativeStackScreenProps<
  AuthStackParamsList,
  T
>
