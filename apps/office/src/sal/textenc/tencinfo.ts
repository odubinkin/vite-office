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
