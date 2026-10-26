/** @fileoverview Missing-converter fallback from sal/textenc/textcvt.cxx. */
import * as cvt from "../inc/rtl/textcvt.h";
import type { rtl_TextEncoding } from "../inc/rtl/textenc";
import { getTextToUnicodeData } from "./tables";
import * as utf8 from "./tcvtutf8";
import * as utf7 from "./tcvtutf7";
import * as iscii from "./convertisciidevangari";
import * as jp from "./convertiso2022jp";
import * as kr from "./convertiso2022kr";
import { ImplSymbolToUnicode } from "./tcvtbyte";
import { ImplDBCSToUnicode, ImplEUCJPToUnicode } from "./tcvtmb";
import { convertCharToUnicode } from "./convertsimple.hxx";

/** Preserves the pinned byte-to-U+00xx fallback when SAL has no converter.
 * @param source - Borrowed source bytes.
 * @param sourceBytes - Number of source bytes.
 * @param destination - Borrowed UTF-16 output storage.
 * @param destinationChars - Output capacity.
 * @param flags - Native text-to-Unicode conversion flags.
 * @param info - Mutable conversion status.
 * @param sourceConverted - Mutable consumed-byte count.
 * @returns Number of written UTF-16 units.
 */
export function ImplDummyToUnicode(
  source: Uint8Array | Int8Array,
  sourceBytes: number,
  destination: Uint16Array,
  destinationChars: number,
  flags: number,
  info: [number],
  sourceConverted: [number],
): number {
  if (
    (flags & cvt.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MASK) ===
      cvt.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_ERROR ||
    (flags & cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_MASK) ===
      cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_ERROR
  ) {
    info[0] |=
      cvt.RTL_TEXTTOUNICODE_INFO_ERROR |
      cvt.RTL_TEXTTOUNICODE_INFO_UNDEFINED |
      cvt.RTL_TEXTTOUNICODE_INFO_MBUNDEFINED;
    return 0;
  }

  info[0] = 0;
  let converted = 0;
  let output = 0;
  while (converted < sourceBytes) {
    if (output === destinationChars) {
      info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
      break;
    }
    destination[output++] = (source[converted++] as number) & 0xff;
  }
  sourceConverted[0] = converted;
  return output;
}

/** Preserves the pinned low-byte fallback when SAL has no reverse converter.
 * @param source - Borrowed UTF-16 units.
 * @param sourceChars - Number of input units.
 * @param destination - Borrowed byte output.
 * @param destinationBytes - Output capacity.
 * @param flags - Native Unicode-to-text flags.
 * @param info - Mutable conversion status.
 * @param sourceConverted - Mutable consumed-unit count.
 * @returns Number of written bytes.
 */
export function ImplUnicodeToDummy(
  source: Uint16Array,
  sourceChars: number,
  destination: Uint8Array,
  destinationBytes: number,
  flags: number,
  info: [number],
  sourceConverted: [number],
): number {
  if (
    (flags & cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_MASK) ===
    cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR
  ) {
    info[0] |= cvt.RTL_UNICODETOTEXT_INFO_ERROR | cvt.RTL_UNICODETOTEXT_INFO_UNDEFINED;
    return 0;
  }
  info[0] = 0;
  let converted = 0;
  let output = 0;
  while (converted < sourceChars) {
    if (output === destinationBytes) {
      info[0] |= cvt.RTL_UNICODETOTEXT_INFO_ERROR | cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
      break;
    }
    destination[output++] = (source[converted++] as number) & 0xff;
  }
  sourceConverted[0] = converted;
  return output;
}

/** Source converter descriptor handle; unavailable entries retain the native null value. */
export type rtl_TextToUnicodeConverter = NonNullable<
  ReturnType<typeof getTextToUnicodeData>
