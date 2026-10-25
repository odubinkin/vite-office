/** @fileoverview RTF writer round trips through the represented native reader and Writer hints. */
import { expect, it } from "vitest";
import { createWriterDocument, SwDoc } from "../../core/doc/doc";
import { applyWriterParagraphList } from "../../core/doc/list";
import { SwNumFormat } from "../../core/doc/number";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { BorderLineStyle } from "../../../../offapi/com/sun/star/table/BorderLineStyle";
import { Color } from "../../../../tools/inc/color";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import * as NumberingType from "../../../../offapi/com/sun/star/style/NumberingType";
import { SwTableNode } from "../../core/docnode/node";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { SwpHints } from "../../core/txtnode/ndhints";
import { FontStrikeout } from "../../../../tools/inc/fontenum";
import {
  DFLT_ESC_AUTO_SUPER,
  DFLT_ESC_PROP,
  DFLT_ESC_SUPER,
} from "../../../../editeng/inc/escapementitem";
import { SvxFirstLineIndentItem } from "../../../../editeng/inc/lrspitem";
import { SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { SvxFontHeightItem, SvxFontItem } from "../../../../editeng/source/items/textitem";
import { SvxLineSpaceRule } from "../../../../editeng/inc/svxenum";
import { SvxTabAdjust, SvxTabStop, SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import {
  RES_MARGIN_FIRSTLINE,
  RES_UL_SPACE,
  RES_KEEP,
  RES_PARATR_SPLIT,
  RES_PARATR_WIDOWS,
  RES_PARATR_TABSTOP,
  RES_BREAK,
  RES_PAGEDESC,
  RES_PARATR_LINESPACING,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_FONTSIZE,
} from "../../../inc/hintids";
import { createWriterTextFragment } from "../basflt/writer-transfer";
import { RtfDocumentImpl } from "../../writerfilter/rtftok/rtfdocumentimpl";
import { RtfTokenizer } from "../../writerfilter/rtftok/rtftokenizer";
import { RtfExport } from "./rtfexport";

it("round trips text, Unicode, alignment and direct character runs", /** Checks native graph values after writer and tokenizer. @returns Nothing. */ () => {
  const source = createWriterDocument();
  const paragraph = source.paragraphs[0];
  if (paragraph === undefined) throw new Error("Missing paragraph.");
  const fragment = createWriterTextFragment(paragraph, [
    { text: "Plain ", attributes: { bold: false, italic: false, underline: false } },
    {
      text: "Ж",
      attributes: {
        bold: true,
        italic: false,
        underline: false,
        fontFamily: "Arial",
        color: "#ff0000",
      },
    },
  ]);
  paragraph.SetText(fragment.text);
  paragraph.SetTextHints(fragment.hints);
  paragraph.SetParagraphAlignment("center");
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(imported.paragraphs[0]?.GetText()).toBe("Plain Ж");
    expect(imported.paragraphs[0]?.GetParagraphAlignment()).toBe("center");
    expect(projectWriterTextRuns(imported.paragraphs[0])?.at(-1)?.attributes).toMatchObject({
      bold: true,
      color: "#ff0000",
      fontFamily: "Arial",
    });
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("keeps the source RTF table-header export omission for represented repeat rows", () => {
  const document = createWriterDocument();
  try {
    const first = document.paragraphs[0];
    if (first === undefined) throw new Error("Missing paragraph.");
    const table = document.nodes.InsertTable(first, "Header Table", {});
    for (let index = 0; index < 2; index++) {
      const line = document.nodes.AppendTableRow(table, 1);
      line.GetTabBoxes()[0]?.GetParagraphs()[0]?.SetText(`Row ${index}`);
    }
    table.SetRowsToRepeat(1);
    const rtf = new TextDecoder().decode(new RtfExport().ExportDocument(document));
    expect(rtf).toContain("\\trowd");
    expect(rtf).not.toContain("\\trhdr");
  } finally {
    document.Dispose();
  }
});

it("round trips represented paragraph styles through the RTF stylesheet", () => {
  const source = createWriterDocument();
  const heading = source.paragraphs[0];
  if (heading === undefined) throw new Error("Missing paragraph.");
  heading.SetText("Heading");
  heading.ChgFormatColl(source.GetTextFormatColl("heading-2"));
  const quote = source.nodes.MakeTextNode("Quote");
  quote.ChgFormatColl(source.GetTextFormatColl("quotations"));
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    const encoded = new TextDecoder().decode(bytes);
    expect(encoded).toContain("\\stylesheet");
    expect(encoded).toMatch(/\{\\s0[^}]*\\b[^}]*Heading 2;/u);
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(imported.paragraphs.map((node) => node.GetParagraphStyle())).toEqual([
      "heading-2",
      "quotations",
    ]);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("round trips native paragraph spacing, keep, split and widow controls", () => {
  const source = createWriterDocument();
  const paragraph = source.paragraphs[0];
  if (paragraph === undefined) throw new Error("Missing paragraph.");
  paragraph.SetText("Together");
  paragraph.SetAttr(new SvxULSpaceItem(120, 240, RES_UL_SPACE, true));
  paragraph.SetAttr(new SfxBoolItem(RES_KEEP, true));
  paragraph.SetAttr(new SfxBoolItem(RES_PARATR_SPLIT, false));
  paragraph.SetAttr(new SfxInt16Item(RES_PARATR_WIDOWS, 0));
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    const encoded = new TextDecoder().decode(bytes);
    expect(encoded).toContain("\\sb120\\sa240\\contextualspace\\keepn\\keep\\nowidctlpar");
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    const result = imported.paragraphs[0];
    expect((result?.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(120);
    expect((result?.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(240);
    expect((result?.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetContext()).toBe(true);
    expect((result?.GetAttr(RES_KEEP) as SfxBoolItem).GetValue()).toBe(true);
    expect((result?.GetAttr(RES_PARATR_SPLIT) as SfxBoolItem).GetValue()).toBe(false);
    expect((result?.GetAttr(RES_PARATR_WIDOWS) as SfxInt16Item).GetValue()).toBe(0);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("retains native spacing and keep properties on a named RTF paragraph style", () => {
  const source = createWriterDocument();
  const style = source.GetTextFormatColl("heading-2");
  style.SetFormatAttr(new SvxULSpaceItem(80, 160, RES_UL_SPACE, true));
  style.SetFormatAttr(new SfxBoolItem(RES_KEEP, true));
  const paragraph = source.paragraphs[0];
  if (paragraph === undefined) throw new Error("Missing paragraph.");
  paragraph.SetText("Styled");
  paragraph.ChgFormatColl(style);
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    const result = imported.paragraphs[0];
    expect(result?.GetParagraphStyle()).toBe("heading-2");
    expect((result?.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(80);
    expect((result?.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(160);
    expect((result?.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetContext()).toBe(true);
    expect((result?.GetAttr(RES_KEEP) as SfxBoolItem).GetValue()).toBe(true);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("exports native relative tab stops as Word absolute positions with alignment and leaders", () => {
  const source = createWriterDocument();
  const paragraph = source.paragraphs[0];
  if (paragraph === undefined) throw new Error("Missing paragraph.");
  paragraph.SetText("Tabs");
  paragraph.SetParagraphTextLeftMargin(360);
  const tabs = new SvxTabStopItem(0, 0, SvxTabAdjust.Default, RES_PARATR_TABSTOP);
  tabs.Insert(new SvxTabStop(720, SvxTabAdjust.Right, "\0", "."));
  tabs.Insert(new SvxTabStop(1440, SvxTabAdjust.Decimal, "\0", "_"));
  paragraph.SetAttr(tabs);
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    const encoded = new TextDecoder().decode(bytes);
    expect(encoded).toContain("\\deftab1134");
    expect(encoded).toContain("\\tldot\\tqr\\tx1080\\tlul\\tqdec\\tx1800");
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(imported.GetDocumentSettingManager().get("TABS_RELATIVE_TO_INDENT")).toBe(false);
    const result = imported.paragraphs[0]?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
    expect(result.Count()).toBe(2);
    expect(result.At(0).GetTabPos()).toBe(1080);
    expect(result.At(0).GetAdjustment()).toBe(SvxTabAdjust.Right);
    expect(result.At(0).GetFill()).toBe(".");
    expect(result.At(1).GetTabPos()).toBe(1800);
    expect(result.At(1).GetAdjustment()).toBe(SvxTabAdjust.Decimal);
    expect(result.At(1).GetFill()).toBe("_");
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("retains explicit native tab stops in an RTF named paragraph style", () => {
  const source = createWriterDocument();
  const style = source.GetTextFormatColl("heading-2");
  const tabs = new SvxTabStopItem(0, 0, SvxTabAdjust.Default, RES_PARATR_TABSTOP);
  tabs.Insert(new SvxTabStop(900, SvxTabAdjust.Center, "\0", "."));
  style.SetFormatAttr(tabs);
  const paragraph = source.paragraphs[0];
  if (paragraph === undefined) throw new Error("Missing paragraph.");
  paragraph.SetText("Styled tabs");
  paragraph.ChgFormatColl(style);
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    expect(new TextDecoder().decode(bytes)).toMatch(/\\s\d+[^}]*\\tldot\\tqc\\tx900/u);
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    const result = imported.paragraphs[0]?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
    expect(result.Count()).toBe(1);
    expect(result.At(0).GetTabPos()).toBe(900);
    expect(result.At(0).GetAdjustment()).toBe(SvxTabAdjust.Center);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("emits native page-before break controls and preserves the source first-run import rule", () => {
  const source = createWriterDocument();
  const first = source.paragraphs[0];
  if (first === undefined) throw new Error("Missing first paragraph.");
  first.SetText("First");
  first.SetAttr(new SfxInt16Item(RES_BREAK, 4));
  const second = source.nodes.MakeTextNode("Second");
  second.SetAttr(new SfxInt16Item(RES_BREAK, 4));
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    expect(new TextDecoder().decode(bytes).match(/\\pagebb/gu)).toHaveLength(2);
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect((imported.paragraphs[0]?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(0);
    expect((imported.paragraphs[1]?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(4);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("writes initial native page geometry to RTF global and first-section controls", () => {
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
    const bytes = new RtfExport().ExportDocument(source);
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

it("selects the first RTF page descriptor inherited from a paragraph style", () => {
  const source = createWriterDocument();
  try {
    const paragraph = source.paragraphs[0];
    if (paragraph === undefined) throw new Error("Missing paragraph.");
    const alternate = source.MakePageDesc("Styled Page", source.GetPageDesc());
    source.ChgPageDesc({ ...alternate.GetValue(), width: 14000 }, alternate.GetName());
    const style = source.MakeTextFormatColl("Styled", source.GetTextFormatColl("default"));
    style.SetFormatAttr(new SwFormatPageDesc("Styled Page"));
    paragraph.ChgFormatColl(style);
    const rtf = new TextDecoder().decode(new RtfExport().ExportDocument(source));
    expect(rtf).toContain(String.raw`{\*\pgdscno1}`);
    expect(rtf).toContain(String.raw`\paperw14000`);
  } finally {
    source.Dispose();
  }
});

it("writes a native RTF page section and restart before a later paragraph", () => {
  const source = createWriterDocument();
  try {
    source.paragraphs[0]?.SetText("Before");
    const alternate = source.MakePageDesc("Second Page", source.GetPageDesc());
    source.ChgPageDesc({ ...alternate.GetValue(), width: 15120, leftMargin: 990 }, "Second Page");
    const next = source.nodes.MakeTextNode("After");
    next.SetAttr(new SwFormatPageDesc("Second Page", 7));
    const rtf = new TextDecoder().decode(new RtfExport().ExportDocument(source));
    expect(rtf).toContain(
      String.raw`\sect\sectd\sectunlocked1\pgwsxn15120\pghsxn15840\marglsxn990`,
    );
    expect(rtf).toContain(String.raw`\pgnstarts7\pgnrestart\sbkpage`);
    expect(rtf.indexOf(String.raw`\sect\sectd`)).toBeLessThan(rtf.indexOf("After"));
  } finally {
    source.Dispose();
  }
});

it("imports an exported later page section through native page descriptors", () => {
  const source = createWriterDocument();
  let imported: SwDoc | undefined;
  try {
    source.paragraphs[0]?.SetText("Before");
    const alternate = source.MakePageDesc("Second Page", source.GetPageDesc());
    source.ChgPageDesc({ ...alternate.GetValue(), width: 15120 }, "Second Page");
    const next = source.nodes.MakeTextNode("After");
    next.SetAttr(new SwFormatPageDesc("Second Page", 7));
    imported = new RtfDocumentImpl().Resolve(
      new RtfTokenizer(new RtfExport().ExportDocument(source)).Tokenize(),
    );
    expect(imported.paragraphs.map((paragraph) => paragraph.GetText())).toEqual([
      "Before",
      "After",
    ]);
    expect(imported.FindPageDesc("Converted1")?.GetValue().width).toBe(15120);
    expect((imported.paragraphs[1]?.GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetNumOffset()).toBe(
      1,
    );
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("writes a page section before a table with its own page descriptor", () => {
  const source = createWriterDocument();
  try {
    source.paragraphs[0]?.SetText("Before");
    const alternate = source.MakePageDesc("Table Page", source.GetPageDesc());
    source.ChgPageDesc({ ...alternate.GetValue(), width: 14500 }, "Table Page");
    const table = source.nodes.MakeTableNode("Grid");
    table.GetFrameFormat().SetFormatAttr(new SwFormatPageDesc("Table Page"));
    const row = source.nodes.AppendTableRow(table, 1);
    row.GetTabBoxes()[0]?.GetParagraphs()[0]?.SetText("Cell");
    const rtf = new TextDecoder().decode(new RtfExport().ExportDocument(source));
    expect(rtf).toContain(String.raw`\sect\sectd\sectunlocked1\pgwsxn14500`);
    expect(rtf.indexOf(String.raw`\sect\sectd`)).toBeLessThan(rtf.indexOf(String.raw`\trowd`));
  } finally {
    source.Dispose();
  }
});

it("keeps distinct follow-page geometry out of a combined later RTF section", () => {
  const source = createWriterDocument();
  try {
    source.paragraphs[0]?.SetText("Before");
    const first = source.MakePageDesc("New First", source.GetPageDesc());
    source.ChgPageDesc({ ...first.GetValue(), width: 15000 }, "New First");
    const follow = source.MakePageDesc("New Follow", source.GetPageDesc());
    source.ChgPageDesc({ ...follow.GetValue(), width: 13000 }, "New Follow");
    first.SetFollow(follow);
    source.nodes.MakeTextNode("After").SetAttr(new SwFormatPageDesc("New First"));
    const rtf = new TextDecoder().decode(new RtfExport().ExportDocument(source));
    const laterSection = rtf.slice(rtf.indexOf(String.raw`\sect\sectd`));
    expect(laterSection).toContain(String.raw`\pgwsxn15000`);
    expect(laterSection).not.toContain(String.raw`\pgwsxn13000`);
    expect(laterSection).not.toContain(String.raw`\titlepg`);
  } finally {
    source.Dispose();
  }
});

it("combines matching first/follow pages and advances the current section page", () => {
  const source = createWriterDocument();
  try {
    source.paragraphs[0]?.SetText("Before");
    const first = source.MakePageDesc("New First", source.GetPageDesc());
    const follow = source.MakePageDesc("New Follow", source.GetPageDesc());
    first.SetFollow(follow);
    source.nodes.MakeTextNode("After").SetAttr(new SwFormatPageDesc("New First"));
    source.nodes.MakeTextNode("Follow").SetAttr(new SwFormatPageDesc("New Follow"));
    const rtf = new TextDecoder().decode(new RtfExport().ExportDocument(source));
    expect(rtf.match(/\\sect\\sectd/gu)).toHaveLength(1);
    expect(rtf.slice(rtf.indexOf(String.raw`\sect\sectd`))).toContain(String.raw`\titlepg`);
  } finally {
    source.Dispose();
  }
});

it("splits a text node at a soft page boundary only for a distinct follow section", () => {
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
    const rtf = new TextDecoder().decode(new RtfExport().ExportDocument(source));
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
    expect(imported.paragraphs.map((node) => node.GetText())).toEqual(["Alpha", "Beta"]);
    expect(imported.FindPageDesc("Converted1")?.GetValue().width).toBe(15000);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("ignores soft page positions without a distinct follow-style section", () => {
  const source = createWriterDocument();
  try {
    const paragraph = source.paragraphs[0];
    if (paragraph === undefined) throw new Error("Missing first paragraph.");
    paragraph.SetText("AlphaBeta");
    source.GetIDocumentMarkAccess().AddSoftPageBreak(paragraph, 5);
    const follow = source.MakePageDesc("Same Geometry", source.GetPageDesc());
    source.GetPageDesc().SetFollow(follow);
    const rtf = new TextDecoder().decode(new RtfExport().ExportDocument(source));
    expect(rtf.match(/\\pard/gu)?.length).toBe(1);
    expect(rtf).not.toContain(String.raw`\sect\sectd`);
  } finally {
    source.Dispose();
  }
});

it("preserves source RTF suppression for a soft split after a preceding text node", () => {
  const source = createWriterDocument();
  try {
    source.paragraphs[0]?.SetText("Lead");
    const split = source.nodes.MakeTextNode("AlphaBeta");
    source.GetIDocumentMarkAccess().AddSoftPageBreak(split, 5);
    const follow = source.MakePageDesc("Follow", source.GetPageDesc());
    source.ChgPageDesc({ ...follow.GetValue(), width: 15000 }, "Follow");
    source.GetPageDesc().SetFollow(follow);
    const rtf = new TextDecoder().decode(new RtfExport().ExportDocument(source));
    expect(rtf.match(/\\pard/gu)?.length).toBe(3);
    expect(rtf).not.toContain(String.raw`\sect\sectd`);
  } finally {
    source.Dispose();
  }
});

it("keeps the source RTF section suppression when a page follows the previous page", () => {
  const source = createWriterDocument();
  try {
    source.paragraphs[0]?.SetText("First");
    const follow = source.MakePageDesc("Follow", source.GetPageDesc());
    source.GetPageDesc().SetFollow(follow);
    const next = source.nodes.MakeTextNode("Second");
    next.SetAttr(new SwFormatPageDesc("Follow", 9));
    const rtf = new TextDecoder().decode(new RtfExport().ExportDocument(source));
    expect(rtf).toContain(String.raw`\titlepg`);
    expect(rtf).not.toContain(String.raw`\sect\sectd`);
    expect(rtf).not.toContain(String.raw`\pgnstarts9`);
  } finally {
    source.Dispose();
  }
});

it.each([1, 2, 3, 5, 6])(
  "retains source RTF no-op for represented break mode %i without columns or sections",
  (mode) => {
    const source = createWriterDocument();
    try {
      const first = source.paragraphs[0];
      if (first === undefined) throw new Error("Missing paragraph.");
      first.SetText("First");
      const second = source.nodes.MakeTextNode("Second");
      second.SetAttr(new SfxInt16Item(RES_BREAK, mode));
      const rtf = new TextDecoder().decode(new RtfExport().ExportDocument(source));
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
  (mode, space, multi, value) => {
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
      const bytes = new RtfExport().ExportDocument(source);
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

it("adds measured font height to native RTF leading as the pinned Word exporter does", () => {
  const measured: [string, number][] = [];
  const source = new SwDoc({
    defaultFontDevice: {
      getDefaultFont: () => undefined,
      measureTextHeight: (family, height) => {
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
    const bytes = new RtfExport().ExportDocument(source);
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

it("measures the actual CJK paragraph font when exporting native RTF leading", () => {
  const measured: [string, number][] = [];
  const source = new SwDoc({
    defaultFontDevice: {
      getDefaultFont: () => undefined,
      measureTextHeight: (family, height) => {
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
    expect(new TextDecoder().decode(new RtfExport().ExportDocument(source))).toContain(
      "\\sl340\\slmult0",
    );
    expect(measured).toEqual([["CJK Test", 360]]);
  } finally {
    source.Dispose();
  }
});

it("round trips point bookmarks inside formatted text and table cells", () => {
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
    const bytes = new RtfExport().ExportDocument(source);
    expect(new TextDecoder().decode(bytes)).toContain("\\bkmkstart Midpoint");
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(
      imported
        .GetIDocumentMarkAccess()
        .GetBookmarks()
        .map((mark) => [mark.GetName(), mark.GetMarkPos().GetContentIndex()]),
    ).toEqual([
      ["Midpoint", 6],
      ["CellPoint", 2],
    ]);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("round trips table rows and cell paragraph order", /** Checks native RTF row and cell controls against table owners. @returns Nothing. */ () => {
  const source = createWriterDocument();
  const first = source.paragraphs[0];
  if (first === undefined) throw new Error("Missing body paragraph.");
  first.SetText("Before");
  const table = source.nodes.MakeTableNode("Grid", {}, first);
  const row = source.nodes.AppendTableRow(table, 2);
  const rowSize = row.GetFrameSize();
  rowSize.SetHeight(720);
  rowSize.SetHeightSizeType(SwFrameSize.Fixed);
  row.GetFrameFormat().SetFormatAttr(rowSize);
  row.GetFrameFormat().SetFormatAttr(new SwFormatRowSplit(false));
  row.GetTabBoxes()[0]?.GetParagraphs()[0]?.SetText("One");
  const firstBox = row.GetTabBoxes()[0];
  if (firstBox === undefined) throw new Error("Missing table cell.");
  const firstSize = firstBox.GetFrameSize();
  firstSize.SetWidth(1800);
  firstBox.SetFrameSize(firstSize);
  const firstVertical = firstBox.GetVertOrient();
  firstVertical.SetVertOrient(VertOrientation.CENTER);
  firstBox.ClaimFrameFormat().SetFormatAttr(firstVertical);
  const firstBorders = firstBox.GetBox();
  firstBorders.SetLine(
    new SvxBorderLine(new Color(255, 0, 0), 30, BorderLineStyle.SOLID),
    SvxBoxItemLine.TOP,
  );
  firstBorders.SetDistance(120, SvxBoxItemLine.TOP);
  firstBorders.SetDistance(80, SvxBoxItemLine.LEFT);
  firstBox.ClaimFrameFormat().SetFormatAttr(firstBorders);
  source.nodes.AppendTableCellParagraph(firstBox).SetText("More");
  const secondBox = row.GetTabBoxes()[1];
  if (secondBox === undefined) throw new Error("Missing second table cell.");
  const secondSize = secondBox.GetFrameSize();
  secondSize.SetWidth(3000);
  secondBox.SetFrameSize(secondSize);
  const secondVertical = secondBox.GetVertOrient();
  secondVertical.SetVertOrient(VertOrientation.BOTTOM);
  secondBox.ClaimFrameFormat().SetFormatAttr(secondVertical);
  secondBox.GetParagraphs()[0]?.SetText("Two");
  const frame = table.GetFrameFormat();
  const orientation = frame.GetHoriOrient().Clone();
  orientation.SetHoriOrient(HoriOrientation.NONE);
  frame.SetFormatAttr(orientation);
  const margins = frame.GetLRSpace().Clone();
  margins.SetLeft(SvxIndentValue.twips(360));
  frame.SetFormatAttr(margins);
  const tablePadding = frame.GetBox().Clone();
  tablePadding.SetDistance(40, SvxBoxItemLine.TOP);
  tablePadding.SetDistance(60, SvxBoxItemLine.RIGHT);
  frame.SetFormatAttr(tablePadding);
  source.nodes.MakeTextNode("After");
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    expect(new TextDecoder().decode(bytes)).toContain(
      "\\trowd\\trql\\trleft360\\ltrrow\\trrh-720\\trkeep",
    );
    expect(new TextDecoder().decode(bytes)).toContain("\\clbrdrt\\brdrs\\brdrw30\\brdrcf1");
    expect(new TextDecoder().decode(bytes)).toContain("\\clpadfl3\\clpadl120\\clpadft3\\clpadt80");
    expect(new TextDecoder().decode(bytes)).toContain("\\trpaddft3\\trpaddt40");
    expect(new TextDecoder().decode(bytes)).toContain("\\trql\\trleft360");
    expect(new TextDecoder().decode(bytes)).toContain(
      "\\clvertalc\\cellx2160\\clvertalb\\cellx5160",
    );
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(imported.paragraphs.map((node) => node.GetText())).toEqual(["Before", "After"]);
    const restored = imported.GetNodes().getBodyContent()[1];
    expect(restored).toBeInstanceOf(SwTableNode);
    if (restored instanceof SwTableNode) {
      expect(restored.GetTable().GetTabLines()[0]?.GetFrameSize().GetHeight()).toBe(720);
      expect(restored.GetTable().GetTabLines()[0]?.GetFrameSize().GetHeightSizeType()).toBe(
        SwFrameSize.Fixed,
      );
      expect(restored.GetTable().GetTabLines()[0]?.GetRowSplit().GetValue()).toBe(false);
      expect(restored.GetTable().GetHoriOrient()).toBe(HoriOrientation.NONE);
      expect(restored.GetTable().GetFrameFormat().GetLRSpace().ResolveLeft()).toBe(360);
      expect(restored.GetTable().GetFrameFormat().GetBox().GetDistance(SvxBoxItemLine.TOP)).toBe(
        40,
      );
      expect(restored.GetTable().GetFrameFormat().GetFrameSize().GetWidth()).toBe(4800);
      expect(
        restored
          .GetTable()
          .GetTabLines()[0]
          ?.GetTabBoxes()
          .map((box) => box.GetParagraphs().map((node) => node.GetText())),
      ).toEqual([["One", "More"], ["Two"]]);
      expect(
        restored
          .GetTable()
          .GetTabLines()[0]
          ?.GetTabBoxes()
          .map((box) => box.GetFrameSize().GetWidth()),
      ).toEqual([1800, 3000]);
      expect(
        restored
          .GetTable()
          .GetTabLines()[0]
          ?.GetTabBoxes()
          .map((box) => box.GetVertOrient().GetVertOrient()),
      ).toEqual([VertOrientation.CENTER, VertOrientation.BOTTOM]);
      const restoredTop = restored.GetTable().GetTabLines()[0]?.GetTabBoxes()[0]?.GetBox().GetTop();
      expect(restoredTop?.GetWidth()).toBe(30);
      expect(restoredTop?.GetBorderLineStyle()).toBe(BorderLineStyle.SOLID);
      expect(restoredTop?.GetColor().GetRed()).toBe(255);
      expect(
        restored
          .GetTable()
          .GetTabLines()[0]
          ?.GetTabBoxes()[0]
          ?.GetBox()
          .GetDistance(SvxBoxItemLine.TOP),
      ).toBe(120);
      expect(
        restored
          .GetTable()
          .GetTabLines()[0]
          ?.GetTabBoxes()[0]
          ?.GetBox()
          .GetDistance(SvxBoxItemLine.LEFT),
      ).toBe(80);
      expect(
        restored
          .GetTable()
          .GetTabLines()[0]
          ?.GetTabBoxes()[1]
          ?.GetBox()
          .GetDistance(SvxBoxItemLine.TOP),
      ).toBe(40);
      expect(
        restored
          .GetTable()
          .GetTabLines()[0]
          ?.GetTabBoxes()[1]
          ?.GetBox()
          .GetDistance(SvxBoxItemLine.RIGHT),
      ).toBe(60);
    }
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("retains numbered list identity and levels through RTF list tables", /** Checks source-backed list and override controls. @returns Nothing. */ () => {
  const source = createWriterDocument();
  const first = source.paragraphs[0];
  if (first === undefined) throw new Error("Missing paragraph.");
  first.SetText("One");
  const second = source.nodes.MakeTextNode("Two");
  applyWriterParagraphList(first, { kind: "numbered", level: 0 });
  applyWriterParagraphList(second, { kind: "numbered", level: 1 });
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    expect(new TextDecoder().decode(bytes)).toContain("{\\listtext\\pard\\plain ");
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(
      imported.paragraphs.map((node) => [
        node.GetText(),
        node.GetListKind(),
        node.GetAttrListLevel(),
      ]),
    ).toEqual([
      ["One", "numbered", 0],
      ["Two", "numbered", 1],
    ]);
    expect(imported.paragraphs[0]?.GetListId()).toBe(imported.paragraphs[1]?.GetListId());
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("omits RTF list controls for a native uncounted paragraph", () => {
  const source = createWriterDocument();
  const first = source.paragraphs[0];
  if (first === undefined) throw new Error("Missing paragraph.");
  first.SetText("Counted");
  const uncounted = source.nodes.MakeTextNode("Uncounted");
  applyWriterParagraphList(first, { kind: "numbered", level: 0, listId: "Numbers" });
  applyWriterParagraphList(uncounted, { kind: "numbered", level: 0, listId: "Numbers" });
  uncounted.SetCountedInList(false);
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    const body = new TextDecoder().decode(bytes).split("\\par\n");
    expect(body[0]).toContain("\\listtext");
    expect(body[1]).not.toContain("\\listtext");
    expect(body[1]).not.toContain("\\ls");
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(imported.paragraphs.map((node) => node.GetText())).toEqual(["Counted", "Uncounted"]);
    expect(imported.paragraphs[1]?.GetNumRule()).toBeUndefined();
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("retains the pinned RTF original-rule reference on a restarted paragraph", () => {
  const source = createWriterDocument();
  const first = source.paragraphs[0];
  if (first === undefined) throw new Error("Missing paragraph.");
  first.SetText("First");
  const restarted = source.nodes.MakeTextNode("Restarted");
  applyWriterParagraphList(first, { kind: "numbered", level: 0, listId: "Numbers" });
  applyWriterParagraphList(restarted, { kind: "numbered", level: 0, listId: "Numbers" });
  restarted.SetListRestart(true);
  restarted.SetAttrListRestartValue(9);
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    const body = new TextDecoder().decode(bytes).split("\\par\n");
    expect(body[1]).toContain("\\ls1");
    expect(body[1]).toContain("\\listtext");
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(imported.paragraphs[1]?.IsListRestart()).toBe(false);
    expect(imported.paragraphs[1]?.GetNumRule()?.Get(0).GetStart()).toBe(1);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("retains represented level starts and bullet glyphs in RTF list definitions", () => {
  const source = createWriterDocument();
  const first = source.paragraphs[0];
  if (first === undefined) throw new Error("Missing paragraph.");
  first.SetText("First");
  applyWriterParagraphList(first, { kind: "bullet", level: 0, listId: "Bullets" });
  const nested = source.nodes.MakeTextNode("Nested");
  applyWriterParagraphList(nested, { kind: "bullet", level: 1, listId: "Bullets" });
  const rule = nested.GetNumRule();
  if (rule === undefined) throw new Error("Missing rule.");
  const format = new SwNumFormat(rule.Get(1));
  format.SetBulletChar(0x25aa);
  format.SetStart(7);
  rule.Set(1, format);
  source.GetDocumentListsManager().InvalidateAllLists();
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    const encoded = new TextDecoder().decode(bytes);
    expect(encoded).toContain("\\levelstartat7");
    expect(encoded).toContain("\\u9642?");
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(imported.paragraphs[1]?.GetNumRule()?.Get(1).GetStart()).toBe(7);
    expect(imported.paragraphs[1]?.GetNumRule()?.Get(1).GetBulletChar()).toBe(0x25aa);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it.each([
  [SvxNumType.SVX_NUM_ROMAN_UPPER, 1],
  [SvxNumType.SVX_NUM_HANGUL_SYLLABLE_KO, 24],
  [NumberingType.NUMBER_DIGITAL_KO as SvxNumType, 41],
] as const)("retains a numbered rule starting above one with type %i", (numberingType, nfc) => {
  const source = createWriterDocument();
  const first = source.paragraphs[0];
  if (first === undefined) throw new Error("Missing paragraph.");
  first.SetText("Seven");
  applyWriterParagraphList(first, { kind: "numbered", level: 0, listId: "Numbers" });
  const rule = first.GetNumRule();
  if (rule === undefined) throw new Error("Missing rule.");
  const format = new SwNumFormat(rule.Get(0));
  format.SetStart(7);
  format.SetNumberingType(numberingType);
  rule.Set(0, format);
  source.GetDocumentListsManager().InvalidateAllLists();
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    expect(new TextDecoder().decode(bytes)).toContain(`\\levelnfc${nfc}\\levelstartat7`);
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(imported.paragraphs[0]?.GetNumRule()?.Get(0).GetStart()).toBe(7);
    expect(imported.paragraphs[0]?.GetNumRule()?.Get(0).GetNumberingType()).toBe(numberingType);
    expect(imported.paragraphs[0]?.GetListItemNumber()).toBe(7);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("round trips native decoration, hyperlink and first-line paragraph items", /** Checks source RTF controls through writer and mapper. @returns Nothing. */ () => {
  const source = createWriterDocument();
  const node = source.paragraphs[0];
  if (node === undefined) throw new Error("Missing paragraph.");
  const plain = { bold: false, italic: false, underline: false };
  const runs = [
    { text: "Start ", attributes: plain },
    { text: "struck", attributes: { ...plain, strikeout: FontStrikeout.STRIKEOUT_DOUBLE } },
    {
      text: " raised ",
      attributes: { ...plain, escapement: { offset: DFLT_ESC_SUPER, height: DFLT_ESC_PROP } },
    },
    {
      text: "lift ",
      attributes: { ...plain, fontSizeTwips: 400, escapement: { offset: 25, height: 70 } },
    },
    {
      text: "auto ",
      attributes: { ...plain, escapement: { offset: DFLT_ESC_AUTO_SUPER, height: 71 } },
    },
    { text: "link", attributes: plain, hyperlink: { url: "https://example.test" } },
  ];
  node.SetText(runs.map((run) => run.text).join(""));
  const hints = new SwpHints(source.GetAttrPool());
  hints.setTextRuns(runs, node.GetSwAttrSet());
  node.SetTextHints(hints);
  node.SetParagraphFirstLineIndent(-180);
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    const restored = imported.paragraphs[0];
    expect(restored?.GetParagraphFirstLineIndent()).toBe(-180);
    expect(restored?.GetText()).toBe("Start struck raised lift auto link");
    const projected = projectWriterTextRuns(restored);
    expect(projected.find((run) => run.text === "struck")?.attributes.strikeout).toBe(
      FontStrikeout.STRIKEOUT_DOUBLE,
    );
    expect(projected.find((run) => run.text === " raised ")?.attributes.escapement).toEqual({
      offset: DFLT_ESC_SUPER,
      height: DFLT_ESC_PROP,
    });
    expect(projected.find((run) => run.text === "lift ")?.attributes.escapement).toEqual({
      offset: 25,
      height: 70,
    });
    expect(projected.find((run) => run.text === "auto ")?.attributes.escapement).toEqual({
      offset: DFLT_ESC_AUTO_SUPER,
      height: 71,
    });
    expect(projected.find((run) => run.text === "link")?.hyperlink?.url).toBe(
      "https://example.test",
    );
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("exports source-escaped hyperlink URLs and target frames through native RTF fields", () => {
  const source = createWriterDocument();
  const node = source.paragraphs[0];
  if (node === undefined) throw new Error("Missing paragraph.");
  const url = "https://example.test/a\\b";
  const runs = [
    {
      text: "link",
      attributes: { bold: false, italic: false, underline: false },
      hyperlink: { url, targetFrame: "New Window", name: "Omitted by source exporter" },
    },
  ];
  const fragment = createWriterTextFragment(node, runs);
  node.SetText(fragment.text);
  node.SetTextHints(fragment.hints);
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    const rtf = new TextDecoder().decode(bytes);
    expect(rtf).toContain(String.raw`HYPERLINK "https://example.test/a\\\\b" \\t "New Window"`);
    expect(rtf).not.toContain(String.raw`\\o "Omitted by source exporter"`);
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(projectWriterTextRuns(imported.paragraphs[0])[0]?.hyperlink).toEqual({
      url,
      targetFrame: "New Window",
    });
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("keeps one native RTF hyperlink field across differently formatted text runs", () => {
  const source = createWriterDocument();
  const node = source.paragraphs[0];
  if (node === undefined) throw new Error("Missing paragraph.");
  const hyperlink = { url: "https://example.test", targetFrame: "_blank" };
  const fragment = createWriterTextFragment(node, [
    { text: "plain ", hyperlink, attributes: { bold: false, italic: false, underline: false } },
    { text: "bold", hyperlink, attributes: { bold: true, italic: false, underline: false } },
  ]);
  node.SetText(fragment.text);
  node.SetTextHints(fragment.hints);
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    expect(new TextDecoder().decode(bytes).match(/\\field\b/gu)).toHaveLength(1);
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    const runs = projectWriterTextRuns(imported.paragraphs[0]);
    expect(runs.map((run) => [run.text, run.hyperlink, run.attributes.bold])).toEqual([
      ["plain ", hyperlink, false],
      ["bold", hyperlink, true],
    ]);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("retains upstream default-height escapement suppression", /** Checks the source branch that emits only conventional super/sub positions at height 58. @returns Nothing. */ () => {
  const source = createWriterDocument();
  const node = source.paragraphs[0];
  if (node === undefined) throw new Error("Missing paragraph.");
  const runs = [
    {
      text: "custom",
      attributes: {
        bold: false,
        italic: false,
        underline: false,
        escapement: { offset: 25, height: DFLT_ESC_PROP },
      },
    },
  ];
  node.SetText("custom");
  const hints = new SwpHints(source.GetAttrPool());
  hints.setTextRuns(runs, node.GetSwAttrSet());
  node.SetTextHints(hints);
  try {
    const rtf = new TextDecoder().decode(new RtfExport().ExportDocument(source));
    expect(rtf).not.toContain("\\up");
    expect(rtf).not.toContain("\\super");
  } finally {
    source.Dispose();
  }
});

it("exports the authored first-line item without layout short narrowing", /** Checks source FormatFirstLineIndent reads the item value. @returns Nothing. */ () => {
  const source = createWriterDocument();
  const node = source.paragraphs[0];
  if (node === undefined) throw new Error("Missing paragraph.");
  node.SetText("Wide");
  node.SetParagraphFirstLineIndent(40000);
  let imported;
  try {
    const bytes = new RtfExport().ExportDocument(source);
    expect(new TextDecoder().decode(bytes)).toContain("\\fi40000");
    imported = new RtfDocumentImpl().Resolve(new RtfTokenizer(bytes).Tokenize());
    expect(
      (
        imported.paragraphs[0]?.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
      ).ResolveTextFirstLineOffset(),
    ).toBe(40000);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});
