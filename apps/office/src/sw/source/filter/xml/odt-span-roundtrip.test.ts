/** @fileoverview Verifies native optional span-style behavior through literal ODT input and Writer package cycles. */

import { describe, expect, it } from "vitest";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { createWriterDocument } from "../../core/doc/doc";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

/** Replaces content with literal span/style input while retaining a real Writer package. @param bytes - Baseline ODT. @param body - Literal paragraph. @returns Package bytes. */
async function withSpanInput(bytes: Uint8Array, body: string): Promise<Uint8Array> {
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
            .replace("</office:automatic-styles>", `${styleDefinitions}</office:automatic-styles>`)
            .replace(/<text:p\b[^>]*>[\s\S]*?<\/text:p>/u, body),
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
});
