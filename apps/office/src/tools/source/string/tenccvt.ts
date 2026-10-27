/** @fileoverview Original extended charset compatibility mapping from tools/source/string/tenccvt.cxx. Octet-width/load/store helpers remain separate responsibilities. */
import {
  RTL_TEXTENCODING_ISO_8859_1,
  RTL_TEXTENCODING_ISO_8859_2,
  RTL_TEXTENCODING_ISO_8859_5,
  RTL_TEXTENCODING_ISO_8859_7,
  RTL_TEXTENCODING_ISO_8859_9,
  RTL_TEXTENCODING_ISO_8859_15,
  RTL_TEXTENCODING_MS_1250,
  RTL_TEXTENCODING_MS_1251,
  RTL_TEXTENCODING_MS_1252,
  RTL_TEXTENCODING_MS_1253,
  RTL_TEXTENCODING_MS_1254,
  type rtl_TextEncoding,
} from "../../../sal/inc/rtl/textenc";
/** Native compatibility extensions preserve all other encoding IDs. @param encoding - Original unsigned16 ID. @returns Extended charset. */
export function GetExtendedCompatibilityTextEncoding(encoding: rtl_TextEncoding): rtl_TextEncoding {
  encoding &= 0xffff;
  if (encoding === RTL_TEXTENCODING_ISO_8859_1) return RTL_TEXTENCODING_MS_1252;
  else if (encoding === RTL_TEXTENCODING_ISO_8859_9) return RTL_TEXTENCODING_MS_1254;
  else return encoding;
}
/** Original export extension order includes the deliberately non-equivalent Greek mapping. @param encoding - Original unsigned16 ID. @returns Extended charset. */
export function GetExtendedTextEncoding(encoding: rtl_TextEncoding): rtl_TextEncoding {
  encoding &= 0xffff;
  if (encoding === RTL_TEXTENCODING_ISO_8859_5) return RTL_TEXTENCODING_MS_1251;
  else if (encoding === RTL_TEXTENCODING_ISO_8859_7) return RTL_TEXTENCODING_MS_1253;
  else if (encoding === RTL_TEXTENCODING_ISO_8859_2) return RTL_TEXTENCODING_MS_1250;
  else if (encoding === RTL_TEXTENCODING_ISO_8859_15) return RTL_TEXTENCODING_MS_1252;
  else return GetExtendedCompatibilityTextEncoding(encoding);
}
