import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { DocType } from './utils/e-document'

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
  Tabs?: NavigatorScreenParams<AppTabParamsList>
  InviteOthers?: {
    tag?: string
  }
}

export type AppStackScreenProps<T extends keyof AppStackParamsList> = NativeStackScreenProps<
  AppStackParamsList,
  T
>

export type AppTabParamsList = {
  Documents: undefined
  Home: undefined
  Profile: undefined
  Scan:
    | {
        documentType?: DocType
      }
    | undefined
  PassportTests: undefined
}

export type AppTabScreenProps<T extends keyof AppTabParamsList> = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamsList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>

declare global {
  namespace ReactNavigation {
    /*eslint-disable-next-line @typescript-eslint/no-empty-object-type*/
    interface RootParamList extends RootStackParamList {}
  }
}
