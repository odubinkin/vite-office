/** @fileoverview RTF writer round trips through the represented native reader and Writer hints. */
import { expect, it } from "vitest";
import { createWriterDocument } from "../../core/doc/doc";
import { applyWriterParagraphList } from "../../core/doc/list";
import { SwNumFormat } from "../../core/doc/number";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
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
import { RES_MARGIN_FIRSTLINE } from "../../../inc/hintids";
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
  row.GetTabBoxes()[0]?.GetParagraphs()[0]?.SetText("One");
  const firstBox = row.GetTabBoxes()[0];
  if (firstBox === undefined) throw new Error("Missing table cell.");
  source.nodes.AppendTableCellParagraph(firstBox).SetText("More");
  row.GetTabBoxes()[1]?.GetParagraphs()[0]?.SetText("Two");
  source.nodes.MakeTextNode("After");
  let imported;
  try {
    imported = new RtfDocumentImpl().Resolve(
      new RtfTokenizer(new RtfExport().ExportDocument(source)).Tokenize(),
    );
    expect(imported.paragraphs.map((node) => node.GetText())).toEqual(["Before", "After"]);
    const restored = imported.GetNodes().getBodyContent()[1];
    expect(restored).toBeInstanceOf(SwTableNode);
    if (restored instanceof SwTableNode)
      expect(
        restored
          .GetTable()
          .GetTabLines()[0]
          ?.GetTabBoxes()
          .map((box) => box.GetParagraphs().map((node) => node.GetText())),
      ).toEqual([["One", "More"], ["Two"]]);
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
    imported = new RtfDocumentImpl().Resolve(
      new RtfTokenizer(new RtfExport().ExportDocument(source)).Tokenize(),
    );
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
