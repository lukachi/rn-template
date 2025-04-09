import { execTFLite } from '@modules/tf-exec'
import { Asset } from 'expo-asset'
import { createContext, PropsWithChildren, useContext, useState } from 'react'

import { useLoading } from '@/hooks'

type ScanFaceContext = {
  firstFeatureVectors: Uint8Array<ArrayBufferLike>
  setFirstFeatureVectors: (value: Uint8Array<ArrayBufferLike>) => void
  secondFeatureVectors: Uint8Array<ArrayBufferLike>
  setSecondFeatureVectors: (value: Uint8Array<ArrayBufferLike>) => void

  getFaceFeatureVectors: (
    resizedImage: Uint8Array<ArrayBufferLike>,
  ) => Promise<Uint8Array<ArrayBufferLike>>

  arcFaceAsset: Asset
}

const scanFaceContext = createContext<ScanFaceContext>({
  firstFeatureVectors: new Uint8Array(),
  setFirstFeatureVectors: () => {},
  secondFeatureVectors: new Uint8Array(),
  setSecondFeatureVectors: () => {},

  getFaceFeatureVectors: () => Promise.resolve(new Uint8Array()),

  arcFaceAsset: {} as Asset,
})

export const ScanFaceContextProvider = (props: PropsWithChildren) => {
  const [firstFeatureVectors, setFirstFeatureVectors] = useState<Uint8Array>(new Uint8Array())
  const [secondFeatureVectors, setSecondFeatureVectors] = useState<Uint8Array>(new Uint8Array())

  const { data: arcFaceAsset } = useLoading<Asset | undefined>(undefined, async () => {
    const response = Asset.fromModule(require('@assets/models/bionet_v3_medium.tflite'))
    // const response = Asset.fromModule(require('@assets/models/arcface_2.tflite'))

    if (!response.downloaded) {
      await response.downloadAsync()
    }

    return response
  })

  const getFaceFeatureVectors = async (resizedImage: Uint8Array<ArrayBufferLike>) => {
    if (!arcFaceAsset?.localUri) throw new Error('No model localUri')

    const normalized = Object.values(JSON.parse(JSON.stringify(resizedImage))).map(el =>
      String(Number(el) / 255),
    )

    return execTFLite(arcFaceAsset.localUri, normalized)
  }

  if (!arcFaceAsset) return null

  return (
    <scanFaceContext.Provider
      {...props}
      value={{
        firstFeatureVectors,
        setFirstFeatureVectors,
        secondFeatureVectors,
        setSecondFeatureVectors,

        getFaceFeatureVectors,

        arcFaceAsset,
      }}
    />
  )
}

export const useScanFaceContext = () => {
  return useContext(scanFaceContext)
}
