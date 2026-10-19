/** @fileoverview Complete original single-byte convertCharToUnicode responsibility from sal/textenc/convertsimple.cxx;no host decoder or generic converter substitute. */
import type { ImplByteConvertData } from "./tenchelp";
import { ImplGetUndefinedUnicodeChar } from "./tenchelp";
import * as cvt from "../inc/rtl/textcvt.h";
import { handleUndefinedUnicodeToTextChar } from "./handleundefinedunicodetotextchar.hxx";
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

/** Original temporary replacement limit. */
const IMPL_MAX_REPLACECHAR = 5;
/** Complete original single-unit replacement aggregate in its original order. */
const aImplRepCharTab: readonly (readonly [number, number])[] = Object.freeze([
  [0x00a0, 0x0020],
  [0x00a1, 0x0021],
  [0x00b7, 0x0045],
  [0x00bf, 0x003f],
  [0x00d7, 0x002a],
  [0x00f7, 0x002f],
  [0x2000, 0x0020],
  [0x2001, 0x0020],
  [0x2002, 0x0020],
  [0x2003, 0x0020],
  [0x2004, 0x0020],
  [0x2005, 0x0020],
  [0x2006, 0x0020],
  [0x2007, 0x0020],
  [0x2008, 0x0020],
  [0x2009, 0x0020],
  [0x200a, 0x0020],
  [0x2010, 0x002d],
  [0x2011, 0x002d],
  [0x2012, 0x002d],
  [0x2013, 0x002d],
  [0x2014, 0x002d],
  [0x2015, 0x002d],
  [0x2018, 0x0027],
  [0x2019, 0x0027],
  [0x201a, 0x002c],
  [0x201b, 0x0027],
  [0x201c, 0x0022],
  [0x201d, 0x0022],
  [0x201e, 0x0022],
  [0x201f, 0x0022],
  [0x2022, 0x002d],
  [0x2023, 0x002d],
  [0x2024, 0x002d],
  [0x2027, 0x002d],
  [0x2028, 0x000a],
  [0x2029, 0x000d],
  [0x2032, 0x0027],
  [0x2033, 0x0022],
  [0x2035, 0x0027],
  [0x2036, 0x0022],
  [0x2039, 0x003c],
  [0x203a, 0x003e],
  [0x2043, 0x002d],
  [0x2044, 0x002f],
  [0x2160, 0x0049],
  [0x2164, 0x0056],
  [0x2169, 0x0058],
  [0x216c, 0x004c],
  [0x216d, 0x0043],
  [0x216e, 0x0044],
  [0x216f, 0x004d],
  [0x2170, 0x0069],
  [0x2174, 0x0076],
  [0x2179, 0x0078],
  [0x217c, 0x006c],
  [0x217d, 0x0063],
  [0x217e, 0x0064],
  [0x217f, 0x006d],
  [0x2215, 0x002f],
  [0x2217, 0x002a],
  [0xff00, 0x0020],
  [0xff01, 0x0021],
  [0xff02, 0x0022],
  [0xff03, 0x0023],
  [0xff04, 0x0024],
  [0xff05, 0x0025],
  [0xff06, 0x0026],
  [0xff07, 0x0027],
  [0xff08, 0x0028],
  [0xff09, 0x0029],
  [0xff0a, 0x002a],
  [0xff0b, 0x002b],
  [0xff0c, 0x002c],
  [0xff0d, 0x002d],
  [0xff0e, 0x002e],
  [0xff0f, 0x002f],
  [0xff10, 0x0030],
  [0xff11, 0x0031],
  [0xff12, 0x0032],
  [0xff13, 0x0033],
  [0xff14, 0x0034],
  [0xff15, 0x0035],
  [0xff16, 0x0036],
  [0xff17, 0x0037],
  [0xff18, 0x0038],
  [0xff19, 0x0039],
  [0xff1a, 0x003a],
  [0xff1b, 0x003b],
  [0xff1c, 0x003c],
  [0xff1d, 0x003d],
  [0xff1e, 0x003e],
  [0xff1f, 0x003f],
  [0xff20, 0x0040],
  [0xff21, 0x0041],
  [0xff22, 0x0042],
  [0xff23, 0x0043],
  [0xff24, 0x0044],
  [0xff25, 0x0045],
  [0xff26, 0x0046],
  [0xff27, 0x0047],
  [0xff28, 0x0048],
  [0xff29, 0x0049],
  [0xff2a, 0x004a],
  [0xff2b, 0x004b],
  [0xff2c, 0x004c],
  [0xff2d, 0x004d],
  [0xff2e, 0x004e],
  [0xff2f, 0x004f],
  [0xff30, 0x0050],
  [0xff31, 0x0051],
  [0xff32, 0x0052],
  [0xff33, 0x0053],
  [0xff34, 0x0054],
  [0xff35, 0x0055],
  [0xff36, 0x0056],
  [0xff37, 0x0057],
  [0xff38, 0x0058],
  [0xff39, 0x0059],
  [0xff3a, 0x005a],
  [0xff3b, 0x005b],
  [0xff3c, 0x005c],
  [0xff3d, 0x005d],
  [0xff3e, 0x005e],
  [0xff3f, 0x005f],
  [0xff40, 0x0060],
  [0xff41, 0x0061],
  [0xff42, 0x0062],
  [0xff43, 0x0063],
  [0xff44, 0x0064],
  [0xff45, 0x0065],
  [0xff46, 0x0066],
  [0xff47, 0x0067],
  [0xff48, 0x0068],
  [0xff49, 0x0069],
  [0xff4a, 0x006a],
  [0xff4b, 0x006b],
  [0xff4c, 0x006c],
  [0xff4d, 0x006d],
  [0xff4e, 0x006e],
  [0xff4f, 0x006f],
  [0xff50, 0x0070],
  [0xff51, 0x0071],
  [0xff52, 0x0072],
  [0xff53, 0x0073],
  [0xff54, 0x0074],
  [0xff55, 0x0075],
  [0xff56, 0x0076],
  [0xff57, 0x0077],
  [0xff58, 0x0078],
  [0xff59, 0x0079],
  [0xff5a, 0x007a],
  [0xff5b, 0x007b],
  [0xff5c, 0x007c],
  [0xff5d, 0x007d],
  [0xff5e, 0x007e],
  [0xff5f, 0x007f],
  [0xff61, 0x3002],
  [0xff62, 0x300c],
  [0xff63, 0x300d],
  [0xff64, 0x3001],
  [0xff65, 0x30fb],
  [0xff66, 0x30f2],
  [0xff67, 0x30a1],
  [0xff68, 0x30a3],
  [0xff69, 0x30a5],
  [0xff6a, 0x30a7],
  [0xff6b, 0x30a9],
  [0xff6c, 0x30e3],
  [0xff6d, 0x30e5],
  [0xff6e, 0x30e7],
  [0xff6f, 0x30c3],
  [0xff70, 0x30fc],
  [0xff71, 0x30a2],
  [0xff72, 0x30a4],
  [0xff73, 0x30a6],
  [0xff74, 0x30a8],
  [0xff75, 0x30aa],
  [0xff76, 0x30ab],
  [0xff77, 0x30ad],
  [0xff78, 0x30af],
  [0xff79, 0x30b1],
  [0xff7a, 0x30b3],
  [0xff7b, 0x30b5],
  [0xff7c, 0x30b7],
  [0xff7d, 0x30b9],
  [0xff7e, 0x30bb],
  [0xff7f, 0x30bd],
  [0xff80, 0x30bf],
  [0xff81, 0x30c1],
  [0xff82, 0x30c4],
  [0xff83, 0x30c6],
  [0xff84, 0x30c8],
  [0xff85, 0x30ca],
  [0xff86, 0x30cb],
  [0xff87, 0x30cc],
  [0xff88, 0x30cd],
  [0xff89, 0x30ce],
  [0xff8a, 0x30cf],
  [0xff8b, 0x30d2],
  [0xff8c, 0x30d5],
  [0xff8d, 0x30d8],
  [0xff8e, 0x30db],
  [0xff8f, 0x30de],
  [0xff90, 0x30df],
  [0xff91, 0x30e0],
  [0xff92, 0x30e1],
  [0xff93, 0x30e2],
  [0xff94, 0x30e4],
  [0xff95, 0x30e6],
  [0xff96, 0x30e8],
  [0xff97, 0x30e9],
  [0xff98, 0x30ea],
  [0xff99, 0x30eb],
  [0xff9a, 0x30ec],
  [0xff9b, 0x30ed],
  [0xff9c, 0x30ef],
  [0xff9d, 0x30f3],
  [0xff9e, 0x309b],
  [0xff9f, 0x309c],
  [0xffa0, 0x3164],
  [0xffa1, 0x3131],
  [0xffa2, 0x3132],
  [0xffa3, 0x3133],
  [0xffa4, 0x3134],
  [0xffa5, 0x3135],
  [0xffa6, 0x3136],
  [0xffa7, 0x3137],
  [0xffa8, 0x3138],
  [0xffa9, 0x3139],
  [0xffaa, 0x313a],
  [0xffab, 0x313b],
  [0xffac, 0x313c],
  [0xffad, 0x313d],
  [0xffae, 0x313e],
  [0xffaf, 0x313f],
  [0xffb0, 0x3140],
  [0xffb1, 0x3141],
  [0xffb2, 0x3142],
  [0xffb3, 0x3143],
  [0xffb4, 0x3144],
  [0xffb5, 0x3145],
  [0xffb6, 0x3146],
  [0xffb7, 0x3147],
  [0xffb8, 0x3148],
  [0xffb9, 0x3149],
  [0xffba, 0x314a],
  [0xffbb, 0x314b],
  [0xffbc, 0x314c],
  [0xffbd, 0x314d],
  [0xffbe, 0x314e],
  [0xffc2, 0x314f],
  [0xffc3, 0x3150],
  [0xffc4, 0x3151],
  [0xffc5, 0x3152],
  [0xffc6, 0x3153],
  [0xffc7, 0x3154],
  [0xffca, 0x3155],
  [0xffcb, 0x3156],
  [0xffcc, 0x3157],
  [0xffcd, 0x3158],
  [0xffce, 0x3159],
  [0xffcf, 0x315a],
  [0xffd2, 0x315b],
  [0xffd3, 0x315c],
  [0xffd4, 0x315d],
  [0xffd5, 0x315e],
  [0xffd6, 0x315f],
  [0xffd7, 0x3160],
  [0xffda, 0x3161],
  [0xffdb, 0x3162],
  [0xffdc, 0x3163],
  [0xffe0, 0x00a2],
  [0xffe1, 0x00a3],
  [0xffe2, 0x00ac],
  [0xffe3, 0x00af],
  [0xffe4, 0x00a6],
  [0xffe5, 0x00a5],
  [0xffe6, 0x20a9],
  [0xffe8, 0x2502],
  [0xffe9, 0x2190],
  [0xffea, 0x2191],
  [0xffeb, 0x2192],
  [0xffec, 0x2193],
  [0xffed, 0x25a0],
  [0xffee, 0x25cb],
  [0xfffd, 0x003f],
]);
/** Complete original fixed five-unit replacement strings in original order;not sorted or corrected. */
const aImplRepCharStrTab: readonly (readonly [number, readonly number[]])[] = Object.freeze([
  [0x00a9, [0x0028, 0x0063, 0x0029, 0x0000, 0x0000]],
  [0x00ab, [0x003c, 0x003c, 0x0000, 0x0000, 0x0000]],
  [0x0ae0, [0x0028, 0x0072, 0x0029, 0x0000, 0x0000]],
  [0x00bb, [0x003e, 0x003e, 0x0000, 0x0000, 0x0000]],
  [0x00bc, [0x0031, 0x002f, 0x0034, 0x0000, 0x0000]],
  [0x00bd, [0x0031, 0x002f, 0x0032, 0x0000, 0x0000]],
  [0x00be, [0x0033, 0x002f, 0x0034, 0x0000, 0x0000]],
  [0x00c6, [0x0041, 0x0045, 0x0000, 0x0000, 0x0000]],
  [0x00e6, [0x0061, 0x0065, 0x0000, 0x0000, 0x0000]],
  [0x0152, [0x004f, 0x0045, 0x0000, 0x0000, 0x0000]],
  [0x0153, [0x006f, 0x0065, 0x0000, 0x0000, 0x0000]],
  [0x2025, [0x002e, 0x002e, 0x0000, 0x0000, 0x0000]],
  [0x2026, [0x002e, 0x002e, 0x002e, 0x0000, 0x0000]],
  [0x2034, [0x0027, 0x0027, 0x0027, 0x0000, 0x0000]],
  [0x2037, [0x0027, 0x0027, 0x0027, 0x0000, 0x0000]],
  [0x20ac, [0x0045, 0x0055, 0x0052, 0x0000, 0x0000]],
  [0x2122, [0x0028, 0x0074, 0x006d, 0x0029, 0x0000]],
  [0x2153, [0x0031, 0x002f, 0x0033, 0x0000, 0x0000]],
  [0x2154, [0x0032, 0x002f, 0x0033, 0x0000, 0x0000]],
  [0x2155, [0x0031, 0x002f, 0x0035, 0x0000, 0x0000]],
  [0x2156, [0x0032, 0x002f, 0x0035, 0x0000, 0x0000]],
  [0x2157, [0x0033, 0x002f, 0x0035, 0x0000, 0x0000]],
  [0x2158, [0x0034, 0x002f, 0x0035, 0x0000, 0x0000]],
  [0x2159, [0x0031, 0x002f, 0x0036, 0x0000, 0x0000]],
  [0x215a, [0x0035, 0x002f, 0x0036, 0x0000, 0x0000]],
  [0x215b, [0x0031, 0x002f, 0x0038, 0x0000, 0x0000]],
  [0x215c, [0x0033, 0x002f, 0x0038, 0x0000, 0x0000]],
  [0x215d, [0x0035, 0x002f, 0x0038, 0x0000, 0x0000]],
  [0x215e, [0x0037, 0x002f, 0x0038, 0x0000, 0x0000]],
  [0x215f, [0x0031, 0x002f, 0x0000, 0x0000, 0x0000]],
  [0x2161, [0x0049, 0x0049, 0x0000, 0x0000, 0x0000]],
  [0x2162, [0x0049, 0x0049, 0x0049, 0x0000, 0x0000]],
  [0x2163, [0x0049, 0x0056, 0x0000, 0x0000, 0x0000]],
  [0x2165, [0x0056, 0x0049, 0x0000, 0x0000, 0x0000]],
  [0x2166, [0x0056, 0x0049, 0x0049, 0x0000, 0x0000]],
  [0x2168, [0x0056, 0x0049, 0x0049, 0x0049, 0x0000]],
  [0x2169, [0x0049, 0x0058, 0x0000, 0x0000, 0x0000]],
  [0x216a, [0x0058, 0x0049, 0x0000, 0x0000, 0x0000]],
  [0x216b, [0x0058, 0x0049, 0x0049, 0x0000, 0x0000]],
  [0x2171, [0x0069, 0x0069, 0x0000, 0x0000, 0x0000]],
  [0x2172, [0x0069, 0x0069, 0x0069, 0x0000, 0x0000]],
  [0x2173, [0x0069, 0x0076, 0x0000, 0x0000, 0x0000]],
  [0x2175, [0x0076, 0x0069, 0x0000, 0x0000, 0x0000]],
  [0x2176, [0x0076, 0x0069, 0x0069, 0x0000, 0x0000]],
  [0x2178, [0x0076, 0x0069, 0x0069, 0x0069, 0x0000]],
  [0x2179, [0x0069, 0x0078, 0x0000, 0x0000, 0x0000]],
  [0x217a, [0x0078, 0x0069, 0x0000, 0x0000, 0x0000]],
  [0x217b, [0x0058, 0x0069, 0x0069, 0x0000, 0x0000]],
]);
/** Original single-unit binary replacement search;data is neither reordered nor normalized. @param character - Native UTF16 unit. @returns Original replacement or zero. */
function ImplGetReplaceChar(character: number): number {
  let low = 0,
    high = aImplRepCharTab.length - 1;
  do {
    const middle = Math.trunc((low + high) / 2);
    const data = aImplRepCharTab[middle] as readonly [number, number];
    if (character < data[0]) {
      if (!middle) break;
      high = middle - 1;
    } else {
      if (character > data[0]) low = middle + 1;
      else return data[1];
    }
  } while (low <= high);
  return 0;
}
/** Original fixed-string binary replacement search,including original unsorted data. @param character - Native UTF16 unit. @returns Borrowed original replacement pointer or null. */
function ImplGetReplaceString(character: number): readonly number[] | null {
  let low = 0,
    high = aImplRepCharStrTab.length - 1;
  do {
    const middle = Math.trunc((low + high) / 2);
    const data = aImplRepCharStrTab[middle] as readonly [number, readonly number[]];
    if (character < data[0]) {
      if (!middle) break;
      high = middle - 1;
    } else {
      if (character > data[0]) low = middle + 1;
      else return data[1];
    }
  } while (low <= high);
  return null;
}
/** Original byte lookup writing zero through two bytes to native temporary storage. @param data - Actual original descriptor. @param character - Native UTF16 unit. @param destination - Borrowed output storage. @returns Original byte count. */
function ImplConvertUnicodeCharToChar(
  data: ImplByteConvertData,
  character: number,
  destination: Uint8Array,
): number {
  if (character < 0x80) {
    destination[0] = character;
    return 1;
  }
  if (character >= data.mnToCharStart1 && character <= data.mnToCharEnd1) {
    destination[0] = (data.mpToCharTab1 as readonly number[])[
      character - data.mnToCharStart1
    ] as number;
    if (destination[0] !== 0) return 1;
  } else if (character >= data.mnToCharStart2 && character <= data.mnToCharEnd2) {
    destination[0] = (data.mpToCharTab2 as readonly number[])[
      character - data.mnToCharStart2
    ] as number;
    if (destination[0] !== 0) return 1;
  }
  const extended = data.mpToCharExTab;
  if (extended !== null) {
    let low = 0,
      high = data.mnToCharExCount - 1;
    do {
      const middle = Math.trunc((low + high) / 2);
      const entry = extended[middle] as NonNullable<ImplByteConvertData["mpToCharExTab"]>[number];
      if (character < entry.mnUniChar) {
        if (!middle) break;
        high = middle - 1;
      } else {
        if (character > entry.mnUniChar) low = middle + 1;
        else {
          destination[0] = entry.mnChar;
          if (entry.mnChar2 === 0) return 1;
          destination[1] = entry.mnChar2;
          return 2;
        }
      }
    } while (low <= high);
  }
  return 0;
}
/** Converts original UTF16 through complete native reverse tables,replacements and undefined/surrogate handling without a host encoder. @param data - Actual original descriptor. @param _context - Native unused context. @param source - Borrowed original UTF16 storage. @param sourceChars - Native logical source count. @param destination - Borrowed original byte storage. @param destinationBytes - Native logical output capacity. @param flags - Native unsigned32 flags. @param info - Original status cell. @param sourceConverted - Original consumed-unit cell. @returns Native written-byte count,without an automatic terminator. */
export function convertUnicodeToChar(
  data: ImplByteConvertData,
  _context: unknown,
  source: Uint16Array,
  sourceChars: number,
  destination: Uint8Array | Int8Array,
  destinationBytes: number,
  flags: number,
  info: [number],
  sourceConverted: [number],
): number {
  const sourceOffset: [number] = [0],
    destinationOffset: [number] = [0];
  const temporary = new Uint8Array(IMPL_MAX_REPLACECHAR + 2);
  info[0] = 0;
  while (sourceOffset[0] < sourceChars) {
    const character = source[sourceOffset[0]] as number;
    let count: number;
    if (character < 0x80) {
      temporary[0] = character;
      count = 1;
    } else {
      count = ImplConvertUnicodeCharToChar(data, character, temporary);
      if (count === 0) {
        if ((flags & cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_REPLACE) !== 0) {
          const replacement = ImplGetReplaceChar(character);
          if (replacement !== 0) count = ImplConvertUnicodeCharToChar(data, replacement, temporary);
        }
        if (count === 0) {
          if ((flags & cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_REPLACESTR) !== 0) {
            const replacements = ImplGetReplaceString(character);
            if (replacements !== null) {
              let position = 0;
              while (replacements[position] && count < IMPL_MAX_REPLACECHAR) {
                const written = ImplConvertUnicodeCharToChar(
                  data,
                  replacements[position] as number,
                  temporary.subarray(count),
                );
                /* istanbul ignore if -- Every nonzero unit in the original const replacement strings is ASCII;the original lookup unconditionally returns1 for ASCII. Preserve this source guard;see task32 unreachable-replacement-proof.json. */
                if (written === 0) {
                  count = 0;
                  break;
                }
                position++;
                count += written;
              }
            }
          }
          if (count === 0) {
            if (
              handleUndefinedUnicodeToTextChar(
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
              continue;
            break;
          }
        }
      }
    }
    if (destinationBytes - destinationOffset[0] < count) {
      info[0] |= cvt.RTL_UNICODETOTEXT_INFO_ERROR | cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
      break;
    }
    for (let i = 0; i < count; i++) destination[destinationOffset[0]++] = temporary[i] as number;
    sourceOffset[0]++;
  }
  sourceConverted[0] = sourceOffset[0];
  return destinationOffset[0];
}
