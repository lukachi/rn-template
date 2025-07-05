import { Certificate } from '@peculiar/asn1-x509'
import { getBytes, hexlify, keccak256 } from 'ethers'

import { extractRawPubKey } from '@/utils/e-document/helpers/misc'

import { ITreap, Treap } from './treap'

// Proof structure matching Go implementation
export interface Proof {
  siblings: string[]
}

export class CertTree {
  public tree: ITreap

  constructor(treap: ITreap) {
    this.tree = treap
  }

  static newCertTree(treap: ITreap): CertTree {
    return new CertTree(treap)
  }

  static async buildFromX509(certificates: Certificate[]): Promise<CertTree> {
    const treap = new Treap()

    const certTree = new CertTree(treap)

    const pks = certificates.map(extractRawPubKey)

    for (const pk of pks) {
      const leafHash = getBytes(keccak256(pk))
      certTree.tree.insert(leafHash, Treap.derivePriority(leafHash))
    }

    return certTree
  }

  genInclusionProof(certificate: Certificate): Proof {
    const certHash = getBytes(keccak256(extractRawPubKey(certificate)))
    const merklePath = this.tree.merklePath(certHash)

    return {
      siblings: merklePath.map(hexlify),
    }
  }
}
