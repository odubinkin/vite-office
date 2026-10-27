/** @fileoverview Original DBCS and EUC-JP conversion routines in both directions from sal/textenc/tcvtmb.cxx. */
import { handleUndefinedUnicodeToTextChar } from "./handleundefinedunicodetotextchar.hxx";
import { RTL_TEXTCVT_BYTE_PRIVATE_START, RTL_TEXTCVT_BYTE_PRIVATE_END } from "./tenchelp";
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

/** Original table-driven reverse DBCS converter, including source EUDC/private precedence and exact consumed/output offsets. @param data - Actual native aggregate. @param _context - Unused native context. @param source - UTF16 view. @param sourceChars - Native length. @param destination - Borrowed byte output. @param destinationBytes - Logical output capacity. @param flags - Native flags. @param info - Native status. @param sourceConverted - Consumed UTF16 units. @returns Written bytes. */
export function ImplUnicodeToDBCS(
  data: ImplDBCSConvertData,
  _context: unknown,
  source: Uint16Array,
  sourceChars: number,
  destination: Uint8Array | Int8Array,
  destinationBytes: number,
  flags: number,
  info: [number],
  sourceConverted: [number],
): number {
  const src: [number] = [0],
    dst: [number] = [0];
  const checkRange = data.mnLeadStart !== 0 || data.mnLeadEnd !== 0xff;
  info[0] = 0;
  while (src[0] < sourceChars) {
    const c = source[src[0]] as number,
      low = c & 255,
      high = data.mpToDBCSHighTab[c >>> 8];
    if (high === undefined) throw new Error("Original DBCS high table is incomplete.");
    let converted = 0;
    if (low >= high.mnLowStart && low <= high.mnLowEnd) {
      if (high.mpToUniTrailTab === null)
        throw new Error("Original DBCS high entry requires its reverse table.");
      converted = high.mpToUniTrailTab[low - high.mnLowStart] as number;
      if (
        checkRange &&
        converted > 127 &&
        (converted >>> 8 < data.mnLeadStart ||
          converted >>> 8 > data.mnLeadEnd ||
          (converted & 255) < data.mnTrailStart ||
          (converted & 255) > data.mnTrailEnd)
      )
        converted = 0;
    }
    if (converted === 0 && c !== 0) {
      for (let index = 0; index < data.mnEUDCCount; ++index) {
        const range = data.mpEUDCTab?.[index];
        if (range === undefined) throw new Error("Original DBCS EUDC table is incomplete.");
        if (c < range.mnUniStart || c > range.mnUniEnd) continue;
        const offset = c - range.mnUniStart,
          lead = Math.trunc(offset / range.mnTrailRangeCount);
        let trail = offset % range.mnTrailRangeCount;
        converted = ((range.mnLeadStart + lead) << 8) & 0xffff;
        let size = range.mnTrail1End - range.mnTrail1Start + 1;
        if (trail < size) {
          converted |= range.mnTrail1Start + trail;
          break;
        }
        trail -= size;
        size = range.mnTrail2End - range.mnTrail2Start + 1;
        if (trail < size) {
          converted |= range.mnTrail2Start + trail;
          break;
        }
        trail -= size;
        converted |= range.mnTrail3Start + trail;
        break;
      }
      // Original source assigns through plain signed char before unsigned16 cConv.
      if (
        c >= RTL_TEXTCVT_BYTE_PRIVATE_START &&
        c <= RTL_TEXTCVT_BYTE_PRIVATE_END &&
        flags & cvt.RTL_UNICODETOTEXT_FLAGS_PRIVATE_MAPTO0
      )
        converted = ((low << 24) >> 24) & 0xffff;
    }
    if (converted === 0 && c !== 0) {
      // The two replacement-flag branches in the original DBCS owner are deliberately empty.
      if (
        handleUndefinedUnicodeToTextChar(
          source,
          src,
          sourceChars,
          destination,
          dst,
          destinationBytes,
          flags,
          info,
        )
      )
        continue;
      break;
    }
    if (!(converted & 0xff00)) {
      if (dst[0] === destinationBytes) {
        info[0] |= cvt.RTL_UNICODETOTEXT_INFO_ERROR | cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
        break;
      }
      destination[dst[0]++] = converted & 255;
    } else {
      if (dst[0] + 1 >= destinationBytes) {
        info[0] |= cvt.RTL_UNICODETOTEXT_INFO_ERROR | cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
        break;
      }
      destination[dst[0]++] = converted >>> 8;
      destination[dst[0]++] = converted & 255;
    }
    ++src[0];
  }
  sourceConverted[0] = src[0];
  return dst[0];
}

/** Original EUC-JP reverse converter retains ASCII/SS2/JIS0208/JIS0212 priority and source bad-input policy. @param data - Actual EUC-JP aggregate. @param _context - Unused native context. @param source - UTF16 view. @param sourceChars - Native length. @param destination - Borrowed output. @param destinationBytes - Native capacity. @param flags - Native flags. @param info - Status cell. @param sourceConverted - Consumed UTF16 units. @returns Written bytes. */
export function ImplUnicodeToEUCJP(
  data: ImplEUCJPConvertData,
  _context: unknown,
  source: Uint16Array,
  sourceChars: number,
  destination: Uint8Array | Int8Array,
  destinationBytes: number,
  flags: number,
  info: [number],
  sourceConverted: [number],
): number {
  const src: [number] = [0],
    dst: [number] = [0];
  info[0] = 0;
  while (src[0] < sourceChars) {
    const c = source[src[0]] as number;
    let converted: number;
    if (c <= 127) converted = c;
    else if (c >= 0xff61 && c <= 0xff9f) converted = 0x8ea1 + c - 0xff61;
    else {
      const low = c & 255,
        high = c >>> 8,
        first = data.mpUniToJIS0208HighTab[high];
      if (first === undefined) throw new Error("Original JIS0208 high table is incomplete.");
      converted =
        low >= first.mnLowStart && low <= first.mnLowEnd
          ? (first.mpToUniTrailTab?.[low - first.mnLowStart] as number)
          : 0;
      if (converted) converted |= 0x8080;
      else {
        const second = data.mpUniToJIS0212HighTab[high];
        if (second === undefined) throw new Error("Original JIS0212 high table is incomplete.");
        if (low >= second.mnLowStart && low <= second.mnLowEnd) {
          converted = second.mpToUniTrailTab?.[low - second.mnLowStart] as number;
          if (converted) converted |= 0x8f8080;
        }
        if (!converted) {
          // Original replacement branches are empty; the common native undefined owner decides.
          if (
            handleUndefinedUnicodeToTextChar(
              source,
              src,
              sourceChars,
              destination,
              dst,
              destinationBytes,
              flags,
              info,
            )
          )
            continue;
          break;
        }
      }
    }
    const count = !(converted & 0xffff00) ? 1 : !(converted & 0xff0000) ? 2 : 3;
    if (count === 1 ? dst[0] === destinationBytes : dst[0] + count - 1 >= destinationBytes) {
      info[0] |= cvt.RTL_UNICODETOTEXT_INFO_ERROR | cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
      break;
    }
    if (count === 3) destination[dst[0]++] = converted >>> 16;
    if (count >= 2) destination[dst[0]++] = (converted >>> 8) & 255;
    destination[dst[0]++] = converted & 255;
    ++src[0];
  }
  sourceConverted[0] = src[0];
  return dst[0];
}
