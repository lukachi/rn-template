import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/core'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

import { RootStackParamList, RootStackScreenProps } from '@/route-types'

export type AppStackParamsList = {
  Tabs?: NavigatorScreenParams<AppTabParamsList>
}

export type AppStackScreenProps<T extends keyof AppStackParamsList> = NativeStackScreenProps<
  AppStackParamsList,
  T
>

export type AppTabParamsList = {
  Home: undefined
  Profile: undefined
}

export type AppTabScreenProps<T extends keyof AppTabParamsList> = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamsList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>
