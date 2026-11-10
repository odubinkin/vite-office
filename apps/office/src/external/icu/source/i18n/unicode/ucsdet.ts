/** @fileoverview Original ICU charset detector declaration boundary. */
import type { CharsetDetector } from "../csdetect";
import type { CharsetMatch } from "../csmatch";

/** Original opaque detector handle. */
export type UCharsetDetector = CharsetDetector;
/** Original opaque match handle. */
export type UCharsetMatch = CharsetMatch;

export {
  ucsdet_open,
  ucsdet_close,
  ucsdet_setText,
  ucsdet_detect,
  ucsdet_detectAll,
  ucsdet_getName,
  ucsdet_getLanguage,
  ucsdet_getConfidence,
  ucsdet_isInputFilterEnabled,
  ucsdet_enableInputFilter,
} from "../ucsdet";
