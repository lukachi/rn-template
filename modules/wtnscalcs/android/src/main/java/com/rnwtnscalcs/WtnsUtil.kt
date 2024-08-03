package com.rnwtnscalcs

import android.content.Context
import android.content.res.AssetManager
import java.io.ByteArrayOutputStream

object WtnsUtil {
  external fun auth(
    circuitBuffer: ByteArray?,
    circuitSize: Long,
    jsonBuffer: ByteArray?,
    jsonSize: Long,
    wtnsBuffer: ByteArray?,
    wtnsSize: LongArray?,
    errorMsg: ByteArray?,
    errorMsgMaxSize: Long
  ): Int

  init {
    System.loadLibrary("rn-wtnscalcs")
  }
}

class WtnsCalculator(val context: Context, val assetManager: AssetManager) {
  fun calculateWtns(
    datFile: Int,
    inputs: ByteArray,
    wtnsCalcFunction: (
      circuitBuffer: ByteArray,
      circuitSize: Long,
      jsonBuffer: ByteArray,
      jsonSize: Long,
      wtnsBuffer: ByteArray,
      wtnsSize: LongArray,
      errorMsg: ByteArray,
      errorMsgMaxSize: Long
    ) -> Int
  ): ByteArray {
    val DFile = openRawResourceAsByteArray(datFile)

    val msg = ByteArray(256)

    val witnessLen = LongArray(1)
    witnessLen[0] = 100 * 1024 * 1024

    val byteArr = ByteArray(100 * 1024 * 1024)

    val res = wtnsCalcFunction(
      DFile,
      DFile.size.toLong(),
      inputs,
      inputs.size.toLong(),
      byteArr,
      witnessLen,
      msg,
      256
    )

    if (res == 2) {
      throw Exception("Not enough memory for wtns calculation")
    }

    if (res == 1) {
      throw Exception("Error during wtns calculation ${msg.decodeToString()}")
    }

    val witnessData = byteArr.copyOfRange(0, witnessLen[0].toInt())

    return witnessData
  }

  private fun openRawResourceAsByteArray(resourceName: Int): ByteArray {
    val inputStream = context.resources.openRawResource(resourceName)
    val byteArrayOutputStream = ByteArrayOutputStream()

    try {
      val buffer = ByteArray(1024)
      var length: Int

      while (inputStream.read(buffer).also { length = it } != -1) {
        byteArrayOutputStream.write(buffer, 0, length)
      }

      return byteArrayOutputStream.toByteArray()
    } finally {
      // Close the streams in a finally block to ensure they are closed even if an exception occurs
      byteArrayOutputStream.close()
      inputStream.close()
    }
  }
}
