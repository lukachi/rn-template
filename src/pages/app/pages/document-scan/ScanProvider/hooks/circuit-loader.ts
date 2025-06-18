import { Buffer } from 'buffer'
import * as FileSystem from 'expo-file-system'
import { useCallback, useState } from 'react'
import { unzip } from 'react-native-zip-archive'

import { RegistrationCircuit } from '@/utils/circuits/registration-circuit'

export const useCircuit = () => {
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
      circuit: RegistrationCircuit,
    ): Promise<{
      zKeyUri: string
      dat: Uint8Array
    }> => {
      setDownloadingProgress('')
      setIsLoaded(false)
      setIsLoadFailed(false)

      try {
        // const { circuitDownloadUrl } = getCircuitDetailsByType(circuitType)

        const fileUri = `${FileSystem.documentDirectory}${circuit.circuitParams.name}.zip`
        const targetPath = `${FileSystem.documentDirectory}${circuit.circuitParams.name}`

        const circuitDirSubpath = `${circuit.circuitParams.name}-download`
        const zkeyPath = `${targetPath}/${circuitDirSubpath}/circuit_final.zkey`
        const datPath = `${targetPath}/${circuitDirSubpath}/${circuit.circuitParams.name}.dat`

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
          circuit.circuitParams.downloadUrl,
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

        await unzip(downloadResult.uri, targetPath)

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
