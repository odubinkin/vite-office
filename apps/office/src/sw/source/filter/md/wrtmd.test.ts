/** @fileoverview Verifies native Writer Markdown output and represented round trips. */
import { expect, it } from "vitest";
import { createWriterDocument } from "../../core/doc/doc";
import { applyWriterParagraphList } from "../../core/doc/list";
import { SwNumFormat } from "../../core/doc/number";
import { SwTableNode } from "../../core/docnode/node";
import { createWriterTextFragment } from "../basflt/writer-transfer";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { FontWeight } from "../../../../tools/inc/fontenum";
import { RES_CHRATR_CJK_WEIGHT, RES_CHRATR_WEIGHT } from "../../../inc/hintids";
import { createWriterTextColorItem } from "../../core/attr/swatrset";
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

it("keeps one upstream Markdown hyperlink across differently formatted text runs", () => {
  const source = createWriterDocument();
  const paragraph = source.paragraphs[0];
  if (paragraph === undefined) throw new Error("Missing paragraph.");
  const fragment = createWriterTextFragment(paragraph, [
    {
      text: "Red",
      attributes: { bold: false, italic: false, underline: false, color: "#ff0000" },
      hyperlink: { url: "https://example.test" },
    },
    {
      text: "Blue",
      attributes: { bold: false, italic: false, underline: false, color: "#0000ff" },
      hyperlink: { url: "https://example.test" },
    },
  ]);
  paragraph.SetText(fragment.text);
  paragraph.SetTextHints(fragment.hints);
  try {
    expect(new TextDecoder().decode(new SwMDWriter().WriteDocument(source))).toBe(
      "[RedBlue](https://example.test)\n",
    );
  } finally {
    source.Dispose();
  }
});

it("keeps Markdown emphasis open across runs split only by unsupported color", () => {
  const source = createWriterDocument();
  const paragraph = source.paragraphs[0];
  if (paragraph === undefined) throw new Error("Missing paragraph.");
  const fragment = createWriterTextFragment(paragraph, [
    {
      text: "Red",
      attributes: { bold: true, italic: false, underline: false, color: "#ff0000" },
    },
    {
      text: "Blue",
      attributes: { bold: true, italic: false, underline: false, color: "#0000ff" },
    },
  ]);
  paragraph.SetText(fragment.text);
  paragraph.SetTextHints(fragment.hints);
  try {
    expect(new TextDecoder().decode(new SwMDWriter().WriteDocument(source))).toBe("**RedBlue**\n");
  } finally {
    source.Dispose();
  }
});

it("serializes the style item set when a paragraph has no direct item set", () => {
  const source = createWriterDocument();
  const paragraph = source.paragraphs[0];
  if (paragraph === undefined) throw new Error("Missing paragraph.");
  const style = source.GetTextFormatColl("text-body");
  style.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
  paragraph.ChgFormatColl(style);
  paragraph.SetText("Styled");
  try {
    expect(new TextDecoder().decode(new SwMDWriter().WriteDocument(source))).toBe("**Styled**\n");
    paragraph.SetAttr(createWriterTextColorItem("#ff0000"));
    expect(new TextDecoder().decode(new SwMDWriter().WriteDocument(source))).toBe("Styled\n");
  } finally {
    source.Dispose();
  }
});

it("preserves the source non-unknown weight test for a direct normal weight item", () => {
  const source = createWriterDocument();
  const paragraph = source.paragraphs[0];
  if (paragraph === undefined) throw new Error("Missing paragraph.");
  paragraph.SetText("Normal");
  paragraph.SetAttr(new SvxWeightItem(FontWeight.WEIGHT_NORMAL, RES_CHRATR_WEIGHT));
  try {
    expect(new TextDecoder().decode(new SwMDWriter().WriteDocument(source))).toBe("**Normal**\n");
  } finally {
    source.Dispose();
  }
});

it("ignores CJK-only weight in the pinned Markdown character-item switch", () => {
  const source = createWriterDocument();
  const paragraph = source.paragraphs[0];
  if (paragraph === undefined) throw new Error("Missing paragraph.");
  paragraph.SetText("CJK");
  paragraph.SetAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_CJK_WEIGHT));
  try {
    expect(new TextDecoder().decode(new SwMDWriter().WriteDocument(source))).toBe("CJK\n");
  } finally {
    source.Dispose();
  }
});

it("writes imported native Markdown code spans through the preformatted font item", () => {
  const document = new MarkdownReader().Read(new TextEncoder().encode("Before `code` after"));
  try {
    expect(new TextDecoder().decode(new SwMDWriter().WriteDocument(document))).toBe(
      "Before `code` after\n",
    );
  } finally {
    document.Dispose();
  }
});

it("preserves upstream delimiter ordering when bold starts with a hyperlink", () => {
  const source = createWriterDocument();
  const paragraph = source.paragraphs[0];
  if (paragraph === undefined) throw new Error("Missing paragraph.");
  const fragment = createWriterTextFragment(paragraph, [
    {
      text: "Bold",
      attributes: { bold: true, italic: false, underline: false },
      hyperlink: { url: "https://example.test" },
    },
    {
      text: "Plain",
      attributes: { bold: false, italic: false, underline: false },
      hyperlink: { url: "https://example.test" },
    },
  ]);
  paragraph.SetText(fragment.text);
  paragraph.SetTextHints(fragment.hints);
  try {
    expect(new TextDecoder().decode(new SwMDWriter().WriteDocument(source))).toBe(
      "**[Bold**Plain](https://example.test)\n",
    );
  } finally {
    source.Dispose();
  }
});

it("uses native numbering labels and parent-prefix width for nested Markdown items", () => {
  const source = createWriterDocument();
  const parent = source.paragraphs[0];
  if (parent === undefined) throw new Error("Missing paragraph.");
  parent.SetText("Parent");
  applyWriterParagraphList(parent, { kind: "numbered", level: 0, listId: "Numbers" });
  const child = source.nodes.MakeTextNode("Child");
  applyWriterParagraphList(child, { kind: "numbered", level: 1, listId: "Numbers" });
  const rule = parent.GetNumRule();
  if (rule === undefined) throw new Error("Missing list rule.");
  const format = new SwNumFormat(rule.Get(0));
  format.SetStart(10);
  rule.Set(0, format);
  source.GetDocumentListsManager().InvalidateAllLists();
  let imported;
  try {
    const markdown = new TextDecoder().decode(new SwMDWriter().WriteDocument(source));
    expect(markdown).toContain(`${parent.GetNumString()} Parent\n`);
    expect(markdown).toContain(
      `\n${" ".repeat(parent.GetNumString().length + 1)}${child.GetNumString()} Child`,
    );
    imported = new MarkdownReader().Read(new TextEncoder().encode(markdown));
    expect(imported.paragraphs[1]?.GetAttrListLevel()).toBe(1);
  } finally {
    imported?.Dispose();
    source.Dispose();
  }
});
