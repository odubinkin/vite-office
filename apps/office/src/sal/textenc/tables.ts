/** @fileoverview Current single-byte data owners from sal/textenc/tables.cxx. */
import type { ImplByteConvertData, ImplDBCSConvertData, ImplEUCJPConvertData } from "./tenchelp";
import {
  RTL_TEXTENCODING_APPLE_CENTEURO,
  RTL_TEXTENCODING_APPLE_CROATIAN,
  RTL_TEXTENCODING_APPLE_CYRILLIC,
  RTL_TEXTENCODING_APPLE_GREEK,
  RTL_TEXTENCODING_APPLE_ICELAND,
  RTL_TEXTENCODING_APPLE_JAPANESE,
  RTL_TEXTENCODING_APPLE_KOREAN,
  RTL_TEXTENCODING_APPLE_CHINSIMP,
  RTL_TEXTENCODING_APPLE_CHINTRAD,
  RTL_TEXTENCODING_APPLE_ROMAN,
  RTL_TEXTENCODING_APPLE_ROMANIAN,
  RTL_TEXTENCODING_APPLE_TURKISH,
  RTL_TEXTENCODING_APPLE_UKRAINIAN,
  RTL_TEXTENCODING_ASCII_US,
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
  RTL_TEXTENCODING_ISO_8859_1,
  RTL_TEXTENCODING_ISO_8859_2,
  RTL_TEXTENCODING_ISO_8859_3,
  RTL_TEXTENCODING_ISO_8859_4,
  RTL_TEXTENCODING_ISO_8859_5,
  RTL_TEXTENCODING_ISO_8859_6,
  RTL_TEXTENCODING_ISO_8859_7,
  RTL_TEXTENCODING_ISO_8859_8,
  RTL_TEXTENCODING_ISO_8859_9,
  RTL_TEXTENCODING_ISO_8859_15,
  RTL_TEXTENCODING_ISCII_DEVANAGARI,
  RTL_TEXTENCODING_ISO_2022_JP,
  RTL_TEXTENCODING_ISO_2022_KR,
  RTL_TEXTENCODING_KOI8_R,
  RTL_TEXTENCODING_KOI8_U,
  RTL_TEXTENCODING_MS_874,
  RTL_TEXTENCODING_MS_932,
  RTL_TEXTENCODING_MS_936,
  RTL_TEXTENCODING_MS_949,
  RTL_TEXTENCODING_MS_950,
  RTL_TEXTENCODING_MS_1361,
  RTL_TEXTENCODING_MS_1250,
  RTL_TEXTENCODING_MS_1251,
  RTL_TEXTENCODING_MS_1252,
  RTL_TEXTENCODING_MS_1253,
  RTL_TEXTENCODING_MS_1254,
  RTL_TEXTENCODING_MS_1255,
  RTL_TEXTENCODING_MS_1256,
  RTL_TEXTENCODING_MS_1257,
  RTL_TEXTENCODING_MS_1258,
  RTL_TEXTENCODING_SYMBOL,
  RTL_TEXTENCODING_UTF8,
  RTL_TEXTENCODING_UTF7,
  type rtl_TextEncoding,
} from "../inc/rtl/textenc";
import {
  aImplAPPLEICELANDByteCvtData,
  aImplAPPLEROMANByteCvtData,
  aImplIBM437ByteCvtData,
  aImplIBM850ByteCvtData,
  aImplIBM860ByteCvtData,
  aImplIBM861ByteCvtData,
  aImplIBM863ByteCvtData,
  aImplIBM865ByteCvtData,
  aImplISO885915ByteCvtData,
} from "./tcvtlat1";
import {
  aImplIBM737ByteCvtData,
  aImplIBM775ByteCvtData,
  aImplIBM852ByteCvtData,
  aImplIBM855ByteCvtData,
  aImplIBM857ByteCvtData,
  aImplIBM866ByteCvtData,
  aImplIBM869ByteCvtData,
} from "./tcvtest1.ibm";
import {
  aImplMS1250ByteCvtData,
  aImplMS1251ByteCvtData,
  aImplMS1253ByteCvtData,
  aImplMS1254ByteCvtData,
  aImplMS1257ByteCvtData,
} from "./tcvtest1";
import {
  aImplAPPLECENTEUROByteCvtData,
  aImplAPPLECROATIANByteCvtData,
  aImplAPPLECYRILLICByteCvtData,
  aImplAPPLEGREEKByteCvtData,
  aImplAPPLEROMANIANByteCvtData,
  aImplAPPLETURKISHByteCvtData,
  aImplAPPLEUKRAINIANByteCvtData,
} from "./tcvtest1.apple";
import {
  aImplIBM862ByteCvtData,
  aImplIBM864ByteCvtData,
  aImplISO88596ByteCvtData,
  aImplISO88598ByteCvtData,
  aImplMS1255ByteCvtData,
  aImplMS1256ByteCvtData,
} from "./tcvtarb1";
import { aImplMS874ByteCvtData, aImplMS1258ByteCvtData } from "./tcvteas1";
import {
  aImplISO88591ByteCvtData,
  aImplMS1252ByteCvtData,
  aImplUSASCIIByteCvtData,
} from "./textenc";
import {
  aImplISO88592ByteCvtData,
  aImplISO88593ByteCvtData,
  aImplISO88594ByteCvtData,
  aImplISO88595ByteCvtData,
  aImplISO88597ByteCvtData,
  aImplISO88599ByteCvtData,
} from "./tcvtest1.iso";
import { aImplKOI8RByteCvtData, aImplKOI8UByteCvtData } from "./tcvtest1.koi";
import { aImplMS932DBCSCvtData } from "./tcvtjp6.ms932";
import { aImplAPPLEJAPANESEDBCSCvtData } from "./tcvtjp6.applejapanese";
import { aImplEUCJPCvtData } from "./tcvtjp6.eucjp";
import { aImplMS936DBCSCvtData } from "./tcvtscn6.ms936";
import { aImplGB2312DBCSCvtData } from "./tcvtscn6.gb2312";
import { aImplAPPLECHINSIMPDBCSCvtData } from "./tcvtscn6.applechinsimp";
import { aImplKSC5601DBCSCvtData, aImplMS949DBCSCvtData } from "./tcvtkr6.ms949";
import { aImplJOHABDBCSCvtData } from "./tcvtkr6.johab";
import { aImplMS950DBCSCvtData } from "./tcvttcn6.ms950";
import { aImplAPPLECHINTRADDBCSCvtData } from "./tcvttcn6.applechintrad";

