import { NoirZKProof } from '@modules/noir'
import type { CircomZKProof } from '@modules/witnesscalculator'
import { getBigInt, JsonRpcProvider } from 'ethers'
import SuperJSON from 'superjson'

import { RARIMO_CHAINS } from '@/api/modules/rarimo'
import { Config } from '@/config'
import { createStateKeeperContract } from '@/helpers/contracts'
import { EDocument, EID, EPassport } from '@/utils/e-document/e-document'

// TODO: add checking if the passport need to be revoked
export class IdentityItem {
  constructor(
    public document: EDocument,
    public registrationProof: CircomZKProof | NoirZKProof,
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
      registrationProof: CircomZKProof
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

  // (len, icao_root, 0, pasport_hash, dg1_commitment, sk_hash)

  get publicKey() {
    if (this.document instanceof EID) throw new Error('EID does not have a public key')

    return this.registrationProof.pub_signals[0]
  }
  get passportHash() {
    if (this.document instanceof EID) return this.registrationProof.pub_signals[2]

    return this.registrationProof.pub_signals[1]
  }
  get dg1Commitment() {
    if (this.document instanceof EID) return this.registrationProof.pub_signals[3]

    return this.registrationProof.pub_signals[2]
  }
  get pkIdentityHash() {
    if (this.document instanceof EID) return this.registrationProof.pub_signals[4]

    return this.registrationProof.pub_signals[3]
  }

  async getPassportInfo() {
    try {
      const passportInfoKey = (() => {
        if (this.document instanceof EPassport) {
          return this.document.dg15Bytes?.length ? this.publicKey : this.passportHash
        }

        return this.passportHash.startsWith('0x') ? this.passportHash : '0x' + this.passportHash
      })()

      const passportInfoKeyBytes = '0x' + getBigInt(passportInfoKey).toString(16).padStart(64, '0')

      return await IdentityItem.stateKeeperContract.contractInstance.getPassportInfo(
        passportInfoKeyBytes,
      )
    } catch (error) {
      console.error('getPassportInfo', error)
      return null
    }
  }
}
