import { LocalCircuitParams } from '@modules/witnesscalculator'

import { PrivateAuthGroth16 } from './types/Auth'

export class AuthCircuit {
  public circuitParams: LocalCircuitParams

  constructor() {
    this.circuitParams = LocalCircuitParams.fromName('auth')
  }

  calcWtns(inputs: PrivateAuthGroth16, datBytes: Uint8Array): Promise<Uint8Array> {
    return this.circuitParams.wtnsCalcMethod(datBytes, Buffer.from(JSON.stringify(inputs)))
  }
}

export const authCircuit = new AuthCircuit()
