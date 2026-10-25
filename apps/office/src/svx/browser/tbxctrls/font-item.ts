/** @fileoverview Shared browser binding of SvxFontNameBox_Impl's complete five-field toolbox item. */
import { SvxFontItem } from "../../../editeng/inc/fontitem";
import { getBrowserFont } from "../../../svtools/browser/font-list";
/** Copies actual available device metadata into the source command item. @param name - Selected original family. @returns SID_ATTR_CHAR_FONT item. */
export function createBrowserFontItem(name: string): SvxFontItem {
  const font = getBrowserFont(name);
  return new SvxFontItem(
    font.GetFamilyType(),
    font.GetFamilyName(),
    font.GetStyleName(),
    font.GetPitch(),
    font.GetCharSet(),
    10007,
  );
}
