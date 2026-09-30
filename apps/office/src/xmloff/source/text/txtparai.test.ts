/** @fileoverview Verifies source-derived ODF paragraph and inline import contracts at the model-facing context boundary. */
import { describe, expect, it } from "vitest";
import { parseOdfXmlStream, type SvXMLImportContext } from "../core/xmlimp";
import { ODF_NAMESPACES, XMLToken } from "../core/xmltoken";
import type {
  OdfCharacterProperties,
  OdfParagraphProperties,
  XMLTextParagraphSource,
} from "./txtparae";
import {
  XMLTextBodyContext,
  resolveParagraphStyle,
  type OdfStyleDefinition,
  type XMLParagraphImportTarget,
  type XMLParagraphListState,
  type XMLTextImportTarget,
  type XMLTextListRule,
} from "./txtparai";

it("falls back to Standard for an undeclared built-in heading", /** Covers the bounded style resolver when a named definition is absent. @returns Nothing. */ () => {
  const resolved = resolveParagraphStyle("Heading_20_1", true, {
    getStyle: /** Has no named definitions. @returns No style. */ () => undefined,
  });
  expect(resolved.style).toBe("heading-1");
});

it("rejects a cycle through a built-in paragraph style", /** Covers named-style cycle detection before following its parent. @returns Nothing. */ () => {
  expect(
    /** Resolves a cyclic built-in definition. @returns Invalid style. */ () =>
      resolveParagraphStyle("Heading_20_1", true, {
        getStyle: /** Provides the cyclic style. @returns Style definition. */ () => ({
          family: "paragraph",
          parentStyleName: "Heading_20_1",
        }),
      }),
  ).toThrow("Cyclic ODF paragraph style");
});

it("resolves list indentation precedence on a built-in paragraph style", /** Covers direct and inherited margin placement. @returns Nothing. */ () => {
  for (const [definition, expected] of [
    [{ family: "paragraph", listStyleName: "L" }, true],
    [{ family: "paragraph", listStyleName: "L", leftMargin: 720 }, false],
    [
      { family: "paragraph", listStyleName: "L", paragraphProperties: { firstLineIndent: -360 } },
      false,
    ],
  ] as const) {
    const resolved = resolveParagraphStyle("Standard", false, {
      getStyle: /** Provides the tested Standard style. @returns Style definition. */ () =>
        definition,
    });
    expect(resolved.listGeometryWins).toBe(expected);
  }
});

/** Canonical paragraph operations captured by the fake Writer target. */
interface ImportedParagraph {
  alignment?: XMLTextParagraphSource["alignment"];
  leftMargin?: number;
  list?: XMLParagraphListState;
  markers?: { kind: "bookmark" | "soft-page-break"; name?: string; offset: number }[];
  paragraphProperties?: OdfParagraphProperties;
  properties?: Partial<OdfCharacterProperties>;
  runs: {
    hyperlink?: XMLTextParagraphSource["runs"][number]["hyperlink"];
    properties: OdfCharacterProperties;
    text: string;
  }[];
  style: XMLTextParagraphSource["style"];
}

