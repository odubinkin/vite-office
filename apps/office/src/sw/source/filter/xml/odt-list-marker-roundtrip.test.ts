/** @fileoverview Verifies pinned ODF list marker properties across genuine common/automatic packages and standard ODF 1.3 approximation. */
import type { SwNumRule } from "../../core/doc/number";
import { expect, it } from "vitest";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { createWriterDocument } from "../../core/doc/doc";
import type { SwNumFormat } from "../../core/doc/number";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

/** Raw source-derived marker expectation for one declared level. */
interface MarkerState {
  readonly prefix: string;
  readonly suffix: string;
  readonly start: number;
  readonly includeUpperLevels: number;
  readonly listFormat: string;
}
/** Projects only the raw native marker fields under audit. @param format - Level. @returns Marker state. */
function state(format: SwNumFormat): MarkerState {
  return format.GetMarkerProperties() as MarkerState;
}
/** Inserts literal source declarations and two nested paragraphs into a genuine package. @param bytes - Baseline package. @param attributes - Literal declaration attributes. @param common - Common container. @param bullet - Bullet selection. @returns Package bytes. */
async function input(
  bytes: Uint8Array,
  attributes: string,
  common: boolean,
  bullet = false,
): Promise<Uint8Array> {
  const zip = new ZipFile(bytes),
    output = new ZipOutputStream();
  const tag = bullet ? "bullet" : "number";
  const declaration = `<text:list-style style:name="Markers"><text:list-level-style-number text:level="1" style:num-format="1" style:num-suffix="." text:start-value="2"/><text:list-level-style-${tag} text:level="2" ${bullet ? 'text:bullet-char="●"' : 'style:num-format="1"'} ${attributes}/></text:list-style>`;
  for (const entry of zip.getEntryNames()) {
    if (entry === "styles.xml" || entry === "content.xml") {
      let xml = await zip.readTextEntry(entry);
      if (!xml.includes("xmlns:loext="))
        xml = xml.replace(
          /<office:document-(styles|content)/u,
          '$& xmlns:loext="urn:org:documentfoundation:names:experimental:office:xmlns:loext:1.0"',
        );
      if (entry === "styles.xml" && common)
        xml = xml.replace("</office:styles>", `${declaration}</office:styles>`);
      if (entry === "content.xml") {
        if (!common)
          xml = xml.replace(
            "</office:automatic-styles>",
            `${declaration}</office:automatic-styles>`,
          );
        xml = xml.replace(
          /<office:text>[\s\S]*?<\/office:text>/u,
          '<office:text><text:list text:style-name="Markers"><text:list-item><text:p>root</text:p><text:list><text:list-item><text:p>nested</text:p></text:list-item></text:list></text:list-item></text:list></office:text>',
        );
      }
      output.putNextEntry(entry, new TextEncoder().encode(xml));
    } else output.putNextEntry(entry, await zip.readEntry(entry));
  }
  return output.finish();
}

