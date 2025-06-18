import { Circuit } from '@modules/witnesscalculator/src/circuits'
import { Buffer } from 'buffer'
import * as FileSystem from 'expo-file-system'
import { useCallback, useState } from 'react'
import { unzip } from 'react-native-zip-archive'

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
      circuit: Circuit,
    ): Promise<{
      zKeyUri: string
      dat: Uint8Array
    }> => {
      setDownloadingProgress('')
      setIsLoaded(false)
      setIsLoadFailed(false)

      try {
        // const { circuitDownloadUrl } = getCircuitDetailsByType(circuitType)

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
          circuit.downloadUrl,
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
