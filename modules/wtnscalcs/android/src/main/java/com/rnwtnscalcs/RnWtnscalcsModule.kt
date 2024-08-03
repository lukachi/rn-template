package com.rnwtnscalcs

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.module.annotations.ReactModule
import okhttp3.internal.EMPTY_BYTE_ARRAY

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

  override fun plus(a: Double, b: Double): Double {
    return a + b
  }

  override fun generateAuthWtns(inputsBuffer: String, promise: Promise) {
    val wtnsCalc = WtnsCalculator(
      reactApplicationContext,
      reactApplicationContext.assets
    )

    try {
      val res = wtnsCalc.calculateWtns(
        R.raw.auth,
        inputsBuffer.toByteArray(),
        WtnsUtil::auth
      ).let {
        (String(it))
      }

      promise.resolve(res)
    } catch (e: Exception) {
      promise.reject(e)
    }
  }

  companion object {
    const val NAME = "RnWtnscalcs"
  }
}
