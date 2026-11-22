/** @fileoverview Source Calc standard cell styles and workbook-defined style inheritance. */
import { expect, it } from "vitest";
import { ScDocShell } from "../../ui/docshell/docsh";
import { SfxStyleFamily, SfxStyleSearchBits } from "../../../../svl/inc/style-values";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { Color } from "../../../../tools/inc/color";
import { FontItalic, FontLineStyle, FontWeight } from "../../../../tools/inc/fontenum";
import type { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import type { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import type { SvxPostureItem } from "../../../../editeng/inc/postitem";
import type { SvxUnderlineItem } from "../../../../editeng/source/items/textitem";
import type { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import {
  ATTR_BACKGROUND,
  ATTR_BORDER,
  ATTR_CJK_FONT_HEIGHT,
  ATTR_CTL_FONT_POSTURE,
  ATTR_FONT_HEIGHT,
  ATTR_FONT_UNDERLINE,
  ATTR_FONT_WEIGHT,
} from "../../../inc/scitems";

it("installs the pinned built-in style hierarchy and direct properties in a new workbook", /** Exercises the source styles.xml definitions through the real pool. @returns Nothing. */ () => {
  const shell = new ScDocShell();
  try {
    const pool = shell.GetDocument().GetStyleSheetPool();
    if (!pool) throw new Error("Missing Calc style pool");
    const iterator = pool.CreateIterator(SfxStyleFamily.Para);
    const installed = new Set<string>();
    for (let style = iterator.First(); style; style = iterator.Next()) {
      installed.add(text(style.GetName()));
      expect(style.GetMask()).toBe(SfxStyleSearchBits.ScStandard);
    }
    expect(installed).toEqual(new Set(["Default", ...pool.GetStandardCellStyleNames()]));
    expect(installed.size).toBe(19);

    const heading = pool.Find(unicode("Heading 1"), SfxStyleFamily.Para);
    const note = pool.Find(unicode("Note"), SfxStyleFamily.Para);
    const footnote = pool.Find(unicode("Footnote"), SfxStyleFamily.Para);
    const hyperlink = pool.Find(unicode("Hyperlink"), SfxStyleFamily.Para);
    if (!heading || !note || !footnote || !hyperlink) throw new Error("Missing source style");
    expect(text(heading.GetParent())).toBe("Heading");
    expect((heading.GetItemSet().Get(ATTR_FONT_HEIGHT) as SvxFontHeightItem).GetHeight()).toBe(360);
    expect((heading.GetItemSet().Get(ATTR_CJK_FONT_HEIGHT) as SvxFontHeightItem).GetHeight()).toBe(
      360,
    );
    expect((heading.GetItemSet().Get(ATTR_FONT_WEIGHT) as SvxWeightItem).GetWeight()).toBe(
      FontWeight.WEIGHT_BOLD,
    );
    expect(text(note.GetParent())).toBe("Text");
    expect((note.GetItemSet().Get(ATTR_BORDER) as SvxBoxItem).GetTop()?.GetWidth()).toBe(15);
    expect((footnote.GetItemSet().Get(ATTR_CTL_FONT_POSTURE) as SvxPostureItem).GetPosture()).toBe(
      FontItalic.ITALIC_NORMAL,
    );
    expect(
      (hyperlink.GetItemSet().Get(ATTR_FONT_UNDERLINE) as SvxUnderlineItem).GetLineStyle(),
    ).toBe(FontLineStyle.LINESTYLE_SINGLE);
    expect(shell.IsModified()).toBe(false);
  } finally {
    shell.Close();
  }
});

it("retains the workbook's attributes for an existing named stock style", /** Existing definitions own their actual item sets. @returns Nothing. */ () => {
  const shell = new ScDocShell();
  try {
    const pool = shell.GetDocument().GetStyleSheetPool();
    const good = pool?.Find(unicode("Good"), SfxStyleFamily.Para);
    if (!pool || !good) throw new Error("Missing Calc Good style");
    good.GetItemSet().Put(new SvxBrushItem(new Color(0x010203), ATTR_BACKGROUND));
    pool.LoadStandardCellStyles();
    expect(pool.EnsureStandardCellStyle("Good")).toBe(good);
    expect((good.GetItemSet().Get(ATTR_BACKGROUND) as SvxBrushItem).GetColor().GetRed()).toBe(1);
  } finally {
    shell.Close();
  }
});
