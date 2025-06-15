import { NewEDocument } from '@modules/e-document/src/helpers/e-document'
import { FieldRecords } from 'mrz'
import { create } from 'zustand'
import { combine, createJSONStorage, persist } from 'zustand/middleware'

import { zustandStorage } from '@/store/helpers'

import { IdentityItem } from './Identity'

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
      (set, get) => ({
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
          const newIdentities = get().identities
          newIdentities.push(item)

          set({
            identities: newIdentities,
          })
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
            // TODO: check if parsed value is string[]
            return (JSON.parse(value as string) as string[]).map(el =>
              IdentityItem.deserialize(el as string),
            )
          }

          if (key === 'testEDoc') {
            return NewEDocument.deserialize(value as string)
          }

          return value
        },
        replacer: (key, value) => {
          if (!value) return value

          if (key === 'identities') {
            return (value as IdentityItem[]).map(el => el.serialize())
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
