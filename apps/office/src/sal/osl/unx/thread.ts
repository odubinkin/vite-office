/** @fileoverview Original sal/osl/unx/thread.cxx text encoding initialization for the current Emscripten profile. */
import {
  RTL_TEXTENCODING_ASCII_US,
  RTL_TEXTENCODING_DONTKNOW,
  type rtl_TextEncoding,
} from "../../inc/rtl/textenc";
import { osl_getTextEncodingFromLocale } from "./nlsupport";
/** Original unknown-encoding ASCII fallback. @returns Source initial thread encoding. */
export function getThreadTextEncodingForInitialization(): rtl_TextEncoding {
  const encoding = osl_getTextEncodingFromLocale(null);
  return encoding === RTL_TEXTENCODING_DONTKNOW ? RTL_TEXTENCODING_ASCII_US : encoding;
}
