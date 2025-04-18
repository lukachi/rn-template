import { useFocusEffect } from '@react-navigation/native'
import { useState } from 'react'
import { AvoidSoftInput, useSoftInputHeightChanged } from 'react-native-avoid-softinput'

/**
 *  Mostly used for ios devices
 *  This hook should be used in every screen that has a form input field to avoid the keyboard
 *  This is not a one for all solution, if you want more customization please refer to those examples: https://mateusz1913.github.io/react-native-avoid-softinput/docs/recipes/recipes-form
 */

export const useSoftKeyboardEffect = (avoidOffset = 50) => {
  const [softInputKeyboardHeight, setSoftInputKeyboardHeight] = useState(0)

  useSoftInputHeightChanged(({ softInputHeight }) => {
    setSoftInputKeyboardHeight(softInputHeight)
  })

  useFocusEffect(() => {
    AvoidSoftInput.setEnabled(true)

    if (avoidOffset) {
      AvoidSoftInput.setAvoidOffset(avoidOffset)
    }

    AvoidSoftInput.setShowAnimationDelay(0)
    AvoidSoftInput.setShowAnimationDuration(150)
    AvoidSoftInput.setHideAnimationDuration(150)
    AvoidSoftInput.setHideAnimationDelay(0)

    return () => {
      AvoidSoftInput.setAvoidOffset(0)
      AvoidSoftInput.setEnabled(false)
    }
  })

  return { softInputKeyboardHeight }
}
