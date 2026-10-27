/** @fileoverview Original private RTL string flag and allocator declaration header. */
import type { rtl_uString } from "../inc/rtl/ustring.h";
export { rtl_stringAllocation } from "./strimp";

export {
  SAL_STRING_INTERN_FLAG,
  SAL_STRING_STATIC_FLAG,
  SAL_STRING_REFCOUNT,
  SAL_STRING_IS_INTERN,
  SAL_STRING_IS_STATIC,
} from "./strimp.flags";

/** Original replaceable allocation-function pointer, using the current UTF16 raw-allocation carrier; byte template owners reinterpret the same payload as in the native static_cast. */
export type rtl_allocateStringFn = (size: number) => rtl_uString | null;
/** Original replaceable free-function pointer for an owned allocation. */
export type rtl_freeStringFn = (data: rtl_uString) => void;

export { rtl_string_ImplAlloc } from "./string";
export { rtl_uString_ImplAlloc } from "./ustring";
