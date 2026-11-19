/** @fileoverview Original sal/osl/unx/file_url.cxx charset singleton converters, byte-preserving UTF8 decoding and pathname-to-URL encoding. */
import { OUStringBuffer } from "../../inc/rtl/ustrbuf";
import { OStringBuffer } from "../../inc/rtl/strbuf";
import type { OString } from "../../inc/rtl/string";
import type { OUString } from "../../inc/rtl/ustring";
import { Uri, createUriCharClass } from "../../inc/rtl/uri";
import { rtl_UriEncodeMechanism } from "../../inc/rtl/uri.h";
import { RTL_TEXTENCODING_UTF8 } from "../../inc/rtl/textenc";
import { OUSTRING_TO_OSTRING_CVTFLAGS } from "../../inc/rtl/string.h";
import { OSTRING_TO_OUSTRING_CVTFLAGS } from "../../inc/rtl/ustring.h";
import { rtl_string_assign } from "../../rtl/string";
import { EscapeType, readUcs4 } from "../../inc/uri_internal.hxx";
import { isSurrogate } from "../../inc/rtl/character";
import { osl_getThreadTextEncoding } from "../../inc/osl/thread";
import { oslFileError } from "../../inc/osl/file";
import { pathMax, setOverflowErrno } from "../../../external/emscripten/file";
import * as cvt from "../../textenc/textcvt";
import * as flags from "../../inc/rtl/textcvt.h";
const unicodeToText: { converter?: cvt.rtl_UnicodeToTextConverter } = {};
const textToUnicode: { converter?: cvt.rtl_TextToUnicodeConverter } = {};
const uriCharacters =
  "!$&'()*+,-./0123456789:=@ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz~";
