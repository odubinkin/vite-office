/** @fileoverview Consumed native KahanSum value operations from kahan.hxx for the portable non-SSE2 aggregate path. */
import { approxEqual } from "../../sal/inc/rtl/math";
/** Mutable native binary64 reference;typed backing retains encoded NaN bits through JS stores. */
type DoubleReference = [number] | Float64Array;
/** Materializes a native local double reference without passing through a packed JS number array. @param value - Native value. @returns Mutable binary64 reference. */
function doubleReference(value: number): Float64Array {
  const reference = new Float64Array(1);
  reference[0] = value;
  return reference;
}
/** Original Neumaier accumulator with delayed last nonzero term and mutating get semantics. */
export class KahanSum {
  private m_fSum = 0;
  private m_fError = 0;
  private m_fMem = 0;
  /** Original default,value/error and copy constructors. @param args - Initialized native values or copied owner. @returns Accumulator. */
  constructor(...args: [] | [value: number] | [value: number, error: number] | [source: KahanSum]) {
    const first = args[0];
    if (first instanceof KahanSum) {
      this.m_fSum = first.m_fSum;
      this.m_fError = first.m_fError;
      this.m_fMem = first.m_fMem;
    } else {
      this.m_fSum = first ?? 0;
      this.m_fError = args[1] ?? 0;
    }
  }
  /** Original binary64 specialization of the public Neumaier step. @param sum - Mutable sum. @param error - Mutable compensation. @param value - Summand. @returns Nothing. */
  static sumNeumaierNormal(sum: DoubleReference, error: DoubleReference, value: number): void {
    const previous = sum[0] as number,
      next = previous + value;
    if (Math.abs(previous) >= Math.abs(value))
      error[0] = (error[0] as number) + (previous - next + value);
    else error[0] = (error[0] as number) + (value - next + previous);
    sum[0] = next;
  }
  /** Original non-SSE2 add overloads,including explicit compensation when adding another accumulator. @param value - Scalar or source sum. @returns Nothing. */
  add(value: number | KahanSum): void {
    if (value instanceof KahanSum) {
      const sum = doubleReference(value.m_fSum),
        error = doubleReference(value.m_fError);
      if (value.m_fMem !== 0) KahanSum.sumNeumaierNormal(sum, error, value.m_fMem);
      this.add(sum[0] as number);
      this.add(error[0] as number);
      return;
    }
    if (value === 0) return;
    if (this.m_fMem === 0) {
      this.m_fMem = value;
      return;
    }
    const sum = doubleReference(this.m_fSum),
      error = doubleReference(this.m_fError);
    KahanSum.sumNeumaierNormal(sum, error, this.m_fMem);
    this.m_fSum = sum[0] as number;
    this.m_fError = error[0] as number;
    this.m_fMem = value;
  }
  /** Original product-assignment overload consumed by aggregate products. @param value - Multiplier. @returns Nothing. */
  multiply_assign(value: number): void {
    if (this.m_fMem !== 0) {
      this.m_fSum = this.get() * value;
      this.m_fMem = 0;
    } else this.m_fSum = (this.m_fSum + this.m_fError) * value;
    this.m_fError = 0;
  }
  /** Original final value query,including cancellation and flushing the queued term into this owner. @returns Binary64 result. */
  get(): number {
    const total = this.m_fSum + this.m_fError;
    if (this.m_fMem === 0) return total;
    if (
      ((this.m_fMem < 0 && total > 0) || (total < 0 && this.m_fMem > 0)) &&
      approxEqual(this.m_fMem, -total)
    )
      return 0;
    this.add(this.m_fMem);
    this.m_fMem = 0;
    return this.m_fSum + this.m_fError;
  }
}
