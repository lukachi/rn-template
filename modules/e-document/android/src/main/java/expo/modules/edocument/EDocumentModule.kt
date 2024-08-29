package expo.modules.edocument

import android.app.Activity
import android.app.PendingIntent
import android.content.Intent
import android.content.IntentFilter
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.IsoDep
import android.util.Base64
import com.google.gson.Gson
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.bouncycastle.openssl.jcajce.JcaPEMWriter
import org.jmrtd.lds.SODFile
import java.io.StringWriter
import java.security.PublicKey
import java.security.cert.X509Certificate

fun X509Certificate.convertToPem(): String {
  val stringWriter = StringWriter()
  JcaPEMWriter(stringWriter).use { pemWriter ->
    pemWriter.writeObject(this)
  }
  return stringWriter.toString()
}

fun PublicKey.publicKeyToPem(): String {
  val base64PubKey = Base64.encodeToString(this.encoded, Base64.DEFAULT)

  return "-----BEGIN PUBLIC KEY-----\n" +
    base64PubKey.replace("(.{64})".toRegex(), "$1\n") +
    "\n-----END PUBLIC KEY-----\n"
}

class EDocumentModule : Module() {
  private var nfcAdapter: NfcAdapter? = null

  private var scanPromise: Promise? = null

  private var bacKeyParameters: BacKeyParameters? = null
  private var scanChallenge: ByteArray? = null

  override fun definition() = ModuleDefinition {
    Name("EDocument")

    AsyncFunction("scanDocument") { bacKeyParametersJson: String, challenge: ByteArray, promise: Promise ->
      val activity = appContext.reactContext ?: run {
        throw IllegalStateException("No current activity found")
      }

      nfcAdapter = NfcAdapter.getDefaultAdapter(activity)

      if (nfcAdapter == null || !nfcAdapter!!.isEnabled) {
        throw IllegalStateException("NFC is not available or not enabled")
      }

      // Enable foreground dispatch for NFC
      appContext.currentActivity?.let { enableNfcForegroundDispatch(it) } ?: run {
        throw IllegalStateException("No current activity found")
      }

      bacKeyParameters = Gson().fromJson(bacKeyParametersJson, BacKeyParameters::class.java)
      scanChallenge = challenge

      scanPromise = promise
    }

    AsyncFunction("getPublicKeyPem") { sod: ByteArray ->
      val sodFile = SODFile(sod.inputStream())

      val publicKey = sodFile.docSigningCertificate.publicKey
      val publicKeyPem = publicKey.publicKeyToPem()

      return@AsyncFunction publicKeyPem
    }

    AsyncFunction("getSlaveCertificatePem") { sod: ByteArray ->
      val sodFile = SODFile(sod.inputStream())

      val cert = sodFile.docSigningCertificate
      val certPem = cert.convertToPem()

      return@AsyncFunction certPem.toByteArray()
    }

    OnNewIntent { intent ->
      scanPromise?.let { handleNfcIntent(intent, it) }
    }

    OnDestroy {
      disableNfcForegroundDispatch()
    }
  }

  private fun handleNfcIntent(intent: Intent?, promise: Promise) {
    val tag = intent?.getParcelableExtra<Tag>(NfcAdapter.EXTRA_TAG)

    if (!(intent?.action == NfcAdapter.ACTION_TAG_DISCOVERED || intent?.action == NfcAdapter.ACTION_TECH_DISCOVERED)) return

    if (tag == null) {
      return
    }

    val isoDep = IsoDep.get(tag)

    if (
      isoDep == null ||
      bacKeyParameters == null ||
      scanChallenge == null
    ) return

    val docScanner = DocumentScanner(
      isoDep,
      bacKeyParameters!!,
      scanChallenge!!
    )

    val nfcDocument = docScanner.scanPassport()

    val eDocument = EDocument.fromNfcDocumentModel(nfcDocument)

    val eDocumentJson = Gson().toJson(eDocument)
    promise.resolve(eDocumentJson)
  }

  private fun enableNfcForegroundDispatch(activity: Activity) {
    val intent = Intent(activity.applicationContext, activity::class.java)
    intent.flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
    val pendingIntent = PendingIntent.getActivity(activity, 0, intent, PendingIntent.FLAG_MUTABLE)
    val filters = arrayOf(IntentFilter(NfcAdapter.ACTION_TECH_DISCOVERED))
    val techList = arrayOf(arrayOf(IsoDep::class.java.name))
    nfcAdapter?.enableForegroundDispatch(activity, pendingIntent, filters, techList)
  }

  private fun disableNfcForegroundDispatch() {
    appContext.currentActivity?.let { nfcAdapter?.disableForegroundDispatch(it) }
  }
}
