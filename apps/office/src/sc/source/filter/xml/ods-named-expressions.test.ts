/** @fileoverview Native name reference and hidden-name interchange through Calc ODS. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { ODF_NAMESPACES as NS } from "../../../../xmloff/source/core/xmltoken";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { RangeDataType } from "../../core/tool/rangenam";
import { ExcelFilter } from "../oox/excelfilter";
import { ScXMLImport } from "./xmlimprt";
import { readOdsDocument, writeOdsDocument, writeOdsXml } from "./xmlwrap";

/** Reads a pinned LibreOffice test document. @param name - Name under the native fixture directory. @returns Fixture bytes. */
function fixture(name: string): Uint8Array {
  return new Uint8Array(readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/" + name));
}

it("ports the LibreOffice hidden range assertions through ODS import and re-export", /** Checks the original ODS and XLSX fixtures. @returns Completion. */ async () => {
  for (const format of ["ods", "xlsx"] as const) {
    const bytes = fixture(`${format}/named-ranges-hidden.${format}`);
    const doc = await (format === "ods"
      ? readOdsDocument(bytes)
      : ExcelFilter.importDocument(bytes));
    try {
      const names = doc.GetRangeName();
      assert(names);
      const hidden = names.findByUpperName("NAMEDRANGE1");
      const visible = names.findByUpperName("NAMEDRANGE2");
      assert(hidden && visible);
      expect(hidden.type & RangeDataType.Hidden).toBe(RangeDataType.Hidden);
      expect(visible.type & RangeDataType.Hidden).toBe(0);
      if (format === "ods") visible.AddType(RangeDataType.Hidden);
      const reopened = await readOdsDocument(await writeOdsDocument(doc));
      try {
        const savedNames = reopened.GetRangeName();
        assert(savedNames);
        for (const entry of [hidden, visible]) {
          const actual = savedNames.findByUpperName(entry.GetUpperName());
          assert(actual);
          expect(actual.type & RangeDataType.Hidden).toBe(entry.type & RangeDataType.Hidden);
        }
      } finally {
        reopened.Dispose();
      }
    } finally {
      doc.Dispose();
    }
  }
});

it("ports the original hidden named expression fixture and its saved flags", /** Checks visibility and scalar symbols through the ODS packages. @returns Completion. */ async () => {
  const doc = await readOdsDocument(fixture("ods/NamedExpressionsHidden.ods"));
  let reopened: ScDocument | undefined;
  try {
    reopened = await readOdsDocument(await writeOdsDocument(doc));
    for (const workbook of [doc, reopened]) {
      const names = workbook.GetRangeName();
      assert(names);
      const hidden = names.findByUpperName("NAME1");
      const visible = names.findByUpperName("NAME2");
      assert(hidden && visible);
      expect([hidden.type, visible.type]).toEqual([RangeDataType.Hidden, RangeDataType.Name]);
      expect([hidden.GetSymbol(), visible.GetSymbol()]).toEqual(["100", "200"]);
    }
  } finally {
    reopened?.Dispose();
    doc.Dispose();
  }
});

it("resolves named definitions in the native scope and grammar across Calc Worker and ODS", /** Exercises qualified range endpoints and lexical XML representations. @returns Completion. */ async () => {
  const doc = new ScDocument();
  new ScXMLImport(doc).importContent(
    `<office:document-content xmlns:office="${NS.office}" xmlns:table="${NS.table}" xmlns:loext="${NS.loext}" xmlns:oooc="http://openoffice.org/2004/calc"><office:body><office:spreadsheet>
      <table:table table:name="A1"/>
      <table:table table:name="O&apos;Brien"><table:named-expressions>
        <table:named-range table:name="LocalRange" table:base-cell-address="$&apos;O&apos;&apos;Brien&apos;.$D$5 trailer" table:cell-range-address=".A1:.A2" table:range-usable-as="repeat-column repeat-row filter print-range hidden"/>
        <table:named-expression table:name="Fallback" table:base-cell-address="$Missing.$D$5" table:expression="100"/>
      </table:named-expressions></table:table>
      <table:table table:name="Last.Dot"/>
      <table:named-expressions>
        <table:named-range table:name="BetweenSheets" table:base-cell-address="$&apos;A1&apos;.$A$1" table:cell-range-address="$&apos;A1&apos;.$B$2:$&apos;Last.Dot&apos;.$C$3" loext:hidden="true"/>
        <table:named-expression table:name="Legacy" table:base-cell-address="$&apos;A1&apos;.$A$1" table:expression="oooc:MINIFS([.$A$1:.$A$2];[.$A$1:.$A$2];2)" loext:hidden="true" table:range-usable-as="print-range"/>
        <table:named-expression table:name="Arithmetic" table:base-cell-address="$&apos;A1&apos;.$A$1" table:expression="[.$B$2]+1"/>
      </table:named-expressions>
    </office:spreadsheet></office:body></office:document-content>`,
  );
  let worker: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  try {
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(doc)));
    const packageXml = await writeOdsXml(worker);
    const content = packageXml.files["content.xml"];
    assert(typeof content === "string");
    expect(content).toContain(
      'table:named-range table:name="BetweenSheets" table:base-cell-address="$&apos;A1&apos;.$A$1"',
    );
    expect(content).toContain(
      'table:range-usable-as="repeat-column repeat-row filter print-range hidden"',
    );
    expect(content).toContain('table:named-expression table:name="Arithmetic"');
    expect(content).toContain(
      'table:expression="COM.MICROSOFT.MINIFS([.$A$1:.$A$2];[.$A$1:.$A$2];2)" loext:hidden="true"',
    );
    reopened = await readOdsDocument(packageXml);
    for (const workbook of [doc, worker, reopened]) {
      const global = workbook.GetRangeName();
      const local = workbook.GetRangeName(1);
      assert(global && local);
      const range = new ScRange();
      const between = global.findByUpperName("BETWEENSHEETS");
      const relative = local.findByUpperName("LOCALRANGE");
      const arithmetic = global.findByUpperName("ARITHMETIC");
      assert(between && relative && arithmetic);
      expect(between.type).toBe(RangeDataType.AbsArea);
      expect(between.IsReference(range)).toBe(true);
      expect(range.GetVars()).toEqual([1, 1, 0, 2, 2, 2]);
      expect(relative.pos.GetVars()).toEqual([3, 4, 1]);
      expect(relative.IsReference(range, new ScAddress(4, 5, 1))).toBe(true);
      expect(range.GetVars()).toEqual([1, 1, 1, 1, 2, 1]);
      expect(local.findByUpperName("FALLBACK")?.pos.GetVars()).toEqual([0, 0, 1]);
      expect(global.findByUpperName("LEGACY")?.type).toBe(
        RangeDataType.Hidden | RangeDataType.AbsArea,
      );
      expect(arithmetic.type).toBe(RangeDataType.AbsPos);
      expect(arithmetic.IsReference(range)).toBe(false);
    }
    const rebased = doc.GetRangeName(1)?.findByUpperName("FALLBACK");
    assert(rebased);
    rebased.pos.SetTab(5);
    const updated = await writeOdsXml(doc);
    expect(rebased.pos.GetVars()).toEqual([0, 0, 0]);
    expect(updated.files["content.xml"]).toContain(
      'table:name="Fallback" table:base-cell-address="$&apos;A1&apos;.$A$1"',
    );
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    doc.Dispose();
  }
});
