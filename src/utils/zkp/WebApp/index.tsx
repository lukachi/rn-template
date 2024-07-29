import { emit, useNativeMessage, webViewRender } from 'react-native-react-bridge/lib/web'

import { WitnessRequestTypes, WitnessResponseTypes } from '@/utils/zkp/enums'

function WebApp() {
  useNativeMessage(message => {
    if (message.type === WitnessRequestTypes.WitnessCalculatorRequest) {
      emit({
        type: WitnessResponseTypes.WitnessCalculatorResponse,
        data: message.data,
      })
    }
  })

  return (
    <html>
      <head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </head>
      <body>
        <h1>Silver area is a Webview</h1>
      </body>
    </html>
  )
}

export default webViewRender(<WebApp />)
