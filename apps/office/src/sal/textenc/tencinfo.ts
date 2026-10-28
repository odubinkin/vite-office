/** @fileoverview Windows code-page lookup from sal/textenc/tencinfo.cxx. */
import {
  RTL_TEXTENCODING_APPLE_ARABIC,
  RTL_TEXTENCODING_APPLE_CENTEURO,
  RTL_TEXTENCODING_APPLE_CHINSIMP,
  RTL_TEXTENCODING_APPLE_CHINTRAD,
  RTL_TEXTENCODING_APPLE_CROATIAN,
  RTL_TEXTENCODING_APPLE_CYRILLIC,
  RTL_TEXTENCODING_APPLE_GREEK,
  RTL_TEXTENCODING_APPLE_HEBREW,
  RTL_TEXTENCODING_APPLE_ICELAND,
  RTL_TEXTENCODING_APPLE_JAPANESE,
  RTL_TEXTENCODING_APPLE_KOREAN,
  RTL_TEXTENCODING_APPLE_ROMAN,
  RTL_TEXTENCODING_APPLE_ROMANIAN,
  RTL_TEXTENCODING_APPLE_TURKISH,
  RTL_TEXTENCODING_APPLE_UKRAINIAN,
  RTL_TEXTENCODING_ASCII_US,
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_EUC_CN,
  RTL_TEXTENCODING_EUC_JP,
  RTL_TEXTENCODING_EUC_KR,
  RTL_TEXTENCODING_IBM_437,
  RTL_TEXTENCODING_IBM_737,
  RTL_TEXTENCODING_IBM_775,
  RTL_TEXTENCODING_IBM_850,
  RTL_TEXTENCODING_IBM_852,
  RTL_TEXTENCODING_IBM_855,
  RTL_TEXTENCODING_IBM_857,
  RTL_TEXTENCODING_IBM_860,
  RTL_TEXTENCODING_IBM_861,
  RTL_TEXTENCODING_IBM_862,
  RTL_TEXTENCODING_IBM_863,
  RTL_TEXTENCODING_IBM_864,
  RTL_TEXTENCODING_IBM_865,
  RTL_TEXTENCODING_IBM_866,
  RTL_TEXTENCODING_IBM_869,
  RTL_TEXTENCODING_ISCII_DEVANAGARI,
  RTL_TEXTENCODING_ISO_2022_JP,
  RTL_TEXTENCODING_ISO_2022_KR,
  RTL_TEXTENCODING_ISO_8859_1,
  RTL_TEXTENCODING_ISO_8859_15,
  RTL_TEXTENCODING_ISO_8859_2,
  RTL_TEXTENCODING_ISO_8859_3,
  RTL_TEXTENCODING_ISO_8859_4,
  RTL_TEXTENCODING_ISO_8859_5,
  RTL_TEXTENCODING_ISO_8859_6,
  RTL_TEXTENCODING_ISO_8859_7,
  RTL_TEXTENCODING_ISO_8859_8,
  RTL_TEXTENCODING_ISO_8859_9,
  RTL_TEXTENCODING_KOI8_R,
  RTL_TEXTENCODING_KOI8_U,
  RTL_TEXTENCODING_MAZOVIA,
  RTL_TEXTENCODING_MS_1250,
  RTL_TEXTENCODING_MS_1251,
  RTL_TEXTENCODING_MS_1252,
  RTL_TEXTENCODING_MS_1253,
  RTL_TEXTENCODING_MS_1254,
  RTL_TEXTENCODING_MS_1255,
  RTL_TEXTENCODING_MS_1256,
  RTL_TEXTENCODING_MS_1257,
  RTL_TEXTENCODING_MS_1258,
  RTL_TEXTENCODING_MS_1361,
  RTL_TEXTENCODING_MS_874,
  RTL_TEXTENCODING_MS_932,
  RTL_TEXTENCODING_MS_936,
  RTL_TEXTENCODING_MS_949,
  RTL_TEXTENCODING_MS_950,
  RTL_TEXTENCODING_SYMBOL,
  RTL_TEXTENCODING_UTF7,
  RTL_TEXTENCODING_UTF8,
  type rtl_TextEncoding,
} from "../inc/rtl/textenc";