/** Imports an office:text fragment through the model-facing context API. @param body - Body XML. @param styles - Style table. @param rules - List rules. @returns Canonical operation log. */
function importBody(
  body: string,
  styles: Iterable<readonly [string, OdfStyleDefinition]> = new Map(),
  rules: ReadonlyMap<string, XMLTextListRule> = new Map(),
): ImportedParagraph[] {
  const paragraphs: ImportedParagraph[] = [];
  const definitions = Array.from(styles);
  const target: XMLTextImportTarget = {
    /** Creates one canonical paragraph operation target. @param style - Resolved style. @param alignment - Alignment. @param leftMargin - Direct text-left margin. @param paragraphProperties - Direct paragraph properties. @param properties - Direct character properties. @param list - List state. @returns Text sink. */
    createParagraph(
      style,
      alignment,
      leftMargin,
      paragraphProperties,
      properties,
      list,
    ): XMLParagraphImportTarget {
      const paragraph: ImportedParagraph = {
        ...(alignment === undefined ? {} : { alignment }),
        ...(leftMargin === undefined ? {} : { leftMargin }),
        ...(paragraphProperties === undefined ? {} : { paragraphProperties }),
        ...(list === undefined ? {} : { list }),
        ...(properties === undefined ? {} : { properties }),
        runs: [],
        style,
      };
      paragraphs.push(paragraph);
      /** Returns the current UTF-16 paragraph length. @returns Text length. */
      function currentOffset(): number {
        return paragraph.runs.reduce(
          /** Adds one run's UTF-16 length. @param sum - Previous length. @param run - Text run. @returns New length. */
          (sum, run) => sum + run.text.length,
          0,
        );
      }
      return {
        /** Records a collapsed bookmark at the current text length. @param name - Bookmark name. @returns Nothing. */
        addBookmark(name): void {
          (paragraph.markers ??= []).push({
            kind: "bookmark",
            name,
            offset: currentOffset(),
          });
        },
        /** Records a pending range start. @param name - Name. @returns Nothing. */
        addBookmarkStart(name): void {
          (paragraph.markers ??= []).push({
            kind: "bookmark",
            name,
            offset: currentOffset(),
          });
        },
        /** Completes the test target's collapsed range. @returns Nothing. */
        addBookmarkEnd(): void {},
        /** Records a soft pagination hint at the current text length. @returns Nothing. */
        addSoftPageBreak(): void {
          (paragraph.markers ??= []).push({
            kind: "soft-page-break",
            offset: currentOffset(),
          });
        },
        /** Completes one test paragraph. @returns Nothing. */
        finishParagraph(): void {},
        /** Appends text, merging adjacent equal runs like SwTextNode. @param text - Text. @param runProperties - Effective properties. @param hyperlink - Optional hyperlink metadata. @returns Nothing. */
        appendText(text, runProperties, hyperlink): void {
          const previous = paragraph.runs.at(-1);
          if (
            previous !== undefined &&
            JSON.stringify(previous.properties) === JSON.stringify(runProperties) &&
            JSON.stringify(previous.hyperlink) === JSON.stringify(hyperlink)
          )
            previous.text += text;
          else
            paragraph.runs.push({
              ...(hyperlink === undefined ? {} : { hyperlink }),
              properties: runProperties,
              text,
            });
        },
      };
    },
    /** Resolves a list rule. @param name - Style name. @returns Rule. */
    getListRule: (name) => rules.get(name),
    /** Resolves a style in the requested family. @param family - Style family. @param name - Style name. @returns Definition. */
    getStyle: (family, name) =>
      definitions.find(
        /** Matches native family and name identity. @param entry - Named definition. @returns Whether both identity parts match. */
        ([candidate, definition]) => candidate === name && definition.family === family,
      )?.[1],
  };
  parseOdfXmlStream(
    `<office:text xmlns:office="${ODF_NAMESPACES.office}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:xlink="${ODF_NAMESPACES.xlink}">${body}</office:text>`,
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

describe("ODF streaming text import contexts", /** Groups direct model import tests. @returns Nothing. */ () => {
  const styles = new Map<string, OdfStyleDefinition>([
    ["Standard", { family: "paragraph", leftMargin: 720, properties: { bold: true } }],
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
      '<text:sequence-decls/><text:p text:style-name="Standard">plain</text:p><text:h/><text:h text:style-name="P1"><text:span text:style-name="T1">b<text:span text:style-name="T2">i<text:s/><text:tab/><text:line-break/></text:span></text:span></text:h>',
      styles,
    );
    expect(paragraphs).toHaveLength(3);
    expect(paragraphs[0]).toMatchObject({ style: "default", runs: [{ text: "plain" }] });
    expect(paragraphs[0]?.leftMargin).toBe(720);
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

  it("accepts unstyled and empty-style spans with inherited inline state", /** Checks source-derived optional style hints, child overrides and scope restoration. @returns Nothing. */ () => {
    const definitions = new Map<string, OdfStyleDefinition>([
      ["PBold", { family: "paragraph", properties: { bold: true, italic: true, underline: true } }],
      ["TBold", { family: "text", properties: { bold: true } }],
      ["TItalic", { family: "text", properties: { italic: true } }],
    ]);
    const cases = [
      {
        body: '<text:p>A<text:span>B<text:span text:style-name="">C</text:span>D</text:span>E</text:p>',
        expected: [["ABCDE", false, false, false, null]],
      },
      {
        body: '<text:p>A<text:span/><text:span text:style-name=""/>B</text:p>',
        expected: [["AB", false, false, false, null]],
      },
      {
        body: '<text:p>A<text:span text:style-name="TBold">B<text:span>C</text:span><text:span text:style-name="">D</text:span><text:span text:style-name="TItalic">E<text:span>F</text:span></text:span>G</text:span>H</text:p>',
        expected: [
          ["A", false, false, false, null],
          ["BCD", true, false, false, null],
          ["EF", true, true, false, null],
          ["G", true, false, false, null],
          ["H", false, false, false, null],
        ],
      },
      {
        body: '<text:p text:style-name="PBold">A<text:span>B<text:span text:style-name="">C</text:span>D</text:span>E</text:p>',
        expected: [["ABCDE", true, true, true, null]],
      },
      {
        body: '<text:p>A<text:span>B<text:s text:c="2"/><text:tab/><text:line-break/>C</text:span>D</text:p>',
        expected: [["AB  \t\nCD", false, false, false, null]],
      },
      {
        body: '<text:p>A<text:a xlink:href="https://example.test/span">B<text:span>C</text:span><text:span text:style-name="">D</text:span><text:span text:style-name="TBold">E</text:span>F</text:a>G</text:p>',
        expected: [
          ["A", false, false, false, null],
          ["BCD", false, false, false, "https://example.test/span"],
          ["E", true, false, false, "https://example.test/span"],
          ["F", false, false, false, "https://example.test/span"],
          ["G", false, false, false, null],
        ],
      },
    ] as const;
    for (const testCase of cases) {
      const paragraph = importBody(testCase.body, definitions)[0];
      expect(
        paragraph?.runs.map(
          /** Projects text, effective formatting and active link. @param run - Imported run. @returns Comparable source-derived state. */
          (run) => [
            run.text,
            run.properties.bold,
            run.properties.italic,
            run.properties.underline,
            run.hyperlink?.url ?? null,
          ],
        ),
        testCase.body,
      ).toEqual(testCase.expected);
    }
  });

  it("retains inline state for unresolved and property-less character styles", /** Checks family-specific no-op lookups and independent found properties against pinned style application. @returns Nothing. */ () => {
    const definitions = new Map<string, OdfStyleDefinition>([
      ["PBold", { family: "paragraph", properties: { bold: true, italic: true, underline: true } }],
      ["TBold", { family: "text", properties: { bold: true } }],
      ["TItalic", { family: "text", properties: { italic: true } }],
      ["TEmpty", { family: "text" }],
      ["TInherited", { family: "text", parentStyleName: "TBold" }],
      ["TChain", { family: "text", parentStyleName: "TInherited" }],
      ["TEmptyMissing", { family: "text", parentStyleName: "Missing" }],
      ["TEmptyWrong", { family: "text", parentStyleName: "PBold" }],
      [
        "TMissingParent",
        { family: "text", parentStyleName: "Missing", properties: { italic: true } },
      ],
      ["TWrongParent", { family: "text", parentStyleName: "PBold", properties: { italic: true } }],
      [
        "TFalse",
        { family: "text", parentStyleName: "TBold", properties: { bold: false, italic: true } },
      ],
    ]);
    const cases = [
      {
        body: '<text:p>A<text:span text:style-name="Missing">B</text:span><text:span text:style-name="tbold">C</text:span><text:span text:style-name=" TBold ">D</text:span><text:span text:style-name=" ">E</text:span>F</text:p>',
        expected: [["ABCDEF", false, false, false, null]],
      },
      {
        body: '<text:p text:style-name="PBold">A<text:span text:style-name="Missing">B<text:span text:style-name="Missing2">C</text:span>D</text:span>E</text:p>',
        expected: [["ABCDE", true, true, true, null]],
      },
      {
        body: '<text:p>A<text:span text:style-name="TBold">B<text:span text:style-name="Missing">C</text:span><text:span text:style-name="Missing2">D<text:span text:style-name="TItalic">E<text:span text:style-name="Missing3">F</text:span></text:span>G</text:span>H</text:span>I</text:p>',
        expected: [
          ["A", false, false, false, null],
          ["BCD", true, false, false, null],
          ["EF", true, true, false, null],
          ["GH", true, false, false, null],
          ["I", false, false, false, null],
        ],
      },
      {
        body: '<text:p>A<text:span text:style-name="TEmpty">B</text:span><text:span text:style-name="TEmptyMissing">C</text:span><text:span text:style-name="TEmptyWrong">D</text:span>E</text:p>',
        expected: [["ABCDE", false, false, false, null]],
      },
      {
        body: '<text:p>A<text:span text:style-name="TInherited">B</text:span><text:span text:style-name="TChain">C</text:span>D</text:p>',
        expected: [
          ["A", false, false, false, null],
          ["BC", true, false, false, null],
          ["D", false, false, false, null],
        ],
      },
      {
        body: '<text:p>A<text:span text:style-name="TMissingParent">B<text:span text:style-name="Missing">C</text:span></text:span>D</text:p>',
        expected: [
          ["A", false, false, false, null],
          ["BC", false, true, false, null],
          ["D", false, false, false, null],
        ],
      },
      {
        body: '<text:p>A<text:span text:style-name="PBold">B</text:span><text:span text:style-name="TBold">C<text:span text:style-name="PBold">D</text:span>E</text:span>F</text:p>',
        expected: [
          ["AB", false, false, false, null],
          ["CDE", true, false, false, null],
          ["F", false, false, false, null],
        ],
      },
      {
        body: '<text:p>A<text:span text:style-name="TWrongParent">B</text:span>C</text:p>',
        expected: [
          ["A", false, false, false, null],
          ["B", false, true, false, null],
          ["C", false, false, false, null],
        ],
      },
      {
        body: '<text:p>A<text:span text:style-name="TBold">B<text:span text:style-name="TFalse">C<text:span text:style-name="Missing">D</text:span></text:span>E</text:span>F</text:p>',
        expected: [
          ["A", false, false, false, null],
          ["B", true, false, false, null],
          ["CD", false, true, false, null],
          ["E", true, false, false, null],
          ["F", false, false, false, null],
        ],
      },
      {
        body: '<text:p>A<text:span text:style-name="Missing">B<text:s text:c="2"/><text:tab/><text:line-break/>C</text:span>D</text:p>',
        expected: [["AB  \t\nCD", false, false, false, null]],
      },
      {
        body: '<text:p>A<text:a xlink:href="https://example.test/style">B<text:span text:style-name="Missing">C</text:span><text:span text:style-name="TEmpty">D</text:span><text:span text:style-name="TMissingParent">E</text:span>F</text:a>G</text:p>',
        expected: [
          ["A", false, false, false, null],
          ["BCD", false, false, false, "https://example.test/style"],
          ["E", false, true, false, "https://example.test/style"],
          ["F", false, false, false, "https://example.test/style"],
          ["G", false, false, false, null],
        ],
      },
    ] as const;
    for (const testCase of cases) {
      expect(
        importBody(testCase.body, definitions)[0]?.runs.map(
          /** Projects text, effective properties and link across style lookup boundaries. @param run - Captured run. @returns Comparable state tuple. */
          (run) => [
            run.text,
            run.properties.bold,
            run.properties.italic,
            run.properties.underline,
            run.hyperlink?.url ?? null,
          ],
        ),
        testCase.body,
      ).toEqual(testCase.expected);
    }
  });

  it("resolves equal style names within the requested family", /** Compares source-derived family identity through direct, parent and built-in context lookups in both declaration orders. @returns Nothing. */ () => {
    const definitions: readonly (readonly [string, OdfStyleDefinition])[] = [
      ["Standard", { family: "paragraph", properties: { bold: false } }],
      ["Standard", { family: "text", properties: { italic: true } }],
      [
        "Heading_20_1",
        { family: "paragraph", parentStyleName: "Standard", properties: { bold: true } },
      ],
      ["Heading_20_1", { family: "text", properties: { underline: true } }],
      [
        "Shared",
        { family: "paragraph", parentStyleName: "Heading_20_1", properties: { italic: true } },
      ],
      ["Shared", { family: "text", parentStyleName: "Standard", properties: { underline: true } }],
      ["Child", { family: "paragraph", parentStyleName: "Shared", properties: { italic: false } }],
      [
        "Child",
        { family: "text", parentStyleName: "Shared", properties: { bold: false, italic: false } },
      ],
      ["OnlyParagraph", { family: "paragraph", properties: { bold: true } }],
      [
        "WrongParent",
        { family: "text", parentStyleName: "OnlyParagraph", properties: { italic: true } },
      ],
    ];
    const cases = [
      [
        '<text:p text:style-name="Child">A<text:span text:style-name="Child">B</text:span>C</text:p>',
        [
          ["A", true, false, false],
          ["B", false, false, true],
          ["C", true, false, false],
        ],
      ],
      [
        '<text:p text:style-name="Child">A<text:span text:style-name="Shared">B</text:span>C</text:p>',
        [
          ["A", true, false, false],
          ["B", true, true, true],
          ["C", true, false, false],
        ],
      ],
      [
        '<text:p text:style-name="Standard">A<text:span text:style-name="Standard">B</text:span>C</text:p>',
        [
          ["A", false, false, false],
          ["B", false, true, false],
          ["C", false, false, false],
        ],
      ],
      [
        '<text:h text:style-name="Heading_20_1">A<text:span text:style-name="Heading_20_1">B</text:span>C</text:h>',
        [
          ["A", true, false, false],
          ["B", true, false, true],
          ["C", true, false, false],
        ],
      ],
      [
        '<text:p>A<text:span text:style-name="OnlyParagraph">B</text:span><text:span text:style-name="WrongParent">C</text:span>D</text:p>',
        [
          ["AB", false, false, false],
          ["C", false, true, false],
          ["D", false, false, false],
        ],
      ],
    ] as const;
    for (const order of [definitions, [...definitions].reverse()]) {
      for (const [body, expected] of cases) {
        expect(
          importBody(body, order)[0]?.runs.map(
            /** Projects family-isolated inherited state. @param run - Captured run. @returns Expected comparison tuple. */
            (run) => [
              run.text,
              run.properties.bold,
              run.properties.italic,
              run.properties.underline,
            ],
          ),
          body,
        ).toEqual(expected);
      }
    }
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
      importBody(
        '<text:p>before <text:a xlink:href="https://example.test" xlink:type="simple" xlink:show="new" office:name="named" text:style-name="Internet_20_link" text:visited-style-name="Visited_20_Internet_20_Link">linked<text:span text:style-name="T1"> bold</text:span><text:tab/></text:a> after</text:p>',
        styles,
      )[0]?.runs,
    ).toEqual([
      { properties: { bold: false, italic: false, underline: false }, text: "before " },
      {
        properties: { bold: false, italic: false, underline: false },
        hyperlink: {
          name: "named",
          styleName: "Internet_20_link",
          targetFrame: "_blank",
          url: "https://example.test",
          visitedStyleName: "Visited_20_Internet_20_Link",
        },
        text: "linked",
      },
      {
        properties: { bold: true, italic: false, underline: false },
        hyperlink: {
          name: "named",
          styleName: "Internet_20_link",
          targetFrame: "_blank",
          url: "https://example.test",
          visitedStyleName: "Visited_20_Internet_20_Link",
        },
        text: " bold",
      },
      {
        properties: { bold: false, italic: false, underline: false },
        hyperlink: {
          name: "named",
          styleName: "Internet_20_link",
          targetFrame: "_blank",
          url: "https://example.test",
          visitedStyleName: "Visited_20_Internet_20_Link",
        },
        text: "\t",
      },
      { properties: { bold: false, italic: false, underline: false }, text: " after" },
    ]);
    expect(importBody("<text:p><text:a>plain</text:a></text:p>", styles)[0]?.runs).toEqual([
      { properties: { bold: false, italic: false, underline: false }, text: "plain" },
    ]);
    expect(
      importBody(
        '<text:p><text:a xlink:href="same" xlink:show="replace">same</text:a><text:a xlink:href="other" xlink:show="other">other</text:a><text:a xlink:href="parent" office:target-frame-name="_parent">parent</text:a></text:p>',
        styles,
      )[0]?.runs,
    ).toEqual([
      {
        hyperlink: { targetFrame: "_self", url: "same" },
        properties: { bold: false, italic: false, underline: false },
        text: "same",
      },
      {
        hyperlink: { url: "other" },
        properties: { bold: false, italic: false, underline: false },
        text: "other",
      },
      {
        hyperlink: { targetFrame: "_parent", url: "parent" },
        properties: { bold: false, italic: false, underline: false },
        text: "parent",
      },
    ]);
    expect(
      importBody(
        '<text:p><text:a xlink:href="relative"><text:span text:style-name="T1">A<text:s text:c="2"/>B</text:span></text:a></text:p>',
        styles,
      )[0]?.runs,
    ).toEqual([
      {
        hyperlink: { url: "relative" },
        properties: { bold: true, italic: false, underline: false },
        text: "A  B",
      },
    ]);
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
      /** Imports a restart outside Writer's bounded integer range. @returns Nothing. */ () =>
        importBody(
          '<text:list text:style-name="L1"><text:list-item text:start-value="40000"><text:p/></text:list-item></text:list>',
          styles,
          new Map([["L1", bullet]]),
        ),
    ).toThrow("list start value");
    expect(
      /** Imports a non-integer restart value. @returns Nothing. */ () =>
        importBody(
          '<text:list text:style-name="L1"><text:list-item text:start-value="nope"><text:p/></text:list-item></text:list>',
          styles,
          new Map([["L1", bullet]]),
        ),
    ).toThrow("list start value");
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
