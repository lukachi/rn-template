package expo.modules.noir

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import com.noirandroid.lib.Circuit

class NoirModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('Noir')` in JavaScript.
    Name("Noir")

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    // TODO: inputs string to byteArray
    AsyncFunction("prove") { trustedSetupUri: String, inputs: String, byteCodeString: String ->
      val circuit = Circuit.fromJsonManifest(byteCodeString)

      circuit.setupSrs(trustedSetupUri, false)

      val inputsMap = inputs.let { jsonString ->
          val gson = com.google.gson.Gson()
          val type = object : com.google.gson.reflect.TypeToken<Map<String, Any>>() {}.type
          gson.fromJson<Map<String, Any>>(jsonString, type)
      }

      val proof = circuit.prove(inputsMap, proofType = "plonk", recursive = false)

      return@AsyncFunction proof.proof
    }
  }
}
