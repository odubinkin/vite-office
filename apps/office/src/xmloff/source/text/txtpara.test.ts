/** @fileoverview Verifies bounded ODF text paragraph import and export semantics. */

import { describe, expect, it } from "vitest";

import {
  escapeXml,
  exportCharacterAttributes,
  exportTextParagraphs,
  ODF_NAMESPACES,
  type OdfCharacterProperties,
  type OdfParagraph,
} from "./txtparae";
import { importTextParagraphs, type OdfStyleDefinition } from "./txtparai";

const plain: OdfCharacterProperties = { bold: false, italic: false, underline: false };

/** Parses one office:text test element. @param body - Child XML. @returns Element. */
function parseText(body: string): Element {
  const xml = `<office:text xmlns:office="${ODF_NAMESPACES.office}" xmlns:text="${ODF_NAMESPACES.text}">${body}</office:text>`;
  return new DOMParser().parseFromString(xml, "application/xml").documentElement;
}

describe("ODF text paragraph export" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
  it("deduplicates automatic styles and encodes every bounded inline construct" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
    const paragraphs: OdfParagraph[] = [
      {
        alignment: "left",
        runs: [
          { properties: plain, text: "A & < > \" '" },
          { properties: { bold: true, italic: false, underline: false }, text: " B" },
        ],
        style: "default",
      },
      {
        alignment: "right",
        runs: [{ properties: { bold: false, italic: true, underline: false }, text: "x  y" }],
        style: "heading-1",
      },
      {
        alignment: "center",
        runs: [{ properties: { bold: false, italic: false, underline: true }, text: "\t\n" }],
        style: "default",
      },
      {
        alignment: "justify",
        runs: [{ properties: { bold: true, italic: true, underline: true }, text: "z" }],
        style: "default",
      },
      {
        alignment: "left",
        runs: [{ properties: { bold: true, italic: false, underline: false }, text: "reuse" }],
        style: "default",
      },
      { runs: [], style: "default" },
    ];
    const output = exportTextParagraphs(paragraphs);
    expect(output.automaticStyles.match(/style:name="P/g)).toHaveLength(4);
    expect(output.automaticStyles.match(/style:name="T/g)).toHaveLength(4);
    expect(output.automaticStyles).toContain('fo:text-align="start"');
    expect(output.automaticStyles).toContain('fo:text-align="end"');
    expect(output.automaticStyles).toContain('fo:text-align="center"');
    expect(output.automaticStyles).toContain('fo:text-align="justify"');
    expect(output.automaticStyles).toContain('fo:font-weight="bold"');
    expect(output.automaticStyles).toContain('fo:font-style="italic"');
    expect(output.automaticStyles).toContain('style:text-underline-style="solid"');
    expect(output.body).toContain("&amp;");
    expect(output.body).toContain("&lt;");
    expect(output.body).toContain("&gt;");
    expect(output.body).toContain("&quot;");
    expect(output.body).toContain("&apos;");
    expect(output.body).toContain("<text:s/>");
    expect(output.body).toContain('<text:s text:c="2"/>');
    expect(output.body).toContain("<text:tab/>");
    expect(output.body).toContain("<text:line-break/>");
    expect(output.body).toContain("<text:h");
    expect(output.body).toContain('<text:p text:style-name="Standard"></text:p>');
    expect(escapeXml("safe")).toBe("safe");
  });

  it("rejects empty supplied runs" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => exportTextParagraphs([{ runs: [{ properties: plain, text: "" }], style: "default" }]),
    ).toThrow("must not be empty");
  });

  it("emits automatic paragraph character deltas and explicit normal values" /** Covers style-level character serialization. @returns Nothing. */, () => {
    const inherited = { bold: false, italic: true, underline: false };
    const output = exportTextParagraphs([
      {
        inheritedProperties: inherited,
        properties: inherited,
        runs: [{ properties: inherited, text: "styled" }],
        style: "default",
      },
    ]);
    expect(output.automaticStyles).toContain('style:family="paragraph"');
    expect(output.automaticStyles).not.toContain("style:paragraph-properties");
    expect(output.automaticStyles).toContain('fo:font-weight="normal"');
    expect(output.automaticStyles).toContain('fo:font-style="italic"');
    expect(output.automaticStyles).toContain('style:text-underline-style="none"');
    expect(output.automaticStyles).not.toContain('style:name="T1"');
    expect(exportCharacterAttributes({})).toBe("");
  });
});

