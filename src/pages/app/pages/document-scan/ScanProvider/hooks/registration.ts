import {
  CircuitType,
  getCircuitDetailsByType,
  getCircuitType,
  scanDocument,
} from '@modules/e-document'
import { NewEDocument } from '@modules/e-document/src/helpers/e-document'
import { groth16ProveWithZKeyFilePath, ZKProof } from '@modules/rapidsnark-wrp'
import {
  buildRegisterCertificateCallData,
  buildRegisterIdentityInputs,
  buildRevoceCalldata,
} from '@modules/rarime-sdk'
import { AxiosError } from 'axios'
import { encodeBase64, ethers, getBytes, JsonRpcProvider, keccak256, zeroPadValue } from 'ethers'
import { FieldRecords } from 'mrz'
import { useCallback, useMemo, useRef } from 'react'

import { RARIMO_CHAINS } from '@/api/modules/rarimo'
import { relayerRegister } from '@/api/modules/registration'
import { Config } from '@/config'
import { ErrorHandler } from '@/core'
import { createPoseidonSMTContract } from '@/helpers'
import { tryCatch } from '@/helpers/try-catch'
import {
  CertificateAlreadyRegisteredError,
  PassportRegisteredWithAnotherPKError,
} from '@/store/modules/identity/errors'
import { IdentityItem } from '@/store/modules/identity/Identity'
import { walletStore } from '@/store/modules/wallet'
import { Registration__factory, StateKeeper } from '@/types'
import { SparseMerkleTree } from '@/types/contracts/PoseidonSMT'
import { Groth16VerifierHelper, Registration2 } from '@/types/contracts/Registration'

import { useCircuit } from './circuit'

const ZERO_BYTES32_HEX = ethers.encodeBytes32String('')

type PassportInfo = {
  passportInfo_: StateKeeper.PassportInfoStructOutput
  identityInfo_: StateKeeper.IdentityInfoStructOutput
}

export class NeedRevocationError extends Error {
  constructor(message: string, cause?: Error) {
    super(message)
    this.name = 'NeedRevocationError'
    this.cause = cause
  }
}

