/** @fileoverview Complete original single-byte convertCharToUnicode responsibility from sal/textenc/convertsimple.cxx;no host decoder or generic converter substitute. */
import type { ImplByteConvertData } from "./tenchelp";
import { ImplGetUndefinedUnicodeChar } from "./tenchelp";
import * as cvt from "../inc/rtl/textcvt.h";
/** Converts original bytes through actual const data tables,retaining error/FLUSH/ignore ordering before destination checking. Typed views bind pointer ranges;output slots bind original pointers. @param data - Actual native byte-converter data. @param _context - Original unused opaque context. @param source - Borrowed original char storage. @param sourceBytes - Native size_t source count. @param destination - Borrowed initialized output storage. @param destinationChars - Native size_t destination capacity. @param flags - Native unsigned32 flags. @param info - Original status output. @param sourceConverted - Original consumed-byte output. @returns Original number of written Unicode units,without a terminator. */
export function convertCharToUnicode(
  data: ImplByteConvertData,
  _context: unknown,
  source: Uint8Array | Int8Array,
  sourceBytes: number,
  destination: Uint16Array,
  destinationChars: number,
  flags: number,
  info: [number],
  sourceConverted: [number],
): number {
  let sourceOffset = 0,
    destinationOffset = 0;
  info[0] = 0;
  while (sourceOffset < sourceBytes) {
    const character = (source[sourceOffset] as number) & 0xff;
    let converted: number;
    if (character < 0x80) converted = character;
    else {
      if (character >= data.mnToUniStart1 && character <= data.mnToUniEnd1)
        converted = (data.mpToUniTab1 as readonly number[])[
          character - data.mnToUniStart1
        ] as number;
      else if (character >= data.mnToUniStart2 && character <= data.mnToUniEnd2)
        converted = (data.mpToUniTab2 as readonly number[])[
          character - data.mnToUniStart2
        ] as number;
      else converted = 0;
      if (!converted) {
        info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_UNDEFINED;
        if (
          (flags & cvt.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MASK) ===
          cvt.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_ERROR
        ) {
          if ((flags & cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH) === 0) sourceOffset++;
          info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_ERROR;
          break;
        }
        if (
          (flags & cvt.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MASK) ===
          cvt.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_IGNORE
        ) {
          sourceOffset++;
          continue;
        }
        converted = ImplGetUndefinedUnicodeChar(character, flags);
      }
    }
    if (destinationOffset === destinationChars) {
      info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
      break;
    }
    destination[destinationOffset] = converted;
    destinationOffset++;
    sourceOffset++;
  }
  sourceConverted[0] = sourceOffset;
  return destinationOffset;
}
