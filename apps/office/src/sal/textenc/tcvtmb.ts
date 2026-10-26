/** @fileoverview Original double-byte text-to-Unicode routine from sal/textenc/tcvtmb.cxx. */
import * as cvt from "../inc/rtl/textcvt.h";
import type { ImplDBCSConvertData, ImplEUCJPConvertData } from "./tenchelp";
import { ImplGetUndefinedUnicodeChar } from "./tenchelp";
import { RTL_TEXTENC_UNICODE_REPLACEMENT_CHARACTER } from "./unichars.hxx";

/** Decodes the source-owned lead/trail and EUDC tables with native consumed-byte ordering.
 * @param data - Original DBCS aggregate with all table pointers.
 * @param _context - Original unused converter context.
 * @param source - Borrowed encoded bytes.
 * @param sourceBytes - Source byte count.
 * @param destination - Borrowed UTF-16 output storage.
 * @param destinationChars - Output capacity.
 * @param flags - Native conversion flags.
 * @param info - Mutable status bits.
 * @param sourceConverted - Mutable consumed-byte count.
 * @returns Number of written UTF-16 units.
 */
export function ImplDBCSToUnicode(
  data: ImplDBCSConvertData,
  _context: unknown,
  source: Uint8Array | Int8Array,
  sourceBytes: number,
  destination: Uint16Array,
  destinationChars: number,
  flags: number,
  info: [number],
  sourceConverted: [number],
): number {
  let sourceOffset = 0;
  let destinationOffset = 0;
  let currentStart = 0;
  info[0] = 0;
  while (sourceOffset < sourceBytes) {
    const lead = (source[sourceOffset] as number) & 0xff;
    const entry = data.mpToUniLeadTab[lead];
    if (entry === undefined) throw new RangeError("DBCS lead table has fewer than 256 entries.");
    let converted: number;
    if (entry.mpToUniTrailTab === null || lead < data.mnLeadStart || lead > data.mnLeadEnd) {
      converted = entry.mnUniChar;
      if (converted === 0 && lead !== 0) {
        info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_UNDEFINED;
        const action = flags & cvt.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MASK;
        if (action === cvt.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_ERROR) {
          if ((flags & cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH) === 0) sourceOffset++;
          else sourceOffset = currentStart;
          info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_ERROR;
          break;
        }
        if (action === cvt.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_IGNORE) {
          sourceOffset++;
          currentStart = sourceOffset;
          continue;
        }
        converted = ImplGetUndefinedUnicodeChar(lead, flags);
      }
    } else {
      if (sourceOffset + 1 === sourceBytes) {
        if ((flags & cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH) === 0) {
          info[0] |=
            cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL;
          break;
        }
        converted = 0;
      } else {
        sourceOffset++;
        const trail = (source[sourceOffset] as number) & 0xff;
        converted =
          trail >= entry.mnTrailStart && trail <= entry.mnTrailEnd
            ? (entry.mpToUniTrailTab[trail - entry.mnTrailStart] as number)
            : 0;
        if (converted === 0) {
          const eudc = data.mpEUDCTab;
          for (let index = 0; index < data.mnEUDCCount; index++) {
            const range = eudc?.[index];
            if (range === undefined) throw new RangeError("DBCS EUDC table is incomplete.");
            if (lead < range.mnLeadStart || lead > range.mnLeadEnd) continue;
            const leadOffset = (lead - range.mnLeadStart) * range.mnTrailRangeCount;
            if (trail >= range.mnTrail1Start && trail <= range.mnTrail1End) {
              converted = range.mnUniStart + leadOffset + trail - range.mnTrail1Start;
              break;
            }
            let trailCount = range.mnTrail1End - range.mnTrail1Start + 1;
            if (
              range.mnTrailCount >= 2 &&
              trail >= range.mnTrail2Start &&
              trail <= range.mnTrail2End
            ) {
              converted = range.mnUniStart + leadOffset + trailCount + trail - range.mnTrail2Start;
              break;
            }
            trailCount = range.mnTrail2End - range.mnTrail2Start + 1;
            if (
              range.mnTrailCount >= 3 &&
              trail >= range.mnTrail3Start &&
              trail <= range.mnTrail3End
            ) {
              converted = range.mnUniStart + leadOffset + trailCount + trail - range.mnTrail3Start;
              break;
            }
          }
          if (
            converted === 0 &&
            (lead < data.mnLeadStart ||
              lead > data.mnLeadEnd ||
              trail < data.mnTrailStart ||
              trail > data.mnTrailEnd)
          ) {
            info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_INVALID;
            const action = flags & cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_MASK;
            if (action === cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR) {
              if ((flags & cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH) === 0) sourceOffset++;
              else sourceOffset = currentStart;
              info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_ERROR;
              break;
            }
            if (action === cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_IGNORE) {
              sourceOffset++;
              currentStart = sourceOffset;
              continue;
            }
            converted = RTL_TEXTENC_UNICODE_REPLACEMENT_CHARACTER;
          }
        }
      }
      if (converted === 0) {
        info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_MBUNDEFINED;
        const action = flags & cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_MASK;
        if (action === cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_ERROR) {
          if ((flags & cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH) === 0) sourceOffset++;
          else sourceOffset = currentStart;
          info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_ERROR;
          break;
        }
        if (action === cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_IGNORE) {
          sourceOffset++;
          currentStart = sourceOffset;
          continue;
        }
        converted = RTL_TEXTENC_UNICODE_REPLACEMENT_CHARACTER;
      }
    }
    if (destinationOffset === destinationChars) {
      info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
      break;
    }
    destination[destinationOffset++] = converted;
    sourceOffset++;
    currentStart = sourceOffset;
  }
  sourceConverted[0] = sourceOffset;
  return destinationOffset;
}

