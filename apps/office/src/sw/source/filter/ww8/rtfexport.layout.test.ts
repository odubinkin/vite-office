/** @fileoverview Additional native layout regression cases. */
/** @fileoverview RTF writer round trips through the represented native reader and Writer hints. */
import { expect, it } from "vitest";

import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";

import { SvxLineSpaceRule } from "../../../../editeng/inc/svxenum";

import { SvxFontHeightItem, SvxFontItem } from "../../../../editeng/source/items/textitem";

import { SfxInt16Item } from "../../../../svl/source/items/intitem";

import {
  RES_BREAK,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_FONTSIZE,
  RES_PAGEDESC,
  RES_PARATR_LINESPACING,
} from "../../../inc/hintids";

import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";

import { createWriterDocument, SwDoc } from "../../core/doc/doc";

import { RtfDocumentImpl } from "../../writerfilter/rtftok/rtfdocumentimpl";

import { RtfTokenizer } from "../../writerfilter/rtftok/rtftokenizer";

import { createWriterTextFragment } from "../basflt/writer-transfer";

import { RtfExport } from "./rtfexport";

it("writes initial native page geometry to RTF global and first-section controls", /** Checks writes initial native page geometry to RTF global and first-section controls. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  const first = source.paragraphs[0];
  if (first === undefined) throw new Error("Missing paragraph.");
  first.SetText("Page");
  const alternate = source.MakePageDesc("Landscape", source.GetPageDesc());
  source.ChgPageDesc(
    {
      ...alternate.GetValue(),
      width: 15000,
      height: 9000,
      leftMargin: 1000,
      rightMargin: 1100,
      topMargin: 1200,
      bottomMargin: 1300,
      landscape: true,
    },
    "Landscape",
  );
  first.SetAttr(new SwFormatPageDesc("Landscape"));
  let imported;
  try {
    const bytes = RtfExport.WriteDocument(source);
    const rtf = new TextDecoder().decode(bytes);
    expect(rtf).toContain(String.raw`{\*\pgdscno1}`);
    expect(rtf).toContain(String.raw`\landscape\paperh9000\paperw15000`);
    expect(rtf).toContain(String.raw`\margl1000\margr1100\margt1200\margb1300`);
    expect(rtf).toContain(String.raw`\sectd\sbknone\sectunlocked1`);
    expect(rtf).toContain(String.raw`\lndscpsxn\pgwsxn15000\pghsxn9000`);
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(imported.GetPageDesc().GetValue()).toMatchObject({
      width: 15000,
      height: 9000,
      leftMargin: 1000,
      rightMargin: 1100,
      topMargin: 1200,
      bottomMargin: 1300,
      landscape: true,
    });
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("selects the first RTF page descriptor inherited from a paragraph style", /** Checks selects the first RTF page descriptor inherited from a paragraph style. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  try {
    const paragraph = source.paragraphs[0];
    if (paragraph === undefined) throw new Error("Missing paragraph.");
    const alternate = source.MakePageDesc("Styled Page", source.GetPageDesc());
    source.ChgPageDesc({ ...alternate.GetValue(), width: 14000 }, alternate.GetName());
    const style = source.MakeTextFormatColl("Styled", source.GetTextFormatColl("default"));
    style.SetFormatAttr(new SwFormatPageDesc("Styled Page"));
    paragraph.ChgFormatColl(style);
    const rtf = new TextDecoder().decode(RtfExport.WriteDocument(source));
    expect(rtf).toContain(String.raw`{\*\pgdscno1}`);
    expect(rtf).toContain(String.raw`\paperw14000`);
  } finally {
    source.Dispose();
  }
});

it("writes a native RTF page section and restart before a later paragraph", /** Checks writes a native RTF page section and restart before a later paragraph. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  try {
    source.paragraphs[0]?.SetText("Before");
    const alternate = source.MakePageDesc("Second Page", source.GetPageDesc());
    source.ChgPageDesc({ ...alternate.GetValue(), width: 15120, leftMargin: 990 }, "Second Page");
    const next = source.nodes.MakeTextNode("After");
    next.SetAttr(new SwFormatPageDesc("Second Page", 7));
    const rtf = new TextDecoder().decode(RtfExport.WriteDocument(source));
    expect(rtf).toContain(
      String.raw`\sect\sectd\sectunlocked1\pgwsxn15120\pghsxn15840\marglsxn990`,
    );
    expect(rtf).toContain(String.raw`\pgnstarts7\pgnrestart\sbkpage`);
    expect(rtf.indexOf(String.raw`\sect\sectd`)).toBeLessThan(rtf.indexOf("After"));
  } finally {
    source.Dispose();
  }
});

it("imports an exported later page section through native page descriptors", /** Checks imports an exported later page section through native page descriptors. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  let imported: SwDoc | undefined;
  try {
    source.paragraphs[0]?.SetText("Before");
    const alternate = source.MakePageDesc("Second Page", source.GetPageDesc());
    source.ChgPageDesc({ ...alternate.GetValue(), width: 15120 }, "Second Page");
    const next = source.nodes.MakeTextNode("After");
    next.SetAttr(new SwFormatPageDesc("Second Page", 7));
    imported = new RtfDocumentImpl().Resolve(
      new RtfTokenizer(RtfExport.WriteDocument(source)).Tokenize(),
    );
    expect(
      imported.paragraphs.map(
        /** Checks imports an exported later page section through native page descriptors. @param paragraph - Paragraph. @returns Test completion or assertion result. */ (
          paragraph,
        ) => paragraph.GetText(),
      ),
    ).toEqual(["Before", "After"]);
    expect(imported.FindPageDesc("Converted1")?.GetValue().width).toBe(15120);
    expect((imported.paragraphs[1]?.GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetNumOffset()).toBe(
      1,
    );
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("writes a page section before a table with its own page descriptor", /** Checks writes a page section before a table with its own page descriptor. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  try {
    source.paragraphs[0]?.SetText("Before");
    const alternate = source.MakePageDesc("Table Page", source.GetPageDesc());
    source.ChgPageDesc({ ...alternate.GetValue(), width: 14500 }, "Table Page");
    const table = source.nodes.MakeTableNode("Grid");
    table.GetFrameFormat().SetFormatAttr(new SwFormatPageDesc("Table Page"));
    const row = source.nodes.AppendTableRow(table, 1);
    row.GetTabBoxes()[0]?.GetParagraphs()[0]?.SetText("Cell");
    const rtf = new TextDecoder().decode(RtfExport.WriteDocument(source));
    expect(rtf).toContain(String.raw`\sect\sectd\sectunlocked1\pgwsxn14500`);
    expect(rtf.indexOf(String.raw`\sect\sectd`)).toBeLessThan(rtf.indexOf(String.raw`\trowd`));
  } finally {
    source.Dispose();
  }
});

it("keeps distinct follow-page geometry out of a combined later RTF section", /** Checks keeps distinct follow-page geometry out of a combined later RTF section. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  try {
    source.paragraphs[0]?.SetText("Before");
    const first = source.MakePageDesc("New First", source.GetPageDesc());
    source.ChgPageDesc({ ...first.GetValue(), width: 15000 }, "New First");
    const follow = source.MakePageDesc("New Follow", source.GetPageDesc());
    source.ChgPageDesc({ ...follow.GetValue(), width: 13000 }, "New Follow");
    first.SetFollow(follow);
    source.nodes.MakeTextNode("After").SetAttr(new SwFormatPageDesc("New First"));
    const rtf = new TextDecoder().decode(RtfExport.WriteDocument(source));
    const laterSection = rtf.slice(rtf.indexOf(String.raw`\sect\sectd`));
    expect(laterSection).toContain(String.raw`\pgwsxn15000`);
    expect(laterSection).not.toContain(String.raw`\pgwsxn13000`);
    expect(laterSection).not.toContain(String.raw`\titlepg`);
  } finally {
    source.Dispose();
  }
});

it("combines matching first/follow pages and advances the current section page", /** Checks combines matching first/follow pages and advances the current section page. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  try {
    source.paragraphs[0]?.SetText("Before");
    const first = source.MakePageDesc("New First", source.GetPageDesc());
    const follow = source.MakePageDesc("New Follow", source.GetPageDesc());
    first.SetFollow(follow);
    source.nodes.MakeTextNode("After").SetAttr(new SwFormatPageDesc("New First"));
    source.nodes.MakeTextNode("Follow").SetAttr(new SwFormatPageDesc("New Follow"));
    const rtf = new TextDecoder().decode(RtfExport.WriteDocument(source));
    expect(rtf.match(/\\sect\\sectd/gu)).toHaveLength(1);
    expect(rtf.slice(rtf.indexOf(String.raw`\sect\sectd`))).toContain(String.raw`\titlepg`);
  } finally {
    source.Dispose();
  }
});

it("splits a text node at a soft page boundary only for a distinct follow section", /** Checks splits a text node at a soft page boundary only for a distinct follow section. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  let imported: SwDoc | undefined;
  try {
    const paragraph = source.paragraphs[0];
    if (paragraph === undefined) throw new Error("Missing first paragraph.");
    const fragment = createWriterTextFragment(paragraph, [
      { text: "Alpha", attributes: { bold: true }, hyperlink: { url: "https://example.test/a" } },
      { text: "Beta", attributes: { italic: true }, hyperlink: { url: "https://example.test/a" } },
    ]);
    paragraph.SetText(fragment.text);
    paragraph.SetTextHints(fragment.hints);
    source.GetIDocumentMarkAccess().MakeMark(paragraph, 5, "Boundary");
    source.GetIDocumentMarkAccess().AddSoftPageBreak(paragraph, 5);
    const follow = source.MakePageDesc("Follow", source.GetPageDesc());
    source.ChgPageDesc({ ...follow.GetValue(), width: 15000 }, "Follow");
    source.GetPageDesc().SetFollow(follow);
    const rtf = new TextDecoder().decode(RtfExport.WriteDocument(source));
    expect(rtf.match(/\\pard/gu)?.length).toBe(2);
    expect(rtf.match(/\\sect\\sectd/gu)?.length).toBe(1);
    expect(rtf.match(/HYPERLINK/gu)?.length).toBe(2);
    expect(rtf).toContain(String.raw`\pgwsxn15000`);
    expect(rtf.indexOf("Alpha")).toBeLessThan(rtf.indexOf(String.raw`\sect\sectd`));
    expect(rtf.indexOf(String.raw`\sect\sectd`)).toBeLessThan(rtf.indexOf("Beta"));
    expect(rtf.indexOf("Boundary")).toBeGreaterThan(rtf.indexOf(String.raw`\sect\sectd`));
    imported = new RtfDocumentImpl().Resolve(
      new RtfTokenizer(new TextEncoder().encode(rtf)).Tokenize(),
    );
    expect(
      imported.paragraphs.map(
        /** Checks splits a text node at a soft page boundary only for a distinct follow section. @param node - Node. @returns Test completion or assertion result. */ (
          node,
        ) => node.GetText(),
      ),
    ).toEqual(["Alpha", "Beta"]);
    expect(imported.FindPageDesc("Converted1")?.GetValue().width).toBe(15000);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("ignores soft page positions without a distinct follow-style section", /** Checks ignores soft page positions without a distinct follow-style section. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  try {
    const paragraph = source.paragraphs[0];
    if (paragraph === undefined) throw new Error("Missing first paragraph.");
    paragraph.SetText("AlphaBeta");
    source.GetIDocumentMarkAccess().AddSoftPageBreak(paragraph, 5);
    const follow = source.MakePageDesc("Same Geometry", source.GetPageDesc());
    source.GetPageDesc().SetFollow(follow);
    const rtf = new TextDecoder().decode(RtfExport.WriteDocument(source));
    expect(rtf.match(/\\pard/gu)?.length).toBe(1);
    expect(rtf).not.toContain(String.raw`\sect\sectd`);
  } finally {
    source.Dispose();
  }
});

it("preserves source RTF suppression for a soft split after a preceding text node", /** Checks preserves source RTF suppression for a soft split after a preceding text node. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  try {
    source.paragraphs[0]?.SetText("Lead");
    const split = source.nodes.MakeTextNode("AlphaBeta");
    source.GetIDocumentMarkAccess().AddSoftPageBreak(split, 5);
    const follow = source.MakePageDesc("Follow", source.GetPageDesc());
    source.ChgPageDesc({ ...follow.GetValue(), width: 15000 }, "Follow");
    source.GetPageDesc().SetFollow(follow);
    const rtf = new TextDecoder().decode(RtfExport.WriteDocument(source));
    expect(rtf.match(/\\pard/gu)?.length).toBe(3);
    expect(rtf).not.toContain(String.raw`\sect\sectd`);
  } finally {
    source.Dispose();
  }
});

it("keeps the source RTF section suppression when a page follows the previous page", /** Checks keeps the source RTF section suppression when a page follows the previous page. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  try {
    source.paragraphs[0]?.SetText("First");
    const follow = source.MakePageDesc("Follow", source.GetPageDesc());
    source.GetPageDesc().SetFollow(follow);
    const next = source.nodes.MakeTextNode("Second");
    next.SetAttr(new SwFormatPageDesc("Follow", 9));
    const rtf = new TextDecoder().decode(RtfExport.WriteDocument(source));
    expect(rtf).toContain(String.raw`\titlepg`);
    expect(rtf).not.toContain(String.raw`\sect\sectd`);
    expect(rtf).not.toContain(String.raw`\pgnstarts9`);
  } finally {
    source.Dispose();
  }
});

it.each([1, 2, 3, 5, 6])(
  "retains source RTF no-op for represented break mode %i without columns or sections",
  /** Checks retains source RTF no-op for represented break mode %i without columns or sections. @param mode - Mode. @returns Test completion or assertion result. */ (
    mode,
  ) => {
    const source = createWriterDocument();
    try {
      const first = source.paragraphs[0];
      if (first === undefined) throw new Error("Missing paragraph.");
      first.SetText("First");
      const second = source.nodes.MakeTextNode("Second");
      second.SetAttr(new SfxInt16Item(RES_BREAK, mode));
      const rtf = new TextDecoder().decode(RtfExport.WriteDocument(source));
      expect(rtf).not.toMatch(/\\(?:pagebb|column|page)(?![a-z])/u);
    } finally {
      source.Dispose();
    }
  },
);

