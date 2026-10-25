/** @fileoverview Current single-byte data owners from sal/textenc/tables.cxx. */
import type { ImplByteConvertData } from "./tenchelp";
import {
  RTL_TEXTENCODING_APPLE_CENTEURO,
  RTL_TEXTENCODING_APPLE_CROATIAN,
  RTL_TEXTENCODING_APPLE_CYRILLIC,
  RTL_TEXTENCODING_APPLE_GREEK,
  RTL_TEXTENCODING_APPLE_ICELAND,
  RTL_TEXTENCODING_APPLE_ROMAN,
  RTL_TEXTENCODING_APPLE_ROMANIAN,
  RTL_TEXTENCODING_APPLE_TURKISH,
  RTL_TEXTENCODING_APPLE_UKRAINIAN,
  RTL_TEXTENCODING_IBM_437,
  RTL_TEXTENCODING_IBM_850,
  RTL_TEXTENCODING_MS_874,
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
  type rtl_TextEncoding,
} from "../inc/rtl/textenc";
import {
  aImplAPPLEICELANDByteCvtData,
  aImplAPPLEROMANByteCvtData,
  aImplIBM437ByteCvtData,
  aImplIBM850ByteCvtData,
} from "./tcvtlat1";
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
import { aImplMS1255ByteCvtData, aImplMS1256ByteCvtData } from "./tcvtarb1";
import { aImplMS874ByteCvtData, aImplMS1258ByteCvtData } from "./tcvteas1";
import { aImplMS1252ByteCvtData } from "./textenc";

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
    case RTL_TEXTENCODING_IBM_437:
      return aImplIBM437ByteCvtData;
    case RTL_TEXTENCODING_IBM_850:
      return aImplIBM850ByteCvtData;
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

/** Preserves the distinct converter function for Symbol versus table codecs. */
export function getTextToUnicodeData(
  encoding: rtl_TextEncoding,
):
  | Readonly<{ kind: "symbol" }>
  | Readonly<{ kind: "single-byte"; data: ImplByteConvertData }>
  | undefined {
  if (encoding === RTL_TEXTENCODING_SYMBOL) return { kind: "symbol" };
  const data = getSingleByteConvertData(encoding);
  return data === undefined ? undefined : { kind: "single-byte", data };
}