/** Decodes EUC-JP through the pinned JIS-0208 and JIS-0212 tables.
 * @param data - Original four-pointer EUC-JP aggregate.
 * @param _context - Original unused converter context.
 * @param source - Borrowed encoded bytes.
 * @param sourceBytes - Source byte count.
 * @param destination - Borrowed UTF-16 output storage.
 * @param destinationChars - Output capacity.
 * @param flags - Native conversion flags.
 * @param info - Mutable status bits.
 * @param sourceConverted - Mutable consumed-byte count.
 * @returns Number of written UTF-16 units.
 */
export function ImplEUCJPToUnicode(
  data: ImplEUCJPConvertData,
  _context: unknown,
  source: Uint8Array | Int8Array,
  sourceBytes: number,
  destination: Uint16Array,
  destinationChars: number,
  flags: number,
  info: [number],
  sourceConverted: [number],
): number {
  let sourceOffset = 0;
  let destinationOffset = 0;
  let currentStart = 0;
  let lead = 0;
  let trail = 0;
  info[0] = 0;
  while (sourceOffset < sourceBytes) {
    let character = (source[sourceOffset] as number) & 0xff;
    let converted: number;
    if (character <= 0x7f) converted = character;
    else {
      if (character === 0x8e) {
        if (sourceOffset + 1 === sourceBytes) {
          info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL;
          break;
        }
        sourceOffset++;
        character = (source[sourceOffset] as number) & 0xff;
        if (character >= 0xa1 && character <= 0xdf) converted = 0xff61 + character - 0xa1;
        else {
          converted = 0;
          lead = 0x8e;
          trail = character;
        }
      } else {
        let leadTable: ImplEUCJPConvertData["mpJIS0208ToUniLeadTab"];
        if (character === 0x8f) {
          if (sourceBytes - sourceOffset < 3) {
            info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL;
            break;
          }
          sourceOffset++;
          lead = (source[sourceOffset] as number) & 0xff;
          sourceOffset++;
          trail = (source[sourceOffset] as number) & 0xff;
          leadTable = data.mpJIS0212ToUniLeadTab;
        } else {
          if (sourceOffset + 1 === sourceBytes) {
            info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL;
            break;
          }
          lead = character;
          sourceOffset++;
          trail = (source[sourceOffset] as number) & 0xff;
          leadTable = data.mpJIS0208ToUniLeadTab;
        }
        if (lead < 0x80 || trail < 0x80) converted = 0;
        else {
          lead -= 0x80;
          trail -= 0x80;
          const entry = leadTable[lead];
          if (entry === undefined)
            throw new RangeError("EUC-JP lead table has fewer than 128 entries.");
          converted =
            trail >= entry.mnTrailStart && trail <= entry.mnTrailEnd
              ? (entry.mpToUniTrailTab?.[trail - entry.mnTrailStart] ?? 0)
              : 0;
        }
      }
      if (converted === 0) {
        if (lead < 0x80 || trail < 0x80) {
          info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_INVALID;
          const action = flags & cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_MASK;
          if (action === cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR) {
            if ((flags & cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH) === 0) sourceOffset++;
            else sourceOffset = currentStart;
            info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_ERROR;
            break;
          }
          if (action === cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_IGNORE) {
            sourceOffset++;
            currentStart = sourceOffset;
            continue;
          }
          converted = RTL_TEXTENC_UNICODE_REPLACEMENT_CHARACTER;
        } else {
          if ((flags & cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH) === 0) sourceOffset++;
          else sourceOffset = currentStart;
          info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_MBUNDEFINED;
          const action = flags & cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_MASK;
          if (action === cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_ERROR) {
            info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_ERROR;
            break;
          }
          if (action === cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_IGNORE) {
            sourceOffset++;
            currentStart = sourceOffset;
            continue;
          }
          converted = RTL_TEXTENC_UNICODE_REPLACEMENT_CHARACTER;
        }
      }
    }
    if (destinationOffset === destinationChars) {
      info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
      break;
    }
    destination[destinationOffset++] = converted;
    sourceOffset++;
    currentStart = sourceOffset;
  }
  sourceConverted[0] = sourceOffset;
  return destinationOffset;
}
