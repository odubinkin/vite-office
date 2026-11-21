/** @fileoverview LibreOffice legacy ODS conditional style maps over native cell ranges. */
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

const namedStyles = `<office:styles>
  <style:style style:name="First_20_Match" style:display-name="First Match" style:family="table-cell">
    <style:table-cell-properties fo:background-color="#ff0000"/>
  </style:style>
  <style:style style:name="Second" style:family="table-cell">
    <style:table-cell-properties fo:background-color="#0000ff"/>
  </style:style>
</office:styles>`;
const rules =
  '<style:map style:condition="formula:is-true-formula([.B2]&gt;0)" style:apply-style-name="First_20_Match" style:base-cell-address="Data.A2"/>' +
  '<style:map style:condition="cell-content-is-between(1,SUM(1;2))" style:apply-style-name="Second" style:base-cell-address="Data.A2"/>';

/** Produces a real automatic table-cell style with legacy rules. @param name - Style name. @param maps - Original condition maps. @returns Style XML. */
function style(name: string, maps = rules): string {
  return `<style:style style:name="${name}" style:family="table-cell" style:parent-style-name="Default">${maps}</style:style>`;
}

/** Creates a styled numeric cell with an adjacent numeric formula input. @param name - Automatic style. @param adjacent - Value in B. @returns Row. */
function row(name: string, adjacent: number): string {
  return `<table:table-row><table:table-cell table:style-name="${name}" office:value-type="float" office:value="2"/><table:table-cell office:value-type="float" office:value="${adjacent}"/></table:table-row>`;
}

/** Opens the source XML through the normal Calc import. @param styles - Automatic styles. @param sheets - Sheets in input order. @returns Workbook. */
function open(styles: string, sheets: string): ScDocument {
  const doc = new ScDocument();
  new ScXMLImport(doc).importContent(
    `<office:document-content xmlns:office="${NS.office}" xmlns:table="${NS.table}" xmlns:style="${NS.style}" xmlns:fo="${NS.fo}" xmlns:calcext="${NS.calcext}" xmlns:formula="${NS.of}" xmlns:oooc="http://openoffice.org/2004/calc">${namedStyles}<office:automatic-styles>${styles}</office:automatic-styles><office:body><office:spreadsheet>${sheets}</office:spreadsheet></office:body></office:document-content>`,
  );
  return doc;
}

it("joins equal maps while preserving rule order and the relative formula origin through Worker and ODS", /** Evaluates original and exported conditional formats. @returns Completion. */ async () => {
  const doc = open(
    style("a") + style("b"),
    `<table:table table:name="Data"><table:table-row/>${row("a", 1)}${row("a", 0)}<table:table-row/>${row("b", 1)}</table:table>`,
  );
  let worker: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  try {
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(doc)));
    const bytes = await writeOdsDocument(worker);
    const content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    expect(content).toContain("<calcext:conditional-formats>");
    expect(content).toContain('calcext:apply-style-name="First_20_Match"');
    reopened = await readOdsDocument(bytes);
    for (const candidate of [doc, worker, reopened]) {
      const formats = [...(candidate.FetchTable(0)?.GetCondFormList() ?? [])];
      expect(formats).toHaveLength(1);
      const [format] = formats;
      assert(format);
      expect(format.size()).toBe(2);
      expect([...format.GetRange()].map((range) => range.GetVars())).toEqual([
        [0, 1, 0, 0, 2, 0],
        [0, 4, 0, 0, 4, 0],
      ]);
      const formula = format.GetEntry(0);
      assert(formula instanceof ScCondFormatEntry);
      expect(formula.GetOperation()).toBe(Mode.Direct);
      expect(formula.GetSrcPos().equals(new ScAddress(0, 1))).toBe(true);
      for (const [index, name] of [
        [1, "First Match"],
        [2, "Second"],
        [4, "First Match"],
      ] as const) {
        const address = new ScAddress(0, index);
        expect(format.GetCellStyle(candidate.GetRefCellValue(address), address)).toBe(name);
        expect(candidate.GetCondResult(address)).toBeDefined();
      }
    }
  } finally {
    doc.Dispose();
    worker?.Dispose();
    reopened?.Dispose();
  }
});

it("retains the first sheet's ownership and lets an empty extended element gate later sheets", /** Exercises original style ownership and the document-wide extension gate separately. @returns Nothing. */ () => {
  const compare =
    '<style:map style:condition="oooc:cell-content( )!= MINIFS([.B1:.B1];[.B1:.B1];0)" style:apply-style-name="Second" style:base-cell-address="Data.A1"/>';
  const doc = open(
    style("shared", compare) + style("fresh", compare),
    `<table:table table:name="Data">${row("shared", 0)}</table:table>
    <table:table table:name="Again">${row("shared", 0)}</table:table>
    <table:table table:name="Extension">${row("fresh", 0)}<calcext:conditional-formats/></table:table>
    <table:table table:name="After">${row("fresh", 0)}</table:table>`,
  );
  try {
    const address = new ScAddress(0, 0);
    const [format] = [...(doc.FetchTable(0)?.GetCondFormList() ?? [])];
    assert(format);
    const entry = format.GetEntry(0);
    assert(entry instanceof ScCondFormatEntry);
    expect(entry.GetOperation()).toBe(Mode.NotEqual);
    expect(format.GetCellStyle(doc.GetRefCellValue(address), address)).toBe("Second");
    for (const tab of [1, 2, 3]) {
      expect([...(doc.FetchTable(tab)?.GetCondFormList() ?? [])]).toHaveLength(0);
      expect(doc.GetCondResult(new ScAddress(0, 0, tab))).toBeUndefined();
    }
  } finally {
    doc.Dispose();
  }
});

it("imports the string condition from the tdf132278 regression workbook", /** Reads the source map through the represented Calc XML and cell paths. @returns Completion. */ async () => {
  const bytes = readFileSync(
    "../../vendor/libreoffice-reference/sc/qa/unit/data/ods/tdf132278.ods",
  );
  const archive = await DocumentArchive.open(new Uint8Array(bytes));
  const content = await archive.readTextEntry("content.xml");
  const map = content.match(
    /<style:map style:condition="cell-content\(\)=&quot;NO&quot;"[^>]*\/>/u,
  )?.[0];
  assert(map);
  const doc = open(
    style("fromFixture", map),
    '<table:table table:name="Tabella_Linee"><table:table-row table:number-rows-repeated="22"/><table:table-row><table:table-cell table:number-columns-repeated="2"/><table:table-cell table:style-name="fromFixture" office:value-type="string" office:string-value="NO"/></table:table-row></table:table>',
  );
  try {
    const [format] = [...(doc.FetchTable(0)?.GetCondFormList() ?? [])];
    assert(format);
    const entry = format.GetEntry(0);
    assert(entry instanceof ScCondFormatEntry);
    const address = new ScAddress(2, 22);
    expect(entry.GetSrcPos().equals(address)).toBe(true);
    expect(entry.GetOperation()).toBe(Mode.Equal);
    expect(format.GetCellStyle(doc.GetRefCellValue(address), address)).toBe("Rosso3");
  } finally {
    doc.Dispose();
  }
});