export const useRegistration = () => {
  const privateKey = walletStore.useWalletStore(state => state.privateKey)
  const publicKeyHash = walletStore.usePublicKeyHash()

  const { loadCircuit, ...circuitLoadingDetails } = useCircuit()

  // const [assets] = useAssets([require('@assets/certificates/ICAO.pem')])

  // ----------------------------------------------------------------------------------------

  const rmoEvmJsonRpcProvider = useMemo(() => {
    const evmRpcUrl = RARIMO_CHAINS[Config.RMO_CHAIN_ID].rpcEvm

    return new JsonRpcProvider(evmRpcUrl)
  }, [])

  const certPoseidonSMTContract = useMemo(() => {
    return createPoseidonSMTContract(
      Config.CERT_POSEIDON_SMT_CONTRACT_ADDRESS,
      rmoEvmJsonRpcProvider,
    )
  }, [rmoEvmJsonRpcProvider])

  // ----------------------------------------------------------------------------------------

  const registerCertificate = useCallback(
    async (slaveCertPem: Uint8Array) => {
      try {
        const callData = await buildRegisterCertificateCallData(
          Config.ICAO_COSMOS_GRPC,
          slaveCertPem,
          Config.MASTER_CERTIFICATES_BUCKETNAME,
          Config.MASTER_CERTIFICATES_FILENAME,
        )

        const { data } = await relayerRegister(
          ethers.hexlify(callData),
          Config.REGISTRATION_CONTRACT_ADDRESS,
        )

        const tx = await rmoEvmJsonRpcProvider.getTransaction(data.tx_hash)

        if (!tx) throw new TypeError('Transaction not found')

        await tx.wait()
      } catch (error) {
        const axiosError = error as AxiosError

        if (JSON.stringify(axiosError.response?.data)?.includes('the key already exists')) {
          throw new CertificateAlreadyRegisteredError()
        }

        throw axiosError
      }
    },
    [rmoEvmJsonRpcProvider],
  )

  const getIdentityRegProof = useCallback(
    async (
      eDoc: NewEDocument,
      circuitType: CircuitType,
      smtProof: SparseMerkleTree.ProofStructOutput,
    ) => {
      const circuitsLoadingResult = await loadCircuit(circuitType)

      if (!circuitsLoadingResult) throw new TypeError('Circuit loading failed')

      const encapsulatedContent = eDoc.sod.encapsulatedContent
      const signedAttributes = eDoc.sod.signedAttributes
      const sodSignature = eDoc.sod.signature

      const registerIdentityInputs = await buildRegisterIdentityInputs({
        privateKeyHex: privateKey,
        encapsulatedContent,
        signedAttributes,
        sodSignature,
        dg1: eDoc.dg1Bytes,
        dg15: eDoc.dg15Bytes || new Uint8Array(),
        pubKeyPem: eDoc.sod.publicKeyPemBytes,
        smtProofJson: Buffer.from(
          JSON.stringify({
            root: encodeBase64(smtProof.root),
            siblings: smtProof.siblings.map(el => encodeBase64(el)),
            existence: smtProof.existence,
          }),
        ),
      })

      const registerIdentityInputsJson = Buffer.from(registerIdentityInputs).toString()

      const { wtnsCalcMethod: registerIdentityWtnsCalc } = getCircuitDetailsByType(circuitType)

      const wtns = await registerIdentityWtnsCalc(
        circuitsLoadingResult.dat,
        Buffer.from(registerIdentityInputsJson),
      )

      const registerIdentityZkProofBytes = await groth16ProveWithZKeyFilePath(
        wtns,
        circuitsLoadingResult.zKeyUri.replace('file://', ''),
      )

      return JSON.parse(Buffer.from(registerIdentityZkProofBytes).toString()) as ZKProof
    },
    [loadCircuit, privateKey],
  )

  const newBuildRegisterCallData = useCallback(
    (
      identityItem: IdentityItem,
      masterCertSmtProofRoot: Uint8Array,
      circuitTypeCertificatePubKeySize: number,
      isRevoked: boolean,
      circuitName: string,
    ) => {
      const parts = circuitName.split('_')

      if (parts.length < 2) {
        throw new Error('circuit name is in invalid format')
      }

      // ZKTypePrefix represerts the circuit zk type prefix
      const ZKTypePrefix = 'Z_PER_PASSPORT'

      const zkTypeSuffix = parts.slice(1).join('_') // support for multi-underscore suffix
      const zkTypeName = `${ZKTypePrefix}_${zkTypeSuffix}`

      const passport: Registration2.PassportStruct = {
        dataType: identityItem.document.getAADataType(circuitTypeCertificatePubKeySize),
        zkType: keccak256(zkTypeName),
        signature: identityItem.document.AASignature,
        publicKey:
          identityItem.document.AAPublicKey === null
            ? identityItem.passportKey
            : identityItem.document.AAPublicKey,
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

      const registrationContractInterface = Registration__factory.createInterface()

      if (isRevoked) {
        return registrationContractInterface.encodeFunctionData('reissueIdentity', [
          masterCertSmtProofRoot,
          identityItem.pkIdentityHash,
          identityItem.dg1Commitment,
          passport,
          proofPoints,
        ])
      }

      return registrationContractInterface.encodeFunctionData('register', [
        masterCertSmtProofRoot,
        identityItem.pkIdentityHash,
        identityItem.dg1Commitment,
        passport,
        proofPoints,
      ])
    },
    [],
  )

  const requestRelayerRegisterMethod = useCallback(
    async (
      identityItem: IdentityItem,
      masterCertSmtProofRoot: Uint8Array,
      circuitTypeCertificatePubKeySize: number,
      isRevoked: boolean,
    ) => {
      const registerCallData = newBuildRegisterCallData(
        identityItem,
        masterCertSmtProofRoot,
        circuitTypeCertificatePubKeySize,
        isRevoked,
        '0', // TODO circuitName has to be built
      )

      const { data } = await relayerRegister(registerCallData, Config.REGISTRATION_CONTRACT_ADDRESS)

      const tx = await rmoEvmJsonRpcProvider.getTransaction(data.tx_hash)

      if (!tx) throw new TypeError('Transaction not found')

      await tx.wait()
    },
    [newBuildRegisterCallData, rmoEvmJsonRpcProvider],
  )

  const registerIdentity = useCallback(
    async (
      identityItem: IdentityItem,
      smtProof: SparseMerkleTree.ProofStructOutput,
      circuitType: CircuitType,
      passportInfo: PassportInfo | null,
    ): Promise<void> => {
      const currentIdentityKey = publicKeyHash
      const currentIdentityKeyHex = ethers.hexlify(currentIdentityKey)

      const isPassportNotRegistered =
        !passportInfo || passportInfo.passportInfo_.activeIdentity === ZERO_BYTES32_HEX

      const { circuitTypeCertificatePubKeySize } = getCircuitDetailsByType(circuitType)

      if (isPassportNotRegistered) {
        await requestRelayerRegisterMethod(
          identityItem,
          Buffer.from(smtProof.root),
          circuitTypeCertificatePubKeySize,
          false,
        )
      }

      const isPassportRegisteredWithCurrentPK =
        passportInfo?.passportInfo_.activeIdentity === currentIdentityKeyHex

      if (isPassportRegisteredWithCurrentPK) {
        // TODO: save eDoc, regProof, and proceed complete
      }

      throw new PassportRegisteredWithAnotherPKError()
    },
    [publicKeyHash, requestRelayerRegisterMethod],
  )

  const getRevocationChallenge = useCallback(
    async (identityItem: IdentityItem): Promise<Uint8Array> => {
      const passportInfo = await identityItem.getPassportInfo()

      if (!passportInfo?.passportInfo_.activeIdentity)
        throw new TypeError('Active identity not found')

      const challenge = ethers.getBytes(passportInfo.passportInfo_.activeIdentity).slice(24, 32)

      return challenge
    },
    [],
  )

  const getSlaveCertSmtProof = useCallback(
    async (tempEDoc: NewEDocument) => {
      return certPoseidonSMTContract.contractInstance.getProof(
        zeroPadValue(tempEDoc.sod.slaveCertificateIndex, 32),
      )
    },
    [certPoseidonSMTContract.contractInstance],
  )

  const resolveRevokedEDocument =
    useRef<(value: NewEDocument | PromiseLike<NewEDocument>) => void>()
  const rejectRevokedEDocument = useRef<(reason?: unknown) => void>()

  const revokeIdentity = useCallback(
    async (
      tempMRZ: FieldRecords,
      currentIdentityItem: IdentityItem,
      _passportInfo?: PassportInfo | null,
      _slaveCertSmtProof?: SparseMerkleTree.ProofStructOutput,
      _circuitType?: CircuitType,
    ) => {
      if (
        !tempMRZ.birthDate ||
        !tempMRZ.documentNumber ||
        !tempMRZ.expirationDate ||
        !tempMRZ.documentCode
      )
        throw new TypeError('MRZ data is empty')

      const challenge = await getRevocationChallenge(currentIdentityItem)

      const eDocumentResponse = await scanDocument(
        tempMRZ.documentCode,
        {
          dateOfBirth: tempMRZ.birthDate,
          dateOfExpiry: tempMRZ.expirationDate,
          documentNumber: tempMRZ.documentNumber,
        },
        challenge,
      )

      const revokedEDocument = currentIdentityItem.document || eDocumentResponse
      revokedEDocument.aaSignature = eDocumentResponse.aaSignature

      const [passportInfo, getPassportInfoError] = await (async () => {
        if (_passportInfo) return [_passportInfo, null]

        return tryCatch(currentIdentityItem.getPassportInfo())
      })()
      if (getPassportInfoError) {
        throw new TypeError('Failed to get passport info', getPassportInfoError)
      }

      if (!passportInfo?.passportInfo_.activeIdentity)
        throw new TypeError('Active identity not found')

      const activeIdentityBytes = ethers.getBytes(passportInfo?.passportInfo_.activeIdentity)

      const isPassportRegistered = passportInfo?.passportInfo_.activeIdentity !== ZERO_BYTES32_HEX

      if (isPassportRegistered) {
        const calldata = await buildRevoceCalldata(
          activeIdentityBytes,
          revokedEDocument.aaSignature,
          revokedEDocument.dg15PubKeyPem || new Uint8Array(),
        )

        try {
          const { data } = await relayerRegister(
            ethers.hexlify(calldata),
            Config.REGISTRATION_CONTRACT_ADDRESS,
          )

          const tx = await rmoEvmJsonRpcProvider.getTransaction(data.tx_hash)

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

      const circuitType =
        _circuitType ?? getCircuitType(currentIdentityItem.document.sod.X509RSASize)

      if (!circuitType) throw new TypeError('Unsupported public key size')

      const { circuitTypeCertificatePubKeySize } = getCircuitDetailsByType(circuitType)

      const [slaveCertSmtProof, getSlaveCertSmtProofError] = await (async () => {
        if (_slaveCertSmtProof) return [_slaveCertSmtProof, null]

        return tryCatch(getSlaveCertSmtProof(currentIdentityItem.document))
      })()
      if (getSlaveCertSmtProofError) {
        throw new TypeError('Slave certificate SMT proof not found', getSlaveCertSmtProofError)
      }

      await requestRelayerRegisterMethod(
        currentIdentityItem,
        getBytes(slaveCertSmtProof.root),
        circuitTypeCertificatePubKeySize,
        true,
      )
    },
    [
      getRevocationChallenge,
      getSlaveCertSmtProof,
      requestRelayerRegisterMethod,
      rmoEvmJsonRpcProvider,
    ],
  )

  // ---------------------------------------------------------------------------------------------

  const createIdentity = useCallback(
    async (
      tempEDoc: NewEDocument,
      opts: {
        onRevocation: (identityItem: IdentityItem) => void
      },
    ): Promise<IdentityItem> => {
      // const icaoAsset = assets?.[0]

      // TODO: check slave cert pem against icao bytes
      // if (!icaoAsset?.localUri) throw new TypeError('ICAO asset not found')
      // const icaoBase64 = await FileSystem.readAsStringAsync(icaoAsset.localUri, {
      //   encoding: FileSystem.EncodingType.Base64,
      // })
      // const icaoBytes = ethers.decodeBase64(icaoBase64)

      const circuitType = getCircuitType(tempEDoc.sod.X509RSASize)

      if (!circuitType) throw new TypeError('Unsupported public key size')

      const [slaveCertSmtProof, getSlaveCertSmtProofError] = await tryCatch(
        getSlaveCertSmtProof(tempEDoc),
      )
      if (getSlaveCertSmtProofError) {
        throw new TypeError('Slave certificate SMT proof not found', getSlaveCertSmtProofError)
      }

      if (!slaveCertSmtProof.existence) {
        const [, registerCertificateError] = await tryCatch(
          registerCertificate(tempEDoc.sod.slaveCertPemBytes),
        )
        if (registerCertificateError) {
          ErrorHandler.processWithoutFeedback(registerCertificateError)

          if (!(registerCertificateError instanceof CertificateAlreadyRegisteredError)) {
            throw new TypeError('Failed to register slave certificate', registerCertificateError)
          }
        }
      }

      const [regProof, getRegProofError] = await tryCatch(
        getIdentityRegProof(tempEDoc, circuitType, slaveCertSmtProof),
      )
      if (getRegProofError) {
        throw new TypeError('Failed to get identity registration proof', getRegProofError)
      }
      const identityItem = new IdentityItem(tempEDoc, regProof)

      const [passportInfo, getPassportInfoError] = await tryCatch(identityItem.getPassportInfo())
      if (getPassportInfoError) {
        throw new TypeError('Failed to get passport info', getPassportInfoError)
      }

      const [, registerIdentityError] = await tryCatch(
        registerIdentity(identityItem, slaveCertSmtProof, circuitType, passportInfo),
      )
      if (registerIdentityError) {
        opts?.onRevocation?.(identityItem)
        throw new NeedRevocationError(
          'Failed to register identity, revocation required',
          registerIdentityError,
        )
      }

      return identityItem
    },
    [getIdentityRegProof, getSlaveCertSmtProof, registerCertificate, registerIdentity],
  )

  return {
    circuitLoadingDetails,
    resolveRevokedEDocument,
    rejectRevokedEDocument,

    revokeIdentity,
    createIdentity,
    getRevocationChallenge,
  }
}