/** Returns the existing single-byte converter data for the represented encoding. */
export function getSingleByteConvertData(
  encoding: rtl_TextEncoding,
): ImplByteConvertData | undefined {
  switch (encoding) {
    case RTL_TEXTENCODING_APPLE_CENTEURO:
      return aImplAPPLECENTEUROByteCvtData;
    case RTL_TEXTENCODING_APPLE_CROATIAN:
      return aImplAPPLECROATIANByteCvtData;
    case RTL_TEXTENCODING_APPLE_CYRILLIC:
      return aImplAPPLECYRILLICByteCvtData;
    case RTL_TEXTENCODING_APPLE_GREEK:
      return aImplAPPLEGREEKByteCvtData;
    case RTL_TEXTENCODING_APPLE_ICELAND:
      return aImplAPPLEICELANDByteCvtData;
    case RTL_TEXTENCODING_APPLE_ROMAN:
      return aImplAPPLEROMANByteCvtData;
    case RTL_TEXTENCODING_APPLE_ROMANIAN:
      return aImplAPPLEROMANIANByteCvtData;
    case RTL_TEXTENCODING_APPLE_TURKISH:
      return aImplAPPLETURKISHByteCvtData;
    case RTL_TEXTENCODING_APPLE_UKRAINIAN:
      return aImplAPPLEUKRAINIANByteCvtData;
    case RTL_TEXTENCODING_ASCII_US:
      return aImplUSASCIIByteCvtData;
    case RTL_TEXTENCODING_IBM_437:
      return aImplIBM437ByteCvtData;
    case RTL_TEXTENCODING_IBM_737:
      return aImplIBM737ByteCvtData;
    case RTL_TEXTENCODING_IBM_775:
      return aImplIBM775ByteCvtData;
    case RTL_TEXTENCODING_IBM_850:
      return aImplIBM850ByteCvtData;
    case RTL_TEXTENCODING_IBM_852:
      return aImplIBM852ByteCvtData;
    case RTL_TEXTENCODING_IBM_855:
      return aImplIBM855ByteCvtData;
    case RTL_TEXTENCODING_IBM_857:
      return aImplIBM857ByteCvtData;
    case RTL_TEXTENCODING_IBM_860:
      return aImplIBM860ByteCvtData;
    case RTL_TEXTENCODING_IBM_861:
      return aImplIBM861ByteCvtData;
    case RTL_TEXTENCODING_IBM_862:
      return aImplIBM862ByteCvtData;
    case RTL_TEXTENCODING_IBM_863:
      return aImplIBM863ByteCvtData;
    case RTL_TEXTENCODING_IBM_864:
      return aImplIBM864ByteCvtData;
    case RTL_TEXTENCODING_IBM_865:
      return aImplIBM865ByteCvtData;
    case RTL_TEXTENCODING_IBM_866:
      return aImplIBM866ByteCvtData;
    case RTL_TEXTENCODING_IBM_869:
      return aImplIBM869ByteCvtData;
    case RTL_TEXTENCODING_ISO_8859_1:
      return aImplISO88591ByteCvtData;
    case RTL_TEXTENCODING_ISO_8859_2:
      return aImplISO88592ByteCvtData;
    case RTL_TEXTENCODING_ISO_8859_3:
      return aImplISO88593ByteCvtData;
    case RTL_TEXTENCODING_ISO_8859_4:
      return aImplISO88594ByteCvtData;
    case RTL_TEXTENCODING_ISO_8859_5:
      return aImplISO88595ByteCvtData;
    case RTL_TEXTENCODING_ISO_8859_6:
      return aImplISO88596ByteCvtData;
    case RTL_TEXTENCODING_ISO_8859_7:
      return aImplISO88597ByteCvtData;
    case RTL_TEXTENCODING_ISO_8859_8:
      return aImplISO88598ByteCvtData;
    case RTL_TEXTENCODING_ISO_8859_9:
      return aImplISO88599ByteCvtData;
    case RTL_TEXTENCODING_ISO_8859_15:
      return aImplISO885915ByteCvtData;
    case RTL_TEXTENCODING_KOI8_R:
      return aImplKOI8RByteCvtData;
    case RTL_TEXTENCODING_KOI8_U:
      return aImplKOI8UByteCvtData;
    case RTL_TEXTENCODING_MS_874:
      return aImplMS874ByteCvtData;
    case RTL_TEXTENCODING_MS_1250:
      return aImplMS1250ByteCvtData;
    case RTL_TEXTENCODING_MS_1251:
      return aImplMS1251ByteCvtData;
    case RTL_TEXTENCODING_MS_1252:
      return aImplMS1252ByteCvtData;
    case RTL_TEXTENCODING_MS_1253:
      return aImplMS1253ByteCvtData;
    case RTL_TEXTENCODING_MS_1254:
      return aImplMS1254ByteCvtData;
    case RTL_TEXTENCODING_MS_1255:
      return aImplMS1255ByteCvtData;
    case RTL_TEXTENCODING_MS_1256:
      return aImplMS1256ByteCvtData;
    case RTL_TEXTENCODING_MS_1257:
      return aImplMS1257ByteCvtData;
    case RTL_TEXTENCODING_MS_1258:
      return aImplMS1258ByteCvtData;
    default:
      return undefined;
  }
}

/** Preserves distinct Symbol, UTF-8, UTF-7, multibyte, and single-byte converter dispatch. */
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
  | Readonly<{ kind: "single-byte"; data: ImplByteConvertData }>
  | undefined {
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
  return data === undefined ? undefined : { kind: "single-byte", data };
}

import descriptors from "./native-singlebyte-descriptors.json";

const originalDescriptors: Readonly<Record<string, ImplByteConvertData>> = descriptors;

/** Gets a native single-byte converter descriptor. Multibyte and contextual table owners are separate. @param encoding - Original rtl_TextEncoding ID. @returns Source descriptor or null. */
export function Impl_getByteConvertData(encoding: rtl_TextEncoding): ImplByteConvertData | null {
  return originalDescriptors[String(encoding)] ?? null;
}
