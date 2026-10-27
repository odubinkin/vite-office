/** @fileoverview Original ICU78.3 property-vector/script/block/category and digit scalar algorithms over pinned data. Remaining character APIs are unported. */
import {
  propsTrie,
  propsVectorsTrie,
  propsVectors,
  propsVectorsColumns,
  scriptExtensions,
  block_trie,
} from "./uchar_props_data";
import { UTRIE2_GET16 } from "./utrie2.h";
import { ucptrie_get } from "./ucptrie";
import { UScriptCode } from "./unicode/uscript";
import type { UBlockCode } from "./unicode/uchar";
/** Original property-vector lookup;nonnegative column is a native precondition. @param c - UChar32. @param column - Property column. @returns Unsigned properties. */
export function u_getUnicodeProperties(c: number, column: number): number {
  if (column >= propsVectorsColumns) return 0;
  const index = UTRIE2_GET16(propsVectorsTrie, c);
  return propsVectors[index + column] as number;
}
/** Original status-aware script lookup and Script_Extensions handling. @param c - UChar32. @param error - Mutable UErrorCode or null. @returns Script identity. */
export function uscript_getScript(c: number, error: [number] | null): UScriptCode {
  c |= 0;
  if (error === null || error[0] > 0) return UScriptCode.USCRIPT_INVALID_CODE;
  if (c >>> 0 > 0x10ffff) {
    error[0] = 1;
    return UScriptCode.USCRIPT_INVALID_CODE;
  }
  const scriptX = u_getUnicodeProperties(c, 0) & 0xfff,
    codeOrIndex = scriptX & 0x3ff;
  if (scriptX < 0x400) return codeOrIndex as UScriptCode;
  if (scriptX < 0x800) return UScriptCode.USCRIPT_COMMON;
  if (scriptX < 0xc00) return UScriptCode.USCRIPT_INHERITED;
  return scriptExtensions[codeOrIndex] as UScriptCode;
}
/** Original small block trie uses code points shifted by four unless out of range. @param c - UChar32. @returns Native block identity. */
export function ublock_getCode(c: number): UBlockCode {
  let c4 = c >>> 0;
  if (c4 <= 0x10ffff) c4 >>>= 4;
  return ucptrie_get(block_trie, c4 | 0) as UBlockCode;
}

/** Original ICU u_charType reads the main property category bits. @param c - Signed32 Unicode scalar or native out-of-range value. @returns Native general category. */
export function u_charType(c: number): number {
  return UTRIE2_GET16(propsTrie, c | 0) & 0x1f;
}
/** Original decimal digit value reads numeric-type/value bits from the pinned property trie. @param c - UChar32. @returns Decimal digit or minus one. */
export function u_charDigitValue(c: number): number {
  const value = (UTRIE2_GET16(propsTrie, c | 0) >>> 6) - 1;
  return value <= 9 ? value : -1;
}
/** Original radix digit lookup includes decimal digits and ASCII/fullwidth Latin letters. @param ch - UChar32. @param radix - Signed8 radix. @returns Digit or minus one. */
export function u_digit(ch: number, radix: number): number {
  ch |= 0;
  radix = (radix << 24) >> 24;
  let value = -1;
  if (((radix - 2) & 255) <= 34) {
    value = u_charDigitValue(ch);
    if (value < 0) {
      if (ch >= 0x61 && ch <= 0x7a) value = ch - 0x57;
      else if (ch >= 0x41 && ch <= 0x5a) value = ch - 0x37;
      else if (ch >= 0xff41 && ch <= 0xff5a) value = ch - 0xff37;
      else if (ch >= 0xff21 && ch <= 0xff3a) value = ch - 0xff17;
    }
  }
  return value < radix ? value : -1;
}
