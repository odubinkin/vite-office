/** @fileoverview Verifies model-facing ODF text export contexts without a document DTO. */

import { describe, expect, it } from "vitest";

import {
  escapeXml,
  exportCharacterAttributes,
  exportTextParagraphs,
  type OdfCharacterProperties,
  type XMLTextExportSource,
  type XMLTextParagraphSource,
} from "./txtparae";

const plain: OdfCharacterProperties = { bold: false, italic: false, underline: false };

it("exports script-only font face references independently", /** Preserves a complex-script override without manufacturing a Latin name. @returns Nothing. */ () => {
  const faceName =
    /** Uses the family as the test face name. @param family - Font family. @returns Face name. */ (
      family: string,
    ): string => family;
  expect(exportCharacterAttributes({ fontFamilyAsian: "Asian Face" }, faceName)).toBe(
    ' style:font-name-asian="Asian Face"',
  );
  expect(exportCharacterAttributes({ fontFamilyComplex: "Complex Face" }, faceName)).toBe(
    ' style:font-name-complex="Complex Face"',
  );
  expect(exportCharacterAttributes({ fontFamilyAsian: "Asian Face" })).toBe("");
  expect(exportCharacterAttributes({ fontFamilyComplex: "Complex Face" })).toBe("");
});

/** Creates a reiterable test source. @param paragraphs - Paragraph fixtures. @returns Export source. */
function source(paragraphs: readonly XMLTextParagraphSource[]): XMLTextExportSource {
  return {
    paragraphs: /** Iterates fixtures. @returns Paragraph iterator. */ () => paragraphs.values(),
  };
}

it("rejects invalid marker positions and names at the ODF export boundary", /** Checks that malformed canonical positions cannot silently move during save. @returns Nothing. */ () => {
  const paragraph: XMLTextParagraphSource = {
    style: "Standard",
    runs: [{ text: "abc", properties: plain }],
    markers: [{ kind: "soft-page-break", offset: 4 }],
  };
  expect(
    /** Saves an out-of-bounds hint. @returns Invalid export. */ () =>
      exportTextParagraphs(source([paragraph])),
  ).toThrow("outside its paragraph");
  expect(
    /** Saves an unnamed mark. @returns Invalid export. */ () =>
      exportTextParagraphs(source([{ ...paragraph, markers: [{ kind: "bookmark", offset: 1 }] }])),
  ).toThrow("name is invalid");
  expect(
    /** Saves markers in reverse order. @returns Invalid export. */ () =>
      exportTextParagraphs(
        source([
          {
            ...paragraph,
            markers: [
              { kind: "soft-page-break", offset: 2 },
              { kind: "soft-page-break", offset: 1 },
            ],
          },
        ]),
      ),
  ).toThrow("order is invalid");
  expect(exportTextParagraphs(source([{ ...paragraph, markers: [] }]))).toBeDefined();
  expect(
    exportTextParagraphs(
      source([{ ...paragraph, markers: [{ kind: "soft-page-break", offset: 3 }] }]),
    ).body,
  ).toContain("abc<text:soft-page-break/>");
});

