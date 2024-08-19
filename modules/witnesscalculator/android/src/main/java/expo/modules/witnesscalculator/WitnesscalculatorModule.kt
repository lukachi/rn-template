package expo.modules.witnesscalculator

import com.example.rmocalcs.WtnsUtils
import java.util.Base64
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class WitnesscalculatorModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('Witnesscalculator')` in JavaScript.
    Name("Witnesscalculator")

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("calcWtnsAuth") { descriptionFileData: String, privateInputsJson: String ->
      val witnessCalculator = WtnsCalculator()

      val res = witnessCalculator.calculateWtns(
        Base64.getDecoder().decode(descriptionFileData),
        Base64.getDecoder().decode(privateInputsJson),
        WtnsUtils::auth
      ).let {
        // base64
        String(Base64.getEncoder().encode(it))
      }

      return@AsyncFunction res
    }
  }
}

class WtnsCalculator {
  fun calculateWtns(
    datFile: ByteArray,
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
    val msg = ByteArray(256)

    val witnessLen = LongArray(1)
    witnessLen[0] = 100 * 1024 * 1024

    val byteArr = ByteArray(100 * 1024 * 1024)

    val res = wtnsCalcFunction(
      datFile,
      datFile.size.toLong(),
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
}