/** Original rtl_getTextEncodingFromWindowsCodePage switch, including unknown fallback.  @param codepage - Codepage. @returns The rtl_TextEncoding result. */
export function rtl_getTextEncodingFromWindowsCodePage(codepage: number): rtl_TextEncoding {
  switch (codepage) {
    case 42:
      return RTL_TEXTENCODING_SYMBOL;
    case 437:
      return RTL_TEXTENCODING_IBM_437;
    case 708:
      return RTL_TEXTENCODING_ISO_8859_6;
    case 737:
      return RTL_TEXTENCODING_IBM_737;
    case 775:
      return RTL_TEXTENCODING_IBM_775;
    case 850:
      return RTL_TEXTENCODING_IBM_850;
    case 852:
      return RTL_TEXTENCODING_IBM_852;
    case 855:
      return RTL_TEXTENCODING_IBM_855;
    case 857:
      return RTL_TEXTENCODING_IBM_857;
    case 860:
      return RTL_TEXTENCODING_IBM_860;
    case 861:
      return RTL_TEXTENCODING_IBM_861;
    case 862:
      return RTL_TEXTENCODING_IBM_862;
    case 863:
      return RTL_TEXTENCODING_IBM_863;
    case 864:
      return RTL_TEXTENCODING_IBM_864;
    case 865:
      return RTL_TEXTENCODING_IBM_865;
    case 866:
      return RTL_TEXTENCODING_IBM_866;
    case 869:
      return RTL_TEXTENCODING_IBM_869;
    case 874:
      return RTL_TEXTENCODING_MS_874;
    case 932:
      return RTL_TEXTENCODING_MS_932;
    case 936:
      return RTL_TEXTENCODING_MS_936;
    case 949:
      return RTL_TEXTENCODING_MS_949;
    case 950:
      return RTL_TEXTENCODING_MS_950;
    case 1250:
      return RTL_TEXTENCODING_MS_1250;
    case 1251:
      return RTL_TEXTENCODING_MS_1251;
    case 1252:
      return RTL_TEXTENCODING_MS_1252;
    case 1253:
      return RTL_TEXTENCODING_MS_1253;
    case 1254:
      return RTL_TEXTENCODING_MS_1254;
    case 1255:
      return RTL_TEXTENCODING_MS_1255;
    case 1256:
      return RTL_TEXTENCODING_MS_1256;
    case 1257:
      return RTL_TEXTENCODING_MS_1257;
    case 1258:
      return RTL_TEXTENCODING_MS_1258;
    case 1361:
      return RTL_TEXTENCODING_MS_1361;
    case 10000:
      return RTL_TEXTENCODING_APPLE_ROMAN;
    case 10001:
      return RTL_TEXTENCODING_APPLE_JAPANESE;
    case 10002:
      return RTL_TEXTENCODING_APPLE_CHINTRAD;
    case 10003:
      return RTL_TEXTENCODING_APPLE_KOREAN;
    case 10004:
      return RTL_TEXTENCODING_APPLE_ARABIC;
    case 10005:
      return RTL_TEXTENCODING_APPLE_HEBREW;
    case 10006:
      return RTL_TEXTENCODING_APPLE_GREEK;
    case 10007:
      return RTL_TEXTENCODING_APPLE_CYRILLIC;
    case 10008:
      return RTL_TEXTENCODING_APPLE_CHINSIMP;
    case 10010:
      return RTL_TEXTENCODING_APPLE_ROMANIAN;
    case 10017:
      return RTL_TEXTENCODING_APPLE_UKRAINIAN;
    case 10029:
      return RTL_TEXTENCODING_APPLE_CENTEURO;
    case 10079:
      return RTL_TEXTENCODING_APPLE_ICELAND;
    case 10081:
      return RTL_TEXTENCODING_APPLE_TURKISH;
    case 10082:
      return RTL_TEXTENCODING_APPLE_CROATIAN;
    case 20127:
      return RTL_TEXTENCODING_ASCII_US;
    case 20866:
      return RTL_TEXTENCODING_KOI8_R;
    case 21866:
      return RTL_TEXTENCODING_KOI8_U;
    case 28591:
      return RTL_TEXTENCODING_ISO_8859_1;
    case 28592:
      return RTL_TEXTENCODING_ISO_8859_2;
    case 28593:
      return RTL_TEXTENCODING_ISO_8859_3;
    case 28594:
      return RTL_TEXTENCODING_ISO_8859_4;
    case 28595:
      return RTL_TEXTENCODING_ISO_8859_5;
    case 28596:
      return RTL_TEXTENCODING_ISO_8859_6;
    case 28597:
      return RTL_TEXTENCODING_ISO_8859_7;
    case 28598:
      return RTL_TEXTENCODING_ISO_8859_8;
    case 28599:
      return RTL_TEXTENCODING_ISO_8859_9;
    case 28605:
      return RTL_TEXTENCODING_ISO_8859_15;
    case 50220:
      return RTL_TEXTENCODING_ISO_2022_JP;
    case 50225:
      return RTL_TEXTENCODING_ISO_2022_KR;
    case 51932:
      return RTL_TEXTENCODING_EUC_JP;
    case 51936:
      return RTL_TEXTENCODING_EUC_CN;
    case 51949:
      return RTL_TEXTENCODING_EUC_KR;
    case 57002:
      return RTL_TEXTENCODING_ISCII_DEVANAGARI;
    case 65000:
      return RTL_TEXTENCODING_UTF7;
    case 65001:
      return RTL_TEXTENCODING_UTF8;
    default:
      return RTL_TEXTENCODING_DONTKNOW;
  }
}

