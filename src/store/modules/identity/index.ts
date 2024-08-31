import type { EDocument } from '@modules/e-document'
import { getSodSignature } from '@modules/e-document'
import { getSodSignedAttributes } from '@modules/e-document'
import { getSodEncapsulatedContent } from '@modules/e-document'
import { CircuitType } from '@modules/e-document'
import { getCircuitType } from '@modules/e-document'
import { getPublicKeyPem, getSlaveCertificatePem } from '@modules/e-document'
import {
  buildRegisterCertificateCallData,
  buildRegisterIdentityInputs,
  getSlaveCertIndex,
  getX509RSASize,
} from '@modules/rarime-sdk'
import {
  calcWtnsRegisterIdentityUniversalRSA2048,
  calcWtnsRegisterIdentityUniversalRSA4096,
} from '@modules/witnesscalculator'
import type { AxiosError } from 'axios'
import { Buffer } from 'buffer'
import { JsonRpcProvider } from 'ethers'
import { useAssets } from 'expo-asset'
import * as FileSystem from 'expo-file-system'
import get from 'lodash/get'
import { useCallback, useMemo, useState } from 'react'
import { unzip } from 'react-native-zip-archive'
import { create } from 'zustand'
import { combine, createJSONStorage, persist } from 'zustand/middleware'

import { RARIMO_CHAINS } from '@/api/modules/rarimo'
import { register } from '@/api/modules/registration'
import { Config } from '@/config'
import { createPoseidonSMTContract } from '@/helpers'
import { zustandSecureStorage } from '@/store/helpers'
import { walletStore } from '@/store/modules/wallet'

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

  const checkCircuitsLoaded = useCallback(async (zkeyPath: string, datPath: string) => {
    const zkeyInfo = await FileSystem.getInfoAsync(zkeyPath)
    const datInfo = await FileSystem.getInfoAsync(datPath)

    return zkeyInfo.exists && datInfo.exists
  }, [])

  const loadCircuit = useCallback(
    async (
      circuitType: CircuitType,
    ): Promise<{
      zKeyUri: string
      dat: Uint8Array
    }> => {
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

        const circuitDirSubpath = `${circuitType}-download`
        const zkeyPath = `${targetPath}/${circuitDirSubpath}/circuit_final.zkey`
        const datPath = `${targetPath}/${circuitDirSubpath}/${circuitType}.dat`

        const isCircuitsLoaded = await checkCircuitsLoaded(zkeyPath, datPath)

        if (isCircuitsLoaded) {
          const dat = await FileSystem.readAsStringAsync(datPath, {
            encoding: FileSystem.EncodingType.Base64,
          })

          setIsLoaded(true)

          return {
            zKeyUri: zkeyPath,
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
          throw new TypeError('Download failed: downloadResult is undefined')
        }

        console.log('Finished downloading to ', downloadResult.uri)

        await unzip(downloadResult.uri, targetPath)
        console.log('Unzipped to ', targetPath)

        const dat = await FileSystem.readAsStringAsync(datPath, {
          encoding: FileSystem.EncodingType.Base64,
        })

        setIsLoaded(true)

        return {
          zKeyUri: zkeyPath,
          dat: Buffer.from(dat, 'base64'),
        }
      } catch (error) {
        console.error('Error in loadCircuit: ', error)
        setIsLoadFailed(true)
      }

      setIsLoaded(false)
      throw new TypeError('Circuit loading failed without error')
    },
    [checkCircuitsLoaded],
  )

  return {
    isLoaded,
    isLoadFailed,
    downloadingProgress,
    loadCircuit,
  }
}

