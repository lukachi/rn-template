import { Buffer } from 'buffer'
import { useAssets } from 'expo-asset'
import * as FileSystem from 'expo-file-system'
import { calculateEventNullifierInt, generatePrivateKey } from 'rmo-identity'
import { generateAuthWtns } from 'rn-wtnscalcs'
import { create } from 'zustand'
import { combine, createJSONStorage, persist } from 'zustand/middleware'

import { groth16Prove } from '@/../modules/rapidsnark-wrp'
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

    return `0x${eventNullifierBN.toString(16).slice(-62)}`
  }
}

const useGenerateAuthProof = () => {
  const [assets] = useAssets([require('@assets/circuits/auth/circuit_final.zkey')])
  const getPointsNullifierHex = usePointsNullifierHex()

  // TODO: change to state?
  return async (privateKey: string) => {
    const zkeyAsset = assets?.[0]

    const pkHex = `0x${privateKey}`

    const hexString = await getPointsNullifierHex(privateKey)

    const inputs = {
      eventData: hexString,
      eventID: Config.POINTS_SVC_ID,
      revealPkIdentityHash: 0,
      skIdentity: pkHex,
    }

    const authWtnsBase64 = await generateAuthWtns(
      Buffer.from(JSON.stringify(inputs)).toString('base64'),
    )

    if (!zkeyAsset?.localUri) throw new TypeError('Zkey asset not found')

    const zkeyBase64 = await FileSystem.readAsStringAsync(zkeyAsset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    })

    return await groth16Prove(authWtnsBase64, zkeyBase64)
  }
}

export const walletStore = {
  useWalletStore,

  useGeneratePrivateKey,
  useGenerateAuthProof,
}
