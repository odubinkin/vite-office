/** @fileoverview UTF-7 conversion from sal/textenc/tcvtutf7.cxx. */
import * as cvt from "../inc/rtl/textcvt.h";

const base64Index = new Uint8Array(128).fill(0xff);
for (let index = 0; index < 26; index++) {
  base64Index[0x41 + index] = index;
  base64Index[0x61 + index] = index + 26;
}
for (let index = 0; index < 10; index++) base64Index[0x30 + index] = index + 52;
base64Index[0x2b] = 62;
base64Index[0x2f] = 63;

/** Original UTF-7-to-Unicode context. */
export interface ImplUTF7ToUCContextData {
  mbShifted: boolean;
  mbFirst: boolean;
  mbWroteOne: boolean;
  mnBitBuffer: number;
  mnBufferBits: number;
}

/** Creates the native converter context. @returns Fresh context. */
export function ImplUTF7CreateUTF7TextToUnicodeContext(): ImplUTF7ToUCContextData {
  return {
    mbShifted: false,
    mbFirst: false,
    mbWroteOne: false,
    mnBitBuffer: 0,
    mnBufferBits: 0,
  };
}

/** Resets the native converter context. @param context - Mutable context. @returns Nothing. */
export function ImplUTF7ResetTextToUnicodeContext(context: ImplUTF7ToUCContextData): void {
  context.mbShifted = false;
  context.mbFirst = false;
  context.mbWroteOne = false;
  context.mnBitBuffer = 0;
  context.mnBufferBits = 0;
}

/** Releases a context under JavaScript ownership. @param _context - Context. @returns Nothing. */
export function ImplUTF7DestroyTextToUnicodeContext(_context: ImplUTF7ToUCContextData): void {
  void _context;
}

/** Converts UTF-7 with the pinned SAL state machine, including its disabled context restore.
 * @param _data - Unused converter data.
 * @param context - Optional native context.
 * @param source - Borrowed encoded bytes.
 * @param sourceBytes - Source byte count.
 * @param destination - Borrowed UTF-16 output storage.
 * @param destinationChars - Output capacity.
 * @param flags - Native conversion flags.
 * @param info - Mutable status bits.
 * @param sourceConverted - Mutable consumed-byte count.
 * @returns Number of written UTF-16 units.
 */
export function ImplUTF7ToUnicode(
  _data: unknown,
  context: ImplUTF7ToUCContextData | null,
  source: Uint8Array | Int8Array,
  sourceBytes: number,
  destination: Uint16Array,
  destinationChars: number,
  flags: number,
  info: [number],
  sourceConverted: [number],
): number {
  // The pinned source comments out restoration from pContextData.
  let shifted = false;
  let first = false;
  let wroteOne = false;
  let bitBuffer = 0;
  let bufferBits = 0;
  let sourceOffset = 0;
  let destinationOffset = 0;
  let character = 0;
  let base64Value = 0;
  let end = false;
  info[0] = 0;

  do {
    let base64End: boolean;
    if (sourceOffset < sourceBytes) {
      character = (source[sourceOffset] as number) & 0xff;
      base64End = false;
      if (character <= 0x7f) {
        base64Value = base64Index[character] as number;
        if (base64Value === 0xff) base64End = true;
      }
    } else {
      end = true;
      base64End = true;
    }

    if (shifted) {
      if (base64End) {
        shifted = false;
        if (!end && (character === 0x2b || character === 0x2d)) {
          if (first && character === 0x2d) {
            if (destinationOffset >= destinationChars) {
              info[0] |=
                cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
              break;
            }
            destination[destinationOffset++] = 0x2b;
            wroteOne = true;
          }
          sourceOffset++;
          if (sourceOffset < sourceBytes) character = (source[sourceOffset] as number) & 0xff;
          else end = true;
        }
        if (!wroteOne) {
          if (end)
            info[0] |=
              cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL;
          else {
            info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_INVALID;
            if (
              (flags & cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_MASK) ===
              cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR
            ) {
              if ((flags & cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH) === 0 && !end) sourceOffset++;
              info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_ERROR;
              break;
            }
          }
        }
      } else {
        bufferBits += 6;
        bitBuffer = (bitBuffer | ((base64Value & 0x3f) << (32 - bufferBits))) >>> 0;
        first = false;
      }

      while (destinationOffset < destinationChars && bufferBits >= 16) {
        destination[destinationOffset++] = bitBuffer >>> 16;
        bitBuffer = (bitBuffer << 16) >>> 0;
        bufferBits -= 16;
        wroteOne = true;
      }
      if (bufferBits >= 16) {
        info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
        break;
      }
      if (base64End) {
        if (bufferBits && bitBuffer) {
          if (end)
            info[0] |=
              cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL;
          else {
            info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_INVALID;
            if (
              (flags & cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_MASK) ===
              cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR
            ) {
              if ((flags & cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH) === 0 && !end) sourceOffset++;
              info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_ERROR;
              break;
            }
            if (
              (flags & cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_MASK) !==
              cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_IGNORE
            ) {
              if (destinationOffset >= destinationChars) {
                info[0] |=
                  cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
                break;
              }
              destination[destinationOffset++] = 0xfffd;
            }
          }
        }
        bitBuffer = 0;
        bufferBits = 0;
      }
    }

    if (!end) {
      if (!shifted) {
        if (character === 0x2b) {
          shifted = true;
          first = true;
          wroteOne = false;
        } else if (character > 0x7f) {
          info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_INVALID;
          if (
            (flags & cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_MASK) ===
            cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR
          ) {
            if ((flags & cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH) === 0) sourceOffset++;
            info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_ERROR;
            break;
          }
          if (
            (flags & cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_MASK) !==
            cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_IGNORE
          ) {
            if (destinationOffset >= destinationChars) {
              info[0] |=
                cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
              break;
            }
            destination[destinationOffset++] = 0xfffd;
          }
        } else {
          if (destinationOffset >= destinationChars) {
            info[0] |=
              cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
            break;
          }
          destination[destinationOffset++] = character;
        }
      }
      sourceOffset++;
    }
  } while (!end);

  if (context) {
    context.mbShifted = shifted;
    context.mbFirst = first;
    context.mbWroteOne = wroteOne;
    context.mnBitBuffer = bitBuffer;
    context.mnBufferBits = bufferBits;
  }
  sourceConverted[0] = sourceOffset;
  return destinationOffset;
}

