import type { PropsWithChildren } from 'react'
import { useContext } from 'react'
import { createContext } from 'react'
import { useWebViewMessage } from 'react-native-react-bridge'
import { WebView } from 'react-native-webview'

import { ErrorHandler } from '@/core'

import { WitnessRequestTypes, WitnessResponseTypes } from './enums'
import WebApp from './WebApp'

const witnessCalcContext = createContext<{
  executeWitnessCalculator: <Inputs>(binary: Uint8Array, inputs: Inputs) => Promise<string>
}>({
  executeWitnessCalculator: async () => {
    throw new TypeError('not implemented')
  },
})

export const useWitnessCalc = () => {
  return useContext(witnessCalcContext)
}

export const WitnessCalcProvider = ({ children }: PropsWithChildren) => {
  let promiseResolver: any

  const { ref, onMessage, emit } = useWebViewMessage(message => {
    if (message.type === WitnessResponseTypes.WitnessCalculatorResponse) {
      promiseResolver(message.data)
    }
  })

  async function executeWitnessCalculator<Inputs>(
    binary: Uint8Array,
    inputs: Inputs,
  ): Promise<string> {
    emit({
      type: WitnessRequestTypes.WitnessCalculatorRequest,
      data: {
        binary,
        inputs,
      },
    })

    return new Promise(resolve => {
      promiseResolver = resolve
    })
  }

  return (
    <witnessCalcContext.Provider
      value={{
        executeWitnessCalculator,
      }}
    >
      <WebView
        ref={ref}
        source={{ html: WebApp }}
        onMessage={onMessage}
        onError={ErrorHandler.process}
      />
      {children}
    </witnessCalcContext.Provider>
  )
}
