import { NoirZKProof } from '@modules/noir'
import { hexlify, keccak256 } from 'ethers'

import { RegistrationStrategy } from '@/api/modules/registration/strategy'
import { PassportRegisteredWithAnotherPKError } from '@/store/modules/identity/errors'
import { IdentityItem } from '@/store/modules/identity/Identity'
import { Registration2 } from '@/types/contracts/Registration'
import { NoirEIDBasedRegistrationCircuit } from '@/utils/circuits/registration/noir-registration-circuit'
import { EID } from '@/utils/e-document'

export class NoirEIDRegistration extends RegistrationStrategy {
  buildRegisterCallData = async (identityItem, slaveCertSmtProof, isRevoked) => {
    if (typeof identityItem.registrationProof.proof !== 'string') {
      throw new TypeError('Noir proof is not supported for Circom registration')
    }

    const registrationProof = identityItem.registrationProof as NoirZKProof

    const passportHash = identityItem.passportHash.startsWith('0x')
      ? identityItem.passportHash
      : `0x${identityItem.passportHash}`

    const passport: Registration2.PassportStruct = {
      dataType: identityItem.document.AADataType,
      zkType: keccak256(Buffer.from('Z_NOIR_PASSPORT_ID_CARD_I', 'utf-8')),
      signature: new Uint8Array(),
      publicKey: new Uint8Array(),
      passportHash: passportHash,
    }

    const pkIdentityHash = identityItem.pkIdentityHash.startsWith('0x')
      ? identityItem.pkIdentityHash
      : `0x${identityItem.pkIdentityHash}`

    const dg1Commitment = identityItem.dg1Commitment.startsWith('0x')
      ? identityItem.dg1Commitment
      : `0x${identityItem.dg1Commitment}`

    const proof = registrationProof.proof.startsWith('0x')
      ? registrationProof.proof
      : `0x${registrationProof.proof}`

    // const voidSigner = new VoidSigner(
    //   '0x52749da41B7196A7001D85Ce38fa794FE0F9044E',
    //   new JsonRpcProvider(RARIMO_CHAINS[Config.RMO_CHAIN_ID].rpcEvm),
    // )
    // const preparedTx = await voidSigner.populateCall({
    //   to: Config.REGISTRATION_CONTRACT_ADDRESS,
    //   data: registrationContractInterface.encodeFunctionData('registerViaNoir', [
    //     slaveCertSmtProof.root,
    //     pkIdentityHash,
    //     dg1Commitment,
    //     passport,
    //     proof,
    //   ]),
    // })

    // console.log({ preparedTx })

    // throw new Error('purpose')

    if (isRevoked) {
      return RegistrationStrategy.registrationContractInterface.encodeFunctionData(
        'reissueIdentityViaNoir',
        [slaveCertSmtProof.root, pkIdentityHash, dg1Commitment, passport, proof],
      )
    }

    return RegistrationStrategy.registrationContractInterface.encodeFunctionData(
      'registerViaNoir',
      [slaveCertSmtProof.root, pkIdentityHash, dg1Commitment, passport, proof],
    )
  }

  createIdentity = async (
    eDocument: EID,
    privateKey: string,
    publicKeyHash: Uint8Array,
  ): Promise<IdentityItem> => {
    const CSCACertBytes = await RegistrationStrategy.retrieveCSCAFromPem()

    const slaveMaster = await eDocument.authCertificate.getSlaveMaster(CSCACertBytes)

    const slaveCertSmtProof = await RegistrationStrategy.getSlaveCertSmtProof(
      eDocument.authCertificate,
    )

    if (!slaveCertSmtProof.existence) {
      await RegistrationStrategy.registerCertificate(
        CSCACertBytes,
        eDocument.authCertificate,
        slaveMaster,
      )
    }

    const circuit = new NoirEIDBasedRegistrationCircuit(eDocument)

    const registrationProof = await circuit.prove({
      skIdentity: BigInt(`0x${privateKey}`),
      icaoRoot: BigInt(slaveCertSmtProof.root),
      inclusionBranches: slaveCertSmtProof.siblings.map(el => BigInt(el)),
    })

    const identityItem = new IdentityItem(eDocument, registrationProof)

    const passportInfo = await identityItem.getPassportInfo()

    const currentIdentityKey = publicKeyHash
    const currentIdentityKeyHex = hexlify(currentIdentityKey)

    const isPassportNotRegistered =
      !passportInfo ||
      passportInfo.passportInfo_.activeIdentity === RegistrationStrategy.ZERO_BYTES32_HEX

    const isPassportRegisteredWithCurrentPK =
      passportInfo?.passportInfo_.activeIdentity === currentIdentityKeyHex

    if (isPassportNotRegistered) {
      const registerCallData = await this.buildRegisterCallData(
        identityItem,
        slaveCertSmtProof,
        false,
      )

      await RegistrationStrategy.requestRelayerRegisterMethod(registerCallData)
    }

    if (!isPassportRegisteredWithCurrentPK) {
      throw new PassportRegisteredWithAnotherPKError()
    }

    return identityItem
  }

  revokeIdentity = async () => {
    throw new TypeError('EID revocation is not supported yet')
  }
}
