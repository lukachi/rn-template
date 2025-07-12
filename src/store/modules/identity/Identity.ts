import { NoirZKProof } from '@modules/noir'
import type { CircomZKProof } from '@modules/witnesscalculator'
import { getBigInt, JsonRpcProvider } from 'ethers'
import SuperJSON from 'superjson'

import { RARIMO_CHAINS } from '@/api/modules/rarimo'
import { Config } from '@/config'
import { createStateKeeperContract } from '@/helpers/contracts'
import { EDocument, EID, EPassport } from '@/utils/e-document/e-document'

// TODO: add checking if the passport need to be revoked
export abstract class IdentityItem {
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

  // eslint-disable-next-line unused-imports/no-unused-vars
  static deserialize(serialized: string): IdentityItem {
    throw new Error('Implement deserialize in derived classes')
  }

  static get stateKeeperContract() {
    return createStateKeeperContract(
      Config.STATE_KEEPER_CONTRACT_ADDRESS,
      new JsonRpcProvider(RARIMO_CHAINS[Config.RMO_CHAIN_ID].rpcEvm),
    )
  }

  // (len, icao_root, 0, pasport_hash, dg1_commitment, sk_hash)

  get publicKey(): string {
    throw new Error('Implement publicKey in derived classes')
  }
  get passportHash(): string {
    throw new Error('Implement passportHash in derived classes')
  }
  get dg1Commitment(): string {
    throw new Error('Implement dg1Commitment in derived classes')
  }
  get pkIdentityHash(): string {
    throw new Error('Implement pkIdentityHash in derived classes')
  }
  get identityKey(): string {
    throw new Error('Implement getIdentityKey in derived classes')
  }

  async getPassportInfo() {
    const sanitizedIdentityKey = this.identityKey.startsWith('0x')
      ? this.identityKey
      : '0x' + this.identityKey

    const sanitizedIdentityKeyBytes =
      '0x' + getBigInt(sanitizedIdentityKey).toString(16).padStart(64, '0')

    return await IdentityItem.stateKeeperContract.contractInstance.getPassportInfo(
      sanitizedIdentityKeyBytes,
    )
  }
}

export class NoirEIDIdentity extends IdentityItem {
  constructor(
    public document: EID,
    public registrationProof: NoirZKProof,
  ) {
    super(document, registrationProof)
  }

  serialize() {
    return SuperJSON.stringify({
      document: this.document.serialize(),
      registrationProof: this.registrationProof,
    })
  }

  static deserialize(serialized: string): NoirEIDIdentity {
    const deserialized = SuperJSON.parse<{
      document: string
      registrationProof: NoirZKProof
    }>(serialized)

    return new NoirEIDIdentity(
      EID.deserialize(deserialized.document),
      deserialized.registrationProof,
    )
  }

  // (len, icao_root, 0, pasport_hash, dg1_commitment, sk_hash)

  get publicKey(): string {
    throw new Error('EID does not have a public key')
  }
  get passportHash() {
    return this.registrationProof.pub_signals[2]
  }
  get dg1Commitment() {
    return this.registrationProof.pub_signals[3]
  }
  get pkIdentityHash() {
    return this.registrationProof.pub_signals[4]
  }
  get identityKey() {
    return this.passportHash
  }
}

// TODO: add checking if the passport need to be revoked
export class NoirEpassportIdentity extends IdentityItem {
  constructor(
    public document: EPassport,
    public registrationProof: NoirZKProof,
  ) {
    super(document, registrationProof)
  }

  serialize() {
    return SuperJSON.stringify({
      document: this.document.serialize(),
      registrationProof: this.registrationProof,
    })
  }

  static deserialize(serialized: string): NoirEpassportIdentity {
    const deserialized = SuperJSON.parse<{
      document: string
      registrationProof: NoirZKProof
    }>(serialized)

    return new NoirEpassportIdentity(
      EPassport.deserialize(deserialized.document),
      deserialized.registrationProof,
    )
  }

  get publicKey() {
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
  get identityKey() {
    return this.document.dg15Bytes?.length ? this.publicKey : this.passportHash
  }
}

// TODO: add checking if the passport need to be revoked
export class CircomEpassportIdentity extends IdentityItem {
  constructor(
    public document: EPassport,
    public registrationProof: CircomZKProof,
  ) {
    super(document, registrationProof)
  }

  serialize() {
    return SuperJSON.stringify({
      document: this.document.serialize(),
      registrationProof: this.registrationProof,
    })
  }

  static deserialize(serialized: string): NoirEpassportIdentity {
    const deserialized = SuperJSON.parse<{
      document: string
      registrationProof: NoirZKProof
    }>(serialized)

    return new NoirEpassportIdentity(
      EPassport.deserialize(deserialized.document),
      deserialized.registrationProof,
    )
  }

  get publicKey() {
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
  get identityKey() {
    return this.document.dg15Bytes?.length ? this.publicKey : this.passportHash
  }
}
