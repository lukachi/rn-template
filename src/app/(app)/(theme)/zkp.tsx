import ZKP from '@/components/ZKP'
import { WitnessCalcProvider } from '@/utils/zkp/WitnessCalcProvider'

export default function ZKPScreen() {
  return (
    <WitnessCalcProvider>
      <ZKP />
    </WitnessCalcProvider>
    // <TestIdentitySDK />
  )
}
