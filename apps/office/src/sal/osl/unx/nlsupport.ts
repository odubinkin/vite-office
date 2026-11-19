/** @fileoverview Original Linux/Emscripten sal/osl/unx/nlsupport.cxx locale parsing/composition and codeset lookup. */
import type { rtl_Locale } from "../../inc/rtl/locale";
import { rtl_locale_register } from "../../inc/rtl/locale";
import {
  RTL_TEXTENCODING_ASCII_US,
  RTL_TEXTENCODING_DONTKNOW,
  type rtl_TextEncoding,
} from "../../inc/rtl/textenc";
import {
  OUSTRING_TO_OSTRING_CVTFLAGS,
  type rtl_StringSlot,
  type rtl_String,
} from "../../inc/rtl/string.h";
import {
  OSTRING_TO_OUSTRING_CVTFLAGS,
  type rtl_uStringSlot,
  type rtl_uString,
} from "../../inc/rtl/ustring.h";
import { rtl_uString2String, rtl_string_release } from "../../rtl/string";
import { rtl_string2UString, rtl_uString_release } from "../../rtl/ustring";
import { compareIgnoreAsciiCase } from "../../inc/rtl/character";
import { getenv, getLocaleCodeset } from "../../../external/emscripten/locale";
import { osl_getProcessLocale } from "./process_impl";
import { nl_language_list } from "./nlsupport.table";

/** Converts a source locale field through the existing original ASCII converter. @param value - Locale field. @returns Original string reference. */
function ascii(value: rtl_uString): rtl_String {
  const result: rtl_StringSlot = [null];
  rtl_uString2String(
    result,
    value.buffer,
    value.length,
    RTL_TEXTENCODING_ASCII_US,
    OUSTRING_TO_OSTRING_CVTFLAGS,
  );
  return result[0] as rtl_String;
}
/** Original strcpy onto the known64-byte locale buffer. @param target - Output buffer. @param offset - Insertion offset. @param value - Original converted string. @returns Nothing. */
function copy(target: Uint8Array, offset: number, value: rtl_String): void {
  let count = 0;
  while (count < value.length && value.buffer[count] !== 0) count++;
  target.set(value.buffer.subarray(0, count), offset);
  target[offset + count] = 0;
}
/** Composes the original locale buffer without normalizing locale names. @param locale - Optional registered locale. @param buffer - Original64-byte destination. @returns Same buffer or null for invalid language length. */
function compose_locale(locale: rtl_Locale | null, buffer: Uint8Array): Uint8Array | null {
  const n = buffer.length;
  if (locale && locale.Language && (locale.Language.length === 2 || locale.Language.length === 3)) {
    let offset = 0;
    const language = ascii(locale.Language);
    if (language.length < n) {
      copy(buffer, 0, language);
      offset = language.length;
    }
    rtl_string_release(language);
    if (locale.Country && locale.Country.length === 2) {
      const country = ascii(locale.Country);
      if (offset + country.length + 1 < n) {
        buffer[offset++] = 95;
        copy(buffer, offset, country);
        offset += country.length;
      }
      rtl_string_release(country);
    }
    if (locale.Variant && locale.Variant.length && locale.Variant.length < n - 6) {
      const variant = ascii(locale.Variant);
      if (offset + variant.length + 1 < n) copy(buffer, offset, variant);
      rtl_string_release(variant);
    }
    return buffer;
  }
  return null;
}
/** Parses original environment bytes, preserving the source's three-letter language heuristic. @param locale - Native getenv bytes without terminator. @returns Interned source locale. */
function parse_locale(locale: Uint8Array): rtl_Locale {
  const len = locale.length;
  if (
    !len ||
    (len === 1 && locale[0] === 67) ||
    (len === 5 && String.fromCharCode(...locale) === "POSIX")
  )
    return rtl_locale_register(Uint16Array.of(67, 0), null, null);
  let offset = Math.min(len, 2);
  if ((len > 3 && locale[3] === 95) || (len === 3 && locale[2] !== 95)) offset = 3;
  const language: rtl_uStringSlot = [null],
    country: rtl_uStringSlot = [null],
    variant: rtl_uStringSlot = [null];
  rtl_string2UString(
    language,
    locale,
    offset,
    RTL_TEXTENCODING_ASCII_US,
    OSTRING_TO_OUSTRING_CVTFLAGS,
  );
  if (len >= offset + 3 && locale[offset] === 95) {
    rtl_string2UString(
      country,
      locale.subarray(offset + 1),
      2,
      RTL_TEXTENCODING_ASCII_US,
      OSTRING_TO_OUSTRING_CVTFLAGS,
    );
    offset += 3;
  }
  if (len > offset)
    rtl_string2UString(
      variant,
      locale.subarray(offset),
      len - offset,
      RTL_TEXTENCODING_ASCII_US,
      OSTRING_TO_OUSTRING_CVTFLAGS,
    );
  const result = rtl_locale_register(
    (language[0] as rtl_uString).buffer,
    country[0]?.buffer ?? null,
    variant[0]?.buffer ?? null,
  );
  if (variant[0]) rtl_uString_release(variant[0]);
  if (country[0]) rtl_uString_release(country[0]);
  rtl_uString_release(language[0] as rtl_uString);
  return result;
}
/** Original case-insensitive binary search in the platform table. @param key - Native codeset bytes. @returns Original encoding or DONTKNOW. */
function pair_search(key: Uint8Array): rtl_TextEncoding {
  let lower = 0,
    upper = nl_language_list.length;
  while (lower < upper) {
    const current = Math.floor((lower + upper) / 2),
      pair = nl_language_list[current] as readonly [string, number];
    let comparison: number;
    for (let i = 0; ; i++) {
      const a = key[i] ?? 0,
        b = i < pair[0].length ? pair[0].charCodeAt(i) : 0;
      comparison = compareIgnoreAsciiCase(a, b);
      if (comparison !== 0 || a === 0 || b === 0) break;
    }
    if (comparison < 0) upper = current;
    else if (comparison > 0) lower = current + 1;
    else return pair[1];
  }
  return RTL_TEXTENCODING_DONTKNOW;
}
/** Original native codeset selection with source64-byte buffers and table mapping. @param locale - Registered locale or null to use the process locale. @returns Original text encoding. */
export function osl_getTextEncodingFromLocale(locale: rtl_Locale | null): rtl_TextEncoding {
  if (locale === null) {
    const processLocale: [rtl_Locale | null] = [null];
    osl_getProcessLocale(processLocale);
    locale = processLocale[0];
  }
  const buffer = new Uint8Array(64);
  compose_locale(locale, buffer);
  const codeset = getLocaleCodeset(buffer);
  return codeset === null ? RTL_TEXTENCODING_DONTKNOW : pair_search(codeset);
}
/** Original environment priority and C fallback; reads only the actual WASM runtime's environment. @param result - Original output pointer slot. @returns Nothing. */
export function imp_getProcessLocale(result: [rtl_Locale | null]): void {
  let locale = getenv("LC_ALL");
  if (locale === null || locale.length === 0) {
    locale = getenv("LC_CTYPE");
    if (locale === null || locale.length === 0) {
      locale = getenv("LANG");
      if (locale === null || locale.length === 0) locale = Uint8Array.of(67);
    }
  }
  result[0] = parse_locale(locale);
}
