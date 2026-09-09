/** @fileoverview Verifies bounded ODF text paragraph import and export semantics. */

import { describe, expect, it } from "vitest";

import {
  escapeXml,
  exportCharacterAttributes,
  exportTextParagraphs,
  ODF_NAMESPACES,
  type OdfCharacterProperties,
  type OdfListRule,
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

  it("exports nested list blocks, per-level rules, and continued list identities" /** Verifies the flat Writer list state becomes canonical ODF containers. @returns Nothing. */, () => {
    const rule: OdfListRule = {
      formats: Array.from(
        { length: 10 },
        /** Selects the fixture format for a list level. @param _unused - Unused array slot. @param level - Zero-based level. @returns List format kind. */
        (_unused, level) => (level === 1 ? "numbered" : "bullet"),
      ),
      name: "Mixed list",
    };
    const list =
      /** Creates list metadata for one level. @param level - Zero-based list level. @returns Paragraph list metadata. */ (
        level: number,
      ) => ({ level, listId: "list-a", rule });
    const output = exportTextParagraphs([
      { list: list(0), runs: [{ properties: plain, text: "root" }], style: "default" },
      { list: list(1), runs: [{ properties: plain, text: "nested" }], style: "default" },
      { list: list(0), runs: [{ properties: plain, text: "tail" }], style: "default" },
      { runs: [{ properties: plain, text: "break" }], style: "default" },
      { list: list(0), runs: [{ properties: plain, text: "continued" }], style: "default" },
    ]);
    expect(output.automaticStyles).toContain(
      '<text:list-style style:name="L1" style:display-name="Mixed list">',
    );
    expect(output.automaticStyles).toContain(
      '<text:list-level-style-number text:level="2" style:num-format="1"/>',
    );
    expect(output.body).toContain(
      '<text:list text:style-name="L1" xml:id="list-a"><text:list-item>',
    );
    expect(output.body).toContain(
      '<text:list text:style-name="L1"><text:list-item><text:p text:style-name="Standard">nested</text:p>',
    );
    expect(output.body).toContain('text:continue-list="list-a"');
    expect(
      importTextParagraphs(parseText(output.body), new Map(), new Map([["L1", rule]])).map(
        /** Projects an imported paragraph into assertions. @param paragraph - Imported paragraph. @returns Comparable paragraph state. */
        (paragraph) => ({
          list: paragraph.list,
          text: paragraph.runs
            .map(
              /** Reads run text. @param run - Imported text run. @returns Run text. */ (run) =>
                run.text,
            )
            .join(""),
        }),
      ),
    ).toEqual([
      { list: list(0), text: "root" },
      { list: list(1), text: "nested" },
      { list: list(0), text: "tail" },
      { list: undefined, text: "break" },
      { list: list(0), text: "continued" },
    ]);
  });

  it("rejects inconsistent list metadata and makes encoded XML identities unique" /** Covers strict non-lossy list export guards. @returns Nothing. */, () => {
    const bulletRule: OdfListRule = {
      formats: Array.from(
        { length: 10 },
        /** Creates a bullet level. @returns Bullet kind. */ () => "bullet",
      ),
      name: "Rule",
    };
    const paragraph =
      /** Creates a paragraph containing list metadata. @param list - Canonical list metadata. @returns ODF paragraph. */ (
        list: NonNullable<OdfParagraph["list"]>,
      ): OdfParagraph => ({ list, runs: [], style: "default" });
    const valid = { level: 0, listId: "id", rule: bulletRule };
    expect(
      /** Exports conflicting definitions of one named rule. @returns Invalid export. */ () =>
        exportTextParagraphs([
          paragraph(valid),
          paragraph({
            ...valid,
            rule: {
              formats: Array.from(
                { length: 10 },
                /** Creates a numbered level. @returns Numbered kind. */ () => "numbered",
              ),
              name: "Rule",
            },
          }),
        ]),
    ).toThrow("Conflicting ODF list rule");
    for (const level of [-1, 0.5, 10])
      expect(
        /** Exports an invalid list level. @returns Invalid export. */ () =>
          exportTextParagraphs([paragraph({ ...valid, level })]),
      ).toThrow("outside its numbering rule");
    expect(
      /** Exports a missing list identity. @returns Invalid export. */ () =>
        exportTextParagraphs([paragraph({ ...valid, listId: "" })]),
    ).toThrow("identity and rule name");
    expect(
      /** Exports a missing rule name. @returns Invalid export. */ () =>
        exportTextParagraphs([paragraph({ ...valid, rule: { ...bulletRule, name: "" } })]),
    ).toThrow("identity and rule name");
    expect(
      /** Exports an incomplete Writer rule. @returns Invalid export. */ () =>
        exportTextParagraphs([
          paragraph({ ...valid, rule: { formats: ["bullet"], name: "short" } }),
        ]),
    ).toThrow("define ten Writer levels");
    const output = exportTextParagraphs([
      paragraph({ level: 0, listId: " ", rule: bulletRule }),
      { runs: [], style: "default" },
      paragraph({ level: 0, listId: "list-20", rule: bulletRule }),
    ]);
    expect(output.body).toContain('xml:id="list-20"');
    expect(output.body).toContain('xml:id="list-20-2"');
    const numberedRule: OdfListRule = {
      formats: Array.from(
        { length: 10 },
        /** Creates a numbered level. @returns Numbered kind. */ () => "numbered",
      ),
      name: "Numbers",
    };
    expect(
      exportTextParagraphs([
        paragraph({ level: 0, listId: "shared", rule: bulletRule }),
        paragraph({ level: 0, listId: "shared", rule: numberedRule }),
      ]).body,
    ).toContain('text:continue-list="shared"');
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

  it("validates recursive list structure and synthesizes absent root identities" /** Covers strict list-block import guards and identity fallbacks. @returns Nothing. */, () => {
    const rule: OdfListRule = {
      formats: Array.from(
        { length: 10 },
        /** Creates a bullet level. @returns Bullet kind. */ () => "bullet",
      ),
      name: "Bullets",
    };
    const rules = new Map([["L1", rule]]);
    const importBody =
      /** Imports an ODF body fragment. @param body - ODF text XML. @param suppliedRules - Available list rules. @returns Imported paragraphs. */ (
        body: string,
        suppliedRules = rules,
      ) => importTextParagraphs(parseText(body), new Map(), suppliedRules);
    for (const body of ["<foreign/>", "<text:section/>"])
      expect(
        /** Imports an unsupported body element. @returns Invalid import. */ () => importBody(body),
      ).toThrow("Unsupported ODF text element");
    expect(
      /** Imports a list with an unresolved style. @returns Invalid import. */ () =>
        importBody(
          '<text:list text:style-name="Missing"><text:list-item><text:p>x</text:p></text:list-item></text:list>',
        ),
    ).toThrow("Unsupported ODF list style");
    expect(
      /** Imports a list beyond its rule table. @returns Invalid import. */ () =>
        importBody(
          '<text:list text:style-name="L1"><text:list-item><text:list><text:list-item><text:p>x</text:p></text:list-item></text:list></text:list-item></text:list>',
          new Map([["L1", { formats: ["bullet"], name: "Short" }]]),
        ),
    ).toThrow("Unsupported ODF list level");
    expect(
      importBody(
        '<text:list text:style-name="L1"><text:list-item><text:p>x</text:p></text:list-item></text:list>',
      )[0]?.list?.listId,
    ).toBe("Bullets-1");
    expect(
      importBody(
        '<text:list text:style-name="L1" text:continue-list="external"><text:list-item><text:p>x</text:p></text:list-item></text:list>',
      )[0]?.list?.listId,
    ).toBe("external");
    for (const body of [
      '<text:list text:style-name="L1"><foreign/></text:list>',
      '<text:list text:style-name="L1"><text:list-header/></text:list>',
      '<text:list text:style-name="L1"><text:list-item><foreign/></text:list-item></text:list>',
      '<text:list text:style-name="L1"><text:list-item><text:section/></text:list-item></text:list>',
      '<text:list text:style-name="L1"><text:list-item><text:p>a</text:p><text:p>b</text:p></text:list-item></text:list>',
      '<text:list text:style-name="L1" text:continue-numbering="true"><text:list-item><text:p>x</text:p></text:list-item></text:list>',
    ])
      expect(
        /** Imports an unsupported list structure. @returns Invalid import. */ () =>
          importBody(body),
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
