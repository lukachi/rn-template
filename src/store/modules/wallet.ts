import { babyJub, ffUtils, Hex, Poseidon, poseidon, PublicKey } from '@iden3/js-crypto'
import { Buffer } from 'buffer'
import { randomBytes } from 'ethers'
import { useMemo } from 'react'
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

const usePublicKeyHash = () => {
  const publicKey = usePublicKeyKey()

  return useMemo(() => {
    const hash = poseidon.hash(publicKey.p)

    return ffUtils.beInt2Buff(hash, 32)
  }, [publicKey.p])
}

const usePointsNullifier = () => {
  return async (pkHex: string) => {
    const secretKey = BigInt(`0x${pkHex}`) % Poseidon.F.p

    const secretKeyHash = poseidon.hash([secretKey])

    const eventIDInt = BigInt(Config.POINTS_SVC_ID)

    return poseidon.hash([secretKey, secretKeyHash, eventIDInt])
  }
}

const useRegistrationChallenge = () => {
  const publicKeyHash = usePublicKeyHash()

  return useMemo(() => {
    return publicKeyHash.slice(-8)
  }, [publicKeyHash])
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
  usePointsNullifier: usePointsNullifier,
  useDeletePrivateKey,
  usePublicKeyKey,
  usePublicKeyHash,
  useRegistrationChallenge,
}
