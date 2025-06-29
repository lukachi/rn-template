import { Hex } from '@iden3/js-crypto'
import { p256, p384, p521 } from '@noble/curves/nist'
import {
  ECParameters,
  id_secp192r1,
  id_secp224r1,
  id_secp256r1,
  id_secp384r1,
  id_secp521r1,
} from '@peculiar/asn1-ecc'
import { toBeArray } from 'ethers'

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

  if (!parameters.specifiedCurve)
    throw new TypeError('ECDSA public key does not have a specified curve')

  const curveBaseGenerator = Hex.encodeString(new Uint8Array(parameters.specifiedCurve.base.buffer))

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
      const brainpoolP256t1BaseGenerator = Buffer.from(toBeArray(brainpoolP256t1.CURVE.Gx))
        .toString('hex')
        .concat(Buffer.from(toBeArray(brainpoolP256t1.CURVE.Gy)).toString('hex'))

      const brainpoolP256r1BaseGenerator = Buffer.from(toBeArray(brainpoolP256r1.CURVE.Gx))
        .toString('hex')
        .concat(Buffer.from(toBeArray(brainpoolP256r1.CURVE.Gy)).toString('hex'))

      if (curveBaseGenerator.includes(brainpoolP256t1BaseGenerator)) {
        return brainpoolP256t1
      }
      if (curveBaseGenerator.includes(brainpoolP256r1BaseGenerator)) {
        return brainpoolP256r1
      }

      return p256
    }
    case 776: {
      const brainpoolP384t1BaseGenerator = Buffer.from(toBeArray(brainpoolP384t1.CURVE.Gx))
        .toString('hex')
        .concat(Buffer.from(toBeArray(brainpoolP384t1.CURVE.Gy)).toString('hex'))

      const brainpoolP384r1BaseGenerator = Buffer.from(toBeArray(brainpoolP384r1.CURVE.Gx))
        .toString('hex')
        .concat(Buffer.from(toBeArray(brainpoolP384r1.CURVE.Gy)).toString('hex'))

      if (curveBaseGenerator.includes(brainpoolP384t1BaseGenerator)) {
        return brainpoolP384t1
      }
      if (curveBaseGenerator.includes(brainpoolP384r1BaseGenerator)) {
        return brainpoolP384r1
      }

      return p384
    }
    case 1032: {
      const brainpoolP512t1BaseGenerator = Buffer.from(toBeArray(brainpoolP512t1.CURVE.Gx))
        .toString('hex')
        .concat(Buffer.from(toBeArray(brainpoolP512t1.CURVE.Gy)).toString('hex'))

      const brainpoolP512r1BaseGenerator = Buffer.from(toBeArray(brainpoolP512r1.CURVE.Gx))
        .toString('hex')
        .concat(Buffer.from(toBeArray(brainpoolP512r1.CURVE.Gy)).toString('hex'))

      if (curveBaseGenerator.includes(brainpoolP512t1BaseGenerator)) {
        return brainpoolP512t1
      }
      if (curveBaseGenerator.includes(brainpoolP512r1BaseGenerator)) {
        return brainpoolP512r1
      }

      return p521
    }
  }
}
