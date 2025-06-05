import type { EDocument } from '@modules/e-document'
import type { ZKProof } from '@modules/rapidsnark-wrp'
import { FieldRecords } from 'mrz'
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

        // TODO: remove me
        testEDoc: undefined as EDocument | undefined,
        testMRZ: undefined as FieldRecords | undefined,
      },
      set => ({
        // TODO: remove me
        setTestEDoc: (value: EDocument) => {
          set({
            testEDoc: value,
          })
        },
        // TODO: remove me
        setTestMRZ: (value: FieldRecords) => {
          set({
            testMRZ: value,
          })
        },

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
        clearIdentities: () => set({ identities: [] }),
      }),
    ),
    {
      name: 'documents',
      version: 2,
      storage: createJSONStorage(() => zustandStorage),

      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true)
      },

      partialize: state => ({
        identities: state.identities,
        testEDoc: state.testEDoc,
        testMRZ: state.testMRZ,
      }),
    },
  ),
)

export const identityStore = {
  useIdentityStore,
}
