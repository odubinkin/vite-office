/** @fileoverview Compile-time RTL string flags and mask macros from strimp.hxx, independent of C implementation exports. */
/** Original interned-string flag, unsigned32. */
export const SAL_STRING_INTERN_FLAG = 0x80000000;
/** Original static-string flag, unsigned32. */
export const SAL_STRING_STATIC_FLAG = 0x40000000;
/** Extracts original low30 reference bits. @param value - Signed32 flag/count field. @returns Native reference count. */
export function SAL_STRING_REFCOUNT(value: number): number {
  return value & 0x3fffffff;
}
/** Original intern macro. @param value - Concrete data. @returns Unsigned flag mask. */
export function SAL_STRING_IS_INTERN(value: { readonly refCount: number }): number {
  return (value.refCount & SAL_STRING_INTERN_FLAG) >>> 0;
}
/** Original static macro. @param value - Concrete data. @returns Unsigned flag mask. */
export function SAL_STRING_IS_STATIC(value: { readonly refCount: number }): number {
  return (value.refCount & SAL_STRING_STATIC_FLAG) >>> 0;
}
