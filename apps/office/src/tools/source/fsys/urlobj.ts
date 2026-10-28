/** @fileoverview Native INetURLObject URI scalar scanning, escaping and consumed presentation modes. URI value assembly is owned by the separate urlobj.object port. */
import { DecodeMechanism, EncodeMechanism, EscapeType, FSysStyle, Part } from "../../inc/urlobj";
import {
  RTL_TEXTENCODING_UTF8,
  RTL_TEXTENCODING_ISO_8859_1,
  type rtl_TextEncoding,
} from "../../../sal/inc/rtl/textenc";

/** Original 128-entry ASCII admission table, in code-point order. */
const aMustEncodeMap = [
  0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
  0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x8000, 0x3fff9, 0xb000, 0x1000,
  0x3fff9, 0x1000, 0x37df9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x37ff9, 0x33ff9, 0x3fff9, 0x3fff9,
  0x77c8, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9,
  0x37fd8, 0x317f1, 0xb100, 0x33cf9, 0xb100, 0x15040, 0x3fff8, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9,
  0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9,
  0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9,
  0x7040, 0xb000, 0x7040, 0xb000, 0x3fff9, 0xb000, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9,
  0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9,
  0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0x3fff9, 0xb000,
  0xb000, 0xb000, 0x1fff9, 0x0,
];

