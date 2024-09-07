import { groth16ProveWithZKeyFilePath } from '@modules/rapidsnark-wrp'
import { Buffer } from 'buffer'
import { ethers } from 'ethers'
import { useAssets } from 'expo-asset'
import * as FileSystem from 'expo-file-system'
import { create } from 'zustand'
import { combine, createJSONStorage, persist } from 'zustand/middleware'

import { calcWtnsAuth } from '@/../modules/witnesscalculator'
import { authorize, getChallenge, refresh } from '@/api/modules/auth'
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

          const { data } = await refresh()

          const newAccessToken = data.access_token
          const newRefreshToken = data.refresh_token

          set({ accessToken: newAccessToken, refreshToken: newRefreshToken })
          set({ isRefreshing: false })

          return newAccessToken
        },
      }),
    ),
    {
      name: 'auth-store',
      version: 1,
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

    const challengeHex = ethers.hexlify(ethers.decodeBase64(data.challenge))

    const inputs = {
      eventData: challengeHex,
      eventID: Config.POINTS_SVC_ID,
      revealPkIdentityHash: 0,
      skIdentity: pkHex,
    }

    const authWtns = await calcWtnsAuth(
      ethers.decodeBase64(datBase64),
      Buffer.from(JSON.stringify(inputs)),
    )

    if (!authWtns?.length) throw new TypeError('Auth witness not generated')

    if (!zkeyAsset?.localUri) throw new TypeError('Zkey asset not found')

    const zkeyFileInfo = await FileSystem.getInfoAsync(zkeyAsset.localUri)

    if (!zkeyFileInfo?.exists) throw new TypeError('Zkey file not found')

    console.log(FileSystem.documentDirectory)
    console.log(FileSystem.cacheDirectory)

    console.log(zkeyFileInfo.uri)

    const zkProofBytes = await groth16ProveWithZKeyFilePath(
      authWtns,
      zkeyFileInfo.uri, // .replace('file://', ''),
    )

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
