/** @fileoverview Pinned Calc ODF outline and print title regressions. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import type { ScOutlineArray } from "../../core/data/olinetab";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { ScXMLImport } from "./xmlimprt";
import { readOdsDocument, writeOdsDocument, writeOdsXml } from "./xmlwrap";

/** Reads the native entries in level and position order. @param array - Outline axis. @returns Start, end, collapse and control visibility. */
function levels(array: ScOutlineArray): [number, number, boolean, boolean][][] {
  const result: [number, number, boolean, boolean][][] = [];
  for (let level = 0; level < array.GetDepth(); ++level) {
    const entries: [number, number, boolean, boolean][] = [];
    for (const entry of array.GetEntries(level))
      entries.push([entry.start, entry.end, entry.hidden, entry.visible]);
    result.push(entries);
  }
  return result;
}

it("preserves LibreOffice testOutlineODS and the nested column controls", /** Checks the native fixture before and after ODF save. @returns Completion. */ async () => {
  const document = await readOdsDocument(
    new Uint8Array(
      readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/ods/outline.ods"),
    ),
  );
  let reopened: ScDocument | undefined;
  try {
    reopened = await readOdsDocument(await writeOdsDocument(document));
    for (const model of [document, reopened]) {
      const outline = model.FetchTable(0)?.GetOutlineTable();
      assert(outline);
      expect(levels(outline.GetRowArray())).toEqual([
        [[1, 29, false, true]],
        [[2, 26, false, true]],
        [[4, 23, false, true]],
        [[6, 20, true, true]],
      ]);
      expect(levels(outline.GetColArray())).toEqual([
        [[0, 25, false, true]],
        [[2, 22, true, true]],
        [[4, 20, false, false]],
        [[6, 18, true, false]],
      ]);
    }
  } finally {
    reopened?.Dispose();
    document.Dispose();
  }
});

it("commits wrappers on their own axis and reconciles row collapse separately", /** Checks disallowed cross-axis children and axis-specific display predicates. @returns Nothing. */ () => {
  const document = new ScDocument();
  try {
    new ScXMLImport(document).importContent(`
      <office:document-content xmlns:office="${ODF_NAMESPACES.office}" xmlns:table="${ODF_NAMESPACES.table}">
        <office:body><office:spreadsheet><table:table table:name="Axes">
          <table:table-columns><table:table-column-group table:display="false">
            <table:table-column/>
            <table:table-column-group table:display="unexpected"><table:table-column/></table:table-column-group>
            <table:table-row><table:table-cell office:value-type="float" office:value="99"/></table:table-row>
          </table:table-column-group></table:table-columns>
          <table:table-rows><table:table-row-group table:display="unexpected">
            <table:table-row table:visibility="collapse"><table:table-cell office:value-type="float" office:value="17"/></table:table-row>
            <table:table-row table:visibility="filter"/>
            <table:table-column table:visibility="collapse"/>
          </table:table-row-group></table:table-rows>
          <table:table-row-group table:display="false"><table:table-row/></table:table-row-group>
        </table:table></office:spreadsheet></office:body>
      </office:document-content>`);
    const sheet = document.FetchTable(0);
    const outline = sheet?.GetOutlineTable();
    assert(sheet && outline);
    expect(levels(outline.GetColArray())).toEqual([[[0, 1, true, true]], [[1, 1, false, false]]]);
    expect(levels(outline.GetRowArray())).toEqual([
      [
        [0, 1, true, true],
        [2, 2, false, true],
      ],
    ]);
    expect(document.GetValue(new ScAddress())).toBe(17);
    expect(sheet.ColHidden(2)).toBe(false);
    expect(sheet.RowHidden(0)).toBe(true);
    expect(sheet.getFilterData().rowFiltered(1)).toBe(true);
  } finally {
    document.Dispose();
  }
});

