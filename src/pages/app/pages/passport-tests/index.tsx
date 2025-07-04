import { Hex } from '@iden3/js-crypto'
import { InMemoryDB, Merkletree } from '@iden3/js-merkletree'
import { NoirCircuitParams } from '@modules/noir'
import { CertificateSet, ContentInfo, SignedData } from '@peculiar/asn1-cms'
import { ECParameters } from '@peculiar/asn1-ecc'
import { id_pkcs_1, RSAPublicKey } from '@peculiar/asn1-rsa'
import { AsnConvert } from '@peculiar/asn1-schema'
import { Certificate } from '@peculiar/asn1-x509'
import { X509Certificate } from '@peculiar/x509'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { getBytes, keccak256, toBeArray } from 'ethers'
import { Asset } from 'expo-asset'
import * as FileSystem from 'expo-file-system'
import forge from 'node-forge'
import { useCallback, useMemo, useState } from 'react'
import { View } from 'react-native'
import { Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { parseLdifString, parsePemString } from 'rn-csca'

import { Config } from '@/config'
import { tryCatch } from '@/helpers/try-catch'
import AppContainer from '@/pages/app/components/AppContainer'
import { identityStore } from '@/store'
import { useAppPaddings } from '@/theme'
import { Registration__factory } from '@/types/contracts/factories/Registration__factory'
import { Registration2 } from '@/types/contracts/Registration'
import { UiButton, UiScreenScrollable } from '@/ui'
import { getCircuitHashAlgorithm } from '@/utils/circuits/helpers'
import { ECDSA_ALGO_PREFIX, EDocument, PersonDetails } from '@/utils/e-document'
import { getPublicKeyFromEcParameters } from '@/utils/e-document/helpers/crypto'
import { extractRawPubKey } from '@/utils/e-document/helpers/misc'

const registrationContractInterface = Registration__factory.createInterface()

const newBuildRegisterCertCallData = async (
  CSCAs: Certificate[],
  tempEDoc: EDocument,
  slaveMaster: X509Certificate,
) => {
  console.log(CSCAs.length, 'CSCAs')
  const masterCert = AsnConvert.parse(slaveMaster.rawData, Certificate)

  // priority = keccak256.Hash(key) % (2^64-1)
  function toField(bytes: Uint8Array): bigint {
    const bi = BigInt(keccak256(bytes))
    return bi % (2n ** 64n - 1n)
  }

  // TODO: replace with merkletree lib
  const [icaoTree, getIcaoTreeError] = await tryCatch(
    (async () => {
      const db = new InMemoryDB(new Uint8Array([0]))
      const tree = new Merkletree(db, true, 1000)

      for (const cert of CSCAs) {
        if (!cert?.tbsCertificate?.subjectPublicKeyInfo) {
          console.log(cert)
        }
        const leafHash = keccak256(extractRawPubKey(cert))

        const value = toField(getBytes(leafHash))

        await tryCatch(tree.add(BigInt(leafHash), value))
      }

      return tree
    })(),
  )
  if (getIcaoTreeError) {
    throw new TypeError(`Failed to create ICAO Merkle tree: ${getIcaoTreeError}`)
  }

  // console.log({ icaoTreeRoot: await icaoTree.root() })

  const [inclusionProof, getInclusionProofError] = await tryCatch(
    (async () => {
      const leafDigest = keccak256(new Uint8Array(extractRawPubKey(masterCert)))
      const { proof } = await icaoTree.generateProof(toField(getBytes(leafDigest)))
      return { root: await icaoTree.root(), proof }
    })(),
  )
  if (getInclusionProofError) {
    throw new TypeError(`Failed to generate inclusion proof: ${getInclusionProofError.message}`)
  }

  console.log('root', Hex.encodeString(inclusionProof.root.value))

  if (inclusionProof.proof.allSiblings().length <= 0) {
    throw new TypeError('failed to generate inclusion proof')
  }

  const dispatcherName = (() => {
    const masterSubjPubKeyAlg = masterCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm

    if (masterSubjPubKeyAlg.includes(id_pkcs_1)) {
      const bits = (() => {
        if (
          tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm.includes(
            id_pkcs_1,
          )
        ) {
          const slaveRSAPubKey = AsnConvert.parse(
            tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
            RSAPublicKey,
          )

          const modulusBytes = new Uint8Array(slaveRSAPubKey.modulus)

          const unpaddedRsaPubKey =
            modulusBytes[0] === 0x00 ? modulusBytes.subarray(1) : modulusBytes

          return (unpaddedRsaPubKey.byteLength * 8).toString()
        }

        if (
          tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm.includes(
            ECDSA_ALGO_PREFIX,
          )
        ) {
          if (!tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.parameters)
            throw new TypeError('ECDSA public key does not have parameters')

          const ecParameters = AsnConvert.parse(
            tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.parameters,
            ECParameters,
          )

          const [publicKey] = getPublicKeyFromEcParameters(
            ecParameters,
            new Uint8Array(
              tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
            ),
          )

          const rawPoint = new Uint8Array([...toBeArray(publicKey.px), ...toBeArray(publicKey.py)])

          return rawPoint.length * 8
        }
      })()

      let dispatcherName = `C_RSA`

      const circuitHashAlgorithm = getCircuitHashAlgorithm(tempEDoc.sod.slaveCert)
      if (circuitHashAlgorithm) {
        dispatcherName += `_${circuitHashAlgorithm}`
      }

      dispatcherName += `_${bits}`

      return dispatcherName
    }

    if (masterSubjPubKeyAlg.includes(ECDSA_ALGO_PREFIX)) {
      if (!masterCert.tbsCertificate.subjectPublicKeyInfo.algorithm.parameters) {
        throw new TypeError('Master ECDSA public key does not have parameters')
      }

      if (!tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.parameters) {
        throw new TypeError('Slave ECDSA public key does not have parameters')
      }

      const masterEcParameters = AsnConvert.parse(
        masterCert.tbsCertificate.subjectPublicKeyInfo.algorithm.parameters,
        ECParameters,
      )

      const slaveEcParameters = AsnConvert.parse(
        tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.parameters,
        ECParameters,
      )

      const [, , masterCertCurveName] = getPublicKeyFromEcParameters(
        masterEcParameters,
        new Uint8Array(masterCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey),
      )

      const [slaveCertPubKey] = getPublicKeyFromEcParameters(
        slaveEcParameters,
        new Uint8Array(tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey),
      )

      const pubKeyBytes = new Uint8Array([
        ...toBeArray(slaveCertPubKey.px),
        ...toBeArray(slaveCertPubKey.py),
      ])

      const bits = pubKeyBytes.length * 8

      let dispatcherName = `C_ECDSA_${masterCertCurveName}`

      const circuitHashAlgorithm = getCircuitHashAlgorithm(tempEDoc.sod.slaveCert)
      if (circuitHashAlgorithm) {
        dispatcherName += `_${circuitHashAlgorithm}`
      }

      dispatcherName += `_${bits}`

      return dispatcherName
    }

    throw new Error(`unsupported public key type: ${masterSubjPubKeyAlg}`)
  })()

  const dispatcherHash = getBytes(keccak256(Buffer.from(dispatcherName, 'utf-8')))

  const certificate: Registration2.CertificateStruct = {
    dataType: dispatcherHash,
    signedAttributes: new Uint8Array(AsnConvert.serialize(tempEDoc.sod.slaveCert.tbsCertificate)),
    keyOffset: tempEDoc.sod.slaveCertPubKeyOffset,
    expirationOffset: tempEDoc.sod.slaveCertExpOffset,
  }
  const icaoMember: Registration2.ICAOMemberStruct = {
    signature: tempEDoc.sod.getSlaveCertIcaoMemberSignature(masterCert),
    publicKey: tempEDoc.sod.getSlaveCertIcaoMemberKey(masterCert),
  }

  const icaoMerkleProofSiblings = inclusionProof.proof
    .allSiblings()
    .map(el => {
      return '0x' + el.hex()
    })
    .flat()

  return registrationContractInterface.encodeFunctionData('registerCertificate', [
    certificate,
    icaoMember,
    icaoMerkleProofSiblings,
  ])
}

const downloadUrl =
  'https://www.googleapis.com/download/storage/v1/b/rarimo-temp/o/icaopkd-list.ldif?generation=1715355629405816&alt=media'
const icaopkdFileUri = `${FileSystem.documentDirectory}/icaopkd-list.ldif`

const icaoPkdStringToCerts2 = async (icaoLdif: string) => {
  const res = parseLdifString(icaoLdif)

  return res.map(cert => {
    const parsed = AsnConvert.parse(new Uint8Array(cert), Certificate)

    return parsed
  })
}

const icaoPemToCerts = async (icaoPEM: string): Promise<Certificate[]> => {
  const res = parsePemString(icaoPEM)

  return res.map(cert => {
    const parsed = AsnConvert.parse(new Uint8Array(cert), Certificate)

    return parsed
  })
}

const icaoPkdStringToCerts = (icaoLdif: string): Certificate[] => {
  const regex = /pkdMasterListContent:: (.*?)\n\n/gs
  const matches = icaoLdif.matchAll(regex)

  const newLinePattern = /\n /g

  const certs: Certificate[][] = Array.from(matches, match => {
    // Remove newline + space patterns
    const dataB64 = match[1].replace(newLinePattern, '')

    // Decode base64
    const decoded = Uint8Array.from(atob(dataB64), c => c.charCodeAt(0))

    const ci = AsnConvert.parse(decoded, ContentInfo)
    const signedData = AsnConvert.parse(ci.content, SignedData)

    if (!signedData.encapContentInfo.eContent?.single?.buffer) {
      throw new Error('eContent is missing in SignedData')
    }

    const asn1ContentInfo = forge.asn1.fromDer(
      forge.util.createBuffer(signedData.encapContentInfo.eContent?.single?.buffer),
    )

    const content = asn1ContentInfo.value[1] as forge.asn1.Asn1

    const CSCACerts = AsnConvert.parse(
      Buffer.from(forge.asn1.toDer(content).toHex(), 'hex'),
      CertificateSet,
    )

    return CSCACerts.reduce((acc, cert) => {
      if (cert.certificate) {
        acc.push(cert.certificate)
      }

      return acc
    }, [] as Certificate[])
  })

  return certs.flat()
}

export default function PassportTests() {
  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()
  const bottomBarHeight = useBottomTabBarHeight()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tempMasters, setTempMasters] = useState<Record<string, X509Certificate>>({})
  const [tempCSCAs, setTempCSCAs] = useState<Certificate[]>()

  const testEDoc = identityStore.useIdentityStore(state => state.testEDoc)

  const [pkdDownloadProgress, setPkdDownloadProgress] = useState(0)

  const downloadResumable = useMemo(() => {
    return FileSystem.createDownloadResumable(downloadUrl, icaopkdFileUri, {}, progress => {
      setPkdDownloadProgress(progress.totalBytesWritten / progress.totalBytesExpectedToWrite)
    })
  }, [])

  const test = useCallback(
    async (passp: string, _eDoc?: EDocument) => {
      setIsSubmitting(true)
      try {
        const eDoc = (() => {
          if (_eDoc) return _eDoc

          const passport = JSON.parse(passp)

          // console.log(passport.dg1)

          return new EDocument({
            docCode: 'P',
            personDetails: {} as PersonDetails,
            dg1Bytes: new Uint8Array(Buffer.from(passport.dg1, 'base64')),
            sodBytes: new Uint8Array(Buffer.from(passport.sod, 'base64')),
          })
        })()

        // console.log(eDoc.sod.slaveCertExpOffset)

        // console.log(Buffer.from(eDoc.dg1Bytes).toString('base64'))
        // console.log(Buffer.from(eDoc.sodBytes).toString('base64'))

        // console.log(
        //   Buffer.from(
        //     toPem(Buffer.from(AsnConvert.serialize(eDoc.sod.slaveCert)).buffer, 'CERTIFICATE'),
        //     'utf-8',
        //   ).toString('base64'),
        // )

        // console.log(Hex.encodeString(eDoc.sod.slaveCertificateIndex))

        const CSCAs = await (async () => {
          if (tempCSCAs) {
            return tempCSCAs
          }

          if (!(await FileSystem.getInfoAsync(icaopkdFileUri)).exists) {
            await downloadResumable.downloadAsync()
          }

          const fileContent = await FileSystem.readAsStringAsync(icaopkdFileUri, {
            encoding: FileSystem.EncodingType.UTF8,
          })

          return icaoPkdStringToCerts(fileContent)
        })()
        setTempCSCAs(CSCAs)

        const [slaveMaster, getSlaveMasterError] = await tryCatch(
          (async () => {
            if (tempMasters[passp]) {
              return tempMasters[passp]
            }

            return eDoc.sod.getSlaveMaster(CSCAs)
          })(),
        )
        if (getSlaveMasterError) {
          throw new TypeError('Failed to get master certificate', getSlaveMasterError)
        }

        setTempMasters(prev => {
          return { ...prev, [passp]: slaveMaster }
        })

        const masterCert = AsnConvert.parse(slaveMaster.rawData, Certificate)

        const slaveCertIcaoMemberKey = eDoc.sod.getSlaveCertIcaoMemberKey(masterCert)

        console.log(Hex.encodeString(slaveCertIcaoMemberKey))

        // console.log(Hex.encodeString(slaveCertIcaoMemberKey))

        // console.log(Hex.encodeString(eDoc.sod.getSlaveCertIcaoMemberSignature(masterCert)))

        const callData = await newBuildRegisterCertCallData(CSCAs, eDoc, slaveMaster)

        console.log(callData)
      } catch (error) {
        console.error('Error during test:', error)
      }
      setIsSubmitting(false)
    },
    [downloadResumable, tempCSCAs, tempMasters],
  )

  const testNoir = useCallback(async () => {
    const noirInstance = NoirCircuitParams.fromName(
      'registerIdentity_2_256_3_6_336_264_21_2448_6_2008',
    )

    await NoirCircuitParams.downloadTrustedSetup()

    const byteCode = await noirInstance.downloadByteCode()

    /**
     * mapOf(
          "dg15" to dg15Deferred,
          "sa" to saDeferred,
          "pk" to pk,
          "icao_root" to Numeric.toHexString(proof.root),
          "inclusion_branches" to proof.siblings.map { Numeric.toHexString(it) },
          "ec" to ecDeferred,
          "sk_identity" to skIdentityDeferred,
          "dg1" to dg1Deferred,
          "sig" to sig,
          "reduction_pk" to reductionPk
      )
     */
    const inputs = {
      skIdentity: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      pkIdentity: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      pkIdentityHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    }

    const proof = await noirInstance.prove(JSON.stringify(inputs), byteCode)

    console.log('Proof:', proof)
  }, [])

  const testCsca = async () => {
    setIsSubmitting(true)
    const start = performance.now()
    const [CSCAs, getCSCAsError] = await tryCatch(
      (async () => {
        if (!(await FileSystem.getInfoAsync(icaopkdFileUri)).exists) {
          await downloadResumable.downloadAsync()
        }

        const fileContent = await FileSystem.readAsStringAsync(icaopkdFileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        })

        return icaoPkdStringToCerts2(fileContent)
      })(),
    )
    if (getCSCAsError) {
      console.error('Failed to get CSCAs:', getCSCAsError)
      setIsSubmitting(false)
      return
    }
    const end = performance.now()

    const elapsed = end - start
    console.log(`CSCAs loaded in ${elapsed} ms`)
    console.log('CSCAs:', CSCAs)
    setIsSubmitting(false)
  }

  const testCscaPem = async () => {
    setIsSubmitting(true)
    const start = performance.now()
    const [CSCAs, getCSCAsError] = await tryCatch(
      (async () => {
        const [icaoPemAssetInfo] = await Asset.loadAsync(require('@assets/certificates/ICAO.pem'))

        if (!icaoPemAssetInfo.localUri) throw new TypeError('Dat file not found')

        const icaoPemFileInfo = await FileSystem.getInfoAsync(icaoPemAssetInfo.localUri)

        if (!icaoPemFileInfo.exists) {
          throw new TypeError('ICAO PEM file does not exist')
        }

        const fileContent = await FileSystem.readAsStringAsync(icaoPemFileInfo.uri, {
          encoding: FileSystem.EncodingType.UTF8,
        })

        return icaoPemToCerts(fileContent)
      })(),
    )
    if (getCSCAsError) {
      console.error('Failed to get CSCAs:', getCSCAsError)
      setIsSubmitting(false)
      return
    }
    const end = performance.now()

    const elapsed = end - start
    console.log(`CSCAs loaded in ${elapsed} ms`)
    console.log('CSCAs:', CSCAs)
    setIsSubmitting(false)
  }

  return (
    <AppContainer>
      <UiScreenScrollable
        style={{
          paddingTop: insets.top,
          paddingBottom: bottomBarHeight,
          paddingLeft: appPaddings.left,
          paddingRight: appPaddings.right,
        }}
        className='gap-3'
      >
        <View className='flex gap-4'>
          <Text className='text-textPrimary typography-h2'>{pkdDownloadProgress}</Text>
          <UiButton disabled={isSubmitting} onPress={() => testCsca()} title='Test CSCA' />
          <UiButton disabled={isSubmitting} onPress={testCscaPem} title='Test CSCA PEMs' />
          <UiButton
            disabled={isSubmitting}
            onPress={() => test(Config.PASSPORT_1)}
            title='Test 1'
          />
          <UiButton
            disabled={isSubmitting}
            onPress={() => test(Config.PASSPORT_2)}
            title='Test 2'
          />
          <UiButton
            disabled={isSubmitting}
            onPress={() => test(Config.PASSPORT_3)}
            title='Test 3'
          />
          <UiButton disabled={isSubmitting} onPress={() => test('', testEDoc)} title='Test rsa' />
        </View>
      </UiScreenScrollable>
    </AppContainer>
  )
}