const mustShift = Uint8Array.from([
  1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
  1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1,
]);
const base64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Original Unicode-to-UTF-7 context; upstream stores but does not restore these fields. */
export interface ImplUTF7FromUCContextData {
  mbShifted: boolean;
  mnBitBuffer: number;
  mnBufferBits: number;
}

/** Creates native reverse state. @returns Fresh context. */
export function ImplUTF7CreateUnicodeToTextContext(): ImplUTF7FromUCContextData {
  return { mbShifted: false, mnBitBuffer: 0, mnBufferBits: 0 };
}

/** Resets native reverse state. @param context - Existing context. @returns Nothing. */
export function ImplUTF7ResetUnicodeToTextContext(context: ImplUTF7FromUCContextData): void {
  context.mbShifted = false;
  context.mnBitBuffer = 0;
  context.mnBufferBits = 0;
}

/** Releases the context through JavaScript ownership. @param context - Existing context. @returns Nothing. */
export function ImplUTF7DestroyUnicodeToTextContext(context: ImplUTF7FromUCContextData): void {
  void context;
}

/** Original reverse UTF-7 state machine with source shift table, partial writes and disabled context restore.
 * @param _data - Unused converter data.
 * @param context - Optional source state.
 * @param source - UTF-16 units.
 * @param sourceChars - Input size.
 * @param destination - Byte output.
 * @param destinationBytes - Output capacity.
 * @param _flags - Unused native flags.
 * @param info - Status pointer.
 * @param sourceConverted - Consumed-unit pointer.
 * @returns Bytes written.
 */
export function ImplUnicodeToUTF7(
  _data: unknown,
  context: ImplUTF7FromUCContextData | null,
  source: Uint16Array,
  sourceChars: number,
  destination: Uint8Array,
  destinationBytes: number,
  _flags: number,
  info: [number],
  sourceConverted: [number],
): number {
  let character = 0;
  let end = false;
  // The pinned implementation explicitly comments out the context restoration.
  let shifted = false;
  let bitBuffer = 0;
  let bufferBits = 0;
  let input = 0;
  let output = 0;
  info[0] = 0;
  do {
    let needShift: boolean;
    if (input < sourceChars) {
      character = source[input] as number;
      needShift = character > 0x7f || mustShift[character] !== 0;
      if (needShift && !shifted) {
        if (output >= destinationBytes) {
          info[0] |= cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
          break;
        }
        destination[output++] = 0x2b;
        if (character === 0x2b) {
          if (output >= destinationBytes) {
            info[0] |= cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
            break;
          }
          destination[output++] = 0x2d;
        } else shifted = true;
      }
    } else {
      end = true;
      needShift = false;
    }
    if (shifted) {
      if (needShift) {
        bufferBits += 16;
        bitBuffer = (bitBuffer | (character << (32 - bufferBits))) >>> 0;
      } else bufferBits += (6 - (bufferBits % 6)) % 6;
      while (output < destinationBytes && bufferBits >= 6) {
        destination[output++] = base64.charCodeAt(bitBuffer >>> 26);
        bitBuffer = (bitBuffer << 6) >>> 0;
        bufferBits -= 6;
      }
      if (bufferBits >= 6) {
        info[0] |= cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
        break;
      }
      if (!needShift) {
        if (output >= destinationBytes) {
          info[0] |= cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
          break;
        }
        destination[output++] = 0x2d;
        shifted = false;
      }
    }
    if (!end) {
      if (!needShift) {
        if (output >= destinationBytes) {
          info[0] |= cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
          break;
        }
        destination[output++] = character & 0xff;
      }
      input++;
    }
  } while (!end);
  if (context !== null) {
    context.mbShifted = shifted;
    context.mnBitBuffer = bitBuffer;
    context.mnBufferBits = bufferBits;
  }
  sourceConverted[0] = input;
  return output;
}
