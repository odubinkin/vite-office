/** @fileoverview Original config_map.hxx comparison and ordered-entry type responsibility, using the existing shared SortedVector rather than a new STL/allocator library. */
import type { SortedVector } from "../../o3tl/inc/sorted_vector";
import type { OUStringConstReference } from "../../sal/inc/rtl/ustring";

/** Actual logical std::map pair: immutable copied key and mutable ordinary value reference. */
export interface ConfigEntry<T> {
  readonly first: OUStringConstReference;
  second: T;
}
/** Source comparator-bound storage responsibility; C++ iterator/operator syntax is adapted at NodeMap. */
export type config_map<T> = SortedVector<ConfigEntry<T>>;

/** Original length-first, then binary UTF16 content comparison. @param left - Actual const key. @param right - Actual const key. @returns Strict native order. */
export function LengthContentsCompare(
  left: OUStringConstReference,
  right: OUStringConstReference,
): boolean {
  return left.getLength() === right.getLength()
    ? left.lessThan(right)
    : left.getLength() < right.getLength();
}
