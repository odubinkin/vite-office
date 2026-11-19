/** @fileoverview XLSX workbook link metadata and native defined-name admission. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import {
  MS_OFFICE_RELATION,
  OFFICE_DOCUMENT_RELATION,
  STRICT_OFFICE_DOCUMENT_RELATION,
  Relations,
} from "../../../../oox/source/core/relations";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { ExternalLinkBuffer } from "./externallinkbuffer";
import { importExternalLinkFragments } from "./externallinkfragment";
import { WorkbookFragment } from "./workbookfragment";
import { ExcelFilter } from "./excelfilter";
import { exportXlsx } from "../excel/xetable";
import { ScDocument } from "../../../inc/document";
import { FormulaDoubleToken, FormulaStringToken } from "../../../../formula/inc/token";
import { FormulaError, GetDoubleErrorValue } from "../../../../formula/inc/errorcodes";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { ScExternalDoubleRefToken } from "../../../inc/token";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { readOdsDocument, writeOdsXml } from "../xml/xmlwrap";

const data = "../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/";

it("opens and re-exports the original external named ranges and caches from tdf130959", /** Ports testTdf130959 and extends it through the production Worker graph and the XLSX output. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(readFileSync(data + "tdf130959.xlsx"));
  let worker: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  try {
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
    const bytes = await exportXlsx(worker);
    const archive = await DocumentArchive.open(bytes);
    const workbook = await archive.readTextEntry("xl/workbook.xml");
    expect(workbook).toContain("<externalReferences>");
    expect(workbook).toContain("[1]Referens!$A$1:$A$7");
    expect(workbook).toContain("&apos;[2]Grunduppgifter - Client info&apos;!$A$46:$A$48");
    expect(await archive.readTextEntry("xl/externalLinks/externalLink1.xml")).toContain(
      '<cell r="A7" t="str"><v>Alla fakturor ska i detta flöde</v></cell>',
    );
    reopened = await ExcelFilter.importDocument(bytes);
    for (const doc of [source, worker, reopened]) {
      expect(doc.GetTableCount()).toBe(1);
      const entry = doc.GetRangeName()?.findByUpperName("NYDIM");
      expect(entry?.GetCode().FirstToken()).toBeInstanceOf(ScExternalDoubleRefToken);
      expect(entry?.GetSymbol(FormulaGrammar.Grammar.GRAM_OOXML)).toBe("[1]Referens!$A$1:$A$7");
      const cache = doc.GetExternalRefManager().getCacheTable(0, "Referens");
      const cell = cache?.getCell(0, 6);
      expect(cell).toBeInstanceOf(FormulaStringToken);
      expect(text((cell as FormulaStringToken).GetString().getString())).toBe(
        "Alla fakturor ska i detta flöde",
      );
    }
    const primary = await readOdsDocument(await writeOdsXml(worker));
    try {
      const entry = primary.GetRangeName()?.findByUpperName("NYDIM");
      expect(entry?.GetCode().FirstToken()).toBeInstanceOf(ScExternalDoubleRefToken);
      expect(entry?.GetSymbol(FormulaGrammar.Grammar.GRAM_ODFF)).toContain("Referens.$A$1:.$A$7");
    } finally {
      primary.Dispose();
    }
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    source.Dispose();
  }
});

/** Reads package metadata and fills the native cache. @param bytes - Workbook package. @param document - Calc graph. @returns Original link model. */
async function readLinks(bytes: Uint8Array, document: ScDocument) {
  const storage = await ZipStorage.openForImport(bytes, "calc");
  try {
    const filter = new XmlFilterBase(storage);
    const main = await filter.getFragmentPathFromFirstTypeFromOfficeDoc("officeDocument");
    const workbook = new WorkbookFragment(filter, main);
    expect(await filter.importFragment(workbook)).toBe(true);
    await importExternalLinkFragments(
      filter,
      await workbook.getRelations(),
      workbook.externalLinks,
      document,
    );
    return workbook.externalLinks;
  } finally {
    storage.dispose();
  }
}

