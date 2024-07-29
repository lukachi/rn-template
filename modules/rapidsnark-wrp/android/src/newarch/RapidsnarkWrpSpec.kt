package com.rapidsnarkwrp

import android.view.View
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNodeImpl
import com.facebook.react.uimanager.ViewManager


public open class RapidsnarkWrpSpec internal constructor(context: ReactApplicationContext) :
  NativeRapidsnarkWrpSpec(context) {
  fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    val modules: MutableList<NativeModule> = ArrayList()
    modules.add(RapidsnarkWrpModule(reactContext))
    return modules
  }

  fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<View, ReactShadowNodeImpl>> {
    return emptyList()
  }

  override fun groth16Prove(
    zkey: String?,
    witness: String?,
    proofBufferSize: Double?,
    publicBufferSize: Double?,
    errorBufferSize: Double?,
    promise: Promise?
  ) {
    TODO("Not yet implemented")
  }

  override fun groth16ProveWithZKeyFilePath(
    zkey_path: String?,
    witness: String?,
    proofBufferSize: Double?,
    publicBufferSize: Double?,
    errorBufferSize: Double?,
    promise: Promise?
  ) {
    TODO("Not yet implemented")
  }

  override fun groth16Verify(
    proof: String?,
    publicSignals: String?,
    verificationKey: String?,
    errorBufferSize: Double?,
    promise: Promise?
  ) {
    TODO("Not yet implemented")
  }

  override fun groth16PublicSizeForZkeyBuf(
    zkey: String?,
    errorBufferSize: Double?,
    promise: Promise?
  ) {
    TODO("Not yet implemented")
  }

  override fun groth16PublicSizeForZkeyFile(
    zkeyPath: String?,
    errorBufferSize: Double?,
    promise: Promise?
  ) {
    TODO("Not yet implemented")
  }
}
