import type { ZKProof } from '@modules/rapidsnark-wrp'
import { groth16Prove } from '@modules/rapidsnark-wrp'
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
import { identityStore } from '@/store/modules/identity'
import { localAuthStore } from '@/store/modules/local-auth'
import { uiPreferencesStore } from '@/store/modules/ui-preferences'
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

const useAuthProof = (opts?: { byFilePath?: boolean }) => {
  const [assets] = useAssets([
    require('@assets/circuits/auth/circuit_final.zkey'),
    require('@assets/circuits/auth/auth.dat'),
  ])
  const getPointsNullifierHex = walletStore.usePointsNullifierHex()

  return async (privateKey: string): Promise<ZKProof> => {
    const pkHex = `0x${privateKey}`

    const zkeyAsset = assets?.[0]
    const datAsset = assets?.[1]

    if (!datAsset?.localUri) throw new TypeError('Dat asset not found')

    const datBase64 = await FileSystem.readAsStringAsync(datAsset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    })

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

    let zkProofBytes: Uint8Array
    if (opts?.byFilePath) {
      zkProofBytes = await groth16ProveWithZKeyFilePath(
        authWtns,
        zkeyFileInfo.uri.replace('file://', ''),
      )
    } else {
      const zkeyBase64 = await FileSystem.readAsStringAsync(zkeyAsset.localUri, {
        encoding: FileSystem.EncodingType.Base64,
      })

      zkProofBytes = await groth16Prove(authWtns, ethers.decodeBase64(zkeyBase64))
    }

    const zkProof = Buffer.from(zkProofBytes).toString()

    return JSON.parse(zkProof)
  }
}

const useLogin = () => {
  const setTokens = useAuthStore(state => state.setTokens)
  const getPointsNullifierHex = walletStore.usePointsNullifierHex()

  const genAuthProof = useAuthProof({
    byFilePath: true,
  })

  // TODO: change to state?
  return async (privateKey: string) => {
    const zkProof = await genAuthProof(privateKey)
    const pointsNullifierHex = await getPointsNullifierHex(privateKey)

    const { data: authTokens } = await authorize(pointsNullifierHex, zkProof)

    setTokens(authTokens.access_token.token, authTokens.refresh_token.token)
  }
}

const useLogout = () => {
  const logout = useAuthStore(state => state.logout)

  const deletePrivateKey = walletStore.useDeletePrivateKey()
  const clearDocumentsCardUi = uiPreferencesStore.useUiPreferencesStore(
    state => state.clearDocumentsCardUi,
  )
  const clearIdentities = identityStore.useIdentityStore(state => state.clearIdentities)
  const resetLocalAuthStore = localAuthStore.useLocalAuthStore(state => state.resetStore)

  return async () => {
    logout()
    await Promise.all([
      deletePrivateKey(),
      clearIdentities(),
      clearDocumentsCardUi(),
      resetLocalAuthStore(),
    ])
  }
}

export const authStore = {
  useAuthStore: useAuthStore,

  useAuthProof: useAuthProof,
  useLogin: useLogin,
  useIsAuthorized: useIsAuthorized,
  useLogout: useLogout,
}
