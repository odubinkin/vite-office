/** @fileoverview Original complete runtime Unicode/ASCII character and UTF16 surrogate contracts from include/rtl/character.hxx. */

/** Original sal_uInt32 Unicode-codepoint predicate; integral arguments retain native conversion. @param code - Original integral input. @returns Original Unicode range predicate. */
export function isUnicodeCodePoint(code: number): boolean {
  code >>>= 0;
  return code <= 0x10ffff;
}
/** Original ASCII predicate and Unicode precondition. @param code - Code point. @returns Whether ASCII. */
export function isAscii(code: number): boolean {
  code >>>= 0;
  if (!isUnicodeCodePoint(code)) throw new Error("assert(isUnicodeCodePoint(code))");
  return code <= 0x7f;
}
/** Original ASCII lowercase predicate. @param code - Code point. @returns Whether lowercase ASCII. */
export function isAsciiLowerCase(code: number): boolean {
  code >>>= 0;
  if (!isUnicodeCodePoint(code)) throw new Error("assert(isUnicodeCodePoint(code))");
  return code >= 97 && code <= 122;
}
/** Original ASCII uppercase predicate. @param code - Code point. @returns Whether uppercase ASCII. */
export function isAsciiUpperCase(code: number): boolean {
  code >>>= 0;
  if (!isUnicodeCodePoint(code)) throw new Error("assert(isUnicodeCodePoint(code))");
  return code >= 65 && code <= 90;
}
/** Original ASCII alphabetic predicate. @param code - Code point. @returns Whether ASCII alphabetic. */
export function isAsciiAlpha(code: number): boolean {
  code >>>= 0;
  if (!isUnicodeCodePoint(code)) throw new Error("assert(isUnicodeCodePoint(code))");
  return isAsciiLowerCase(code) || isAsciiUpperCase(code);
}
/** Original ASCII decimal predicate. @param code - Code point. @returns Whether ASCII digit. */
export function isAsciiDigit(code: number): boolean {
  code >>>= 0;
  if (!isUnicodeCodePoint(code)) throw new Error("assert(isUnicodeCodePoint(code))");
  return code >= 48 && code <= 57;
}
/** Original ASCII alphanumeric predicate. @param code - Code point. @returns Whether ASCII alphanumeric. */
export function isAsciiAlphanumeric(code: number): boolean {
  code >>>= 0;
  if (!isUnicodeCodePoint(code)) throw new Error("assert(isUnicodeCodePoint(code))");
  return isAsciiDigit(code) || isAsciiAlpha(code);
}
/** Original canonical uppercase hexadecimal predicate. @param code - Code point. @returns Whether canonical ASCII hexadecimal digit. */
export function isAsciiCanonicHexDigit(code: number): boolean {
  code >>>= 0;
  if (!isUnicodeCodePoint(code)) throw new Error("assert(isUnicodeCodePoint(code))");
  return isAsciiDigit(code) || (code >= 65 && code <= 70);
}
/** Original ASCII hexadecimal predicate. @param code - Code point. @returns Whether ASCII hexadecimal digit. */
export function isAsciiHexDigit(code: number): boolean {
  code >>>= 0;
  if (!isUnicodeCodePoint(code)) throw new Error("assert(isUnicodeCodePoint(code))");
  return isAsciiCanonicHexDigit(code) || (code >= 97 && code <= 102);
}
/** Original ASCII octal predicate. @param code - Code point. @returns Whether ASCII octal digit. */
export function isAsciiOctalDigit(code: number): boolean {
  code >>>= 0;
  if (!isUnicodeCodePoint(code)) throw new Error("assert(isUnicodeCodePoint(code))");
  return code >= 48 && code <= 55;
}
/** Original six-character C-locale ASCII whitespace predicate. @param code - Code point. @returns Whether original ASCII whitespace. */
export function isAsciiWhiteSpace(code: number): boolean {
  code >>>= 0;
  if (!isUnicodeCodePoint(code)) throw new Error("assert(isUnicodeCodePoint(code))");
  return code === 32 || code === 12 || code === 10 || code === 13 || code === 9 || code === 11;
}
/** Original ASCII-only uppercase transformation. @param code - Code point. @returns Original transformed code point. */
export function toAsciiUpperCase(code: number): number {
  code >>>= 0;
  if (!isUnicodeCodePoint(code)) throw new Error("assert(isUnicodeCodePoint(code))");
  return isAsciiLowerCase(code) ? code - 32 : code;
}
/** Original ASCII-only lowercase transformation. @param code - Code point. @returns Original transformed code point. */
export function toAsciiLowerCase(code: number): number {
  code >>>= 0;
  if (!isUnicodeCodePoint(code)) throw new Error("assert(isUnicodeCodePoint(code))");
  return isAsciiUpperCase(code) ? code + 32 : code;
}
/** Original exact signed difference of ASCII-lowercased code points. @param code1 - First point. @param code2 - Second point. @returns Original signed comparison. */
export function compareIgnoreAsciiCase(code1: number, code2: number): number {
  code1 >>>= 0;
  code2 >>>= 0;
  if (!isUnicodeCodePoint(code1)) throw new Error("assert(isUnicodeCodePoint(code1))");
  if (!isUnicodeCodePoint(code2)) throw new Error("assert(isUnicodeCodePoint(code2))");
  return toAsciiLowerCase(code1) - toAsciiLowerCase(code2);
}
/** Original detail namespace constants represented by immutable named fields. */
export const detail = {
  surrogatesHighFirst: 0xd800,
  surrogatesHighLast: 0xdbff,
  surrogatesLowFirst: 0xdc00,
  surrogatesLowLast: 0xdfff,
} as const;
/** Original combined surrogate predicate. @param code - Code point. @returns Whether surrogate. */
export function isSurrogate(code: number): boolean {
  code >>>= 0;
  if (!isUnicodeCodePoint(code)) throw new Error("assert(isUnicodeCodePoint(code))");
  return code >= detail.surrogatesHighFirst && code <= detail.surrogatesLowLast;
}
/** Original high-surrogate predicate. @param code - Code point. @returns Whether high surrogate. */
export function isHighSurrogate(code: number): boolean {
  code >>>= 0;
  if (!isUnicodeCodePoint(code)) throw new Error("assert(isUnicodeCodePoint(code))");
  return code >= detail.surrogatesHighFirst && code <= detail.surrogatesHighLast;
}
/** Original low-surrogate predicate. @param code - Code point. @returns Whether low surrogate. */
export function isLowSurrogate(code: number): boolean {
  code >>>= 0;
  if (!isUnicodeCodePoint(code)) throw new Error("assert(isUnicodeCodePoint(code))");
  return code >= detail.surrogatesLowFirst && code <= detail.surrogatesLowLast;
}
/** Original high-half extraction with both ordered preconditions. @param code - Non-BMP code point. @returns High surrogate unit. */
export function getHighSurrogate(code: number): number {
  code >>>= 0;
  if (!isUnicodeCodePoint(code)) throw new Error("assert(isUnicodeCodePoint(code))");
  if (code < 0x10000) throw new Error("assert(code >= 0x10000)");
  return ((code - 0x10000) >> 10) | detail.surrogatesHighFirst;
}
/** Original low-half extraction with both ordered preconditions. @param code - Non-BMP code point. @returns Low surrogate unit. */
export function getLowSurrogate(code: number): number {
  code >>>= 0;
  if (!isUnicodeCodePoint(code)) throw new Error("assert(isUnicodeCodePoint(code))");
  if (code < 0x10000) throw new Error("assert(code >= 0x10000)");
  return ((code - 0x10000) & 0x3ff) | detail.surrogatesLowFirst;
}
/** Original surrogate combination with ordered high/low predicates. @param high - High surrogate. @param low - Low surrogate. @returns Original combined code point. */
export function combineSurrogates(high: number, low: number): number {
  high >>>= 0;
  low >>>= 0;
  if (!isHighSurrogate(high)) throw new Error("assert(isHighSurrogate(high))");
  if (!isLowSurrogate(low)) throw new Error("assert(isLowSurrogate(low))");
  return ((high - detail.surrogatesHighFirst) << 10) + (low - detail.surrogatesLowFirst) + 0x10000;
}
/** Original pointer-output split, including untouched second slot for BMP code points. @param code - Code point. @param output - Original nonnull storage for at least two units. @returns Original written unit count. */
export function splitSurrogates(code: number, output: Uint16Array | null): number {
  code >>>= 0;
  if (!isUnicodeCodePoint(code)) throw new Error("assert(isUnicodeCodePoint(code))");
  if (output === null) throw new Error("assert(output != NULL)");
  if (code < 0x10000) {
    output[0] = code;
    return 1;
  } else {
    output[0] = getHighSurrogate(code);
    output[1] = getLowSurrogate(code);
    return 2;
  }
}
/** Original scalar predicate with short circuit before surrogate validation. @param code - Original integral input. @returns Whether Unicode scalar value. */
export function isUnicodeScalarValue(code: number): boolean {
  code >>>= 0;
  return isUnicodeCodePoint(code) && !isSurrogate(code);
}
