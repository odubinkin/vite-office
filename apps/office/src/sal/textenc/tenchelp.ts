/** @fileoverview Original single-byte converter data declarations and undefined-byte helper from sal/textenc/tenchelp.hxx. */
import {
  RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MASK,
  RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MAPTOPRIVATE,
} from "../inc/rtl/textcvt.h";
import { RTL_TEXTENC_UNICODE_REPLACEMENT_CHARACTER } from "./unichars.hxx";
/** Original private byte mapping range start. */
export const RTL_TEXTCVT_BYTE_PRIVATE_START = 0xf100;
/** Original private byte mapping range end. */
export const RTL_TEXTCVT_BYTE_PRIVATE_END = 0xf1ff;
/** Original reverse mapping entry,including the optional second output byte. */
export interface ImplUniCharTabData {
  /** Original BMP code unit. */
  readonly mnUniChar: number;
  /** Original first byte. */
  readonly mnChar: number;
  /** Original second byte or zero. */
  readonly mnChar2: number;
}
/** Original complete byte-converter aggregate;readonly arrays bind actual const table pointers,including shared identities and null pointers. */
export interface ImplByteConvertData {
  /** Original first byte-to-Unicode table pointer. */
  readonly mpToUniTab1: readonly number[] | null;
  /** Original second byte-to-Unicode table pointer. */
  readonly mpToUniTab2: readonly number[] | null;
  /** Original first Unicode-to-byte table pointer. */
  readonly mpToCharTab1: readonly number[] | null;
  /** Original second Unicode-to-byte table pointer. */
  readonly mpToCharTab2: readonly number[] | null;
  /** Original reverse extension table pointer. */
  readonly mpToCharExTab: readonly ImplUniCharTabData[] | null;
  /** Original first source-range start. */
  readonly mnToUniStart1: number;
  /** Original first source-range end. */
  readonly mnToUniEnd1: number;
  /** Original second source-range start. */
  readonly mnToUniStart2: number;
  /** Original second source-range end. */
  readonly mnToUniEnd2: number;
  /** Original first reverse-range start. */
  readonly mnToCharStart1: number;
  /** Original first reverse-range end. */
  readonly mnToCharEnd1: number;
  /** Original second reverse-range start. */
  readonly mnToCharStart2: number;
  /** Original second reverse-range end. */
  readonly mnToCharEnd2: number;
  /** Original reverse extension entry count. */
  readonly mnToCharExCount: number;
}

/** Original private-use range entry for a double-byte encoding. */
export interface ImplDBCSEUDCData {
  readonly mnLeadStart: number;
  readonly mnLeadEnd: number;
  readonly mnTrail1Start: number;
  readonly mnTrail1End: number;
  readonly mnTrail2Start: number;
  readonly mnTrail2End: number;
  readonly mnTrail3Start: number;
  readonly mnTrail3End: number;
  readonly mnTrailCount: number;
  readonly mnTrailRangeCount: number;
  readonly mnUniStart: number;
  readonly mnUniEnd: number;
}

/** Original single-byte value or lead-byte trail mapping. */
export interface ImplDBCSToUniLeadTab {
  readonly mnUniChar: number;
  readonly mnTrailStart: number;
  readonly mnTrailEnd: number;
  readonly mpToUniTrailTab: readonly number[] | null;
}

/** Original reverse high-byte mapping, retained by the aggregate. */
export interface ImplUniToDBCSHighTab {
  readonly mnLowStart: number;
  readonly mnLowEnd: number;
  readonly mpToUniTrailTab: readonly number[] | null;
}

/** Original complete double-byte converter data contract. */
export interface ImplDBCSConvertData {
  readonly mpToUniLeadTab: readonly ImplDBCSToUniLeadTab[];
  readonly mpToDBCSHighTab: readonly ImplUniToDBCSHighTab[];
  readonly mpEUDCTab: readonly ImplDBCSEUDCData[] | null;
  readonly mnEUDCCount: number;
  readonly mnLeadStart: number;
  readonly mnLeadEnd: number;
  readonly mnTrailStart: number;
  readonly mnTrailEnd: number;
}

/** Original EUC-JP aggregate binding both JIS forward and reverse tables. */
export interface ImplEUCJPConvertData {
  readonly mpJIS0208ToUniLeadTab: readonly ImplDBCSToUniLeadTab[];
  readonly mpJIS0212ToUniLeadTab: readonly ImplDBCSToUniLeadTab[];
  readonly mpUniToJIS0208HighTab: readonly ImplUniToDBCSHighTab[];
  readonly mpUniToJIS0212HighTab: readonly ImplUniToDBCSHighTab[];
}
/** Original undefined-byte mapping;the other mask values select the replacement character here. @param character - Native unsigned byte. @param flags - Original unsigned32 flags. @returns Native Unicode unit. */
export function ImplGetUndefinedUnicodeChar(character: number, flags: number): number {
  return (flags & RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MASK) ===
    RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MAPTOPRIVATE
    ? RTL_TEXTCVT_BYTE_PRIVATE_START + (character & 0xff)
    : RTL_TEXTENC_UNICODE_REPLACEMENT_CHARACTER;
}
