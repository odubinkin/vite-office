/** @fileoverview Real Calc font-item extraction, script/conditional/table precedence and differential-font presence through original pool and VCL owners. */
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScPatternAttr } from "../../../inc/patattr";
import { ScDxfFont } from "../../../inc/fonthelper";
import { SvtScriptType as Script } from "../../../../svl/inc/languageoptions";
import { SfxItemSet } from "../../../../svl/inc/itemset";
import * as A from "../../../inc/scitems";
import { Font } from "../../../../vcl/source/font/font";
import {
  SvxFontItem,
  SvxFontHeightItem,
  SvxWeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxOverlineItem,
  SvxWordLineModeItem,
  SvxContourItem,
  SvxShadowedItem,
  SvxCharReliefItem,
} from "../../../../editeng/source/items/textitem";
import {
  SvxCrossedOutItem,
  SvxEmphasisMarkItem,
} from "../../../../editeng/source/items/textitem.effects";
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { Color } from "../../../../tools/inc/color";
import {
  FontFamily as Family,
  FontPitch as Pitch,
  FontWeight as Weight,
  FontItalic as Italic,
  FontLineStyle as Line,
  FontStrikeout as Strike,
  FontEmphasisMark as Mark,
} from "../../../../tools/inc/fontenum";
import { FontRelief } from "../../../../vcl/inc/fntstyle";
import { RTL_TEXTENCODING_MS_1251 } from "../../../../sal/inc/rtl/textenc";
import { LANGUAGE_ENGLISH_US } from "../../../../i18nlangtag/inc/lang";
/** Uses a real document pool with independently owned itemsets. @param action - Actual native operations. @returns Nothing. */
function withSets(
  action: (
    base: SfxItemSet,
    conditional: SfxItemSet,
    table: SfxItemSet,
    pattern: ScPatternAttr,
  ) => void,
): void {
  const doc = new ScDocument(),
    pool = doc.GetPool();
  if (pool === null) throw new Error("Actual document pool is missing");
  const base = new SfxItemSet(pool, [[100, 155]]),
    conditional = new SfxItemSet(pool, [[100, 155]]),
    table = new SfxItemSet(pool, [[100, 155]]),
    pattern = new ScPatternAttr(doc.getCellAttributeHelper());
  try {
    action(base, conditional, table, pattern);
  } finally {
    base.ClearItem();
    conditional.ClearItem();
    table.ClearItem();
    pattern.Dispose();
    doc.DisposeAttributes();
  }
}
/** Constructs the actual font item with source metadata. @param name - Family. @param which - Actual identity. @returns Item. */
function family(name: string, which: number): SvxFontItem {
  return new SvxFontItem(
    Family.FAMILY_SWISS,
    name,
    "Regular",
    Pitch.PITCH_VARIABLE,
    RTL_TEXTENCODING_MS_1251,
    which,
  );
}
it.each([
  Script.NONE,
  Script.LATIN,
  Script.ASIAN,
  Script.COMPLEX,
  Script.UNKNOWN,
  Script.ASIAN | Script.COMPLEX,
])(
  "selects original exact script flags %s",
  /** Unknown and combined flags deliberately choose Latin. @param script - Original flags. @returns Nothing. */ (
    script,
  ) => {
    withSets(
      /** Real attributes and font destination. @param base - Source. @returns Nothing. */ (
        base,
      ) => {
        base.Put(family("Latin", A.ATTR_FONT));
        base.Put(family("Asian", A.ATTR_CJK_FONT));
        base.Put(family("Complex", A.ATTR_CTL_FONT));
        base.Put(new SvxFontHeightItem(220, 100, A.ATTR_FONT_HEIGHT));
        base.Put(new SvxFontHeightItem(320, 100, A.ATTR_CJK_FONT_HEIGHT));
        base.Put(new SvxFontHeightItem(420, 100, A.ATTR_CTL_FONT_HEIGHT));
        const font = new Font();
        ScPatternAttr.fillFontOnly(font, base, null, null, null, null, script);
        const expected =
          script === Script.ASIAN
            ? ["Asian", 320]
            : script === Script.COMPLEX
              ? ["Complex", 420]
              : ["Latin", 220];
        expect(font.GetFamilyName()).toBe(expected[0]);
        expect(font.GetFontSize().Height()).toBe(expected[1]);
        expect(font.GetFamilyType()).toBe(Family.FAMILY_SWISS);
        expect(font.GetPitch()).toBe(Pitch.PITCH_VARIABLE);
        expect(font.GetCharSet()).toBe(RTL_TEXTENCODING_MS_1251);
      },
    );
  },
);
it("copies all original effects and language while preserving unrelated destination state", /** Original null-device scale is ignored. @returns Nothing. */ () => {
  withSets(
    /** Uses actual concrete pool items. @param base - Source set. @returns Nothing. */ (base) => {
      base.Put(family("Liberation Sans", A.ATTR_FONT));
      base.Put(new SvxFontHeightItem(245, 100, A.ATTR_FONT_HEIGHT));
      base.Put(new SvxWeightItem(Weight.WEIGHT_BOLD, A.ATTR_FONT_WEIGHT));
      base.Put(new SvxPostureItem(Italic.ITALIC_OBLIQUE, A.ATTR_FONT_POSTURE));
      base.Put(new SvxUnderlineItem(Line.LINESTYLE_DOTTED, A.ATTR_FONT_UNDERLINE));
      base.Put(new SvxOverlineItem(Line.LINESTYLE_DOUBLE, A.ATTR_FONT_OVERLINE));
      base.Put(new SvxWordLineModeItem(true, A.ATTR_FONT_WORDLINE));
      base.Put(new SvxCrossedOutItem(Strike.STRIKEOUT_DOUBLE, A.ATTR_FONT_CROSSEDOUT));
      base.Put(new SvxContourItem(true, A.ATTR_FONT_CONTOUR));
      base.Put(new SvxShadowedItem(true, A.ATTR_FONT_SHADOWED));
      base.Put(new SvxEmphasisMarkItem(Mark.Dot, A.ATTR_FONT_EMPHASISMARK));
      base.Put(new SvxCharReliefItem(FontRelief.Engraved, A.ATTR_FONT_RELIEF));
      base.Put(new SvxLanguageItem(LANGUAGE_ENGLISH_US, A.ATTR_FONT_LANGUAGE));
      const font = new Font();
      font.SetColor(new Color(0x123456));
      font.SetTransparent(false);
      font.SetStyleName("old");
      ScPatternAttr.fillFontOnly(font, base, null, [2]);
      expect(font.GetFamilyName()).toBe("Liberation Sans");
      expect(font.GetStyleName()).toBe("Regular");
      expect(font.GetFontSize().Height()).toBe(245);
      expect(font.GetWeight()).toBe(Weight.WEIGHT_BOLD);
      expect(font.GetItalic()).toBe(Italic.ITALIC_OBLIQUE);
      expect(font.GetUnderline()).toBe(Line.LINESTYLE_DOTTED);
      expect(font.GetOverline()).toBe(Line.LINESTYLE_DOUBLE);
      expect(font.IsWordLineMode()).toBe(true);
      expect(font.GetStrikeout()).toBe(Strike.STRIKEOUT_DOUBLE);
      expect(font.IsOutline()).toBe(true);
      expect(font.IsShadow()).toBe(true);
      expect(font.GetEmphasisMark()).toBe(Mark.Dot);
      expect(font.GetRelief()).toBe(FontRelief.Engraved);
      expect(font.GetLanguage()).toBe(LANGUAGE_ENGLISH_US);
      expect(font.IsTransparent()).toBe(true);
      expect(font.GetColor().toUInt32()).toBe(0x123456);
      ScPatternAttr.fillFontOnly(font, base);
      expect(font.GetStyleName()).toBe("Regular");
    },
  );
});
it("retains conditional over table over direct/default precedence only for family, height and weight", /** Table effects must not leak into the destination. @returns Nothing. */ () => {
  withSets(
    /** Uses actual independently owned sets. @param base - Base. @param conditional - Conditional. @param table - Table. @returns Nothing. */ (
      base,
      conditional,
      table,
    ) => {
      table.Put(family("Table", A.ATTR_FONT));
      table.Put(new SvxFontHeightItem(400, 100, A.ATTR_FONT_HEIGHT));
      table.Put(new SvxWeightItem(Weight.WEIGHT_BLACK, A.ATTR_FONT_WEIGHT));
      table.Put(new SvxPostureItem(Italic.ITALIC_NORMAL, A.ATTR_FONT_POSTURE));
      const font = new Font();
      ScPatternAttr.fillFontOnly(font, base, null, null, null, table);
      expect(font.GetFamilyName()).toBe("Table");
      expect(font.GetFontSize().Height()).toBe(400);
      expect(font.GetWeight()).toBe(Weight.WEIGHT_BLACK);
      expect(font.GetItalic()).toBe(Italic.ITALIC_NONE);
      base.Put(family("Direct", A.ATTR_FONT));
      base.Put(new SvxFontHeightItem(300, 100, A.ATTR_FONT_HEIGHT));
      base.Put(new SvxWeightItem(Weight.WEIGHT_BOLD, A.ATTR_FONT_WEIGHT));
      ScPatternAttr.fillFontOnly(font, base, null, null, conditional, table);
      expect(font.GetFamilyName()).toBe("Direct");
      expect(font.GetFontSize().Height()).toBe(300);
      expect(font.GetWeight()).toBe(Weight.WEIGHT_BOLD);
      conditional.Put(family("Conditional", A.ATTR_FONT));
      conditional.Put(new SvxFontHeightItem(500, 100, A.ATTR_FONT_HEIGHT));
      conditional.Put(new SvxPostureItem(Italic.ITALIC_OBLIQUE, A.ATTR_FONT_POSTURE));
      conditional.Put(new SvxUnderlineItem(Line.LINESTYLE_DOUBLE, A.ATTR_FONT_UNDERLINE));
      ScPatternAttr.fillFontOnly(font, base, null, null, conditional, table);
      expect(font.GetFamilyName()).toBe("Conditional");
      expect(font.GetFontSize().Height()).toBe(500);
      expect(font.GetWeight()).toBe(Weight.WEIGHT_BOLD);
      expect(font.GetItalic()).toBe(Italic.ITALIC_OBLIQUE);
      expect(font.GetUnderline()).toBe(Line.LINESTYLE_DOUBLE);
      base.Put(base.GetPool().GetUserOrPoolDefaultItem(A.ATTR_FONT_HEIGHT));
      conditional.ClearItem();
      ScPatternAttr.fillFontOnly(font, base, null, null, conditional, table);
      expect(font.GetFontSize().Height()).toBe(400);
    },
  );
});
it("retains the upstream testFormats font assertions at their real pattern boundary", /** The original workbook load/layout harness remains outside this focused replay. @returns Nothing. */ () => {
  withSets(
    /** Actual original item-to-font assertions. @param base - Unused. @param conditional - Unused. @param table - Unused. @param pattern - Actual pattern. @returns Nothing. */ (
      _base,
      _conditional,
      _table,
      pattern,
    ) => {
      const font = new Font(),
        items = pattern.GetItemSetWritable();
      for (const height of [200, 240]) {
        items.Put(new SvxFontHeightItem(height, 100, A.ATTR_FONT_HEIGHT));
        pattern.fillFontOnly(font);
        expect(font.GetFontSize().Height()).toBe(height);
      }
      items.Put(new SvxPostureItem(Italic.ITALIC_NORMAL, A.ATTR_FONT_POSTURE));
      pattern.fillFontOnly(font);
      expect(font.GetItalic()).toBe(Italic.ITALIC_NORMAL);
      items.Put(new SvxWeightItem(Weight.WEIGHT_BOLD, A.ATTR_FONT_WEIGHT));
      pattern.fillFontOnly(font);
      expect(font.GetWeight()).toBe(Weight.WEIGHT_BOLD);
      for (const strike of [Strike.STRIKEOUT_SINGLE, Strike.STRIKEOUT_DOUBLE]) {
        items.Put(new SvxCrossedOutItem(strike, A.ATTR_FONT_CROSSEDOUT));
        pattern.fillFontOnly(font);
        expect(font.GetStrikeout()).toBe(strike);
      }
      items.Put(new SvxUnderlineItem(Line.LINESTYLE_DOTTED, A.ATTR_FONT_UNDERLINE));
      pattern.fillFontOnly(font);
      expect(font.GetUnderline()).toBe(Line.LINESTYLE_DOTTED);
    },
  );
});
it("differentiates empty DXF font defaults from explicitly set zero and false properties", /** Uses the genuine GetItemIfSet rather than Get defaults. @returns Nothing. */ () => {
  withSets(
    /** Original default and optional presence. @param base - Actual set. @returns Nothing. */ (
      base,
    ) => {
      expect(ScPatternAttr.GetDxfFont(base, Script.NONE).isEmpty()).toBe(true);
      base.Put(new SvxWordLineModeItem(false, A.ATTR_FONT_WORDLINE));
      base.Put(new SvxUnderlineItem(Line.LINESTYLE_NONE, A.ATTR_FONT_UNDERLINE));
      const dxf = ScPatternAttr.GetDxfFont(base, Script.NONE);
      expect(dxf.isEmpty()).toBe(false);
      expect(dxf.bWordLine).toBe(false);
      expect(dxf.eUnder).toBe(Line.LINESTYLE_NONE);
      expect(dxf.eWeight).toBeUndefined();
      expect(dxf.nFontHeight).toBeUndefined();
    },
  );
});
it("extracts complete differential font values from a parent SET and retains the borrowed font identity", /** Color copies must survive independent result mutation. @returns Nothing. */ () => {
  withSets(
    /** Parent/default distinction uses genuine itemset inheritance. @param base - Child. @param parent - Parent. @returns Nothing. */ (
      base,
      parent,
    ) => {
      parent.Put(family("Parent", A.ATTR_CJK_FONT));
      parent.Put(new SvxFontHeightItem(320, 100, A.ATTR_CJK_FONT_HEIGHT));
      parent.Put(new SvxWeightItem(Weight.WEIGHT_BOLD, A.ATTR_CJK_FONT_WEIGHT));
      parent.Put(new SvxPostureItem(Italic.ITALIC_NORMAL, A.ATTR_CJK_FONT_POSTURE));
      parent.Put(new SvxLanguageItem(LANGUAGE_ENGLISH_US, A.ATTR_CJK_FONT_LANGUAGE));
      parent.Put(new SvxUnderlineItem(Line.LINESTYLE_DOUBLE, A.ATTR_FONT_UNDERLINE));
      parent.Put(new SvxOverlineItem(Line.LINESTYLE_DOTTED, A.ATTR_FONT_OVERLINE));
      parent.Put(new SvxWordLineModeItem(true, A.ATTR_FONT_WORDLINE));
      parent.Put(new SvxCrossedOutItem(Strike.STRIKEOUT_SINGLE, A.ATTR_FONT_CROSSEDOUT));
      parent.Put(new SvxContourItem(true, A.ATTR_FONT_CONTOUR));
      parent.Put(new SvxShadowedItem(true, A.ATTR_FONT_SHADOWED));
      parent.Put(new SvxEmphasisMarkItem(Mark.Dot, A.ATTR_FONT_EMPHASISMARK));
      parent.Put(new SvxCharReliefItem(FontRelief.Embossed, A.ATTR_FONT_RELIEF));
      parent.Put(new SvxColorItem(new Color(0x123456), A.ATTR_FONT_COLOR));
      base.SetParent(parent);
      const dxf = ScPatternAttr.GetDxfFont(base, Script.ASIAN),
        copy = new ScDxfFont(dxf);
      expect(dxf.pFontAttr).toBe(parent.GetItemIfSet(A.ATTR_CJK_FONT));
      expect(dxf.nFontHeight).toBe(320);
      expect(dxf.eWeight).toBe(Weight.WEIGHT_BOLD);
      expect(dxf.eItalic).toBe(Italic.ITALIC_NORMAL);
      expect(dxf.eUnder).toBe(Line.LINESTYLE_DOUBLE);
      expect(dxf.eOver).toBe(Line.LINESTYLE_DOTTED);
      expect(dxf.bWordLine).toBe(true);
      expect(dxf.eStrike).toBe(Strike.STRIKEOUT_SINGLE);
      expect(dxf.bOutline).toBe(true);
      expect(dxf.bShadow).toBe(true);
      expect(dxf.eEmphasis).toBe(Mark.Dot);
      expect(dxf.eRelief).toBe(FontRelief.Embossed);
      expect(dxf.eLang).toBe(LANGUAGE_ENGLISH_US);
      expect(dxf.aColor?.toUInt32()).toBe(0x123456);
      expect(copy.pFontAttr).toBe(dxf.pFontAttr);
      expect(copy.aColor).not.toBe(dxf.aColor);
      copy.aColor?.SetRed(255);
      expect(dxf.aColor?.toUInt32()).toBe(0x123456);
      base.SetParent(undefined);
      expect(ScPatternAttr.GetDxfFont(base, Script.ASIAN).isEmpty()).toBe(true);
    },
  );
});
it("retains presence for every public optional aggregate member", /** The source aggregate itself admits explicit zero, false and null values. @returns Nothing. */ () => {
  const values: ScDxfFont = new ScDxfFont();
  values.pFontAttr = null;
  values.nFontHeight = 0;
  values.eWeight = Weight.WEIGHT_DONTKNOW;
  values.eItalic = Italic.ITALIC_NONE;
  values.eUnder = Line.LINESTYLE_NONE;
  values.eOver = Line.LINESTYLE_NONE;
  values.bWordLine = false;
  values.eStrike = Strike.STRIKEOUT_NONE;
  values.bOutline = false;
  values.bShadow = false;
  values.eEmphasis = Mark.NONE;
  values.eRelief = FontRelief.NONE;
  values.aColor = new Color();
  values.eLang = LANGUAGE_ENGLISH_US;
  for (const name of Object.keys(values) as (keyof ScDxfFont)[]) {
    if (name === "isEmpty") continue;
    const one = new ScDxfFont();
    Object.assign(one, { [name]: values[name] });
    expect(one.isEmpty()).toBe(false);
    expect(new ScDxfFont(one).isEmpty()).toBe(false);
  }
  expect(new ScDxfFont(new ScDxfFont()).isEmpty()).toBe(true);
});
