import { useState } from 'react'
import { View } from 'react-native'

enum Steps {
  EnablePassword = 'enable-password',
  SetPassword = 'set-password',
  EnableBiometrics = 'enable-biometrics',
}

export default function EnableLocalAuthFlow(onFinish: () => void) {
  const [currentStep, setCurrentStep] = useState<Steps>(Steps.EnablePassword)

  const setPassword = async (password: string) => {
    // setCurrentStep(Steps.EnableBiometrics)
  }

  const setBiometrics = async () => {
    // onFinish()
  }

  return {
    [Steps.EnablePassword]: EnablePasswordScreen(
      () => onFinish(),
      () => setCurrentStep(Steps.SetPassword),
    ),
    [Steps.SetPassword]: SetPasswordScreen(
      () => setCurrentStep(Steps.EnablePassword),
      (password: string) => {
        setPassword(password)
      },
    ),
    [Steps.EnableBiometrics]: EnableBiometricsScreen(
      () => onFinish(),
      () => setBiometrics(),
    ),
  }[currentStep]
}

function EnablePasswordScreen(onSkip: () => void, onNext: () => void) {
  return <View />
}

function SetPasswordScreen(onBack: () => void, onNext: (password: string) => void) {
  return <View />
}

function EnableBiometricsScreen(onSkip: () => void, onNext: () => void) {
  return <View />
}
