import { groth16Prove } from '@modules/rapidsnark-wrp'
import { groth16ProveWithZKeyFilePath } from '@modules/rapidsnark-wrp'
import type { CircomZKProof } from '@modules/witnesscalculator'
import { Buffer } from 'buffer'
import { ethers, toBeArray, zeroPadValue } from 'ethers'
import * as FileSystem from 'expo-file-system'
import { create } from 'zustand'
import { combine, createJSONStorage, persist } from 'zustand/middleware'

import { authorize, getChallenge, refresh } from '@/api/modules/auth'
import { Config } from '@/config'
import { sleep } from '@/helpers'
import { zustandSecureStorage } from '@/store/helpers'
import { identityStore } from '@/store/modules/identity'
import { localAuthStore } from '@/store/modules/local-auth'
import { uiPreferencesStore } from '@/store/modules/ui-preferences'
import { walletStore } from '@/store/modules/wallet'
import { authCircuit } from '@/utils/circuits/auth-circuit'

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
  const getPointsNullifier = walletStore.usePointsNullifier()

  return async (privateKey: string): Promise<CircomZKProof> => {
    const pkHex = `0x${privateKey}`

    const pointsNullifier = await getPointsNullifier(privateKey)

    const { data } = await getChallenge(zeroPadValue(toBeArray(pointsNullifier), 32))

    const challengeHex = ethers.hexlify(ethers.decodeBase64(data.challenge))

    const { zkeyLocalUri, datBytes } = await authCircuit.circuitParams.retrieveZkeyNDat()

    const authWtns = await authCircuit.calcWtns(
      {
        eventData: BigInt(challengeHex),
        eventID: Config.POINTS_SVC_ID,
        revealPkIdentityHash: 0,
        skIdentity: BigInt(pkHex),
      },
      datBytes,
    )

    if (!authWtns?.length) throw new TypeError('Auth witness not generated')

    let zkProofBytes: Uint8Array
    if (opts?.byFilePath) {
      zkProofBytes = await groth16ProveWithZKeyFilePath(authWtns, zkeyLocalUri)
    } else {
      const zkeyBase64 = await FileSystem.readAsStringAsync(zkeyLocalUri, {
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
  const getPointsNullifier = walletStore.usePointsNullifier()

  const genAuthProof = useAuthProof({
    byFilePath: true,
  })

  // TODO: change to state?
  return async (privateKey: string) => {
    const zkProof = await genAuthProof(privateKey)
    const pointsNullifier = await getPointsNullifier(privateKey)

    const { data: authTokens } = await authorize(
      zeroPadValue(toBeArray(pointsNullifier), 32),
      zkProof,
    )

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
