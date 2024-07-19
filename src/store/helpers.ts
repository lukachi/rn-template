import type { StateStorage } from 'zustand/middleware'

import { getStorageItemAsync, setStorageItemAsync, storage } from '@/core'

export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    return storage.set(name, value)
  },
  getItem: name => {
    const value = storage.getString(name)
    return value ?? null
  },
  removeItem: name => {
    return storage.delete(name)
  },
}

export const zustandSecureStorage: StateStorage = {
  setItem: async (name, value): Promise<void> => {
    return await setStorageItemAsync(name, value)
  },
  getItem: async (name): Promise<string | null> => {
    const value = await getStorageItemAsync(name)

    return value ?? null
  },
  removeItem: async (name): Promise<void> => {
    return await setStorageItemAsync(name, null)
  },
}
