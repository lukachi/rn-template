import { ZKProof } from '@modules/rapidsnark-wrp'
import { getBigInt, JsonRpcProvider, zeroPadValue } from 'ethers'
import SuperJSON from 'superjson'

import { RARIMO_CHAINS } from '@/api/modules/rarimo'
import { Config } from '@/config'
import { createStateKeeperContract } from '@/helpers/contracts'
import { EDocument } from '@/utils/e-document/e-document'

// TODO: add checking if the passport need to be revoked
export class IdentityItem {
  constructor(
    public document: EDocument,
    public registrationProof: ZKProof,
  ) {}

  serialize() {
    return SuperJSON.stringify({
      document: this.document.serialize(),
      registrationProof: this.registrationProof,
    })
  }

  static deserialize(serialized: string): IdentityItem {
    const deserialized = SuperJSON.parse<{
      document: string
      registrationProof: ZKProof
    }>(serialized)

    return new IdentityItem(
      EDocument.deserialize(deserialized.document),
      deserialized.registrationProof,
    )
  }

  static get stateKeeperContract() {
    return createStateKeeperContract(
      Config.STATE_KEEPER_CONTRACT_ADDRESS,
      new JsonRpcProvider(RARIMO_CHAINS[Config.RMO_CHAIN_ID].rpcEvm),
    )
  }

  get passportInfoKeyBytes(): string {
    const passportInfoKeyBigIntString = this.document.dg15Bytes?.length
      ? this.registrationProof.pub_signals[0]
      : this.registrationProof.pub_signals[1]

    const passportInfoKeyBytes = zeroPadValue(
      '0x' + getBigInt(passportInfoKeyBigIntString).toString(16),
      32,
    )

    return passportInfoKeyBytes
  }

  get passportKey() {
    return this.registrationProof.pub_signals[0]
  }
  get passportHash() {
    return this.registrationProof.pub_signals[1]
  }
  get dg1Commitment() {
    return this.registrationProof.pub_signals[2]
  }
  get pkIdentityHash() {
    return this.registrationProof.pub_signals[3]
  }

  async getPassportInfo() {
    try {
      return await IdentityItem.stateKeeperContract.contractInstance.getPassportInfo(
        this.passportInfoKeyBytes,
      )
    } catch (error) {
      console.error('getPassportInfo', error)
      return null
    }
  }
}
