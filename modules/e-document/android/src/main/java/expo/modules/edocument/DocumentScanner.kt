package expo.modules.edocument

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.nfc.tech.IsoDep
import com.gemalto.jp2.JP2Decoder
import net.sf.scuba.smartcards.CardService
import org.bouncycastle.asn1.cms.SignedData
import org.bouncycastle.jce.provider.BouncyCastleProvider
import org.bouncycastle.openssl.jcajce.JcaPEMWriter
import org.jmrtd.BACKey
import org.jmrtd.PassportService
import org.jmrtd.lds.CardSecurityFile
import org.jmrtd.lds.PACEInfo
import org.jmrtd.lds.SODFile
import org.jmrtd.lds.icao.DG11File
import org.jmrtd.lds.icao.DG15File
import org.jmrtd.lds.icao.DG1File
import org.jmrtd.lds.icao.DG2File
import org.jmrtd.lds.iso19794.FaceImageInfo
import org.jmrtd.protocol.AAResult
import org.jnbis.WsqDecoder
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.DataInputStream
import java.io.IOException
import java.io.InputStream
import java.io.StringWriter
import java.security.MessageDigest
import java.security.PublicKey
import java.security.Security
import java.security.cert.X509Certificate
import java.util.Arrays
import java.util.Base64
import java.util.Locale


fun String.addCharAtIndex(char: Char, index: Int) =
  StringBuilder(this).apply { insert(index, char) }.toString()

fun ByteArray.toBase64(): String =
  String(Base64.getEncoder().encode(this))

