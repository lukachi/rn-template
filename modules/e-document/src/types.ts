export type AdditionalPersonDetails = {
  custodyInformation?: string | null
  fullDateOfBirth?: string | null
  nameOfHolder?: string | null
  otherNames?: string[] | null
  otherValidTDNumbers?: string[] | null
  permanentAddress?: string[] | null
  personalNumber?: string | null
  personalSummary?: string | null
  placeOfBirth?: string[] | null
  profession?: string | null
  proofOfCitizenship?: Uint8Array | null
  tag?: number | null
  tagPresenceList?: number[] | null
  telephone?: string | null
  title?: string | null
}

export type PersonDetails = {
  name?: string | null
  surname?: string | null
  personalNumber?: string | null
  gender?: string | null
  birthDate?: string | null
  expiryDate?: string | null
  serialNumber?: string | null
  nationality?: string | null
  issuerAuthority?: string | null
  passportImageRaw?: string | null
}

export enum DocType {
  ID = 'ID',
  PASSPORT = 'PASSPORT',
}

export type EDocument = {
  personDetails?: PersonDetails | null
  sod?: string | null
  dg1?: string | null
  dg15?: string | null
  dg11?: string | null

  // unused, only initialized
  additionalPersonDetails?: AdditionalPersonDetails | null
  isPassiveAuth?: boolean
  isActiveAuth?: boolean
  isChipAuth?: boolean
  dg15Pem?: string | null

  // for revocation purposes
  aaSignature?: Uint8Array | null
  aaResponse?: string | null
}
