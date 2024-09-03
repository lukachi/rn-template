package expo.modules.rarimesdk

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import identity.CallDataBuilder
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

    AsyncFunction("buildRegisterCertificateCallData") { cosmosAddr: String, slavePem: ByteArray, masterCertificatesBucketName: String, masterCertificatesFilename: String ->
      val callDataBuilder = CallDataBuilder()

      val callData = callDataBuilder.buildRegisterCertificateCalldata(
        cosmosAddr,
        slavePem,
        masterCertificatesBucketName,
        masterCertificatesFilename
      )

      return@AsyncFunction callData
    }

    AsyncFunction("buildRegisterIdentityInputs") { userPK: String, encapsulatedContent: ByteArray, signedAttributes: ByteArray, sodSignature: ByteArray, dg1: ByteArray, dg15: ByteArray, pubKeyPem: ByteArray, smtProofJsonData: ByteArray ->
      val profile = Profile().newProfile(userPK.decodeHexString())

      val inputs = profile.buildRegisterIdentityInputs(
        encapsulatedContent,
        signedAttributes,
        dg1,
        dg15,
        pubKeyPem,
        sodSignature,
        smtProofJsonData
      )

      return@AsyncFunction inputs
    }

    AsyncFunction("getPublicKeyHash") { userPK: String ->
      val profile = Profile().newProfile(userPK.decodeHexString())

      return@AsyncFunction profile.publicKeyHash
    }

    AsyncFunction("buildRegisterCallData") { proofJson: ByteArray, signature: ByteArray, pubKeyPem: ByteArray, certificatesRootRaw: ByteArray, certificatePubKeySize: Long, isRevoked: Boolean ->
      val callDataBuilder = CallDataBuilder()
      val callData = callDataBuilder.buildRegisterCalldata(
        proofJson,
        signature,
        pubKeyPem,
        certificatesRootRaw,
        certificatePubKeySize,
        isRevoked
      )

      return@AsyncFunction callData
    }

    AsyncFunction("buildRevoceCalldata") { identityKey: ByteArray, signature: ByteArray, pubKeyPem: ByteArray ->
      val callDataBuilder = CallDataBuilder()
      val callData = callDataBuilder.buildRevoceCalldata(identityKey, signature, pubKeyPem)

      return@AsyncFunction callData
    }
  }
}
