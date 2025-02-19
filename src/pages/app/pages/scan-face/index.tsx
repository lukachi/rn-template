import { useState } from 'react'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import AppContainer from '@/pages/app/components/AppContainer'
import CheckFace from '@/pages/app/pages/scan-face/components/CheckFace'
import SaveFace from '@/pages/app/pages/scan-face/components/SaveFace'
import { ScanFaceContextProvider } from '@/pages/app/pages/scan-face/context'
import { AppTabScreenProps } from '@/route-types'
import { useAppPaddings, useBottomBarOffset } from '@/theme'
import { UiScreenScrollable } from '@/ui'

// eslint-disable-next-line no-empty-pattern
export default function ScanFace({}: AppTabScreenProps<'ScanFace'>) {
  return (
    <ScanFaceContextProvider>
      <ScanFaceContent />
    </ScanFaceContextProvider>
  )
}

enum Steps {
  SaveFace = 'save-face',
  CheckFace = 'check-face',
  Success = 'success',
}

function ScanFaceContent() {
  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()
  const offset = useBottomBarOffset()

  const [currentStep, setCurrentStep] = useState(Steps.SaveFace)

  return {
    [Steps.SaveFace]: (
      <SaveFace
        onFaceSaved={async () => {
          setCurrentStep(Steps.CheckFace)
        }}
      />
    ),
    [Steps.CheckFace]: (
      <CheckFace
        onFaceChecked={async () => {
          setCurrentStep(Steps.Success)
        }}
      />
    ),
    [Steps.Success]: (
      <AppContainer>
        <UiScreenScrollable
          style={{
            paddingTop: insets.top,
            paddingLeft: appPaddings.left,
            paddingRight: appPaddings.right,
            paddingBottom: offset,
          }}
        >
          <View className='flex flex-1 flex-col'>
            <View className='flex flex-1 items-center'>
              <Text className='text-center typography-subtitle1'>Success</Text>
            </View>
          </View>
        </UiScreenScrollable>
      </AppContainer>
    ),
  }[currentStep]
}
