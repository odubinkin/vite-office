/** @fileoverview Original portable non-SSE2 array summation over genuine borrowed numeric-block pointers. SSE2/long-double profiles remain unsupported. */
import { KahanSum } from "./kahan";
import { FormulaError, GetDoubleErrorValue } from "../../formula/inc/errorcodes";
import type { delayed_delete_vector_iterator } from "../../external/mdds/include/mdds/multi_type_vector/delayed_delete_vector";
/** Original four-stream Neumaier/pairwise unrolled summation;pointer position is a by-value native address. @param index - Native index reference. @param size - Source extent. @param pointer - Actual numeric block pointer. @returns Accumulator. */
function executeUnrolled(
  index: [number],
  size: number,
  pointer: delayed_delete_vector_iterator<number>,
): KahanSum {
  const realSize = size - index[0],
    unrolledSize = realSize - (realSize % 4);
  if (unrolledSize > 0) {
    const sum0 = new KahanSum(0),
      sum1 = new KahanSum(0),
      sum2 = new KahanSum(0),
      sum3 = new KahanSum(0),
      current = pointer.copy();
    for (; index[0] + 3 < unrolledSize; index[0] += 4) {
      sum0.add(current.get());
      current.advance(1);
      sum1.add(current.get());
      current.advance(1);
      sum2.add(current.get());
      current.advance(1);
      sum3.add(current.get());
      current.advance(1);
    }
    const first = new KahanSum(sum0),
      second = new KahanSum(sum2);
    first.add(sum1);
    second.add(sum3);
    first.add(second);
    return first;
  }
  return new KahanSum(0);
}
/** Original sumArray including tail and NoValue-encoded nonfinite re-scan. @param pointer - Actual borrowed numeric storage. @param size - Number of source values. @returns Native compensated sum. */
export function sumArray(pointer: delayed_delete_vector_iterator<number>, size: number): KahanSum {
  const index: [number] = [0];
  let sum = executeUnrolled(index, size, pointer);
  for (; index[0] < size; index[0]++) sum.add(pointer.copy().advance(index[0]).get());
  const value = sum.get();
  if (!Number.isFinite(value)) {
    let error = GetDoubleErrorValue(value);
    if (error === FormulaError.NoValue) {
      sum = new KahanSum(0);
      for (let i = 0; i < size; i++) {
        const item = pointer.copy().advance(i).get();
        if (!Number.isFinite(item)) {
          error = GetDoubleErrorValue(item);
          if (error !== FormulaError.NoValue) sum.add(item);
        } else sum.add(item);
      }
    }
  }
  return sum;
}