it("preserves native marker parameters through common and automatic ODT cycles", /** Asserts literal state, labels, copies, Worker and conditional standard XML output. @returns Completion. */ async () => {
  const bytes = writeOdtDocument(createWriterDocument(), { title: "Markers" });
  const base: MarkerState = {
    prefix: "",
    suffix: "",
    start: 1,
    includeUpperLevels: 1,
    listFormat: "%2%",
  };
  const cases = [
    { name: "absent", attributes: "", expected: base, label: "1" },
    {
      name: "empty",
      attributes:
        'style:num-prefix="" style:num-suffix="" text:start-value="" text:display-levels=""',
      expected: { ...base, start: 0 },
      label: "0",
    },
    {
      name: "affixes",
      attributes:
        'style:num-prefix="(&amp;&lt;&quot;" style:num-suffix="&quot;&gt;)" text:start-value="7tail" text:display-levels="2junk"',
      expected: {
        prefix: '(&<"',
        suffix: '">)',
        start: 7,
        includeUpperLevels: 2,
        listFormat: '(&<"%1%.%2%">)',
      },
      label: '(&<"2.7">)',
    },
    {
      name: "negative",
      attributes: 'text:start-value="-5" text:display-levels="-5" style:num-suffix=")"',
      expected: { ...base, suffix: ")", listFormat: "%2%)" },
      label: "1)",
    },
    {
      name: "invalid",
      attributes: 'text:start-value="invalid" text:display-levels="invalid"',
      expected: { ...base, start: 0 },
      label: "0",
    },
    {
      name: "int32 overflow",
      attributes: 'text:start-value="2147483648" text:display-levels="2147483648"',
      expected: { ...base, start: 0 },
      label: "0",
    },
    {
      name: "SHRT cap and available levels",
      attributes: 'text:start-value="40000" text:display-levels="40000"',
      expected: { ...base, start: 32767, includeUpperLevels: 2, listFormat: "%1%.%2%" },
      label: "2.32767",
    },
    {
      name: "byte whitespace and decimal prefix",
      attributes: 'text:start-value=" &#x9;+3.5" text:display-levels="2.7"',
      expected: { ...base, start: 3, includeUpperLevels: 2, listFormat: "%1%.%2%" },
      label: "2.3",
    },
    {
      name: "Unicode whitespace",
      attributes: 'text:start-value="&#x2003;3" text:display-levels="&#x2003;2"',
      expected: { ...base, start: 0 },
      label: "0",
    },
    {
      name: "bullet ignores numeric properties",
      bullet: true,
      attributes:
        'style:num-prefix="[" style:num-suffix="]" text:start-value="9" text:display-levels="9"',
      expected: { ...base, prefix: "[", suffix: "]", listFormat: "[%2%]" },
      label: "●",
    },
  ];
  for (const common of [false, true])
    for (const test of cases) {
      const result = await readOdtDocument(
        await input(bytes, test.attributes, common, test.bullet),
        { title: "Markers" },
      );
      const rule = result.document.FindNumRulePtr("Markers");
      expect(rule, test.name).toBeDefined();
      const format = rule?.Get(1) as SwNumFormat;
      expect(state(format), test.name).toEqual(test.expected);
      expect(result.document.paragraphs[1]?.GetListLabel(), test.name).toBe(test.label);
      expect(rule?.clone().Get(1).GetMarkerProperties()).toEqual(test.expected);
      const restored = decodeWriterDocument(encodeWriterDocument(result.document));
      expect(state(restored.FindNumRulePtr("Markers")?.Get(1) as SwNumFormat)).toEqual(
        test.expected,
      );
      expect(restored.paragraphs[1]?.GetListLabel()).toBe(test.label);
      const exported = writeOdtDocument(result.document, { title: "Markers" });
      const xml = await new ZipFile(exported).readTextEntry("content.xml");
      const opening = xml.match(
        /<text:list-level-style-(number|bullet) text:level="2"[^>]*>/u,
      )?.[0] as string;
      expect(opening.includes("style:num-prefix=")).toBe(test.expected.prefix.length !== 0);
      expect(opening.includes("style:num-suffix=")).toBe(test.expected.suffix.length !== 0);
      expect(opening.includes("text:start-value=")).toBe(!test.bullet && test.expected.start !== 1);
      expect(opening.includes("text:display-levels=")).toBe(
        !test.bullet && test.expected.includeUpperLevels > 1,
      );
      expect(xml).not.toContain("num-list-format=");
      if (test.name === "affixes") {
        expect(opening).toContain('style:num-prefix="(&amp;&lt;&quot;"');
        expect(opening).toContain('style:num-suffix="&quot;&gt;)"');
        expect(opening).toContain('text:start-value="7" text:display-levels="2"');
      }
      const reopened = await readOdtDocument(exported, { title: "Markers" });
      expect(state(reopened.document.FindNumRulePtr("Markers")?.Get(1) as SwNumFormat)).toEqual(
        test.expected,
      );
      expect(reopened.document.paragraphs[1]?.GetListLabel()).toBe(test.label);
    }
});

