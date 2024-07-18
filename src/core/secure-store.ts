import * as SecureStore from 'expo-secure-store'
import * as React from 'react'
import { Platform } from 'react-native'

export enum SecureStoreKeys {
  Token = 'token',
  Session = 'session',
  Password = 'password',
}

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void]

function useAsyncState<T>(initialValue: [boolean, T | null] = [true, null]): UseStateHook<T> {
  return React.useReducer(
    (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
    initialValue,
  ) as UseStateHook<T>
}

export async function getStorageItemAsync(key: SecureStoreKeys) {
  if (Platform.OS === 'web') {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key)
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e)
    }

    return null
  } else {
    return await SecureStore.getItemAsync(key)
  }
}

export async function setStorageItemAsync(key: SecureStoreKeys, value: string | null) {
  if (Platform.OS === 'web') {
    try {
      if (value === null) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, value)
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e)
    }
  } else {
    if (value == null) {
      await SecureStore.deleteItemAsync(key)
    } else {
      await SecureStore.setItemAsync(key, value)
    }
  }
}

export function useStorageState(key: SecureStoreKeys): UseStateHook<string> {
  // Public
  const [state, setState] = useAsyncState<string>()

  // Get
  React.useEffect(() => {
    getStorageItemAsync(key).then(value => {
      setState(value)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // Set
  const setValue = React.useCallback(
    (value: string | null) => {
      setState(value)
      setStorageItemAsync(key, value)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  )

  return [state, setValue]
}
