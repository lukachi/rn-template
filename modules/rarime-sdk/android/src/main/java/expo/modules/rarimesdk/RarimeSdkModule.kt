package expo.modules.rarimesdk

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import identity.Identity
import identity.Profile
import identity.X509Util

fun String.decodeHexString(): ByteArray {
  check(length % 2 == 0) {
    "Must have an even length"
  }

  return chunked(2).map { it.toInt(16).toByte() }.toByteArray()
}

class RarimeSdkModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('RarimeSdk')` in JavaScript.
    Name("RarimeSdk")

    AsyncFunction("generatePrivateKey") {
      return@AsyncFunction Identity.newBJJSecretKey()
    }

    AsyncFunction("calculateEventNullifierInt") { eventId: String, userPK: String ->
      val profile = Profile().newProfile(userPK.decodeHexString())

      return@AsyncFunction profile.calculateEventNullifierInt(eventId)
    }

    AsyncFunction("registrationChallenge") { userPK: String ->
      val profile = Profile().newProfile(userPK.decodeHexString())

      return@AsyncFunction profile.registrationChallenge
    }

    AsyncFunction("getSlaveCertIndex") { slaveCertPem: ByteArray, mastersPem: ByteArray ->
      return@AsyncFunction X509Util().getSlaveCertificateIndex(slaveCertPem, mastersPem)
    }

    AsyncFunction("getX509RSASize") { publicKeyPem: ByteArray ->
      return@AsyncFunction X509Util().getRSASize(publicKeyPem)
    }
  }
}
