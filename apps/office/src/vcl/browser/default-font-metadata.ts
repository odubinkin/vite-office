/** @fileoverview Browser projection of represented VCL GetDefaultFont metadata for an actually matched configured family; physical fallback remains separate. */
import type { Font } from "../source/font/font";
import { createDefaultFontMetadata } from "../source/outdev/font";
import type { rtl_TextEncoding } from "../../sal/inc/rtl/textenc";
import type { DefaultFontType } from "../../unotools/inc/fontdefs";
import type { LocaleConstReference } from "../../udkapi/com/sun/star/lang/Locale";
import type { BrowserDefaultFontDevice } from "./default-font-device";
/** Uses actual registered-family matching; missing loaded faces stay absent. @param device - Registered-family device. @param type - Native role. @param locale - Prepared locale. @param threadEncoding - Platform encoding. @returns Independent metadata or absence. */
export function getBrowserDefaultFontMetadata(
  device: BrowserDefaultFontDevice,
  type: DefaultFontType,
  locale: LocaleConstReference,
  threadEncoding: rtl_TextEncoding,
): Font | undefined {
  const family = device.getDefaultFont(type, locale);
  return family === undefined ? undefined : createDefaultFontMetadata(family, type, threadEncoding);
}
