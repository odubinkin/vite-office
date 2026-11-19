/** @fileoverview Character and percent-escape responsibilities of sal/rtl/uri.cxx. */
import {
  combineSurrogates,
  isHighSurrogate,
  isLowSurrogate,
  isUnicodeScalarValue,
  isUnicodeCodePoint,
  splitSurrogates,
} from "../inc/rtl/character";
import { RTL_TEXTENCODING_UTF8, type rtl_TextEncoding } from "../inc/rtl/textenc";
import * as cvt from "../textenc/textcvt";
import * as flags from "../inc/rtl/textcvt.h";
import type { rtl_String, rtl_StringSlot } from "../inc/rtl/string.h";
import { rtl_string_new_WithLength, rtl_string_release } from "./string";
import { rtl_stringbuffer_insert } from "./strbuf";
import type { rtl_uString, rtl_uStringSlot } from "../inc/rtl/ustring.h";
import { rtl_uStringbuffer_insert, rtl_uStringbuffer_insertUtf32 } from "./ustrbuf";
/** Original escape classification. */
export enum EscapeType {
  EscapeNo,
  EscapeChar,
  EscapeOctet,
}
/** Original ASCII hexadecimal weight. @param value - Unicode code point. @returns Weight or -1. */
function getHexWeight(value: number): number {
  return value >= 0x30 && value <= 0x39
    ? value - 0x30
    : value >= 0x41 && value <= 0x46
      ? value - 0x41 + 10
      : value >= 0x61 && value <= 0x66
        ? value - 0x61 + 10
        : -1;
}
/** Reads original escaped or raw UTF16 input; cursor is the lowered const-pointer reference. @param input - Borrowed units. @param cursor - In/out pointer offset. @param end - Pointer end. @param encoded - Recognize percent escapes. @param charset - Original character set. @param type - Out escape classification. @returns Original UCS4 value. */
export function readUcs4(
  input: Uint16Array,
  cursor: [number],
  end: number,
  encoded: boolean,
  charset: rtl_TextEncoding,
  type: [EscapeType],
): number {
  let char = input[cursor[0]++] as number;
  let w1: number, w2: number;
  if (
    char === 0x25 &&
    encoded &&
    end - cursor[0] >= 2 &&
    (w1 = getHexWeight(input[cursor[0]] as number)) >= 0 &&
    (w2 = getHexWeight(input[cursor[0] + 1] as number)) >= 0
  ) {
    cursor[0] += 2;
    char = (w1 << 4) | w2;
    if (char <= 0x7f) type[0] = EscapeType.EscapeChar;
    else if (charset === RTL_TEXTENCODING_UTF8) {
      if (char >= 0xc0 && char <= 0xf4) {
        let decoded: number, shift: number, minimum: number;
        if (char <= 0xdf) {
          decoded = (char & 0x1f) << 6;
          shift = 0;
          minimum = 0x80;
        } else if (char <= 0xef) {
          decoded = (char & 0x0f) << 12;
          shift = 6;
          minimum = 0x800;
        } else {
          decoded = (char & 7) << 18;
          shift = 12;
          minimum = 0x10000;
        }
        let p = cursor[0],
          utf8 = true;
        for (; shift >= 0; shift -= 6) {
          if (
            end - p < 3 ||
            input[p] !== 0x25 ||
            (w1 = getHexWeight(input[p + 1] as number)) < 8 ||
            w1 > 11 ||
            (w2 = getHexWeight(input[p + 2] as number)) < 0
          ) {
            utf8 = false;
            break;
          }
          p += 3;
          decoded |= (((w1 & 3) << 4) | w2) << shift;
        }
        if (utf8 && isUnicodeScalarValue(decoded) && decoded >= minimum) {
          cursor[0] = p;
          type[0] = EscapeType.EscapeChar;
          return decoded;
        }
      }
      type[0] = EscapeType.EscapeOctet;
    } else {
      // Inline the consumed OStringBuffer(16), append(char), getStr/getLength
      // header wrappers over their actual byte allocation and C buffer owner.
      const bytes: rtl_StringSlot = [null],
        capacity: [number] = [16];
      rtl_string_new_WithLength(bytes, 16);
      const append =
        /** Appends an octet to the temporary decoding buffer. @param byte - Octet to append. @returns Nothing. */ (
          byte: number,
        ): void =>
          rtl_stringbuffer_insert(
            bytes,
            capacity,
            (bytes[0] as rtl_String).length,
            Uint8Array.of(byte),
            1,
          );
      append(char);
      const converter = cvt.rtl_createTextToUnicodeConverter(charset);
      let p = cursor[0];
      try {
        for (;;) {
          const destination = new Uint16Array(2),
            info: [number] = [0],
            converted: [number] = [0];
          const data = bytes[0] as rtl_String;
          const count = cvt.rtl_convertTextToUnicode(
            converter,
            null,
            data.buffer,
            data.length,
            destination,
            2,
            flags.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_ERROR |
              flags.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_ERROR |
              flags.RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR,
            info,
            converted,
          );
          if (info[0] === 0) {
            if (converted[0] !== data.length)
              throw new Error("assert(nConverted == aBuf.getLength())");
            cursor[0] = p;
            type[0] = EscapeType.EscapeChar;
            if (!(
              count === 1 ||
              (count === 2 &&
                isHighSurrogate(destination[0] as number) &&
                isLowSurrogate(destination[1] as number))
            ))
              throw new Error("assert(nDstSize == 1 || surrogate pair)");
            return count === 1
              ? (destination[0] as number)
              : combineSurrogates(destination[0] as number, destination[1] as number);
          }
          if (
            info[0] === flags.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL &&
            end - p >= 3 &&
            input[p] === 0x25 &&
            (w1 = getHexWeight(input[p + 1] as number)) >= 0 &&
            (w2 = getHexWeight(input[p + 2] as number)) >= 0
          ) {
            p += 3;
            append((w1 << 4) | w2);
          } else if (
            info[0] === flags.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL &&
            p !== end &&
            (input[p] as number) <= 0x7f
          )
            append(input[p++] as number);
          else {
            if (info[0] & flags.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL)
              throw new Error("assert(!(nInfo & DESTBUFFERTOOSMALL))");
            break;
          }
        }
      } finally {
        cvt.rtl_destroyTextToUnicodeConverter(converter);
        rtl_string_release(bytes[0] as rtl_String);
      }
      type[0] = EscapeType.EscapeOctet;
    }
    return char;
  }
  type[0] = EscapeType.EscapeNo;
  return isHighSurrogate(char) && cursor[0] < end && isLowSurrogate(input[cursor[0]] as number)
    ? combineSurrogates(char, input[cursor[0]++] as number)
    : char;
}
/** Appends one original UTF16 unit. @param buffer - Native slot. @param capacity - In/out capacity. @param char - Unit. @returns Nothing. */
export function writeUnicode(buffer: rtl_uStringSlot, capacity: [number], char: number): void {
  rtl_uStringbuffer_insert(
    buffer,
    capacity,
    (buffer[0] as rtl_uString).length,
    Uint16Array.of(char),
    1,
  );
}
/** Appends one original UCS4 value. @param buffer - Native slot. @param capacity - In/out capacity. @param char - Value. @returns Nothing. */
export function writeUcs4(buffer: rtl_uStringSlot, capacity: [number], char: number): void {
  rtl_uStringbuffer_insertUtf32(buffer, capacity, (buffer[0] as rtl_uString).length, char);
}
/** Appends uppercase percent-escaped octet. @param buffer - Native slot. @param capacity - In/out capacity. @param octet - Byte. @returns Nothing. */
export function writeEscapeOctet(buffer: rtl_uStringSlot, capacity: [number], octet: number): void {
  if (octet > 0xff) throw new Error("assert(nOctet <= 0xFF)");
  const hex = "0123456789ABCDEF";
  writeUnicode(buffer, capacity, 0x25);
  writeUnicode(buffer, capacity, hex.charCodeAt(octet >> 4));
  writeUnicode(buffer, capacity, hex.charCodeAt(octet & 15));
}
/** Encodes using the original UTF8 fast path or real SAL converter. @param buffer - Native slot. @param capacity - In/out capacity. @param char - Code point, including upstream non-scalar behavior. @param charset - Character set. @param strict - Reject conversion errors. @returns Original conversion success. */
export function writeEscapeChar(
  buffer: rtl_uStringSlot,
  capacity: [number],
  char: number,
  charset: rtl_TextEncoding,
  strict: boolean,
): boolean {
  if (!isUnicodeCodePoint(char)) throw new Error("assert(rtl::isUnicodeCodePoint(nUtf32))");
  const escape =
    /** Appends one percent-escaped octet to the output buffer. @param byte - Octet to append. @returns Nothing. */ (
      byte: number,
    ): void => writeEscapeOctet(buffer, capacity, byte);
  if (charset === RTL_TEXTENCODING_UTF8) {
    if (char < 0x80) escape(char);
    else if (char < 0x800) {
      escape((char >> 6) | 0xc0);
      escape((char & 0x3f) | 0x80);
    } else if (char < 0x10000) {
      escape((char >> 12) | 0xe0);
      escape(((char >> 6) & 0x3f) | 0x80);
      escape((char & 0x3f) | 0x80);
    } else {
      escape((char >> 18) | 0xf0);
      escape(((char >> 12) & 0x3f) | 0x80);
      escape(((char >> 6) & 0x3f) | 0x80);
      escape((char & 0x3f) | 0x80);
    }
  } else {
    const converter = cvt.rtl_createUnicodeToTextConverter(charset),
      source = new Uint16Array(2);
    const sourceSize = splitSurrogates(char, source),
      destination = new Uint8Array(32),
      info: [number] = [0],
      converted: [number] = [0];
    let count: number;
    try {
      count = cvt.rtl_convertUnicodeToText(
        converter,
        null,
        source,
        sourceSize,
        destination,
        32,
        flags.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR |
          flags.RTL_UNICODETOTEXT_FLAGS_INVALID_ERROR |
          flags.RTL_UNICODETOTEXT_FLAGS_FLUSH,
        info,
        converted,
      );
    } finally {
      cvt.rtl_destroyUnicodeToTextConverter(converter);
    }
    if (info[0] & flags.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL)
      throw new Error("assert(!(nInfo & DESTBUFFERTOSMALL))");
    if (info[0] === 0) {
      if (converted[0] !== sourceSize) throw new Error("assert(nConverted == nSrcSize)");
      for (let i = 0; i < count; ++i) escape(destination[i] as number);
    } else {
      if (strict) return false;
      writeUcs4(buffer, capacity, char);
    }
  }
  return true;
}