it("retains native explicit pattern precedence and standard ODF 1.3 approximation", /** Checks ordered namespace aliases, empty formats and deliberate native pattern loss under the current export version. @returns Completion. */ async () => {
  const bytes = writeOdtDocument(createWriterDocument(), { title: "Patterns" });
  const expected: MarkerState = {
    prefix: "[",
    suffix: "]",
    start: 3,
    includeUpperLevels: 3,
    listFormat: "[%2%|%1%|%2%]",
  };
  const cases = [
    {
      attributes: 'style:num-list-format="[%2%|%1%|%2%]"',
      expected,
      label: "[3|2|3]",
      reopened: { ...expected, includeUpperLevels: 2, listFormat: "[%1%.%2%]" },
      reopenedLabel: "[2.3]",
    },
    {
      attributes: 'loext:num-list-format="[%2%|%1%|%2%]"',
      expected,
      label: "[3|2|3]",
      reopened: { ...expected, includeUpperLevels: 2, listFormat: "[%1%.%2%]" },
      reopenedLabel: "[2.3]",
    },
    {
      attributes: 'style:num-list-format="ignored" loext:num-list-format="[%2%|%1%|%2%]"',
      expected,
      label: "[3|2|3]",
      reopened: { ...expected, includeUpperLevels: 2, listFormat: "[%1%.%2%]" },
      reopenedLabel: "[2.3]",
    },
    {
      attributes: 'loext:num-list-format="ignored" style:num-list-format="[%2%|%1%|%2%]"',
      expected,
      label: "[3|2|3]",
      reopened: { ...expected, includeUpperLevels: 2, listFormat: "[%1%.%2%]" },
      reopenedLabel: "[2.3]",
    },
    {
      attributes:
        'style:num-list-format="" style:num-prefix="ignored" style:num-suffix="ignored" text:display-levels="2"',
      expected: { prefix: "", suffix: "", start: 3, includeUpperLevels: 1, listFormat: "" },
      label: "",
      reopened: { prefix: "", suffix: "", start: 3, includeUpperLevels: 1, listFormat: "%2%" },
      reopenedLabel: "3",
    },
    {
      attributes: 'style:num-prefix="[%1%|" style:num-suffix="]"',
      expected: { ...expected, includeUpperLevels: 2, listFormat: "[%1%|%2%]" },
      label: "[2|3]",
      reopened: { ...expected, includeUpperLevels: 2, listFormat: "[%1%.%2%]" },
      reopenedLabel: "[2.3]",
    },
  ];
  for (const common of [false, true])
    for (const test of cases) {
      const result = await readOdtDocument(
        await input(bytes, `text:start-value="3" ${test.attributes}`, common),
        { title: "Markers" },
      );
      const rule = result.document.FindNumRulePtr("Markers");
      expect(state(rule?.Get(1) as SwNumFormat)).toEqual(test.expected);
      expect(result.document.paragraphs[1]?.GetListLabel()).toBe(test.label);
      const restored = decodeWriterDocument(encodeWriterDocument(result.document));
      expect(state(restored.FindNumRulePtr("Markers")?.Get(1) as SwNumFormat)).toEqual(
        test.expected,
      );
      const exported = writeOdtDocument(result.document, { title: "Patterns" });
      const xml = await new ZipFile(exported).readTextEntry("content.xml");
      expect(xml).not.toContain("num-list-format=");
      const reopened = await readOdtDocument(exported, { title: "Markers" });
      expect(state(reopened.document.FindNumRulePtr("Markers")?.Get(1) as SwNumFormat)).toEqual(
        test.reopened,
      );
      expect(reopened.document.paragraphs[1]?.GetListLabel()).toBe(test.reopenedLabel);
    }
});

it("projects native signed UNO StartWith and omitted zero ParentNumbering on export", /** Verifies source narrowing/omission independently of positive XML declaration bounds. @returns Completion. */ async () => {
  const bytes = writeOdtDocument(createWriterDocument(), { title: "Signed" });
  const result = await readOdtDocument(await input(bytes, "", false), { title: "Markers" });
  const rule = result.document.FindNumRulePtr("Markers") as SwNumRule;
  const format = rule.Get(1).clone();
  format.SetStart(65535);
  format.SetIncludeUpperLevels(0);
  rule.Set(1, format);
  const exported = writeOdtDocument(result.document, { title: "Signed" });
  const xml = await new ZipFile(exported).readTextEntry("content.xml");
  expect(xml.match(/<text:list-level-style-number text:level="2"[^>]*>/u)?.[0]).toContain(
    'text:start-value="-1"',
  );
  expect(xml).not.toContain("text:display-levels=");
  const reopened = await readOdtDocument(exported, { title: "Markers" });
  expect(reopened.document.FindNumRulePtr("Markers")?.Get(1).GetStart()).toBe(1);
  expect(reopened.document.FindNumRulePtr("Markers")?.Get(1).GetIncludeUpperLevels()).toBe(1);
});
