import { Buffer } from 'buffer'
import { useAssets } from 'expo-asset'
import * as FileSystem from 'expo-file-system'
import { create } from 'zustand'
import { combine, createJSONStorage, persist } from 'zustand/middleware'

import { groth16Prove } from '@/../modules/rapidsnark-wrp'
import { calcWtnsAuth } from '@/../modules/witnesscalculator'
import { authorize, getChallenge } from '@/api/modules/auth'
import { Config } from '@/config'
import { sleep } from '@/helpers'
import { zustandSecureStorage } from '@/store/helpers'
import { walletStore } from '@/store/modules/wallet'

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
        setHasHydrated: (value: boolean): void => {
          set({
            _hasHydrated: value,
          })
        },

        setTokens: async (accessToken: string, refreshToken: string): Promise<void> => {
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
  const [assets] = useAssets([
    require('@assets/circuits/auth/circuit_final.zkey'),
    require('@assets/circuits/auth/auth.dat'),
  ])
  const getPointsNullifierHex = walletStore.usePointsNullifierHex()
  const setTokens = useAuthStore(state => state.setTokens)

  // TODO: change to state?
  return async (privateKey: string) => {
    const zkeyAsset = assets?.[0]
    const datAsset = assets?.[1]

    if (!datAsset?.localUri) throw new TypeError('Dat asset not found')

    const datBase64 = await FileSystem.readAsStringAsync(datAsset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    })

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

    const authWtns = await calcWtnsAuth(
      Buffer.from(datBase64, 'base64'),
      Buffer.from(JSON.stringify(inputs)),
    )

    if (!zkeyAsset?.localUri) throw new TypeError('Zkey asset not found')

    const zkeyBase64 = await FileSystem.readAsStringAsync(zkeyAsset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    })

    const zkProofBytes = await groth16Prove(authWtns, Buffer.from(zkeyBase64, 'base64'))

    const zkProof = Buffer.from(zkProofBytes).toString()

    const { data: authTokens } = await authorize(pointsNullifierHex, JSON.parse(zkProof))

    setTokens(authTokens.access_token.token, authTokens.refresh_token.token)
  }
}

const useLogout = () => {
  const logout = useAuthStore(state => state.logout)
  const deletePrivateKey = walletStore.useDeletePrivateKey()

  return () => {
    logout()
    deletePrivateKey()
  }
}

export const authStore = {
  useAuthStore: useAuthStore,

  useLogin: useLogin,
  useIsAuthorized: useIsAuthorized,
  useLogout: useLogout,
}
