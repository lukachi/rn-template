import { AxiosError } from 'axios'
import { hexlify, keccak256 } from 'ethers'
import { FieldRecords } from 'mrz'

import { relayerRegister } from '@/api/modules/registration/relayer'
import { PassportInfo, RegistrationStrategy } from '@/api/modules/registration/strategy'
import { Config } from '@/config'
import { tryCatch } from '@/helpers/try-catch'
import { PassportRegisteredWithAnotherPKError } from '@/store/modules/identity/errors'
import { CircomEpassportIdentity, IdentityItem } from '@/store/modules/identity/Identity'
import { SparseMerkleTree } from '@/types/contracts/PoseidonSMT'
import { Groth16VerifierHelper, Registration2 } from '@/types/contracts/Registration'
import { CircomEPassportBasedRegistrationCircuit } from '@/utils/circuits/registration/circom-registration-circuit'
import { EDocument, EPassport } from '@/utils/e-document/e-document'

export class CircomEPassportRegistration extends RegistrationStrategy {
  buildRegisterCallData = async (
    identityItem: CircomEpassportIdentity,
    slaveCertSmtProof: SparseMerkleTree.ProofStructOutput,
    isRevoked: boolean,
  ) => {
    if (typeof identityItem.registrationProof === 'string') {
      throw new TypeError('Circom proof is not supported for Noir registration')
    }

    const circuit = new CircomEPassportBasedRegistrationCircuit(identityItem.document)

    const aaSignature = identityItem.document.getAASignature()

    if (!aaSignature) throw new TypeError('AA signature is not defined')

    const parts = circuit.name.split('_')

    if (parts.length < 2) {
      throw new Error('circuit name is in invalid format')
    }

    // ZKTypePrefix represerts the circuit zk type prefix
    const ZKTypePrefix = 'Z_PER_PASSPORT'

    const zkTypeSuffix = parts.slice(1).join('_') // support for multi-underscore suffix
    const zkTypeName = `${ZKTypePrefix}_${zkTypeSuffix}`

    const passport: Registration2.PassportStruct = {
      dataType: identityItem.document.getAADataType(circuit.eDoc.sod.slaveCertificate.keySize),
      zkType: keccak256(zkTypeName),
      signature: aaSignature,
      publicKey: (() => {
        const aaPublicKey = identityItem.document.getAAPublicKey()

        if (!aaPublicKey) return identityItem.publicKey

        return aaPublicKey
      })(),
      passportHash: identityItem.passportHash,
    }

    const proofPoints: Groth16VerifierHelper.ProofPointsStruct = {
      a: [
        BigInt(identityItem.registrationProof.proof.pi_a[0]),
        BigInt(identityItem.registrationProof.proof.pi_a[1]),
      ],
      b: [
        [
          BigInt(identityItem.registrationProof.proof.pi_b[0][0]),
          BigInt(identityItem.registrationProof.proof.pi_b[0][1]),
        ],
        [
          BigInt(identityItem.registrationProof.proof.pi_b[1][0]),
          BigInt(identityItem.registrationProof.proof.pi_b[1][1]),
        ],
      ],
      c: [
        BigInt(identityItem.registrationProof.proof.pi_c[0]),
        BigInt(identityItem.registrationProof.proof.pi_c[1]),
      ],
    }

    if (isRevoked) {
      return RegistrationStrategy.registrationContractInterface.encodeFunctionData(
        'reissueIdentity',
        [
          slaveCertSmtProof.root,
          identityItem.pkIdentityHash,
          identityItem.dg1Commitment,
          passport,
          proofPoints,
        ],
      )
    }

    return RegistrationStrategy.registrationContractInterface.encodeFunctionData('register', [
      slaveCertSmtProof.root,
      identityItem.pkIdentityHash,
      identityItem.dg1Commitment,
      passport,
      proofPoints,
    ])
  }

