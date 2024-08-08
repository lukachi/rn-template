package com.rmoidentity

import android.os.Build
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import identity.Identity
import java.util.Base64

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

  @RequiresApi(Build.VERSION_CODES.O)
  @OptIn(ExperimentalStdlibApi::class)
  override fun generatePrivateKey(promise: Promise?) {
    promise?.resolve(
      String(Base64.getEncoder().encode(Identity.newBJJSecretKey()))
    )
  }

  companion object {
    const val NAME = "RmoIdentity"
  }
}
