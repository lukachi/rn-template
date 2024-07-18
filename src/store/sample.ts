import { create } from 'zustand'
import { combine } from 'zustand/middleware'

const useSampleStore = create(
  combine(
    {
      state1: 'state1',
      state2: 'state2',
    },
    set => ({
      updateState1: (value: string) => set({ state1: value }),
      updateState2: (value: string) => set({ state2: value }),
    }),
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
