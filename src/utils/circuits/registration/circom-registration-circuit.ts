import { groth16ProveWithZKeyFilePath } from '@modules/rapidsnark-wrp'
import { CircomZKProof, ExternalCircomCircuitParams } from '@modules/witnesscalculator'

import { extractRawPubKey } from '../../e-document/helpers/misc'
import { PrivateRegisterIdentityBuilderGroth16 } from '../types/RegisterIdentityBuilder'
import { EPassportBasedRegistrationCircuit } from './registration-circuit'

export class CircomEPassportBasedRegistrationCircuit extends EPassportBasedRegistrationCircuit {
  get circuitParams(): ExternalCircomCircuitParams {
    return ExternalCircomCircuitParams.fromName(this.name)
  }

  async prove(
    params: Pick<
      PrivateRegisterIdentityBuilderGroth16,
      'skIdentity' | 'slaveMerkleRoot' | 'slaveMerkleInclusionBranches'
    >,
  ): Promise<CircomZKProof> {
    const { datBytes, zkeyLocalUri } = await this.circuitParams.retrieveZkeyNDat({
      onDownloadStart() {},
      onDownloadingProgress(_) {},
      onFailed(_) {},
      onLoaded() {},
    })

    const inputs: PrivateRegisterIdentityBuilderGroth16 = {
      dg1: Array.from(this.eDoc.dg1Bytes),
      dg15: this.eDoc.dg15Bytes?.length ? Array.from(this.eDoc.dg15Bytes) : [],
      signedAttributes: Array.from(this.eDoc.sod.signedAttributes),
      encapsulatedContent: Array.from(this.eDoc.sod.encapsulatedContent),
      pubkey: Array.from(extractRawPubKey(this.eDoc.sod.slaveCertificate.certificate)),
      signature: Array.from(this.eDoc.sod.signature),
      skIdentity: params.skIdentity,
      slaveMerkleRoot: params.slaveMerkleRoot,
      slaveMerkleInclusionBranches: params.slaveMerkleInclusionBranches,
    }

    const wtns = await this.circuitParams.wtnsCalcMethod(
      datBytes,
      Buffer.from(JSON.stringify(inputs)),
    )

    const registerIdentityZkProofBytes = await groth16ProveWithZKeyFilePath(wtns, zkeyLocalUri)

    return JSON.parse(Buffer.from(registerIdentityZkProofBytes).toString()) as CircomZKProof
  }
}
