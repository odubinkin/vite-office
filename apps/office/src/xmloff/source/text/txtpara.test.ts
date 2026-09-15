/** @fileoverview Verifies model-facing ODF text export contexts without a document DTO. */

import { describe, expect, it } from "vitest";

import { parseOdfXmlStream, type SvXMLImportContext } from "../core/xml-parser";
import { ODF_NAMESPACES, XMLToken } from "../core/xmltoken";
import {
  escapeXml,
  exportCharacterAttributes,
  exportTextParagraphs,
  type OdfCharacterProperties,
  type XMLTextExportSource,
  type XMLTextParagraphSource,
} from "./txtparae";
import {
  XMLTextBodyContext,
  type OdfStyleDefinition,
  type XMLParagraphImportTarget,
  type XMLParagraphListState,
  type XMLTextImportTarget,
  type XMLTextListRule,
} from "./txtparai";

const plain: OdfCharacterProperties = { bold: false, italic: false, underline: false };

/** Creates a reiterable test source. @param paragraphs - Paragraph fixtures. @returns Export source. */
function source(paragraphs: readonly XMLTextParagraphSource[]): XMLTextExportSource {
  return {
    paragraphs: /** Iterates fixtures. @returns Paragraph iterator. */ () => paragraphs.values(),
  };
}

/** Canonical paragraph operations captured by the fake Writer target. */
interface ImportedParagraph {
  alignment?: XMLTextParagraphSource["alignment"];
  list?: XMLParagraphListState;
  properties?: Partial<OdfCharacterProperties>;
  runs: { properties: OdfCharacterProperties; text: string }[];
  style: XMLTextParagraphSource["style"];
}

