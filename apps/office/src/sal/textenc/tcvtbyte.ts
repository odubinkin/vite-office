/** @fileoverview Symbol-font converters from sal/textenc/tcvtbyte.cxx. */
import * as cvt from "../inc/rtl/textcvt.h";
import { handleUndefinedUnicodeToTextChar } from "./handleundefinedunicodetotextchar.hxx";

/** Maps control bytes directly and all other symbol bytes into Unicode private use. */
export function ImplSymbolToUnicode(
  _data: unknown,
  _context: unknown,
  source: Uint8Array | Int8Array,
  sourceBytes: number,
  destination: Uint16Array,
  destinationChars: number,
  _flags: number,
  info: [number],
  sourceConverted: [number],
): number {
  let sourceOffset = 0;
  let destinationOffset = 0;
  info[0] = 0;
  while (sourceOffset < sourceBytes) {
    if (destinationOffset === destinationChars) {
      info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
      break;
    }
    const character = (source[sourceOffset] as number) & 0xff;
    destination[destinationOffset++] = character <= 0x1f ? character : character + 0xf000;
    sourceOffset++;
  }
  sourceConverted[0] = sourceOffset;
  return destinationOffset;
}

/** Reverses private-use symbol units and the source's accepted low-byte aliases. */
export function ImplUnicodeToSymbol(
  _data: unknown,
  _context: unknown,
  source: Uint16Array,
  sourceChars: number,
  destination: Uint8Array | Int8Array,
  destinationBytes: number,
  flags: number,
  info: [number],
  sourceConverted: [number],
): number {
  const sourceOffset: [number] = [0];
  const destinationOffset: [number] = [0];
  info[0] = 0;
  while (sourceOffset[0] < sourceChars) {
    if (destinationOffset[0] === destinationBytes) {
      info[0] |= cvt.RTL_UNICODETOTEXT_INFO_ERROR | cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
      break;
    }
    const character = source[sourceOffset[0]] as number;
    if ((character >= 0xf000 && character <= 0xf0ff) || character <= 0xff) {
      destination[destinationOffset[0]++] = character & 0xff;
      sourceOffset[0]++;
    } else if (
      !handleUndefinedUnicodeToTextChar(
        source,
        sourceOffset,
        sourceChars,
        destination,
        destinationOffset,
        destinationBytes,
        flags,
        info,
      )
    )
      break;
  }
  sourceConverted[0] = sourceOffset[0];
  return destinationOffset[0];
}