describe("ODF text paragraph import" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
  it("imports paragraphs, headings, nested spans, whitespace, and automatic parents" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
    const styles = new Map<string, OdfStyleDefinition>([
      ["P1", { alignment: "right", family: "paragraph", parentStyleName: "Heading_20_1" }],
      ["P2", { family: "paragraph" }],
      ["T1", { family: "text", properties: { bold: true, italic: false, underline: false } }],
      ["T2", { family: "text", properties: { italic: true, underline: true } }],
      ["T3", { family: "text", parentStyleName: "T1", properties: { italic: true } }],
    ]);
    const element = parseText(
      '<text:p>plain</text:p><text:p text:style-name="Standard"/><text:h/><text:h text:style-name="Heading_20_1">head</text:h><text:h text:style-name="P1"><text:span text:style-name="T1">b<text:span text:style-name="T2">i</text:span></text:span><text:span text:style-name="T3">p</text:span><text:s/><text:s text:c="2"/><text:tab/><text:line-break/></text:h><text:p text:style-name="P2">tail</text:p>',
    );
    expect(importTextParagraphs(element, styles)).toEqual([
      { runs: [{ properties: plain, text: "plain" }], style: "default" },
      { runs: [], style: "default" },
      { runs: [], style: "heading-1" },
      { runs: [{ properties: plain, text: "head" }], style: "heading-1" },
      {
        alignment: "right",
        runs: [
          { properties: { bold: true, italic: false, underline: false }, text: "b" },
          { properties: { bold: true, italic: true, underline: true }, text: "i" },
          { properties: { bold: true, italic: true, underline: false }, text: "p" },
          { properties: plain, text: "   \t\n" },
        ],
        style: "heading-1",
      },
      { runs: [{ properties: plain, text: "tail" }], style: "default" },
    ]);
    expect(importTextParagraphs(parseText(""), styles)).toEqual([{ runs: [], style: "default" }]);
  });

  it("rejects unsupported block and inline structures" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
    const styles = new Map<string, OdfStyleDefinition>([
      ["WrongP", { family: "text", properties: plain }],
      ["WrongT", { family: "paragraph" }],
      ["NoProps", { family: "text" }],
    ]);
    for (const body of [
      "<text:list/>",
      '<text:p text:style-name="Missing"/>',
      '<text:p text:style-name="WrongP"/>',
      '<text:p><text:span text:style-name="Missing">x</text:span></text:p>',
      "<text:p><text:span>x</text:span></text:p>",
      '<text:p><text:span text:style-name="WrongT">x</text:span></text:p>',
      '<text:p><text:span text:style-name="NoProps">x</text:span></text:p>',
      "<text:p><text:a/></text:p>",
      "<text:p><foreign/></text:p>",
      "<text:p><!--comment--></text:p>",
    ])
      expect(
        /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
        () => importTextParagraphs(parseText(body), styles),
      ).toThrow("Unsupported ODF");
  });

  it("validates significant-space counts" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
    for (const count of ["0", "1.5", "100001", "nope"])
      expect(
        /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
        () =>
          importTextParagraphs(
            parseText(`<text:p><text:s text:c="${count}"/></text:p>`),
            new Map(),
          ),
      ).toThrow("space count is invalid");
  });

  it("rejects cyclic paragraph and text style inheritance" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
    const paragraphStyles = new Map<string, OdfStyleDefinition>([
      ["P1", { family: "paragraph", parentStyleName: "P2" }],
      ["P2", { family: "paragraph", parentStyleName: "P1" }],
    ]);
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => importTextParagraphs(parseText('<text:p text:style-name="P1"/>'), paragraphStyles),
    ).toThrow("Cyclic ODF paragraph style");
    const textStyles = new Map<string, OdfStyleDefinition>([
      ["T1", { family: "text", parentStyleName: "T2", properties: { bold: true } }],
      ["T2", { family: "text", parentStyleName: "T1", properties: { italic: true } }],
    ]);
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () =>
        importTextParagraphs(
          parseText('<text:p><text:span text:style-name="T1">x</text:span></text:p>'),
          textStyles,
        ),
    ).toThrow("Cyclic ODF text style");
  });

  it("resolves named and automatic paragraph character inheritance separately" /** Verifies effective runs and direct automatic-style deltas. @returns Nothing. */, () => {
    const styles = new Map<string, OdfStyleDefinition>([
      ["Standard", { family: "paragraph", properties: { bold: true } }],
      [
        "Heading_20_1",
        {
          family: "paragraph",
          parentStyleName: "Standard",
          properties: { italic: true },
        },
      ],
      [
        "P1",
        {
          family: "paragraph",
          parentStyleName: "Heading_20_1",
          properties: { underline: true },
        },
      ],
      ["P2", { family: "paragraph", parentStyleName: "P1" }],
    ]);
    expect(
      importTextParagraphs(
        parseText(
          '<text:p text:style-name="Standard">s</text:p><text:h text:style-name="Standard">d</text:h><text:h text:style-name="Heading_20_1">h</text:h><text:h text:style-name="P2">a</text:h>',
        ),
        styles,
      ),
    ).toEqual([
      {
        runs: [{ properties: { bold: true, italic: false, underline: false }, text: "s" }],
        style: "default",
      },
      {
        runs: [{ properties: { bold: true, italic: false, underline: false }, text: "d" }],
        style: "heading-1",
      },
      {
        runs: [{ properties: { bold: true, italic: true, underline: false }, text: "h" }],
        style: "heading-1",
      },
      {
        properties: { underline: true },
        runs: [{ properties: { bold: true, italic: true, underline: true }, text: "a" }],
        style: "heading-1",
      },
    ]);
  });
});
