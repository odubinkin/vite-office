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

const data = "../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/";

it("loads the pinned external workbook relationships and sheet keys in original reference order", /** Exercises OPC traversal on the unchanged workbook from the upstream import regression. @returns Completion. */ async () => {
  const storage = await ZipStorage.openForImport(readFileSync(data + "tdf130959.xlsx"), "calc");
  try {
    const filter = new XmlFilterBase(storage);
    const main = await filter.getFragmentPathFromFirstTypeFromOfficeDoc("officeDocument");
    const workbook = new WorkbookFragment(filter, main);
    expect(await filter.importFragment(workbook)).toBe(true);
    await importExternalLinkFragments(
      filter,
      await workbook.getRelations(),
      workbook.externalLinks,
    );
    const [first, second] = workbook.externalLinks;
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
    expect(workbook.externalLinks.isValidDefinedName("[1]Referens!$A$1")).toBe(true);
    expect(
      workbook.externalLinks.isValidDefinedName("'[2]Grunduppgifter - Client info'!$A$1"),
    ).toBe(true);
    expect(workbook.externalLinks.isValidDefinedName("[3]Referens!$A$1")).toBe(false);
  } finally {
    storage.dispose();
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
