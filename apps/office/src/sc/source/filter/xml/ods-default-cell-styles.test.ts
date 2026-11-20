/** @fileoverview Exercises default styles from the ODF column and row contexts through actual Calc patterns. */
import { expect, it } from "vitest";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { ScXMLImport } from "./xmlimprt";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";

/** Imports authored default names and explicit cells using real named styles. @param columns - Column elements. @param rows - Row elements. @returns Workbook. */
function open(columns: string, rows: string): ScDocument {
  const { office, table, style, fo } = ODF_NAMESPACES;
  const doc = new ScDocument();
  new ScXMLImport(doc).importContent(
    `<office:document-content xmlns:office="${office}" xmlns:table="${table}" xmlns:style="${style}" xmlns:fo="${fo}"><office:styles>
     <style:style style:family="table-cell" style:name="First"><style:text-properties fo:font-size="20pt"/></style:style>
     <style:style style:family="table-cell" style:name="Second"><style:text-properties fo:font-size="21pt"/></style:style>
     <style:style style:family="table-cell" style:name="Direct"><style:text-properties fo:font-size="22pt"/></style:style>
    </office:styles><office:body><office:spreadsheet><table:table table:name="Sheet1">${columns}${rows}</table:table></office:spreadsheet></office:body></office:document-content>`,
  );
  return doc;
}

/** Reads the effective named style through the real pattern. @param doc - Workbook. @param col - Column. @param row - Row. @returns Style name. */
function named(doc: ScDocument, col: number, row: number): string {
  const name = doc.GetPattern(new ScAddress(col, row, 0))?.GetStyleName();
  return name ? text(name) : "";
}

it("resolves repeated empty ranges and explicit cell overrides using the original column defaults", /** Checks styles applied to empty and numeric cells. @returns Nothing. */ () => {
  const doc = open(
    '<table:table-column table:default-cell-style-name="First" table:number-columns-repeated="2"/><table:table-column table:default-cell-style-name="Second"/>',
    '<table:table-row table:number-rows-repeated="2"><table:table-cell table:number-columns-repeated="3"/></table:table-row>' +
      '<table:table-row><table:table-cell table:style-name="Direct" office:value-type="float" office:value="11"/><table:table-cell/><table:table-cell table:style-name=""/></table:table-row>',
  );
  try {
    expect([0, 1, 2].map((col) => named(doc, col, 0))).toEqual(["First", "First", "Second"]);
    expect([0, 1, 2].map((col) => named(doc, col, 1))).toEqual(["First", "First", "Second"]);
    expect([0, 1, 2].map((col) => named(doc, col, 2))).toEqual(["Direct", "First", "Second"]);
    expect(doc.GetValue(new ScAddress(0, 2, 0))).toBe(11);
  } finally {
    doc.Dispose();
  }
});

it("resolves a pending unstyled range with the next row default when the next range flushes it", /** Matches the source's deferred row default cursor. @returns Nothing. */ () => {
  const doc = open(
    '<table:table-column table:default-cell-style-name="Direct"/>',
    '<table:table-row table:default-cell-style-name="First"><table:table-cell/></table:table-row>' +
      '<table:table-row table:default-cell-style-name="Second"><table:table-cell office:value-type="float" office:value="1"/></table:table-row>',
  );
  try {
    expect(named(doc, 0, 0)).toBe("Second");
    expect(named(doc, 0, 1)).toBe("Second");
  } finally {
    doc.Dispose();
  }
});

it("extends the last column style within a pending range that starts in the declarations", /** Checks native behavior at the declared column boundary. @returns Nothing. */ () => {
  const doc = open(
    '<table:table-column table:default-cell-style-name="First"/>',
    '<table:table-row><table:table-cell table:number-columns-repeated="2"/><table:table-cell office:value-type="float" office:value="5"/></table:table-row>',
  );
  try {
    expect(named(doc, 0, 0)).toBe("First");
    expect(named(doc, 1, 0)).toBe("First");
    expect(named(doc, 2, 0)).not.toBe("First");
    expect(doc.GetValue(new ScAddress(2, 0, 0))).toBe(5);
  } finally {
    doc.Dispose();
  }
});

it("uses the most frequent pattern and first row tie-break, emitting explicit exceptions", /** Checks native range selection through ODS and Worker. @returns Completion. */ async () => {
  const source = open(
    '<table:table-column table:number-columns-repeated="2"/>',
    '<table:table-row><table:table-cell table:style-name="First"/><table:table-cell table:style-name="Second"/></table:table-row>' +
      '<table:table-row><table:table-cell table:style-name="Second"/><table:table-cell table:style-name="First"/></table:table-row>' +
      '<table:table-row><table:table-cell table:style-name="First"/><table:table-cell/></table:table-row>' +
      '<table:table-row><table:table-cell/><table:table-cell table:style-name="Direct"/></table:table-row>',
  );
  const worker = decodeCalcDocument(encodeCalcDocument(source));
  let reopened: ScDocument | undefined;
  try {
    expect(worker.GetColDefault(0, 0, 3)).toBe(0);
    expect(worker.GetColDefault(0, 1, 3)).toBe(0);
    const bytes = await writeOdsDocument(worker);
    const content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    expect(content.match(/table:default-cell-style-name="(?:First|Second)"/gu)).toEqual([
      'table:default-cell-style-name="First"',
      'table:default-cell-style-name="Second"',
    ]);
    expect(content).toContain('<table:table-cell table:style-name="Default"/>');
    expect(content).toContain('<table:table-cell table:number-columns-repeated="2"/>');
    reopened = await readOdsDocument(bytes);
    for (const row of [0, 1, 2, 3])
      for (const col of [0, 1]) expect(named(reopened, col, row)).toBe(named(source, col, row));
  } finally {
    reopened?.Dispose();
    worker.Dispose();
    source.Dispose();
  }
});