it.each([
  ["fixed", -300, 0, 300],
  ["minimum", 360, 0, 360],
  ["proportional", 360, 1, 150],
] as const)(
  "round trips %s native line spacing through RTF sl controls",
  /** Checks round trips %s native line spacing through RTF sl controls. @param mode - Mode. @param space - Space. @param multi - Multi. @param value - Value. @returns Test completion or assertion result. */ (
    mode,
    space,
    multi,
    value,
  ) => {
    const source = createWriterDocument();
    const paragraph = source.paragraphs[0];
    if (paragraph === undefined) throw new Error("Missing paragraph.");
    paragraph.SetText(mode);
    const item = new SvxLineSpacingItem(200, RES_PARATR_LINESPACING);
    if (mode === "proportional") item.SetPropLineSpace(value);
    else {
      item.SetLineHeight(value);
      if (mode === "fixed") item.SetLineSpaceRule(SvxLineSpaceRule.Fix);
    }
    paragraph.SetAttr(item);
    let imported;
    try {
      const bytes = RtfExport.WriteDocument(source);
      expect(new TextDecoder().decode(bytes)).toContain(`\\sl${space}\\slmult${multi}`);
      imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
      const result = imported.paragraphs[0]?.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem;
      expect(result.GetLineSpaceRule()).toBe(
        mode === "fixed"
          ? SvxLineSpaceRule.Fix
          : mode === "minimum"
            ? SvxLineSpaceRule.Min
            : SvxLineSpaceRule.Auto,
      );
      expect(mode === "proportional" ? result.GetPropLineSpace() : result.GetLineHeight()).toBe(
        value,
      );
    } finally {
      imported?.Dispose();
      source.Dispose();
    }
  },
);

