/** @fileoverview Verifies native Writer Markdown output and represented round trips. */
import { expect, it } from "vitest";
import { createWriterDocument } from "../../core/doc/doc";
import { applyWriterParagraphList } from "../../core/doc/list";
import { SwTableNode } from "../../core/docnode/node";
import { MarkdownReader } from "./swmd";
import { SwMDWriter } from "./wrtmd";

it("round trips headings, list items and ordinary escaped text", /** Checks native style/numbering and escaping. @returns Nothing. */ () => {
  const source = createWriterDocument();
  const heading = source.paragraphs[0];
  if (heading === undefined) throw new Error("Missing body paragraph.");
  heading.SetText("Heading");
  heading.ChgFormatColl(source.GetTextFormatColl("heading-2"));
  const first = source.nodes.MakeTextNode("One *literal*");
  const second = source.nodes.MakeTextNode("Two");
  applyWriterParagraphList(first, { kind: "numbered", level: 0 });
  applyWriterParagraphList(second, { kind: "numbered", level: 0 });
  let imported;
  try {
    const markdown = new TextDecoder().decode(new SwMDWriter().WriteDocument(source));
    expect(markdown).toContain("## Heading");
    expect(markdown).toContain("One \\*literal\\*");
    imported = new MarkdownReader().Read(new TextEncoder().encode(markdown));
    expect(
      imported.paragraphs.map((node) => [
        node.GetParagraphStyle(),
        node.GetText(),
        node.GetListKind(),
      ]),
    ).toEqual([
      ["heading-2", "Heading", "none"],
      ["default", "One *literal*", "numbered"],
      ["default", "Two", "numbered"],
    ]);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("writes a Markdown table from actual Writer rows", /** Checks table writer and parser agree on body order. @returns Nothing. */ () => {
  const source = createWriterDocument();
  source.paragraphs[0]?.SetText("Before");
  const table = source.nodes.MakeTableNode("Grid", {}, source.paragraphs[0]);
  const first = source.nodes.AppendTableRow(table, 2);
  first.GetTabBoxes()[0]?.GetParagraphs()[0]?.SetText("Name");
  first.GetTabBoxes()[1]?.GetParagraphs()[0]?.SetText("Value");
  first.GetTabBoxes()[1]?.GetParagraphs()[0]?.SetParagraphAlignment("right");
  const second = source.nodes.AppendTableRow(table, 2);
  second.GetTabBoxes()[0]?.GetParagraphs()[0]?.SetText("A");
  second.GetTabBoxes()[1]?.GetParagraphs()[0]?.SetText("42");
  let imported;
  try {
    const markdown = new TextDecoder().decode(new SwMDWriter().WriteDocument(source));
    expect(markdown).toContain("| - | -: |");
    imported = new MarkdownReader().Read(new TextEncoder().encode(markdown));
    expect(imported.GetNodes().getBodyContent()[1]).toBeInstanceOf(SwTableNode);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});

it("keeps consecutive preformatted paragraphs inside one native Markdown fence", () => {
  const source = createWriterDocument();
  const first = source.paragraphs[0];
  if (first === undefined) throw new Error("Missing paragraph.");
  first.SetText("first");
  first.ChgFormatColl(source.GetTextFormatColl("preformatted-text"));
  const second = source.nodes.MakeTextNode("second");
  second.ChgFormatColl(source.GetTextFormatColl("preformatted-text"));
  try {
    expect(new TextDecoder().decode(new SwMDWriter().WriteDocument(source))).toBe(
      "```\nfirst\nsecond\n```\n",
    );
  } finally {
    source.Dispose();
  }
});
