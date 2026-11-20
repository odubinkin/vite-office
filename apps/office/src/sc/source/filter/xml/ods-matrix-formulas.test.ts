/** @fileoverview Exercises native ODS matrix formula geometry, member results and repeat admission. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { ScRefCellValue } from "../../../inc/cellvalue";
import { SetFormulaDirtyContext } from "../../../inc/refupdatecontext";
import { ScCellFormat } from "../../core/tool/cellform";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { ScMatrixMode } from "../../../inc/formulacell";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScXMLImport, type ScXMLImportOptions } from "./xmlimprt";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";

/** Creates a real Calc model from authored ODF cell XML. @param rows - Authored table rows. @param options - Import options. @returns Document. */
function open(rows: string, options?: ScXMLImportOptions): ScDocument {
  const { office, table, text, of, calcext } = ODF_NAMESPACES;
  const doc = new ScDocument();
  new ScXMLImport(doc, options).importContent(
    `<office:document-content xmlns:office="${office}" xmlns:table="${table}" xmlns:text="${text}" xmlns:of="${of}" xmlns:calcext="${calcext}"><office:body><office:spreadsheet><table:table table:name="Matrix"><table:table-column table:number-columns-repeated="8"/>${rows}</table:table></office:spreadsheet></office:body></office:document-content>`,
  );
  return doc;
}

/** Compares every value in one of the original LibreOffice fixture sheets. @param doc - Native workbook. @param tab - Fixture sheet. @returns Nothing. */
function checkFixtureSheet(doc: ScDocument, tab: number): void {
  const suffix = tab ? String(tab + 1) : "";
  const csv = readFileSync(
    `../../vendor/libreoffice-reference/sc/qa/unit/data/contentCSV/matrix${suffix}.csv`,
    "utf8",
  );
  const formatter = doc.GetFormatTable();
  for (const [row, line] of csv.trimEnd().split(/\r?\n/u).entries())
    for (const [col, expected] of line.split(",").entries()) {
      const address = new ScAddress(col, row, tab);
      const key = doc.GetPattern(address)?.GetNumberFormat(formatter) ?? 0;
      const result = ScCellFormat.GetString(
        new ScRefCellValue(doc, address),
        key,
        [null],
        null,
        doc,
      );
      try {
        expect(text(result), `sheet ${tab + 1}, row ${row + 1}, column ${col + 1}`).toBe(expected);
      } finally {
        result.dispose();
      }
    }
}

it("preserves the original matrix.ods geometry and cached results through Worker and ODS", /** Brings in the original upstream matrix regression data. @returns Completion. */ async () => {
  const original = await readOdsDocument(
    new Uint8Array(
      readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/ods/matrix.ods"),
    ),
  );
  const worker = decodeCalcDocument(structuredClone(encodeCalcDocument(original)));
  let reopened: ScDocument | undefined;
  try {
    const bytes = await writeOdsDocument(worker);
    const content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    expect(content.match(/table:number-matrix-columns-spanned=/gu)).toHaveLength(8);
    expect(content).toContain('table:formula="of:=FREQUENCY(');
    expect(content).not.toContain('table:formula="of:{=');
    reopened = await readOdsDocument(bytes);
    for (const doc of [original, worker, reopened]) {
      for (let tab = 0; tab < 3; tab++) checkFixtureSheet(doc, tab);
      const master = doc.GetFormulaCell(new ScAddress(1, 0, 0));
      expect(master?.GetMatColsRows()).toEqual([1, 10]);
      for (const [row, cached] of [55, 54, 47, 52, 50, 37, 48, 55, 50, 52].entries()) {
        const number = doc.GetFormulaCell(new ScAddress(1, row, 0));
        expect(number?.GetValue()).toBe(cached);
        expect(number?.GetMatrixFlag()).toBe(row ? ScMatrixMode.Reference : ScMatrixMode.Formula);
        expect(number?.GetMatrixOrigin()?.Row()).toBe(0);
      }
      expect(doc.GetFormulaCell(new ScAddress(0, 1, 1))?.GetErrCode()).toBe(
        FormulaError.IllegalArgument,
      );
      expect(doc.GetFormulaCell(new ScAddress(2, 2, 1))?.GetErrCode()).toBe(
        FormulaError.NotAvailable,
      );
      const empty = doc.GetFormulaCell(new ScAddress(3, 0, 2));
      expect(empty?.IsEmptyDisplayedAsString()).toBe(true);
      const blank = empty?.GetString().getString();
      assert(blank);
      expect(text(blank)).toBe("");
    }
    const isError = unicode("=ISERROR([.A6])");
    try {
      original.SetFormula(new ScAddress(2, 5, 2), isError, FormulaGrammar.Grammar.GRAM_ODFF);
      expect(original.GetValue(new ScAddress(2, 5, 2))).toBe(1);
    } finally {
      isError.dispose();
    }
    original.SetAllFormulasDirty(new SetFormulaDirtyContext());
    original.CalcFormulaTree();
    checkFixtureSheet(original, 0);
  } finally {
    reopened?.Dispose();
    worker.Dispose();
    original.Dispose();
  }
});

