import type { EDocument } from '@modules/e-document'
import { getCircuitType } from '@modules/e-document'
import { getPublicKeyPem, getSlaveCertificatePem } from '@modules/e-document'
import {
  buildRegisterCertificateCallData,
  getSlaveCertIndex,
  getX509RSASize,
} from '@modules/rarime-sdk'
import type { AxiosError } from 'axios'
import { Buffer } from 'buffer'
import { JsonRpcProvider } from 'ethers'
import { useAssets } from 'expo-asset'
import * as FileSystem from 'expo-file-system'
import { create } from 'zustand'
import { combine, createJSONStorage, persist } from 'zustand/middleware'

import { RARIMO_CHAINS } from '@/api/modules/rarimo'
import { register } from '@/api/modules/registration'
import { Config } from '@/config'
import { createPoseidonSMTContract } from '@/helpers'
import { zustandSecureStorage } from '@/store/helpers'

import { CertificateAlreadyRegisteredError } from './errors'

const useIdentityStore = create(
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
    const evmRpcUrl = RARIMO_CHAINS[Config.RMO_CHAIN_ID].rpcEvm

    const jsonRpcProvider = new JsonRpcProvider(evmRpcUrl)

    const { contractInstance } = createPoseidonSMTContract(
      Config.CERT_POSEIDON_SMT_CONTRACT_ADDRESS,
      jsonRpcProvider,
    )

    const proof = await contractInstance.getProof(slaveCertIdx)

    if (proof.existence) {
      throw new CertificateAlreadyRegisteredError()
    }

    try {
      const callData = await buildRegisterCertificateCallData(
        Config.ICAO_COSMOS_GRPC,
        slaveCertPem,
        Config.MASTER_CERTIFICATES_BUCKETNAME,
        Config.MASTER_CERTIFICATES_FILENAME,
      )

      const { data } = await register(
        '0x' + Buffer.from(callData).toString('hex'),
        Config.REGISTRATION_CONTRACT_ADDRESS,
      )

      const tx = await jsonRpcProvider.getTransaction(data.tx_hash)

      if (!tx) throw new TypeError('Transaction not found')

      await tx.wait()
    } catch (error) {
      const axiosError = error as AxiosError

      if (JSON.stringify(axiosError.response?.data?.errors)?.includes('the key already exists')) {
        throw new CertificateAlreadyRegisteredError()
      }

      throw axiosError
    }
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

    const pubKeySize = await getX509RSASize(publicKeyPem)

    const slaveCertPem: Uint8Array = await getSlaveCertificatePem(sodBytes)

    const slaveCertIdx = await getSlaveCertIndex(slaveCertPem, icaoBytes)

    const circuitType = getCircuitType(pubKeySize)

    if (!circuitType) throw new TypeError('Unsupported public key size')

    try {
      await registerCertificate(slaveCertPem, slaveCertIdx)
    } catch (error) {
      console.log(error)
      if (error instanceof CertificateAlreadyRegisteredError) {
        console.log('Certificate already registered') // TODO
      }
    }

    try {
      // const { zkey, dat } = await loadCircuit(circuitType)
      //
      // const zkProof = await generateRegisterIdentityProof(eDoc, zkey, dat)
    } catch (error) {}
  }

  return {
    // isCircuitsLoaded: restCircuit.isLoaded,
    // isCircuitsLoadFailed: restCircuit.isLoadFailed,
    // circuitsDownloadingProgress: restCircuit.downloadingProgress,

    registerIdentity,
  }
}

export const identityStore = {
  useIdentityStore,

  useIdentityRegistration,
}
