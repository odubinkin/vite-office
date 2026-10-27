/** @fileoverview Current single-byte data owners from sal/textenc/tables.cxx. */
import {
  RTL_TEXTENCODING_APPLE_CHINSIMP,
  RTL_TEXTENCODING_APPLE_CHINTRAD,
  RTL_TEXTENCODING_APPLE_JAPANESE,
  RTL_TEXTENCODING_APPLE_KOREAN,
  RTL_TEXTENCODING_EUC_CN,
  RTL_TEXTENCODING_EUC_JP,
  RTL_TEXTENCODING_EUC_KR,
  RTL_TEXTENCODING_ISCII_DEVANAGARI,
  RTL_TEXTENCODING_JIS_X_0201,
  RTL_TEXTENCODING_ISO_2022_JP,
  RTL_TEXTENCODING_ISO_2022_KR,
  RTL_TEXTENCODING_MS_1361,
  RTL_TEXTENCODING_MS_932,
  RTL_TEXTENCODING_MS_936,
  RTL_TEXTENCODING_MS_949,
  RTL_TEXTENCODING_MS_950,
  RTL_TEXTENCODING_SYMBOL,
  RTL_TEXTENCODING_UTF7,
  RTL_TEXTENCODING_UTF8,
  type rtl_TextEncoding,
} from "../inc/rtl/textenc";

import { aImplAPPLEJAPANESEDBCSCvtData } from "./tcvtjp6.applejapanese";
import { aImplEUCJPCvtData } from "./tcvtjp6.eucjp";
import { aImplMS932DBCSCvtData } from "./tcvtjp6.ms932";
import { aImplJOHABDBCSCvtData } from "./tcvtkr6.johab";
import { aImplKSC5601DBCSCvtData, aImplMS949DBCSCvtData } from "./tcvtkr6.ms949";

import { aImplAPPLECHINSIMPDBCSCvtData } from "./tcvtscn6.applechinsimp";
import { aImplGB2312DBCSCvtData } from "./tcvtscn6.gb2312";
import { aImplMS936DBCSCvtData } from "./tcvtscn6.ms936";
import { aImplAPPLECHINTRADDBCSCvtData } from "./tcvttcn6.applechintrad";
import { aImplMS950DBCSCvtData } from "./tcvttcn6.ms950";
import type { ImplByteConvertData, ImplDBCSConvertData, ImplEUCJPConvertData } from "./tenchelp";

/** Returns the existing single-byte converter data for the represented encoding.  @param encoding - Encoding. @returns The ImplByteConvertData | undefined result. */
export function getSingleByteConvertData(
  encoding: rtl_TextEncoding,
): ImplByteConvertData | undefined {
  return Impl_getByteConvertData(encoding) ?? undefined;
}

/** Preserves distinct Symbol, UTF-8, UTF-7, multibyte, and single-byte converter dispatch.  @param encoding - Encoding. @returns The | Readonly<{ kind: "symbol" }>
  | Readonly<{ kind: "utf8" }>
  | Readonly<{ kind: "utf7" }>
  | Readonly<{ kind: "eucjp"; data: ImplEUCJPConvertData }>
  | Readonly<{ kind: "iscii" }>
  | Readonly<{ kind: "iso2022jp" }>
  | Readonly<{ kind: "iso2022kr" }>
  | Readonly<{ kind: "dbcs"; data: ImplDBCSConvertData }>
  | Readonly<{ kind: "single-byte"; data: ImplByteConvertData; textToUnicode?: null }>
  | undefined result. */
export function getTextToUnicodeData(
  encoding: rtl_TextEncoding,
):
  | Readonly<{ kind: "symbol" }>
  | Readonly<{ kind: "utf8" }>
  | Readonly<{ kind: "utf7" }>
  | Readonly<{ kind: "eucjp"; data: ImplEUCJPConvertData }>
  | Readonly<{ kind: "iscii" }>
  | Readonly<{ kind: "iso2022jp" }>
  | Readonly<{ kind: "iso2022kr" }>
  | Readonly<{ kind: "dbcs"; data: ImplDBCSConvertData }>
  | Readonly<{ kind: "single-byte"; data: ImplByteConvertData; textToUnicode?: null }>
  | undefined {
  encoding &= 0xffff;
  if (encoding === RTL_TEXTENCODING_SYMBOL) return { kind: "symbol" };
  if (encoding === RTL_TEXTENCODING_UTF8) return { kind: "utf8" };
  if (encoding === RTL_TEXTENCODING_UTF7) return { kind: "utf7" };
  if (encoding === RTL_TEXTENCODING_EUC_JP) return { kind: "eucjp", data: aImplEUCJPCvtData };
  if (encoding === RTL_TEXTENCODING_ISCII_DEVANAGARI) return { kind: "iscii" };
  if (encoding === RTL_TEXTENCODING_ISO_2022_JP) return { kind: "iso2022jp" };
  if (encoding === RTL_TEXTENCODING_ISO_2022_KR) return { kind: "iso2022kr" };
  if (encoding === RTL_TEXTENCODING_MS_932) return { kind: "dbcs", data: aImplMS932DBCSCvtData };
  if (encoding === RTL_TEXTENCODING_APPLE_JAPANESE)
    return { kind: "dbcs", data: aImplAPPLEJAPANESEDBCSCvtData };
  if (encoding === RTL_TEXTENCODING_MS_936) return { kind: "dbcs", data: aImplMS936DBCSCvtData };
  if (encoding === RTL_TEXTENCODING_EUC_CN) return { kind: "dbcs", data: aImplGB2312DBCSCvtData };
  if (encoding === RTL_TEXTENCODING_APPLE_CHINSIMP)
    return { kind: "dbcs", data: aImplAPPLECHINSIMPDBCSCvtData };
  if (encoding === RTL_TEXTENCODING_MS_949) return { kind: "dbcs", data: aImplMS949DBCSCvtData };
  if (encoding === RTL_TEXTENCODING_EUC_KR) return { kind: "dbcs", data: aImplKSC5601DBCSCvtData };
  if (encoding === RTL_TEXTENCODING_APPLE_KOREAN)
    return { kind: "dbcs", data: aImplMS949DBCSCvtData };
  if (encoding === RTL_TEXTENCODING_MS_950) return { kind: "dbcs", data: aImplMS950DBCSCvtData };
  if (encoding === RTL_TEXTENCODING_APPLE_CHINTRAD)
    return { kind: "dbcs", data: aImplAPPLECHINTRADDBCSCvtData };
  if (encoding === RTL_TEXTENCODING_MS_1361) return { kind: "dbcs", data: aImplJOHABDBCSCvtData };
  const data = getSingleByteConvertData(encoding);
  return data === undefined
    ? undefined
    : encoding === RTL_TEXTENCODING_JIS_X_0201
      ? { kind: "single-byte", data, textToUnicode: null }
      : { kind: "single-byte", data };
}

import descriptors from "./native-singlebyte-descriptors.json" with { type: "json" };

const originalDescriptors: Readonly<Record<string, ImplByteConvertData>> = descriptors;

/** Gets a native single-byte converter descriptor. Multibyte and contextual table owners are separate. @param encoding - Original rtl_TextEncoding ID. @returns Source descriptor or null. */
export function Impl_getByteConvertData(encoding: rtl_TextEncoding): ImplByteConvertData | null {
  return originalDescriptors[String(encoding & 0xffff)] ?? null;
}
