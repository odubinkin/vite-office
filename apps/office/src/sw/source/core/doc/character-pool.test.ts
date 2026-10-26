/** @fileoverview Verifies the native character style pool required by Markdown/HTML and numbering import. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "./doc";
import { SwNumFormat } from "./number";
import { SwPoolFormatId as P, WRITER_CHARACTER_STYLE_POOL } from "../../../inc/poolfmt";
import * as H from "../../../inc/hintids";
import {
  SvxWeightItem,
  SvxFontItem,
  SvxFontHeightItem,
} from "../../../../editeng/source/items/textitem";
import { FontWeight } from "../../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_SYMBOL } from "../../../../sal/inc/rtl/textenc";
import { SwStyleNameMapper } from "./SwStyleNameMapper";
import { GetDefBulletFont, GetBulletChar, IsDefBulletFontUserDefined } from "./number-bullet";

it("uses one native common-format pool identity and exact UI/programmatic character names", /** Checks original source defaults and stable materialization. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    expect(doc.GetDfltCharFormat().GetPoolFormatId()).toBe(P.UNKNOWN);
    expect(doc.GetDfltTextFormatColl().GetPoolFormatId()).toBe(doc.GetDfltTextFormatColl().poolId);
    expect(
      doc.MakeTextFormatColl("Custom", doc.GetDfltTextFormatColl(), "custom").GetPoolFormatId(),
    ).toBe(P.UNKNOWN);
    for (const entry of WRITER_CHARACTER_STYLE_POOL) {
      const format = doc.GetCharFormatFromPool(entry.poolId);
      assert(format);
      expect(format.GetPoolFormatId()).toBe(entry.poolId);
      expect(format.GetName()).toBe(entry.uiName);
      expect(format.DerivedFrom()).toBe(doc.GetDfltCharFormat());
      expect(format.IsAuto()).toBe(false);
      expect(doc.GetCharFormatFromPool(entry.poolId)).toBe(format);
      expect(SwStyleNameMapper.GetProgName(entry.poolId, "")).toBe(entry.name);
    }
    expect(doc.GetCharFormats()).toHaveLength(27);
    expect(doc.GetCharFormatFromPool(0)).toBeUndefined();
    expect(doc.GetCharFormatFromPool(0x4400)).toBeUndefined();
    const invalid = doc.GetCharFormatFromPool(1050);
    assert(invalid);
    expect(invalid.GetPoolFormatId()).toBe(1050);
    expect(invalid.GetName()).toBe(doc.GetCharFormatFromPool(P.CHR_FOOTNOTE)?.GetName());
  } finally {
    doc.Dispose();
  }
});
it("sets native strong emphasis for each source script and keeps fixed styles on actual document font selection", /** Checks source item ownership and inherited fallback. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const strong = doc.GetCharFormatFromPool(P.CHR_HTML_STRONG);
    assert(strong);
    for (const which of [H.RES_CHRATR_WEIGHT, H.RES_CHRATR_CJK_WEIGHT, H.RES_CHRATR_CTL_WEIGHT])
      expect((strong.GetAttrSet().Get(which) as SvxWeightItem).GetWeight()).toBe(
        FontWeight.WEIGHT_BOLD,
      );
    const code = doc.GetCharFormatFromPool(P.CHR_HTML_CODE);
    assert(code);
    expect((code.GetAttrSet().Get(H.RES_CHRATR_FONT) as SvxFontItem).GetFamilyName()).toBe(
      "Liberation Mono",
    );
    const ruby = doc.GetCharFormatFromPool(P.CHR_RUBYTEXT);
    assert(ruby);
    const base = doc
      .GetAttrPool()
      .GetUserOrPoolDefaultItem(H.RES_CHRATR_CJK_FONTSIZE) as SvxFontHeightItem;
    expect((ruby.GetAttrSet().Get(H.RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight()).toBe(
      Math.trunc(base.GetHeight() / 2),
    );
  } finally {
    doc.Dispose();
  }
});
it("uses shipped native bullet fields and registers real numbering character formats across clones", /** Checks source font initialization and SwClient ownership. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    expect(IsDefBulletFontUserDefined()).toBe(false);
    const font = GetDefBulletFont();
    expect(font.GetFamilyName()).toBe("OpenSymbol");
    expect(font.GetCharSet()).toBe(RTL_TEXTENCODING_SYMBOL);
    expect(font.GetFontSize().Height()).toBe(14);
    expect([GetBulletChar(0), GetBulletChar(1), GetBulletChar(2)]).toEqual([
      0x2022, 0x25e6, 0x25aa,
    ]);
    const style = doc.GetCharFormatFromPool(P.CHR_BULLET_LEVEL);
    assert(style);
    for (const which of [H.RES_CHRATR_FONT, H.RES_CHRATR_CJK_FONT, H.RES_CHRATR_CTL_FONT]) {
      const item = style.GetAttrSet().Get(which) as SvxFontItem;
      expect(item.GetFamilyName()).toBe("OpenSymbol");
      expect(item.GetCharSet()).toBe(RTL_TEXTENCODING_SYMBOL);
    }
    const format = new SwNumFormat();
    format.SetCharFormat(style);
    const copy = format.clone();
    expect(copy.GetCharFormat()).toBe(style);
    expect(copy.GetCharFormatName()).toBe("Bullets");
    format.SetCharFormat(undefined);
    expect(format.GetCharFormat()).toBeUndefined();
    expect(copy.GetCharFormat()).toBe(style);
  } finally {
    doc.Dispose();
  }
});
