/** @fileoverview Native Writer MS font substitution/token mapping and charset conversion. The original Unicode values use existing UTF16/SAL bindings; unrelated Word import helpers are not admitted. */
import {
  GetNextFontToken,
  GetSubsFontName,
  IsOpenSymbol,
  SubsFontFlags,
} from "../../../../unotools/inc/fontdefs";
import { rtl_getBestWindowsCharsetFromTextEncoding } from "../../../../sal/textenc/tencinfo";
import {
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_UCS2,
  RTL_TEXTENCODING_UTF7,
  RTL_TEXTENCODING_UTF8,
  RTL_TEXTENCODING_JAVA_UTF8,
  type rtl_TextEncoding,
} from "../../../../sal/inc/rtl/textenc";
/** UTF16 host binding for the native logical string view. @param value - Host Unicode string. @returns Logical native units. */
function units(value: string): Uint16Array {
  const result = new Uint16Array(value.length);
  for (let index = 0; index < value.length; ++index) result[index] = value.charCodeAt(index);
  return result;
}
/** Native logical view to the immutable host Unicode binding. @param value - Logical native units. @returns Unicode text. */
function text(value: Uint16Array): string {
  let result = "";
  for (const unit of value) result += String.fromCharCode(unit);
  return result;
}
/** Original symbol special case precedes configuration lookup. @param font - Logical family name. @returns Substitution or empty. */
function FindBestMSSubstituteFont(font: Uint16Array): string {
  if (IsOpenSymbol(font)) return "Arial Unicode MS";
  const result = GetSubsFontName(font, SubsFontFlags.ONLYONE | SubsFontFlags.MS);
  try {
    return text(result.getStr().subarray(0, result.getLength()));
  } finally {
    result.dispose();
  }
}
/** Native primary/alternate mapping, retaining raw whitespace and secondary-token fallback. */
export class FontMapExport {
  readonly msPrimary: string;
  readonly msSecondary: string;
  /** Original mapping constructor. @param familyName - Original family/token list. @returns Mapping. */
  constructor(familyName: string) {
    const value = units(familyName),
      index = { value: 0 };
    const primary = GetNextFontToken(value, index);
    this.msPrimary = text(primary);
    let secondary = FindBestMSSubstituteFont(primary);
    if (!secondary && index.value !== -1) secondary = text(GetNextFontToken(value, index));
    this.msSecondary = secondary;
  }
}
/** Original Writer charset wrapper normalizes its listed Unicode/unknown encodings to DEFAULT_CHARSET. @param encoding - Actual encoding ID. @returns Windows charset byte. */
export function rtl_TextEncodingToWinCharset(encoding: rtl_TextEncoding): number {
  encoding &= 0xffff;
  let result = rtl_getBestWindowsCharsetFromTextEncoding(encoding);
  switch (encoding) {
    case RTL_TEXTENCODING_DONTKNOW:
    case RTL_TEXTENCODING_UCS2:
    case RTL_TEXTENCODING_UTF7:
    case RTL_TEXTENCODING_UTF8:
    case RTL_TEXTENCODING_JAVA_UTF8:
      result = 1;
      break;
  }
  return result;
}

import {
  rtl_getTextEncodingFromWindowsCharset,
  rtl_isOctetTextEncoding,
} from "../../../../sal/textenc/tencinfo";
import {
  RTL_TEXTENCODING_MS_932,
  RTL_TEXTENCODING_MS_936,
  RTL_TEXTENCODING_MS_950,
  RTL_TEXTENCODING_MS_949,
} from "../../../../sal/inc/rtl/textenc";
import {
  RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_ERROR,
  RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR,
} from "../../../../sal/inc/rtl/textcvt.h";
import type { rtl_StringSlot } from "../../../../sal/inc/rtl/string.h";
import {
  rtl_convertUStringToString,
  rtl_string_new,
  rtl_string_release,
} from "../../../../sal/rtl/string";

/** Original private font-name predicate uses the source's text-to-Unicode flag values for reverse conversion. @param value - Logical Unicode string. @param encoding - Native encoding. @returns Checked native conversion result. */
function CanEncode(value: string, encoding: rtl_TextEncoding): boolean {
  const target: rtl_StringSlot = [null];
  rtl_string_new(target);
  try {
    return rtl_convertUStringToString(
      target,
      units(value),
      value.length,
      encoding,
      RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_ERROR | RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR,
    );
  } finally {
    if (target[0] !== null) rtl_string_release(target[0]);
  }
}

/** Original RTF font charset choice checks both names, then the exact ordered CJK fallbacks. @param fontName - Native primary name. @param alternateName - Native alternate name. @param encoding - Font encoding. @returns Windows charset byte. */
export function rtl_TextEncodingToWinCharsetRTF(
  fontName: string,
  alternateName: string,
  encoding: rtl_TextEncoding,
): number {
  encoding &= 0xffff;
  let result = rtl_getBestWindowsCharsetFromTextEncoding(encoding);
  const candidate = rtl_getTextEncodingFromWindowsCharset(result);
  if (
    !rtl_isOctetTextEncoding(candidate) ||
    !(CanEncode(fontName, candidate) && CanEncode(alternateName, candidate))
  ) {
    const fallbacks = [
      [RTL_TEXTENCODING_MS_932, 0x80],
      [RTL_TEXTENCODING_MS_936, 0x86],
      [RTL_TEXTENCODING_MS_950, 0x88],
      [RTL_TEXTENCODING_MS_949, 0x81],
    ] as const;
    for (const [fallback, charset] of fallbacks)
      if (CanEncode(fontName, fallback) && CanEncode(alternateName, fallback)) return charset;
    result = 0x01;
  }
  return result;
}
