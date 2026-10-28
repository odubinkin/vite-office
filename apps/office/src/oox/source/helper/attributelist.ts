/** @fileoverview Original AttributeConversion XString/numeric decoders and consumed AttributeList Unicode/token/numeric/boolean optional/defaulted queries over actual FastAttributeList and FastTokenHandler owners. Drawing/date/token-list APIs and full UNO ownership remain unported. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { FastAttributeList } from "../../../sax/source/tools/fastattribs";
import { sanitizeStringSurrogates } from "../../../comphelper/source/misc/string";
import * as o3tl from "../../../o3tl/inc/string_view";
import { getTokenFromUtf8, XML_TOKEN_INVALID } from "../token/tokenmap";
const XSTRING_ENCCHAR_LEN = 7;
/** Original signed64-then-clamp unsigned conversion shared by byte/UTF16 paths. @param value - Native view. @returns Saturated unsigned32. */
function decodeUnsigned_impl(value: Uint16Array | Uint8Array): number {
  const parsed = o3tl.toInt64(value);
  return Number(parsed < 0n ? 0n : parsed > 0xffffffffn ? 0xffffffffn : parsed);
}
/** Original unsigned hexadecimal interpretation cast to signed32. @param value - Native view. @returns Signed32 bit pattern. */
function decodeIntegerHex_impl(value: Uint16Array | Uint8Array): number {
  return o3tl.toUInt32(value, 16) | 0;
}
/** Original decimal signed32 conversion. @param value - Native UTF16 view. @returns Signed32. */
function decodeInteger(value: Uint16Array): number {
  return o3tl.toInt32(value);
}
/** Original unsigned32 saturation after signed64 parsing. @param value - Native UTF16 view. @returns Unsigned32. */
function decodeUnsigned(value: Uint16Array): number {
  return decodeUnsigned_impl(value);
}
/** Original decimal signed64 conversion. @param value - Native UTF16 view. @returns Signed64. */
function decodeHyper(value: Uint16Array): bigint {
  return o3tl.toInt64(value);
}
/** Original unsigned hexadecimal value cast to signed32. @param value - Native UTF16 view. @returns Signed32 pattern. */
function decodeIntegerHex(value: Uint16Array): number {
  return decodeIntegerHex_impl(value);
}

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
export const AttributeConversion = {
  decodeXString,
  decodeInteger,
  decodeUnsigned,
  decodeHyper,
  decodeIntegerHex,
};
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
  /** Original empty-default borrowed byte view. @param token - Attribute identity. @returns Borrowed exact byte view or empty. */
  getView(token: number): Uint8Array {
    const value: [Uint8Array] = [new Uint8Array()];
    this.mxAttribs.getAsView(token, value);
    return value[0];
  }
  /** Original optional token query. @param token - Attribute identity. @returns Known value token or absence. */
  getToken(token: number): number | undefined;
  /** Original missing-only default query. @param token - Attribute identity. @param fallback - Default token. @returns Native value/default token. */
  getToken(token: number, fallback: number): number;
  /** Original optional/default dispatch. @param token - Identity. @param fallback - Optional native default. @returns Token or optional absence. */
  getToken(token: number, fallback?: number): number | undefined {
    const value = this.mxAttribs.getOptionalValueToken(token, fallback ?? XML_TOKEN_INVALID);
    return fallback === undefined && value === XML_TOKEN_INVALID ? undefined : value;
  }
  /** Original exact fast spellings, token spellings and signed32 numeric fallback. @param token - Attribute identity. @returns Native bool or missing. */
  private getBoolOptional(token: number): boolean | undefined {
    const index = this.mxAttribs.getAttributeIndex(token);
    if (index === -1) return undefined;
    const bytes = this.mxAttribs.getAsViewByIndex(index);
    if (
      bytes.length === 5 &&
      bytes[0] === 102 &&
      bytes[1] === 97 &&
      bytes[2] === 108 &&
      bytes[3] === 115 &&
      bytes[4] === 101
    )
      return false;
    if (
      bytes.length === 4 &&
      bytes[0] === 116 &&
      bytes[1] === 114 &&
      bytes[2] === 117 &&
      bytes[3] === 101
    )
      return true;
    const value = this.mxAttribs.getValueTokenByIndex(index);
    switch (value) {
      case getTokenFromUtf8("t"):
      case getTokenFromUtf8("true"):
      case getTokenFromUtf8("on"):
        return true;
      case getTokenFromUtf8("f"):
      case getTokenFromUtf8("false"):
      case getTokenFromUtf8("off"):
        return false;
    }
    return o3tl.toInt32(bytes) !== 0;
  }

  /** Original optional numeric query. @param token - Attribute. @returns Native value or absence. */
  getInteger(token: number): number | undefined;
  /** Original explicitly defaulted query. @param token - Attribute. @param fallback - Native default. @returns Native value or default. */
  getInteger(token: number, fallback: number): number;
  /** Original optional/default dispatch preserving present zero. @param token - Identity. @param fallback - Optional default. @returns Converted value/default/absence. */
  getInteger(token: number, fallback?: number): number | undefined {
    const output: [number] = [0];
    const value = this.mxAttribs.getAsInteger(token, output) ? output[0] : undefined;
    return value ?? fallback;
  }

  /** Original optional numeric query. @param token - Attribute. @returns Native value or absence. */
  getDouble(token: number): number | undefined;
  /** Original explicitly defaulted query. @param token - Attribute. @param fallback - Native default. @returns Native value or default. */
  getDouble(token: number, fallback: number): number;
  /** Original optional/default dispatch preserving present zero. @param token - Identity. @param fallback - Optional default. @returns Converted value/default/absence. */
  getDouble(token: number, fallback?: number): number | undefined {
    const output: [number] = [0];
    const value = this.mxAttribs.getAsDouble(token, output) ? output[0] : undefined;
    return value ?? fallback;
  }

  /** Original optional numeric query. @param token - Attribute. @returns Native value or absence. */
  getUnsigned(token: number): number | undefined;
  /** Original explicitly defaulted query. @param token - Attribute. @param fallback - Native default. @returns Native value or default. */
  getUnsigned(token: number, fallback: number): number;
  /** Original optional/default dispatch preserving present zero. @param token - Identity. @param fallback - Optional default. @returns Converted value/default/absence. */
  getUnsigned(token: number, fallback?: number): number | undefined {
    const view = this.getView(token);
    const value = view.length ? decodeUnsigned_impl(view) : undefined;
    return value ?? fallback;
  }

  /** Original optional numeric query. @param token - Attribute. @returns Native value or absence. */
  getHyper(token: number): bigint | undefined;
  /** Original explicitly defaulted query. @param token - Attribute. @param fallback - Native default. @returns Native value or default. */
  getHyper(token: number, fallback: bigint): bigint;
  /** Original optional/default dispatch preserving present zero. @param token - Identity. @param fallback - Optional default. @returns Converted value/default/absence. */
  getHyper(token: number, fallback?: bigint): bigint | undefined {
    const view = this.getView(token);
    const value = view.length ? o3tl.toInt64(view) : undefined;
    return value ?? fallback;
  }

  /** Original optional numeric query. @param token - Attribute. @returns Native value or absence. */
  getIntegerHex(token: number): number | undefined;
  /** Original explicitly defaulted query. @param token - Attribute. @param fallback - Native default. @returns Native value or default. */
  getIntegerHex(token: number, fallback: number): number;
  /** Original optional/default dispatch preserving present zero. @param token - Identity. @param fallback - Optional default. @returns Converted value/default/absence. */
  getIntegerHex(token: number, fallback?: number): number | undefined {
    const view = this.getView(token);
    const value = view.length ? decodeIntegerHex_impl(view) : undefined;
    return value ?? fallback;
  }

  /** Original defaulted unsigned hexadecimal query; empty/missing gets default before the unsigned cast. @param token - Attribute. @param fallback - Unsigned default. @returns Unsigned32. */
  getUnsignedHex(token: number, fallback: number): number {
    return (this.getIntegerHex(token) ?? fallback) >>> 0;
  }
  /** Original optional boolean query. @param token - Attribute identity. @returns Native bool or absence. */
  getBool(token: number): boolean | undefined;
  /** Original explicitly defaulted boolean query. @param token - Attribute identity. @param fallback - Native bool default. @returns Native result. */
  getBool(token: number, fallback: boolean): boolean;
  /** Original optional/default dispatch retains present false values. @param token - Attribute. @param fallback - Optional default. @returns Native bool/default/absence. */
  getBool(token: number, fallback?: boolean): boolean | undefined {
    return this.getBoolOptional(token) ?? fallback;
  }
}
