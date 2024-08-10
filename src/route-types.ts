import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { CompositeScreenProps, NavigatorScreenParams, Route } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamsList>
  LocalAuth: NavigatorScreenParams<LocalAuthStackParamsList>
  App: NavigatorScreenParams<AppStackParamsList>
}

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>

export type AuthStackParamsList = {
  Intro: undefined
  CreateWallet: { isImporting: boolean } | undefined
}

export type AuthStackScreenProps<T extends keyof AuthStackParamsList> = NativeStackScreenProps<
  AuthStackParamsList,
  T
>

export type LocalAuthStackParamsList = {
  EnableBiometrics: undefined
  EnablePasscode: undefined
  Lockscreen: undefined
  SetPasscode: undefined
}

export type LocalAuthStackScreenProps<T extends keyof LocalAuthStackParamsList> =
  NativeStackScreenProps<LocalAuthStackParamsList, T>

export type AppStackParamsList = {
  UiKit: undefined
  Fetching: undefined
  Localization: undefined
}

export type AppStackScreenProps<T extends keyof AppStackParamsList> = NativeStackScreenProps<
  AppStackParamsList,
  T
>

export type UiKitTabParamList = {
  Common: undefined
  Zkp: undefined
  Colors: undefined
  Typography: undefined
}

export type UiKitTabScreenProps<T extends keyof UiKitTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<UiKitTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
