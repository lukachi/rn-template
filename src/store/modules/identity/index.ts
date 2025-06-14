import { NewEDocument } from '@modules/e-document/src/helpers/e-document'
import type { ZKProof } from '@modules/rapidsnark-wrp'
import { FieldRecords } from 'mrz'
import { create } from 'zustand'
import { combine, createJSONStorage, persist } from 'zustand/middleware'

import { zustandStorage } from '@/store/helpers'

export type IdentityItem = {
  document: NewEDocument
  registrationProof: ZKProof
}

const useIdentityStore = create(
  persist(
    combine(
      {
        identities: [] as IdentityItem[],

        _hasHydrated: false,

        // TODO: remove me
        testEDoc: undefined as NewEDocument | undefined,
        testMRZ: undefined as FieldRecords | undefined,
      },
      set => ({
        // TODO: remove me
        setTestEDoc: (value: NewEDocument) => {
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
      version: 6,
      storage: createJSONStorage(() => zustandStorage, {
        reviver: (key, value) => {
          if (!value) return value

          if (key === 'identities') {
            return (value as { document: string; registrationProof: ZKProof }[]).map(item => ({
              document: NewEDocument.deserialize(item.document as string),
              registrationProof: item.registrationProof,
            }))
          }

          if (key === 'testEDoc') {
            return NewEDocument.deserialize(value as string)
          }

          return value
        },
        replacer: (key, value) => {
          if (!value) return value

          if (key === 'identities') {
            return (value as IdentityItem[]).map(item => ({
              document: item.document.serialize(),
              registrationProof: item.registrationProof,
            }))
          }

          if (key === 'testEDoc') {
            return value instanceof NewEDocument ? value.serialize() : value
          }

          return value
        },
      }),

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
