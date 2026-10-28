/** @fileoverview Original SAL byte-string C declarations, ownership types and scalar constants. */
/** Original minimum radix admitted by RTL integer conversion. */
export const RTL_STR_MIN_RADIX = 2;
/** Original maximum radix admitted by RTL integer conversion. */
export const RTL_STR_MAX_RADIX = 36;
/** Original signed32 formatting-buffer macro; preserve its source-defined value. */
export const RTL_STR_MAX_VALUEOFINT32 = 33;
/** Original signed64 formatting-buffer macro; preserve its source-defined value. */
export const RTL_STR_MAX_VALUEOFINT64 = 65;
/** Original unsigned64 formatting-buffer macro. */
export const RTL_STR_MAX_VALUEOFUINT64 = 65;
/** Original float-format buffer bound,including terminating zero. */
export const RTL_STR_MAX_VALUEOFFLOAT = 15;

/** Original double-format buffer bound,including terminating zero. */
export const RTL_STR_MAX_VALUEOFDOUBLE = 25;

export { rtl_str_toInt64, rtl_str_toInt64_WithLength, rtl_str_toUInt64 } from "../../rtl/string";

/** Original flexible byte-string data; length excludes its trailing zero. */
export interface _rtl_String {
  refCount: number;
  length: number;
  buffer: Uint8Array;
}
/** Original public byte-string data typedef. */
export type rtl_String = _rtl_String;
/** Concrete pointer-slot binding of rtl_String**. */
export type rtl_StringSlot = [rtl_String | null];
export {
  rtl_string_alloc,
  rtl_string_acquire,
  rtl_string_release,
  rtl_string_new,
  rtl_string_new_WithLength,
} from "../../rtl/string";

export { rtl_uString2String, rtl_convertUStringToString } from "../../rtl/string";

import * as cvt from "./textcvt.h";

/** Original best-effort OUString-to-OString conversion flags. */
export const OUSTRING_TO_OSTRING_CVTFLAGS =
  cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_DEFAULT |
  cvt.RTL_UNICODETOTEXT_FLAGS_INVALID_DEFAULT |
  cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_REPLACE |
  cvt.RTL_UNICODETOTEXT_FLAGS_PRIVATE_MAPTO0;

export {
  rtl_string_newFromStr_WithLength,
  rtl_string_assign,
  rtl_string_newFromSubString,
  rtl_str_indexOfChar_WithLength,
  rtl_str_indexOfStr_WithLength,
} from "../../rtl/string";
