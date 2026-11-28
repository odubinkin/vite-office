/** @fileoverview Native Calc label references across recalculation, ODS and Worker transfer. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { ODF_NAMESPACES as NS } from "../../../../xmloff/source/core/xmltoken";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { ScXMLImport } from "./xmlimprt";
import { readOdsDocument, writeOdsDocument, writeOdsXml } from "./xmlwrap";

/** Reads the pinned Calc shared-formula workbook. @param name - Original fixture name. @returns Workbook. */
function readSharedFixture(name: string): Promise<ScDocument> {
  const root = "../../vendor/libreoffice-reference/sc/qa/unit/data/ods/shared-formula/";
  return readOdsDocument(new Uint8Array(readFileSync(root + name)));
}

it("recalculates the pinned column label expressions" /** Ports testSharedFormulaColumnLabelsODS. @returns Completion. */, async () => {
  const document = await readSharedFixture("column-labels.ods");
  try {
    document.CalcAll();
    for (const [column, values] of [
      [2, [5, 15, 30, 28, 48]],
      [3, [0, 50, 144, 147, 320]],
      [4, [0, 2, 4, 3, 5]],
    ] as const)
      for (const [row, value] of values.entries())
        expect(document.GetValue(new ScAddress(column, row + 1, 0))).toBe(value);
  } finally {
    document.Dispose();
  }
});

it("recalculates the pinned row and column label intersections" /** Ports testSharedFormulaColumnRowLabelsODS. @returns Completion. */, async () => {
  const document = await readSharedFixture("column-row-labels.ods");
  try {
    document.CalcAll();
    for (const [column, row] of [
      [5, 1],
      [9, 1],
      [1, 6],
    ] as const)
      for (let colOffset = 0; colOffset < 3; ++colOffset)
        for (let rowOffset = 0; rowOffset < 3; ++rowOffset)
          expect(document.GetValue(new ScAddress(column + colOffset, row + rowOffset, 0))).toBe(
            1 + 3 * colOffset + rowOffset,
          );
    const content = (await writeOdsXml(document)).files["content.xml"];
    expect(content).toContain("&apos;col1&apos;!!&apos;row1&apos;");
  } finally {
    document.Dispose();
  }
});

it("transfers explicit row and column labels before compiling Worker formulas" /** Keeps the formula result and authored label ranges when automatic lookup is disabled. @returns Completion. */, async () => {
  const document = new ScDocument();
  let transferred: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  const valueCell =
    /** Serializes one numeric cell for the ODS label range fixture. @param value - Numeric fixture value. @returns ODF table-cell markup. */ (
      value: number,
    ) => `<table:table-cell office:value-type="float" office:value="${value}"/>`;
  try {
    new ScXMLImport(document).importContent(
      `<office:document-content xmlns:office="${NS.office}" xmlns:table="${NS.table}" xmlns:text="${NS.text}" xmlns:of="urn:oasis:names:tc:opendocument:xmlns:of:1.2"><office:body><office:spreadsheet>
        <table:calculation-settings table:automatic-find-labels="false"/>
        <table:table table:name="Label Sheet">
          <table:table-row><table:table-cell office:value-type="string"><text:p>Named Column</text:p></table:table-cell><table:table-cell/><table:table-cell office:value-type="string"><text:p>Named Row</text:p></table:table-cell>${valueCell(2)}${valueCell(8)}</table:table-row>
          <table:table-row>${valueCell(4)}</table:table-row>
          <table:table-row>${valueCell(9)}<table:table-cell table:number-columns-repeated="3"/><table:table-cell table:formula="of:=SUM('Named Column')+SUM('Named Row')" office:value-type="float" office:value="23"/></table:table-row>
        </table:table>
        <table:label-ranges>
          <table:label-range table:orientation="column" table:label-cell-range-address="'Label Sheet'.A1" table:data-cell-range-address="'Label Sheet'.A2:'Label Sheet'.A3"/>
          <table:label-range table:orientation="row" table:label-cell-range-address="'Label Sheet'.C1" table:data-cell-range-address="'Label Sheet'.D1:'Label Sheet'.E1"/>
        </table:label-ranges>
      </office:spreadsheet></office:body></office:document-content>`,
    );
    transferred = decodeCalcDocument(structuredClone(encodeCalcDocument(document)));
    const savedContent = (await writeOdsXml(transferred)).files["content.xml"];
    expect(savedContent).toContain("&apos;Label Sheet&apos;.A1:&apos;Label Sheet&apos;.A1");
    reopened = await readOdsDocument(await writeOdsDocument(transferred));
    for (const workbook of [document, transferred, reopened]) {
      expect(workbook.GetColNameRanges().size()).toBe(1);
      expect(workbook.GetRowNameRanges().size()).toBe(1);
      expect(workbook.GetDocOptions().IsLookUpColRowNames()).toBe(false);
      workbook.CalcAll();
      expect(workbook.GetValue(new ScAddress(4, 2, 0))).toBe(23);
    }
  } finally {
    reopened?.Dispose();
    transferred?.Dispose();
    document.Dispose();
  }
});
