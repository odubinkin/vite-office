/** @fileoverview Verifies the pinned built-in Writer paragraph-style pool. */
import { describe, expect, it } from "vitest";
import { SfxBoolItem, SfxInt16Item, SfxStringItem } from "../../svl/source/items/poolitem";
import {
  encodeWriterOdfStyleName,
  getWriterOdfStyleName,
  getWriterStyleIdFromOdfName,
  WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL,
  WRITER_PARAGRAPH_STYLE_POOL,
} from "./poolfmt";
import { createWriterDocument } from "../source/core/doc/doc";
import { getWriterParagraphStyleDefaults } from "../source/core/doc/poolfmt-defaults";
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
  RES_CHRATR_COLOR,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_CTL_POSTURE,
  RES_CHRATR_CTL_WEIGHT,
  RES_CHRATR_HIGHLIGHT,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_POSTURE,
  RES_CHRATR_WEIGHT,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_ADJUST,
  RES_PARATR_LINESPACING,
  RES_PARATR_TABSTOP,
  RES_UL_SPACE,
  RES_KEEP,
  RES_LINENUMBER,
} from "./hintids";

describe("Writer paragraph-style pool", /** Registers pool tests. @returns Nothing. */ () => {
  it("preserves complete pool metadata while materializing only supported styles", /** Verifies inventory and the executable style graph. @returns Nothing. */ () => {
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
    for (const style of WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL) {
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
    expect(document.GetTextFormatColls()).toHaveLength(26);
    expect(document.GetTextFormatColl("heading-1").GetAssignedOutlineStyleLevel()).toBe(0);
    expect(document.GetTextFormatColl("heading-10").GetAssignedOutlineStyleLevel()).toBe(9);
    expect(
      /** Assigns an invalid outline level. @returns Nothing. */ () =>
        document.GetTextFormatColl("heading-1").AssignToListLevelOfOutlineStyle(10),
    ).toThrow("outside 0-9");
    expect(
      /** Requests metadata-only style. @returns Nothing before the expected exception. */ () =>
        document.GetTextFormatColl("numbering-1"),
    ).toThrow("Unsupported SwTextFormatColl");
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

  it("exposes only styles backed by source-derived defaults", /** Verifies the complete available style surface. @returns Nothing. */ () => {
    expect(
      WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL.map(
        /** Projects one available identity. @param style - Available style. @returns ID. */ (
          style,
        ) => style.id,
      ),
    ).toEqual([
      "default",
      "text-body",
      "first-line-indent",
      "hanging-indent",
      "text-body-indent",
      "marginalia",
      "caption",
      "footnote",
      "endnote",
      "comment",
      "title",
      "subtitle",
      "appendix",
      "heading",
      "heading-1",
      "heading-2",
      "heading-3",
      "heading-4",
      "heading-5",
      "heading-6",
      "heading-7",
      "heading-8",
      "heading-9",
      "heading-10",
      "quotations",
      "preformatted-text",
    ]);
    expect(
      WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL.some(
        /** Detects the unavailable HTML list heading. @param style - Available style. @returns Whether it is the list heading. */ (
          style,
        ) => style.id === "list-heading",
      ),
    ).toBe(false);
  });

  it("matches the source-derived direct-default table for every exposed style", /** Differentially verifies all materializable pool branches rather than a representative subset. @returns Nothing. */ () => {
    const expected = {
      default: {},
      "text-body": { lineHeightPercent: 115, lowerTwips: 140 },
      "first-line-indent": { firstLineTwips: 283, textLeftTwips: 0 },
      "hanging-indent": { firstLineTwips: -283, tabStopTwips: 0, textLeftTwips: 567 },
      "text-body-indent": { firstLineTwips: 0, textLeftTwips: 283 },
      marginalia: { firstLineTwips: 0, textLeftTwips: 2268 },
      caption: {
        fontSizeTwips: 200,
        italic: true,
        lineNumber: false,
        lowerTwips: 120,
        upperTwips: 120,
      },
      footnote: { firstLineTwips: -340, fontSizeTwips: 200, lineNumber: false, textLeftTwips: 340 },
      endnote: { firstLineTwips: -340, fontSizeTwips: 200, lineNumber: false, textLeftTwips: 340 },
      comment: {
        autoColor: true,
        firstLineTwips: 0,
        fontSizeTwips: 200,
        lineHeightPercent: 0,
        lowerTwips: 0,
        rightTwips: 57,
        textLeftTwips: 57,
        transparentHighlight: true,
        upperTwips: 57,
      },
      title: { adjust: SvxAdjust.Center, bold: true, fontSizeTwips: 560 },
      subtitle: {
        adjust: SvxAdjust.Center,
        fontSizeTwips: 360,
        lowerTwips: 120,
        upperTwips: 60,
      },
      appendix: { adjust: SvxAdjust.Center, bold: true, fontSizeTwips: 320 },
      heading: {
        fontRole: "heading",
        fontSizeTwips: 280,
        keepWithNext: true,
        lowerTwips: 120,
        upperTwips: 240,
      },
      "heading-1": {
        bold: true,
        fontSizeTwips: 360,
        keepWithNext: true,
        lowerTwips: 120,
        upperTwips: 240,
      },
      "heading-2": {
        bold: true,
        fontSizeTwips: 320,
        keepWithNext: true,
        lowerTwips: 120,
        upperTwips: 200,
      },
      "heading-3": {
        bold: true,
        fontSizeTwips: 280,
        keepWithNext: true,
        lowerTwips: 120,
        upperTwips: 140,
      },
      "heading-4": {
        bold: true,
        fontSizeTwips: 260,
        italic: true,
        keepWithNext: true,
        lowerTwips: 120,
        upperTwips: 120,
      },
      "heading-5": {
        bold: true,
        fontSizeTwips: 240,
        keepWithNext: true,
        lowerTwips: 60,
        upperTwips: 120,
      },
      "heading-6": {
        bold: true,
        fontSizeTwips: 240,
        italic: true,
        keepWithNext: true,
        lowerTwips: 60,
        upperTwips: 60,
      },
      "heading-7": {
        bold: true,
        fontSizeTwips: 200,
        keepWithNext: true,
        lowerTwips: 60,
        upperTwips: 60,
      },
      "heading-8": {
        bold: true,
        fontSizeTwips: 200,
        italic: true,
        keepWithNext: true,
        lowerTwips: 60,
        upperTwips: 60,
      },
      "heading-9": {
        bold: true,
        fontSizeTwips: 180,
        keepWithNext: true,
        lowerTwips: 60,
        upperTwips: 60,
      },
      "heading-10": {
        bold: true,
        fontSizeTwips: 180,
        keepWithNext: true,
        lowerTwips: 60,
        upperTwips: 60,
      },
      quotations: { firstLineTwips: 0, lowerTwips: 283, rightTwips: 567, textLeftTwips: 567 },
      "preformatted-text": { fontRole: "fixed", fontSizeTwips: 200, lowerTwips: 0 },
    } as const;
    expect(Object.keys(expected)).toEqual(
      WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL.map(
        /** Projects one available style identity. @param style - Pool entry. @returns ID. */ (
          style,
        ) => style.id,
      ),
    );
    for (const [id, defaults] of Object.entries(expected))
      expect(getWriterParagraphStyleDefaults(id)).toEqual(defaults);
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

    const comment = document.GetTextFormatColl("comment").GetAttrSet();
    expect((comment.Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight()).toBe(10 * 20);
    expect(
      (comment.Get(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem).ResolveTextFirstLineOffset(),
    ).toBe(0);
    expect((comment.Get(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft()).toBe(57);
    expect((comment.Get(RES_MARGIN_RIGHT) as SvxRightMarginItem).ResolveRight()).toBe(57);
    expect((comment.Get(RES_UL_SPACE) as SvxULSpaceItem).QueryValue()).toEqual([57, 0]);
    expect((comment.Get(RES_PARATR_LINESPACING) as SvxLineSpacingItem).GetPropLineSpace()).toBe(0);

    const hanging = document.GetTextFormatColl("hanging-indent").GetAttrSet();
    expect(
      (hanging.Get(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem).ResolveTextFirstLineOffset(),
    ).toBe(-283);
    expect((hanging.Get(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft()).toBe(567);
    expect((hanging.Get(RES_PARATR_TABSTOP) as SfxInt16Item).GetValue()).toBe(0);
    expect((heading.Get(RES_KEEP) as SfxBoolItem).GetValue()).toBe(true);
    expect((caption.Get(RES_LINENUMBER) as SfxBoolItem).GetValue()).toBe(false);
    expect((comment.Get(RES_CHRATR_COLOR) as SfxStringItem).GetValue()).toBe("auto");
    expect((comment.Get(RES_CHRATR_HIGHLIGHT) as SfxStringItem).GetValue()).toBe("transparent");
    const quotations = document.GetTextFormatColl("quotations").GetAttrSet();
    expect((quotations.Get(RES_MARGIN_RIGHT) as SvxRightMarginItem).ResolveRight()).toBe(567);
    expect(
      document.GetAttrPool().CreateItem({ which: RES_MARGIN_FIRSTLINE, value: -10 }),
    ).toBeInstanceOf(SvxFirstLineIndentItem);
    expect(
      document.GetAttrPool().CreateItem({ which: RES_MARGIN_RIGHT, value: 10 }),
    ).toBeInstanceOf(SvxRightMarginItem);
    expect(document.GetAttrPool().CreateItem({ which: RES_CHRATR_COLOR, value: "auto" })).toEqual(
      new SfxStringItem(RES_CHRATR_COLOR, "auto"),
    );
    expect(
      document.GetAttrPool().CreateItem({ which: RES_CHRATR_HIGHLIGHT, value: "transparent" }),
    ).toEqual(new SfxStringItem(RES_CHRATR_HIGHLIGHT, "transparent"));
    expect(document.GetAttrPool().CreateItem({ which: RES_PARATR_TABSTOP, value: 0 })).toEqual(
      new SfxInt16Item(RES_PARATR_TABSTOP, 0),
    );
  });

  it("materializes the pinned HTML-mode text and heading branches", /** Verifies HTML paragraph spacing, heading sizes, font role, and posture rules from DocumentStylePoolManager.cxx. @returns Nothing. */ () => {
    expect(getWriterParagraphStyleDefaults("text-body", true)).toMatchObject({
      lineHeightPercent: 115,
      lowerTwips: 283,
    });
    expect(getWriterParagraphStyleDefaults("heading-1", true)).toMatchObject({
      bold: true,
      fontRole: "text",
      fontSizeTwips: 24 * 20,
    });
    expect(getWriterParagraphStyleDefaults("heading-4", true)).not.toHaveProperty("italic");

    const document = createWriterDocument();
    document.GetDocumentSettingManager().set("HTML_MODE", true);
    const textBody = document.GetTextFormatColl("text-body").GetAttrSet();
    expect((textBody.Get(RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(283);
    const headingBase = document.GetTextFormatColl("heading").GetAttrSet();
    expect((headingBase.Get(RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(283);
    const heading1 = document.GetTextFormatColl("heading-1").GetAttrSet();
    expect((heading1.Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight()).toBe(24 * 20);
    const heading4 = document.GetTextFormatColl("heading-4").GetAttrSet();
    expect((heading4.Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight()).toBe(12 * 20);
    expect(heading4.GetItemIfSet(RES_CHRATR_POSTURE, false)).toBeUndefined();
  });
});