fun String.toFixedPersonalNumberMrzData(personalNumber: String?): String {
  if (personalNumber.isNullOrEmpty()) {
    return this
  }
  var firstPart =
    this.split(personalNumber.toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()[0]
  var restPart =
    this.split(personalNumber.toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()[1]
  if (firstPart.lastIndexOf("<") < 10) {
    firstPart += "<"
  }
  if (restPart.indexOf("<<<<") == 0) {
    restPart = restPart.substring(1)
  }
  return firstPart + personalNumber + restPart
}

fun PublicKey.publicKeyToPem(): String {
  val base64PubKey = Base64.getEncoder().encodeToString(this.encoded)

  return "-----BEGIN PUBLIC KEY-----\n" +
    base64PubKey.replace("(.{64})".toRegex(), "$1\n") +
    "\n-----END PUBLIC KEY-----\n"
}

@Throws(IOException::class)
fun FaceImageInfo.decodeImage(mimeType: String, inputStream: InputStream?): Bitmap {
  val mimeTypeLower = mimeType.lowercase(Locale.getDefault())
  return when (mimeTypeLower) {
    "image/jp2", "image/jpeg2000" -> {
      JP2Decoder(inputStream).decode()
    }

    "image/x-wsq" -> {
      val wsqDecoder = WsqDecoder()
      val bitmap = wsqDecoder.decode(inputStream)
      val byteData = bitmap.pixels
      val intData = IntArray(byteData.size)
      for (j in byteData.indices) {
        intData[j] = -0x1000000 or
          (byteData[j].toInt() and (0xFF shl 16)) or
          (byteData[j].toInt() and (0xFF shl 8)) or (byteData[j].toInt() and 0xFF)
      }
      Bitmap.createBitmap(
        intData,
        0,
        bitmap.width,
        bitmap.width,
        bitmap.height,
        Bitmap.Config.ARGB_8888
      )
    }

    else -> {
      BitmapFactory.decodeStream(inputStream)
    }
  }
}

fun FaceImageInfo.toBase64Image(): String? {
  try {
    val imageLength = this.imageLength
    val dataInputStream = DataInputStream(this.imageInputStream)
    val buffer = ByteArray(imageLength)
    dataInputStream.readFully(buffer, 0, imageLength)
    val inputStream: InputStream = ByteArrayInputStream(buffer, 0, imageLength)
    val bitmap = this.decodeImage(this.mimeType, inputStream)

    val byteArrayOutputStream = ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.JPEG, this.quality, byteArrayOutputStream)
    val byteArray = byteArrayOutputStream.toByteArray()

    val JPEG_DATA_URI_PREFIX = "data:image/jpeg;base64,"
    return JPEG_DATA_URI_PREFIX + android.util.Base64.encodeToString(byteArray, android.util.Base64.NO_WRAP)
  } catch (e: IOException) {
    e.printStackTrace()
  }
  return null
}

data class AdditionalPersonDetails(
  var custodyInformation: String? = null,
  var fullDateOfBirth: String? = null,
  var nameOfHolder: String? = null,
  var otherNames: List<String>? = null,
  var otherValidTDNumbers: List<String>? = null,
  var permanentAddress: List<String>? = null,
  var personalNumber: String? = null,
  var personalSummary: String? = null,
  var placeOfBirth: List<String>? = null,
  var profession: String? = null,
  var proofOfCitizenship: ByteArray? = null,
  var tag: Int? = 0,
  var tagPresenceList: List<Int>? = null,
  var telephone: String? = null,
  var title: String? = null,
)

data class PersonDetails(
  var name: String? = null,
  var surname: String? = null,
  var personalNumber: String? = null,
  var gender: String? = null,
  var birthDate: String? = null,
  var expiryDate: String? = null,
  var serialNumber: String? = null,
  var nationality: String? = null,
  var issuerAuthority: String? = null,
  var passportImageRaw: String? = null,
)

data class EDocument(
  var personDetails: PersonDetails? = null,
  var sod: String? = null,
  var dg1: String? = null,
  var dg15: String? = null,
  var dg11: String? = null,

  // unused, only initialized
  var additionalPersonDetails: AdditionalPersonDetails? = null,
  var isPassiveAuth: Boolean = false,
  var isActiveAuth: Boolean = false,
  var isChipAuth: Boolean = false,
  var dg15Pem: String? = null,

  // for revocation purposes
  var aaSignature: ByteArray? = null,
  var aaResponse: String? = null,
)

data class BacKeyParameters(
  val dateOfBirth: String,
  val dateOfExpiry: String,
  val documentNumber: String,
)

class DocumentScanner(
  private val isoDep: IsoDep,
  private val bacKeyParameters: BacKeyParameters,
  private val challenge: ByteArray,
) {
  val bacKey = BACKey(
    bacKeyParameters.documentNumber,
    bacKeyParameters.dateOfBirth,
    bacKeyParameters.dateOfExpiry
  )

  @OptIn(ExperimentalStdlibApi::class)
  fun scanPassport(): EDocument {
    val eDocument = EDocument()

    val cardService = CardService.getInstance(isoDep)
    cardService.open()
    val service = PassportService(
      cardService,
      PassportService.NORMAL_MAX_TRANCEIVE_LENGTH,
      PassportService.DEFAULT_MAX_BLOCKSIZE,
      true,
      false
    )

    service.open()

    var paceSucceeded = false

    try {
      val cardSecurityFile =
        CardSecurityFile(service.getInputStream(PassportService.EF_CARD_SECURITY))
      val securityInfoCollection = cardSecurityFile.securityInfos
      for (securityInfo in securityInfoCollection) {

        if (securityInfo is PACEInfo) {
          val paceInfo = securityInfo
          service.doPACE(
            bacKey,
            paceInfo.objectIdentifier,
            PACEInfo.toParameterSpec(paceInfo.parameterId),
            null
          )
          paceSucceeded = true
        }
      }
    } catch (e: Exception) {
//      ErrorHandler.logError("scanPassport error:", e.toString(), e)
      e.printStackTrace()
    }

    service.sendSelectApplet(paceSucceeded)
    if (!paceSucceeded) {
      try {
        service.getInputStream(PassportService.EF_COM).read()
      } catch (e: Exception) {
        e.printStackTrace()
        service.doBAC(bacKey)
      }
    }

    ////publishProgress("Reading sod file")
    val sodIn1 = service.getInputStream(PassportService.EF_SOD)

    val byteArray = ByteArray(1024 * 1024)

    val byteLen = sodIn1.read(byteArray)

    val sod = cropByteArray(byteArray, byteLen).toHexString()

    val sodIn = service.getInputStream(PassportService.EF_SOD)

    val sodFile = SODFileOwn(sodIn)

    var digestAlgorithm = sodFile.digestAlgorithm

    val docSigningCert = sodFile.docSigningCertificate
    val pemFile: String = convertToPEM(docSigningCert)

    val digestEncryptionAlgorithm = sodFile.digestEncryptionAlgorithm

    val digest: MessageDigest =
      if (Security.getAlgorithms("MessageDigest").contains(digestAlgorithm)) {
        MessageDigest.getInstance(digestAlgorithm)
      } else {
        MessageDigest.getInstance(digestAlgorithm, BouncyCastleProvider())
      }

    val dg1In = service.getInputStream(PassportService.EF_DG1)
    val dg1File = DG1File(dg1In)
    var encodedDg1File = dg1File.encoded.toHexString()
    val mrzInfo = dg1File.mrzInfo

    val personDetails = PersonDetails(
      name = mrzInfo.secondaryIdentifier.replace("<", " ").trim { it <= ' ' },
      surname = mrzInfo.primaryIdentifier.replace("<", " ").trim { it <= ' ' },
      personalNumber = mrzInfo.personalNumber,
      gender = mrzInfo.gender.toString(),
      birthDate = mrzInfo.dateOfBirth,
      expiryDate = mrzInfo.dateOfExpiry,
      serialNumber = mrzInfo.documentNumber,
      nationality = mrzInfo.nationality,
      issuerAuthority = mrzInfo.issuingState,
    )

    eDocument.dg1 = encodedDg1File

    if (mrzInfo.documentCode.contains("I")) {
      try {
        encodedDg1File = encodedDg1File.toFixedPersonalNumberMrzData(mrzInfo.personalNumber)
      } catch (e: Exception) { }
    }

    val dg1StoredHash = sodFile.dataGroupHashes[1]
    val dg1ComputedHash = digest.digest(encodedDg1File.toByteArray())

    var hashesMatched = Arrays.equals(dg1StoredHash, dg1ComputedHash)

    // -- Face Image -- //
    val dg2In = service.getInputStream(PassportService.EF_DG2)
    val dg2File = DG2File(dg2In)
    //publishProgress("Decoding Face Image")
    val dg2StoredHash = sodFile.dataGroupHashes[2]
    val dg2ComputedHash = digest.digest(dg2File.encoded)

    hashesMatched = Arrays.equals(dg2StoredHash, dg2ComputedHash)

    val faceInfos = dg2File.faceInfos
    val allFaceImageInfos: MutableList<FaceImageInfo> = ArrayList()
    for (faceInfo in faceInfos) {
      allFaceImageInfos.addAll(faceInfo.faceImageInfos)
    }
    if (!allFaceImageInfos.isEmpty()) {
      val faceImageInfo = allFaceImageInfos.iterator().next()
      personDetails.passportImageRaw = faceImageInfo.toBase64Image()
    }

    val additionalPersonDetails: AdditionalPersonDetails? = try {
      val dg11In = service.getInputStream(PassportService.EF_DG11)
      val dg11File = DG11File(dg11In)

      if (dg11File.length > 0) {
        personDetails.personalNumber = dg11File.personalNumber

        AdditionalPersonDetails(
          custodyInformation = dg11File.custodyInformation,
          nameOfHolder = dg11File.nameOfHolder,
          fullDateOfBirth = dg11File.fullDateOfBirth,
          otherNames = dg11File.otherNames,
          otherValidTDNumbers = dg11File.otherValidTDNumbers,
          permanentAddress = dg11File.permanentAddress,
          personalNumber = dg11File.personalNumber,
          personalSummary = dg11File.personalSummary,
          placeOfBirth = dg11File.placeOfBirth,
          profession = dg11File.profession,
          proofOfCitizenship = dg11File.proofOfCitizenship,
          tag = dg11File.tag,
          tagPresenceList = dg11File.tagPresenceList,
          telephone = dg11File.telephone,
          title = dg11File.title,
        )
      }

      null
    } catch (e: Exception) {
//        ErrorHandler.logError("NFC SCAN", "cant parse dg11 file", e)
      null
    }
    eDocument.personDetails = personDetails
    eDocument.additionalPersonDetails = additionalPersonDetails
    eDocument.isPassiveAuth = hashesMatched

    val dg15 = try {
      val dG15File = service.getInputStream(PassportService.EF_DG15)
      DG15File(dG15File)
    } catch (e: Exception) {
//      ErrorHandler.logError("Nfc scan", "No DG15 file", e)
      null
    }

    var response: AAResult? = null
    try {
      response = service.doAA(
        dg15?.publicKey,
        sodFile.digestAlgorithm,
        sodFile.signerInfoDigestAlgorithm,
        challenge
      )
      eDocument.aaSignature = response.response
      eDocument.aaResponse = response.toString()
      eDocument.isActiveAuth = true
//      ErrorHandler.logDebug("Nfc scan", "AA is available")
//      ErrorHandler.logDebug("Nfc AA", response.toString())
    } catch (e: Exception) {
      eDocument.isActiveAuth = false
//      ErrorHandler.logError("Nfc scan", "AA is NOT available")
    }

    val index = pemFile.indexOf("-----END CERTIFICATE-----")
    val pemFileEnded = pemFile.addCharAtIndex('\n', index)

    val encapsulaged_content = sodFile.readASN1Data()

    val signedAtributes = sodFile.eContent
    val pubKey = dg15?.publicKey?.encoded


    try {
      val signature = sodFile.encryptedDigest

      eDocument.dg15Pem = dg15?.publicKey?.publicKeyToPem()
      eDocument.dg15 = dg15?.encoded?.toHexString()
    } catch (e: Exception) {
    }

    return eDocument
  }

  private fun cropByteArray(inputByteArray: ByteArray, endNumber: Int): ByteArray {
    // Make sure endNumber is within bounds
    val endIndex = if (endNumber > inputByteArray.size) inputByteArray.size else endNumber

    // Use copyOfRange to crop the ByteArray
    return inputByteArray.copyOfRange(0, endIndex)
  }

  private fun convertToPEM(certificate: X509Certificate): String {
    val stringWriter = StringWriter()
    JcaPEMWriter(stringWriter).use { pemWriter ->
      pemWriter.writeObject(certificate)
    }
    return stringWriter.toString()
  }
}

class SODFileOwn(inputStream: InputStream?) : SODFile(inputStream) {
  @OptIn(ExperimentalStdlibApi::class)
  fun readASN1Data(): String {
    val a = SODFile::class.java.getDeclaredField("signedData");
    a.isAccessible = true

    val v: SignedData = a.get(this) as SignedData

    val encapsulatedContent =
      v.encapContentInfo.content.toASN1Primitive().encoded!!.toHexString()

    val target = "30"
    val startIndex = encapsulatedContent.indexOf(target)
    return encapsulatedContent.substring(startIndex)
  }
}