/** Imports an office:text fragment through the model-facing context API. @param body - Body XML. @param styles - Style table. @param rules - List rules. @returns Canonical operation log. */
function importBody(
  body: string,
  styles: ReadonlyMap<string, OdfStyleDefinition> = new Map(),
  rules: ReadonlyMap<string, XMLTextListRule> = new Map(),
): ImportedParagraph[] {
  const paragraphs: ImportedParagraph[] = [];
  const target: XMLTextImportTarget = {
    /** Creates one canonical paragraph operation target. @param style - Resolved style. @param alignment - Alignment. @param properties - Direct properties. @param list - List state. @returns Text sink. */
    createParagraph(style, alignment, properties, list): XMLParagraphImportTarget {
      const paragraph: ImportedParagraph = {
        ...(alignment === undefined ? {} : { alignment }),
        ...(list === undefined ? {} : { list }),
        ...(properties === undefined ? {} : { properties }),
        runs: [],
        style,
      };
      paragraphs.push(paragraph);
      return {
        /** Appends text, merging adjacent equal runs like SwTextNode. @param text - Text. @param runProperties - Effective properties. @returns Nothing. */
        appendText(text, runProperties): void {
          const previous = paragraph.runs.at(-1);
          if (
            previous !== undefined &&
            JSON.stringify(previous.properties) === JSON.stringify(runProperties)
          )
            previous.text += text;
          else paragraph.runs.push({ properties: runProperties, text });
        },
      };
    },
    /** Resolves a list rule. @param name - Style name. @returns Rule. */
    getListRule: (name) => rules.get(name),
    /** Resolves a style. @param name - Style name. @returns Definition. */
    getStyle: (name) => styles.get(name),
  };
  parseOdfXmlStream(
    `<office:text xmlns:office="${ODF_NAMESPACES.office}" xmlns:text="${ODF_NAMESPACES.text}">${body}</office:text>`,
    {
      /** Creates the text body root. @param element - Root token. @returns Context or null. */
      createFastContext(element): SvXMLImportContext | null {
        return element === XMLToken.OFFICE_TEXT ? new XMLTextBodyContext(target) : null;
      },
      /** Rejects unknown roots. @returns Null. */
      createUnknownContext: () => null,
    },
  );
  return paragraphs;
}

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
        },
        {
          alignment: "left",
          runs: [{ properties: plain, text: "same paragraph style" }],
          style: "default",
        },
      ]),
    );
    expect(output.automaticStyles.match(/style:name="P/g)).toHaveLength(3);
    expect(output.automaticStyles.match(/style:name="T/g)).toHaveLength(2);
    expect(output.automaticStyles).toContain('fo:text-align="start"');
    expect(output.automaticStyles).toContain('fo:text-align="end"');
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
        { list: list(0), runs: [{ properties: plain, text: "root" }], style: "default" },
        { list: list(1), runs: [{ properties: plain, text: "nested" }], style: "default" },
        { list: list(0), runs: [{ properties: plain, text: "tail" }], style: "default" },
        { runs: [{ properties: plain, text: "break" }], style: "default" },
        { list: list(0), runs: [{ properties: plain, text: "continued" }], style: "default" },
      ]),
    );
    expect(output.automaticStyles).toContain('<text:list-style style:name="L1"');
    expect(output.automaticStyles).toContain('text:bullet-char="●"');
    expect(output.automaticStyles).toContain('<text:list-level-style-number text:level="2"');
    expect(output.body).toContain('xml:id="list-a"');
    expect(output.body).toContain('text:continue-list="list-a"');
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

describe("ODF streaming text import contexts", /** Groups direct model import tests. @returns Nothing. */ () => {
  const styles = new Map<string, OdfStyleDefinition>([
    ["Standard", { family: "paragraph", properties: { bold: true } }],
    [
      "Heading_20_1",
      { family: "paragraph", parentStyleName: "Standard", properties: { italic: true } },
    ],
    [
      "P1",
      {
        alignment: "right",
        family: "paragraph",
        parentStyleName: "Heading_20_1",
        properties: { underline: true },
      },
    ],
    ["P2", { family: "paragraph", parentStyleName: "P1" }],
    ["T1", { family: "text", properties: { bold: true, italic: false, underline: false } }],
    ["T2", { family: "text", parentStyleName: "T1", properties: { italic: true } }],
  ]);

  it("applies paragraphs, headings, inherited spans, whitespace, and controls directly", /** Verifies context dispatch and style inheritance. @returns Nothing. */ () => {
    const paragraphs = importBody(
      '<text:sequence-decls/><text:p>plain</text:p><text:h/><text:h text:style-name="P1"><text:span text:style-name="T1">b<text:span text:style-name="T2">i<text:s/><text:tab/><text:line-break/></text:span></text:span></text:h>',
      styles,
    );
    expect(paragraphs).toHaveLength(3);
    expect(paragraphs[0]).toMatchObject({ style: "default", runs: [{ text: "plain" }] });
    expect(paragraphs[1]).toMatchObject({ style: "heading-1", runs: [] });
    expect(paragraphs[2]).toMatchObject({
      alignment: "right",
      properties: { underline: true },
      style: "heading-1",
    });
    expect(
      paragraphs[2]?.runs
        .map(
          /** Reads captured run text. @param run - Captured run. @returns Text. */ (run) =>
            run.text,
        )
        .join(""),
    ).toBe("bi \t\n");
  });

  it("resolves nested, generated, explicit, and continued list identities", /** Verifies list context state. @returns Nothing. */ () => {
    const rule = {
      formats: Array.from(
        { length: 10 },
        /** Creates a bullet level. @returns Bullet kind. */ () => "bullet" as const,
      ),
      name: "Bullets",
    };
    const paragraphs = importBody(
      '<text:list text:style-name="L1" xml:id="root"><text:list-item><text:p>a</text:p><text:list><text:list-item><text:p>b</text:p></text:list-item></text:list></text:list-item></text:list><text:list text:style-name="L1" text:continue-list="root"><text:list-item><text:p>c</text:p></text:list-item></text:list><text:list text:style-name="L1"><text:list-item><text:p>d</text:p></text:list-item></text:list>',
      styles,
      new Map([["L1", rule]]),
    );
    expect(
      paragraphs.map(
        /** Reads captured list state. @param paragraph - Captured paragraph. @returns List state. */ (
          paragraph,
        ) => paragraph.list,
      ),
    ).toEqual([
      { level: 0, listId: "root", ruleName: "Bullets" },
      { level: 1, listId: "root", ruleName: "Bullets" },
      { level: 0, listId: "root", ruleName: "Bullets" },
      { level: 0, listId: "Bullets-1", ruleName: "Bullets" },
    ]);
  });

  it("rejects unsupported context structures and invalid inherited state", /** Verifies explicit reject policies. @returns Nothing. */ () => {
    const bullet = {
      formats: Array.from(
        { length: 10 },
        /** Creates a bullet level. @returns Bullet kind. */ () => "bullet" as const,
      ),
      name: "Bullets",
    };
    for (const body of [
      "<text:list/>",
      '<text:p text:style-name="Missing"/>',
      "<text:p><text:span>x</text:span></text:p>",
      '<text:p><text:span text:style-name="T1"><text:span>x</text:span></text:span></text:p>',
      "<text:p><text:a/></text:p>",
      "<text:span/>",
      "<text:p><text:list/></text:p>",
      '<text:p><text:span text:style-name="T1"><text:list/></text:span></text:p>',
      "<text:section/>",
      '<text:list text:style-name="L1"><text:list-item><text:p>a</text:p><text:p>b</text:p></text:list-item></text:list>',
      '<text:list text:style-name="L1"><text:list-header/></text:list>',
      '<text:list text:style-name="L1"><text:p/></text:list>',
      '<text:list text:style-name="L1"><text:list-item><text:section/></text:list-item></text:list>',
      '<text:list text:style-name="L1"><text:list-item><text:span/></text:list-item></text:list>',
    ])
      expect(
        /** Imports an unsupported structure. @returns Nothing. */ () =>
          importBody(body, styles, new Map([["L1", bullet]])),
      ).toThrow("Unsupported ODF");
    expect(
      /** Imports a missing list style. @returns Nothing. */ () =>
        importBody(
          '<text:list text:style-name="Missing"><text:list-item><text:p/></text:list-item></text:list>',
          styles,
          new Map([["L1", bullet]]),
        ),
    ).toThrow("Unsupported ODF list style");
    expect(
      /** Imports beyond a short numbering rule. @returns Nothing. */ () =>
        importBody(
          '<text:list text:style-name="L1"><text:list-item><text:list><text:list-item><text:p/></text:list-item></text:list></text:list-item></text:list>',
          styles,
          new Map([["L1", { formats: ["bullet"], name: "Short" }]]),
        ),
    ).toThrow("Unsupported ODF list level");
    expect(
      importBody(
        '<text:list text:style-name="L1" text:continue-list="external"><text:list-item><text:p/></text:list-item></text:list>',
        styles,
        new Map([["L1", bullet]]),
      )[0]?.list?.listId,
    ).toBe("external");
    expect(importBody('<text:p text:style-name="P2"/>', styles)[0]?.properties).toEqual({
      underline: true,
    });
    for (const count of ["0", "1.5", "100001", "nope"])
      expect(
        /** Imports an invalid significant-space count. @returns Nothing. */ () =>
          importBody(`<text:p><text:s text:c="${count}"/></text:p>`, styles),
      ).toThrow("space count");
    const paragraphCycle = new Map<string, OdfStyleDefinition>([
      ["P1", { family: "paragraph", parentStyleName: "P2" }],
      ["P2", { family: "paragraph", parentStyleName: "P1" }],
    ]);
    expect(
      /** Imports cyclic paragraph styles. @returns Nothing. */ () =>
        importBody('<text:p text:style-name="P1"/>', paragraphCycle),
    ).toThrow("Cyclic");
    const textCycle = new Map<string, OdfStyleDefinition>([
      ["T1", { family: "text", parentStyleName: "T2", properties: { bold: true } }],
      ["T2", { family: "text", parentStyleName: "T1", properties: { italic: true } }],
    ]);
    expect(
      /** Imports cyclic text styles. @returns Nothing. */ () =>
        importBody('<text:p><text:span text:style-name="T1">x</text:span></text:p>', textCycle),
    ).toThrow("Cyclic");
  });
});
