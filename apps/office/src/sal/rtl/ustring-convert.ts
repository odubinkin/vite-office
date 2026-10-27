/** @fileoverview UTF-16/byte conversion for the text encodings whose original SAL converters are present. */
import { RTL_TEXTENCODING_UNICODE, type rtl_TextEncoding } from "../inc/rtl/textenc";
import { OSTRING_TO_OUSTRING_CVTFLAGS, type rtl_uStringSlot } from "../inc/rtl/ustring.h";
import { rtl_string2UString, rtl_uString_release } from "./ustring";

/** Performs the original OSTRING_TO_OUSTRING_CVTFLAGS conversion for available source descriptors, including the source missing-converter fallback. @param input - Source bytes. @param encoding - Native ID. @returns Decoded text. */
export function OStringToOUString(input: Uint8Array, encoding: rtl_TextEncoding): string {
  if (encoding === RTL_TEXTENCODING_UNICODE)
    return new TextDecoder("utf-16le", { ignoreBOM: true }).decode(input);
  const target: rtl_uStringSlot = [null];
  rtl_string2UString(target, input, input.length, encoding, OSTRING_TO_OUSTRING_CVTFLAGS);
  const data = target[0] as NonNullable<rtl_uStringSlot[0]>;
  let value = "";
  for (let i = 0; i < data.length; i += 1024)
    value += String.fromCharCode(...data.buffer.subarray(i, Math.min(i + 1024, data.length)));
  rtl_uString_release(data);
  return value;
}

/** Performs the original OUSTRING_TO_OSTRING_CVTFLAGS conversion for available source descriptors, including the source missing-converter fallback. @param value - UTF-16 text. @param encoding - Native ID. @returns Encoded bytes. */
export function OUStringToOString(value: string, encoding: rtl_TextEncoding): Uint8Array {
  if (encoding === RTL_TEXTENCODING_UNICODE) {
    const result = new Uint8Array(value.length * 2);
    for (let i = 0; i < value.length; i++) {
      const code = value.charCodeAt(i);
      result[i * 2] = code & 0xff;
      result[i * 2 + 1] = code >> 8;
    }
    return result;
  }
  const source = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) source[i] = value.charCodeAt(i);
  const target: rtl_StringSlot = [null];
  rtl_uString2String(target, source, source.length, encoding, OUSTRING_TO_OSTRING_CVTFLAGS);
  const data = target[0] as NonNullable<rtl_StringSlot[0]>;
  const result = data.buffer.slice(0, data.length);
  rtl_string_release(data);
  return result;
}

import type { rtl_StringSlot } from "../inc/rtl/string.h";
import { OUSTRING_TO_OSTRING_CVTFLAGS } from "../inc/rtl/string.h";
import { rtl_uString2String, rtl_string_release } from "./string";
