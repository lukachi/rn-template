import { buildCertTreeAndGenProof, parseLdifString } from '@lukachi/rn-csca'
import { ECParameters } from '@peculiar/asn1-ecc'
import { id_pkcs_1, RSAPublicKey } from '@peculiar/asn1-rsa'
import { AsnConvert } from '@peculiar/asn1-schema'
import { Certificate } from '@peculiar/asn1-x509'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { getBytes, keccak256, toBeArray } from 'ethers'
import { Asset } from 'expo-asset'
import * as FileSystem from 'expo-file-system'
import { useCallback, useMemo, useState } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Config } from '@/config'
import AppContainer from '@/pages/app/components/AppContainer'
import { identityStore } from '@/store'
import { useAppPaddings } from '@/theme'
import { Registration__factory } from '@/types/contracts/factories/Registration__factory'
import { Registration2 } from '@/types/contracts/Registration'
import { UiButton, UiScreenScrollable } from '@/ui'
import { getCircuitHashAlgorithm } from '@/utils/circuits/helpers'
import { ECDSA_ALGO_PREFIX, EDocument, PersonDetails } from '@/utils/e-document'
import { getPublicKeyFromEcParameters } from '@/utils/e-document/helpers/crypto'

const registrationContractInterface = Registration__factory.createInterface()

const newBuildRegisterCertCallData = async (
  CSCABytes: ArrayBuffer[],
  tempEDoc: EDocument,
  masterCert: Certificate,
) => {
  const inclusionProofSiblings = buildCertTreeAndGenProof(
    CSCABytes,
    AsnConvert.serialize(masterCert),
  )

  if (inclusionProofSiblings.length === 0) {
    throw new TypeError('failed to generate inclusion proof')
  }

  console.log({ inclusionProofSiblings })

  const dispatcherName = (() => {
    const masterSubjPubKeyAlg = masterCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm

    if (masterSubjPubKeyAlg.includes(id_pkcs_1)) {
      const bits = (() => {
        if (
          tempEDoc.sod.slaveCertificate.certificate.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm.includes(
            id_pkcs_1,
          )
        ) {
          const slaveRSAPubKey = AsnConvert.parse(
            tempEDoc.sod.slaveCertificate.certificate.tbsCertificate.subjectPublicKeyInfo
              .subjectPublicKey,
            RSAPublicKey,
          )

          const modulusBytes = new Uint8Array(slaveRSAPubKey.modulus)

          const unpaddedRsaPubKey =
            modulusBytes[0] === 0x00 ? modulusBytes.subarray(1) : modulusBytes

          return (unpaddedRsaPubKey.byteLength * 8).toString()
        }

        if (
          tempEDoc.sod.slaveCertificate.certificate.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm.includes(
            ECDSA_ALGO_PREFIX,
          )
        ) {
          if (
            !tempEDoc.sod.slaveCertificate.certificate.tbsCertificate.subjectPublicKeyInfo.algorithm
              .parameters
          )
            throw new TypeError('ECDSA public key does not have parameters')

          const ecParameters = AsnConvert.parse(
            tempEDoc.sod.slaveCertificate.certificate.tbsCertificate.subjectPublicKeyInfo.algorithm
              .parameters,
            ECParameters,
          )

          const [publicKey] = getPublicKeyFromEcParameters(
            ecParameters,
            new Uint8Array(
              tempEDoc.sod.slaveCertificate.certificate.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
            ),
          )

          const rawPoint = new Uint8Array([...toBeArray(publicKey.px), ...toBeArray(publicKey.py)])

          return rawPoint.length * 8
        }
      })()

      let dispatcherName = `C_RSA`

      const circuitHashAlgorithm = getCircuitHashAlgorithm(
        tempEDoc.sod.slaveCertificate.certificate,
      )
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

      if (
        !tempEDoc.sod.slaveCertificate.certificate.tbsCertificate.subjectPublicKeyInfo.algorithm
          .parameters
      ) {
        throw new TypeError('Slave ECDSA public key does not have parameters')
      }

      const masterEcParameters = AsnConvert.parse(
        masterCert.tbsCertificate.subjectPublicKeyInfo.algorithm.parameters,
        ECParameters,
      )

      const slaveEcParameters = AsnConvert.parse(
        tempEDoc.sod.slaveCertificate.certificate.tbsCertificate.subjectPublicKeyInfo.algorithm
          .parameters,
        ECParameters,
      )

      const [, , masterCertCurveName] = getPublicKeyFromEcParameters(
        masterEcParameters,
        new Uint8Array(masterCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey),
      )

      const [slaveCertPubKey] = getPublicKeyFromEcParameters(
        slaveEcParameters,
        new Uint8Array(
          tempEDoc.sod.slaveCertificate.certificate.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
        ),
      )

      const pubKeyBytes = new Uint8Array([
        ...toBeArray(slaveCertPubKey.px),
        ...toBeArray(slaveCertPubKey.py),
      ])

      const bits = pubKeyBytes.length * 8

      let dispatcherName = `C_ECDSA_${masterCertCurveName}`

      const circuitHashAlgorithm = getCircuitHashAlgorithm(
        tempEDoc.sod.slaveCertificate.certificate,
      )
      if (circuitHashAlgorithm) {
        dispatcherName += `_${circuitHashAlgorithm}`
      }

      dispatcherName += `_${bits}`

      return dispatcherName
    }

    throw new Error(`unsupported public key type: ${masterSubjPubKeyAlg}`)
  })()

  const dispatcherHash = getBytes(keccak256(Buffer.from(dispatcherName, 'utf-8')))

  console.log({ dispatcherHash, dispatcherName })

  const certificate: Registration2.CertificateStruct = {
    dataType: dispatcherHash,
    signedAttributes: new Uint8Array(
      AsnConvert.serialize(tempEDoc.sod.slaveCertificate.certificate.tbsCertificate),
    ),
    keyOffset: tempEDoc.sod.slaveCertificate.slaveCertPubKeyOffset,
    expirationOffset: tempEDoc.sod.slaveCertificate.slaveCertExpOffset,
  }
  console.log({ certificate })
  const icaoMember: Registration2.ICAOMemberStruct = {
    signature: tempEDoc.sod.slaveCertificate.getSlaveCertIcaoMemberSignature(masterCert),
    publicKey: tempEDoc.sod.getSlaveCertIcaoMemberKey(masterCert),
  }
  console.log({ icaoMember })

  return registrationContractInterface.encodeFunctionData('registerCertificate', [
    certificate,
    icaoMember,
    inclusionProofSiblings.map(el => Buffer.from(el, 'hex')),
  ])
}

