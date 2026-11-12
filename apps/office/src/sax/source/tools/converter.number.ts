/** @fileoverview Original converter.cxx internal unsigned readers shared by duration and date conversion. Source static-template linkage is split only to keep complete owners within the file budget; UTF16 views reuse actual RTL parsing/trim. */
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { rtl_ustr_toInt64_WithLength } from "../../../sal/inc/rtl/ustring.h";
import { trim } from "../../../o3tl/inc/string_view";
/** Existing UTF16 source view or its language-level string/OUString binding. Byte-view specialization remains unported. */
export type StringSource = string | Uint16Array | OUStringConstReference;
/** Binds the original implicit UTF16 view without creating document/value/type storage. @param source - Declared string input. @returns Native view. */
export function sourceView(source: StringSource): Uint16Array {
  if (typeof source !== "string")
    return ArrayBuffer.isView(source)
      ? (source as Uint16Array)
      : source.getStr().subarray(0, source.getLength());
  const units = new Uint16Array(source.length);
  for (let i = 0; i < source.length; ++i) units[i] = source.charCodeAt(i);
  return units;
}
/** Original three-state reader result. */
export enum Result {
  R_NOTHING,
  R_OVERFLOW,
  R_SUCCESS,
}
/** Original entire token read, actual signed64 RTL parsing, >=INT32_MAX test and int32 destination assignment. @param input - UTF16 view. @param position - Cursor. @param output - Signed32 output. @returns Original result. */
export function readUnsignedNumber(
  input: Uint16Array,
  position: [number],
  output: [number],
): Result {
  let at = position[0];
  while (at < input.length) {
    const c = input[at] as number;
    if (c < 48 || c > 57) break;
    ++at;
  }
  if (at === position[0]) {
    output[0] = -1;
    return Result.R_NOTHING;
  }
  const value = rtl_ustr_toInt64_WithLength(input.subarray(position[0]), 10, at - position[0]);
  position[0] = at;
  output[0] = Number(BigInt.asIntN(32, value));
  return value >= 2147483647n ? Result.R_OVERFLOW : Result.R_SUCCESS;
}
/** Original bounded retained digits with full token consumption. Current callers instantiate maxDigits9; native signed64 overflow for excessive instantiations is not qualified. @param digits - Retained digit count. @param input - View. @param position - Cursor. @param output - Signed32 output. @returns Original result. */
export function readUnsignedNumberMaxDigits(
  digits: number,
  input: Uint16Array,
  position: [number],
  output: [number],
): Result {
  let overflow = false,
    value = 0,
    at = position[0];
  while (at < input.length) {
    const c = input[at] as number;
    if (c >= 48 && c <= 57) {
      if (digits > 0) {
        value = value * 10 + c - 48;
        if (value >= 2147483647) overflow = true;
        --digits;
      }
    } else break;
    ++at;
  }
  if (at === position[0]) {
    output[0] = -1;
    return Result.R_NOTHING;
  }
  position[0] = at;
  output[0] = value | 0;
  return overflow ? Result.R_OVERFLOW : Result.R_SUCCESS;
}

/** Original trimmed UTF16 view. @param source - Declared input. @returns Borrowed trimmed view. */
export function trimmedView(source: StringSource): Uint16Array {
  return trim(sourceView(source));
}

/** Native byte-view ABI discrimination is realm independent; this inspects only declared typed-array element width, never a UNO value/type/default. @param value - Original declared source view. @returns Byte-view predicate. */
export function isByteStringView(value: unknown): value is Uint8Array {
  return ArrayBuffer.isView(value) && (value as Uint8Array).BYTES_PER_ELEMENT === 1;
}
