import type { EDocument } from '@modules/e-document'
import { create } from 'zustand'
import { combine, createJSONStorage, persist } from 'zustand/middleware'

import { zustandSecureStorage } from '@/store/helpers'

const useIdentityStore = create(
  persist(
    combine(
      {
        documents: [] as EDocument[],

        _hasHydrated: false,
      },
      set => ({
        setHasHydrated: (value: boolean) => {
          set({
            _hasHydrated: value,
          })
        },
      }),
    ),
    {
      name: 'documents',
      version: 1,
      storage: createJSONStorage(() => zustandSecureStorage),

      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true)
      },

      partialize: state => ({ privateKey: state.documents }),
    },
  ),
)

export const identityStore = {
  useIdentityStore,
}
