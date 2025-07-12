import { LocalCircomCircuitParams } from '@modules/witnesscalculator'

import { PrivateAuthGroth16 } from './types/Auth'

export class AuthCircuit {
  public circuitParams: LocalCircomCircuitParams

  constructor() {
    this.circuitParams = LocalCircomCircuitParams.fromName('auth')
  }

  calcWtns(inputs: PrivateAuthGroth16, datBytes: Uint8Array): Promise<Uint8Array> {
    return this.circuitParams.wtnsCalcMethod(
      datBytes,
      Buffer.from(
        JSON.stringify({
          eventID: '0x' + BigInt(inputs.eventID).toString(16),
          eventData: '0x' + inputs.eventData.toString(16),
          revealPkIdentityHash: inputs.revealPkIdentityHash,
          skIdentity: '0x' + inputs.skIdentity.toString(16).padStart(64, '0'),
        }),
      ),
    )
  }
}

export const authCircuit = new AuthCircuit()