it("loads the pinned external workbook relationships and sheet caches in original reference order", /** Exercises OPC traversal on the unchanged workbook from the upstream import regression. @returns Completion. */ async () => {
  const document = new ScDocument();
  try {
    const links = await readLinks(readFileSync(data + "tdf130959.xlsx"), document);
    const [first, second] = links;
    expect(first?.relationshipId).toBe("rId2");
    expect(first?.getType()).toBe("document");
    expect(first?.getTarget()).toBe("bad(1).xlsx");
    expect(first?.getSheetNames().slice(0, 3)).toEqual([
      "Sheet 1",
      "InExchange-kundfakturering",
      "Referens",
    ]);
    expect(second?.relationshipId).toBe("rId3");
    expect(second?.getType()).toBe("document");
    expect(second?.getSheetNames()).toContain("Grunduppgifter - Client info");
    expect(links.isValidDefinedName("[1]Referens!$A$1")).toBe(true);
    expect(links.isValidDefinedName("'[2]Grunduppgifter - Client info'!$A$1")).toBe(true);
    expect(links.isValidDefinedName("[3]Referens!$A$1")).toBe(false);
    const manager = document.GetExternalRefManager();
    expect(manager.getExternalFileName(0)).toBe("bad(1).xlsx");
    const reference = manager.getCacheTable(0, "referens");
    const token = reference?.getCell(0, 6);
    expect(token).toBeInstanceOf(FormulaStringToken);
    expect(text((token as FormulaStringToken).GetString().getString())).toBe(
      "Alla fakturor ska i detta flöde",
    );
    expect(reference?.getCell(1, 6)).toBeUndefined();
  } finally {
    document.Dispose();
  }
});

it("populates native external-cache tokens from XLSX value callbacks", /** Verifies scalar types, sheet indices, first-write precedence and error payloads. @returns Completion. */ async () => {
  const source = await DocumentArchive.open(readFileSync(data + "tdf130959.xlsx"));
  const writer = new DocumentArchiveWriter();
  for (const path of source.getEntryNames()) {
    if (path === "xl/externalLinks/externalLink1.xml") {
      const external = `<externalLink xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="${OFFICE_DOCUMENT_RELATION.slice(0, -1)}">
        <externalBook r:id="rId1"><sheetNames><sheetName val="Data"/></sheetNames>
          <sheetDataSet>
            <sheetData><row><cell r="B1"><v>77</v></cell></row></sheetData>
            <sheetData sheetId="8"><row><cell r="B1"><v>99</v></cell></row></sheetData>
            <sheetData sheetId="0"><row>
              <cell r="A1"><v>1.5</v></cell><cell r="A1"><v>2.5</v></cell>
              <cell r="B1" t="b"><v>1</v></cell>
              <cell r="C1" t="e"><v>#DIV/0!</v></cell>
              <cell r="D1" t="e"><v>#SPILL!</v></cell>
              <cell r="E1" t="e"><v>#UNKNOWN!</v></cell>
              <cell r="F1" t="str"><v>A<![CDATA[B]]>C</v></cell>
              <cell r="G1" t="unsupported"><v>8</v></cell>
              <cell r="XFE1" t="n"><v>11</v></cell>
            </row></sheetData>
          </sheetDataSet>
        </externalBook>
      </externalLink>`;
      writer.putNextEntry(path, new TextEncoder().encode(external));
    } else if (path === "xl/externalLinks/externalLink2.xml") {
      const xml = (await source.readTextEntry(path)).replace('r:id="rId1"', 'r:id="missing"');
      writer.putNextEntry(path, new TextEncoder().encode(xml));
    } else writer.putNextEntry(path, await source.readEntry(path));
  }
  const document = new ScDocument();
  try {
    await readLinks(await writer.finish(), document);
    const manager = document.GetExternalRefManager();
    expect(manager.getExternalFileId("bad(1).xlsx")).toBe(0);
    expect(manager.getExternalFileName(1)).toBeUndefined();
    expect(manager.getCacheTable(1, "Data")).toBeUndefined();
    expect(manager.getCacheTable(99, "Data")).toBeUndefined();
    const cache = manager.getCacheTable(0, "Data");
    /** Reads the native double token, including encoded errors. @param col - Source column. @returns Scalar value or undefined. */
    function numberAt(col: number): number | undefined {
      const token = cache?.getCell(col, 0);
      return token instanceof FormulaDoubleToken ? token.GetDouble() : undefined;
    }
    expect(cache?.getCell(0, 0)).toBeInstanceOf(FormulaDoubleToken);
    expect(numberAt(0)).toBe(1.5);
    expect(numberAt(1)).toBe(1);
    expect(GetDoubleErrorValue(numberAt(2) ?? 0)).toBe(FormulaError.DivisionByZero);
    expect(GetDoubleErrorValue(numberAt(3) ?? 0)).toBe(FormulaError.NotAvailable);
    expect(GetDoubleErrorValue(numberAt(4) ?? 0)).toBe(FormulaError.NotAvailable);
    const split = cache?.getCell(5, 0);
    expect(split).toBeInstanceOf(FormulaStringToken);
    expect(text((split as FormulaStringToken).GetString().getString())).toBe("A");
    expect(cache?.getCell(6, 0)).toBeUndefined();
    expect(cache?.getCell(0, 1)).toBeUndefined();
    const sheet = unicode("Workbook");
    try {
      expect(document.InsertTab(0, sheet)).toBe(true);
    } finally {
      sheet.dispose();
    }
    const cloned = decodeCalcDocument(structuredClone(encodeCalcDocument(document)));
    try {
      const archive = await DocumentArchive.open(await exportXlsx(cloned));
      const xml = await archive.readTextEntry("xl/externalLinks/externalLink1.xml");
      expect(xml).toContain('<cell r="A1" t="n"><v>1.5</v></cell>');
      expect(xml).toContain('<cell r="C1" t="e"><v>#DIV/0!</v></cell>');
      expect(xml).toContain('<cell r="D1" t="e"><v>#N/A</v></cell>');
    } finally {
      cloned.Dispose();
    }
  } finally {
    document.Dispose();
  }
});

