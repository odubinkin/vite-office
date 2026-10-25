/** @fileoverview RTF writer round trips through the represented native reader and Writer hints. */
import { expect, it } from "vitest";
import { createWriterDocument } from "../../core/doc/doc";
import { applyWriterParagraphList } from "../../core/doc/list";
import { SwTableNode } from "../../core/docnode/node";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
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
