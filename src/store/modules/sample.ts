import { create } from 'zustand'
import { combine, createJSONStorage, persist } from 'zustand/middleware'

import { zustandStorage } from '@/store/helpers'

const useSampleStore = create(
  persist(
    combine(
      {
        state1: 'state1',
        state2: 'state2',
        nested: { counter: 0 },
      },
      set => ({
        updateState1: (value: string) => set({ state1: value }),
        updateState2: (value: string) => set({ state2: value }),
        updateNestedCounter: (value: number) =>
          set(state => ({
            nested: { ...state.nested, counter: value },
          })),
      }),
    ),
    {
      name: 'sample-store',
      storage: createJSONStorage(() => zustandStorage),

      partialize: state => ({ state1: state.state1 }),
    },
  ),
)

const useState1Getter = () => {
  return useSampleStore(state => `${state.state1}-getter`)
}

const useState2Getter = () => {
  return useSampleStore(state => `${state.state2}-getter`)
}

export const sampleStore = {
  useSampleStore,
  useState1Getter,
  useState2Getter,
}