/** @fileoverview Original best-Windows-charset query over the pinned ImplTextEncodingData metadata. Full locale table metadata is bound without simulating converter functions or shared-library loading. */
import charsets from "./windows-charsets.json" with { type: "json" };
const data: Readonly<Record<number, number>> = charsets;
/** Native metadata query returns charset1 when no encoding data exists. @param encoding - Original unsigned16 identifier. @returns Windows charset byte. */
export function rtl_getBestWindowsCharsetFromTextEncoding(encoding: rtl_TextEncoding): number {
  return data[encoding & 0xffff] ?? 1;
}

/** @fileoverview rtl_getTextEncodingInfo over pinned metadata for the represented SAL converters. */
import sourceInfo from "./native-text-encoding-info.json" with { type: "json" };

/** Source rtl/tencinfo.h flag for stateful encodings. */
export const RTL_TEXTENCODING_INFO_CONTEXT = 0x01;
/** Source rtl/tencinfo.h ASCII-superset flag. */
export const RTL_TEXTENCODING_INFO_ASCII = 0x02;

/** Represented source rtl_TextEncodingInfo fields. */
export interface rtl_TextEncodingInfo {
  StructSize: number;
  MinimumCharSize: number;
  MaximumCharSize: number;
  AverageCharSize: number;
  Flags: number;
}

const nativeInfo: Readonly<Record<string, Omit<rtl_TextEncodingInfo, "StructSize">>> = sourceInfo;

/** Original size-gated field writes and missing-data fallback for represented encoding data. @param encoding - SAL encoding ID. @param info - Mutable output struct. @returns Whether source metadata exists, except early struct-size success. */
export function rtl_getTextEncodingInfo(
  encoding: rtl_TextEncoding,
  info: rtl_TextEncodingInfo,
): boolean {
  const source = nativeInfo[String(encoding & 0xffff)];
  if (info.StructSize < 5) return false;
  info.MinimumCharSize = source?.MinimumCharSize ?? 1;
  if (info.StructSize < 6) return true;
  info.MaximumCharSize = source?.MaximumCharSize ?? 1;
  if (info.StructSize < 7) return true;
  info.AverageCharSize = source?.AverageCharSize ?? 1;
  if (info.StructSize < 12) return true;
  info.Flags = source?.Flags ?? 0;
  return source !== undefined;
}

/** Native octet-encoding range, including the reserved SYSTEM hole. @param encoding - Unsigned native encoding ID. @returns Whether the ID denotes an octet encoding. */
export function rtl_isOctetTextEncoding(encoding: rtl_TextEncoding): boolean {
  const value = encoding & 0xffff;
  return value > RTL_TEXTENCODING_DONTKNOW && value !== 9 && value <= RTL_TEXTENCODING_MAZOVIA;
}

