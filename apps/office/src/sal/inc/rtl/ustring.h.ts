/** @fileoverview Original include/rtl/ustring.h C declaration boundary owned by the SAL library. */
export { rtl_ustr_reverseCompare_WithLength } from "../../rtl/ustring";
export { rtl_ustr_asciil_reverseEquals_WithLength } from "../../rtl/ustring";

/** Original flexible Unicode data structure; borrowed buffers retain native UInt16 units and concrete identity. */
export interface _rtl_uString {
  /** Original opaque signed32 reference count including static and intern flag bits. */
  refCount: number;
  /** Original signed32 logical length, excluding the terminating zero. */
  length: number;
  /** Original trailing UTF16 storage, including terminator and optional allocated spare capacity. */
  buffer: Uint16Array;
}
/** Original public typedef of the Unicode data structure. */
export type rtl_uString = _rtl_uString;
/** One concrete caller-owned pointer slot adapts rtl_uString** without changing data identity or ownership. */
export type rtl_uStringSlot = [rtl_uString | null];
export {
  rtl_ustr_toInt64_WithLength,
  rtl_ustr_indexOfChar_WithLength,
  rtl_ustr_lastIndexOfChar_WithLength,
  rtl_ustr_indexOfStr_WithLength,
  rtl_ustr_lastIndexOfStr_WithLength,
  rtl_ustr_lastIndexOfAscii_WithLength,
  rtl_uString_newFromSubString,
  rtl_ustr_compare,
  rtl_ustr_compare_WithLength,
  rtl_ustr_hashCode_WithLength,
  rtl_uString_acquire,
  rtl_uString_alloc,
  rtl_uString_assign,
  rtl_uString_getLength,
  rtl_uString_getStr,
  rtl_uString_intern,
  rtl_uString_new,
  rtl_uString_new_WithLength,
  rtl_uString_newFromStr,
  rtl_uString_newFromStr_WithLength,
  rtl_uString_newFromString,
  rtl_uString_release,
} from "../../rtl/ustring";

export {
  RTL_STR_MAX_VALUEOFINT32 as RTL_USTR_MAX_VALUEOFINT32,
  RTL_STR_MAX_VALUEOFINT64 as RTL_USTR_MAX_VALUEOFINT64,
  RTL_STR_MAX_VALUEOFUINT64 as RTL_USTR_MAX_VALUEOFUINT64,
} from "./string.h";
export {
  rtl_ustr_valueOfInt32,
  rtl_ustr_valueOfInt64,
  rtl_ustr_valueOfUInt64,
} from "../../rtl/ustring";

export { rtl_ustr_toAsciiUpperCase_WithLength } from "../../rtl/ustring";
