/** @fileoverview Original SAL URI character classes and encode/decode C entry points. */
import {
  rtl_UriCharClass,
  rtl_UriEncodeMechanism as E,
  rtl_UriDecodeMechanism as D,
} from "../inc/rtl/uri.h";
import { RTL_TEXTENCODING_UTF8, type rtl_TextEncoding } from "../inc/rtl/textenc";
import {
  rtl_uString_assign,
  rtl_uString_new,
  rtl_uString_new_WithLength,
  type rtl_uString,
  type rtl_uStringSlot,
} from "../inc/rtl/ustring.h";
import { rtl_uStringBuffer_makeStringAndClear } from "./ustrbuf";
import {
  EscapeType,
  readUcs4,
  writeUnicode,
  writeUcs4,
  writeEscapeOctet,
  writeEscapeChar,
} from "./uri-character";
/** Original fixed ASCII class extent. */
export const UriCharClassSize = 128;
/** Original constexpr class construction, accepting a declared UTF8 literal view. @param chars - Original literal bytes. @returns ASCII membership table. */
export function createUriCharClass(chars: Uint8Array): readonly boolean[] {
  const result = new Array<boolean>(UriCharClassSize).fill(false);
  for (const c of chars) {
    if (result[c]) throw new Error("assert(!a[c])");
    result[c] = true;
  }
  return result;
}
const charClasses = [
  "",
  "!$&'()*+,-./:;=?@[]_~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  "!$&'()*+,-.:;=?@_~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  "!$&'()*+,-.;=@_~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  "!$&'()*+,-.:;=@_~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  "!$&'()*+,-.:;=_~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  "!$&'()*+,-.:=@_~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  "!$&'()*+-./:?@_~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
].map(
  /** Builds an original ASCII URI membership table. @param chars - Allowed ASCII characters. @returns Character membership table. */ (
    chars,
  ) =>
    createUriCharClass(
      Uint8Array.from(
        chars,
        /** Converts a literal character to its code unit without normalization. @param c - Character from the literal. @returns Character code unit. */ (
          c,
        ) => c.charCodeAt(0),
      ),
    ),
);
/** Original immutable ASCII membership table. @param charClass - Original enum. @returns Borrowed table. */
export function rtl_getUriCharClass(charClass: rtl_UriCharClass): readonly boolean[] {
  if (!(charClass >= 0 && charClass < charClasses.length))
    throw new Error("assert(eCharClass in range)");
  return charClasses[charClass] as readonly boolean[];
}
/** Original C URI encoder over real native string data. @param text - Borrowed input. @param charClass - Borrowed ASCII table. @param mechanism - Escape policy. @param charset - Character set. @param result - Native result slot. @returns Nothing. */
export function rtl_uriEncode(
  text: rtl_uString,
  charClass: readonly boolean[],
  mechanism: E,
  charset: rtl_TextEncoding,
  result: rtl_uStringSlot,
): void {
  if (charClass[0x25]) throw new Error("assert(!pCharClass[0x25])");
  const capacity: [number] = [256],
    cursor: [number] = [0],
    type: [EscapeType] = [EscapeType.EscapeNo];
  rtl_uString_new_WithLength(result, capacity[0]);
  while (cursor[0] < text.length) {
    const char = readUcs4(
      text.buffer,
      cursor,
      text.length,
      mechanism === E.rtl_UriEncodeKeepEscapes ||
        mechanism === E.rtl_UriEncodeCheckEscapes ||
        mechanism === E.rtl_UriEncodeStrictKeepEscapes,
      mechanism === E.rtl_UriEncodeStrictKeepEscapes ? RTL_TEXTENCODING_UTF8 : charset,
      type,
    );
    switch (type[0]) {
      case EscapeType.EscapeNo:
      case EscapeType.EscapeChar:
        if (
          (type[0] === EscapeType.EscapeNo || mechanism === E.rtl_UriEncodeCheckEscapes) &&
          char < UriCharClassSize &&
          charClass[char]
        )
          writeUnicode(result, capacity, char);
        else if (
          !writeEscapeChar(
            result,
            capacity,
            char,
            charset,
            mechanism === E.rtl_UriEncodeStrict || mechanism === E.rtl_UriEncodeStrictKeepEscapes,
          )
        ) {
          rtl_uString_new(result);
          return;
        }
        break;
      case EscapeType.EscapeOctet:
        writeEscapeOctet(result, capacity, char);
        break;
    }
  }
  result[0] = rtl_uStringBuffer_makeStringAndClear(result, capacity);
}
/** Original C URI decoder preserving invalid octets except under Strict. @param text - Borrowed input. @param mechanism - Decode policy. @param charset - Original character set. @param result - Native output slot. @returns Nothing. */
export function rtl_uriDecode(
  text: rtl_uString,
  mechanism: D,
  charset: rtl_TextEncoding,
  result: rtl_uStringSlot,
): void {
  if (mechanism === D.rtl_UriDecodeNone) {
    rtl_uString_assign(result, text);
    return;
  }
  if (mechanism === D.rtl_UriDecodeToIuri) charset = RTL_TEXTENCODING_UTF8;
  const capacity: [number] = [text.length],
    cursor: [number] = [0],
    type: [EscapeType] = [EscapeType.EscapeNo];
  rtl_uString_new_WithLength(result, capacity[0]);
  while (cursor[0] < text.length) {
    const char = readUcs4(text.buffer, cursor, text.length, true, charset, type);
    switch (type[0]) {
      case EscapeType.EscapeChar:
        if (char <= 0x7f && mechanism === D.rtl_UriDecodeToIuri) {
          writeEscapeOctet(result, capacity, char);
          break;
        }
        writeUcs4(result, capacity, char);
        break;
      case EscapeType.EscapeNo:
        writeUcs4(result, capacity, char);
        break;
      case EscapeType.EscapeOctet:
        if (mechanism === D.rtl_UriDecodeStrict) {
          rtl_uString_new(result);
          return;
        }
        writeEscapeOctet(result, capacity, char);
        break;
    }
  }
  result[0] = rtl_uStringBuffer_makeStringAndClear(result, capacity);
}
