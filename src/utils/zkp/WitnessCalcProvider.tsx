import type { PropsWithChildren } from 'react'
import { useContext } from 'react'
import { createContext } from 'react'
import { View } from 'react-native'
import { useWebViewMessage } from 'react-native-react-bridge'
import { WebView } from 'react-native-webview'

import { ErrorHandler } from '@/core'
import { witnessStr } from '@/utils/zkp/witness'

import { WitnessRequestTypes, WitnessResponseTypes } from './enums'

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
    ref.current?.postMessage?.(
      JSON.stringify({
        type: WitnessRequestTypes.WitnessCalculatorRequest,
        data: {
          binary,
          inputs,
        },
      }),
    )

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
      <View>
        <WebView
          ref={ref}
          style={{ height: 0 }}
          source={{
            html: `
              <html>
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1" />
                    </head>
                    <body>
                      <h1>Silver area is a Webview</h1>
                    </body>
              </html>
            `,
          }}
          injectedJavaScriptBeforeContentLoaded={witnessStr}
          // source={{ html: WebApp }}
          allowFileAccessFromFileURLs
          allowUniversalAccessFromFileURLs
          allowFileAccess
          onMessage={onMessage}
          onError={ErrorHandler.process}
        />
      </View>
      {children}
    </witnessCalcContext.Provider>
  )
}
