/** @fileoverview Test-only initialized native SearchResult caller values and observations; no production array transport or replacement sequence owner. */
import { expect } from "vitest";
import { SearchResult } from "../offapi/com/sun/star/util/SearchResult";
import { Sequence } from "../cppu/inc/com/sun/star/uno/Sequence";
/** Original explicit compiler binding for sequence<long>. */
const Longs = Sequence.specialize<[number]>("sal_Int32", 4);
/** Materializes original initialized signed32 caller cells. @param values - Literal observations. @returns Actual shared sequence owner. */
export function longSequence(values: readonly number[]): Sequence<[number]> {
  const cells = new Map<number, [number]>();
  for (let i = 0; i < values.length; ++i) cells.set(i * 4, [values[i] as number]);
  return new Longs(cells, values.length);
}
/** Calls the original full generated struct constructor with actual sequence values. @param count - Original expression count. @param starts - Original start literals. @param ends - Original end literals. @returns Actual generated value. */
export function searchResult(
  count: number,
  starts: readonly number[],
  ends: readonly number[],
): SearchResult {
  const start = longSequence(starts),
    end = longSequence(ends);
  try {
    return new SearchResult(count, start, end);
  } finally {
    end.dispose();
    start.dispose();
  }
}
/** Reads initialized primitive references without COW or another production value representation. @param value - Actual borrowed sequence. @returns Test-only observation. */
export function offsets(value: Sequence<[number]>): number[] {
  const result: number[] = [];
  for (let i = 0; i < value.getLength(); ++i) result.push(value.operatorIndex(i)[0]);
  return result;
}
expect.addEqualityTesters([
  /** Compares generated fields by their native value equality, excluding implementation storage/refcounts from fixture expectations. @param left - Actual value. @param right - Expected value. @returns Native equality or unrelated-type abstention. */
  (left: unknown, right: unknown): boolean | undefined =>
    left instanceof SearchResult && right instanceof SearchResult ? left.equals(right) : undefined,
]);
