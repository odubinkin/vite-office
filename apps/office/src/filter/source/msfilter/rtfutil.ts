/** @fileoverview Native RTF hex and UTF16 string emission from filter/source/msfilter/rtfutil.cxx. */
import type { rtl_TextEncoding } from "../../../sal/inc/rtl/textenc";
import { OUSTRING_TO_OSTRING_CVTFLAGS, type rtl_StringSlot } from "../../../sal/inc/rtl/string.h";
import {
  rtl_convertUStringToString,
  rtl_string_new,
  rtl_string_release,
} from "../../../sal/rtl/string";

/** Original UInt32/UInt8 narrowing, low-nibble loop and sixteen-digit bound. @param value - Native hex integer. @param length - Native unsigned byte width. @returns Lowercase hexadecimal text. */
export function OutHex(value: number, length: number): string {
  value >>>= 0;
  length &= 0xff;
  if (length >= 17) length = 16;
  let result = "";
  for (let i = 0; i < length; i++) {
    const digit = value & 15;
    result = String.fromCharCode(digit + 48 + (digit > 9 ? 39 : 0)) + result;
    value >>>= 4;
  }
  return result;
}

/** Original per-code-unit conversion; the checked result is intentionally ignored and the temporary starts empty. @param unit - UTF16 code unit. @param mode - Optional current Unicode fallback width. @param encoding - Native destination encoding. @param unicode - Emit Unicode controls. @returns RTF fragment. */
function OutChar(
  unit: number,
  mode: [number] | null,
  encoding: rtl_TextEncoding,
  unicode: boolean,
): string {
  unit &= 0xffff;
  switch (unit) {
    case 0x0b:
      return "\\line ";
    case 0x09:
      return "\\tab ";
    case 0x5c:
    case 0x7b:
    case 0x7d:
      return "\\" + String.fromCharCode(unit);
    case 0xa0:
      return "\\~";
    case 0x1e:
      return "\\_";
    case 0x1f:
      return "\\-";
  }
  if (unit >= 0x20 && unit <= 0x7e) return String.fromCharCode(unit);
  const target: rtl_StringSlot = [null];
  rtl_string_new(target);
  try {
    rtl_convertUStringToString(
      target,
      Uint16Array.of(unit),
      1,
      encoding,
      OUSTRING_TO_OSTRING_CVTFLAGS,
    );
    const converted = target[0];
    /* istanbul ignore if -- B8TCAE-R01: checked conversion preserves the initialized owner on failure and assigns non-null storage on success; allocation failure throws. */
    if (converted === null) throw new Error("Original OString temporary is null");
    else {
      /* Keep the normally exercised alternative visible to source mapping. */
    }
    let result = "";
    if (mode !== null && unicode) {
      if (mode[0] !== converted.length) {
        result += `\\uc${converted.length} `;
        mode[0] = converted.length;
      }
      result += `\\u${(unit << 16) >> 16}`;
    }
    for (let i = 0; i < converted.length; i++)
      result += "\\'" + OutHex(converted.buffer[i] as number, 2);
    return result;
  } finally {
    if (target[0] !== null) rtl_string_release(target[0]);
  }
}

/** Original UTF16-unit loop and final Unicode-fallback reset. @param value - Native logical UTF16 view. @param encoding - Native destination encoding. @param unicode - Whether Unicode controls accompany encoded bytes. @returns RTF bytes in the existing byte-string binding. */
export function OutString(value: string, encoding: rtl_TextEncoding, unicode = true): string {
  const mode: [number] = [1];
  let result = "";
  for (let i = 0; i < value.length; i++)
    result += OutChar(value.charCodeAt(i), mode, encoding, unicode);
  if (mode[0] !== 1) result += "\\uc1 ";
  return result;
}

/** Original dual legacy/Unicode representation for one RTF destination. @param token - ASCII destination token. @param value - UTF16 view. @param encoding - Native destination encoding. @returns Complete upr/ud group. */
export function OutStringUpr(token: string, value: string, encoding: rtl_TextEncoding): string {
  return (
    "{\\upr{" +
    token +
    " " +
    OutString(value, encoding, false) +
    "}{\\*\\ud{" +
    token +
    " " +
    OutString(value, encoding) +
    "}}}"
  );
}
