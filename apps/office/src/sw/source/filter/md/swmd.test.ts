/** @fileoverview Verifies Markdown reader callback mapping into native Writer nodes. */
import { expect, it } from "vitest";
import { SvxBorderLineStyle } from "../../../../editeng/source/items/borderline";
import { SvxBoxItem, SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { FontStrikeout } from "../../../../tools/inc/fontenum";
import { RES_BOX, RES_PARATR_CONNECT_BORDER } from "../../../inc/hintids";
import { SwTableNode } from "../../core/docnode/node";
import { SwParaConnectBorderItem } from "../../core/para/paratr";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { MarkdownReader } from "./swmd";

/** Imports one Markdown source. @param value - UTF-8 text. @returns Native document. */
function read(value: string) {
  return new MarkdownReader().Read(new TextEncoder().encode(value));
}

it("rejects an empty Markdown stream before model allocation", /** Checks rejects an empty Markdown stream before model allocation. @returns Test completion or assertion result. */ () => {
  const reader = new MarkdownReader();
  expect(
    /** Checks Invalid Markdown byte stream.. @returns Test completion or assertion result. */ () =>
      reader.Read(new Uint8Array()),
  ).toThrow("Invalid Markdown byte stream.");
});

it("imports headings and nested emphasis as native paragraph styles and hints", /** Checks block/span callback ownership. @returns Nothing. */ () => {
  const document = read(
    "## Heading\n\nPlain **bold *italic*** and [link](https://example.test).\n",
  );
  try {
    expect(
      document.paragraphs.map(
        /** Checks imports headings and nested emphasis as native paragraph styles and hints. @param node - Node. @returns Test completion or assertion result. */ (
          node,
        ) => [node.GetParagraphStyle(), node.GetText()],
      ),
    ).toEqual([
      ["heading-2", "Heading"],
      ["default", "Plain bold italic and link."],
    ]);
    const runs = projectWriterTextRuns(document.paragraphs[1]);
    expect(
      runs.some(
        /** Checks imports headings and nested emphasis as native paragraph styles and hints. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => run.text.includes("bold") && run.attributes.bold,
      ),
    ).toBe(true);
    expect(
      runs.some(
        /** Checks imports headings and nested emphasis as native paragraph styles and hints. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => run.text === "italic" && run.attributes.bold && run.attributes.italic,
      ),
    ).toBe(true);
    expect(
      runs.find(
        /** Checks https://example.test/. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => run.text === "link",
      )?.hyperlink?.url,
    ).toBe("https://example.test/");
  } finally {
    document.Dispose();
  }
});

it("resolves Markdown hyperlink callbacks against the source document URL", /** Checks resolves Markdown hyperlink callbacks against the source document URL. @returns Test completion or assertion result. */ () => {
  const document = new MarkdownReader().Read(
    new TextEncoder().encode(
      "[Relative](images/chart.png) [Fragment](#detail) [Absolute](https://else.test/p)",
    ),
    {},
    "https://example.test/docs/report.md",
  );
  try {
    const links = projectWriterTextRuns(document.paragraphs[0])
      .filter(
        /** Checks resolves Markdown hyperlink callbacks against the source document URL. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => run.hyperlink !== undefined,
      )
      .map(
        /** Checks resolves Markdown hyperlink callbacks against the source document URL. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => run.hyperlink?.url,
      );
    expect(links).toEqual([
      "https://example.test/docs/images/chart.png",
      "#detail",
      "https://else.test/p",
    ]);
  } finally {
    document.Dispose();
  }
});

it("keeps relative Markdown links when the source medium has no URL", /** Checks keeps relative Markdown links when the source medium has no URL. @returns Test completion or assertion result. */ () => {
  const document = read("[Local](images/chart.png)");
  try {
    expect(projectWriterTextRuns(document.paragraphs[0])[0]?.hyperlink?.url).toBe(
      "images/chart.png",
    );
  } finally {
    document.Dispose();
  }
});

it("imports ordered and bullet lists with native levels and identities", /** Checks list callback mapping. @returns Nothing. */ () => {
  const document = read("1. First\n   2. Nested\n- Bullet\n");
  try {
    expect(
      document.paragraphs.map(
        /** Checks imports ordered and bullet lists with native levels and identities. @param node - Node. @returns Test completion or assertion result. */ (
          node,
        ) => [node.GetText(), node.GetListKind(), node.GetAttrListLevel()],
      ),
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

it("keeps one native list across a loose-list blank line", /** Checks keeps one native list across a loose-list blank line. @returns Test completion or assertion result. */ () => {
  const document = read("- First\n\n- Second\n");
  try {
    expect(
      document.paragraphs.map(
        /** Checks keeps one native list across a loose-list blank line. @param node - Node. @returns Test completion or assertion result. */ (
          node,
        ) => node.GetText(),
      ),
    ).toEqual(["First", "Second"]);
    expect(document.paragraphs[0]?.GetListId()).toBe(document.paragraphs[1]?.GetListId());
  } finally {
    document.Dispose();
  }
});

it("shares one native rule across mixed nested list callbacks and configures each used level", /** Checks shares one native rule across mixed nested list callbacks and configures each used level. @returns Test completion or assertion result. */ () => {
  const document = read("1. First\n   - Nested\n2. Second\n");
  try {
    const [first, nested, second] = document.paragraphs;
    expect(first?.GetNumRule()).toBe(nested?.GetNumRule());
    expect(second?.GetNumRule()).toBe(first?.GetNumRule());
    expect(
      document.paragraphs.map(
        /** Checks shares one native rule across mixed nested list callbacks and configures each used level. @param node - Node. @returns Test completion or assertion result. */ (
          node,
        ) => node.GetListKind(),
      ),
    ).toEqual(["numbered", "bullet", "numbered"]);
    expect(
      document.paragraphs.map(
        /** Checks shares one native rule across mixed nested list callbacks and configures each used level. @param node - Node. @returns Test completion or assertion result. */ (
          node,
        ) => node.GetListId(),
      ),
    ).toEqual([first?.GetListId(), first?.GetListId(), first?.GetListId()]);
    expect(
      document.paragraphs.every(
        /** Checks shares one native rule across mixed nested list callbacks and configures each used level. @param node - Node. @returns Test completion or assertion result. */ (
          node,
        ) => node.IsCountedInList(),
      ),
    ).toBe(true);
    expect(first?.GetNumRule()?.Get(1).GetBulletChar()).toBe(0x2022);
  } finally {
    document.Dispose();
  }
});

it("retains the first format at a reused Markdown list level as upstream does", /** Checks retains the first format at a reused Markdown list level as upstream does. @returns Test completion or assertion result. */ () => {
  const document = read("1. Root\n   - Bullet\n   1. Numbered syntax\n2. Root again");
  try {
    expect(
      document.paragraphs.map(
        /** Checks retains the first format at a reused Markdown list level as upstream does. @param node - Node. @returns Test completion or assertion result. */ (
          node,
        ) => node.GetListKind(),
      ),
    ).toEqual(["numbered", "bullet", "bullet", "numbered"]);
    expect(document.paragraphs[1]?.GetNumRule()).toBe(document.paragraphs[2]?.GetNumRule());
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
        .map(
          /** Checks imports a leading table and column alignment into actual Writer cells. @param row - Row. @returns Test completion or assertion result. */ (
            row,
          ) =>
            row
              .GetTabBoxes()
              .map(
                /** Reads the first native cell paragraph. @param box - Table cell. @returns First paragraph text. */ (
                  box,
                ) => box.GetParagraphs()[0]?.GetText(),
              ),
        ),
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
    expect(
      document.paragraphs.map(
        /** Checks imports a leading table and column alignment into actual Writer cells. @param node - Node. @returns Test completion or assertion result. */ (
          node,
        ) => node.GetText(),
      ),
    ).toEqual(["After"]);
  } finally {
    document.Dispose();
  }
});

it("keeps fenced code text and quote styles without interpreting inline markup", /** Checks source code-block and quote paths. @returns Nothing. */ () => {
  const document = read("```\n*literal*\n```\n\n> Quoted\n");
  try {
    expect(
      document.paragraphs.map(
        /** Checks keeps fenced code text and quote styles without interpreting inline markup. @param node - Node. @returns Test completion or assertion result. */ (
          node,
        ) => [node.GetParagraphStyle(), node.GetText()],
      ),
    ).toEqual([
      ["preformatted-text", "*literal*"],
      ["quotations", "Quoted"],
    ]);
  } finally {
    document.Dispose();
  }
});

it("maps setext headings, indented code and one multi-line quote into native paragraphs", /** Checks maps setext headings, indented code and one multi-line quote into native paragraphs. @returns Test completion or assertion result. */ () => {
  const document = read("Title\n=====\n\n    *literal*\n    second\n\n> first\n> second\n");
  try {
    expect(
      document.paragraphs.map(
        /** Checks maps setext headings, indented code and one multi-line quote into native paragraphs. @param node - Node. @returns Test completion or assertion result. */ (
          node,
        ) => [node.GetParagraphStyle(), node.GetText()],
      ),
    ).toEqual([
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
    expect(
      runs.find(
        /** Checks maps strikeout and code spans to native character items. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => run.text === "deleted",
      )?.attributes.strikeout,
    ).toBe(FontStrikeout.STRIKEOUT_SINGLE);
    expect(
      runs.find(
        /** Checks Liberation Mono. @param run - Run. @returns Test completion or assertion result. */ (
          run,
        ) => run.text === "code",
      )?.attributes.fontFamily,
    ).toBe("Liberation Mono");
  } finally {
    document.Dispose();
  }
});

it("maps hard and soft line breaks through Markdown text callbacks", /** Checks source break semantics in the body text. @returns Nothing. */ () => {
  const document = read("Hard  \nbreak\nsoft\nbreak\nbackslash\\\nnext\nwide    \nend");
  try {
    expect(document.paragraphs[0]?.GetText()).toBe(
      "Hard\nbreak\u00a0soft\u00a0break\u00a0backslash\nnext\u00a0wide\nend",
    );
  } finally {
    document.Dispose();
  }
});

it("omits syntactic entity and null-character callbacks while keeping escaped and code text", /** Checks omits syntactic entity and null-character callbacks while keeping escaped and code text. @returns Test completion or assertion result. */ () => {
  const document = read("A &amp; B &#65; &madeup; \\&amp; `&copy;` \\? N\u0000UL");
  try {
    expect(document.paragraphs[0]?.GetText()).toBe("A  B   &amp; &copy; ? NUL");
  } finally {
    document.Dispose();
  }
});

it("keeps md4c thematic breaks distinct from setext headings and list markers", /** Checks keeps md4c thematic breaks distinct from setext headings and list markers. @returns Test completion or assertion result. */ () => {
  const document = read("---\n\n* * *\n\nTitle\n---\n\nAfter");
  try {
    expect(
      document.paragraphs.map(
        /** Checks keeps md4c thematic breaks distinct from setext headings and list markers. @param node - Node. @returns Test completion or assertion result. */ (
          node,
        ) => [node.GetParagraphStyle(), node.GetText()],
      ),
    ).toEqual([
      ["horizontal-line", ""],
      ["horizontal-line", ""],
      ["heading-2", "Title"],
      ["default", "After"],
    ]);
    const style = document.GetTextFormatColl("horizontal-line");
    const border = style.GetAttrSet().GetItemIfSet(RES_BOX, false) as SvxBoxItem;
    const bottom = border.GetLine(SvxBoxItemLine.BOTTOM);
    expect(bottom?.GetBorderLineStyle()).toBe(SvxBorderLineStyle.DOUBLE);
    expect(bottom?.GetWidth()).toBe(3);
    expect(
      (
        style.GetAttrSet().GetItemIfSet(RES_PARATR_CONNECT_BORDER, false) as SwParaConnectBorderItem
      ).GetValue(),
    ).toBe(false);
  } finally {
    document.Dispose();
  }
});
