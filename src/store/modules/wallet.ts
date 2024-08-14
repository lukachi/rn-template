import { Buffer } from 'buffer'
import { useAssets } from 'expo-asset'
import * as FileSystem from 'expo-file-system'
import { useEffect, useState } from 'react'
import { generatePrivateKey } from 'rmo-identity'
import { generateAuthWtns } from 'rn-wtnscalcs'
import { create } from 'zustand'
import { combine, createJSONStorage, persist } from 'zustand/middleware'

import { groth16Prove } from '@/../modules/rapidsnark-wrp'
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
    const pkBase64 = await generatePrivateKey()

    const decodedPk = Buffer.from(pkBase64, 'base64').toString('hex')

    return decodedPk
  }
}

const authInputs = {
  eventData: '0x8afdb6ca6860f199ebf60df54e6b36f77e51955aaec34b09a1316bd20bc445',
  eventID: '0x77fabbc6cb41a11d4fb6918696b3550d5d602f252436dd587f9065b7c4e62b',
  revealPkIdentityHash: 0,
  skIdentity: '0x0d985b1ed5bc06b0b9b1cff0811009d1d74f15b0e67ac7c85ca9f27ad2259821',
}

const useGenerateAuthWtns = () => {
  return async () => {
    const authWtnsBase64 = await generateAuthWtns(
      Buffer.from(JSON.stringify(authInputs)).toString('base64'),
    )

    return authWtnsBase64
  }
}

const useGenerateAuthProof = () => {
  const [assets] = useAssets([require('@assets/circuits/auth/circuit_final.zkey')])

  return async (wtnsBase64: string) => {
    const zkeyAsset = assets?.[0]

    if (!zkeyAsset?.localUri) throw new TypeError('Zkey asset not found')

    const zkeyBase64 = await FileSystem.readAsStringAsync(zkeyAsset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    })

    const authProofBase64 = await groth16Prove(wtnsBase64, zkeyBase64)

    return authProofBase64
  }
}

export const walletStore = {
  useWalletStore,

  useIsHydrated,

  useGeneratePrivateKey,
  useGenerateAuthWtns,
  useGenerateAuthProof,
}
