/** @fileoverview Bidirectional UTF-8 conversion from sal/textenc/tcvtutf8.cxx. */
import { isHighSurrogate, isLowSurrogate, combineSurrogates } from "../inc/rtl/character";
import * as cvt from "../inc/rtl/textcvt.h";
import {
  BadInputConversionAction,
  handleBadInputTextToUnicodeConversion,
  handleBadInputUnicodeToTextConversion,
} from "./converter";

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

/** Original Unicode-to-UTF-8 streaming state; 0xffff means signature not handled. */
export interface ImplUnicodeToUtf8Context {
  nHighSurrogate: number;
}
/** Creates the native encoder state. @returns Mutable encoder context. */
export function ImplCreateUnicodeToUtf8Context(): ImplUnicodeToUtf8Context {
  return { nHighSurrogate: 0xffff };
}
/** Resets native signature and pending-surrogate state. @param context - Optional encoder context. @returns Nothing. */
export function ImplResetUnicodeToUtf8Context(context: ImplUnicodeToUtf8Context | null): void {
  if (context !== null) context.nHighSurrogate = 0xffff;
}
/** Converts using the original SAL Unicode-to-UTF-8 state machine.
 * @param data - Null for UTF-8, non-null for Java UTF-8.
 * @param context - Optional persistent encoder state.
 * @param source - Borrowed UTF-16 units.
 * @param sourceChars - Number of source units.
 * @param destination - Borrowed encoded output storage.
 * @param destinationBytes - Output capacity.
 * @param flags - Native conversion flags.
 * @param info - Mutable native status bits.
 * @param sourceConverted - Mutable consumed-unit count.
 * @returns Number of written bytes.
 */
export function ImplConvertUnicodeToUtf8(
  data: unknown,
  context: ImplUnicodeToUtf8Context | null,
  source: Uint16Array,
  sourceChars: number,
  destination: Uint8Array,
  destinationBytes: number,
  flags: number,
  info: [number],
  sourceConverted: [number],
): number {
  const javaUtf8 = data !== null;
  let high = context?.nHighSurrogate ?? 0xffff;
  let offset = 0;
  const output: [number] = [0];
  info[0] = 0;
  if (high === 0xffff) {
    if ((flags & cvt.RTL_UNICODETOTEXT_FLAGS_GLOBAL_SIGNATURE) !== 0 && !javaUtf8) {
      if (destinationBytes < 3) {
        info[0] = cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
        sourceConverted[0] = 0;
        return 0;
      }
      destination[output[0]++] = 0xef;
      destination[output[0]++] = 0xbb;
      destination[output[0]++] = 0xbf;
    }
    high = 0;
  }
  while (offset < sourceChars) {
    let character = source[offset++] as number;
    let bad = false;
    if (high === 0) {
      if (isHighSurrogate(character) && !javaUtf8) {
        high = character;
        continue;
      }
      if (isLowSurrogate(character) && !javaUtf8) bad = true;
    } else if (isLowSurrogate(character) && !javaUtf8)
      character = combineSurrogates(high, character);
    else bad = true;
    if (bad) {
      const action = handleBadInputUnicodeToTextConversion(
        false,
        0,
        flags,
        destination,
        output,
        destinationBytes,
        info,
        null,
        0,
        null,
      );
      if (action === BadInputConversionAction.STOP) {
        high = 0;
        break;
      }
      if (action === BadInputConversionAction.CONTINUE) {
        high = 0;
        continue;
      }
    } else {
      const needed =
        character <= 0x7f && (!javaUtf8 || character !== 0)
          ? 1
          : character <= 0x7ff
            ? 2
            : character <= 0xffff
              ? 3
              : 4;
      if (destinationBytes - output[0] >= needed) {
        if (needed === 1) destination[output[0]++] = character;
        else {
          if (needed === 4) destination[output[0]++] = 0xf0 | (character >> 18);
          if (needed >= 3)
            destination[output[0]++] =
              needed === 4 ? 0x80 | ((character >> 12) & 0x3f) : 0xe0 | (character >> 12);
          destination[output[0]++] =
            needed === 2 ? 0xc0 | (character >> 6) : 0x80 | ((character >> 6) & 0x3f);
          destination[output[0]++] = 0x80 | (character & 0x3f);
        }
        high = 0;
        continue;
      }
    }
    offset--;
    info[0] |= cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
    break;
  }
  if (
    high !== 0 &&
    (info[0] &
      (cvt.RTL_UNICODETOTEXT_INFO_ERROR | cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL)) ===
      0
  ) {
    if ((flags & cvt.RTL_UNICODETOTEXT_FLAGS_FLUSH) !== 0)
      info[0] |= cvt.RTL_UNICODETOTEXT_INFO_SRCBUFFERTOSMALL;
    else {
      const action = handleBadInputUnicodeToTextConversion(
        false,
        0,
        flags,
        destination,
        output,
        destinationBytes,
        info,
        null,
        0,
        null,
      );
      if (action === BadInputConversionAction.NO_OUTPUT)
        info[0] |= cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
      else high = 0;
    }
  }
  if (context !== null) context.nHighSurrogate = high;
  sourceConverted[0] = offset;
  return output[0];
}
