// import { groth16Prove } from '@iden3/react-native-rapidsnark'
import { Buffer } from 'buffer'
import { useCallback } from 'react'
import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { generateAuthWtns, multiply, plus } from 'rn-wtnscalcs'

import { ErrorHandler } from '@/core'
import { UiButton } from '@/ui'

const authInputs = {
  eventData: '0x8afdb6ca6860f199ebf60df54e6b36f77e51955aaec34b09a1316bd20bc445',
  eventID: '0x77fabbc6cb41a11d4fb6918696b3550d5d602f252436dd587f9065b7c4e62b',
  revealPkIdentityHash: 0,
  skIdentity: '0x0d985b1ed5bc06b0b9b1cff0811009d1d74f15b0e67ac7c85ca9f27ad2259821',
}

export default function ZKP() {
  // const [assets] = useAssets([require('@assets/circuits/auth/circuit_final.zkey')])

  // const { executeWitnessCalculator } = useWitnessCalc()

  const insets = useSafeAreaInsets()

  const executeZKP = useCallback(async () => {
    // if (!assets?.[0] || !assets?.[1]) return

    try {
      // const res = await generateAuthWtns(JSON.stringify(authInputs))
      //
      // console.log(res)
      // const { proof, pub_signals } = await groth16Prove(assets[0], res)
      //
      // console.log(proof, pub_signals)
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error)
    }
  }, [])

  const runMultiply = async () => {
    console.log(multiply(2, 3))
  }

  const runPlus = async () => {
    console.log(plus(2, 3))
  }

  const runAuthCalc = async () => {
    try {
      const res = await generateAuthWtns(Buffer.from(JSON.stringify(authInputs)).toString('base64'))
      console.log(Buffer.from(res, 'base64'))
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error)
    }
  }

  return (
    <View
      style={{
        paddingTop: insets.top,
      }}
      className='flex-1'
    >
      <ScrollView>
        <View className='flex flex-1 items-center justify-center gap-4'>
          <UiButton onPress={executeZKP} title='Execute ZKP' />
          <UiButton onPress={runMultiply} title='runMultiply' />
          <UiButton onPress={runPlus} title='runPlus' />
          <UiButton onPress={runAuthCalc} title='runAuthCalc' />
        </View>
      </ScrollView>
    </View>
  )
}
