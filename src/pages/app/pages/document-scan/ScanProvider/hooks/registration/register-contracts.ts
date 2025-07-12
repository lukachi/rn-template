import { NoirZKProof } from '@modules/noir'
import { CircomZKProof } from '@modules/witnesscalculator'
import { keccak256 } from 'ethers'
import { useCallback } from 'react'

import { IdentityItem } from '@/store/modules/identity/Identity'
import { Registration__factory } from '@/types/contracts/factories/Registration__factory'
import { SparseMerkleTree } from '@/types/contracts/PoseidonSMT'
import { Groth16VerifierHelper, Registration2 } from '@/types/contracts/Registration'
import { CircomEPassportBasedRegistrationCircuit } from '@/utils/circuits/registration/circom-registration-circuit'
import { NoirEPassportBasedRegistrationCircuit } from '@/utils/circuits/registration/noir-registration-circuit'
import { EID, EPassport } from '@/utils/e-document'

export const useRegisterContracts = () => {
  const registrationContractInterface = Registration__factory.createInterface()

  // TODO: check if it works
  const buildNoirRegisterCallData = useCallback(
    async (
      identityItem: IdentityItem,
      slaveCertSmtProof: SparseMerkleTree.ProofStructOutput,
      isRevoked: boolean,
    ) => {
      if (identityItem.document instanceof EID) {
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
          return registrationContractInterface.encodeFunctionData('reissueIdentityViaNoir', [
            slaveCertSmtProof.root,
            pkIdentityHash,
            dg1Commitment,
            passport,
            proof,
          ])
        }

        return registrationContractInterface.encodeFunctionData('registerViaNoir', [
          slaveCertSmtProof.root,
          pkIdentityHash,
          dg1Commitment,
          passport,
          proof,
        ])
      }

      if (identityItem.document instanceof EPassport) {
        if (typeof identityItem.registrationProof !== 'string') {
          throw new TypeError('Noir proof is not supported for Circom registration')
        }

        const registrationProof = identityItem.registrationProof as NoirZKProof

        const circuit = new NoirEPassportBasedRegistrationCircuit(identityItem.document)

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

        if (isRevoked) {
          return registrationContractInterface.encodeFunctionData('reissueIdentityViaNoir', [
            slaveCertSmtProof.root,
            identityItem.pkIdentityHash,
            identityItem.dg1Commitment,
            passport,
            registrationProof.proof,
          ])
        }

        return registrationContractInterface.encodeFunctionData('registerViaNoir', [
          slaveCertSmtProof.root,
          identityItem.pkIdentityHash,
          identityItem.dg1Commitment,
          passport,
          registrationProof.proof,
        ])
      }

      throw new TypeError('Unsupported document type for registration')
    },
    [registrationContractInterface],
  )

  // TODO: check if it works
  const buildCircomRegisterCallData = useCallback(
    (
      identityItem: IdentityItem,
      slaveCertSmtProof: SparseMerkleTree.ProofStructOutput,
      isRevoked: boolean,
    ) => {
      if (identityItem.document instanceof EPassport) {
        if (typeof identityItem.registrationProof === 'string') {
          throw new TypeError('Circom proof is not supported for Noir registration')
        }

        const registrationProof = identityItem.registrationProof as CircomZKProof

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
          a: [BigInt(registrationProof.proof.pi_a[0]), BigInt(registrationProof.proof.pi_a[1])],
          b: [
            [
              BigInt(registrationProof.proof.pi_b[0][0]),
              BigInt(registrationProof.proof.pi_b[0][1]),
            ],
            [
              BigInt(registrationProof.proof.pi_b[1][0]),
              BigInt(registrationProof.proof.pi_b[1][1]),
            ],
          ],
          c: [BigInt(registrationProof.proof.pi_c[0]), BigInt(registrationProof.proof.pi_c[1])],
        }

        if (isRevoked) {
          return registrationContractInterface.encodeFunctionData('reissueIdentity', [
            slaveCertSmtProof.root,
            identityItem.pkIdentityHash,
            identityItem.dg1Commitment,
            passport,
            proofPoints,
          ])
        }

        return registrationContractInterface.encodeFunctionData('register', [
          slaveCertSmtProof.root,
          identityItem.pkIdentityHash,
          identityItem.dg1Commitment,
          passport,
          proofPoints,
        ])
      }

      if (identityItem.document instanceof EID) {
        throw new TypeError('EID registration is not supported yet')
      }

      throw new TypeError('Unsupported document type for registration')
    },
    [registrationContractInterface],
  )

  return {
    buildCircomRegisterCallData,
    buildNoirRegisterCallData,
  }
}