it("adds measured font height to native RTF leading as the pinned Word exporter does", /** Checks adds measured font height to native RTF leading as the pinned Word exporter does. @returns Test completion or assertion result. */ () => {
  const measured: [string, number][] = [];
  const source = new SwDoc({
    defaultFontDevice: {
      getDefaultFont:
        /** Checks adds measured font height to native RTF leading as the pinned Word exporter does. @returns Test completion or assertion result. */ () =>
          undefined,
      measureTextHeight:
        /** Checks adds measured font height to native RTF leading as the pinned Word exporter does. @param family - Family. @param height - Height. @returns Test completion or assertion result. */ (
          family,
          height,
        ) => {
          measured.push([family, height]);
          return 270;
        },
    },
  });
  const paragraph = source.paragraphs[0];
  if (paragraph === undefined) throw new Error("Missing paragraph.");
  paragraph.SetText("Leading");
  const item = new SvxLineSpacingItem(200, RES_PARATR_LINESPACING);
  item.SetInterLineSpace(80);
  paragraph.SetAttr(item);
  let imported;
  try {
    const bytes = RtfExport.WriteDocument(source);
    expect(new TextDecoder().decode(bytes)).toContain("\\sl350\\slmult0");
    expect(measured).toHaveLength(1);
    expect(measured[0]?.[1]).toBeGreaterThan(0);
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    const result = imported.paragraphs[0]?.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem;
    expect(result.GetLineSpaceRule()).toBe(SvxLineSpaceRule.Min);
    expect(result.GetLineHeight()).toBe(350);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("measures the actual CJK paragraph font when exporting native RTF leading", /** Checks measures the actual CJK paragraph font when exporting native RTF leading. @returns Test completion or assertion result. */ () => {
  const measured: [string, number][] = [];
  const source = new SwDoc({
    defaultFontDevice: {
      getDefaultFont:
        /** Checks measures the actual CJK paragraph font when exporting native RTF leading. @returns Test completion or assertion result. */ () =>
          undefined,
      measureTextHeight:
        /** Checks measures the actual CJK paragraph font when exporting native RTF leading. @param family - Family. @param height - Height. @returns Test completion or assertion result. */ (
          family,
          height,
        ) => {
          measured.push([family, height]);
          return 300;
        },
    },
  });
  try {
    const paragraph = source.paragraphs[0];
    if (paragraph === undefined) throw new Error("Missing paragraph.");
    paragraph.SetText("日本語");
    const font = new SvxFontItem(RES_CHRATR_CJK_FONT);
    font.SetFamilyName("CJK Test");
    paragraph.SetAttr(font);
    paragraph.SetAttr(new SvxFontHeightItem(360, 100, RES_CHRATR_CJK_FONTSIZE));
    const spacing = new SvxLineSpacingItem(200, RES_PARATR_LINESPACING);
    spacing.SetInterLineSpace(40);
    paragraph.SetAttr(spacing);
    expect(new TextDecoder().decode(RtfExport.WriteDocument(source))).toContain("\\sl340\\slmult0");
    expect(measured).toEqual([["CJK Test", 360]]);
  } finally {
    source.Dispose();
  }
});

it("round trips point bookmarks inside formatted text and table cells", /** Checks round trips point bookmarks inside formatted text and table cells. @returns Test completion or assertion result. */ () => {
  const source = createWriterDocument();
  const body = source.paragraphs[0];
  if (body === undefined) throw new Error("Missing paragraph.");
  body.SetText("BeforeAfter");
  source.GetIDocumentMarkAccess().MakeMark(body, 6, "Midpoint");
  const table = source.nodes.MakeTableNode("Grid", {}, body);
  const cell = source.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0];
  if (cell === undefined) throw new Error("Missing cell.");
  cell.SetText("Cell");
  source.GetIDocumentMarkAccess().MakeMark(cell, 2, "CellPoint");
  let imported;
  try {
    const bytes = RtfExport.WriteDocument(source);
    expect(new TextDecoder().decode(bytes)).toContain("\\bkmkstart Midpoint");
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(
      imported
        .GetIDocumentMarkAccess()
        .GetBookmarks()
        .map(
          /** Checks round trips point bookmarks inside formatted text and table cells. @param mark - Mark. @returns Test completion or assertion result. */ (
            mark,
          ) => [mark.GetName(), mark.GetMarkPos().GetContentIndex()],
        ),
    ).toEqual([
      ["Midpoint", 6],
      ["CellPoint", 2],
    ]);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});