const downloadUrl =
  'https://www.googleapis.com/download/storage/v1/b/rarimo-temp/o/icaopkd-list.ldif?generation=1715355629405816&alt=media'
const icaopkdFileUri = `${FileSystem.documentDirectory}/icaopkd-list.ldif`

export default function PassportTests() {
  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()
  const bottomBarHeight = useBottomTabBarHeight()

  const [isSubmitting, setIsSubmitting] = useState(false)

  const testEDoc = identityStore.useIdentityStore(state => state.testEDoc)

  const downloadResumable = useMemo(() => {
    return FileSystem.createDownloadResumable(downloadUrl, icaopkdFileUri, {})
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
            ...(passport.dg15 && {
              dg15Bytes: new Uint8Array(Buffer.from(passport.dg15, 'base64')),
            }),
          })
        })()

        // console.log(Buffer.from(eDoc.sodBytes).toString('base64'))

        // console.log(eDoc.dg1Bytes)

        // const circuit = new RegistrationCircuit(eDoc)
        // console.log(circuit.name, circuit)

        // console.log(eDoc.sod.slaveCertExpOffset)

        // console.log(Buffer.from(eDoc.dg1Bytes).toString('base64'))
        // console.log(Buffer.from(eDoc.sodBytes).toString('base64'))

        // console.log(
        //   'slave cert pem',
        //   Buffer.from(
        //     toPem(Buffer.from(AsnConvert.serialize(eDoc.sod.slaveCert)).buffer, 'CERTIFICATE'),
        //     'utf-8',
        //   ).toString('base64'),
        // )

        // const x509SlaveCert = new X509Certificate(AsnConvert.serialize(eDoc.sod.slaveCert))

        // console.log({ x509SlaveCert, slaveCert: eDoc.sod.slaveCert })

        // console.log(Hex.encodeString(eDoc.sod.slaveCertificateIndex))

        if (!(await FileSystem.getInfoAsync(icaopkdFileUri)).exists) {
          await downloadResumable.downloadAsync()
        }

        const icaoLdif = await FileSystem.readAsStringAsync(icaopkdFileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        })

        const CSCACertBytes = parseLdifString(icaoLdif)

        const slaveMaster = await eDoc.sod.slaveCertificate.getSlaveMaster(CSCACertBytes)

        // console.log(
        //   'inclusionProof',
        //   inclusionProof.siblings.map(el => Hex.encodeString(getBytes(el))),
        // )

        // console.log(
        //   'slave',
        //   Hex.encodeString(new Uint8Array(AsnConvert.serialize(eDoc.sod.slaveCert))),
        // )

        // console.log(
        //   'slaveMaster',
        //   Hex.encodeString(new Uint8Array(AsnConvert.serialize(slaveMaster))),
        // )

        // const slaveCertIcaoMemberKey = eDoc.sod.getSlaveCertIcaoMemberKey(slaveMaster)

        // console.log('slaveCertIcaoMemberKey', Hex.encodeString(slaveCertIcaoMemberKey))
        // console.log(
        //   'extractRawPubKey(masterCert)',
        //   Hex.encodeString(extractRawPubKey(eDoc.sod.slaveCert)),
        // )

        // console.log(
        //   Buffer.from(
        //     toPem(Buffer.from(AsnConvert.serialize(slaveMaster)).buffer, 'CERTIFICATE'),
        //     'utf-8',
        //   ).toString('base64'),
        // )
        // console.log(Hex.encodeString(eDoc.sod.getSlaveCertIcaoMemberSignature(slaveMaster)))

        // console.log(CSCACertBytes.length)

        const callData = await newBuildRegisterCertCallData(CSCACertBytes, eDoc, slaveMaster)

        console.log(callData)
      } catch (error) {
        console.error('Error during test:', error)
      }
      setIsSubmitting(false)
    },
    [downloadResumable],
  )

  const testCert = useCallback(async () => {
    const [authAsset] = await Asset.loadAsync(require('@assets/certificates/AuthCert_0897A6C3.cer'))

    if (!authAsset.localUri) throw new Error('authAsset local URI is not available')

    const authAssetInfo = await FileSystem.getInfoAsync(authAsset.localUri)

    if (!authAssetInfo.uri) throw new Error('authAsset local URI is not available')

    const authFileContent = await FileSystem.readAsStringAsync(authAssetInfo.uri, {
      encoding: FileSystem.EncodingType.Base64,
    })

    const authContentBytes = Buffer.from(authFileContent, 'base64')

    const authCertificate = AsnConvert.parse(authContentBytes, Certificate)

    console.log({ authCertificate })

    // ------------------------------------------------------------------------------------------------------------------------------

    const [signingCertAsset] = await Asset.loadAsync(
      require('@assets/certificates/SigningCert_084384FC.cer'),
    )

    if (!signingCertAsset.localUri) throw new Error('signingCertAsset local URI is not available')

    const signingCertAssetInfo = await FileSystem.getInfoAsync(signingCertAsset.localUri)

    if (!signingCertAssetInfo.uri) throw new Error('signingCertAsset local URI is not available')

    const signingCertFileContent = await FileSystem.readAsStringAsync(signingCertAssetInfo.uri, {
      encoding: FileSystem.EncodingType.Base64,
    })

    const signingCertFileContentBytes = Buffer.from(signingCertFileContent, 'base64')

    console.log(AsnConvert.parse(signingCertFileContentBytes, Certificate))
  }, [])

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
          <UiButton disabled={isSubmitting} onPress={testCert} title='Test Cert' />
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
          <UiButton
            disabled={isSubmitting}
            onPress={() => test(Config.PASSPORT_4)}
            title='Test 4'
          />
          <UiButton
            disabled={isSubmitting}
            onPress={() => test(Config.PASSPORT_5)}
            title='Test 5'
          />
          <UiButton
            disabled={isSubmitting}
            onPress={() => test(Config.PASSPORT_6)}
            title='Test 6'
          />
          <UiButton disabled={isSubmitting} onPress={() => test('', testEDoc)} title='Test rsa' />
        </View>
      </UiScreenScrollable>
    </AppContainer>
  )
}