/** Original file URI character class leaves literal slash unescaped. */
export const uriCharClass = createUriCharClass(
  Uint8Array.from(
    uriCharacters,
    /** Reads original ASCII byte. @param value - One ASCII character. @returns Code. */ (value) =>
      value.charCodeAt(0),
  ),
);
/** Original UnicodeToTextConverter_Impl singleton captures the first caller's thread encoding. @param source - Input units. @param count - Source count. @param target - Destination bytes. @param capacity - Destination count. @param options - Original conversion flags. @param info - Original output bits. @param converted - Consumed units. @returns Written bytes. */
function convertUnicode(
  source: Uint16Array,
  count: number,
  target: Uint8Array,
  capacity: number,
  options: number,
  info: [number],
  converted: [number],
): number {
  if (!("converter" in unicodeToText))
    unicodeToText.converter = cvt.rtl_createUnicodeToTextConverter(osl_getThreadTextEncoding());
  return cvt.rtl_convertUnicodeToText(
    unicodeToText.converter as cvt.rtl_UnicodeToTextConverter,
    null,
    source,
    count,
    target,
    capacity,
    options,
    info,
    converted,
  );
}
/** Original TextToUnicodeConverter_Impl independently captures its first caller's thread encoding. @param source - Input bytes. @param count - Source count. @param target - Destination units. @param capacity - Destination count. @param options - Conversion flags. @param info - Original output bits. @param converted - Consumed bytes. @returns Written units. */
function convertText(
  source: Uint8Array,
  count: number,
  target: Uint16Array,
  capacity: number,
  options: number,
  info: [number],
  converted: [number],
): number {
  if (!("converter" in textToUnicode))
    textToUnicode.converter = cvt.rtl_createTextToUnicodeConverter(osl_getThreadTextEncoding());
  return cvt.rtl_convertTextToUnicode(
    textToUnicode.converter as cvt.rtl_TextToUnicodeConverter,
    null,
    source,
    count,
    target,
    capacity,
    options,
    info,
    converted,
  );
}
/** Original byte append loop with strict source conversion flags and chunk capacity rules. @param input - Borrowed Unicode buffer. @param output - Original byte buffer. @returns Source success flag. */
function convert(input: OUStringBuffer, output: OStringBuffer): boolean {
  for (let remaining = input.getLength(); ;) {
    const oldLength = output.getLength();
    let count = Math.min(Math.max(remaining, pathMax()), 0x7fffffff - oldLength);
    const target = output.appendUninitialized(count),
      info: [number] = [0],
      converted: [number] = [0];
    count = convertUnicode(
      input.getStr().subarray(input.getLength() - remaining),
      remaining,
      target,
      count,
      flags.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR |
        flags.RTL_UNICODETOTEXT_FLAGS_INVALID_ERROR |
        flags.RTL_UNICODETOTEXT_FLAGS_FLUSH,
      info,
      converted,
    );
    if (info[0] & flags.RTL_UNICODETOTEXT_INFO_ERROR) return false;
    output.setLength(oldLength + count);
    remaining -= converted[0];
    if (!(info[0] & flags.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL)) break;
  }
  return true;
}
/** Original UTF8 URL decoder preserves escaped non-UTF8 octets and only assigns output after complete success. @param text - Borrowed logical URI units. @param result - Original output OString. @returns Source success flag. */
export function decodeFromUtf8(text: Uint16Array, result: OString): boolean {
  const unicode = new OUStringBuffer(text.length),
    bytes = new OStringBuffer(pathMax()),
    cursor: [number] = [0],
    type: [EscapeType] = [EscapeType.EscapeNo];
  try {
    while (cursor[0] < text.length) {
      const code = readUcs4(text, cursor, text.length, true, RTL_TEXTENCODING_UTF8, type);
      switch (type[0]) {
        case EscapeType.EscapeNo:
        case EscapeType.EscapeChar:
          // Grouping lowers the original C++ fallthrough under noFallthroughCasesInSwitch.
          if (type[0] === EscapeType.EscapeNo && code === 37) return false;
          if (isSurrogate(code)) return false;
          unicode.appendUtf32(code);
          break;
        case EscapeType.EscapeOctet:
          if (!convert(unicode, bytes)) return false;
          unicode.setLength(0);
          bytes.appendChar(code);
          break;
      }
    }
    if (!convert(unicode, bytes)) return false;
    const value = bytes.makeStringAndClear();
    try {
      rtl_string_assign(result.getDataAddress(), value.pData);
    } finally {
      value.dispose();
    }
    return true;
  } finally {
    bytes.dispose();
    unicode.dispose();
  }
}
/** Original best-effort Unicode wrapper with native errno on destination overflow. @param target - Destination bytes including caller-provided terminator capacity. @param capacity - Converted-byte bound. @param source - Source units. @param count - Source count. @returns Written bytes or zero on overflow. */
export function UnicodeToText(
  target: Uint8Array,
  capacity: number,
  source: Uint16Array,
  count: number,
): number {
  const info: [number] = [0],
    converted: [number] = [0];
  const written = convertUnicode(
    source,
    count,
    target,
    capacity,
    OUSTRING_TO_OSTRING_CVTFLAGS | flags.RTL_UNICODETOTEXT_FLAGS_FLUSH,
    info,
    converted,
  );
  if (info[0] & flags.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL) {
    setOverflowErrno();
    return 0;
  }
  target[written] = 0;
  return written;
}
/** Original best-effort byte wrapper with native errno on destination overflow. @param source - Source bytes. @param count - Source count. @param target - Destination units including terminator capacity. @param capacity - Converted-unit bound. @returns Written units or zero on overflow. */
export function TextToUnicode(
  source: Uint8Array,
  count: number,
  target: Uint16Array,
  capacity: number,
): number {
  const info: [number] = [0],
    converted: [number] = [0];
  const written = convertText(
    source,
    count,
    target,
    capacity,
    OSTRING_TO_OUSTRING_CVTFLAGS | flags.RTL_TEXTTOUNICODE_FLAGS_FLUSH,
    info,
    converted,
  );
  if (info[0] & flags.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL) {
    setOverflowErrno();
    return 0;
  }
  target[written] = 0;
  return written;
}
/** Original pathname encoder preserves invalid native bytes as uppercase percent escapes. @param pathname - Original byte pathname. @param url - Output native Unicode string. @returns Original success status. */
export function convertPathnameToUrl(pathname: OString, url: OUString): oslFileError {
  const output = new OUStringBuffer((10 + pathname.getLength()) | 0);
  try {
    output.append(Uint16Array.of(102, 105, 108, 101, 58));
    if (pathname.getStr()[0] === 47) output.append(Uint16Array.of(47, 47));
    for (let remaining = pathname.getLength(); ;) {
      let count = Math.max(remaining, pathMax());
      const unicode = new OUStringBuffer(count | 0),
        info: [number] = [0],
        converted: [number] = [0];
      try {
        const target = unicode.appendUninitialized(count);
        count = convertText(
          pathname.getStr().subarray(pathname.getLength() - remaining),
          remaining,
          target,
          count,
          flags.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_ERROR |
            flags.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_ERROR |
            flags.RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR |
            flags.RTL_TEXTTOUNICODE_FLAGS_FLUSH,
          info,
          converted,
        );
        unicode.setLength(count);
        const value = unicode.makeStringAndClear();
        try {
          const encoded = Uri.encode(
            value,
            uriCharClass,
            rtl_UriEncodeMechanism.rtl_UriEncodeIgnoreEscapes,
            RTL_TEXTENCODING_UTF8,
          );
          try {
            output.append(encoded);
          } finally {
            encoded.dispose();
          }
        } finally {
          value.dispose();
        }
      } finally {
        unicode.dispose();
      }
      remaining -= converted[0];
      if (info[0] & flags.RTL_TEXTTOUNICODE_INFO_ERROR) {
        const code = pathname.getStr()[pathname.getLength() - remaining] as number;
        const hex = "0123456789ABCDEF";
        output.append(Uint16Array.of(37, hex.charCodeAt(code >> 4), hex.charCodeAt(code & 15)));
        --remaining;
        continue;
      }
      if (!(info[0] & flags.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL)) break;
    }
    const value = output.makeStringAndClear();
    try {
      url.assign(value);
    } finally {
      value.dispose();
    }
    return oslFileError.None;
  } finally {
    output.dispose();
  }
}