> | null;
/** Source opaque context includes the stateless pointer-one sentinel. */
export type rtl_TextToUnicodeContext = unknown;
/** Source static descriptors retain stable converter-handle identity. */
const nativeTextConverters = new Map<number, rtl_TextToUnicodeConverter>();
/** Binds the native descriptor for an encoding. @param encoding - Native encoding. @returns Descriptor or null. */
export function rtl_createTextToUnicodeConverter(
  encoding: rtl_TextEncoding,
): rtl_TextToUnicodeConverter {
  if (!nativeTextConverters.has(encoding))
    nativeTextConverters.set(encoding, getTextToUnicodeData(encoding) ?? null);
  return nativeTextConverters.get(encoding) as rtl_TextToUnicodeConverter;
}
/** Native descriptors are static; destruction performs no mutation. @param converter - Original handle. @returns Nothing. */
export function rtl_destroyTextToUnicodeConverter(converter: rtl_TextToUnicodeConverter): void {
  void converter;
}
/** Creates the source contextual owner or exact pointer-one sentinel. @param converter - Native descriptor. @returns Context. */
export function rtl_createTextToUnicodeContext(
  converter: rtl_TextToUnicodeConverter,
): rtl_TextToUnicodeContext {
  if (converter === null) return null;
  switch (converter.kind) {
    case "utf8":
      return utf8.ImplCreateUtf8ToUnicodeContext();
    case "utf7":
      return utf7.ImplUTF7CreateUTF7TextToUnicodeContext();
    case "iscii":
      return iscii.ImplCreateIsciiDevanagariToUnicodeContext();
    case "iso2022jp":
      return jp.ImplCreateIso2022JpToUnicodeContext();
    case "iso2022kr":
      return kr.ImplCreateIso2022KrToUnicodeContext();
    default:
      return 1;
  }
}
/** Resets exactly the descriptor's contextual fields. @param converter - Native descriptor. @param context - Matching source context. @returns Nothing. */
export function rtl_resetTextToUnicodeContext(
  converter: rtl_TextToUnicodeConverter,
  context: rtl_TextToUnicodeContext,
): void {
  if (converter === null || !context) return;
  switch (converter.kind) {
    case "utf8":
      utf8.ImplResetUtf8ToUnicodeContext(context as utf8.ImplUtf8ToUnicodeContext);
      break;
    case "utf7":
      utf7.ImplUTF7ResetTextToUnicodeContext(context as utf7.ImplUTF7ToUCContextData);
      break;
    case "iscii":
      iscii.ImplResetIsciiDevanagariToUnicodeContext(
        context as iscii.IsciiDevanagariToUnicodeContext,
      );
      break;
    case "iso2022jp":
      jp.ImplResetIso2022JpToUnicodeContext(context as jp.ImplIso2022JpToUnicodeContext);
      break;
    case "iso2022kr":
      kr.ImplResetIso2022KrToUnicodeContext(context as kr.ImplIso2022KrToUnicodeContext);
      break;
  }
}
/** Context storage is released by GC; the pinned destroy functions have no additional observable state. @param converter - Descriptor. @param context - Context. @returns Nothing. */
export function rtl_destroyTextToUnicodeContext(
  converter: rtl_TextToUnicodeConverter,
  context: rtl_TextToUnicodeContext,
): void {
  void converter;
  void context;
}
/** Native descriptor dispatch and null-converter fallback. @param converter - Descriptor. @param context - Matching opaque context. @param source - Source bytes. @param sourceBytes - Byte count. @param destination - Output units. @param destinationChars - Capacity. @param flags - Source flags. @param info - Optional status pointer. @param converted - Optional consumed pointer. @returns Written unit count. */
export function rtl_convertTextToUnicode(
  converter: rtl_TextToUnicodeConverter,
  context: rtl_TextToUnicodeContext,
  source: Uint8Array | Int8Array,
  sourceBytes: number,
  destination: Uint16Array,
  destinationChars: number,
  flags: number,
  info: [number] | null,
  converted: [number] | null,
): number {
  const status = info ?? [0],
    consumed = converted ?? [0];
  if (
    (flags & cvt.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MASK) >
      cvt.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_DEFAULT ||
    (flags & cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_MASK) >
      cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_DEFAULT ||
    (flags & cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_MASK) >
      cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_DEFAULT ||
    (flags &
      ~(
        cvt.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MASK |
        cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_MASK |
        cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_MASK |
        cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH |
        cvt.RTL_TEXTTOUNICODE_FLAGS_GLOBAL_SIGNATURE
      )) !==
      0
  )
    throw new Error("Invalid native text-to-Unicode conversion flags.");
  if (converter === null)
    return ImplDummyToUnicode(
      source,
      sourceBytes,
      destination,
      destinationChars,
      flags,
      status,
      consumed,
    );
  switch (converter.kind) {
    case "utf8":
      return utf8.ImplConvertUtf8ToUnicode(
        null,
        context as utf8.ImplUtf8ToUnicodeContext | null,
        source,
        sourceBytes,
        destination,
        destinationChars,
        flags,
        status,
        consumed,
      );
    case "utf7":
      return utf7.ImplUTF7ToUnicode(
        null,
        context as utf7.ImplUTF7ToUCContextData | null,
        source,
        sourceBytes,
        destination,
        destinationChars,
        flags,
        status,
        consumed,
      );
    case "iscii":
      return iscii.ImplConvertIsciiDevanagariToUnicode(
        null,
        context as iscii.IsciiDevanagariToUnicodeContext,
        source,
        sourceBytes,
        destination,
        destinationChars,
        flags,
        status,
        consumed,
      );
    case "iso2022jp":
      return jp.ImplConvertIso2022JpToUnicode(
        null,
        context as jp.ImplIso2022JpToUnicodeContext | null,
        source,
        sourceBytes,
        destination,
        destinationChars,
        flags,
        status,
        consumed,
      );
    case "iso2022kr":
      return kr.ImplConvertIso2022KrToUnicode(
        null,
        context as kr.ImplIso2022KrToUnicodeContext | null,
        source,
        sourceBytes,
        destination,
        destinationChars,
        flags,
        status,
        consumed,
      );
    case "symbol":
      return ImplSymbolToUnicode(
        null,
        context,
        source,
        sourceBytes,
        destination,
        destinationChars,
        flags,
        status,
        consumed,
      );
    case "eucjp":
      return ImplEUCJPToUnicode(
        converter.data,
        context,
        source,
        sourceBytes,
        destination,
        destinationChars,
        flags,
        status,
        consumed,
      );
    case "dbcs":
      return ImplDBCSToUnicode(
        converter.data,
        context,
        source,
        sourceBytes,
        destination,
        destinationChars,
        flags,
        status,
        consumed,
      );
    case "single-byte":
      return convertCharToUnicode(
        converter.data,
        context,
        source,
        sourceBytes,
        destination,
        destinationChars,
        flags,
        status,
        consumed,
      );
  }
}
