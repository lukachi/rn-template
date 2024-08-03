const RnWtnscalcs = require('./NativeRnWtnscalcs').default;

export function multiply(a: number, b: number): number {
  return RnWtnscalcs.multiply(a, b);
}
