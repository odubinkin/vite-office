/** @fileoverview Verifies native optional span-style behavior through literal ODT input and Writer package cycles. */

import { describe, expect, it } from "vitest";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { createWriterDocument } from "../../core/doc/doc";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

/** Replaces content with literal span/style input while retaining a real Writer package. @param bytes - Baseline ODT. @param body - Literal paragraph. @param automaticStyles - Extra automatic character definitions. @param commonStyles - Named character parent definitions. @returns Package bytes. */
async function withSpanInput(
  bytes: Uint8Array,
  body: string,
  automaticStyles = "",
  commonStyles = "",
): Promise<Uint8Array> {
  const input = new ZipFile(bytes);
  const output = new ZipOutputStream();
  const styleDefinitions =
    '<style:style style:name="SpanBold" style:family="text"><style:text-properties fo:font-weight="bold"/></style:style><style:style style:name="SpanItalic" style:family="text"><style:text-properties fo:font-style="italic"/></style:style><style:style style:name="ParagraphBold" style:family="paragraph"><style:text-properties fo:font-weight="bold" fo:font-style="italic"/></style:style>';
  for (const entry of input.getEntryNames()) {
    if (entry === "content.xml") {
      const xml = await input.readTextEntry(entry);
      expect(xml).toContain("</office:automatic-styles>");
      expect(xml).toMatch(/<text:p\b[^>]*>[\s\S]*?<\/text:p>/u);
      output.putNextEntry(
        entry,
        new TextEncoder().encode(
          xml
            .replace(
              "</office:automatic-styles>",
              `${styleDefinitions}${automaticStyles}</office:automatic-styles>`,
            )
            .replace(/<text:p\b[^>]*>[\s\S]*?<\/text:p>/u, body),
        ),
      );
    } else if (entry === "styles.xml" && commonStyles !== "") {
      const xml = await input.readTextEntry(entry);
      expect(xml).toContain("</office:styles>");
      output.putNextEntry(
        entry,
        new TextEncoder().encode(
          xml.replace("</office:styles>", `${commonStyles}</office:styles>`),
        ),
      );
    } else output.putNextEntry(entry, await input.readEntry(entry));
  }
  return output.finish();
}

