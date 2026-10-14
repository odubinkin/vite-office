/** @fileoverview Implements Writer's document-wide font auto-style pool from xmlfonte.cxx. */
import { SvxFontItem } from "../../../../editeng/source/items/textitem";
import { XMLFontAutoStylePool } from "../../../../xmloff/source/style/XMLFontAutoStylePool";
import { RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT, RES_CHRATR_FONT } from "../../../inc/hintids";
import type { SwDoc } from "../../core/doc/doc";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { SwFormatAutoFormat } from "../../core/txtnode/txatbase";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_DONTKNOW } from "../../../../sal/inc/rtl/textenc";
import { getFontFamilyFromGeneric } from "../../../../xmloff/source/style/fonthdl";
/** Collects pool defaults and every direct Writer font item in deterministic family order. @param document - Source document. @returns Populated font pool. */
export function createWriterFontAutoStylePool(document: SwDoc): XMLFontAutoStylePool {
  const families: SvxFontItem[] = [];
  for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT])
    families.push(document.GetAttrPool().GetUserOrPoolDefaultItem(which) as SvxFontItem);
  for (const collection of document.GetTextFormatColls())
    for (const item of collection.GetAttrSet().entries())
      if (item instanceof SvxFontItem) families.push(item);
  for (const node of document.paragraphs) {
    for (const item of node.GetSwAttrSet().entries())
      if (item instanceof SvxFontItem) families.push(item);
    for (const run of projectWriterTextRuns(node))
      if (run.attributes.fontFamily !== undefined)
        families.push(
          new SvxFontItem(
            FontFamily.FAMILY_DONTKNOW,
            run.attributes.fontFamily,
            "",
            FontPitch.PITCH_DONTKNOW,
            RTL_TEXTENCODING_DONTKNOW,
            RES_CHRATR_FONT,
          ),
        );
    for (const hint of node.GetpSwpHints()?.entries() ?? [])
      if (hint.format instanceof SwFormatAutoFormat)
        for (const item of hint.format.GetStyleHandle().entries())
          if (item instanceof SvxFontItem) families.push(item);
  }
  families.sort(
    /** Retains family-name traversal order. @param a - Left font. @param b - Right font. @returns UTF16 ordering. */ (
      a,
      b,
    ) =>
      a.GetFamilyName() < b.GetFamilyName() ? -1 : a.GetFamilyName() > b.GetFamilyName() ? 1 : 0,
  );
  const fonts = new XMLFontAutoStylePool();
  for (const font of families)
    fonts.Add(
      font.GetFamilyName(),
      font.GetStyleName(),
      font.GetFamily(),
      font.GetPitch(),
      font.GetCharSet(),
    );
  for (const font of document.GetEmbeddedFonts()) fonts.AddEmbedded(font);
  return fonts;
}

/** Existing browser property-to-pool boundary registers the native five-field value then reads its actual name; it does not replace the original Add return behavior. @param pool - Actual shared pool. @param familyName - Family value. @param generic - ODF family metadata. @param styleName - Native style. @param pitch - Native pitch. @param charSet - Native encoding. @returns Actual registered name. */
export function registerWriterFontFace(
  pool: XMLFontAutoStylePool,
  familyName: string,
  generic?: string,
  styleName = "",
  pitch = FontPitch.PITCH_DONTKNOW,
  charSet = RTL_TEXTENCODING_DONTKNOW,
): string {
  const family = getFontFamilyFromGeneric(generic);
  pool.Add(familyName, styleName, family, pitch, charSet);
  return pool.Find(familyName, styleName, family, pitch, charSet);
}