/** Complete original Windows charset switch, including the unknown default. @param charset - Native unsigned byte. @returns Native encoding ID. */
export function rtl_getTextEncodingFromWindowsCharset(charset: number): rtl_TextEncoding {
  switch (charset & 0xff) {
    case 0:
      return RTL_TEXTENCODING_MS_1252;
    case 2:
      return RTL_TEXTENCODING_SYMBOL;
    case 77:
      return RTL_TEXTENCODING_APPLE_ROMAN;
    case 128:
      return RTL_TEXTENCODING_MS_932;
    case 129:
      return RTL_TEXTENCODING_MS_949;
    case 130:
      return RTL_TEXTENCODING_MS_1361;
    case 134:
      return RTL_TEXTENCODING_MS_936;
    case 136:
      return RTL_TEXTENCODING_MS_950;
    case 161:
      return RTL_TEXTENCODING_MS_1253;
    case 162:
      return RTL_TEXTENCODING_MS_1254;
    case 163:
      return RTL_TEXTENCODING_MS_1258;
    case 177:
      return RTL_TEXTENCODING_MS_1255;
    case 178:
      return RTL_TEXTENCODING_MS_1256;
    case 186:
      return RTL_TEXTENCODING_MS_1257;
    case 204:
      return RTL_TEXTENCODING_MS_1251;
    case 222:
      return RTL_TEXTENCODING_MS_874;
    case 238:
      return RTL_TEXTENCODING_MS_1250;
    case 255:
      return RTL_TEXTENCODING_IBM_850;
    default:
      return RTL_TEXTENCODING_DONTKNOW;
  }
}

/** Original rtl/tencinfo.h UNICODE metadata flag. */
export const RTL_TEXTENCODING_INFO_UNICODE = 0x00000004;

/** Original rtl/tencinfo.h MULTIBYTE metadata flag. */
export const RTL_TEXTENCODING_INFO_MULTIBYTE = 0x00000008;

/** Original rtl/tencinfo.h R2L metadata flag. */
export const RTL_TEXTENCODING_INFO_R2L = 0x00000010;

/** Original rtl/tencinfo.h 7BIT metadata flag. */
export const RTL_TEXTENCODING_INFO_7BIT = 0x00000020;

/** Original rtl/tencinfo.h SYMBOL metadata flag. */
export const RTL_TEXTENCODING_INFO_SYMBOL = 0x00000040;

/** Original rtl/tencinfo.h MIME metadata flag. */
export const RTL_TEXTENCODING_INFO_MIME = 0x00000080;

