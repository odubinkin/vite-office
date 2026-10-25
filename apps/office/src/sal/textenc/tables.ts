/** @fileoverview Current single-byte data owners from sal/textenc/tables.cxx. */
import type { ImplByteConvertData } from "./tenchelp";
import {
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
  type rtl_TextEncoding,
} from "../inc/rtl/textenc";
import { aImplIBM437ByteCvtData, aImplIBM850ByteCvtData } from "./tcvtlat1";
import {
  aImplMS1250ByteCvtData,
  aImplMS1251ByteCvtData,
  aImplMS1253ByteCvtData,
  aImplMS1254ByteCvtData,
  aImplMS1257ByteCvtData,
} from "./tcvtest1";
import { aImplMS1255ByteCvtData, aImplMS1256ByteCvtData } from "./tcvtarb1";
import { aImplMS874ByteCvtData, aImplMS1258ByteCvtData } from "./tcvteas1";
import { aImplMS1252ByteCvtData } from "./textenc";

/** Returns the existing single-byte converter data for the represented encoding. */
export function getSingleByteConvertData(
  encoding: rtl_TextEncoding,
): ImplByteConvertData | undefined {
  switch (encoding) {
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
