import { useCallback } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ErrorHandler } from '@/core'
import { UiButton } from '@/ui'

const authInputs = {
  eventData: '0x8afdb6ca6860f199ebf60df54e6b36f77e51955aaec34b09a1316bd20bc445',
  eventID: '0x77fabbc6cb41a11d4fb6918696b3550d5d602f252436dd587f9065b7c4e62b',
  revealPkIdentityHash: 0,
  skIdentity: '0x0d985b1ed5bc06b0b9b1cff0811009d1d74f15b0e67ac7c85ca9f27ad2259821',
}

export default function ZKP() {
  // const [assets] = useAssets([
  // require('@assets/circuits/auth/auth.wasm'),
  // require('@assets/circuits/auth/circuit_final.zkey'),
  // require('@assets/circuits/auth/witness.wtns'),
  // ])

  // const { executeWitnessCalculator } = useWitnessCalc()

  const executeZKP = useCallback(async () => {
    // if (!assets?.[0] || !assets?.[1]) return

    try {
      // const result = await executeWitnessCalculator(assets[0], authInputs)
      // console.log(result)
      // console.log(rapidsnark)
      // const { proof, pub_signals } = await rapidsnark.groth16Prove(assets[1], result)
      // console.log(proof, pub_signals)
      // const wtnsCalc = await wc(authWasm)
      // const wtnsCalc = await wc(authWasm)
      // const buff = await wtnsCalc.calculateWTNSBin(input, 0)
      // console.log(buff)
      // load wasm
      // use witness calculator
      // use groth16 prover
      // log ZKProof
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error)
    }
  }, [])

  return (
    <View className='flex-1'>
      <SafeAreaView className=''>
        <View className='flex flex-1 items-center justify-center'>
          <UiButton onPress={executeZKP} title='Execute ZKP' />
        </View>
      </SafeAreaView>
    </View>
  )
}
