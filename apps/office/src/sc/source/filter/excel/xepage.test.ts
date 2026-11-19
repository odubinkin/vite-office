/** @fileoverview Manual page breaks through native Calc, XLSX, ODS and their worker boundary. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScDocument } from "../../../inc/document";
import { ExcelFilter } from "../oox/excelfilter";
import { readOdsDocument, writeOdsDocument, writeOdsXml } from "../xml/xmlwrap";
import { exportXlsx } from "./xetable";

const sheetPath = "xl/worksheets/sheet1.xml";

/** Starts a real Calc document with one tab. @returns Owned worksheet. */
function makeDocument(): ScDocument {
  const document = new ScDocument();
  const name = unicode("Breaks");
  document.InsertTab(0, name);
  name.dispose();
  return document;
}

/** Reads a real exported worksheet part. @param document - Native workbook. @returns XLSX worksheet XML. */
async function worksheetXml(document: ScDocument): Promise<string> {
  return (await DocumentArchive.open(await exportXlsx(document))).readTextEntry(sheetPath);
}

it("ports the 1023 row-break cap using the full pinned LibreOffice workbook", /** Adapts testTdf170963_row_breaks with the original named expression intact. @returns Completion. */ async () => {
  const fixture = readFileSync(
    "../../vendor/libreoffice-reference/sc/qa/unit/data/ods/tdf170963_row_breaks.ods",
  );
  const document = await readOdsDocument(new Uint8Array(fixture));
  try {
    expect(document.GetRangeName()?.findByUpperName("__SHARED_2_0_0")?.GetSymbol()).toBe(
      "#REF!-#REF!",
    );
    const table = document.FetchTable(0);
    assert(table);
    expect(table.HasRowManualBreak(11)).toBe(false);
    expect(table.HasRowManualBreak(12)).toBe(true);
    expect(table.HasRowManualBreak(65536)).toBe(true);
    const xml = await worksheetXml(document);
    expect(xml).toContain('<rowBreaks count="1023" manualBreakCount="1023">');
    expect(xml.match(/<brk /g)).toHaveLength(1023);
    expect(xml).toContain('<brk id="12" man="true" max="16383" min="0"/>');
    expect(xml).toContain('<brk id="1034" man="true" max="16383" min="0"/></rowBreaks>');
  } finally {
    document.Dispose();
  }
});

it("keeps manual positions through ODS and worker transfer and applies the XLSX UInt16 row limit", /** Exercises mixed consecutive and isolated native break positions with no cells on those rows. @returns Completion. */ async () => {
  const document = makeDocument();
  let ods: ScDocument | undefined, worker: ScDocument | undefined, xlsx: ScDocument | undefined;
  try {
    const table = document.FetchTable(0);
    assert(table);
    for (const position of [65536, 2, 3, 65535]) table.SetRowBreak(position, false, true);
    for (const position of [5, 6, 11]) table.SetColBreak(position, false, true);
    table.SetRowBreak(8, true, false);
    table.SetColBreak(8, true, false);
    const content = (await writeOdsXml(document)).files["content.xml"];
    expect(content).toContain('fo:break-before="page"');
    expect(content).toMatch(/table:style-name="ro2" table:number-rows-repeated="2"/u);
    ods = await readOdsDocument(await writeOdsDocument(document));
    worker = decodeCalcDocument(encodeCalcDocument(ods));
    const copy = worker.FetchTable(0);
    assert(copy);
    expect(copy.HasRowManualBreak(65536)).toBe(true);
    expect(copy.HasColManualBreak(11)).toBe(true);
    expect(copy.HasRowPageBreak(8)).toBe(false);
    const bytes = await exportXlsx(worker);
    const archive = await DocumentArchive.open(bytes);
    const xml = await archive.readTextEntry(sheetPath);
    expect(xml).toContain('<rowBreaks count="3" manualBreakCount="3">');
    expect(xml).toContain('<brk id="65535" man="true" max="16383" min="0"/>');
    expect(xml).not.toContain('<brk id="65536"');
    expect(xml).toContain('<colBreaks count="3" manualBreakCount="3">');
    expect(xml).toContain('<brk id="11" man="true" max="65535" min="0"/>');
    xlsx = await ExcelFilter.importDocument(bytes);
    const reopened = xlsx.FetchTable(0);
    assert(reopened);
    expect(reopened.HasRowManualBreak(2)).toBe(true);
    expect(reopened.HasRowManualBreak(3)).toBe(true);
    expect(reopened.HasColManualBreak(5)).toBe(true);
    expect(reopened.HasColManualBreak(6)).toBe(true);
    expect(reopened.HasColManualBreak(8)).toBe(false);
    expect(reopened.HasColPageBreak(8)).toBe(false);
  } finally {
    xlsx?.Dispose();
    worker?.Dispose();
    ods?.Dispose();
    document.Dispose();
  }
});

it("applies only positive manual XLSX breaks and ignores their cross-axis spans", /** Retains the native parser defaults and ignores aggregate break counts. @returns Completion. */ async () => {
  const document = makeDocument();
  let reopened: ScDocument | undefined;
  try {
    const archive = await DocumentArchive.open(await exportXlsx(document));
    const output = new DocumentArchiveWriter();
    for (const part of archive.getEntryNames()) {
      if (part === sheetPath) {
        const xml = await archive.readTextEntry(part);
        expect(xml).not.toContain("<rowBreaks");
        expect(xml).not.toContain("<colBreaks");
        output.putNextEntry(
          part,
          new TextEncoder().encode(
            xml.replace(
              "</worksheet>",
              '<rowBreaks count="99"><brk id="0" man="true"/><brk id="2"/><brk id="5" man="false"/><brk id="-1" man="true"/><brk id="9" min="2" max="4" man="1"/><brk id="1048576" man="true"/></rowBreaks><colBreaks><brk id="7" man="on"/><brk id="8" man="off"/><brk id="16384" man="true"/></colBreaks></worksheet>',
            ),
          ),
        );
      } else output.putNextEntry(part, await archive.readEntry(part));
    }
    reopened = await ExcelFilter.importDocument(await output.finish());
    const table = reopened.FetchTable(0);
    assert(table);
    const rows = new Set<number>(),
      columns = new Set<number>();
    table.GetAllRowBreaks(rows, true, true);
    table.GetAllColBreaks(columns, true, true);
    expect([...rows]).toEqual([9]);
    expect([...columns]).toEqual([7]);
  } finally {
    reopened?.Dispose();
    document.Dispose();
  }
});