describe("Writer optional span style ODT contract", /** Groups source-derived package assertions. @returns Nothing. */ () => {
  it("preserves unstyled spans, inherited formatting, controls and hyperlinks through package cycles", /** Checks literal native span inputs against manual Writer projections after import and reimport. @returns Completion after all packages. */ async () => {
    const base = writeOdtDocument(createWriterDocument(), { title: "Optional span styles" });
    const cases = [
      {
        name: "missing style",
        body: "<text:p>A<text:span>B</text:span>C</text:p>",
        expected: [["ABC", false, false, false, null]],
      },
      {
        name: "empty style",
        body: '<text:p>A<text:span text:style-name="">B</text:span>C</text:p>',
        expected: [["ABC", false, false, false, null]],
      },
      {
        name: "nested spans and empty leaves",
        body: '<text:p>A<text:span>B<text:span text:style-name="">C</text:span>D</text:span><text:span/><text:span text:style-name=""/>E</text:p>',
        expected: [["ABCDE", false, false, false, null]],
      },
      {
        name: "inherited paragraph formatting",
        body: '<text:p text:style-name="ParagraphBold">A<text:span>B<text:span text:style-name="">C</text:span>D</text:span>E</text:p>',
        expected: [["ABCDE", true, true, false, null]],
      },
      {
        name: "character style inheritance, explicit override and scope restoration",
        body: '<text:p>A<text:span text:style-name="SpanBold">B<text:span>C</text:span><text:span text:style-name="">D</text:span><text:span text:style-name="SpanItalic">E<text:span>F</text:span></text:span>G</text:span>H</text:p>',
        expected: [
          ["A", false, false, false, null],
          ["BCD", true, false, false, null],
          ["EF", true, true, false, null],
          ["G", true, false, false, null],
          ["H", false, false, false, null],
        ],
      },
      {
        name: "supported controls",
        body: '<text:p>A<text:span>B<text:s text:c="2"/><text:tab/><text:line-break/>C</text:span>D</text:p>',
        expected: [["AB  \t\nCD", false, false, false, null]],
      },
      {
        name: "active hyperlink preserved through span transitions",
        body: '<text:p>A<text:a xlink:href="https://example.test/span">B<text:span>C</text:span><text:span text:style-name="">D</text:span><text:span text:style-name="SpanBold">E</text:span>F</text:a>G</text:p>',
        expected: [
          ["A", false, false, false, null],
          ["BCD", false, false, false, "https://example.test/span"],
          ["E", true, false, false, "https://example.test/span"],
          ["F", false, false, false, "https://example.test/span"],
          ["G", false, false, false, null],
        ],
      },
      {
        name: "hyperlink inside an unstyled span",
        body: '<text:p>A<text:span>B<text:a xlink:href="https://example.test/span">C<text:span text:style-name="">D</text:span></text:a>E</text:span>F</text:p>',
        expected: [
          ["AB", false, false, false, null],
          ["CD", false, false, false, "https://example.test/span"],
          ["EF", false, false, false, null],
        ],
      },
    ] as const;
    for (const testCase of cases) {
      const imported = await readOdtDocument(await withSpanInput(base, testCase.body), {
        title: testCase.name,
      });
      const reopened = await readOdtDocument(
        writeOdtDocument(imported.document, { title: testCase.name }),
        { title: testCase.name },
      );
      for (const document of [imported.document, reopened.document]) {
        expect(document.paragraphs, testCase.name).toHaveLength(1);
        expect(
          projectWriterTextRuns(document.paragraphs[0]).map(
            /** Projects effective formatting and link metadata at Writer boundaries. @param run - Canonical run. @returns Manual native-state comparison tuple. */
            (run) => [
              run.text,
              run.attributes.bold,
              run.attributes.italic,
              run.attributes.underline,
              run.hyperlink?.url ?? null,
            ],
          ),
          testCase.name,
        ).toEqual(testCase.expected);
      }
    }
  });

  it("retains inherited formatting for unresolved and property-less styles through package cycles", /** Verifies family-specific fallback and independent automatic deltas using genuine named parent styles. @returns Completion after literal ODT cases. */ async () => {
    const base = writeOdtDocument(createWriterDocument(), { title: "Unresolved character styles" });
    const commonStyles =
      '<style:style style:name="CommonBold" style:family="text"><style:text-properties fo:font-weight="bold"/></style:style><style:style style:name="CommonInherited" style:family="text" style:parent-style-name="CommonBold"/>';
    const automaticStyles =
      '<style:style style:name="SpanEmpty" style:family="text"/><style:style style:name="SpanInherited" style:family="text" style:parent-style-name="CommonBold"/><style:style style:name="SpanChain" style:family="text" style:parent-style-name="CommonInherited"/><style:style style:name="SpanEmptyMissing" style:family="text" style:parent-style-name="Missing"/><style:style style:name="SpanEmptyWrong" style:family="text" style:parent-style-name="ParagraphBold"/><style:style style:name="SpanMissingParent" style:family="text" style:parent-style-name="Missing"><style:text-properties fo:font-style="italic"/></style:style><style:style style:name="SpanWrongParent" style:family="text" style:parent-style-name="ParagraphBold"><style:text-properties fo:font-style="italic"/></style:style><style:style style:name="SpanFalse" style:family="text" style:parent-style-name="CommonBold"><style:text-properties fo:font-weight="normal" fo:font-style="italic"/></style:style>';
    const cases = [
      {
        name: "unresolved names stay exact",
        body: '<text:p>A<text:span text:style-name="Missing">B</text:span><text:span text:style-name="spanbold">C</text:span><text:span text:style-name=" SpanBold ">D</text:span><text:span text:style-name=" ">E</text:span>F</text:p>',
        expected: [["ABCDEF", false, false, false, null]],
      },
      {
        name: "paragraph formatting survives unknown styles",
        body: '<text:p text:style-name="ParagraphBold">A<text:span text:style-name="Missing">B<text:span text:style-name="Missing2">C</text:span>D</text:span>E</text:p>',
        expected: [["ABCDE", true, true, false, null]],
      },
      {
        name: "nested unknown styles preserve active overrides and restore scope",
        body: '<text:p>A<text:span text:style-name="SpanBold">B<text:span text:style-name="Missing">C</text:span><text:span text:style-name="Missing2">D<text:span text:style-name="SpanItalic">E<text:span text:style-name="Missing3">F</text:span></text:span>G</text:span>H</text:span>I</text:p>',
        expected: [
          ["A", false, false, false, null],
          ["BCD", true, false, false, null],
          ["EF", true, true, false, null],
          ["GH", true, false, false, null],
          ["I", false, false, false, null],
        ],
      },
      {
        name: "property-less styles and missing parents apply no delta",
        body: '<text:p>A<text:span text:style-name="SpanEmpty">B</text:span><text:span text:style-name="SpanEmptyMissing">C</text:span><text:span text:style-name="SpanEmptyWrong">D</text:span>E</text:p>',
        expected: [["ABCDE", false, false, false, null]],
      },
      {
        name: "property-less automatic styles inherit named character parents",
        body: '<text:p>A<text:span text:style-name="SpanInherited">B</text:span><text:span text:style-name="SpanChain">C</text:span>D</text:p>',
        expected: [
          ["A", false, false, false, null],
          ["BC", true, false, false, null],
          ["D", false, false, false, null],
        ],
      },
      {
        name: "found automatic properties survive missing parent",
        body: '<text:p>A<text:span text:style-name="SpanMissingParent">B<text:span text:style-name="Missing">C</text:span></text:span>D</text:p>',
        expected: [
          ["A", false, false, false, null],
          ["BC", false, true, false, null],
          ["D", false, false, false, null],
        ],
      },
      {
        name: "paragraph family cannot apply a character style",
        body: '<text:p>A<text:span text:style-name="ParagraphBold">B</text:span><text:span text:style-name="SpanBold">C<text:span text:style-name="ParagraphBold">D</text:span>E</text:span>F</text:p>',
        expected: [
          ["AB", false, false, false, null],
          ["CDE", true, false, false, null],
          ["F", false, false, false, null],
        ],
      },
      {
        name: "found automatic properties survive wrong-family parent",
        body: '<text:p>A<text:span text:style-name="SpanWrongParent">B</text:span>C</text:p>',
        expected: [
          ["A", false, false, false, null],
          ["B", false, true, false, null],
          ["C", false, false, false, null],
        ],
      },
      {
        name: "explicit false overrides survive unknown nested span",
        body: '<text:p>A<text:span text:style-name="SpanBold">B<text:span text:style-name="SpanFalse">C<text:span text:style-name="Missing">D</text:span></text:span>E</text:span>F</text:p>',
        expected: [
          ["A", false, false, false, null],
          ["B", true, false, false, null],
          ["CD", false, true, false, null],
          ["E", true, false, false, null],
          ["F", false, false, false, null],
        ],
      },
      {
        name: "unknown styles retain controls",
        body: '<text:p>A<text:span text:style-name="Missing">B<text:s text:c="2"/><text:tab/><text:line-break/>C</text:span>D</text:p>',
        expected: [["AB  \t\nCD", false, false, false, null]],
      },
      {
        name: "style fallback retains active hyperlink",
        body: '<text:p>A<text:a xlink:href="https://example.test/style">B<text:span text:style-name="Missing">C</text:span><text:span text:style-name="SpanEmpty">D</text:span><text:span text:style-name="SpanMissingParent">E</text:span>F</text:a>G</text:p>',
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
      const imported = await readOdtDocument(
        await withSpanInput(base, testCase.body, automaticStyles, commonStyles),
        { title: testCase.name },
      );
      const reopened = await readOdtDocument(
        writeOdtDocument(imported.document, { title: testCase.name }),
        { title: testCase.name },
      );
      for (const document of [imported.document, reopened.document]) {
        expect(document.paragraphs, testCase.name).toHaveLength(1);
        expect(
          projectWriterTextRuns(document.paragraphs[0]).map(
            /** Projects canonical Writer formatting and hyperlink after style resolution. @param run - Canonical run. @returns Manual comparison tuple. */
            (run) => [
              run.text,
              run.attributes.bold,
              run.attributes.italic,
              run.attributes.underline,
              run.hyperlink?.url ?? null,
            ],
          ),
          testCase.name,
        ).toEqual(testCase.expected);
      }
    }
  });
});
