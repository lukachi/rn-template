import { Asset } from 'expo-asset'
import { createContext, PropsWithChildren, useContext } from 'react'
import {
  type ISharedValue,
  useSharedValue as useWorkletSharedValue,
} from 'react-native-worklets-core'

import { useLoading } from '@/hooks'

type ScanFaceContext = {
  firstFeatureVectors: ISharedValue<Uint8Array<ArrayBufferLike>>
  secondFeatureVectors: ISharedValue<Uint8Array<ArrayBufferLike>>

  arcFaceAsset: Asset
}

const scanFaceContext = createContext<ScanFaceContext>({
  firstFeatureVectors: {} as ISharedValue<Uint8Array<ArrayBufferLike>>,
  secondFeatureVectors: {} as ISharedValue<Uint8Array<ArrayBufferLike>>,

  arcFaceAsset: {} as Asset,
})

export const ScanFaceContextProvider = (props: PropsWithChildren) => {
  const firstFeatureVectors = useWorkletSharedValue<Uint8Array>(new Uint8Array())
  const secondFeatureVectors = useWorkletSharedValue<Uint8Array>(new Uint8Array())

  const { data: arcFaceAsset } = useLoading<Asset | undefined>(undefined, async () => {
    const response = Asset.fromModule(require('@assets/models/arcface_2.tflite'))

    if (!response.downloaded) {
      await response.downloadAsync()
    }

    return response
  })

  if (!arcFaceAsset) return null

  return (
    <scanFaceContext.Provider
      {...props}
      value={{ firstFeatureVectors, secondFeatureVectors, arcFaceAsset }}
    />
  )
}

export const useScanFaceContext = () => {
  return useContext(scanFaceContext)
}
