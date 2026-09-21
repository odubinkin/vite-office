/** @fileoverview Verifies the pinned built-in Writer paragraph-style pool. */
import { describe, expect, it } from "vitest";
import {
  encodeWriterOdfStyleName,
  getWriterOdfStyleName,
  getWriterStyleIdFromOdfName,
  WRITER_PARAGRAPH_STYLE_POOL,
} from "./poolfmt";
import { createWriterDocument } from "../source/core/doc/doc";
import {
  FontItalic,
  FontWeight,
  SvxFontHeightItem,
  SvxFontItem,
  SvxPostureItem,
  SvxWeightItem,
} from "../../editeng/source/items/textitem";
import {
  SvxAdjust,
  SvxAdjustItem,
  SvxFirstLineIndentItem,
  SvxLineSpacingItem,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
  SvxULSpaceItem,
} from "../../editeng/source/items/paraitem";
import {
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CJK_POSTURE,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_CTL_POSTURE,
  RES_CHRATR_CTL_WEIGHT,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_POSTURE,
  RES_CHRATR_WEIGHT,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_ADJUST,
  RES_PARATR_LINESPACING,
  RES_UL_SPACE,
} from "./hintids";

describe("Writer paragraph-style pool", /** Registers pool tests. @returns Nothing. */ () => {
  it("preserves all pool ranges, identities, parents, and follow links", /** Verifies the complete graph. @returns Nothing. */ () => {
    expect(WRITER_PARAGRAPH_STYLE_POOL).toHaveLength(126);
    expect(
      new Set(
        WRITER_PARAGRAPH_STYLE_POOL.map(
          /** Projects an identity. @param style - Pool style. @returns ID. */ (style) => style.id,
        ),
      ).size,
    ).toBe(126);
    expect(WRITER_PARAGRAPH_STYLE_POOL[0]).toMatchObject({ id: "default", poolId: 2048 });
    expect(WRITER_PARAGRAPH_STYLE_POOL.at(-1)).toMatchObject({ id: "list-heading", poolId: 12292 });
    const document = createWriterDocument();
    expect(document.GetTextFormatColls()).toHaveLength(1);
    for (const style of WRITER_PARAGRAPH_STYLE_POOL) {
      const collection = document.GetTextFormatColl(style.id);
      expect(collection.poolId).toBe(style.poolId);
      expect(
        collection.DerivedFrom() instanceof Object
          ? collection.DerivedFrom()?.GetName()
          : undefined,
      ).toBe(
        style.parentId === undefined
          ? undefined
          : document.GetTextFormatColl(style.parentId).GetName(),
      );
      expect(collection.GetNextTextFormatColl().id).toBe(style.followId);
    }
    expect(document.GetTextFormatColls()).toHaveLength(126);
    expect(document.GetTextFormatColl("heading-1").GetAssignedOutlineStyleLevel()).toBe(0);
    expect(document.GetTextFormatColl("heading-10").GetAssignedOutlineStyleLevel()).toBe(9);
    expect(
      /** Assigns an invalid outline level. @returns Nothing. */ () =>
        document.GetTextFormatColl("heading-1").AssignToListLevelOfOutlineStyle(10),
    ).toThrow("outside 0-9");
  });

  it("uses LibreOffice XML style-name encoding for the complete pool", /** Verifies SvXMLUnitConverter-compatible names and reverse lookup. @returns Nothing. */ () => {
    expect(encodeWriterOdfStyleName("Text body")).toBe("Text_20_body");
    expect(encodeWriterOdfStyleName("Numbering 1 Cont.")).toBe("Numbering_20_1_20_Cont.");
    expect(encodeWriterOdfStyleName("1 title")).toBe("_31__20_title");
    expect(encodeWriterOdfStyleName("ÀØøÿ")).toBe("ÀØøÿ");
    expect(encodeWriterOdfStyleName("Ж1\u0301ʽՙەۦ·")).toBe("Ж1\u0301ʽՙەۦ·");
    expect(encodeWriterOdfStyleName("\u0301\uf900\u20dd")).toBe("_301__f900__20dd_");
    expect(encodeWriterOdfStyleName(" ".repeat(9_000))).toBe(" ".repeat(9_000));
    const names = WRITER_PARAGRAPH_STYLE_POOL.map(
      /** Projects and checks one ODF identity. @param style - Pool entry. @returns ODF name. */ (
        style,
      ) => {
        const name = getWriterOdfStyleName(style.id);
        expect(getWriterStyleIdFromOdfName(name)).toBe(style.id);
        return name;
      },
    );
    expect(new Set(names).size).toBe(WRITER_PARAGRAPH_STYLE_POOL.length);
    expect(getWriterOdfStyleName("header-and-footer")).toBe("Header_20_and_20_Footer");
    expect(getWriterOdfStyleName("custom-style")).toBe("custom-style");
  });

  it("materializes source-derived item defaults and script slots", /** Verifies representative upstream style switch branches. @returns Nothing. */ () => {
    const document = createWriterDocument();
    const textBody = document.GetTextFormatColl("text-body").GetAttrSet();
    expect((textBody.Get(RES_PARATR_LINESPACING) as SvxLineSpacingItem).GetPropLineSpace()).toBe(
      115,
    );
    expect((textBody.Get(RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(7 * 20);

    const heading = document.GetTextFormatColl("heading").GetAttrSet();
    expect((heading.Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight()).toBe(14 * 20);
    expect((heading.Get(RES_UL_SPACE) as SvxULSpaceItem).QueryValue()).toEqual([12 * 20, 6 * 20]);
    for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT])
      expect((heading.Get(which) as SvxFontItem).GetFamilyName()).not.toBe("");

    const heading4 = document.GetTextFormatColl("heading-4").GetAttrSet();
    for (const which of [RES_CHRATR_WEIGHT, RES_CHRATR_CJK_WEIGHT, RES_CHRATR_CTL_WEIGHT])
      expect((heading4.Get(which) as SvxWeightItem).GetWeight()).toBe(FontWeight.BOLD);
    for (const which of [RES_CHRATR_POSTURE, RES_CHRATR_CJK_POSTURE, RES_CHRATR_CTL_POSTURE])
      expect((heading4.Get(which) as SvxPostureItem).GetPosture()).toBe(FontItalic.NORMAL);
    for (const which of [RES_CHRATR_FONTSIZE, RES_CHRATR_CJK_FONTSIZE, RES_CHRATR_CTL_FONTSIZE])
      expect((heading4.Get(which) as SvxFontHeightItem).GetHeight()).toBe(13 * 20);

    const title = document.GetTextFormatColl("title").GetAttrSet();
    expect((title.Get(RES_PARATR_ADJUST) as SvxAdjustItem).GetAdjust()).toBe(SvxAdjust.Center);
    expect((title.Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight()).toBe(28 * 20);
    const caption = document.GetTextFormatColl("caption").GetAttrSet();
    expect((caption.Get(RES_UL_SPACE) as SvxULSpaceItem).QueryValue()).toEqual([120, 120]);
    expect((caption.Get(RES_CHRATR_POSTURE) as SvxPostureItem).GetPosture()).toBe(
      FontItalic.NORMAL,
    );

    const hanging = document.GetTextFormatColl("hanging-indent").GetAttrSet();
    expect(
      (hanging.Get(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem).ResolveTextFirstLineOffset(),
    ).toBe(-283);
    expect((hanging.Get(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft()).toBe(567);
    const quotations = document.GetTextFormatColl("quotations").GetAttrSet();
    expect((quotations.Get(RES_MARGIN_RIGHT) as SvxRightMarginItem).ResolveRight()).toBe(567);
    expect(
      (
        document
          .GetTextFormatColl("table-heading")
          .GetAttrSet()
          .Get(RES_PARATR_ADJUST) as SvxAdjustItem
      ).GetAdjust(),
    ).toBe(SvxAdjust.Center);
    expect(
      document.GetAttrPool().CreateItem({ which: RES_MARGIN_FIRSTLINE, value: -10 }),
    ).toBeInstanceOf(SvxFirstLineIndentItem);
    expect(
      document.GetAttrPool().CreateItem({ which: RES_MARGIN_RIGHT, value: 10 }),
    ).toBeInstanceOf(SvxRightMarginItem);
  });
});
