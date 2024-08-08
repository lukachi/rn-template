package com.rmoidentity

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import identity.Identity

@ReactModule(name = RmoIdentityModule.NAME)
class RmoIdentityModule(reactContext: ReactApplicationContext) :
  NativeRmoIdentitySpec(reactContext) {

  override fun getName(): String {
    return NAME
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  @OptIn(ExperimentalStdlibApi::class)
  override fun generatePrivateKey(promise: Promise?) {
    promise?.resolve(Identity.newBJJSecretKey().toHexString())
  }

  companion object {
    const val NAME = "RmoIdentity"
  }
}