const useIdentityRegistration = (eDoc: EDocument) => {
  const privateKey = walletStore.useWalletStore(state => state.privateKey)

  const [assets] = useAssets([require('@assets/certificates/ICAO.pem')])

  const { loadCircuit, ...restCircuit } = useCircuit()

  const rmoEvmJsonRpcProvider = useMemo(() => {
    const evmRpcUrl = RARIMO_CHAINS[Config.RMO_CHAIN_ID].rpcEvm

    return new JsonRpcProvider(evmRpcUrl)
  }, [])

  const sertPoseidonSMTContract = useMemo(() => {
    return createPoseidonSMTContract(
      Config.CERT_POSEIDON_SMT_CONTRACT_ADDRESS,
      rmoEvmJsonRpcProvider,
    )
  }, [rmoEvmJsonRpcProvider])

  const registerCertificate = useCallback(
    async (slaveCertPem: Uint8Array) => {
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

        const tx = await rmoEvmJsonRpcProvider.getTransaction(data.tx_hash)

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
    },
    [rmoEvmJsonRpcProvider],
  )

  const generateRegisterIdentityInputs = useCallback(
    async ({
      sod,
      pubKeyPem,
      smtProofJson,
      dg1,
      dg15,
    }: {
      sod: Uint8Array
      pubKeyPem: Uint8Array
      smtProofJson: Uint8Array
      dg1: Uint8Array
      dg15: Uint8Array
    }): Promise<Uint8Array> => {
      const encapsulatedContent = await getSodEncapsulatedContent(sod)
      const signedAttributes = await getSodSignedAttributes(sod)
      const sodSignature = await getSodSignature(sod)

      const inputsBytes = await buildRegisterIdentityInputs({
        privateKeyHex: `0x${privateKey}`,
        encapsulatedContent,
        signedAttributes,
        sodSignature,
        dg1,
        dg15,
        pubKeyPem,
        smtProofJson,
      })

      return inputsBytes
    },
    [privateKey],
  )

  const registerIdentity = useCallback(async () => {
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
    const slaveCertPem = await getSlaveCertificatePem(sodBytes)
    const slaveCertIdx = await getSlaveCertIndex(slaveCertPem, icaoBytes)
    const circuitType = getCircuitType(pubKeySize)

    if (!circuitType) throw new TypeError('Unsupported public key size')

    const smtProof = await sertPoseidonSMTContract.contractInstance.getProof(slaveCertIdx)

    if (!smtProof.existence) {
      try {
        await registerCertificate(slaveCertPem)
      } catch (error) {
        console.log(error)
        if (error instanceof CertificateAlreadyRegisteredError) {
          console.log('Certificate already registered') // TODO
        }
      }
    }

    try {
      const circuitsLoadingResult = await loadCircuit(circuitType)

      if (!circuitsLoadingResult) throw new TypeError('Circuit loading failed')

      const registerIdentityInputs = await generateRegisterIdentityInputs({
        sod: sodBytes,
        pubKeyPem: publicKeyPem,
        smtProofJson: Buffer.from(
          JSON.stringify({
            root: Buffer.from(smtProof.root).toString('base64'),
            siblings: smtProof.siblings.map(el => Buffer.from(el).toString('base64')),
            // existence: smtProof.existence,
          }),
        ),
        dg1: Buffer.from(eDoc.dg1!, 'base64'),
        dg15: Buffer.from(eDoc.dg15!, 'base64'),

        // zkeyUri: circuitsLoadingResult.zKeyUri,
        // dat: circuitsLoadingResult.dat,
      })

      const registerIdentityInputsJson = Buffer.from(registerIdentityInputs).toString()

      const registerIdentityWtnsCalc = {
        [CircuitType.RegisterIdentityUniversalRSA2048]: calcWtnsRegisterIdentityUniversalRSA2048,
        [CircuitType.RegisterIdentityUniversalRSA4096]: calcWtnsRegisterIdentityUniversalRSA4096,
      }[circuitType]

      const registerIdentityWtnsBytes = await registerIdentityWtnsCalc(
        circuitsLoadingResult.dat,
        Buffer.from(registerIdentityInputsJson, 'base64'),
      )

      console.log(registerIdentityWtnsBytes)

      // const registerIdentityZkProof = await groth16ProveWithZKeyFilePath(
      //   registerIdentityWtnsBytes,
      //   circuitsLoadingResult.zKeyUri,
      // )
      //
      // console.log(Buffer.from(registerIdentityZkProof).toString())
    } catch (error) {
      console.log(error)
    }
  }, [
    assets,
    eDoc.dg1,
    eDoc.dg15,
    eDoc.sod,
    generateRegisterIdentityInputs,
    loadCircuit,
    registerCertificate,
    sertPoseidonSMTContract.contractInstance,
  ])

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
