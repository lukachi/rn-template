import { p256, p384, p521 } from '@noble/curves/nist'
import {
  ECParameters,
  id_secp192r1,
  id_secp224r1,
  id_secp256r1,
  id_secp384r1,
  id_secp521r1,
} from '@peculiar/asn1-ecc'

import {
  brainpoolP256r1,
  brainpoolP256t1,
  brainpoolP384r1,
  brainpoolP384t1,
  brainpoolP512r1,
  brainpoolP512t1,
  secp192r1,
  secp224r1,
} from './curves'

export const namedCurveFromOID = (oid: string) => {
  switch (oid) {
    case id_secp224r1: {
      return secp224r1
    }
    case id_secp256r1: {
      return p256
    }
    case id_secp384r1: {
      console.log('p384 curve OID detected')
      return p384
    }
    case id_secp521r1: {
      return p521
    }
    case id_secp192r1: {
      return secp192r1
    }
    case '1.3.36.3.3.2.8.1.1.8': {
      return brainpoolP256t1
    }
    case '1.3.36.3.3.2.8.1.1.7': {
      return brainpoolP256r1
    }
    case '1.3.36.3.3.2.8.1.1.1': {
      return brainpoolP384t1
    }
    case '1.3.36.3.3.2.8.1.1.11': {
      return brainpoolP384r1
    }
    case '1.3.36.3.3.2.8.1.1.14': {
      return brainpoolP512t1
    }
    case '1.3.36.3.3.2.8.1.1.13': {
      return brainpoolP512r1
    }
    // OIDNamedCurveUnknown
    case '1.2.840.10045.1.1':
    default: {
      return null
    }
  }
}

export const namedCurveFromParams = (pubKeyBytes: Uint8Array, parameters: ECParameters) => {
  const pubKeyBitLength = pubKeyBytes.length * 8
  console.log({ pubKeyBitLength, parameters })

  if (!parameters.specifiedCurve)
    throw new TypeError('ECDSA public key does not have a specified curve')

  const curve_a_b_hex_concat = Buffer.from(parameters.specifiedCurve.curve.a)
    .toString('hex')
    .concat(Buffer.from(parameters.specifiedCurve.curve.b).toString('hex'))

  switch (pubKeyBitLength) {
    case 392: {
      return secp192r1
    }
    case 456: {
      return secp224r1
    }
    case 1064:
    case 1050: {
      return p521
    }
    case 520: {
      const brainpoolP256t1_a_b_hex_concat = brainpoolP256t1.CURVE.a
        .toString(16)
        .concat(brainpoolP256t1.CURVE.b.toString(16))

      const brainpoolP256r1_a_b_hex_concat = brainpoolP256r1.CURVE.a
        .toString(16)
        .concat(brainpoolP256r1.CURVE.b.toString(16))

      if (curve_a_b_hex_concat === brainpoolP256t1_a_b_hex_concat) {
        return brainpoolP256t1
      }
      if (curve_a_b_hex_concat === brainpoolP256r1_a_b_hex_concat) {
        return brainpoolP256r1
      }

      return p256
    }
    case 776: {
      const brainpoolP384t1_a_b_hex_concat = brainpoolP384t1.CURVE.a
        .toString(16)
        .concat(brainpoolP384t1.CURVE.b.toString(16))

      const brainpoolP384r1_a_b_hex_concat = brainpoolP384r1.CURVE.a
        .toString(16)
        .concat(brainpoolP384r1.CURVE.b.toString(16))

      if (curve_a_b_hex_concat.toLowerCase() === brainpoolP384t1_a_b_hex_concat.toLowerCase()) {
        console.log('brainpoolP384t1 curve detected')
        return brainpoolP384t1
      }
      if (curve_a_b_hex_concat.toLowerCase() === brainpoolP384r1_a_b_hex_concat.toLowerCase()) {
        console.log('brainpoolP384r1 curve detected')
        return brainpoolP384r1
      }

      console.log('p384 curve detected')

      return p384
    }
    case 1032: {
      const brainpoolP512t1_a_b_hex_concat = brainpoolP512t1.CURVE.a
        .toString(16)
        .concat(brainpoolP512t1.CURVE.b.toString(16))

      const brainpoolP512r1_a_b_hex_concat = brainpoolP512r1.CURVE.a
        .toString(16)
        .concat(brainpoolP512r1.CURVE.b.toString(16))

      if (curve_a_b_hex_concat === brainpoolP512t1_a_b_hex_concat) {
        return brainpoolP512t1
      }
      if (curve_a_b_hex_concat === brainpoolP512r1_a_b_hex_concat) {
        return brainpoolP512r1
      }

      return p521
    }
  }
}
