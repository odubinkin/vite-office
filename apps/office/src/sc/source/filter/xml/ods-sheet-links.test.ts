/** @fileoverview Native Calc linked sheets with cached cells across the ODS and Worker filters. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  decodeCalcDocument,
  encodeCalcDocument,
  type CalcDocumentRecord,
} from "../../../browser/filter/xml/calc-document-codec";
import { processOdsWorkerRequest } from "../../../browser/filter/xml/ods-worker-runtime";
import { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { ScLinkMode } from "../../../inc/global";
import { readOdsDocument, writeOdsXml } from "./xmlwrap";

const baseUrl = "file:///fixtures/main/tdf157897_main.ods";
const linkedFile = "file:///fixtures/tdf157897_linked.ods";

/** Reads the unchanged native linked-sheet fixture. @returns Original ODS bytes. */
function fixture(): Uint8Array<ArrayBuffer> {
  return new Uint8Array(
    readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/uicalc/data/tdf157897_main.ods"),
  );
}

it("keeps the original tdf157897 linked sheet and its cached values", /** Checks the actual linked sheet from the tdf157897 print-range fixture. @returns Completion. */ async () => {
  const transferred = (await processOdsWorkerRequest({
    id: 1,
    operation: "import",
    input: fixture().buffer,
    options: { baseUrl },
  })) as CalcDocumentRecord;
  const source = decodeCalcDocument(transferred);
  const documents = [source];
  try {
    const output = await writeOdsXml(source);
    expect(output.files["content.xml"]).toContain(
      `<table:table-source xlink:type="simple" xlink:href="${linkedFile}" table:table-name="Sheet1" table:filter-name="calc8"/>`,
    );
    documents.push(await readOdsDocument(output));
    for (const document of documents) {
      const table = document.FetchTable(0);
      assert(table);
      expect(text(table.GetName())).toBe("Sheet1_2");
      expect(table.GetLinkMode()).toBe(ScLinkMode.NORMAL);
      expect(text(table.GetLinkDoc())).toBe(linkedFile);
      expect(text(table.GetLinkTab())).toBe("Sheet1");
      expect(text(table.GetLinkFlt())).toBe("calc8");
      expect(table.GetLinkRefreshDelay()).toBe(0);
      expect(document.IsLinked(1)).toBe(false);
      expect(document.GetValue(new ScAddress(2, 1, 0))).toBe(6);
      expect(document.GetValue(new ScAddress(2, 2, 1))).toBe(9);
    }
  } finally {
    for (const document of documents) document.Dispose();
  }
});

it("exports shared file settings with separate linked sheet names and modes", /** Exercises the original one-entry-per-file link registration. @returns Completion. */ async () => {
  const source = await readOdsDocument(fixture(), { baseUrl });
  const url = unicode(linkedFile);
  const nativeFilter = unicode("calc8");
  const options = unicode("locale=de-DE");
  const otherFilter = unicode("Other filter");
  const otherOptions = unicode("other");
  const firstName = unicode("Sheet1");
  const secondName = unicode("Another sheet");
  const documents: ScDocument[] = [source];
  try {
    source.SetLink(0, ScLinkMode.NORMAL, url, nativeFilter, options, firstName, 90);
    source.SetLink(1, ScLinkMode.VALUE, url, otherFilter, otherOptions, secondName, 10);
    const worker = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
    documents.push(worker);
    expect(worker.GetLinkRefreshDelay(1)).toBe(10);
    const xml = await writeOdsXml(worker);
    expect(xml.files["content.xml"]).toContain(
      'table:table-name="Another sheet" table:filter-name="calc8" table:filter-options="locale=de-DE" table:mode="copy-results-only"',
    );
    const reopened = await readOdsDocument(xml);
    documents.push(reopened);
    expect(reopened.GetLinkMode(1)).toBe(ScLinkMode.VALUE);
    expect(reopened.GetLinkRefreshDelay(0)).toBe(90);
    expect(reopened.GetLinkRefreshDelay(1)).toBe(90);
    expect(reopened.GetValue(new ScAddress(2, 2, 1))).toBe(9);
  } finally {
    for (const value of [
      url,
      nativeFilter,
      options,
      otherFilter,
      otherOptions,
      firstName,
      secondName,
    ])
      value.dispose();
    for (const document of documents) document.Dispose();
  }
});
