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

  return <></>
}

export default webViewRender(<WebApp />)
