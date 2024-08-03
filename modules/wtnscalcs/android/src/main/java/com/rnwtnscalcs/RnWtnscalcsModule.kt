package com.rnwtnscalcs

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = RnWtnscalcsModule.NAME)
class RnWtnscalcsModule(reactContext: ReactApplicationContext) :
  NativeRnWtnscalcsSpec(reactContext) {

  override fun getName(): String {
    return NAME
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = "RnWtnscalcs"
  }
}
