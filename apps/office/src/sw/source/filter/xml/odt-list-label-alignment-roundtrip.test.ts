/** @fileoverview Verifies pinned modern list alignment defaults, native units and exact ODT export predicates through genuine package cycles. */
import { expect, it } from "vitest";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { createWriterDocument, type SwDoc } from "../../core/doc/doc";
import { createWriterNumRule } from "../../core/doc/DocumentListsManager";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

/** Injects complete literal modern numbering definitions into common or automatic styles. @param base - Real baseline ODT. @param attributes - Source label-alignment attributes. @param common - Whether definitions belong to styles.xml. @returns Package bytes. */
async function input(base: Uint8Array, attributes: string, common: boolean): Promise<Uint8Array> {
  const levels = Array.from(
    { length: 10 },
    /** Declares each level independently to avoid fallback assumptions. @param _unused - Placeholder. @param level - Zero-based level. @returns Literal modern numbering level. */
    (_unused, level) =>
      `<text:list-level-style-number text:level="${level + 1}" style:num-format="1" style:num-suffix="."><style:list-level-properties text:list-level-position-and-space-mode="label-alignment"><style:list-level-label-alignment ${attributes}/></style:list-level-properties></text:list-level-style-number>`,
  ).join("");
  const definition = `<text:list-style style:name="Literal">${levels}</text:list-style>`;
  const zip = new ZipFile(base);
  const output = new ZipOutputStream();
  for (const entry of zip.getEntryNames()) {
    if (entry === "styles.xml" && common) {
      const xml = await zip.readTextEntry(entry);
      output.putNextEntry(
        entry,
        new TextEncoder().encode(xml.replace("</office:styles>", `${definition}</office:styles>`)),
      );
    } else if (entry === "content.xml") {
      let xml = await zip.readTextEntry(entry);
      if (!common)
        xml = xml.replace("</office:automatic-styles>", `${definition}</office:automatic-styles>`);
      xml = xml.replace(
        /<office:text>[\s\S]*?<\/office:text>/u,
        '<office:text><text:list text:style-name="Literal"><text:list-item><text:p text:style-name="Standard">x</text:p></text:list-item></text:list></office:text>',
      );
      output.putNextEntry(entry, new TextEncoder().encode(xml));
    } else output.putNextEntry(entry, await zip.readEntry(entry));
  }
  return output.finish();
}

/** Projects only the manually specified canonical list fields. @param document - Imported Writer model. @returns First-level core tuple. */
function geometry(document: SwDoc) {
  const paragraph = document.paragraphs[0];
  expect(paragraph?.GetText()).toBe("x");
  const format = paragraph?.GetNumRule()?.Get(0);
  return [
    format?.GetFirstLineIndent(),
    format?.GetIndentAt(),
    format?.GetLabelFollowedBy(),
    format?.GetListtabPos(),
  ];
}

