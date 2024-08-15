package com.rmoidentity

import android.os.Build
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import identity.Identity
import identity.Profile
import java.util.Base64

fun String.decodeHexString(): ByteArray {
  check(length % 2 == 0) {
    "Must have an even length"
  }

  return chunked(2).map { it.toInt(16).toByte() }.toByteArray()
}

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

  override fun calculateEventNullifierInt(event: String?, secretKey: String?, promise: Promise?) {
    val profile = Profile().newProfile(secretKey?.decodeHexString())

    profile.calculateEventNullifierInt(event).let {
      promise?.resolve(it)
    } ?: promise?.reject("ERROR", "Failed to calculate event nullifier")
  }

  companion object {
    const val NAME = "RmoIdentity"
  }
}
