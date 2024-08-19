package expo.modules.witnesscalculator

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
    AsyncFunction("calcWtnsAuth") { descriptionFileData: ByteArray, privateInputsJson: ByteArray ->
      // Send an event to JavaScript.
      return@AsyncFunction "Not implemented"
    }
  }
}
