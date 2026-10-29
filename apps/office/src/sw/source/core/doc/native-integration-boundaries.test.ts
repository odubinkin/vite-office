/** @fileoverview Exercises public Writer ownership and metadata boundaries discovered during branch integration. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "./doc";
import { SwStyleNameMapper } from "./SwStyleNameMapper";
import { SwGetPoolIdFromName } from "../../../inc/SwGetPoolIdFromName";
import { SwPoolFormatId, WRITER_CHARACTER_STYLE_POOL } from "../../../inc/poolfmt";
import { createItemInfoPackageSwAttributes } from "../bastyp/init";
import { SwUndoNodes } from "../undo/docundo";
import { SwNodeIndex, SwPosition } from "../crsr/pam";
import { SwNodes } from "../docnode/nodes";
import { MDTable } from "../../filter/md/mdtab";
import { AttrSetToLineHeight } from "../txtnode/swfont";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SvxFontHeightItem } from "../../../../editeng/source/items/textitem";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import { COMPLEX } from "../../../../offapi/com/sun/star/i18n/ScriptType";
import { RES_CHRATR_CTL_FONT, RES_CHRATR_CTL_FONTSIZE } from "../../../inc/hintids";

it("resolves native character names and custom suffix disambiguation", /** Checks resource-backed name mappings. @returns Nothing. */ () => {
  expect(SwStyleNameMapper.FillUIName("Standard", SwGetPoolIdFromName.ChrFmt)).toBe(
    "No Character Style",
  );
  expect(SwStyleNameMapper.FillProgName("No Character Style", SwGetPoolIdFromName.ChrFmt)).toBe(
    "Standard",
  );
  expect(SwStyleNameMapper.FillProgName("Custom (user)", SwGetPoolIdFromName.ChrFmt)).toBe(
    "Custom",
  );
  expect(SwStyleNameMapper.FillProgName("Footnote Symbol", SwGetPoolIdFromName.ChrFmt)).toBe(
    "Footnote Symbol (user)",
  );
  expect(SwStyleNameMapper.FillUIName("Footnote Symbol (user)", SwGetPoolIdFromName.ChrFmt)).toBe(
    "Footnote Symbol",
  );
  const strong = WRITER_CHARACTER_STYLE_POOL.find(
    /** Finds the known pool entry. @param row - Native entry. @returns Whether strong. */ (row) =>
      row.poolId === SwPoolFormatId.CHR_HTML_STRONG,
  );
  assert(strong);
  expect(SwStyleNameMapper.GetUIName(SwPoolFormatId.CHR_HTML_STRONG, "fallback")).toBe(
    strong.uiName,
  );
});
it("rejects unavailable metadata indices and uninstalled table owners", /** Checks actual public lifecycle preconditions. @returns Nothing. */ () => {
  const packageOwner = createItemInfoPackageSwAttributes();
  try {
    for (const index of [-1, packageOwner.size()])
      expect(
        /** Requests a missing static entry. @returns Metadata. */ () =>
          packageOwner.getExistingItemInfo(index),
      ).toThrow("Writer ItemInfo index is out of range");
  } finally {
    packageOwner.Dispose();
  }
  expect(
    /** Requests an absent table before installation. @returns Table. */ () =>
      new MDTable().GetTable(),
  ).toThrow("Markdown table has not been installed.");
  const undo = new SwUndoNodes();
  undo.Release(99);
  expect(undo.Count()).toBe(0);
});
it("traverses genuine SwNodeIndex and position overloads without crossing document ownership", /** Verifies native adjacency overloads. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    first = doc.paragraphs[0];
  assert(first);
  const second = doc.GetNodes().MakeTextNode("second"),
    index = new SwNodeIndex(first),
    position = new SwPosition(second);
  try {
    expect(SwNodes.GoNext(index)).toBe(second);
    expect(index.GetNode()).toBe(second);
    expect(SwNodes.GoPrevious(index)).toBe(first);
    expect(index.GetNode()).toBe(first);
    expect(SwNodes.GoPrevious(position)).toBe(first);
  } finally {
    position.Dispose();
    doc.Dispose();
  }
});
it("measures complex-script leading using the CTL font and height items", /** Verifies correct native script slots. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    first = doc.paragraphs[0];
  assert(first);
  try {
    first.SetAttr(
      new SvxFontItem(
        FontFamily.FAMILY_SWISS,
        "CTL Fixture",
        "",
        FontPitch.PITCH_VARIABLE,
        RTL_TEXTENCODING_UTF8,
        RES_CHRATR_CTL_FONT,
      ),
    );
    first.SetAttr(new SvxFontHeightItem(420, 100, RES_CHRATR_CTL_FONTSIZE));
    const measured: unknown[] = [];
    expect(
      AttrSetToLineHeight(first.GetSwAttrSet(), COMPLEX, {
        getDefaultFont: /** Declines unrelated font discovery. @returns No substitution. */ () =>
          undefined,
        measureTextHeight:
          /** Records the selected original device request. @param family - Native family. @param height - Twips. @returns Device line height. */ (
            family,
            height,
          ) => {
            measured.push(family, height);
            return 501.6;
          },
      }),
    ).toBe(502);
    expect(measured).toEqual(["CTL Fixture", 420]);
  } finally {
    doc.Dispose();
  }
});
