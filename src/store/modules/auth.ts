import { Buffer } from 'buffer'
import { useAssets } from 'expo-asset'
import * as FileSystem from 'expo-file-system'
import { generateAuthWtns } from 'rn-wtnscalcs'
import { create } from 'zustand'
import { combine, createJSONStorage, persist } from 'zustand/middleware'

import { groth16Prove } from '@/../modules/rapidsnark-wrp'
import { authorize, getChallenge } from '@/api/modules/auth'
import { Config } from '@/config'
import { sleep } from '@/helpers'
import { walletStore } from '@/store'
import { zustandSecureStorage } from '@/store/helpers'

const useAuthStore = create(
  persist(
    combine(
      {
        accessToken: '',
        refreshToken: '',
        isRefreshing: false,

        _hasHydrated: false,
      },
      set => ({
        setHasHydrated: (value: boolean) => {
          set({
            _hasHydrated: value,
          })
        },

        setTokens: async (accessToken: string, refreshToken: string) => {
          set({ accessToken: accessToken, refreshToken: refreshToken })
        },
        logout: () => {
          set({ accessToken: '', refreshToken: '' })
        },
        refresh: async (): Promise<string> => {
          set({ isRefreshing: true })
          await sleep(1000)

          const newAccessToken = 'my_new_access_token'
          const newRefreshToken = 'my_new_refresh_token'

          set({ accessToken: newAccessToken, refreshToken: newRefreshToken })
          set({ isRefreshing: false })

          return newAccessToken
        },
      }),
    ),
    {
      name: 'auth-store',
      version: 1,
      // TODO: add web support? checking device?
      storage: createJSONStorage(() => zustandSecureStorage),

      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true)
      },

      partialize: state => ({ accessToken: state.accessToken, refreshToken: state.refreshToken }),
    },
  ),
)

const useIsAuthorized = () => {
  const accessToken = useAuthStore(state => state.accessToken)

  return accessToken !== ''
}

const useLogin = () => {
  const [assets] = useAssets([require('@assets/circuits/auth/circuit_final.zkey')])
  const getPointsNullifierHex = walletStore.usePointsNullifierHex()
  const setTokens = useAuthStore(state => state.setTokens)

  // TODO: change to state?
  return async (privateKey: string) => {
    const zkeyAsset = assets?.[0]

    const pkHex = `0x${privateKey}`

    const pointsNullifierHex = await getPointsNullifierHex(privateKey)

    const { data } = await getChallenge(pointsNullifierHex)

    const challenge = Buffer.from(data.challenge, 'base64').toString('hex')

    const inputs = {
      eventData: `0x${challenge}`,
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

    const zkProofBase64 = await groth16Prove(authWtnsBase64, zkeyBase64)

    const zkProof = Buffer.from(zkProofBase64, 'base64').toString()

    const { data: authTokens } = await authorize(pointsNullifierHex, JSON.parse(zkProof))

    setTokens(authTokens.access_token.token, authTokens.refresh_token.token)
  }
}

export const authStore = {
  useAuthStore: useAuthStore,

  useLogin: useLogin,
  useIsAuthorized: useIsAuthorized,
}