  createIdentity = async (
    _eDocument: EDocument,
    privateKey: string,
    publicKeyHash: Uint8Array,
  ): Promise<CircomEpassportIdentity> => {
    const eDocument = _eDocument as EPassport

    const CSCACertBytes = await RegistrationStrategy.retrieveCSCAFromPem()

    const slaveMaster = await eDocument.sod.slaveCertificate.getSlaveMaster(CSCACertBytes)

    const slaveCertSmtProof = await RegistrationStrategy.getSlaveCertSmtProof(
      eDocument.sod.slaveCertificate,
    )

    if (!slaveCertSmtProof.existence) {
      await RegistrationStrategy.registerCertificate(
        CSCACertBytes,
        eDocument.sod.slaveCertificate,
        slaveMaster,
      )
    }

    const circuit = new CircomEPassportBasedRegistrationCircuit(eDocument)

    const registrationProof = await circuit.prove({
      skIdentity: BigInt(`0x${privateKey}`),
      slaveMerkleRoot: BigInt(slaveCertSmtProof.root),
      slaveMerkleInclusionBranches: slaveCertSmtProof.siblings.map(el => BigInt(el)),
    })

    const identityItem = new CircomEpassportIdentity(eDocument, registrationProof)

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

  public revokeIdentity = async (
    tempMRZ: FieldRecords,
    _currentIdentityItem: IdentityItem,
    scanDocument: (
      documentCode: string,
      bacKeyParameters: {
        dateOfBirth: string
        dateOfExpiry: string
        documentNumber: string
      },
      challenge: Uint8Array,
    ) => Promise<EDocument>,
    _passportInfo?: PassportInfo | null,
    _slaveCertSmtProof?: SparseMerkleTree.ProofStructOutput,
  ): Promise<IdentityItem> => {
    if (
      !tempMRZ.birthDate ||
      !tempMRZ.documentNumber ||
      !tempMRZ.expirationDate ||
      !tempMRZ.documentCode
    )
      throw new TypeError('MRZ data is empty')

    const currentIdentityItem = _currentIdentityItem as CircomEpassportIdentity

    const [passportInfo, getPassportInfoError] = await (async () => {
      if (_passportInfo) return [_passportInfo, null]

      return tryCatch(currentIdentityItem.getPassportInfo())
    })()
    if (getPassportInfoError) {
      throw new TypeError('Failed to get passport info', getPassportInfoError)
    }

    if (!passportInfo?.passportInfo_.activeIdentity)
      throw new TypeError('Active identity not found')

    if (!passportInfo?.passportInfo_.activeIdentity)
      throw new TypeError('Active identity not found')

    const challenge = await RegistrationStrategy.getRevocationChallenge(passportInfo)

    const eDocumentResponse = (await scanDocument(
      tempMRZ.documentCode,
      {
        dateOfBirth: tempMRZ.birthDate,
        dateOfExpiry: tempMRZ.expirationDate,
        documentNumber: tempMRZ.documentNumber,
      },
      challenge,
    )) as EPassport

    const revokedEDocument = (currentIdentityItem.document || eDocumentResponse) as EPassport

    revokedEDocument.aaSignature = eDocumentResponse.aaSignature

    const aaSignature = revokedEDocument.getAASignature()

    if (!aaSignature) throw new TypeError('AA signature is not defined')

    const isPassportRegistered =
      passportInfo?.passportInfo_.activeIdentity !== RegistrationStrategy.ZERO_BYTES32_HEX

    if (isPassportRegistered) {
      const passport: Registration2.PassportStruct = {
        dataType: revokedEDocument.getAADataType(revokedEDocument.sod.slaveCertificate.keySize),
        zkType: RegistrationStrategy.ZERO_BYTES32_HEX,
        signature: aaSignature,
        publicKey: revokedEDocument.getAAPublicKey() || RegistrationStrategy.ZERO_BYTES32_HEX,
        passportHash: RegistrationStrategy.ZERO_BYTES32_HEX,
      }

      const txCallData = RegistrationStrategy.registrationContractInterface.encodeFunctionData(
        'revoke',
        [passportInfo?.passportInfo_.activeIdentity, passport],
      )

      try {
        const { data } = await relayerRegister(txCallData, Config.REGISTRATION_CONTRACT_ADDRESS)

        const tx = await RegistrationStrategy.rmoEvmJsonRpcProvider.getTransaction(data.tx_hash)

        if (!tx) throw new TypeError('Transaction not found')

        await tx.wait()
      } catch (error) {
        const axiosError = error as AxiosError
        if (axiosError.response?.data) {
          console.warn(JSON.stringify(axiosError.response?.data))
        }

        const errorMsgsToSkip = ['the leaf does not match', 'already revoked']

        const isSkip = errorMsgsToSkip.some(q =>
          JSON.stringify(axiosError.response?.data)?.includes(q),
        )

        if (!isSkip) {
          throw axiosError
        }
      }
    }

    const [slaveCertSmtProof, getSlaveCertSmtProofError] = await (async () => {
      if (_slaveCertSmtProof) return [_slaveCertSmtProof, null]

      return tryCatch(
        RegistrationStrategy.getSlaveCertSmtProof(
          currentIdentityItem.document.sod.slaveCertificate,
        ),
      )
    })()
    if (getSlaveCertSmtProofError) {
      throw new TypeError('Slave certificate SMT proof not found', getSlaveCertSmtProofError)
    }

    const registerCallData = await this.buildRegisterCallData(
      currentIdentityItem,
      slaveCertSmtProof,
      false,
    )

    await RegistrationStrategy.requestRelayerRegisterMethod(registerCallData)

    return currentIdentityItem
  }
}
