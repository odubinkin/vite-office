/** @fileoverview SvStream::DetectEncoding's original ICU recognizer and SAL name mapping. */
import {
  ucsdet_close,
  ucsdet_detect,
  ucsdet_getName,
  ucsdet_open,
  ucsdet_setText,
  type UCharsetMatch,
} from "../../../external/icu/source/i18n/unicode/ucsdet";
import { UErrorCode, U_FAILURE } from "../../../external/icu/source/common/unicode/utypes";
import {
  RTL_TEXTENCODING_BIG5,
  RTL_TEXTENCODING_EUC_JP,
  RTL_TEXTENCODING_EUC_KR,
  RTL_TEXTENCODING_GB_18030,
  RTL_TEXTENCODING_ISO_2022_CN,
  RTL_TEXTENCODING_ISO_2022_JP,
  RTL_TEXTENCODING_ISO_2022_KR,
  RTL_TEXTENCODING_ISO_8859_1,
  RTL_TEXTENCODING_ISO_8859_2,
  RTL_TEXTENCODING_ISO_8859_5,
  RTL_TEXTENCODING_ISO_8859_6,
  RTL_TEXTENCODING_ISO_8859_7,
  RTL_TEXTENCODING_ISO_8859_8,
  RTL_TEXTENCODING_ISO_8859_9,
  RTL_TEXTENCODING_KOI8_R,
  RTL_TEXTENCODING_MS_1250,
  RTL_TEXTENCODING_MS_1251,
  RTL_TEXTENCODING_MS_1252,
  RTL_TEXTENCODING_MS_1253,
  RTL_TEXTENCODING_MS_1254,
  RTL_TEXTENCODING_MS_1255,
  RTL_TEXTENCODING_MS_1256,
  RTL_TEXTENCODING_SHIFT_JIS,
  RTL_TEXTENCODING_UCS2,
  RTL_TEXTENCODING_UTF8,
  type rtl_TextEncoding,
} from "../../../sal/inc/rtl/textenc";

const mapEncodings = new Map<string, rtl_TextEncoding>([
  ["UTF-8", RTL_TEXTENCODING_UTF8],
  ["UTF-16BE", RTL_TEXTENCODING_UCS2],
  ["UTF-16LE", RTL_TEXTENCODING_UCS2],
  ["Shift_JIS", RTL_TEXTENCODING_SHIFT_JIS],
  ["ISO-2022-JP", RTL_TEXTENCODING_ISO_2022_JP],
  ["ISO-2022-CN", RTL_TEXTENCODING_ISO_2022_CN],
  ["ISO-2022-KR", RTL_TEXTENCODING_ISO_2022_KR],
  ["GB18030", RTL_TEXTENCODING_GB_18030],
  ["Big5", RTL_TEXTENCODING_BIG5],
  ["EUC-JP", RTL_TEXTENCODING_EUC_JP],
  ["EUC-KR", RTL_TEXTENCODING_EUC_KR],
  ["ISO-8859-1", RTL_TEXTENCODING_ISO_8859_1],
  ["ISO-8859-2", RTL_TEXTENCODING_ISO_8859_2],
  ["ISO-8859-5", RTL_TEXTENCODING_ISO_8859_5],
  ["ISO-8859-6", RTL_TEXTENCODING_ISO_8859_6],
  ["ISO-8859-7", RTL_TEXTENCODING_ISO_8859_7],
  ["ISO-8859-8", RTL_TEXTENCODING_ISO_8859_8],
  ["ISO-8859-9", RTL_TEXTENCODING_ISO_8859_9],
  ["windows-1250", RTL_TEXTENCODING_MS_1250],
  ["windows-1251", RTL_TEXTENCODING_MS_1251],
  ["windows-1252", RTL_TEXTENCODING_MS_1252],
  ["windows-1253", RTL_TEXTENCODING_MS_1253],
  ["windows-1254", RTL_TEXTENCODING_MS_1254],
  ["windows-1255", RTL_TEXTENCODING_MS_1255],
  ["windows-1256", RTL_TEXTENCODING_MS_1256],
  ["KOI8-R", RTL_TEXTENCODING_KOI8_R],
]);

/** Original best-match lookup uses only the first ICU result and admits its name only if mapped. @param bytes - Borrowed sample buffer. @param length - Actual bytes read. @returns Matched SAL encoding and UTF-16 byte order, or null. */
export function detectEncoding(
  bytes: Uint8Array,
  length: number,
): { encoding: rtl_TextEncoding; bigEndian: boolean } | null {
  if (length === 0) return null;
  const status: [UErrorCode] = [UErrorCode.U_ZERO_ERROR];
  const detector = ucsdet_open(status);
  if (!detector) return null;
  try {
    ucsdet_setText(detector, bytes, length, status);
    if (U_FAILURE(status[0])) return null;
    const match = ucsdet_detect(detector, status);
    if (U_FAILURE(status[0])) return null;
    const name = ucsdet_getName(match as UCharsetMatch, status);
    if (U_FAILURE(status[0]) || name === null) return null;
    const encoding = mapEncodings.get(name);
    return encoding === undefined ? null : { encoding, bigEndian: name === "UTF-16BE" };
  } finally {
    ucsdet_close(detector);
  }
}
