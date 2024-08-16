import { Buffer } from 'buffer'
import { calculateEventNullifierInt, generatePrivateKey } from 'rmo-identity'
import { create } from 'zustand'
import { combine, createJSONStorage, persist } from 'zustand/middleware'

import { Config } from '@/config'
import { zustandSecureStorage } from '@/store/helpers'

const useWalletStore = create(
  persist(
    combine(
      {
        privateKey: '',

        _hasHydrated: false,
      },
      set => ({
        setHasHydrated: (value: boolean) => {
          set({
            _hasHydrated: value,
          })
        },
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

      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true)
      },

      partialize: state => ({ privateKey: state.privateKey }),
    },
  ),
)

const useGeneratePrivateKey = () => {
  return async () => {
    const pkBase64 = await generatePrivateKey()

    return Buffer.from(pkBase64, 'base64').toString('hex')
  }
}

const usePointsNullifierHex = () => {
  return async (pkHex: string) => {
    const eventNullifierInt = await calculateEventNullifierInt(Config.POINTS_SVC_ID, pkHex)

    const eventNullifierBN = BigInt(eventNullifierInt)

    return `0x${eventNullifierBN.toString(16).padStart(64, '0')}`
  }
}

export const walletStore = {
  useWalletStore,

  useGeneratePrivateKey,
  usePointsNullifierHex,
}
