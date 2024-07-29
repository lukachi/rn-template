package com.rapidsnarkwrp

import android.util.Base64
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import io.iden3.rapidsnark.RapidsnarkError
import io.iden3.rapidsnark.groth16Prove
import io.iden3.rapidsnark.groth16ProveWithZKeyFilePath
import io.iden3.rapidsnark.groth16PublicSizeForZkeyBuf
import io.iden3.rapidsnark.groth16PublicSizeForZkeyFile
import io.iden3.rapidsnark.groth16Verify

class RapidsnarkWrpModule internal constructor(context: ReactApplicationContext) :
  RapidsnarkWrpSpec(context) {

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun groth16Prove(
    zkeyBytes1: String, wtnsBytes1: String,
    proofBufferSize: Int, publicBufferSize: Int,
    errorBufferSize: Int,
    promise: Promise
  ) {
    try {
      // Decode base64
      val zkeyBytes = Base64.decode(zkeyBytes1, Base64.DEFAULT)
      val wtnsBytes = Base64.decode(wtnsBytes1, Base64.DEFAULT)

      val response = groth16Prove(
        zkeyBytes,
        wtnsBytes,
        proofBufferSize,
        publicBufferSize,
        errorBufferSize
      )

      val result: WritableMap = WritableNativeMap().apply {
        putString("proof", response.proof)
        putString("pub_signals", response.publicSignals)
      }

      promise.resolve(result)
    } catch (e: RapidsnarkError) {
      promise.reject(e.code.toString(), e.message)
    }
  }

  @ReactMethod
  fun groth16ProveWithZKeyFilePath(
    zkeyPath: String, wtnsBytes1: String,
    proofBufferSize: Int, publicBufferSize: Int,
    errorBufferSize: Int,
    promise: Promise
  ) {
    try {
      // Decode base64
      val wtnsBytes = Base64.decode(wtnsBytes1, Base64.DEFAULT)

      val response = groth16ProveWithZKeyFilePath(
        zkeyPath,
        wtnsBytes,
        proofBufferSize,
        publicBufferSize,
        errorBufferSize
      )

      val result: WritableMap = WritableNativeMap().apply {
        putString("proof", response.proof)
        putString("pub_signals", response.publicSignals)
      }

      promise.resolve(result)
    } catch (e: RapidsnarkError) {
      promise.reject(e.code.toString(), e.message)
    }
  }

  @ReactMethod
  fun groth16Verify(
    proof: String, inputs: String, verificationKey: String,
    errorBufferSize: Int, promise: Promise
  ) {
    try {
      val result = groth16Verify(
        proof,
        inputs,
        verificationKey,
        errorBufferSize
      )

      promise.resolve(result)
    } catch (e: RapidsnarkError) {
      promise.reject(e.code.toString(), e.message)
    }
  }

  @ReactMethod
  fun groth16PublicSizeForZkeyBuf(zkeyBytes1: String, errorBufferSize: Int, promise: Promise) {
    try {
      // Decode base64
      val zkeyBytes = Base64.decode(zkeyBytes1, Base64.DEFAULT)

      val publicBufferSize = groth16PublicSizeForZkeyBuf(
        zkeyBytes,
        errorBufferSize
      )

      promise.resolve(publicBufferSize)
    } catch (e: RapidsnarkError) {
      promise.reject(e.code.toString(), e.message)
    }
  }

  @ReactMethod
  fun groth16PublicSizeForZkeyFile(zkeyPath: String, errorBufferSize: Int, promise: Promise) {
    try {
      val publicBufferSize = groth16PublicSizeForZkeyFile(
        zkeyPath,
        errorBufferSize
      )

      promise.resolve(publicBufferSize)
    } catch (e: RapidsnarkError) {
      promise.reject(e.code.toString(), e.message)
    }
  }

  companion object {
    const val NAME = "RapidsnarkWrp"
  }
}


