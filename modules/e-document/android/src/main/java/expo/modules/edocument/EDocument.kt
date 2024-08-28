package expo.modules.edocument

import android.util.Base64

data class PersonDetails(
  var secondaryIdentifier: String? = null,
  var primaryIdentifier: String? = null,
  var gender: String? = null,
  var dateOfBirth: String? = null,
  var dateOfExpiry: String? = null,
  var documentNumber: String? = null,
  var nationality: String? = null,
  var issuingState: String? = null,
  var passportImageRaw: String? = null,
)

data class EDocument(
  var personDetails: PersonDetails? = null,
  var sod: String? = null,
  var dg1: String? = null, // should be encoded base64 string
  var dg15: String? = null, // should be encoded base64 string
  var dg11: String? = null, // should be encoded base64 string
  var signature: String? = null, // should be encoded base64 string
) {
  companion object {
    @OptIn(ExperimentalStdlibApi::class)
    fun fromNfcDocumentModel(nfcDocumentModel: NFCDocumentModel): EDocument {
      val mrzInfo = nfcDocumentModel.mrzInfo ?: throw IllegalStateException("MRZ info is missing")

      val personDetails = PersonDetails(
        secondaryIdentifier = mrzInfo.secondaryIdentifier, //.replace("<", " ").trim { it <= ' ' },
        primaryIdentifier = mrzInfo.primaryIdentifier, //.replace("<", " ").trim { it <= ' ' },
        gender = mrzInfo.gender.toString(),
        dateOfBirth = mrzInfo.dateOfBirth,
        dateOfExpiry = mrzInfo.dateOfExpiry,
        documentNumber = mrzInfo.documentNumber,
        nationality = mrzInfo.nationality, //.replace("<", ""),
        issuingState = mrzInfo.issuingState, //.replace("<", ""),
        passportImageRaw = nfcDocumentModel.passportImageRaw,
      )

      return EDocument(
        personDetails = personDetails,
        dg1 = Base64.encodeToString(nfcDocumentModel.dg1, Base64.DEFAULT),
        dg11 = Base64.encodeToString(nfcDocumentModel.dg11, Base64.DEFAULT),
        dg15 = Base64.encodeToString(nfcDocumentModel.dg15, Base64.DEFAULT),
        sod = Base64.encodeToString(nfcDocumentModel.sod, Base64.DEFAULT),
        signature = Base64.encodeToString(nfcDocumentModel.activeAuthenticationSignature, Base64.DEFAULT),
      )
    }
  }
}