import * as E from "../inc/rtl/textenc";
/** Original ordered aVIPMimeCharsetTab entries, including source duplicates. */
const aVIPMimeCharsetTab: readonly (readonly [string, E.rtl_TextEncoding])[] = [
  ["usascii", E.RTL_TEXTENCODING_ASCII_US],
  ["utf8", E.RTL_TEXTENCODING_UTF8],
  ["utf7", E.RTL_TEXTENCODING_UTF7],
  ["iso88591", E.RTL_TEXTENCODING_ISO_8859_1],
  ["iso88592", E.RTL_TEXTENCODING_ISO_8859_2],
  ["iso88593", E.RTL_TEXTENCODING_ISO_8859_3],
  ["iso88594", E.RTL_TEXTENCODING_ISO_8859_4],
  ["iso88595", E.RTL_TEXTENCODING_ISO_8859_5],
  ["iso88596", E.RTL_TEXTENCODING_ISO_8859_6],
  ["iso88597", E.RTL_TEXTENCODING_ISO_8859_7],
  ["iso88598", E.RTL_TEXTENCODING_ISO_8859_8],
  ["iso88599", E.RTL_TEXTENCODING_ISO_8859_9],
  ["iso885910", E.RTL_TEXTENCODING_ISO_8859_10],
  ["iso885913", E.RTL_TEXTENCODING_ISO_8859_13],
  ["iso885914", E.RTL_TEXTENCODING_ISO_8859_14],
  ["iso885915", E.RTL_TEXTENCODING_ISO_8859_15],
  ["iso2022jp", E.RTL_TEXTENCODING_ISO_2022_JP],
  ["iso2022jp2", E.RTL_TEXTENCODING_ISO_2022_JP],
  ["iso2022cn", E.RTL_TEXTENCODING_ISO_2022_CN],
  ["iso2022cnext", E.RTL_TEXTENCODING_ISO_2022_CN],
  ["iso2022kr", E.RTL_TEXTENCODING_ISO_2022_KR],
  ["eucjp", E.RTL_TEXTENCODING_EUC_JP],
  ["shiftjis", E.RTL_TEXTENCODING_SHIFT_JIS],
  ["mskanji", E.RTL_TEXTENCODING_MS_932],
  ["gb2312", E.RTL_TEXTENCODING_GB_2312],
  ["cngb", E.RTL_TEXTENCODING_GB_2312],
  ["big5", E.RTL_TEXTENCODING_BIG5],
  ["cnbig5", E.RTL_TEXTENCODING_BIG5],
  ["cngb12345", E.RTL_TEXTENCODING_GBT_12345],
  ["euckr", E.RTL_TEXTENCODING_EUC_KR],
  ["koi8r", E.RTL_TEXTENCODING_KOI8_R],
  ["windows1252", E.RTL_TEXTENCODING_MS_1252],
  ["windows1250", E.RTL_TEXTENCODING_MS_1250],
  ["windows1251", E.RTL_TEXTENCODING_MS_1251],
  ["windows1253", E.RTL_TEXTENCODING_MS_1253],
  ["windows1254", E.RTL_TEXTENCODING_MS_1254],
  ["windows1255", E.RTL_TEXTENCODING_MS_1255],
  ["windows1256", E.RTL_TEXTENCODING_MS_1256],
  ["windows1257", E.RTL_TEXTENCODING_MS_1257],
  ["windows1258", E.RTL_TEXTENCODING_MS_1258],
];
/** Original ordered aMimeCharsetTab entries, including source duplicates. */
const aMimeCharsetTab: readonly (readonly [string, E.rtl_TextEncoding])[] = [
  ["unicode11utf7", E.RTL_TEXTENCODING_UTF7],
  ["caunicode11utf7", E.RTL_TEXTENCODING_UTF7],
  ["iso88591windows30", E.RTL_TEXTENCODING_ISO_8859_1],
  ["iso88591win", E.RTL_TEXTENCODING_MS_1252],
  ["iso88592win", E.RTL_TEXTENCODING_MS_1250],
  ["iso88599win", E.RTL_TEXTENCODING_MS_1254],
  ["iso885915", E.RTL_TEXTENCODING_ISO_8859_15],
  ["iso885914", E.RTL_TEXTENCODING_ISO_8859_14],
  ["iso885913", E.RTL_TEXTENCODING_ISO_8859_13],
  ["iso885911", E.RTL_TEXTENCODING_TIS_620],
  ["iso885910", E.RTL_TEXTENCODING_ISO_8859_10],
  ["iso88591", E.RTL_TEXTENCODING_ISO_8859_1],
  ["iso88592", E.RTL_TEXTENCODING_ISO_8859_2],
  ["iso88593", E.RTL_TEXTENCODING_ISO_8859_3],
  ["iso88594", E.RTL_TEXTENCODING_ISO_8859_4],
  ["iso88595", E.RTL_TEXTENCODING_ISO_8859_5],
  ["iso88596", E.RTL_TEXTENCODING_ISO_8859_6],
  ["iso88597", E.RTL_TEXTENCODING_ISO_8859_7],
  ["iso88598", E.RTL_TEXTENCODING_ISO_8859_8],
  ["iso88599", E.RTL_TEXTENCODING_ISO_8859_9],
  ["isoir100", E.RTL_TEXTENCODING_ISO_8859_1],
  ["latin1", E.RTL_TEXTENCODING_ISO_8859_1],
  ["l1", E.RTL_TEXTENCODING_ISO_8859_1],
  ["cp819", E.RTL_TEXTENCODING_ISO_8859_1],
  ["ibm819", E.RTL_TEXTENCODING_ISO_8859_1],
  ["csisolatin1", E.RTL_TEXTENCODING_ISO_8859_1],
  ["isoir101", E.RTL_TEXTENCODING_ISO_8859_2],
  ["latin2", E.RTL_TEXTENCODING_ISO_8859_2],
  ["l2", E.RTL_TEXTENCODING_ISO_8859_2],
  ["csisolatin2", E.RTL_TEXTENCODING_ISO_8859_2],
  ["isoir109", E.RTL_TEXTENCODING_ISO_8859_3],
  ["latin3", E.RTL_TEXTENCODING_ISO_8859_3],
  ["l3", E.RTL_TEXTENCODING_ISO_8859_3],
  ["csisolatin3", E.RTL_TEXTENCODING_ISO_8859_3],
  ["isoir110", E.RTL_TEXTENCODING_ISO_8859_4],
  ["latin4", E.RTL_TEXTENCODING_ISO_8859_4],
  ["l4", E.RTL_TEXTENCODING_ISO_8859_4],
  ["csisolatin4", E.RTL_TEXTENCODING_ISO_8859_4],
  ["isoir144", E.RTL_TEXTENCODING_ISO_8859_5],
  ["cyrillicasian", E.RTL_TEXTENCODING_PT154],
  ["cyrillic", E.RTL_TEXTENCODING_ISO_8859_5],
  ["csisolatincyrillic", E.RTL_TEXTENCODING_ISO_8859_5],
  ["isoir127", E.RTL_TEXTENCODING_ISO_8859_6],
  ["arabic", E.RTL_TEXTENCODING_ISO_8859_6],
  ["csisolatinarabic", E.RTL_TEXTENCODING_ISO_8859_6],
  ["ecma114", E.RTL_TEXTENCODING_ISO_8859_6],
  ["asmo708", E.RTL_TEXTENCODING_ISO_8859_6],
  ["isoir126", E.RTL_TEXTENCODING_ISO_8859_7],
  ["greek", E.RTL_TEXTENCODING_ISO_8859_7],
  ["csisolatingreek", E.RTL_TEXTENCODING_ISO_8859_7],
  ["elot928", E.RTL_TEXTENCODING_ISO_8859_7],
  ["ecma118", E.RTL_TEXTENCODING_ISO_8859_7],
  ["isoir138", E.RTL_TEXTENCODING_ISO_8859_8],
  ["hebrew", E.RTL_TEXTENCODING_ISO_8859_8],
  ["csisolatinhebrew", E.RTL_TEXTENCODING_ISO_8859_8],
  ["isoir148", E.RTL_TEXTENCODING_ISO_8859_9],
  ["latin5", E.RTL_TEXTENCODING_ISO_8859_9],
  ["l5", E.RTL_TEXTENCODING_ISO_8859_9],
  ["csisolatin5", E.RTL_TEXTENCODING_ISO_8859_9],
  ["cswindows30latin1", E.RTL_TEXTENCODING_ISO_8859_1],
  ["cswindows30latin1", E.RTL_TEXTENCODING_ISO_8859_1],
  ["cswindows31latin1", E.RTL_TEXTENCODING_MS_1252],
  ["cswindows31latin2", E.RTL_TEXTENCODING_MS_1250],
  ["cswindows31latin5", E.RTL_TEXTENCODING_MS_1254],
  ["iso10646us", E.RTL_TEXTENCODING_ASCII_US],
  ["iso646irv", E.RTL_TEXTENCODING_ASCII_US],
  ["cskoi8r", E.RTL_TEXTENCODING_KOI8_R],
  ["ibm437", E.RTL_TEXTENCODING_IBM_437],
  ["cp437", E.RTL_TEXTENCODING_IBM_437],
  ["437", E.RTL_TEXTENCODING_IBM_437],
  ["cspc8codepage437", E.RTL_TEXTENCODING_IBM_437],
  ["ansix34", E.RTL_TEXTENCODING_ASCII_US],
  ["ibm367", E.RTL_TEXTENCODING_ASCII_US],
  ["cp367", E.RTL_TEXTENCODING_ASCII_US],
  ["csascii", E.RTL_TEXTENCODING_ASCII_US],
  ["ibm775", E.RTL_TEXTENCODING_IBM_775],
  ["cp775", E.RTL_TEXTENCODING_IBM_775],
  ["cspc775baltic", E.RTL_TEXTENCODING_IBM_775],
  ["ibm850", E.RTL_TEXTENCODING_IBM_850],
  ["cp850", E.RTL_TEXTENCODING_IBM_850],
  ["850", E.RTL_TEXTENCODING_IBM_850],
  ["cspc850multilingual", E.RTL_TEXTENCODING_IBM_850],
  ["ibm852", E.RTL_TEXTENCODING_IBM_852],
  ["cp852", E.RTL_TEXTENCODING_IBM_852],
  ["852", E.RTL_TEXTENCODING_IBM_852],
  ["cspcp852", E.RTL_TEXTENCODING_IBM_852],
  ["ibm855", E.RTL_TEXTENCODING_IBM_855],
  ["cp855", E.RTL_TEXTENCODING_IBM_855],
  ["855", E.RTL_TEXTENCODING_IBM_855],
  ["csibm855", E.RTL_TEXTENCODING_IBM_855],
  ["ibm857", E.RTL_TEXTENCODING_IBM_857],
  ["cp857", E.RTL_TEXTENCODING_IBM_857],
  ["857", E.RTL_TEXTENCODING_IBM_857],
  ["csibm857", E.RTL_TEXTENCODING_IBM_857],
  ["ibm860", E.RTL_TEXTENCODING_IBM_860],
  ["cp860", E.RTL_TEXTENCODING_IBM_860],
  ["860", E.RTL_TEXTENCODING_IBM_860],
  ["csibm860", E.RTL_TEXTENCODING_IBM_860],
  ["ibm861", E.RTL_TEXTENCODING_IBM_861],
  ["cp861", E.RTL_TEXTENCODING_IBM_861],
  ["861", E.RTL_TEXTENCODING_IBM_861],
  ["csis", E.RTL_TEXTENCODING_IBM_861],
  ["csibm861", E.RTL_TEXTENCODING_IBM_861],
  ["ibm862", E.RTL_TEXTENCODING_IBM_862],
  ["cp862", E.RTL_TEXTENCODING_IBM_862],
  ["862", E.RTL_TEXTENCODING_IBM_862],
  ["cspc862latinhebrew", E.RTL_TEXTENCODING_IBM_862],
  ["ibm863", E.RTL_TEXTENCODING_IBM_863],
  ["cp863", E.RTL_TEXTENCODING_IBM_863],
  ["863", E.RTL_TEXTENCODING_IBM_863],
  ["csibm863", E.RTL_TEXTENCODING_IBM_863],
  ["ibm864", E.RTL_TEXTENCODING_IBM_864],
  ["cp864", E.RTL_TEXTENCODING_IBM_864],
  ["864", E.RTL_TEXTENCODING_IBM_864],
  ["csibm864", E.RTL_TEXTENCODING_IBM_864],
  ["ibm865", E.RTL_TEXTENCODING_IBM_865],
  ["cp865", E.RTL_TEXTENCODING_IBM_865],
  ["865", E.RTL_TEXTENCODING_IBM_865],
  ["csibm865", E.RTL_TEXTENCODING_IBM_865],
  ["ibm866", E.RTL_TEXTENCODING_IBM_866],
  ["cp866", E.RTL_TEXTENCODING_IBM_866],
  ["866", E.RTL_TEXTENCODING_IBM_866],
  ["csibm866", E.RTL_TEXTENCODING_IBM_866],
  ["ibm869", E.RTL_TEXTENCODING_IBM_869],
  ["cp869", E.RTL_TEXTENCODING_IBM_869],
  ["869", E.RTL_TEXTENCODING_IBM_869],
  ["cpgr", E.RTL_TEXTENCODING_IBM_869],
  ["csibm869", E.RTL_TEXTENCODING_IBM_869],
  ["ibm869", E.RTL_TEXTENCODING_IBM_869],
  ["cp869", E.RTL_TEXTENCODING_IBM_869],
  ["869", E.RTL_TEXTENCODING_IBM_869],
  ["cpgr", E.RTL_TEXTENCODING_IBM_869],
  ["csibm869", E.RTL_TEXTENCODING_IBM_869],
  ["mac", E.RTL_TEXTENCODING_APPLE_ROMAN],
  ["csmacintosh", E.RTL_TEXTENCODING_APPLE_ROMAN],
  ["shiftjis", E.RTL_TEXTENCODING_SHIFT_JIS],
  ["mskanji", E.RTL_TEXTENCODING_MS_932],
  ["csshiftjis", E.RTL_TEXTENCODING_SHIFT_JIS],
  ["jisx0208", E.RTL_TEXTENCODING_JIS_X_0208],
  ["jisc62261983", E.RTL_TEXTENCODING_JIS_X_0208],
  ["csiso87jisx0208", E.RTL_TEXTENCODING_JIS_X_0208],
  ["isoir86", E.RTL_TEXTENCODING_JIS_X_0208],
  ["x0208", E.RTL_TEXTENCODING_JIS_X_0208],
  ["jisx0201", E.RTL_TEXTENCODING_JIS_X_0201],
  ["cshalfwidthkatakana", E.RTL_TEXTENCODING_JIS_X_0201],
  ["x0201", E.RTL_TEXTENCODING_JIS_X_0201],
  ["jisx0212", E.RTL_TEXTENCODING_JIS_X_0212],
  ["csiso159jisx0212", E.RTL_TEXTENCODING_JIS_X_0212],
  ["isoir159", E.RTL_TEXTENCODING_JIS_X_0208],
  ["x0212", E.RTL_TEXTENCODING_JIS_X_0212],
  ["isoir6", E.RTL_TEXTENCODING_ASCII_US],
  ["xsjis", E.RTL_TEXTENCODING_SHIFT_JIS],
  ["sjis", E.RTL_TEXTENCODING_SHIFT_JIS],
  ["ascii", E.RTL_TEXTENCODING_ASCII_US],
  ["us", E.RTL_TEXTENCODING_ASCII_US],
  ["gb180302000", E.RTL_TEXTENCODING_GB_18030],
  ["gb18030", E.RTL_TEXTENCODING_GB_18030],
  ["big5hkscs", E.RTL_TEXTENCODING_BIG5_HKSCS],
  ["tis620", E.RTL_TEXTENCODING_TIS_620],
  ["gbk", E.RTL_TEXTENCODING_GBK],
  ["cp936", E.RTL_TEXTENCODING_GBK],
  ["ms936", E.RTL_TEXTENCODING_GBK],
  ["windows936", E.RTL_TEXTENCODING_GBK],
  ["cp874", E.RTL_TEXTENCODING_MS_874],
  ["ms874", E.RTL_TEXTENCODING_MS_874],
  ["windows874", E.RTL_TEXTENCODING_MS_874],
  ["koi8u", E.RTL_TEXTENCODING_KOI8_U],
  ["cpis", E.RTL_TEXTENCODING_IBM_861],
  ["ksc56011987", E.RTL_TEXTENCODING_MS_949],
  ["isoir149", E.RTL_TEXTENCODING_MS_949],
  ["ksc56011989", E.RTL_TEXTENCODING_MS_949],
  ["ksc5601", E.RTL_TEXTENCODING_MS_949],
  ["korean", E.RTL_TEXTENCODING_MS_949],
  ["csksc56011987", E.RTL_TEXTENCODING_MS_949],
  ["latin9", E.RTL_TEXTENCODING_ISO_8859_15],
  ["adobestandardencoding", E.RTL_TEXTENCODING_ADOBE_STANDARD],
  ["csadobestandardencoding", E.RTL_TEXTENCODING_ADOBE_STANDARD],
  ["adobesymbolencoding", E.RTL_TEXTENCODING_ADOBE_SYMBOL],
  ["cshppsmath", E.RTL_TEXTENCODING_ADOBE_SYMBOL],
  ["ptcp154", E.RTL_TEXTENCODING_PT154],
  ["csptcp154", E.RTL_TEXTENCODING_PT154],
  ["pt154", E.RTL_TEXTENCODING_PT154],
  ["cp154", E.RTL_TEXTENCODING_PT154],
  ["xisciide", E.RTL_TEXTENCODING_ISCII_DEVANAGARI],
];

/** Original MIME C-string lookup: at most30 ASCII alphanumerics, exact VIP matches before ordered prefix aliases. @param pMimeCharset - Original NUL-terminated bytes. @returns Native encoding or DONTKNOW. */
export function rtl_getTextEncodingFromMimeCharset(pMimeCharset: Uint8Array): rtl_TextEncoding {
  let charset = "";
  for (let p = 0; pMimeCharset[p] !== 0 && charset.length < 30; ++p) {
    const c = pMimeCharset[p] as number;
    if ((c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122))
      charset += String.fromCharCode(c >= 65 && c <= 90 ? c + 32 : c);
  }
  for (const [name, encoding] of aVIPMimeCharsetTab) if (charset === name) return encoding;
  for (const [name, encoding] of aMimeCharsetTab) if (charset.startsWith(name)) return encoding;
  return RTL_TEXTENCODING_DONTKNOW;
}
