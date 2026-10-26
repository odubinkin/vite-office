/** @fileoverview Missing-converter fallback from sal/textenc/textcvt.cxx. */
import * as cvt from "../inc/rtl/textcvt.h";

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
