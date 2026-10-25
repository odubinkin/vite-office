/** @fileoverview Native ISCII Devanagari text-to-Unicode converter from sal/textenc/convertisciidevangari.cxx. */
import * as cvt from "../inc/rtl/textcvt.h";
import { BadInputConversionAction, handleBadInputTextToUnicodeConversion } from "./converter";
import { IsciiDevanagariMap } from "./convertisciidevangari.data";

/** Original text-to-Unicode context's previous input byte. */
export interface IsciiDevanagariToUnicodeContext {
  m_cPrevChar: number;
}

/** Creates the source-owned converter context. @returns Fresh context. */
export function ImplCreateIsciiDevanagariToUnicodeContext(): IsciiDevanagariToUnicodeContext {
  return { m_cPrevChar: 0 };
}

/** Resets the source-owned converter context. @param context - Existing context. @returns Nothing. */
export function ImplResetIsciiDevanagariToUnicodeContext(
  context: IsciiDevanagariToUnicodeContext,
): void {
  context.m_cPrevChar = 0;
}

/** Releases the source-owned converter context under JavaScript ownership.
 * @param _context - Existing context, released by garbage collection.
 * @returns Nothing.
 */
export function ImplDestroyIsciiDevanagariToUnicodeContext(
  _context: IsciiDevanagariToUnicodeContext,
): void {
  void _context;
}

/** Applies the pinned ISCII Devanagari combinations and bad-input actions.
 * @param _data - Original unused converter data.
 * @param context - Original stateful converter context.
 * @param source - Borrowed encoded bytes.
 * @param sourceBytes - Source byte count.
 * @param destination - Borrowed UTF-16 output storage.
 * @param destinationChars - Output capacity.
 * @param flags - Native conversion flags.
 * @param info - Mutable status bits.
 * @param sourceConverted - Mutable consumed-byte count.
 * @returns Number of written UTF-16 units.
 */
export function ImplConvertIsciiDevanagariToUnicode(
  _data: unknown,
  context: IsciiDevanagariToUnicodeContext,
  source: Uint8Array | Int8Array,
  sourceBytes: number,
  destination: Uint16Array,
  destinationChars: number,
  flags: number,
  info: [number],
  sourceConverted: [number],
): number {
  let converted = 0;
  let destinationOffset = 0;
  let currentStart = 0;
  info[0] = 0;
  while (converted < sourceBytes) {
    if (destinationOffset === destinationChars) {
      info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
      break;
    }
    const input = (source[converted] as number) & 0xff;
    const next = converted < sourceBytes + 1 ? (source[converted + 1] ?? 0) & 0xff : 0;
    let character = 0;
    let normal = true;
    let double = false;
    if (context.m_cPrevChar === 0xe8 && input === 0xe8) {
      character = 0x200c;
      normal = false;
    } else if (context.m_cPrevChar === 0xe8 && input === 0xe9) {
      character = 0x200d;
      normal = false;
    } else if (next === 0xe9) {
      normal = false;
      double = true;
      switch (input) {
        case 0xa1:
          character = 0x0950;
          break;
        case 0xa6:
          character = 0x090c;
          break;
        case 0xa7:
          character = 0x0961;
          break;
        case 0xaa:
          character = 0x0960;
          break;
        case 0xb3:
          character = 0x0958;
          break;
        case 0xb4:
          character = 0x0959;
          break;
        case 0xb5:
          character = 0x095a;
          break;
        case 0xba:
          character = 0x095b;
          break;
        case 0xbf:
          character = 0x095c;
          break;
        case 0xc0:
          character = 0x095d;
          break;
        case 0xc9:
          character = 0x095e;
          break;
        case 0xdb:
          character = 0x0962;
          break;
        case 0xdc:
          character = 0x0963;
          break;
        case 0xdf:
          character = 0x0944;
          break;
        case 0xea:
          character = 0x093d;
          break;
        default:
          normal = true;
          double = false;
      }
    }
    converted++;
    if (double) converted++;
    if (normal) character = IsciiDevanagariMap[input] as number;
    if (character === 0xffff) {
      const pointer: [number] = [destinationOffset];
      const action = handleBadInputTextToUnicodeConversion(
        true,
        true,
        0,
        flags,
        destination,
        pointer,
        destinationChars,
        info,
      );
      destinationOffset = pointer[0];
      if (action === BadInputConversionAction.CONTINUE) {
        currentStart = converted;
        continue;
      }
      if (action === BadInputConversionAction.STOP) {
        if ((flags & cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH) !== 0) converted = currentStart;
        break;
      }
      info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
      break;
    }
    destination[destinationOffset++] = character;
    context.m_cPrevChar = normal ? input : 0;
    currentStart = converted;
  }
  sourceConverted[0] = converted;
  return destinationOffset;
}