it("places a repeated scalar formula only in the first position", /** Tests the original single formula versus repeated scalar behavior. @returns Nothing. */ () => {
  const doc = open(
    '<table:table-row table:number-rows-repeated="3"><table:table-cell table:number-columns-repeated="2" table:formula="of:=3"/><table:table-cell office:value-type="float" office:value="8"/></table:table-row>',
  );
  try {
    expect(doc.GetValue(new ScAddress(0, 0, 0))).toBe(3);
    expect(doc.GetFormulaCell(new ScAddress(1, 0, 0))).toBeNull();
    expect(doc.GetFormulaCell(new ScAddress(0, 1, 0))).toBeNull();
    expect(doc.GetValue(new ScAddress(2, 2, 0))).toBe(8);
  } finally {
    doc.Dispose();
  }
});

it("recalculates matrix references from their original range and keeps saved spill blockers", /** Exercises materialization and explicit spill state. @returns Completion. */ async () => {
  const doc = open(
    '<table:table-row><table:table-cell table:formula="of:=[.A2:.B2]" table:number-matrix-columns-spanned="2" table:number-matrix-rows-spanned="1" office:value-type="float" office:value="10"/><table:table-cell office:value-type="float" office:value="20"/></table:table-row>' +
      '<table:table-row><table:table-cell office:value-type="float" office:value="10"/><table:table-cell office:value-type="float" office:value="20"/></table:table-row>' +
      '<table:table-row><table:table-cell table:formula="of:=[.A2:.B2]" table:number-matrix-columns-spanned="2" table:number-matrix-rows-spanned="1" office:value-type="string" office:string-value="#SPILL!" calcext:value-type="error"><text:p>#SPILL!</text:p></table:table-cell><table:table-cell office:value-type="float" office:value="7"/></table:table-row>',
  );
  let reopened: ScDocument | undefined;
  let worker: ScDocument | undefined;
  try {
    doc.SetValue(new ScAddress(1, 1, 0), 40);
    const master = doc.GetFormulaCell(new ScAddress(0, 0, 0));
    const member = doc.GetFormulaCell(new ScAddress(1, 0, 0));
    expect(master?.GetValue()).toBe(10);
    expect(member?.GetValue()).toBe(40);
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(doc)));
    expect(worker.GetValue(new ScAddress(1, 2, 0))).toBe(7);
    reopened = await readOdsDocument(await writeOdsDocument(worker));
    expect(reopened.GetValue(new ScAddress(1, 0, 0))).toBe(40);
    expect(reopened.GetFormulaCell(new ScAddress(0, 2, 0))?.GetErrCode()).toBe(FormulaError.Spill);
    expect(reopened.GetFormulaCell(new ScAddress(1, 2, 0))).toBeNull();
    expect(reopened.GetValue(new ScAddress(1, 2, 0))).toBe(7);
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    doc.Dispose();
  }
});

it("keeps the native counts for duplicate FREQUENCY cutoffs after recalculation", /** Verifies the original partition order and charges each matrix member once. @returns Nothing. */ () => {
  const doc = open(
    '<table:table-row><table:table-cell office:value-type="float" office:value="1" table:number-columns-repeated="2"/><table:table-cell table:formula="of:=FREQUENCY([.A1:.A3];[.B1:.B3])" table:number-matrix-columns-spanned="1" table:number-matrix-rows-spanned="4" office:value-type="float" office:value="0"/></table:table-row>' +
      '<table:table-row><table:table-cell office:value-type="float" office:value="1" table:number-columns-repeated="2"/><table:table-cell office:value-type="float" office:value="2"/></table:table-row>' +
      '<table:table-row><table:table-cell office:value-type="float" office:value="3"/><table:table-cell office:value-type="float" office:value="2"/><table:table-cell office:value-type="float" office:value="0"/></table:table-row>' +
      '<table:table-row><table:table-cell table:number-columns-repeated="2"/><table:table-cell office:value-type="float" office:value="1"/></table:table-row>',
    { maxExpandedCells: 10 },
  );
  try {
    doc.SetAllFormulasDirty(new SetFormulaDirtyContext());
    doc.CalcFormulaTree();
    expect(
      [0, 1, 2, 3].map(
        /** Reads one member result. @param row - Member row. @returns Calculated count. */
        (row) => doc.GetValue(new ScAddress(2, row, 0)),
      ),
    ).toEqual([0, 2, 0, 1]);
  } finally {
    doc.Dispose();
  }
});
