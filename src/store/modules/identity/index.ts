import type { EDocument } from '@modules/e-document'
import type { ZKProof } from '@modules/rapidsnark-wrp'
import { create } from 'zustand'
import { combine, createJSONStorage, persist } from 'zustand/middleware'

import { zustandStorage } from '@/store/helpers'

export type IdentityItem = {
  document: EDocument
  registrationProof: ZKProof
}

const useIdentityStore = create(
  persist(
    combine(
      {
        identities: [] as IdentityItem[],

        _hasHydrated: false,
      },
      set => ({
        setHasHydrated: (value: boolean) => {
          set({
            _hasHydrated: value,
          })
        },

        addIdentity: (item: IdentityItem) => {
          set(state => ({
            identities: [
              ...state.identities,
              {
                document: item.document,
                registrationProof: item.registrationProof,
              },
            ],
          }))
        },
      }),
    ),
    {
      name: 'documents',
      version: 1,
      storage: createJSONStorage(() => zustandStorage),

      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true)
      },

      partialize: state => ({ identities: state.identities }),
    },
  ),
)

export const identityStore = {
  useIdentityStore,
}
