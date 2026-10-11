/** @fileoverview Original private RTL string flag and allocator declaration header. */
import type { rtl_uString } from "../inc/rtl/ustring.h";
export { rtl_stringAllocation } from "./strimp";

/** Original interned-string flag, unsigned32. */
export const SAL_STRING_INTERN_FLAG = 0x80000000;
/** Original static-string flag, unsigned32. */
export const SAL_STRING_STATIC_FLAG = 0x40000000;
/** Extracts original low30 reference bits. @param value - Signed32 flag/count field. @returns Native reference count. */
export function SAL_STRING_REFCOUNT(value: number): number {
  return value & 0x3fffffff;
}
/** Original intern macro. @param value - Concrete data. @returns Unsigned flag mask. */
export function SAL_STRING_IS_INTERN(value: rtl_uString): number {
  return (value.refCount & SAL_STRING_INTERN_FLAG) >>> 0;
}
/** Original static macro. @param value - Concrete data. @returns Unsigned flag mask. */
export function SAL_STRING_IS_STATIC(value: rtl_uString): number {
  return (value.refCount & SAL_STRING_STATIC_FLAG) >>> 0;
}
/** Original replaceable allocation-function pointer, specialized to concrete Unicode data storage. */
export type rtl_allocateStringFn = (size: number) => rtl_uString | null;
/** Original replaceable free-function pointer for an owned allocation. */
export type rtl_freeStringFn = (data: rtl_uString) => void;
