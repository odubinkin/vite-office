/** @fileoverview UTF-8 to Unicode conversion from sal/textenc/tcvtutf8.cxx. */
import * as cvt from "../inc/rtl/textcvt.h";
import { BadInputConversionAction, handleBadInputTextToUnicodeConversion } from "./converter";

/** Original streaming converter context. */
export interface ImplUtf8ToUnicodeContext {
  nUtf32: number;
  nBytes: number;
  nShift: number;
  bCheckBom: boolean;
}

/** Creates the native initial context state. @returns Mutable decoder context. */
export function ImplCreateUtf8ToUnicodeContext(): ImplUtf8ToUnicodeContext {
  return { nUtf32: 0, nBytes: 1, nShift: -1, bCheckBom: true };
}

/** Resets the native byte-count, shift, and BOM state. @param context - Mutable decoder context. @returns Nothing. */
export function ImplResetUtf8ToUnicodeContext(context: ImplUtf8ToUnicodeContext): void {
  context.nBytes = 1;
  context.nShift = -1;
  context.bCheckBom = true;
}

/** Converts UTF-8 using the pinned SAL malformed-sequence and signature rules.
 * @param data - Null for UTF-8, non-null for the Java UTF-8 variant.
 * @param context - Optional persistent decoder state.
 * @param source - Borrowed encoded bytes.
 * @param sourceBytes - Number of source bytes.
 * @param destination - Borrowed UTF-16 output storage.
 * @param destinationChars - Output capacity.
 * @param flags - Native conversion flags.
 * @param info - Mutable native status bits.
 * @param sourceConverted - Mutable consumed-byte count.
 * @returns Number of written UTF-16 units.
 */
export function ImplConvertUtf8ToUnicode(
  data: unknown,
  context: ImplUtf8ToUnicodeContext | null,
  source: Uint8Array | Int8Array,
  sourceBytes: number,
  destination: Uint16Array,
  destinationChars: number,
  flags: number,
  info: [number],
  sourceConverted: [number],
): number {
  const javaUtf8 = data !== null;
  let utf32 = context?.nUtf32 ?? 0;
  let bytes = context?.nBytes ?? 1;
  let shift = context?.nShift ?? -1;
  let checkBom = context?.bCheckBom ?? true;
  let sourceOffset = 0;
  const destinationOffset: [number] = [0];
  let currentStart = 0;
  info[0] = 0;

  while (sourceOffset < sourceBytes) {
    const character = (source[sourceOffset++] as number) & 0xff;
    let consume = true;
    let transform = false;
    let badInput = false;
    if (shift < 0) {
      if (character <= 0x7f) {
        utf32 = character;
        bytes = 1;
        transform = true;
      } else if (character <= 0xbf) badInput = true;
      else if (character <= 0xdf) {
        utf32 = (character & 0x1f) << 6;
        bytes = 2;
        shift = 0;
      } else if (character <= 0xef) {
        utf32 = (character & 0x0f) << 12;
        bytes = 3;
        shift = 6;
      } else if (character <= 0xf7) {
        utf32 = (character & 0x07) << 18;
        bytes = 4;
        shift = 12;
      } else if (character <= 0xfb) {
        utf32 = (character & 0x03) << 24;
        bytes = 5;
        shift = 18;
      } else if (character <= 0xfd) {
        utf32 = (character & 0x01) << 30;
        bytes = 6;
        shift = 24;
      } else badInput = true;
    } else if ((character & 0xc0) === 0x80) {
      utf32 |= (character & 0x3f) << shift;
      if (shift === 0) transform = true;
      else shift -= 6;
    } else {
      consume = character >= 0xfe;
      badInput = true;
    }

    if (transform) {
      if (
        checkBom &&
        utf32 === 0xfeff &&
        bytes === 3 &&
        (flags & cvt.RTL_TEXTTOUNICODE_FLAGS_GLOBAL_SIGNATURE) !== 0 &&
        !javaUtf8
      ) {
        shift = -1;
        checkBom = false;
        currentStart = sourceOffset;
        continue;
      }
      switch (bytes) {
        case 1:
          badInput = javaUtf8 && utf32 === 0;
          break;
        case 2:
          badInput = utf32 < 0x80 && !(javaUtf8 && utf32 === 0);
          break;
        case 3:
          badInput = utf32 < 0x800 || (!javaUtf8 && utf32 >= 0xd800 && utf32 <= 0xdfff);
          break;
        case 4:
          badInput = utf32 < 0x10000 || utf32 > 0x10ffff || javaUtf8;
          break;
        default:
          badInput = true;
      }
      if (!badInput) {
        const needed = utf32 <= 0xffff ? 1 : 2;
        if (destinationChars - destinationOffset[0] < needed) {
          sourceOffset--;
          info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
          break;
        }
        if (needed === 1) destination[destinationOffset[0]++] = utf32;
        else {
          const scalar = utf32 - 0x10000;
          destination[destinationOffset[0]++] = 0xd800 | (scalar >> 10);
          destination[destinationOffset[0]++] = 0xdc00 | (scalar & 0x3ff);
        }
        shift = -1;
        checkBom = false;
        currentStart = sourceOffset;
        continue;
      }
    }
    if (!badInput) continue;

    const action = handleBadInputTextToUnicodeConversion(
      false,
      bytes !== 1,
      0,
      flags,
      destination,
      destinationOffset,
      destinationChars,
      info,
    );
    if (action === BadInputConversionAction.STOP) {
      shift = -1;
      checkBom = false;
      if ((flags & cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH) !== 0) sourceOffset = currentStart;
      else if (!consume) sourceOffset--;
      break;
    }
    if (action === BadInputConversionAction.NO_OUTPUT) {
      sourceOffset--;
      info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
      break;
    }
    shift = -1;
    checkBom = false;
    if (!consume) sourceOffset--;
    currentStart = sourceOffset;
  }

  if (
    shift >= 0 &&
    (info[0] &
      (cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL)) ===
      0
  ) {
    if ((flags & cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH) === 0)
      info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL;
    else {
      const action = handleBadInputTextToUnicodeConversion(
        false,
        true,
        0,
        flags,
        destination,
        destinationOffset,
        destinationChars,
        info,
      );
      if (action === BadInputConversionAction.STOP) sourceOffset = currentStart;
      if (action === BadInputConversionAction.NO_OUTPUT)
        info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
      else {
        shift = -1;
        checkBom = false;
      }
    }
  }
  if (context !== null) {
    context.nUtf32 = utf32;
    context.nBytes = bytes;
    context.nShift = shift;
    context.bCheckBom = checkBom;
  }
  sourceConverted[0] = sourceOffset;
  return destinationOffset[0];
}
