import { Hex } from '@iden3/js-crypto'
import { CurveFnWithCreate } from '@noble/curves/_shortw_utils'
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
  brainpoolP320r1,
  brainpoolP320t1,
  brainpoolP384r1,
  brainpoolP384t1,
  brainpoolP512r1,
  brainpoolP512t1,
  secp192r1,
  secp224r1,
  SupportedCurves,
} from './curves'

export const namedCurveFromOID = (oid: string): [SupportedCurves, CurveFnWithCreate] | null => {
  switch (oid) {
    case id_secp224r1: {
      return [SupportedCurves.SECP224R1, secp224r1]
    }
    case id_secp256r1: {
      return [SupportedCurves.SECP256R1, p256]
    }
    case id_secp384r1: {
      return [SupportedCurves.SECP384R1, p384]
    }
    case id_secp521r1: {
      return [SupportedCurves.SECP521R1, p521]
    }
    case id_secp192r1: {
      return [SupportedCurves.SECP192R1, secp192r1]
    }
    case '1.3.36.3.3.2.8.1.1.8': {
      return [SupportedCurves.BRAINPOOLP256T1, brainpoolP256t1]
    }
    case '1.3.36.3.3.2.8.1.1.7': {
      return [SupportedCurves.BRAINPOOLP256R1, brainpoolP256r1]
    }
    case '1.3.36.3.3.2.8.1.1.1': {
      return [SupportedCurves.BRAINPOOLP384T1, brainpoolP384t1]
    }
    case '1.3.36.3.3.2.8.1.1.11': {
      return [SupportedCurves.BRAINPOOLP384R1, brainpoolP384r1]
    }
    case '1.3.36.3.3.2.8.1.1.14': {
      return [SupportedCurves.BRAINPOOLP512T1, brainpoolP512t1]
    }
    case '1.3.36.3.3.2.8.1.1.13': {
      return [SupportedCurves.BRAINPOOLP512R1, brainpoolP512r1]
    }
    case '1.3.36.3.3.2.8.1.1.10': {
      return [SupportedCurves.BRAINPOOLP320T1, brainpoolP320t1]
    }
    case '1.3.36.3.3.2.8.1.1.9': {
      return [SupportedCurves.BRAINPOOLP320R1, brainpoolP320r1]
    }
    // OIDNamedCurveUnknown
    case '1.2.840.10045.1.1':
    default: {
      return null
    }
  }
}

export const namedCurveFromParams = (
  pubKeyBytes: Uint8Array,
  parameters: ECParameters,
): [SupportedCurves, CurveFnWithCreate] => {
  const pubKeyBitLength = pubKeyBytes.length * 8

  if (!parameters.specifiedCurve) {
    throw new TypeError('namedCurveFromParams: ECDSA public key does not have a specified curve')
  }

  const curveBaseGenerator = Hex.encodeString(new Uint8Array(parameters.specifiedCurve.base.buffer))

  switch (pubKeyBitLength) {
    case 392: {
      return [SupportedCurves.SECP192R1, secp192r1]
    }
    case 456: {
      return [SupportedCurves.SECP224R1, secp224r1]
    }
    case 1064:
    case 1050: {
      return [SupportedCurves.SECP521R1, p521]
    }
    case 520: {
      const brainpoolP256t1BaseGenerator = Buffer.from(toBeArray(brainpoolP256t1.CURVE.Gx))
        .toString('hex')
        .concat(Buffer.from(toBeArray(brainpoolP256t1.CURVE.Gy)).toString('hex'))

      const brainpoolP256r1BaseGenerator = Buffer.from(toBeArray(brainpoolP256r1.CURVE.Gx))
        .toString('hex')
        .concat(Buffer.from(toBeArray(brainpoolP256r1.CURVE.Gy)).toString('hex'))

      if (curveBaseGenerator.includes(brainpoolP256t1BaseGenerator)) {
        return [SupportedCurves.BRAINPOOLP256T1, brainpoolP256t1]
      }
      if (curveBaseGenerator.includes(brainpoolP256r1BaseGenerator)) {
        return [SupportedCurves.BRAINPOOLP256R1, brainpoolP256r1]
      }

      return [SupportedCurves.SECP256R1, p256]
    }
    case 776: {
      const brainpoolP384t1BaseGenerator = Buffer.from(toBeArray(brainpoolP384t1.CURVE.Gx))
        .toString('hex')
        .concat(Buffer.from(toBeArray(brainpoolP384t1.CURVE.Gy)).toString('hex'))

      const brainpoolP384r1BaseGenerator = Buffer.from(toBeArray(brainpoolP384r1.CURVE.Gx))
        .toString('hex')
        .concat(Buffer.from(toBeArray(brainpoolP384r1.CURVE.Gy)).toString('hex'))

      if (curveBaseGenerator.includes(brainpoolP384t1BaseGenerator)) {
        return [SupportedCurves.BRAINPOOLP384T1, brainpoolP384t1]
      }
      if (curveBaseGenerator.includes(brainpoolP384r1BaseGenerator)) {
        return [SupportedCurves.BRAINPOOLP384R1, brainpoolP384r1]
      }

      return [SupportedCurves.SECP384R1, p384]
    }
    case 1032: {
      const brainpoolP512t1BaseGenerator = Buffer.from(toBeArray(brainpoolP512t1.CURVE.Gx))
        .toString('hex')
        .concat(Buffer.from(toBeArray(brainpoolP512t1.CURVE.Gy)).toString('hex'))

      const brainpoolP512r1BaseGenerator = Buffer.from(toBeArray(brainpoolP512r1.CURVE.Gx))
        .toString('hex')
        .concat(Buffer.from(toBeArray(brainpoolP512r1.CURVE.Gy)).toString('hex'))

      if (curveBaseGenerator.includes(brainpoolP512t1BaseGenerator)) {
        return [SupportedCurves.BRAINPOOLP512T1, brainpoolP512t1]
      }
      if (curveBaseGenerator.includes(brainpoolP512r1BaseGenerator)) {
        return [SupportedCurves.BRAINPOOLP512R1, brainpoolP512r1]
      }

      return [SupportedCurves.SECP521R1, p521]
    }
  }

  throw new TypeError(`Unsupported public key bit length: ${pubKeyBitLength}`)
}
