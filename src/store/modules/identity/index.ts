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
      },
      (set, get) => ({
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
      version: 9,
      storage: createJSONStorage(() => zustandStorage, {
        reviver: (key, value) => {
          if (!value) return value

          if (key === 'identities') {
            // TODO: check if parsed value is string[]
            return (value as string[]).map(el => IdentityItem.deserialize(el as string))
          }

          return value
        },
        replacer: (key, value) => {
          if (!value) return value

          if (key === 'identities') {
            return (value as IdentityItem[]).map(el => el.serialize())
          }

          return value
        },
      }),

      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true)
      },

      partialize: state => ({
        identities: state.identities,
      }),
    },
  ),
)

export const identityStore = {
  useIdentityStore,
}
