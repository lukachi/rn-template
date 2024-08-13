import { create } from 'zustand'
import { combine, createJSONStorage, persist } from 'zustand/middleware'

import { sleep } from '@/helpers'
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

        login: async () => {
          set({ accessToken: 'my_access_token', refreshToken: 'my_refresh_token' })
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

export const authStore = {
  useAuthStore,
  useIsAuthorized,
}
