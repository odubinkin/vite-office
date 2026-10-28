/** @fileoverview Original AttributeConversion XString decoder and consumed AttributeList Unicode optional/defaulted queries over the actual FastAttributeList. Numeric/token/drawing/date queries and full UNO ownership remain unported. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { FastAttributeList } from "../../../sax/source/tools/fastattribs";
import { sanitizeStringSurrogates } from "../../../comphelper/source/misc/string";
const XSTRING_ENCCHAR_LEN = 7;
/** Original hex digit accumulation with short-circuit partial output. @param char - Code-unit output. @param digit - Native unit. @param shift - Nibble shift. @returns Valid digit. */
function lclAddHexDigit(char: [number], digit: number, shift: number): boolean {
  if (48 <= digit && digit <= 57) {
    char[0] |= (digit - 48) << shift;
    return true;
  }
  if (97 <= digit && digit <= 102) {
    char[0] |= (digit - 97 + 10) << shift;
    return true;
  }
  if (65 <= digit && digit <= 70) {
    char[0] |= (digit - 65 + 10) << shift;
    return true;
  }
  return false;
}
/** Original pointer scan recognizes lowercase x and exactly four hex units; failed attempts advance one unit. @param source - Actual UTF16 pointer storage. @param cursor - In/out pointer index. @param end - Logical end. @returns One decoded or literal unit. */
function lclGetXChar(source: Uint16Array, cursor: [number], end: number): number {
  const i = cursor[0],
    char: [number] = [0];
  if (
    end - i >= XSTRING_ENCCHAR_LEN &&
    source[i] === 95 &&
    source[i + 1] === 120 &&
    source[i + 6] === 95 &&
    lclAddHexDigit(char, source[i + 2] as number, 12) &&
    lclAddHexDigit(char, source[i + 3] as number, 8) &&
    lclAddHexDigit(char, source[i + 4] as number, 4) &&
    lclAddHexDigit(char, source[i + 5] as number, 0)
  ) {
    cursor[0] += XSTRING_ENCCHAR_LEN;
    return char[0];
  }
  return source[cursor[0]++] as number;
}
/** Original no-recursion XString decoding; only the path containing lowercase _x runs surrogate sanitization. @param value - Actual Unicode value. @returns Owned decoded/COW result. */
function decodeXString(value: OUStringConstReference): OUString {
  if (value.getLength() < XSTRING_ENCCHAR_LEN) return new OUString(value);
  const index = value.indexOf(Uint16Array.of(95, 120));
  if (index === -1) return new OUString(value);
  const prefix = value.copy(0, index),
    buffer = new OUStringBuffer(prefix),
    cursor: [number] = [index];
  prefix.dispose();
  try {
    while (cursor[0] < value.getLength())
      buffer.append(Uint16Array.of(lclGetXChar(value.getStr(), cursor, value.getLength())), 1);
    const decoded = buffer.makeStringAndClear();
    try {
      return sanitizeStringSurrogates(decoded);
    } finally {
      decoded.dispose();
    }
  } finally {
    buffer.dispose();
  }
}
/** Original static member group for admitted conversions; no replacement token/numeric parser is supplied. */
export const AttributeConversion = { decodeXString };
/** Actual native wrapper borrows the existing attribute owner; optional absence is undefined, distinct from present empty. */
export class AttributeList {
  /** Retains the actual native-list owner. @param mxAttribs - Attribute list. @returns Wrapper. */
  constructor(private readonly mxAttribs: FastAttributeList) {}
  /** Borrows native list. @returns Same owner. */
  getFastAttributeList(): FastAttributeList {
    return this.mxAttribs;
  }
  /** Original delegated presence check. @param token - Attribute identity. @returns Presence. */
  hasAttribute(token: number): boolean {
    return this.mxAttribs.hasAttribute(token);
  }
  /** Original optional string query. @param token - Attribute identity. @returns Owned value or absence. */
  getString(token: number): OUString | undefined;
  /** Original explicit default query. @param token - Attribute identity. @param fallback - Actual default reference. @returns Owned value. */
  getString(token: number, fallback: OUStringConstReference): OUString;
  /** Original optional/default dispatch. @param token - Attribute identity. @param fallback - Optional default reference. @returns Owned value or absence. */
  getString(token: number, fallback?: OUStringConstReference): OUString | undefined {
    const index = this.mxAttribs.getAttributeIndex(token);
    if (index >= 0) return this.mxAttribs.getValueByIndex(index);
    return fallback === undefined ? undefined : new OUString(fallback);
  }
  /** Original default-empty query. @param token - Attribute identity. @returns Actual Unicode value. */
  getStringDefaulted(token: number): OUString {
    return this.getString(token) ?? new OUString();
  }
  /** Original optional decoded-string query. @param token - Attribute identity. @returns Owned decoded value or absence. */
  getXString(token: number): OUString | undefined;
  /** Original decoded-string default query; missing default is returned without decoding. @param token - Attribute identity. @param fallback - Actual default. @returns Owned value. */
  getXString(token: number, fallback: OUStringConstReference): OUString;
  /** Original optional/defaulted dispatch. @param token - Attribute identity. @param fallback - Actual optional default. @returns Owned value or absence. */
  getXString(token: number, fallback?: OUStringConstReference): OUString | undefined {
    const index = this.mxAttribs.getAttributeIndex(token);
    if (index >= 0) {
      const value = this.mxAttribs.getValueByIndex(index);
      try {
        return AttributeConversion.decodeXString(value);
      } finally {
        value.dispose();
      }
    }
    return fallback === undefined ? undefined : new OUString(fallback);
  }
}