it("preserves the native first-row and final-column wrapper bounds", /** Covers CALC-785 and CALC-786 independently of exporter output. @returns Nothing. */ () => {
  const document = new ScDocument();
  try {
    const last = document.MaxCol();
    new ScXMLImport(document).importContent(`
      <office:document-content xmlns:office="${ODF_NAMESPACES.office}" xmlns:table="${ODF_NAMESPACES.table}">
        <office:body><office:spreadsheet><table:table table:name="Bounds">
          <table:table-column table:number-columns-repeated="${last - 1}"/>
          <table:table-column-group><table:table-header-columns>
            <table:table-column table:number-columns-repeated="2" table:visibility="collapse"/>
          </table:table-header-columns></table:table-column-group>
          <table:table-header-rows/>
          <table:table-row-group/>
          <table:table-row table:number-rows-repeated="2"/>
        </table:table></office:spreadsheet></office:body>
      </office:document-content>`);
    const sheet = document.FetchTable(0);
    const outline = sheet?.GetOutlineTable();
    assert(sheet && outline);
    expect(sheet.GetRepeatColRange()).toEqual(new ScRange(last - 1, 0, 0, last - 1, 0, 0));
    expect(levels(outline.GetColArray())).toEqual([[[last - 1, last - 1, false, true]]]);
    expect(sheet.ColHidden(last)).toBe(true);
    expect(sheet.GetRepeatRowRange()).toEqual(new ScRange(0, 0, 0, 0, 0, 0));
    expect(levels(outline.GetRowArray())).toEqual([[[0, 0, false, true]]]);
  } finally {
    document.Dispose();
  }
});

it("reopens print titles around adjacent groups and bounds column export by native state", /** Verifies sparse XML and title reconstruction. @returns Completion. */ async () => {
  const document = new ScDocument();
  const name = unicode("Titles");
  let reopened: ScDocument | undefined;
  try {
    assert(document.InsertTab(0, name));
    const sheet = document.FetchTable(0);
    assert(sheet);
    sheet.SetRepeatRowRange(new ScRange(0, 0, 0, 0, 5, 0));
    sheet.SetRepeatColRange(new ScRange(0, 0, 0, 5, 0, 0));
    const outline = sheet.StartOutlineTable();
    for (const array of [outline.GetRowArray(), outline.GetColArray()]) {
      assert(array.Insert(0, 1));
      assert(array.Insert(2, 3));
    }
    sheet.SetColWidth(7, 1440);
    sheet.SetColHidden(9, 9, true);
    const content = (await writeOdsXml(document)).files["content.xml"] as string;
    const xml = new DOMParser().parseFromString(content, "application/xml");
    expect(xml.querySelector("parsererror")).toBeNull();
    for (const axis of ["row", "column"]) {
      const tag = axis === "row" ? "table-header-rows" : "table-header-columns";
      const headers = [...xml.getElementsByTagNameNS(ODF_NAMESPACES.table, tag)];
      expect(headers.map((header) => header.children.length)).toEqual([1, 0, 1, 1]);
      expect(headers[0]?.parentElement?.localName).toBe(`table-${axis}-group`);
      expect(headers[1]?.parentElement?.localName).toBe("table");
    }
    let columnCount = 0;
    for (const column of xml.getElementsByTagNameNS(ODF_NAMESPACES.table, "table-column"))
      columnCount += Number(
        column.getAttributeNS(ODF_NAMESPACES.table, "number-columns-repeated") ?? 1,
      );
    expect(columnCount).toBe(10);
    reopened = await readOdsDocument(await writeOdsDocument(document));
    const copy = reopened.FetchTable(0);
    expect(copy?.GetRepeatRowRange()).toEqual(sheet.GetRepeatRowRange());
    expect(copy?.GetRepeatColRange()).toEqual(sheet.GetRepeatColRange());
    expect(copy?.GetColWidth(7)).toBe(1440);
    expect(copy?.ColHidden(9)).toBe(true);
    expect(copy?.ColHidden(10)).toBe(false);
  } finally {
    reopened?.Dispose();
    name.dispose();
    document.Dispose();
  }
});
