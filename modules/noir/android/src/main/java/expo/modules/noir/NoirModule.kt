package expo.modules.noir

import androidx.core.net.toUri
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.noirandroid.lib.Circuit
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NoirModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("Noir")

    /**
     * Generates a PLONK proof using the Noir circuit.
     *
     * @param trustedSetupUri URI pointing to the SRS file (e.g. file://...)
     * @param inputsJson JSON string representing a map of witness values
     * @param manifestJson JSON manifest for the circuit bytecode
     * @return A hex string representing the generated proof
     * @throws IllegalArgumentException if the URI is invalid
     * @throws Exception if proof generation fails
     */
    AsyncFunction("provePlonk") { trustedSetupUri: String, inputsJson: String, manifestJson: String ->
      val rawPath = trustedSetupUri.toUri().path
        ?: throw IllegalArgumentException("Invalid URI: $trustedSetupUri")

      val circuit = Circuit.fromJsonManifest(manifestJson).apply {
        setupSrs(rawPath, false)
      }

      val type = object : TypeToken<Map<String, Any>>() {}.type
      val inputsMap: Map<String, Any> = Gson().fromJson(inputsJson, type)

      val proof = circuit.prove(
        inputsMap,
        proofType = "plonk",
        recursive = false
      )

      return@AsyncFunction proof.proof
    }
  }
}
