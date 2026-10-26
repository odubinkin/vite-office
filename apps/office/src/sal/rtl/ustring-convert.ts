/** @fileoverview UTF-16/byte conversion for the text encodings whose original SAL converters are present. */
import {
  RTL_TEXTENCODING_UNICODE,
  RTL_TEXTENCODING_UTF8,
  type rtl_TextEncoding,
} from "../inc/rtl/textenc";
import * as flags from "../inc/rtl/textcvt.h";
import { convertCharToUnicode, convertUnicodeToChar } from "../textenc/convertsimple.hxx";
import { Impl_getByteConvertData } from "../textenc/tables";
import { ImplDummyToUnicode, ImplUnicodeToDummy } from "../textenc/textcvt";

/** Performs the original OSTRING_TO_OUSTRING_CVTFLAGS conversion for available source descriptors, including the source missing-converter fallback. @param input - Source bytes. @param encoding - Native ID. @returns Decoded text. */
export function OStringToOUString(input: Uint8Array, encoding: rtl_TextEncoding): string {
  if (encoding === RTL_TEXTENCODING_UTF8)
    return new TextDecoder("utf-8", { ignoreBOM: true }).decode(input);
  if (encoding === RTL_TEXTENCODING_UNICODE)
    return new TextDecoder("utf-16le", { ignoreBOM: true }).decode(input);
  const descriptor = Impl_getByteConvertData(encoding);
  if (!descriptor) return ImplDummyToUnicode(input);
  const destination = new Uint16Array(input.length);
  const written = convertCharToUnicode(
    descriptor,
    null,
    input,
    input.length,
    destination,
    destination.length,
    flags.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MAPTOPRIVATE |
      flags.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_DEFAULT |
      flags.RTL_TEXTTOUNICODE_FLAGS_INVALID_DEFAULT,
    [0],
    [0],
  );
  let value = "";
  for (let i = 0; i < written; i += 1024)
    value += String.fromCharCode(...destination.subarray(i, i + 1024));
  return value;
}

/** Performs the original OUSTRING_TO_OSTRING_CVTFLAGS conversion for available source descriptors, including the source missing-converter fallback. @param value - UTF-16 text. @param encoding - Native ID. @returns Encoded bytes. */
export function OUStringToOString(value: string, encoding: rtl_TextEncoding): Uint8Array {
  if (encoding === RTL_TEXTENCODING_UTF8) return new TextEncoder().encode(value);
  if (encoding === RTL_TEXTENCODING_UNICODE) {
    const result = new Uint8Array(value.length * 2);
    for (let i = 0; i < value.length; i++) {
      const code = value.charCodeAt(i);
      result[i * 2] = code & 0xff;
      result[i * 2 + 1] = code >> 8;
    }
    return result;
  }
  const descriptor = Impl_getByteConvertData(encoding);
  if (!descriptor) return ImplUnicodeToDummy(value);
  const source = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) source[i] = value.charCodeAt(i);
  const destination = new Uint8Array(value.length * 8);
  const written = convertUnicodeToChar(
    descriptor,
    null,
    source,
    source.length,
    destination,
    destination.length,
    flags.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_DEFAULT |
      flags.RTL_UNICODETOTEXT_FLAGS_INVALID_DEFAULT |
      flags.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_REPLACE |
      flags.RTL_UNICODETOTEXT_FLAGS_PRIVATE_MAPTO0 |
      flags.RTL_UNICODETOTEXT_FLAGS_FLUSH,
    [0],
    [0],
  );
  return destination.slice(0, written);
}
