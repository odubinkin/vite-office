/** @fileoverview Native ODF external cache fixture and sparse primary storage round trips. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { FormulaDoubleToken, FormulaStringToken } from "../../../../formula/inc/token";
import {
  CreateDoubleError,
  FormulaError,
  GetDoubleErrorValue,
} from "../../../../formula/inc/errorcodes";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { ScDocument } from "../../../inc/document";
import { ScXMLImport } from "./xmlimprt";
import { ODS_MIMETYPE, readOdsDocument, writeOdsXml } from "./xmlwrap";
import { createExternalRefTable } from "./xmlexternaltabi";

/** Wraps cache tables in an ordinary Calc content document. @param cache - Original cache XML. @returns Primary format package. */
function content(cache: string) {
  const { office, table, text, xlink } = ODF_NAMESPACES;
  return {
    format: "xml" as const,
    files: {
      mimetype: ODS_MIMETYPE,
      "META-INF/manifest.xml": `<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3"><manifest:file-entry manifest:full-path="/" manifest:media-type="${ODS_MIMETYPE}" manifest:version="1.3"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>`,
      "content.xml": `<office:document-content xmlns:office="${office}" xmlns:table="${table}" xmlns:text="${text}" xmlns:xlink="${xlink}"><office:body><office:spreadsheet><table:table table:name="Visible"/>${cache}</office:spreadsheet></office:body></office:document-content>`,
    },
  };
}

it("imports the original cache table from external-ref-cache.ods without a visible cache sheet", /** Exercises the file-cache portion of upstream testExternalRefCacheODS. @returns Completion. */ async () => {
  const bytes = readFileSync(
    "../../vendor/libreoffice-reference/sc/qa/unit/data/ods/external-ref-cache.ods",
  );
  const original = await DocumentArchive.open(new Uint8Array(bytes));
  const xml = await original.readTextEntry("content.xml");
  const table = /<table:table table:name="&apos;file:[\s\S]*?<\/table:table>/u.exec(xml)?.[0];
  assert(table);
  const doc = await readOdsDocument(content(table));
  try {
    const manager = doc.GetExternalRefManager();
    const cache = manager.getCacheTable(0, "sheet1");
    const word = cache?.getCell(1, 1);
    expect(doc.GetTableCount()).toBe(1);
    expect(manager.getExternalFiles()[0]?.relativeName).toBe("base.ods");
    expect(cache?.isWholeTableCached()).toBe(true);
    expect(word).toBeInstanceOf(FormulaStringToken);
    expect(text((word as FormulaStringToken).GetString().getString())).toBe("text");
    expect(cache?.getCell(2, 1)).toEqual(new FormulaDoubleToken(1));
  } finally {
    doc.Dispose();
  }
});

it("round-trips sparse gaps, repeated cache cells and native numeric values", /** Checks the independent ODF cache rows and its primary export representation. @returns Completion. */ async () => {
  const source = await readOdsDocument(
    content(`
    <table:table table:name="'file:///data.ods'#Sheet South">
      <table:table-source xlink:href="file:///data.ods"/>
      <table:table-column table:number-columns-repeated="5"/>
      <table:table-rows>
        <table:table-row table:number-rows-repeated="3"><table:table-cell/></table:table-row>
        <table:table-row table:number-rows-repeated="2">
          <table:table-cell table:number-columns-repeated="2"/>
          <table:table-cell office:boolean-value="true" table:number-columns-repeated="2"/>
          <table:covered-table-cell office:string-value="first"><text:p>A<![CDATA[B]]>C</text:p></table:covered-table-cell>
        </table:table-row>
        <table:table-row>
          <table:table-cell office:string-value="mixed"/>
          <table:table-cell table:number-columns-repeated="3"/>
          <table:table-cell office:value="2.5"/>
        </table:table-row>
      </table:table-rows>
    </table:table>
  `),
  );
  let reopened: typeof source | undefined;
  try {
    for (const name of [
      "'unknown'#Sheet",
      "'file:///data.ods'",
      "'file:///data.ods'#",
      "'file:///data.ods#bad",
    ])
      expect(createExternalRefTable(name, new ScXMLImport(source))).toBeUndefined();
    const cache = source.GetExternalRefManager().getCacheTable(0, "Sheet South");
    assert(cache);
    cache.setCell(0, 8, new FormulaDoubleToken(CreateDoubleError(FormulaError.DivisionByZero)));
    const output = await writeOdsXml(source);
    expect(output.files["content.xml"]).toContain('table:style-name="ta_extref"');
    expect(output.files["content.xml"]).toContain('table:number-rows-repeated="3"');
    reopened = await readOdsDocument(output);
    const restored = reopened.GetExternalRefManager().getCacheTable(0, "Sheet South");
    expect(restored?.getCell(0, 0)).toBeUndefined();
    expect(restored?.getCell(2, 3)).toEqual(new FormulaDoubleToken(1));
    expect(restored?.getCell(3, 4)).toEqual(new FormulaDoubleToken(1));
    expect(restored?.getCell(4, 5)).toEqual(new FormulaDoubleToken(2.5));
    const value = restored?.getCell(4, 4);
    expect(value).toBeInstanceOf(FormulaStringToken);
    expect(text((value as FormulaStringToken).GetString().getString())).toBe("ABC");
    const error = restored?.getCell(0, 8);
    expect(error).toBeInstanceOf(FormulaDoubleToken);
    expect(GetDoubleErrorValue((error as FormulaDoubleToken).GetDouble())).toBe(
      FormulaError.IllegalFPOperation,
    );
    expect(reopened.GetTableCount()).toBe(1);
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});

it("applies the existing ODS expansion budget only to represented cache cells", /** Exercises both sheet bounds and the shared expansion limit. @returns Nothing. */ () => {
  const doc = new ScDocument();
  const importer = new ScXMLImport(doc, { maxExpandedCells: 3 });
  const input = content(`
    <table:table table:name="'file:///data.ods'#Sheet North">
      <table:table-row>
        <table:table-cell table:number-columns-repeated="${doc.MaxCol() + 1}"/>
        <table:table-cell office:value="9"/>
      </table:table-row>
      <table:table-row table:number-rows-repeated="2">
        <table:table-cell office:value="5" table:number-columns-repeated="2"/>
      </table:table-row>
    </table:table>`);
  try {
    expect(
      /** Parses the cache against the configured scalar budget. @returns Nothing. */ () =>
        importer.importContent(input.files["content.xml"]),
    ).toThrow("ODS expanded cell limit exceeded");
    expect(doc.GetExternalRefManager().getCacheTable(0, "Sheet North")?.entries().size).toBe(0);
  } finally {
    doc.Dispose();
  }
});