describe("ODF text paragraph export contexts", /** Groups export context tests. @returns Nothing. */ () => {
  it("deduplicates styles and encodes whitespace and inline formatting", /** Verifies inline serialization. @returns Nothing. */ () => {
    const output = exportTextParagraphs(
      source([
        {
          alignment: "left",
          runs: [
            { properties: plain, text: "A & < > \" '" },
            { properties: { ...plain, bold: true }, text: " B" },
          ],
          style: "default",
        },
        {
          alignment: "right",
          runs: [{ properties: { ...plain, italic: true }, text: "x  y\t\n" }],
          style: "heading-1",
        },
        {
          alignment: "left",
          runs: [{ properties: { ...plain, bold: true }, text: "reuse" }],
          style: "title",
          styleName: "Title",
        },
        {
          alignment: "center",
          runs: [{ properties: plain, text: "legacy style name" }],
          style: "title",
        },
        {
          alignment: "left",
          runs: [{ properties: plain, text: "same paragraph style" }],
          style: "default",
        },
      ]),
    );
    expect(output.automaticStyles.match(/style:name="P/g)).toHaveLength(4);
    expect(output.automaticStyles.match(/style:name="T/g)).toHaveLength(2);
    expect(output.automaticStyles).toContain('fo:text-align="start"');
    expect(output.automaticStyles).toContain('fo:text-align="end"');
    expect(output.automaticStyles).toContain('style:parent-style-name="Heading_20_1"');
    expect(output.automaticStyles).toContain('style:parent-style-name="Title"');
    expect(output.automaticStyles).toContain('style:parent-style-name="title"');
    expect(output.body).toContain("&amp;");
    expect(output.body).toContain("&lt;");
    expect(output.body).toContain("&quot;");
    expect(output.body).toContain("<text:s/>");
    expect(output.body).toContain('<text:s text:c="2"/>');
    expect(output.body).toContain("<text:tab/>");
    expect(output.body).toContain("<text:line-break/>");
    expect(output.body).toContain("<text:h");
    expect(escapeXml("safe")).toBe("safe");
    expect(exportCharacterAttributes({ fontFamily: "Noto Serif" })).toBe(
      ' fo:font-family="Noto Serif"',
    );
  });

  it("emits list definitions before nested and continued list references", /** Verifies list serialization. @returns Nothing. */ () => {
    const rule = {
      bulletChars: Array.from(
        { length: 10 },
        /** Selects a test bullet character. @returns Character-special marker. */ () => "●",
      ),
      formats: Array.from(
        { length: 10 },
        /** Selects a test level kind. @param _unused - Empty slot. @param level - Level. @returns Marker kind. */
        (_unused, level) => (level === 1 ? ("numbered" as const) : ("bullet" as const)),
      ),
      name: "Mixed list",
    };
    const list = /** Creates list state. @param level - List level. @returns List state. */ (
      level: number,
    ) => ({ level, listId: "list-a", rule });
    const output = exportTextParagraphs(
      source([
        {
          list: list(0),
          listGeometryWins: true,
          leftMargin: 720,
          paragraphProperties: { firstLineIndent: -360 },
          runs: [{ properties: plain, text: "root" }],
          style: "default",
        },
        { list: list(1), runs: [{ properties: plain, text: "nested" }], style: "default" },
        {
          list: { ...list(0), startValue: 3 },
          runs: [{ properties: plain, text: "tail" }],
          style: "default",
        },
        { runs: [{ properties: plain, text: "break" }], style: "default" },
        { list: list(0), runs: [{ properties: plain, text: "continued" }], style: "default" },
      ]),
    );
    expect(output.namedStyles).toContain(
      '<style:style style:name="P1Base" style:family="paragraph" style:parent-style-name="Standard"',
    );
    expect(output.namedStyles).toContain('fo:margin-left="1.27cm"');
    expect(output.namedStyles).toContain('fo:text-indent="-0.635cm"');
    expect(output.automaticStyles).toContain(
      '<style:style style:name="P1" style:family="paragraph" style:parent-style-name="P1Base" style:list-style-name="L1"/>',
    );
    expect(output.automaticStyles).not.toContain('style:name="P1Base"');
    expect(output.automaticStyles).toContain('<text:list-style style:name="L1"');
    expect(output.automaticStyles).toContain('text:bullet-char="●"');
    expect(output.automaticStyles).toContain('<text:list-level-style-number text:level="2"');
    expect(output.body).toContain('xml:id="list-a"');
    expect(output.body).toContain('text:continue-list="list-a"');
    expect(output.body).toContain('<text:list-item text:start-value="3">');
  });

  it("rejects invalid live model state and observes cancellation in both passes", /** Verifies guards and cancellation. @returns Nothing. */ () => {
    expect(
      /** Exports an empty run. @returns Nothing. */ () =>
        exportTextParagraphs(
          source([{ runs: [{ properties: plain, text: "" }], style: "default" }]),
        ),
    ).toThrow("must not be empty");
    expect(
      /** Cancels during the definition pass. @returns Nothing. */ () =>
        exportTextParagraphs(
          source([{ runs: [], style: "default" }]),
          /** Cancels immediately. @returns True. */ () => true,
        ),
    ).toThrow("cancelled");
    const invalidRule = { formats: ["bullet" as const], name: "short" };
    expect(
      /** Exports an incomplete rule. @returns Nothing. */ () =>
        exportTextParagraphs(
          source([
            {
              list: { level: 0, listId: "id", rule: invalidRule },
              runs: [],
              style: "default",
            },
          ]),
        ),
    ).toThrow("define ten Writer levels");
    expect(
      /** Exports a restart outside Writer's bounded integer range. @returns Nothing. */ () =>
        exportTextParagraphs(
          source([
            {
              list: {
                level: 0,
                listId: "id",
                rule: {
                  formats: Array.from(
                    { length: 10 },
                    /** Creates one numbered level. @returns Numbered kind. */ () => "numbered",
                  ),
                  name: "numbered",
                },
                startValue: 40_000,
              },
              runs: [],
              style: "default",
            },
          ]),
        ),
    ).toThrow("start value");
    expect(
      /** Exports an incomplete bullet-character table. @returns Nothing. */ () =>
        exportTextParagraphs(
          source([
            {
              list: {
                level: 0,
                listId: "id",
                rule: {
                  bulletChars: ["●"],
                  formats: Array.from(
                    { length: 10 },
                    /** Creates one bullet level. @returns Bullet kind. */ () => "bullet",
                  ),
                  name: "short",
                },
              },
              runs: [],
              style: "default",
            },
          ]),
        ),
    ).toThrow("define ten Writer bullet characters");
    expect(
      /** Exports a multi-character bullet marker. @returns Nothing. */ () =>
        exportTextParagraphs(
          source([
            {
              list: {
                level: 0,
                listId: "id",
                rule: {
                  bulletChars: Array.from(
                    { length: 10 },
                    /** Creates one invalid marker. @returns Multi-character marker. */ () => "ab",
                  ),
                  formats: Array.from(
                    { length: 10 },
                    /** Creates one bullet level. @returns Bullet kind. */ () => "bullet",
                  ),
                  name: "invalid",
                },
              },
              runs: [],
              style: "default",
            },
          ]),
        ),
    ).toThrow("at most one Unicode code point");
    let checks = 0;
    expect(
      /** Exports with cancellation. @returns Nothing. */ () =>
        exportTextParagraphs(
          source([{ runs: [{ properties: plain, text: "x" }], style: "default" }]),
          /** Cancels the second pass. @returns Whether cancelled. */ () => ++checks > 1,
        ),
    ).toThrow("cancelled");
    expect(exportCharacterAttributes({})).toBe("");
  });

  it("validates conflicting list state, levels, identities, and XML id collisions", /** Covers strict list export guards. @returns Nothing. */ () => {
    const bullet = {
      formats: Array.from(
        { length: 10 },
        /** Creates a bullet level. @returns Bullet kind. */ () => "bullet" as const,
      ),
      name: "Rule",
    };
    const paragraph =
      /** Creates a paragraph with list state. @param list - List state. @returns Paragraph source. */ (
        list: NonNullable<XMLTextParagraphSource["list"]>,
      ): XMLTextParagraphSource => ({ list, runs: [], style: "default" });
    const valid = { level: 0, listId: "id", rule: bullet };
    expect(
      /** Exports conflicting rules. @returns Nothing. */ () =>
        exportTextParagraphs(
          source([
            paragraph(valid),
            paragraph({
              ...valid,
              rule: {
                formats: Array.from(
                  { length: 10 },
                  /** Creates a numbered level. @returns Numbered kind. */ () =>
                    "numbered" as const,
                ),
                name: "Rule",
              },
            }),
          ]),
        ),
    ).toThrow("Conflicting");
    for (const level of [-1, 0.5, 10])
      expect(
        /** Exports an invalid list level. @returns Nothing. */ () =>
          exportTextParagraphs(source([paragraph({ ...valid, level })])),
      ).toThrow("outside");
    expect(
      /** Exports a blank list identity. @returns Nothing. */ () =>
        exportTextParagraphs(source([paragraph({ ...valid, listId: "" })])),
    ).toThrow("identity");
    expect(
      /** Exports a blank rule name. @returns Nothing. */ () =>
        exportTextParagraphs(source([paragraph({ ...valid, rule: { ...bullet, name: "" } })])),
    ).toThrow("identity");
    const output = exportTextParagraphs(
      source([
        paragraph({ ...valid, listId: " " }),
        { runs: [], style: "default" },
        paragraph({ ...valid, listId: "list-20" }),
      ]),
    );
    expect(output.body).toContain('xml:id="list-20-2"');
  });
});
