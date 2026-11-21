/** @fileoverview Native Calc duplicate and range-statistic conditions in ODS and Worker. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { ODF_NAMESPACES as NS } from "../../../../xmloff/source/core/xmltoken";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScAddress } from "../../../inc/address";
import { ScConditionMode as Mode, ScCondFormatEntry } from "../../../inc/conditio";
import { ScDocument } from "../../../inc/document";
import { ScXMLImport } from "./xmlimprt";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";

/** Reads a typed rule from the original sheet format list. @param doc - Workbook. @param index - Rule index. @returns Native rule. */
function rule(doc: ScDocument, index: number): ScCondFormatEntry {
  const list = doc.FetchTable(0)?.GetCondFormList();
  assert(list);
  const [format] = [...list];
  const entry = format?.GetEntry(index);
  assert(entry instanceof ScCondFormatEntry);
  return entry;
}

/** Evaluates the target conditions over the requested cells. @param doc - Workbook. @param index - Rule index. @param rows - Number of rows. @returns Match array. */
function matches(doc: ScDocument, index: number, rows: number): boolean[] {
  const entry = rule(doc, index);
  const result: boolean[] = [];
  for (let row = 0; row < rows; row++) {
    const address = new ScAddress(0, row);
    result.push(entry.IsCellValid(doc.GetRefCellValue(address), address));
  }
  return result;
}

it("ports the Calc tdf166669 duplicate condition assertions to the ODS round trip", /** Exercises the unmodified fixture and native numeric/text equality through package storage. @returns Completion. */ async () => {
  const source = await readOdsDocument(
    new Uint8Array(
      readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/ods/tdf166669.ods"),
    ),
  );
  let reopened: ScDocument | undefined;
  try {
    reopened = await readOdsDocument(await writeOdsDocument(source));
    for (const doc of [source, reopened]) {
      const list = doc.FetchTable(0)?.GetCondFormList();
      assert(list);
      expect([...list]).toHaveLength(1);
      expect(rule(doc, 0).GetOperation()).toBe(Mode.Duplicate);
      expect(matches(doc, 0, 5)).toEqual([true, true, true, true, false]);
    }
  } finally {
    source.Dispose();
    reopened?.Dispose();
  }
});

const cases = [
  ["top-elements(2)", Mode.Top10, [false, true, true, true, false, false]],
  ["bottom-elements(2)", Mode.Bottom10, [true, true, true, false, false, false]],
  ["top-percent(49)", Mode.TopPercent, [false, false, false, true, false, false]],
  ["bottom-percent(25)", Mode.BottomPercent, [true, false, false, false, false, false]],
  ["below-average", Mode.BelowAverage, [true, false, false, false, false, false]],
  ["above-average", Mode.AboveAverage, [false, false, false, true, false, false]],
  ["below-equal-average", Mode.BelowEqualAverage, [true, true, true, false, false, false]],
  ["above-equal-average", Mode.AboveEqualAverage, [false, true, true, true, false, false]],
  ["duplicate", Mode.Duplicate, [false, true, true, false, true, true]],
  ["unique", Mode.NotDuplicate, [true, false, false, true, false, false]],
] as const;

it("evaluates range statistics through ODS, Worker and subsequent edits", /** Exercises native range ownership, case folding, multiplicity, rank ties and render cache lifetime. @returns Completion. */ async () => {
  const document = new ScDocument();
  const rows = [1, 2, 2, 3, "Label", "label"].map(
    /** Constructs independent authored scalar cells. @param value - Cell data. @returns XML row. */
    (value) =>
      typeof value === "number"
        ? `<table:table-row><table:table-cell office:value-type="float" office:value="${value}"/></table:table-row>`
        : `<table:table-row><table:table-cell office:value-type="string" office:string-value="${value}"/></table:table-row>`,
  );
  const rules = cases
    .map(
      /** Constructs an independent ODF condition. @param entry - Source test rule. @returns Condition XML. */
      ([value]) =>
        `<calcext:condition calcext:apply-style-name="Default" calcext:value="${value}"/>`,
    )
    .join("");
  let worker: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  try {
    new ScXMLImport(document).importContent(
      `<office:document-content xmlns:office="${NS.office}" xmlns:table="${NS.table}" xmlns:calcext="${NS.calcext}"><office:body><office:spreadsheet><table:table table:name="Data">${rows.join("")}<calcext:conditional-formats><calcext:conditional-format calcext:target-range-address="Data.A1:Data.A6 Data.D1:Data.D1048576">${rules}</calcext:conditional-format></calcext:conditional-formats></table:table></office:spreadsheet></office:body></office:document-content>`,
    );
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(document)));
    const bytes = await writeOdsDocument(worker);
    const archive = await DocumentArchive.open(bytes);
    const content = await archive.readTextEntry("content.xml");
    reopened = await readOdsDocument(bytes);
    for (const candidate of [document, worker, reopened]) {
      const list = candidate.FetchTable(0)?.GetCondFormList();
      assert(list);
      list.startRendering();
      try {
        for (const [index, [xml, mode, expected]] of cases.entries()) {
          expect(rule(candidate, index).GetOperation(), xml).toBe(mode);
          expect(matches(candidate, index, 6), xml).toEqual(expected);
          expect(content).toContain(`calcext:value="${xml}"`);
        }
      } finally {
        list.endRendering();
      }
      candidate.SetValue(new ScAddress(0, 1), 4);
      expect(matches(candidate, 8, 4)).toEqual([false, false, false, false]);
      expect(matches(candidate, 0, 4)).toEqual([false, true, false, true]);
      const blank = new ScAddress(3, 0);
      expect(rule(candidate, 8).IsCellValid(candidate.GetRefCellValue(blank), blank)).toBe(false);
      candidate.SetValue(new ScAddress(0, 0), 0);
      candidate.SetValue(new ScAddress(0, 1), 0);
      expect(rule(candidate, 8).IsCellValid(candidate.GetRefCellValue(blank), blank)).toBe(true);
    }
  } finally {
    document.Dispose();
    worker?.Dispose();
    reopened?.Dispose();
  }
});
