/** @fileoverview Native font-table initialization, used numbering ownership and real RTF output. */
import { assert, expect, it } from "vitest";
import { createRtfExport } from "../../../../test/writer-rtf-export";
import { Font } from "../../../../vcl/source/font/font";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_MS_1252, RTL_TEXTENCODING_SYMBOL } from "../../../../sal/inc/rtl/textenc";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { SwNumFormat } from "../../core/doc/number";
import { SwNumRuleItem } from "../../core/para/paratr";
import { GetDfltAttr } from "../../core/attr/hints";
import { GetDefBulletFont, GetDefBulletFontname } from "../../core/doc/number-bullet";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { releaseStyleHandle } from "../../../../svl/source/items/stylepool";
import {
  RES_CHRATR_FONT,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CTL_FONT,
  WRITER_CHARACTER_WHICH_RANGES,
} from "../../../inc/hintids";
import { wwFontHelper } from "./wrtw8sty";
import { RtfExport } from "./rtfexport";
/** Builds an actual native font item with known metadata. @param name - Family. @param which - Native script identity. @returns Item. */
function font(name: string, which: number = RES_CHRATR_FONT): SvxFontItem {
  return new SvxFontItem(
    FontFamily.FAMILY_ROMAN,
    name,
    "",
    FontPitch.PITCH_VARIABLE,
    RTL_TEXTENCODING_MS_1252,
    which,
  );
}
/** Installs an actual owned bullet-font value. @param name - Font name. @returns Native level format. */
function bullet(name: string): SwNumFormat {
  const value = new Font();
  value.SetFamilyName(name);
  value.SetFamily(FontFamily.FAMILY_DECORATIVE);
  value.SetPitch(FontPitch.PITCH_FIXED);
  value.SetCharSet(RTL_TEXTENCODING_SYMBOL);
  const format = new SwNumFormat();
  format.SetNumberingType(SvxNumType.SVX_NUM_CHAR_SPECIAL);
  format.SetBulletChar(0x2022);
  format.SetBulletFont(value);
  return format;
}
it("registers source seeds, global default and document override before the optional all-font traversal", /** Checks insertion IDs and original early return with actual owners. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    doc = owner.m_rDoc;
  doc.GetAttrPool().SetUserDefaultItem(font("User Default"));
  doc.MakeCharFormat("Not traversed", undefined).SetFormatAttr(font("Skipped"));
  const helper = new wwFontHelper();
  expect(helper.m_bLoadAllFonts).toBe(false);
  helper.InitFontTable(owner);
  expect(
    helper
      .AsVector()
      .slice(0, 3)
      .map(
        /** Reads native insertion order. @param item - Registered value. @returns Family. */ (
          item,
        ) => item?.msFamilyNm,
      ),
  ).toEqual(["Times New Roman", "Symbol", "Arial"]);
  expect(helper.GetId(GetDfltAttr(RES_CHRATR_FONT) as SvxFontItem)).toBe(3);
  expect(helper.GetId(font("User Default"))).toBe(4);
  expect(helper.AsVector()).toHaveLength(5);
  expect(owner.m_pUsedNumTable).toBeUndefined();
});
it("collects all three script families and automatic styles before serializing a complete RTF font table", /** Exercises named/direct/automatic owners rather than a run prepass. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    doc = owner.m_rDoc;
  doc.GetAttrPool().SetUserDefaultItem(font("Document Default"));
  doc.MakeCharFormat("Unused named style", undefined).SetFormatAttr(font("Named Western"));
  doc
    .MakeTextFormatColl("Unused paragraph", doc.GetDfltTextFormatColl())
    .SetFormatAttr(font("Named Asian", RES_CHRATR_CJK_FONT));
  const node = doc.paragraphs[0];
  assert(node);
  node.SetText("Text");
  node.SetAttr(font("Node Complex", RES_CHRATR_CTL_FONT));
  const set = new SfxItemSet(doc.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
  set.Put(font("Automatic Western"));
  const handle = doc.GetIStyleAccess().getAutomaticStyle(set, SwAutoStyleFamily.AUTO_STYLE_CHAR);
  try {
    const text = new TextDecoder().decode(owner.ExportDocument());
    for (const name of [
      "Named Western",
      "Named Asian",
      "Node Complex",
      "Automatic Western",
      "Document Default",
    ])
      expect(text).toContain(name + ";");
    const defaultId = owner.m_aFontHelper.GetId(font("Document Default"));
    expect(text).toMatch(new RegExp(`^\\{\\\\rtf1\\\\ansi\\\\deff${defaultId}\\\\adeflang1025`));
    expect(defaultId).not.toBe(0);
    expect(text).toContain("{\\f0\\froman\\fprq2\\fcharset0 Times New Roman;");
    const fonts = owner.m_aFontHelper
      .AsVector()
      .map(
        /** Reads actual initialized order. @param item - Native value. @returns Family. */ (
          item,
        ) => item?.msFamilyNm,
      );
    expect(fonts.indexOf("Named Western")).toBeLessThan(fonts.indexOf("Named Asian"));
    expect(fonts.indexOf("Named Asian")).toBeLessThan(fonts.indexOf("Node Complex"));
  } finally {
    releaseStyleHandle(handle);
    set.Dispose();
  }
});
it("keeps the native lazy used-rule snapshot and source outline placement", /** Includes paragraph-style and redline clients while excluding unused rules and subsequent changes. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    doc = owner.m_rDoc;
  const unused = doc.EnsureNumRule("Unused", "bullet"),
    style = doc.EnsureNumRule("Style", "bullet"),
    redline = doc.EnsureNumRule("Redline", "bullet");
  doc
    .MakeTextFormatColl("Registered", doc.GetDfltTextFormatColl())
    .SetFormatAttr(new SwNumRuleItem(style.GetName()));
  redline.SetUsedByRedline(true);
  owner.EnsureUsedNumberingTable();
  expect(owner.m_pUsedNumTable).toEqual([style, redline, doc.GetOutlineNumRule()]);
  unused.SetUsedByRedline(true);
  owner.EnsureUsedNumberingTable();
  expect(owner.m_pUsedNumTable).toEqual([style, redline, doc.GetOutlineNumRule()]);
  const fresh = createRtfExport(doc);
  doc.GetOutlineNumRule().SetUsedByRedline(true);
  fresh.EnsureUsedNumberingTable();
  expect(fresh.m_pUsedNumTable).toEqual([doc.GetOutlineNumRule(), unused, style, redline]);
});
it("collects bullet fonts for used rules and unused outline using the original nine-level and continuous limits", /** Preserves source WW8ListManager nMaxLevel9 instead of expanding it to Writer's tenth level. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    doc = owner.m_rDoc;
  const used = doc.EnsureNumRule("Used", "bullet"),
    unused = doc.EnsureNumRule("Unused", "bullet"),
    continuous = doc.EnsureNumRule("Continuous", "bullet");
  used.SetUsedByRedline(true);
  continuous.SetUsedByRedline(true);
  continuous.SetContinusNum(true);
  const bitmap = bullet("Bitmap Level");
  bitmap.SetNumberingType(SvxNumType.SVX_NUM_BITMAP);
  used.Set(7, bitmap);
  used.Set(8, bullet("Last Word Level"));
  used.Set(9, bullet("Tenth Writer Level"));
  unused.Set(0, bullet("Unused Bullet"));
  continuous.Set(0, bullet("Continuous First"));
  continuous.Set(1, bullet("Continuous Second"));
  doc.GetOutlineNumRule().Set(0, bullet("Outline Bullet"));
  const text = new TextDecoder().decode(owner.ExportDocument());
  for (const name of ["Bitmap Level", "Last Word Level", "Continuous First", "Outline Bullet"])
    expect(text).toContain(name + ";");
  for (const name of ["Tenth Writer Level", "Unused Bullet", "Continuous Second"])
    expect(text).not.toContain(name + ";");
});
it("uses the original RTF no-substitution branch and copies the VCL bullet font before configuration queries", /** Covers zero, BMP and supplementary bullets and common-base enabled conversion. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    format = bullet("OpenSymbol;Fallback");
  expect(owner.m_bSubstituteBullets).toBe(false);
  for (const scalar of [0, 0x2022, 0x1f642]) {
    format.SetBulletChar(scalar);
    const [text, value] = owner.GetNumberingLevelBulletStringAndFont(format);
    expect(text).toBe(String.fromCodePoint(scalar));
    expect(value.msFamilyNm).toBe("OpenSymbol");
    expect(value.meChrSet).toBe(RTL_TEXTENCODING_SYMBOL);
    expect(value.mePitch).toBe(FontPitch.PITCH_FIXED);
    expect(value.meFamily).toBe(FontFamily.FAMILY_DECORATIVE);
  }
  expect(format.GetBulletFont()?.GetFamilyName()).toBe("OpenSymbol;Fallback");
  const defaultFont = GetDefBulletFont(),
    familyBefore = defaultFont.GetFamilyType(),
    pitchBefore = defaultFont.GetPitch();
  const implicit = new SwNumFormat();
  implicit.SetNumberingType(SvxNumType.SVX_NUM_BITMAP);
  implicit.SetBulletFont(undefined);
  const [, fallback] = owner.GetNumberingLevelBulletStringAndFont(implicit);
  expect(fallback.msFamilyNm).toBe(GetDefBulletFontname());
  expect(defaultFont.GetFamilyType()).toBe(familyBefore);
  expect(defaultFont.GetPitch()).toBe(pitchBefore);
  owner.m_bSubstituteBullets = true;
  format.SetBulletChar(0xe7ff);
  const [text, value] = owner.GetNumberingLevelBulletStringAndFont(format);
  expect(text).toBe("l");
  expect(value.msFamilyNm).toBe("Wingdings");
});
it("uses the shell-compatible complete-document bridge without leaking temporary position owners", /** Repeated exports create fresh source font/numbering owners. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    doc = owner.m_rDoc;
  const node = doc.paragraphs[0];
  assert(node);
  expect(node.HasAnyContentIndex()).toBe(false);
  node.SetText("漢字 العربية Text");
  const bytes = RtfExport.WriteDocument(doc);
  expect(bytes).toEqual(RtfExport.WriteDocument(doc));
  expect(node.HasAnyContentIndex()).toBe(false);
  const text = new TextDecoder().decode(bytes);
  const declared = new Set(
    [...text.matchAll(/\{\\f(\d+)\\f(?:nil|roman|swiss|modern|script|decor|tech|bidi)/g)].map(
      /** Borrows serialized font IDs independently from the exporter map. @param match - Native group. @returns Declared slot. */
      (match) => Number(match[1]),
    ),
  );
  expect(declared.size).toBeGreaterThanOrEqual(5);
  for (const match of text.matchAll(/\\(?:af|f|deff)(\d+)\b/g))
    expect(declared.has(Number(match[1]))).toBe(true);
});
