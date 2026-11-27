/** @fileoverview Original native Calc sort and subtotal descriptor ODS persistence cases. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { ScSubTotalFunc } from "../../../inc/global";
import { ScSortNumberBehavior } from "../../core/data/sortparam";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";

/** Reads a pinned ODS package without rewriting the source. @param name - LibreOffice QA filename. @returns Native workbook. */
async function openFixture(name: string): Promise<ScDocument> {
  return readOdsDocument(
    new Uint8Array(readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/ods/" + name)),
  );
}

it("retains the configured natural sort mode and omits the original alpha-numeric default", /** Ports the filter persistence checks in testTdf161948_NaturalSortSaveLoad. @returns Completion. */ async () => {
  const document = await openFixture("tdf161948_NaturalSortSaveLoad.ods");
  try {
    const range = document.GetDBCollection().GetDBAtArea(0, 0, 0, 0, 5);
    assert(range);
    expect(range.GetName()).toBe("myData");
    const sort = range.GetSortParam();
    try {
      expect(sort.bHasHeader).toBe(true);
      expect(sort.maKeyState[0]).toMatchObject({ nField: 0, bAscending: true, bDoSort: true });
      expect([sort.nDestCol, sort.nDestRow, sort.nDestTab]).toEqual([2, 0, 0]);
      for (const [behavior, lexical] of [
        [ScSortNumberBehavior.DOUBLE, 'table:embedded-number-behavior="double"'],
        [ScSortNumberBehavior.ALPHA_NUMERIC, ""],
      ] as const) {
        sort.eSortNumberBehavior = behavior;
        range.SetSortParam(sort);
        const worker = decodeCalcDocument(structuredClone(encodeCalcDocument(document)));
        let reopened: ScDocument | undefined;
        try {
          const bytes = await writeOdsDocument(worker);
          const archive = await DocumentArchive.open(bytes);
          const xml = await archive.readTextEntry("content.xml");
          if (lexical) expect(xml).toContain(lexical);
          else expect(xml).not.toContain("table:embedded-number-behavior");
          reopened = await readOdsDocument(bytes);
          const output = reopened.GetDBCollection().GetDBAtArea(0, 0, 0, 0, 5)?.GetSortParam();
          assert(output);
          try {
            expect(output.eSortNumberBehavior).toBe(behavior);
            expect([output.nDestCol, output.nDestRow, output.nDestTab]).toEqual([2, 0, 0]);
          } finally {
            output.Dispose();
          }
        } finally {
          reopened?.Dispose();
          worker.Dispose();
        }
      }
    } finally {
      sort.Dispose();
    }
  } finally {
    document.Dispose();
  }
});

it("preserves the original summary-above rule and calculates the nested SUBTOTAL values", /** Ports the complete ODS portion of testTdf162262_summarybelow. @returns Completion. */ async () => {
  const document = await openFixture("tdf162262_summarybelow.ods");
  let worker: ScDocument | undefined, reopened: ScDocument | undefined;
  try {
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(document)));
    const bytes = await writeOdsDocument(worker);
    const archive = await DocumentArchive.open(bytes);
    expect(await archive.readTextEntry("content.xml")).toContain('loext:summary-below="false"');
    reopened = await readOdsDocument(bytes);
    for (const model of [document, worker, reopened]) {
      const range = model.GetDBCollection().GetDBAtArea(0, 0, 0, 1, 13);
      assert(range);
      const subtotal = range.GetSubTotalParam();
      expect(subtotal.bSummaryBelow).toBe(false);
      expect(subtotal.bCaseSens).toBe(true);
      expect(subtotal.bPagebreak).toBe(true);
      expect(subtotal.bDoSort).toBe(false);
      expect(subtotal.aGroups[0]).toMatchObject({
        bActive: true,
        nField: 0,
        pSubTotals: [[1, ScSubTotalFunc.SUM]],
      });
      model.CalcAll();
      expect(model.GetValue(new ScAddress(1, 1, 0))).toBe(30);
      expect(model.GetValue(new ScAddress(1, 2, 0))).toBe(3);
    }
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    document.Dispose();
  }
});
