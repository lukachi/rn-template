import type { EDocument } from '@modules/e-document'
import { getCircuitType } from '@modules/e-document'
import { getPublicKeyPem, getSlaveCertificatePem } from '@modules/e-document'
import { getSlaveCertIndex, getX509RSASize } from '@modules/rarime-sdk'
import { Buffer } from 'buffer'
import { JsonRpcProvider } from 'ethers'
import { useAssets } from 'expo-asset'
import * as FileSystem from 'expo-file-system'
import { create } from 'zustand'
import { combine, createJSONStorage, persist } from 'zustand/middleware'

import { createPoseidonSMTContract } from '@/helpers'
import { zustandSecureStorage } from '@/store/helpers'

const useDocumentsStore = create(
  persist(
    combine(
      {
        documents: [] as EDocument[],

        _hasHydrated: false,
      },
      set => ({
        setHasHydrated: (value: boolean) => {
          set({
            _hasHydrated: value,
          })
        },
      }),
    ),
    {
      name: 'documents',
      version: 1,
      storage: createJSONStorage(() => zustandSecureStorage),

      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true)
      },

      partialize: state => ({ privateKey: state.documents }),
    },
  ),
)

// const useCircuit = () => {
//   const [isLoaded, setIsLoaded] = useState(false)
//   const [isLoadFailed, setIsLoadFailed] = useState(false)
//
//   const [downloadingProgress, setDownloadingProgress] = useState(0)
//
//   const loadCircuit = useCallback(
//     async (
//       circuitType: CircuitType,
//     ): Promise<{
//       zkey: Uint8Array
//       dat: Uint8Array
//     } | null> => {
//       setIsLoaded(false)
//       setIsLoadFailed(false)
//
//       try {
//         const zkey = await downloadZKeyOrGetFromCache()
//         const dat = await downloadZKeyOrGetFromCache()
//
//         return { zkey, dat }
//       } catch (error) {
//         setIsLoadFailed(true)
//       }
//
//       setIsLoaded(true)
//
//       return null
//     },
//     [],
//   )
//
//   return {
//     isLoaded,
//     isLoadFailed,
//     downloadingProgress,
//
//     loadCircuit,
//   }
// }

const useIdentityRegistration = (eDoc: EDocument) => {
  const [assets] = useAssets([require('@assets/certificates/ICAO.pem')])

  // const { loadCircuit, ...restCircuit } = useCircuit()
  //
  const registerCertificate = async (slaveCertPem: Uint8Array, slaveCertIdx: Uint8Array) => {
    const jsonRpcProvider = new JsonRpcProvider('https://rpc.evm.node1.mainnet-beta.rarimo.com')

    const { contractInstance } = createPoseidonSMTContract(
      '0xb393B0F444fC849bC61E3285C6c38b1052520007',
      jsonRpcProvider,
    )

    const proof = await contractInstance.getProof(slaveCertIdx)

    console.log('existence', proof.existence)

    // if (proof.existence) {
    //   throw CertificateAlreadyRegisteredError()
    // }

    // // icaoCosmosRpc, masterCertificatesBucketName, masterCertificatesFileName
    // const RegisterCertificateCallData = buildRegisterCertificateCalldata(slaveCertPem)
    //
    // const { txHash } = await relayerApi.register(RegisterCertificateCallData)
    //
    // const tx = getTxByHash(txHash)
    //
    // await tx.wait()
  }
  //
  // const generateRegisterIdentityProof = async (
  //   eDoc: EDocument,
  //   zkey: Uint8Array,
  //   dat: Uint8Array,
  // ): Promise<any> => {
  //   // FIXME: ZkProof type
  //   const inputs = rarimeSdk.buildRegisterIdentityInputs(
  //     sod.getEncapsulatedContent(),
  //     sod.getSignedAttributes(),
  //     eDoc.dg1,
  //     eDoc.dg15,
  //     publicKeyPem,
  //     sod.getSignature(),
  //     JSON.stringify(certificatesSMTContract.getProof(slaveCertificateIndex)),
  //   )
  // }

  const registerIdentity = async () => {
    if (!eDoc.sod) throw new TypeError('SOD not found')

    const icaoAsset = assets?.[0]

    if (!icaoAsset?.localUri) throw new TypeError('ICAO asset not found')

    const icaoBase64 = await FileSystem.readAsStringAsync(icaoAsset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    })
    const icaoBytes = Buffer.from(icaoBase64, 'base64')

    const sodBytes = Buffer.from(eDoc.sod, 'base64')

    const publicKeyPem = await getPublicKeyPem(sodBytes)
    console.log('publicKeyPem', publicKeyPem)

    const pubKeySize = await getX509RSASize(publicKeyPem)
    console.log('pubKeySize', pubKeySize)

    const slaveCertPem: Uint8Array = await getSlaveCertificatePem(sodBytes)
    console.log('slaveCertPem', slaveCertPem)

    const slaveCertIdx = await getSlaveCertIndex(slaveCertPem, icaoBytes)
    console.log('slaveCertIdx', slaveCertIdx)

    const circuitType = getCircuitType(pubKeySize)
    console.log('circuitType', circuitType)

    if (!circuitType) throw new TypeError('Unsupported public key size')

    try {
      console.log('registerCertificate')
      await registerCertificate(slaveCertPem, slaveCertIdx)

      // const { zkey, dat } = await loadCircuit(circuitType)
      //
      // const zkProof = await generateRegisterIdentityProof(eDoc, zkey, dat)
    } catch (error) {
      // TODO: handle errors
    }
  }

  return {
    // isCircuitsLoaded: restCircuit.isLoaded,
    // isCircuitsLoadFailed: restCircuit.isLoadFailed,
    // circuitsDownloadingProgress: restCircuit.downloadingProgress,

    registerIdentity,
  }
}

export const documentsStore = {
  useDocumentsStore,

  useIdentityRegistration,
}
