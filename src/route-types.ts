import type { NavigatorScreenParams } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { AppStackParamsList } from './pages/app/route-types'
import { AuthStackParamsList } from './pages/auth/route-types'
import { LocalAuthStackParamsList } from './pages/local-auth/route-types'

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamsList>
  LocalAuth: NavigatorScreenParams<LocalAuthStackParamsList>
  App: NavigatorScreenParams<AppStackParamsList>
}

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>

declare global {
  namespace ReactNavigation {
    /*eslint-disable-next-line @typescript-eslint/no-empty-object-type*/
    interface RootParamList extends RootStackParamList {}
  }
}
