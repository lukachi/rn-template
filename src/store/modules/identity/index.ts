import type { EDocument } from '@modules/e-document'
import { CircuitType } from '@modules/e-document'
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
import get from 'lodash/get'
import { useCallback, useState } from 'react'
import { unzip } from 'react-native-zip-archive'
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

const useCircuit = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoadFailed, setIsLoadFailed] = useState(false)
  const [downloadingProgress, setDownloadingProgress] = useState('')

  const loadCircuit = useCallback(
    async (
      circuitType: CircuitType,
    ): Promise<{
      zKey: Uint8Array
      dat: Uint8Array
    } | null> => {
      setDownloadingProgress('')
      setIsLoaded(false)
      setIsLoadFailed(false)

      try {
        const circuitDownloadUrl = {
          [CircuitType.RegisterIdentityUniversalRSA2048]:
            'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.1.0-alpha/registerIdentityUniversalRSA2048-download.zip',
          [CircuitType.RegisterIdentityUniversalRSA4096]:
            'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.1.0-alpha/registerIdentityUniversalRSA4096-download.zip',
        }[circuitType]

        const fileUri = `${FileSystem.documentDirectory}${circuitType}.zip`
        const targetPath = `${FileSystem.documentDirectory}${circuitType}`
        const zkeyPath = `${targetPath}/circuit_final.zkey`
        const datPath = `${targetPath}/${circuitType}.dat`

        console.log('Downloading circuit from ', circuitDownloadUrl)
        console.log('Saving to ', fileUri)
        console.log('Unzipping to ', targetPath)

        console.log('zkeyPath', zkeyPath)
        console.log('datPath', datPath)

        // Check if the zkey and dat files already exist
        const zkeyInfo = await FileSystem.getInfoAsync(zkeyPath)
        const datInfo = await FileSystem.getInfoAsync(datPath)
        console.log('zkeyInfo', zkeyInfo)
        console.log('datInfo', datInfo)

        if (zkeyInfo.exists && datInfo.exists) {
          console.log('Files already exist, loading from cache.')

          const zkey = await FileSystem.readAsStringAsync(zkeyPath, {
            encoding: FileSystem.EncodingType.Base64,
          })
          const dat = await FileSystem.readAsStringAsync(datPath, {
            encoding: FileSystem.EncodingType.Base64,
          })

          setIsLoaded(true)

          return {
            zKey: Buffer.from(zkey, 'base64'),
            dat: Buffer.from(dat, 'base64'),
          }
        }

        const downloadResumable = FileSystem.createDownloadResumable(
          circuitDownloadUrl,
          fileUri,
          {},
          downloadProgress => {
            setDownloadingProgress(
              `${downloadProgress.totalBytesWritten} / ${downloadProgress.totalBytesExpectedToWrite}`,
            )
          },
        )

        const downloadResult = await downloadResumable.downloadAsync()

        if (!downloadResult) {
          throw new TypeError('Download failed')
        }

        console.log('Finished downloading to ', downloadResult.uri)

        await unzip(downloadResult.uri, targetPath)
        console.log('Unzipped to ', targetPath)

        const zkey = await FileSystem.readAsStringAsync(zkeyPath, {
          encoding: FileSystem.EncodingType.Base64,
        })
        const dat = await FileSystem.readAsStringAsync(datPath, {
          encoding: FileSystem.EncodingType.Base64,
        })

        setIsLoaded(true)

        return {
          zKey: Buffer.from(zkey, 'base64'),
          dat: Buffer.from(dat, 'base64'),
        }
      } catch (error) {
        console.error('Error in loadCircuit: ', error)
        setIsLoadFailed(true)
      }

      setIsLoaded(false)
      return null
    },
    [],
  )

  return {
    isLoaded,
    isLoadFailed,
    downloadingProgress,
    loadCircuit,
  }
}

const useIdentityRegistration = (eDoc: EDocument) => {
  const [assets] = useAssets([require('@assets/certificates/ICAO.pem')])

  const { loadCircuit, ...restCircuit } = useCircuit()

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

      if (
        JSON.stringify(get(axiosError, 'response.data.errors', {}))?.includes(
          'the key already exists',
        )
      ) {
        throw new CertificateAlreadyRegisteredError()
      }

      throw axiosError
    }
  }

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
      console.log('Registering certificate')
      await registerCertificate(slaveCertPem, slaveCertIdx)
    } catch (error) {
      console.log(error)
      if (error instanceof CertificateAlreadyRegisteredError) {
        console.log('Certificate already registered') // TODO
      }
    }

    try {
      console.log('Loading circuit for ', circuitType)
      const circuitsLoadingResult = await loadCircuit(circuitType)

      if (!circuitsLoadingResult) throw new TypeError('Circuit loading failed')

      // const zkProof = await generateRegisterIdentityProof(eDoc, zkey, dat)
    } catch (error) {
      console.log(error)
    }
  }

  return {
    isCircuitsLoaded: restCircuit.isLoaded,
    isCircuitsLoadFailed: restCircuit.isLoadFailed,
    circuitsDownloadingProgress: restCircuit.downloadingProgress,

    registerIdentity,
  }
}

export const identityStore = {
  useIdentityStore,

  useIdentityRegistration: useIdentityRegistration,
}
