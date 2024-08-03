const RnWtnscalcs = require('./NativeRnWtnscalcs').default

export function multiply(a: number, b: number): number {
  return RnWtnscalcs.multiply(a, b)
}

export function plus(a: number, b: number): number {
  return RnWtnscalcs.plus(a, b)
}

export function generateAuthWtns(jsonInputs: string): Promise<string> {
  return RnWtnscalcs.generateAuthWtns(jsonInputs)
}
