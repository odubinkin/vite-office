/** @fileoverview Verifies Markdown reader callback mapping into native Writer nodes. */
import { expect, it } from "vitest";
import { FontStrikeout } from "../../../../tools/inc/fontenum";
import { SwTableNode } from "../../core/docnode/node";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { MarkdownReader } from "./swmd";

/** Imports one Markdown source. @param value - UTF-8 text. @returns Native document. */
function read(value: string) {
  return new MarkdownReader().Read(new TextEncoder().encode(value));
}

it("imports headings and nested emphasis as native paragraph styles and hints", /** Checks block/span callback ownership. @returns Nothing. */ () => {
  const document = read(
    "## Heading\n\nPlain **bold *italic*** and [link](https://example.test).\n",
  );
  try {
    expect(document.paragraphs.map((node) => [node.GetParagraphStyle(), node.GetText()])).toEqual([
      ["heading-2", "Heading"],
      ["default", "Plain bold italic and link."],
    ]);
    const runs = projectWriterTextRuns(document.paragraphs[1]);
    expect(runs.some((run) => run.text.includes("bold") && run.attributes.bold)).toBe(true);
    expect(
      runs.some((run) => run.text === "italic" && run.attributes.bold && run.attributes.italic),
    ).toBe(true);
    expect(runs.find((run) => run.text === "link")?.hyperlink?.url).toBe("https://example.test");
  } finally {
    document.Dispose();
  }
});

it("imports ordered and bullet lists with native levels and identities", /** Checks list callback mapping. @returns Nothing. */ () => {
  const document = read("1. First\n   2. Nested\n- Bullet\n");
  try {
    expect(
      document.paragraphs.map((node) => [
        node.GetText(),
        node.GetListKind(),
        node.GetAttrListLevel(),
      ]),
    ).toEqual([
      ["First", "numbered", 0],
      ["Nested", "numbered", 1],
      ["Bullet", "bullet", 0],
    ]);
    expect(document.paragraphs[0]?.GetListId()).toBe(document.paragraphs[1]?.GetListId());
  } finally {
    document.Dispose();
  }
});

it("imports a leading table and column alignment into actual Writer cells", /** Checks Markdown table owner and body order. @returns Nothing. */ () => {
  const document = read("| Name | Value |\n| :--- | ---: |\n| A | 42 |\n\nAfter\n");
  try {
    const table = document.GetNodes().getBodyContent()[0];
    expect(table).toBeInstanceOf(SwTableNode);
    if (!(table instanceof SwTableNode)) return;
    expect(
      table
        .GetTable()
        .GetTabLines()
        .map((row) => row.GetTabBoxes().map((box) => box.GetParagraphs()[0]?.GetText())),
    ).toEqual([
      ["Name", "Value"],
      ["A", "42"],
    ]);
    expect(
      table
        .GetTable()
        .GetTabLines()[0]
        ?.GetTabBoxes()[1]
        ?.GetParagraphs()[0]
        ?.GetParagraphAlignment(),
    ).toBe("right");
    expect(document.paragraphs.map((node) => node.GetText())).toEqual(["After"]);
  } finally {
    document.Dispose();
  }
});

it("keeps fenced code text and quote styles without interpreting inline markup", /** Checks source code-block and quote paths. @returns Nothing. */ () => {
  const document = read("```\n*literal*\n```\n\n> Quoted\n");
  try {
    expect(document.paragraphs.map((node) => [node.GetParagraphStyle(), node.GetText()])).toEqual([
      ["preformatted-text", "*literal*"],
      ["quotations", "Quoted"],
    ]);
  } finally {
    document.Dispose();
  }
});

it("maps setext headings, indented code and one multi-line quote into native paragraphs", () => {
  const document = read("Title\n=====\n\n    *literal*\n    second\n\n> first\n> second\n");
  try {
    expect(document.paragraphs.map((node) => [node.GetParagraphStyle(), node.GetText()])).toEqual([
      ["heading-1", "Title"],
      ["preformatted-text", "*literal*\nsecond"],
      ["quotations", "first\u00a0second"],
    ]);
  } finally {
    document.Dispose();
  }
});

it("maps strikeout and code spans to native character items", /** Checks represented span callbacks remain in text hints. @returns Nothing. */ () => {
  const document = read("Before ~~deleted~~ and `code`.");
  try {
    const runs = projectWriterTextRuns(document.paragraphs[0]);
    expect(runs.find((run) => run.text === "deleted")?.attributes.strikeout).toBe(
      FontStrikeout.STRIKEOUT_SINGLE,
    );
    expect(runs.find((run) => run.text === "code")?.attributes.fontFamily).toBe("Liberation Mono");
  } finally {
    document.Dispose();
  }
});

it("maps hard and soft line breaks through Markdown text callbacks", /** Checks source break semantics in the body text. @returns Nothing. */ () => {
  const document = read("Hard  \nbreak\nsoft\nbreak");
  try {
    expect(document.paragraphs[0]?.GetText()).toBe("Hard\nbreak\u00a0soft\u00a0break");
  } finally {
    document.Dispose();
  }
});
