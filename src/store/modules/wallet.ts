import { babyJub, ffUtils, Hex, PublicKey } from '@iden3/js-crypto'
import { calculateEventNullifierInt } from '@modules/rarime-sdk'
import { Buffer } from 'buffer'
import { randomBytes } from 'ethers'
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
        setPrivateKey: (value: string): void => {
          set({ privateKey: value })
        },
      }),
    ),
    {
      name: 'wallet',
      version: 1,
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
    return Buffer.from(randomBytes(32)).toString('hex')
  }
}

const usePublicKeyKey = () => {
  const privateKeyHex = useWalletStore(state => state.privateKey)

  const skBuff = Hex.decodeString(privateKeyHex)
  const skBig = ffUtils.beBuff2int(skBuff)

  const point = babyJub.mulPointEScalar(babyJub.Base8, skBig)

  return new PublicKey(point)
}

const usePointsNullifierHex = () => {
  return async (pkHex: string) => {
    const eventNullifierIntStr = await calculateEventNullifierInt(Config.POINTS_SVC_ID, pkHex)

    const eventNullifierBN = BigInt(eventNullifierIntStr)

    return `0x${eventNullifierBN.toString(16).padStart(64, '0')}`
  }
}

const useDeletePrivateKey = () => {
  const setPrivateKey = useWalletStore(state => state.setPrivateKey)

  return () => {
    return setPrivateKey('')
  }
}

export const walletStore = {
  useWalletStore,

  useGeneratePrivateKey: useGeneratePrivateKey,
  usePointsNullifierHex: usePointsNullifierHex,
  useDeletePrivateKey,
  usePublicKeyKey,
}
