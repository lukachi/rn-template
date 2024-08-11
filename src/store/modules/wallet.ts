import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { combine, createJSONStorage, persist } from 'zustand/middleware'

import { zustandSecureStorage } from '@/store/helpers'

const useWalletStore = create(
  persist(
    combine(
      {
        privateKey: '',
      },
      set => ({
        setPrivateKey: async (value: string) => {
          set({ privateKey: value })
        },
      }),
    ),
    {
      name: 'wallet',
      version: 1,
      // TODO: add web support? checking device?
      storage: createJSONStorage(() => zustandSecureStorage),

      partialize: state => ({ privateKey: state.privateKey }),
    },
  ),
)

const useIsHydrated = () => {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Note: This is just in case you want to take into account manual rehydration.
    // You can remove the following line if you don't need it.
    const unsubHydrate = useWalletStore.persist.onHydrate(() => setHydrated(false))

    const unsubFinishHydration = useWalletStore.persist.onFinishHydration(() => setHydrated(true))

    setHydrated(useWalletStore.persist.hasHydrated())

    return () => {
      unsubHydrate()
      unsubFinishHydration()
    }
  }, [])

  return hydrated
}

const useGeneratePrivateKey = () => {
  return async () => {
    return '0x...........'
  }
}

export const walletStore = {
  useWalletStore,

  useGeneratePrivateKey,
  useIsHydrated,
}
