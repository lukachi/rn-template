import { keccak256 } from 'ethers'

class TreapNode {
  hash: Uint8Array
  priority: bigint
  merkleHash: Uint8Array
  left: TreapNode | null
  right: TreapNode | null

  constructor(hash: Uint8Array, priority: bigint) {
    this.hash = hash
    this.priority = priority
    this.merkleHash = hash
    this.left = null
    this.right = null
  }
}

export interface ITreap {
  remove(key: Uint8Array): void
  insert(key: Uint8Array, priority: bigint): void
  merklePath(key: Uint8Array): Uint8Array[]
  merkleRoot(): Uint8Array | null
}

export class Treap implements ITreap {
  root: TreapNode | null

  constructor() {
    this.root = null
  }

  static new(): ITreap {
    return new Treap()
  }

  remove(key: Uint8Array): void {
    if (this.root === null) {
      return
    }

    // Split the tree by key-1 => target key in the right subtree
    // Split the subtree by key => target key is one left node
    const keyBig = this.bytesToBigInt(key)
    const keySub1 = this.bigIntToBytes(keyBig - 1n)

    const [left, right] = this.split(this.root, keySub1)
    if (right === null) {
      return
    }

    const [, rightAfterSplit] = this.split(right, key)
    this.root = this.merge(left, rightAfterSplit)
  }

  insert(key: Uint8Array, priority: bigint): void {
    const middle = new TreapNode(key, priority)

    if (this.root === null) {
      this.root = middle
      return
    }

    const [left, right] = this.split(this.root, key)
    this.root = this.merge(this.merge(left, middle), right)
  }

  merklePath(key: Uint8Array): Uint8Array[] {
    let node = this.root
    const result: Uint8Array[] = []

    while (node !== null) {
      if (this.compareBytes(node.hash, key) === 0) {
        const hashedNodes = this.hashNodes(node.left, node.right)
        if (hashedNodes !== null) {
          result.push(hashedNodes)
        }
        this.reverseArray(result)
        return result
      }

      if (this.compareBytes(node.hash, key) > 0) {
        result.push(node.hash)
        if (node.right !== null) {
          result.push(node.right.merkleHash)
        }
        node = node.left
        continue
      }

      result.push(node.hash)
      if (node.left !== null) {
        result.push(node.left.merkleHash)
      }
      node = node.right
    }

    return []
  }

  merkleRoot(): Uint8Array | null {
    if (this.root === null) {
      return null
    }

    return this.root.merkleHash
  }

  private split(root: TreapNode | null, key: Uint8Array): [TreapNode | null, TreapNode | null] {
    if (root === null) {
      return [null, null]
    }

    // Removal implementation relies on '<= 0'
    if (this.compareBytes(root.hash, key) <= 0) {
      const [left, right] = this.split(root.right, key)
      root.right = left
      this.updateNode(root)
      return [root, right]
    }

    const [left, right] = this.split(root.left, key)
    root.left = right
    this.updateNode(root)
    return [left, root]
  }

  private merge(left: TreapNode | null, right: TreapNode | null): TreapNode | null {
    if (left === null) {
      return right
    }

    if (right === null) {
      return left
    }

    if (left.priority > right.priority) {
      left.right = this.merge(left.right, right)
      this.updateNode(left)
      return left
    }

    right.left = this.merge(left, right.left)
    this.updateNode(right)
    return right
  }

  private updateNode(node: TreapNode): void {
    const childrenHash = this.hashNodes(node.left, node.right)
    if (childrenHash === null) {
      node.merkleHash = node.hash
      return
    }

    node.merkleHash = this.hash(childrenHash, node.hash)
  }

  private hashNodes(a: TreapNode | null, b: TreapNode | null): Uint8Array | null {
    let left: Uint8Array | null = null
    let right: Uint8Array | null = null

    if (a !== null) {
      left = a.merkleHash
    }

    if (b !== null) {
      right = b.merkleHash
    }

    return this.hash(left, right)
  }

  private hash(a: Uint8Array | null, b: Uint8Array | null): Uint8Array {
    if (a === null || a.length === 0) {
      return b || new Uint8Array(0)
    }

    if (b === null || b.length === 0) {
      return a
    }

    if (this.compareBytes(a, b) < 0) {
      return this.keccak256Hash(a, b)
    }

    return this.keccak256Hash(b, a)
  }

  private keccak256Hash(a: Uint8Array, b: Uint8Array): Uint8Array {
    const combined = new Uint8Array(a.length + b.length)
    combined.set(a)
    combined.set(b, a.length)

    const hashHex = keccak256(combined)
    return new Uint8Array(Buffer.from(hashHex.slice(2), 'hex'))
  }

  private compareBytes(a: Uint8Array, b: Uint8Array): number {
    const minLength = Math.min(a.length, b.length)

    for (let i = 0; i < minLength; i++) {
      if (a[i] < b[i]) return -1
      if (a[i] > b[i]) return 1
    }

    if (a.length < b.length) return -1
    if (a.length > b.length) return 1
    return 0
  }

  private bytesToBigInt(bytes: Uint8Array): bigint {
    let result = 0n
    for (let i = 0; i < bytes.length; i++) {
      result = (result << 8n) | BigInt(bytes[i])
    }
    return result
  }

  private bigIntToBytes(value: bigint): Uint8Array {
    if (value === 0n) return new Uint8Array([0])

    const bytes: number[] = []
    let temp = value

    while (temp > 0n) {
      bytes.unshift(Number(temp & 0xffn))
      temp >>= 8n
    }

    return new Uint8Array(bytes)
  }

  private reverseArray<T>(arr: T[]): void {
    let i = 0
    let j = arr.length - 1

    while (i < j) {
      const temp = arr[i]
      arr[i] = arr[j]
      arr[j] = temp
      i++
      j--
    }
  }

  // Derive priority function matching Go implementation
  static derivePriority(key: Uint8Array): bigint {
    const keyHashHex = keccak256(key)
    const keyHashBytes = new Uint8Array(Buffer.from(keyHashHex.slice(2), 'hex'))

    let keyHash = 0n
    for (let i = 0; i < keyHashBytes.length; i++) {
      keyHash = (keyHash << 8n) | BigInt(keyHashBytes[i])
    }

    const maxUint64 = 2n ** 64n - 1n
    return keyHash % maxUint64
  }
}
