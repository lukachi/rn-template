import { DocType } from '@modules/e-document'
import { useAppState } from '@react-native-community/hooks'
import { useIsFocused } from '@react-navigation/native'
import { parse } from 'mrz'
import { useCallback, useEffect, useMemo } from 'react'
import type { ViewProps } from 'react-native'
import { ScrollView, Text, View } from 'react-native'
import {
  Camera,
  runAtTargetFps,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera'
import { useTextRecognition } from 'react-native-vision-camera-text-recognition'
import { Worklets } from 'react-native-worklets-core'

import { bus, DefaultBusEvents } from '@/core'
import { useDocumentScanContext } from '@/pages/app/pages/document-scan/context'
import { UiButton } from '@/ui'

const useMrzParser = (docType: DocType) => {
  const idCardParser = useCallback((lines: string[]) => {
    const numlinesToCheck = 3

    const possibleMRZLines = lines?.slice(-numlinesToCheck)

    if (!possibleMRZLines?.length || possibleMRZLines.length !== numlinesToCheck) return

    // const tdLength = possibleMRZLines[1].length
    const tdLength = 30

    const sanitizedMRZLines = possibleMRZLines.map(el => {
      return el.replaceAll('«', '<<').replaceAll(' ', '').toUpperCase()
    })

    console.log(sanitizedMRZLines)

    sanitizedMRZLines[2] = sanitizedMRZLines[2].padEnd(tdLength, '<').toUpperCase()

    return parse(sanitizedMRZLines, {
      autocorrect: true,
    })
  }, [])

  const passportParser = useCallback((lines: string[]) => {
    const numlinesToCheck = 2

    const possibleMRZLines = lines?.slice(-numlinesToCheck)

    if (!possibleMRZLines?.length || possibleMRZLines.length !== numlinesToCheck) return

    // const tdLength = possibleMRZLines[1].length
    const tdLength = 44

    const sanitizedMRZLines = possibleMRZLines.map(el => {
      return el.replaceAll('«', '<<').replaceAll(' ', '').toUpperCase()
    })

    sanitizedMRZLines[0] = sanitizedMRZLines[0].padEnd(tdLength, '<').toUpperCase()

    return parse(sanitizedMRZLines, {
      autocorrect: true,
    })
  }, [])

  return {
    [DocType.ID]: idCardParser,
    [DocType.PASSPORT]: passportParser,
  }[docType]
}

type Props = {} & ViewProps

export default function ScanMrzStep({}: Props) {
  const { docType, setMrz } = useDocumentScanContext()

  const isFocused = useIsFocused()
  const currentAppState = useAppState()

  const device = useCameraDevice('back')
  const { hasPermission, requestPermission } = useCameraPermission()

  const { scanText } = useTextRecognition({
    language: 'latin',
  })

  const mrzParser = useMrzParser(docType ?? DocType.PASSPORT)

  const onMRZDetected = Worklets.createRunOnJS((lines: string[]) => {
    try {
      const result = mrzParser(lines)

      if (result?.valid) {
        bus.emit(DefaultBusEvents.success, {
          message: 'MRZ Detected',
        })
        setMrz(result.fields)
      }
    } catch (error) {
      console.log(error)
    }
  })

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet'

      // FIXME: https://github.com/mrousavy/react-native-vision-camera/issues/2820
      runAtTargetFps(2, async () => {
        'worklet'

        const data = scanText(frame)

        try {
          let resultText: string = ''

          if (data) {
            console.log('data')
            if (data?.length) {
              console.log('Array.isArray')
              resultText = data.map(el => el.resultText).join('\n')
            } else if ('resultText' in data) {
              console.log('isObject')
              resultText = data.resultText as string
            } else {
              resultText = 'non of these, the actual'
            }

            console.log('resultText', resultText)

            if (resultText) {
              await onMRZDetected(resultText.split('\n'))
            }
          }
        } catch (error) {
          console.log('error', {
            ...error,
          })
        }
      })
    },
    [scanText, onMRZDetected],
  )

  const isActive = useMemo(() => {
    return isFocused && currentAppState === 'active'
  }, [currentAppState, isFocused])

  useEffect(() => {
    if (hasPermission) return

    requestPermission()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View className='flex flex-1 flex-col'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {isActive && (
          <>
            {hasPermission ? (
              <>
                {device && (
                  <Camera
                    style={{
                      marginTop: 50,
                      width: '100%',
                      height: '50%',
                    }}
                    device={device}
                    isActive={isActive}
                    enableFpsGraph={true}
                    frameProcessor={frameProcessor}
                  />
                )}
              </>
            ) : (
              <>
                <View>
                  <Text className='text-textPrimary typography-h4'>
                    Requesting Camera Permission
                  </Text>

                  <UiButton onPress={requestPermission} title='Request Permission' />
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  )
}
