/** @fileoverview Verifies pinned paragraph/text family identity through literal ODT definitions and Writer package cycles. */

import { FontItalic, FontWeight } from "../../../../tools/inc/fontenum";
import { SvxPostureItem, SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { RES_CHRATR_POSTURE, RES_CHRATR_WEIGHT } from "../../../inc/hintids";
import { SwFormatCharFormat } from "../../core/txtnode/fmtatr2";
import { SwTextCharFormat } from "../../core/txtnode/txtatr2";
import { assert, describe, expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { DocumentArchiveWriter } from "../../../../package/source/zippackage/document-archive";
import { createWriterDocument } from "../../core/doc/doc";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { importWriterXml } from "./xmlimp";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

const standard =
  '<style:style style:name="Standard" style:family="paragraph"><style:paragraph-properties fo:text-align="left" fo:margin-left="0in"/><style:text-properties fo:font-weight="normal" fo:font-style="normal" style:text-underline-style="none"/></style:style>';
const heading =
  '<style:style style:name="Heading_20_1" style:family="paragraph" style:parent-style-name="Standard"><style:paragraph-properties fo:text-align="right" fo:margin-left="1in"/><style:text-properties fo:font-weight="bold"/></style:style>';
const commonDefinitions = [
  '<style:style style:name="Shared" style:family="paragraph" style:parent-style-name="Standard"><style:paragraph-properties fo:text-align="right" fo:margin-left="1in"/><style:text-properties fo:font-weight="bold"/></style:style>',
  '<style:style style:name="Shared" style:family="text"><style:text-properties fo:font-style="italic"/></style:style>',
  '<style:style style:name="Standard" style:family="text"><style:text-properties fo:font-style="italic"/></style:style>',
  '<style:style style:name="Heading_20_1" style:family="text"><style:text-properties style:text-underline-style="solid"/></style:style>',
  '<style:style style:name="Unitalic" style:family="text"><style:text-properties fo:font-style="normal"/></style:style>',
  '<style:style style:name="OnlyParagraph" style:family="paragraph"><style:text-properties fo:font-weight="bold"/></style:style>',
];
const automaticDefinitions = [
  '<style:style style:name="Child" style:family="paragraph" style:parent-style-name="Shared"><style:paragraph-properties fo:text-align="center" fo:margin-left="0.5in"/><style:text-properties fo:font-weight="normal"/></style:style>',
  '<style:style style:name="Child" style:family="text" style:parent-style-name="Shared"><style:text-properties style:text-underline-style="solid"/></style:style>',
  '<style:style style:name="WrongParent" style:family="text" style:parent-style-name="OnlyParagraph"><style:text-properties fo:font-style="italic"/></style:style>',
];

/** Adds literal family collision input to a real Writer package. @param bytes - Baseline package. @param body - One literal paragraph. @param reversed - Reverse each declaration order. @returns ODT bytes. */
async function withFamilyInput(
  bytes: Uint8Array,
  body: string,
  reversed: boolean,
): Promise<Uint8Array> {
  const input = await DocumentArchive.open(bytes);
  const output = new DocumentArchiveWriter();
  for (const entry of input.getEntryNames()) {
    if (entry === "styles.xml") {
      const xml = await input.readTextEntry(entry);
      const standardPattern =
        /<style:style\b[^>]*style:name="Standard"[^>]*>[\s\S]*?<\/style:style>/u;
      const headingPattern =
        /<style:style\b[^>]*style:name="Heading_20_1"[^>]*>[\s\S]*?<\/style:style>/u;
      expect(xml).toMatch(standardPattern);
      expect(xml).toMatch(headingPattern);
      const definitions = reversed ? [...commonDefinitions].reverse() : commonDefinitions;
      output.putNextEntry(
        entry,
        new TextEncoder().encode(
          xml
            .replace(standardPattern, standard)
            .replace(headingPattern, heading)
            .replace("</office:styles>", `${definitions.join("")}</office:styles>`),
        ),
      );
    } else if (entry === "content.xml") {
      const xml = await input.readTextEntry(entry);
      expect(xml).toContain("</office:automatic-styles>");
      expect(xml).toMatch(/<text:p\b[^>]*>[\s\S]*?<\/text:p>/u);
      const definitions = reversed ? [...automaticDefinitions].reverse() : automaticDefinitions;
      output.putNextEntry(
        entry,
        new TextEncoder().encode(
          xml
            .replace(
              "</office:automatic-styles>",
              `${definitions.join("")}</office:automatic-styles>`,
            )
            .replace(/<text:p\b[^>]*>[\s\S]*?<\/text:p>/u, body),
        ),
      );
    } else output.putNextEntry(entry, await input.readEntry(entry));
  }
  return await output.finish();
}

describe("Writer ODT style family identity", /** Groups source-derived family-plus-name assertions. @returns Nothing. */ () => {
  it("keeps equal paragraph and character names independent through package cycles", /** Verifies declaration-order-independent direct, inherited and built-in family lookup against manual Writer state. @returns Completion after literal inputs. */ async () => {
    const writer = createWriterDocument();
    writer.GetTextFormatColl("heading-1");
    const base = await writeOdtDocument(writer, { title: "Family identity" });
    const cases = [
      {
        name: "named family collision",
        body: '<text:p text:style-name="Shared">A<text:span text:style-name="Shared">B</text:span>C</text:p>',
        alignment: "right",
        margin: 1440,
        expected: [
          ["A", true, false, false],
          ["B", true, true, false],
          ["C", true, false, false],
        ],
      },
      {
        name: "automatic family collision and independent parents",
        body: '<text:p text:style-name="Child">A<text:span text:style-name="Child">B</text:span>C</text:p>',
        alignment: "center",
        margin: 720,
        expected: [
          ["A", false, false, false],
          ["B", false, true, true],
          ["C", false, false, false],
        ],
      },
      {
        name: "nested same-name overrides and scope restoration",
        body: '<text:p text:style-name="Shared">A<text:span text:style-name="Child">B<text:span text:style-name="Shared">C</text:span>D</text:span>E</text:p>',
        alignment: "right",
        margin: 1440,
        expected: [
          ["A", true, false, false],
          ["BCD", true, true, true],
          ["E", true, false, false],
        ],
      },
      {
        name: "Standard built-in family collision",
        body: '<text:p text:style-name="Standard">A<text:span text:style-name="Standard">B</text:span>C</text:p>',
        alignment: "left",
        margin: 0,
        expected: [
          ["A", false, false, false],
          ["B", false, true, false],
          ["C", false, false, false],
        ],
      },
      {
        name: "heading built-in family collision",
        body: '<text:h text:style-name="Heading_20_1">A<text:span text:style-name="Heading_20_1">B</text:span>C</text:h>',
        alignment: "right",
        margin: 1440,
        expected: [
          ["A", true, false, false],
          ["B", true, false, true],
          ["C", true, false, false],
        ],
      },
      {
        name: "named formatting overrides a property from an enclosing automatic span",
        body: '<text:p>A<text:span text:style-name="WrongParent">B<text:span text:style-name="Unitalic">C</text:span>D</text:span>E</text:p>',
        alignment: "left",
        margin: 0,
        expected: [
          ["A", false, false, false],
          ["B", false, true, false],
          ["C", false, false, false],
          ["D", false, true, false],
          ["E", false, false, false],
        ],
      },
      {
        name: "wrong-family reference and parent do not leak properties",
        body: '<text:p>A<text:span text:style-name="OnlyParagraph">B</text:span><text:span text:style-name="WrongParent">C</text:span>D</text:p>',
        alignment: "left",
        margin: 0,
        expected: [
          ["AB", false, false, false],
          ["C", false, true, false],
          ["D", false, false, false],
        ],
      },
    ] as const;
    for (const reversed of [false, true]) {
      for (const testCase of cases) {
        const imported = await readOdtDocument(
          await withFamilyInput(base, testCase.body, reversed),
          { title: testCase.name },
        );
        const reopened = await readOdtDocument(
          await writeOdtDocument(imported.document, { title: testCase.name }),
          { title: testCase.name },
        );
        for (const [phase, document] of [
          ["imported", imported.document],
          ["reopened", reopened.document],
        ] as const) {
          expect(document.paragraphs, testCase.name).toHaveLength(1);
          const paragraph = document.paragraphs[0];
          expect(paragraph?.GetParagraphAlignment(), testCase.name).toBe(testCase.alignment);
          expect(paragraph?.GetParagraphTextLeftMargin(), testCase.name).toBe(testCase.margin);
          expect(
            projectWriterTextRuns(paragraph).map(
              /** Projects effective formatting independent of family name identity. @param run - Canonical run. @returns Manual source-derived state tuple. */
              (run) => [
                run.text,
                run.attributes.bold,
                run.attributes.italic,
                run.attributes.underline,
              ],
            ),
            `${testCase.name}, ${phase}`,
          ).toEqual(testCase.expected);
        }
      }
    }
  });
});

it("keeps common style layers outside the automatic direct span", /** Checks the native CharStyleNames span ordering, escaped names and direct false override across ODT reload. @returns Completion. */ async () => {
  const original = createWriterDocument();
  const state = { title: "Layered styles" };
  let reopened: ReturnType<typeof createWriterDocument> | undefined;
  try {
    original.MakeCharFormat("T1", original.GetDfltCharFormat());
    const outer = original.MakeCharFormat("Outer & strong", original.GetDfltCharFormat());
    outer.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
    const base = original.MakeCharFormat("Inner parent", original.GetDfltCharFormat());
    base.SetFormatAttr(new SvxPostureItem(FontItalic.ITALIC_NORMAL, RES_CHRATR_POSTURE));
    const inner = original.MakeCharFormat("Inner child", base);
    const node = original.paragraphs[0];
    assert(node);
    node.SetText("A BC");
    original.SetInXMLImport(true);
    node.InsertItem(new SwFormatCharFormat(outer), 0, node.Len());
    node.InsertItem(new SwFormatCharFormat(inner), 0, node.Len());
    original.SetInXMLImport(false);
    const direct = new SfxItemSet(original.GetAttrPool(), [[RES_CHRATR_WEIGHT, RES_CHRATR_WEIGHT]]);
    try {
      direct.Put(new SvxWeightItem(FontWeight.WEIGHT_NORMAL, RES_CHRATR_WEIGHT));
      node.SetAttr(direct, 1, 3);
    } finally {
      direct.Dispose();
    }

    const bytes = await writeOdtDocument(original, state);
    const archive = await DocumentArchive.open(bytes);
    expect(await archive.readTextEntry("styles.xml")).toContain(
      'style:name="Inner_20_child" style:display-name="Inner child" style:family="text" style:parent-style-name="Inner_20_parent"',
    );
    expect(await archive.readTextEntry("content.xml")).toMatch(
      /<text:span text:style-name="Outer_20__26__20_strong"><text:span text:style-name="Inner_20_child"><text:span text:style-name="T2">/u,
    );
    reopened = (await readOdtDocument(bytes, state)).document;
    const loaded = reopened.paragraphs[0];
    assert(loaded);
    expect(reopened.FindCharFormatByName("Inner child")?.DerivedFrom()?.GetName()).toBe(
      "Inner parent",
    );
    expect(
      loaded
        .GetpSwpHints()
        ?.entries()
        .filter(
          /** Selects genuine style layers at a position also carrying direct formatting. @param hint - Source hint. @returns Whether the style applies. */
          (hint): hint is SwTextCharFormat =>
            hint instanceof SwTextCharFormat && hint.GetStart() <= 1 && 1 < hint.GetEnd(),
        )
        .map(
          /** Reads native style identity and nesting order. @param hint - Native style hint. @returns Style and sort ordinal. */
          (hint) => [hint.GetAttr().GetCharFormat()?.GetName(), hint.GetSortNumber()],
        ),
    ).toEqual([
      ["Outer & strong", 0],
      ["Inner child", 1],
    ]);
    expect(
      projectWriterTextRuns(loaded).map(
        /** Reports effective formatting after the styled and direct segments reload. @param run - Writer run. @returns Text and flags. */
        (run) => [run.text, run.attributes.bold, run.attributes.italic],
      ),
    ).toEqual([
      ["A", true, true],
      [" B", false, true],
      ["C", true, true],
    ]);
  } finally {
    reopened?.Dispose();
    original.Dispose();
  }
});

it("leaves an unreferenced cyclic common style declaration usable", /** Exercises native parent rejection while retaining all declared styles. @returns Nothing. */ () => {
  const styles =
    '<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"><office:styles><style:style style:name="First" style:family="text" style:parent-style-name="Second"/><style:style style:name="Second" style:family="text" style:parent-style-name="First"/></office:styles></office:document-styles>';
  const { document } = importWriterXml(styles, undefined, { title: "Cyclic common styles" });
  try {
    const first = document.FindCharFormatByName("First");
    const second = document.FindCharFormatByName("Second");
    assert(first && second);
    expect(first.DerivedFrom()).toBe(second);
    expect(second.DerivedFrom()).toBe(document.GetDfltCharFormat());
  } finally {
    document.Dispose();
  }
});