/** UTF16 pointer-range carrier; indices retain native code-unit semantics. */
export interface UriCursor {
  /** Original character buffer. */
  text: string;
  /** Current pointer offset. */
  index: number;
  /** Exclusive native end pointer. */
  end: number;
}
/** Native getUTF32 result and out-parameter escape classification. */
export interface UriScalar {
  /** Scalar, raw surrogate or escaped octet returned by the source. */
  value: number;
  /** Original escape classification. */
  escape: EscapeType;
}
/** Original ASCII hex weight, with -1 for nonhex input. @param char - Code unit. @returns Hex weight. */
function hexWeight(char: number): number {
  return char >= 48 && char <= 57
    ? char - 48
    : char >= 65 && char <= 70
      ? char - 55
      : char >= 97 && char <= 102
        ? char - 87
        : -1;
}
/** Original ASCII admission predicate. @param value - Code point. @param part - Native admission mask. @returns Whether encoding is required. */
export function mustEncode(value: number, part: Part): boolean {
  return value >= 128 || !((aMustEncodeMap[value] ?? 0) & part);
}
/** Original uppercase escaped-octet output. @param value - Native octet. @returns Percent escape. */
export function appendEscape(value: number): string {
  return "%" + value.toString(16).toUpperCase().padStart(2, "0");
}
/** Original getUTF32 including noncanonical octets and invalid UTF8 rollback. @param cursor - Native pointer range. @param mechanism - Input interpretation. @param charset - Original text encoding. @returns Value and escape type. */
export function getUTF32(
  cursor: UriCursor,
  mechanism: EncodeMechanism,
  charset: rtl_TextEncoding,
): UriScalar {
  const { text, end } = cursor;
  let value = text.charCodeAt(cursor.index++);
  if (value >= 0xd800 && value <= 0xdbff && cursor.index < end) {
    const low = text.charCodeAt(cursor.index);
    if (low >= 0xdc00 && low <= 0xdfff) {
      value = ((value - 0xd800) << 10) + low - 0xdc00 + 0x10000;
      ++cursor.index;
    }
  }
  if (mechanism === EncodeMechanism.All || value !== 37 || cursor.index + 1 >= end)
    return { value, escape: EscapeType.NONE };
  const high = hexWeight(text.charCodeAt(cursor.index)),
    low = hexWeight(text.charCodeAt(cursor.index + 1));
  if (high < 0 || low < 0) return { value, escape: EscapeType.NONE };
  cursor.index += 2;
  value = (high << 4) | low;
  if (mechanism === EncodeMechanism.NotCanonical) return { value, escape: EscapeType.Octet };
  if (charset === RTL_TEXTENCODING_ISO_8859_1 || value < 128)
    return { value, escape: EscapeType.Utf32 };
  if (charset === RTL_TEXTENCODING_UTF8 && value >= 0xc0 && value <= 0xf4) {
    let encoded: number, shift: number, minimum: number;
    if (value <= 0xdf) {
      encoded = (value & 31) << 6;
      shift = 0;
      minimum = 0x80;
    } else if (value <= 0xef) {
      encoded = (value & 15) << 12;
      shift = 6;
      minimum = 0x800;
    } else {
      encoded = (value & 7) << 18;
      shift = 12;
      minimum = 0x10000;
    }
    let next = cursor.index,
      valid = true;
    for (;;) {
      const weight1 = hexWeight(text.charCodeAt(next + 1)),
        weight2 = hexWeight(text.charCodeAt(next + 2));
      if (end - next < 3 || text[next] !== "%" || weight1 < 8 || weight1 > 11 || weight2 < 0) {
        valid = false;
        break;
      }
      next += 3;
      encoded |= (((weight1 & 3) << 4) | weight2) << shift;
      if (shift === 0) break;
      shift -= 6;
    }
    if (
      valid &&
      encoded >= minimum &&
      encoded <= 0x10ffff &&
      (encoded < 0xd800 || encoded > 0xdfff)
    ) {
      cursor.index = next;
      return { value: encoded, escape: EscapeType.Utf32 };
    }
  }
  return { value, escape: EscapeType.Octet };
}
/** Original legacy UTF8 escape writer, including five/six-byte branches. @param value - Native unsigned value below 0x80000000. @returns Escaped bytes. */
export function appendUCS4Escape(value: number): string {
  if (value < 0x80) return appendEscape(value);
  const count =
    value < 0x800 ? 2 : value < 0x10000 ? 3 : value < 0x200000 ? 4 : value < 0x4000000 ? 5 : 6;
  const prefix =
    count === 2 ? 0xc0 : count === 3 ? 0xe0 : count === 4 ? 0xf0 : count === 5 ? 0xf8 : 0xfc;
  let result = appendEscape((value >>> ((count - 1) * 6)) | prefix);
  for (let shift = (count - 2) * 6; shift >= 0; shift -= 6)
    result += appendEscape(((value >>> shift) & 63) | 0x80);
  return result;
}
/** Original appendUCS4 escape selection. @param scalar - Scanned native value. @param part - Character admission mask. @param charset - Input charset. @param keepVisibleEscapes - Preserve originally escaped visible ASCII. @returns Appended native text. */
export function appendUCS4(
  scalar: UriScalar,
  part: Part,
  charset: rtl_TextEncoding,
  keepVisibleEscapes: boolean,
): string {
  const { value, escape } = scalar;
  if (escape === EscapeType.Octet) return appendEscape(value);
  if (mustEncode(value, part))
    return escape === EscapeType.NONE || charset === RTL_TEXTENCODING_UTF8
      ? appendUCS4Escape(value)
      : appendEscape(value);
  if (escape === EscapeType.Utf32 && keepVisibleEscapes && value >= 33 && value <= 126)
    return appendEscape(value);
  return String.fromCharCode(value);
}
/** Ports consumed native decode ToIUri/UTF8 presentation. @param target - URI reference. @returns Internationalized URI reference. */
export function decodeToIUri(target: string): string {
  return decode(target, DecodeMechanism.ToIUri);
}
/** Ports consumed native decode Unambiguous/UTF8 presentation. @param target - Escaped text. @returns Unambiguously decoded text. */
export function decodeUnambiguous(target: string): string {
  return decode(target, DecodeMechanism.Unambiguous);
}
/** Original decode loop over every native presentation mode. ToIUri forces UTF8; other modes retain their supplied charset. @param target - Source text. @param mechanism - Native presentation choice. @param charset - Source charset. @returns Decoded text. */
export function decode(
  target: string,
  mechanism: DecodeMechanism,
  charset: rtl_TextEncoding = RTL_TEXTENCODING_UTF8,
): string {
  if (mechanism === DecodeMechanism.NONE) return target;
  if (mechanism === DecodeMechanism.ToIUri) charset = RTL_TEXTENCODING_UTF8;
  const cursor: UriCursor = { text: target, index: 0, end: target.length };
  let result = "";
  while (cursor.index < cursor.end) {
    const { value, escape } = getUTF32(cursor, EncodeMechanism.WasEncoded, charset);
    if (
      escape === EscapeType.NONE ||
      (escape === EscapeType.Utf32 &&
        (value >= 128 ||
          (mechanism !== DecodeMechanism.ToIUri &&
            (mechanism !== DecodeMechanism.Unambiguous ||
              !mustEncode(value, Part.PART_UNAMBIGUOUS)))))
    )
      result += String.fromCodePoint(value);
    else result += appendEscape(value);
  }
  return result;
}
/** Original generic-scheme scan, including DOS-drive exclusion and nonempty payload. @param cursor - Native pointer range. @param fragmentDelimiter - Active fragment character. @returns Lowercase scheme or empty string; advances only on success. */
export function parseScheme(cursor: UriCursor, fragmentDelimiter: number): string {
  const { text, index, end } = cursor;
  let next = index;
  if (next >= end || !/[a-z]/i.test(text[next] ?? "")) return "";
  do {
    ++next;
  } while (next < end && /[a-z0-9+.-]/i.test(text.charAt(next)));
  if (
    end - next > 1 &&
    text[next] === ":" &&
    text.charCodeAt(next + 1) !== fragmentDelimiter &&
    next - index >= 2
  ) {
    cursor.index = next + 1;
    return text.slice(index, next).toLowerCase();
  }
  return "";
}
/** Original filesystem delimiter vote, ties choose Unix. @param text - Relative input. @param style - Admitted style bits. @returns Selected native style. */
export function guessFSysStyleByCounting(text: string, style: FSysStyle): FSysStyle {
  let slash = style & FSysStyle.Unix ? 0 : -0x80000000,
    backslash = style & FSysStyle.Dos ? 0 : -0x80000000;
  for (const char of text) {
    if (char === "/") ++slash;
    else if (char === "\\") ++backslash;
  }
  return slash >= backslash ? FSysStyle.Unix : FSysStyle.Dos;
}
/** Original domain-label state machine, preserving underscore and eager rollback. @param cursor - Native pointer range. @param eager - Require no incomplete label. @returns Label count. */
export function scanDomain(cursor: UriCursor, eager: boolean): number {
  let state: "Dot" | "Label" | "Hyphen" = "Dot",
    labels = 0,
    lastAlphanumeric = 0;
  for (let next = cursor.index; ; ++next) {
    const char = next < cursor.end ? cursor.text.charAt(next) : "";
    const alphanumeric = char !== "" && /[a-z0-9_]/i.test(char);
    switch (state) {
      case "Dot":
        if (alphanumeric) {
          ++labels;
          state = "Label";
          break;
        }
        if (eager || labels === 0) return 0;
        cursor.index = next - 1;
        return labels;
      case "Label":
        if (alphanumeric) break;
        if (char === ".") {
          state = "Dot";
          break;
        }
        if (char === "-") {
          lastAlphanumeric = next;
          state = "Hyphen";
          break;
        }
        cursor.index = next;
        return labels;
      case "Hyphen":
        if (alphanumeric) {
          state = "Label";
          break;
        }
        if (char === "-") break;
        if (eager) return 0;
        cursor.index = lastAlphanumeric;
        return labels;
    }
  }
}
/** Original bracket-reference lexer; downstream host validation is separate. @param cursor - Native pointer range. @returns Success, advancing only past a closing bracket. */
export function scanIPv6reference(cursor: UriCursor): boolean {
  if (cursor.index < cursor.end && cursor.text[cursor.index] === "[") {
    let next = cursor.index + 1;
    while (next < cursor.end && /[a-f0-9:.]/i.test(cursor.text.charAt(next))) ++next;
    if (next < cursor.end && cursor.text[next] === "]") {
      cursor.index = next + 1;
      return true;
    }
  }
  return false;
}