it("distinguishes missing paths, startup paths, library types and malformed workbook references", /** Exercises the source address reader's admitted external link types. @returns Nothing. */ () => {
  const relationships = new Relations("xl/externalLinks/externalLink1.xml");
  for (const [id, type, target] of [
    ["transitional", OFFICE_DOCUMENT_RELATION + "externalLinkPath", "target.xlsx"],
    ["strict", STRICT_OFFICE_DOCUMENT_RELATION + "externalLinkPath", "target.xlsx"],
    ["empty", STRICT_OFFICE_DOCUMENT_RELATION + "externalLinkPath", ""],
    ["missing", MS_OFFICE_RELATION + "xlExternalLinkPath/xlPathMissing", "target.xlsx"],
    ["startup", MS_OFFICE_RELATION + "xlExternalLinkPath/xlStartup", "target.xlsx"],
    ["library", MS_OFFICE_RELATION + "xlExternalLinkPath/xlLibrary", "custom.xll"],
    ["unknown", OFFICE_DOCUMENT_RELATION + "worksheet", "target.xlsx"],
  ] as const)
    relationships.emplace(id, { maId: id, maType: type, maTarget: target, mbExternal: true });

  const links = new ExternalLinkBuffer();
  for (const id of [
    "transitional",
    "strict",
    "missing",
    "startup",
    "library",
    "unknown",
    "empty",
    "absent",
  ]) {
    links.importExternalReference(id);
    const link = [...links].at(-1);
    link?.importExternalBook(relationships, id);
    link?.importSheetName("Data");
  }
  expect(links.isValidDefinedName("SUM(A1)")).toBe(true);
  expect(links.isValidDefinedName("[0]Data!A1")).toBe(true);
  expect(links.isValidDefinedName("[1]Data!A1")).toBe(true);
  expect(links.isValidDefinedName("['2']Data!A1")).toBe(true);
  expect(links.isValidDefinedName("'[3]Data'!A1")).toBe(true);
  expect(links.isValidDefinedName("[4]Data!A1")).toBe(true);
  for (const index of [5, 6, 7, 8, 9])
    expect(links.isValidDefinedName(`[${index}]Data!A1`)).toBe(false);
  expect(links.getExternalLink(3)?.getType()).toBe("missingDocument");
  expect(links.getExternalLink(4)?.getType()).toBe("missingDocument");
  expect(links.getExternalLink(5)?.getType()).toBe("special");
  expect(links.getExternalLink(5)?.getSheetNames()).toEqual([]);
});

it("omits absent external defined names before using the two-pass native name importer", /** Verifies that an invalid external slot does not prevent an editable workbook from loading. @returns Completion. */ async () => {
  const source = await DocumentArchive.open(readFileSync(data + "sheet-names.xlsx"));
  const writer = new DocumentArchiveWriter();
  for (const path of source.getEntryNames()) {
    if (path === "xl/workbook.xml") {
      const xml = (await source.readTextEntry(path)).replace(
        "</sheets>",
        '</sheets><externalReferences><externalReference r:id="rIdAbsent"/></externalReferences><definedNames><definedName name="InvalidExternal">[1]Data!A1</definedName><definedName name="ValidConstant">12</definedName></definedNames>',
      );
      writer.putNextEntry(path, new TextEncoder().encode(xml));
    } else writer.putNextEntry(path, await source.readEntry(path));
  }
  const doc = await ExcelFilter.importDocument(await writer.finish());
  try {
    expect(doc.GetTableCount()).toBe(5);
    expect(doc.GetRangeName()?.findByUpperName("INVALIDEXTERNAL")).toBeFalsy();
    expect(doc.GetRangeName()?.findByUpperName("VALIDCONSTANT")?.GetSymbol()).toBe("12");
    const exported = await exportXlsx(doc);
    const archive = await DocumentArchive.open(exported);
    const workbook = await archive.readTextEntry("xl/workbook.xml");
    expect(workbook).not.toContain("InvalidExternal");
    expect(workbook).toContain('<definedName name="ValidConstant">12</definedName>');
    const reopened = await ExcelFilter.importDocument(exported);
    try {
      expect(reopened.GetRangeName()?.findByUpperName("VALIDCONSTANT")?.GetSymbol()).toBe("12");
    } finally {
      reopened.Dispose();
    }
  } finally {
    doc.Dispose();
  }
});