it("round-trips native MM100 defaults, parsing bounds and conditional list attributes", /** Asserts literal source values, exact exported mode/attributes and native canonical reopen values. @returns Completion after common/automatic package cases. */ async () => {
  const base = writeOdtDocument(createWriterDocument(), { title: "Alignment" });
  const cases = [
    { attributes: "", expected: [0, 0, "listtab", 0], xml: 'text:label-followed-by="listtab"' },
    {
      attributes: 'text:label-followed-by="space"',
      expected: [0, 0, "space", 0],
      xml: 'text:label-followed-by="space"',
    },
    {
      attributes:
        'text:label-followed-by="nothing" fo:text-indent="-.025pt" fo:margin-left=".007mm" text:list-tab-stop-position=".8in"',
      expected: [-1, 1, "nothing", 1152],
      reopened: [-1, 1, "nothing", 0],
      xml: 'text:label-followed-by="nothing" fo:text-indent="-0.002cm" fo:margin-left="0.002cm"',
    },
    {
      attributes:
        'fo:text-indent="-.007mm" fo:margin-left=".007mm" text:list-tab-stop-position=".007mm"',
      expected: [-1, 1, "listtab", 1],
      xml: 'text:label-followed-by="listtab" text:list-tab-stop-position="0.002cm" fo:text-indent="-0.002cm" fo:margin-left="0.002cm"',
    },
    {
      attributes: 'text:list-tab-stop-position="-1mm"',
      expected: [0, 0, "listtab", 0],
      xml: 'text:label-followed-by="listtab"',
    },
    {
      attributes:
        'fo:text-indent="999999999cm" fo:margin-left="999999999cm" text:list-tab-stop-position="999999999cm"',
      expected: [18577, 18577, "listtab", 18577],
      xml: 'text:label-followed-by="listtab" text:list-tab-stop-position="32.768cm" fo:text-indent="32.768cm" fo:margin-left="32.768cm"',
    },
    {
      attributes:
        'fo:text-indent="-999999999cm" fo:margin-left="-999999999cm" text:list-tab-stop-position="-999999999cm"',
      expected: [-18577, -18577, "listtab", 0],
      xml: 'text:label-followed-by="listtab" fo:text-indent="-32.768cm" fo:margin-left="-32.768cm"',
    },
    {
      attributes:
        'fo:text-indent="invalid" fo:margin-left="+1cm" text:list-tab-stop-position="1em"',
      expected: [0, 0, "listtab", 0],
      xml: 'text:label-followed-by="listtab"',
    },
    {
      attributes:
        'text:label-followed-by="custom" fo:text-indent=" .25CM " fo:margin-left="3" text:list-tab-stop-position="1PX"',
      expected: [142, 2, "listtab", 15],
      xml: 'text:label-followed-by="listtab" text:list-tab-stop-position="0.026cm" fo:text-indent="0.25cm" fo:margin-left="0.004cm"',
    },
    {
      attributes: 'fo:text-indent="0pt" fo:margin-left="0cm" text:list-tab-stop-position="0in"',
      expected: [0, 0, "listtab", 0],
      xml: 'text:label-followed-by="listtab"',
    },
    {
      attributes: 'fo:margin-left="1cm extra"',
      expected: [0, 567, "listtab", 0],
      xml: 'text:label-followed-by="listtab" fo:margin-left="1cm"',
    },
  ];
  for (const common of [false, true]) {
    for (const testCase of cases) {
      const imported = await readOdtDocument(await input(base, testCase.attributes, common), {
        title: "Alignment",
      });
      expect(geometry(imported.document), testCase.attributes).toEqual(testCase.expected);
      const exported = writeOdtDocument(imported.document, { title: "Alignment" });
      const xml = await new ZipFile(exported).readTextEntry("content.xml");
      const level = xml.match(
        /<text:list-level-style-number text:level="1"[^>]*>([\s\S]*?)<\/text:list-level-style-number>/u,
      )?.[1];
      expect(level, testCase.attributes).toBe(
        `<style:list-level-properties text:list-level-position-and-space-mode="label-alignment"><style:list-level-label-alignment ${testCase.xml}/></style:list-level-properties>`,
      );
      const reopened = await readOdtDocument(exported, { title: "Alignment" });
      expect(geometry(reopened.document), testCase.attributes).toEqual(
        testCase.reopened ?? testCase.expected,
      );
    }
  }
});

it("exports the default Writer list geometry at every supported level", /** Ensures default command lists retain native explicit alignment rather than falling back to legacy interpretation. @returns Completion after both marker families. */ async () => {
  for (const kind of ["bullet", "numbered"] as const) {
    const document = createWriterDocument();
    document.AddNumRule(createWriterNumRule("Default", kind));
    const paragraph = document.paragraphs[0];
    if (paragraph === undefined) throw new Error("Default list paragraph missing");
    paragraph.SetNumRule("Default");
    const exported = writeOdtDocument(document, { title: "Default list" });
    const xml = await new ZipFile(exported).readTextEntry("content.xml");
    expect(xml.match(/text:list-level-position-and-space-mode="label-alignment"/gu)).toHaveLength(
      10,
    );
    expect(xml).toContain('fo:text-indent="-0.635cm"');
    expect(xml).toContain('fo:margin-left="1.27cm"');
    expect(xml).toContain('text:list-tab-stop-position="1.27cm"');
    const restored = (
      await readOdtDocument(exported, { title: "Default list" })
    ).document.paragraphs[0]?.GetNumRule();
    for (let level = 0; level < 10; level++) {
      const format = restored?.Get(level);
      expect(format?.GetFirstLineIndent()).toBe(-360);
      expect(format?.GetIndentAt()).toBe(720 + level * 360);
      expect(format?.GetListtabPos()).toBe(720 + level * 360);
      expect(format?.GetLabelFollowedBy()).toBe("listtab");
    }
  }
});
