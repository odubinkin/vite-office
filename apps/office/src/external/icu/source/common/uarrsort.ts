/** @fileoverview ICU78.3 stable insertion and unstable quicksort paths; pointer/byte layout is projected as value/record array indices. Native allocation and ABI remain outside this binding. */
import { UErrorCode, U_FAILURE } from "./unicode/utypes";

/** Original last-equal stable binary/linear search. @param array - Prefix storage. @param limit - Exclusive prefix limit. @param item - Compared value. @param compare - Source comparator. @returns Last equal index, or complemented insertion index. */
export function uprv_stableBinarySearch<T>(
  array: readonly T[],
  limit: number,
  item: T,
  compare: (left: T, right: T) => number,
): number {
  let start = 0,
    found = false;
  while (limit - start >= 9) {
    const i = Math.trunc((start + limit) / 2),
      diff = compare(item, array[i] as T);
    if (diff === 0) {
      found = true;
      start = i + 1;
    } else if (diff < 0) limit = i;
    else start = i;
  }
  while (start < limit) {
    const diff = compare(item, array[start] as T);
    if (diff === 0) found = true;
    else if (diff < 0) break;
    ++start;
  }
  return found ? start - 1 : ~start;
}

/** Original insertion-sort body over a source sub-array. Values/records are immutable during the consumed comparator calls. @param array - Actual owner. @param start - Sub-array start. @param limit - Exclusive bound. @param compare - Comparator. @returns Nothing. */
function doInsertionSort<T>(
  array: T[],
  start: number,
  limit: number,
  compare: (left: T, right: T) => number,
): void {
  for (let j = start + 1; j < limit; ++j) {
    let low = start,
      high = j,
      found = false;
    while (high - low >= 9) {
      const i = Math.trunc((low + high) / 2),
        diff = compare(array[j] as T, array[i] as T);
      if (diff === 0) {
        found = true;
        low = i + 1;
      } else if (diff < 0) high = i;
      else low = i;
    }
    while (low < high) {
      const diff = compare(array[j] as T, array[low] as T);
      if (diff === 0) found = true;
      else if (diff < 0) break;
      ++low;
    }
    let point = found ? low - 1 : ~low;
    point = point < 0 ? ~point : point + 1;
    if (point < j) {
      const value = array[j] as T;
      for (let i = j; i > point; --i) array[i] = array[i - 1] as T;
      array[point] = value;
    }
  }
}
/** Original smaller-side recursive, larger-side iterative quicksort with copied middle pivot. @param array - Actual storage. @param start - Inclusive bound. @param limit - Exclusive bound. @param compare - Source comparator. @returns Nothing. */
function subQuickSort<T>(
  array: T[],
  start: number,
  limit: number,
  compare: (left: T, right: T) => number,
): void {
  do {
    if (start + 9 >= limit) {
      doInsertionSort(array, start, limit, compare);
      break;
    }
    let left = start,
      right = limit;
    const pivot = array[Math.trunc((start + limit) / 2)] as T;
    do {
      while (compare(array[left] as T, pivot) < 0) ++left;
      while (compare(pivot, array[right - 1] as T) < 0) --right;
      if (left < right) {
        --right;
        if (left < right) {
          const value = array[left] as T;
          array[left] = array[right] as T;
          array[right] = value;
        }
        ++left;
      }
    } while (left < right);
    if (right - start < limit - left) {
      if (start < right - 1) subQuickSort(array, start, right, compare);
      start = left;
    } else {
      if (left < limit - 1) subQuickSort(array, left, limit, compare);
      limit = right;
    }
  } while (start < limit - 1);
}
/** Original argument checks and stable/unstable dispatch over scalar or immutable record values. Native itemSize is retained for validation, not a JavaScript layout/allocator certificate. @param array - Actual array/null. @param length - Native signed32 length. @param itemSize - Source byte width. @param compare - Original comparator/context projection. @param sortStable - Original stability flag. @param status - Nullable sticky status. @returns Nothing. */
export function uprv_sortArray<T>(
  array: T[] | null,
  length: number,
  itemSize: number,
  compare: ((left: T, right: T) => number) | null,
  sortStable: boolean,
  status: [number] | null,
): void {
  if (status === null || U_FAILURE(status[0])) return;
  length |= 0;
  itemSize |= 0;
  if ((length > 0 && array === null) || length < 0 || itemSize <= 0 || compare === null) {
    status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
    return;
  }
  if (length <= 1) return;
  if (length < 9 || sortStable) doInsertionSort(array as T[], 0, length, compare);
  else subQuickSort(array as T[], 0, length, compare);
}
