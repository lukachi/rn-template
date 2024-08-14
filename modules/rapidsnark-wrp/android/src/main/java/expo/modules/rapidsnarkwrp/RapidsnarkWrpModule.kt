package expo.modules.rapidsnarkwrp

import android.util.Base64
import com.google.gson.Gson
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import io.iden3.rapidsnark.groth16Prove

data class Proof(
  val pi_a: List<String>,
  val pi_b: List<List<String>>,
  val pi_c: List<String>,
  val protocol: String,
) {
  companion object {
    fun fromJson(jsonString: String): Proof {
      val json = Gson().fromJson(jsonString, Proof::class.java)
      return json
    }
  }

}

data class ZkProof(
  val proof: Proof,
  val pub_signals: List<String>
)

fun base64StringToData(base64String: String): ByteArray {
  return Base64.decode(base64String, Base64.DEFAULT)
}

class RapidsnarkWrpModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('RapidsnarkWrp')` in JavaScript.
    Name("RapidsnarkWrp")

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("groth16Prove") { wtnsBase64: String, zkeyBase64: String ->
      val decodedWtnsData = base64StringToData(wtnsBase64)
      val decodedZkeyData = base64StringToData(zkeyBase64)

      val (proof, publicSignals) = groth16Prove(decodedZkeyData, decodedWtnsData)

      val proofInstance = Proof.fromJson(proof)

      val gson = Gson()
      val stringArray = gson.fromJson(publicSignals, Array<String>::class.java)
      val pubSignalsArray = stringArray.toList()

      val zkProof = ZkProof(
        proof = proofInstance,
        pub_signals = pubSignalsArray
      )

      val zkProofJson = gson.toJson(zkProof)

      return@AsyncFunction Base64.encodeToString(zkProofJson.toByteArray(), Base64.DEFAULT)
    }
  }
}
