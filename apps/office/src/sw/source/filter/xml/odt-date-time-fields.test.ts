/** @fileoverview Native Writer date/time point fields through ODT and Worker transport. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { CH_TXTATR_BREAKWORD, RES_TXTATR_FIELD } from "../../../inc/hintids";
import type { SwDoc } from "../../core/doc/doc";
import { GetTextNodeExpandedText } from "../../core/txtnode/ndtxt-hints";
import { importWriterXml } from "./xmlimp";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

const metadata = { title: "Date and time" };

/** Enumerates actual date/time hints in text order. @param document - Native Writer graph. @returns Attached hints. */
function dateTimeFields(document: SwDoc) {
  return document
    .GetNodes()
    .entries()
    .flatMap(
      /** Reads the indexed native hints. @param node - Document node. @returns Date/time hints. */
      (node) => node.GetTextNode()?.GetpSwpHints()?.GetDateTimeFields() ?? [],
    );
}

it.each([
  ["testTdf111969", "tdf111969_field.fodt", 1],
  ["testTdf111969B", "tdf111969_fieldB.fodt", 2],
] as const)(
  "%s retains the fixed time at its original field boundary",
  (_name, filename, offset) => {
    const original = readFileSync(
      `../../vendor/libreoffice-reference/sw/qa/extras/uiwriter/data/${filename}`,
      "utf8",
    );
    const content = original.replace(/(<\/?office:document)(?=[ >])/gu, "$1-content");
    const { document } = importWriterXml(undefined, content, metadata);
    try {
      const [hint] = dateTimeFields(document);
      assert(hint);
      const node = hint.GetTextNode();
      const hints = node?.GetpSwpHints();
      assert(node && hints);
      expect(hint.GetStart()).toBe(offset);
      expect(hints.GetTextAttrForCharAt(offset - 1, RES_TXTATR_FIELD)).toBeUndefined();
      expect(hints.GetTextAttrForCharAt(offset, RES_TXTATR_FIELD)).toBe(hint);
      expect(hints.GetTextAttrForCharAt(offset + 1, RES_TXTATR_FIELD)).toBeUndefined();
      const field = hint.GetAttr().GetField();
      expect(field.IsFixed()).toBe(true);
      expect(field.GetDateTimeValue()).toMatchObject({ Hours: 12, Minutes: 34, Seconds: 56 });
      expect(GetTextNodeExpandedText(node, 0, node.GetText().length)).toBe(
        `${"–".repeat(offset)}12:34:56${"–".repeat(offset)}`,
      );
    } finally {
      document.Dispose();
    }
  },
);

it("roundtrips actual date and time styles and native adjustments through Worker and ODT", /** Roundtrips actual date and time styles and native adjustments through Worker and ODT. @returns Completion. */ async () => {
  const ns = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:number="${ODF_NAMESPACES.number}" xmlns:fo="${ODF_NAMESPACES.fo}"`;
  const content = `<office:document-content ${ns}><office:automatic-styles><number:date-style style:name="D" fo:language="en" fo:country="US"><number:year number:style="long"/><number:text>-</number:text><number:month number:style="long"/><number:text>-</number:text><number:day number:style="long"/></number:date-style></office:automatic-styles><office:body><office:text><text:p><text:date text:fixed="true" text:date-value="2024-02-03T18:00:00" text:date-adjust="PT12H" style:data-style-name="D">Stale</text:date> <text:time text:fixed="true" text:time-value="1899-12-30T23:20:00" text:time-adjust="PT20M">Stale</text:time></text:p></office:text></office:body></office:document-content>`;
  const { document } = importWriterXml(undefined, content, metadata);
  let worker: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(document)));
    const expansions = ["2024-02-04", "23:40:00"];
    for (const model of [document, worker]) {
      const fields = dateTimeFields(model).map((hint) => hint.GetAttr().GetField());
      expect(fields.map((field) => field.Expand())).toEqual(expansions);
      expect(
        fields.map(
          /** Calls `GetOffset` for each entry. @param field - Collection entry. @returns The projected entry value. */ (
            field,
          ) => field.GetOffset(),
        ),
      ).toEqual([720, 20]);
      expect(fields[0]?.IsAutomaticLanguage()).toBe(false);
    }
    const bytes = await writeOdtDocument(worker, metadata);
    const saved = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    const xml = new DOMParser().parseFromString(saved, "application/xml");
    const date = xml.getElementsByTagNameNS(ODF_NAMESPACES.text, "date")[0];
    const time = xml.getElementsByTagNameNS(ODF_NAMESPACES.text, "time")[0];
    assert(date && time);
    expect(date.getAttributeNS(ODF_NAMESPACES.style, "data-style-name")).toBeTruthy();
    expect(date.hasAttributeNS(ODF_NAMESPACES.text, "date-adjust")).toBe(false);
    expect(time.getAttributeNS(ODF_NAMESPACES.text, "time-adjust")).toBe("PT00H20M00S");
    expect(saved).not.toContain(CH_TXTATR_BREAKWORD);
    reopened = (await readOdtDocument(bytes, metadata)).document;
    expect(dateTimeFields(reopened).map((hint) => hint.GetAttr().GetField().Expand())).toEqual([
      "2024-02-03",
      "23:40:00",
    ]);
  } finally {
    document.Dispose();
    worker?.Dispose();
    reopened?.Dispose();
  }
});
