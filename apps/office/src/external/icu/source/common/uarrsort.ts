/** @fileoverview ICU78.3 consumed stable UDate sort path; pointer/byte layout is projected as scalar array indices. Unstable quicksort and native allocation remain outside this binding. */
import { UErrorCode, U_FAILURE } from "./unicode/utypes";

/** Original last-equal stable binary/linear search. @param array - Prefix storage. @param limit - Exclusive prefix limit. @param item - Compared value. @param compare - Source comparator. @returns Last equal index, or complemented insertion index. */
export function uprv_stableBinarySearch(
  array: readonly number[],
  limit: number,
  item: number,
  compare: (left: number, right: number) => number,
): number {
  let start = 0,
    found = false;
  while (limit - start >= 9) {
    const i = Math.trunc((start + limit) / 2),
      diff = compare(item, array[i] as number);
    if (diff === 0) {
      found = true;
      start = i + 1;
    } else if (diff < 0) limit = i;
    else start = i;
  }
  while (start < limit) {
    const diff = compare(item, array[start] as number);
    if (diff === 0) found = true;
    else if (diff < 0) break;
    ++start;
  }
  return found ? start - 1 : ~start;
}

/** Original stable entrypoint for the consumed UDate/itemSize=8 instantiation. The literal true parameter excludes the unported unstable branch. @param array - Scalar storage or null. @param length - Native int32 length. @param itemSize - Original byte size. @param compare - Scalar projection of UComparator/context. @param sortStable - Consumed stable branch. @param status - Nullable sticky status. @returns Nothing. */
export function uprv_sortArray(
  array: number[] | null,
  length: number,
  itemSize: number,
  compare: ((left: number, right: number) => number) | null,
  sortStable: true,
  status: [number] | null,
): void {
  void sortStable;
  if (status === null || U_FAILURE(status[0])) return;
  length |= 0;
  itemSize |= 0;
  if ((length > 0 && array === null) || length < 0 || itemSize <= 0 || compare === null) {
    status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
    return;
  }
  if (length <= 1) return;
  const values = array as number[];
  for (let j = 1; j < length; ++j) {
    let point = uprv_stableBinarySearch(values, j, values[j] as number, compare);
    point = point < 0 ? ~point : point + 1;
    if (point < j) {
      const value = values[j] as number;
      for (let i = j; i > point; --i) values[i] = values[i - 1] as number;
      values[point] = value;
    }
  }
}
