/** @fileoverview Pinned ODF sheet protection, XLSX conversion and Worker round trips. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { ScPasswordHash as H, ScTableProtectionOption as O } from "../../../inc/tabprotection";
import { ScDocument } from "../../../inc/document";
import { ScXMLImport } from "./xmlimprt";
import { needsOdfPasswordHashRegen } from "./xmlexprt.protection";
import { readOdsDocument, writeOdsDocument, writeOdsXml } from "./xmlwrap";
import { ExcelFilter } from "../oox/excelfilter";
import { exportXlsx } from "../excel/xetable";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { encodeCalcDocument } from "../../../browser/filter/xml/calc-document-codec";
import { processOdsWorkerRequest } from "../../../browser/filter/xml/ods-worker-runtime";
import type { XmlPackage } from "../../../../svl/source/misc/storage";

/** Reads an unchanged upstream fixture. @param filename - Fixture path beneath data. @returns Package. */
function fixture(filename: string): Uint8Array {
  return new Uint8Array(
    readFileSync(`../../vendor/libreoffice-reference/sc/qa/unit/data/${filename}`),
  );
}

/** Imports minimal ODF content with real table-level source attributes. @param sheets - Sheet elements. @returns Workbook. */
function readSheets(sheets: string): ScDocument {
  const document = new ScDocument();
  new ScXMLImport(document).importContent(
    `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:officeooo="http://openoffice.org/2009/office"><office:body><office:spreadsheet>${sheets}</office:spreadsheet></office:body></office:document-content>`,
  );
  return document;
}

it("keeps the upstream ODS selection restrictions after saving and reopening", /** Ports testSheetProtectionODS from subsequent_export_test3. @returns Completion. */ async () => {
  const source = await readOdsDocument(fixture("ods/sheet-protection.ods"));
  const reloaded = await readOdsDocument(await writeOdsDocument(source));
  try {
    for (const doc of [source, reloaded]) {
      expect(doc.IsTabProtected(0)).toBe(true);
      expect(doc.GetTabProtection(0)?.isOptionEnabled(O.SELECT_LOCKED_CELLS)).toBe(false);
      expect(doc.GetTabProtection(0)?.isOptionEnabled(O.SELECT_UNLOCKED_CELLS)).toBe(true);
    }
  } finally {
    reloaded.Dispose();
    source.Dispose();
  }
});

it("keeps the four upstream filter and pivot permissions after XLSX to ODS conversion", /** Ports the ODS leg of testSheetProtections for its protection assertions. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(fixture("xlsx/tdfSheetProts.xlsx"));
  const xml = await processOdsWorkerRequest({
    id: 1,
    operation: "export-xml",
    document: structuredClone(encodeCalcDocument(source)),
  });
  const reloaded = await readOdsDocument(xml as XmlPackage);
  try {
    for (const [tab, autofilter, pivot] of [
      [0, true, false],
      [1, false, true],
      [2, false, false],
      [3, true, false],
    ] as const) {
      expect(reloaded.IsTabProtected(tab)).toBe(true);
      expect(reloaded.GetTabProtection(tab)?.isOptionEnabled(O.AUTOFILTER)).toBe(autofilter);
      expect(reloaded.GetTabProtection(tab)?.isOptionEnabled(O.PIVOT_TABLES)).toBe(pivot);
    }
  } finally {
    reloaded.Dispose();
    source.Dispose();
  }
});

it("encodes the pinned Excel verifier as a native double hash and retains that digest on another save", /** Checks the exact legacy SHA-1 digest and Worker transport of ODF verifier bytes. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(fixture("xlsx/ProtecteSheet1234Pass.xlsx"));
  const first = await writeOdsXml(source);
  const reopened = await readOdsDocument(first);
  try {
    const next = await processOdsWorkerRequest({
      id: 1,
      operation: "export-xml",
      document: structuredClone(encodeCalcDocument(reopened)),
    });
    for (const result of [first, next as XmlPackage]) {
      const content = result.files["content.xml"];
      expect(content).toContain('table:protection-key="ibbcz2WONDGApdl1540bfATbEDc="');
      expect(content).toContain(
        'table:protection-key-digest-algorithm="http://docs.oasis-open.org/office/ns/table/legacy-hash-excel"',
      );
      expect(content).toContain(
        'loext:protection-key-digest-algorithm-2="http://www.w3.org/2000/09/xmldsig#sha1"',
      );
    }
    expect(reopened.GetTabProtection(0)?.getStoredPasswordHash()).toMatchObject({
      primary: H.XL,
      secondary: H.SHA1,
    });
    const xlsx = await DocumentArchive.open(await exportXlsx(reopened));
    const sheet = await xlsx.readTextEntry("xl/worksheets/sheet1.xml");
    expect(sheet).toContain('<sheetProtection sheet="true"');
    expect(sheet).not.toContain('password="');
  } finally {
    reopened.Dispose();
    source.Dispose();
  }
});

it("retains unrecognized digest bytes and rejects a save that cannot preserve them", /** Exercises native unspecified hash metadata. @returns Completion. */ async () => {
  const source = readSheets(
    '<table:table table:name="Hash" table:protected="true" table:protection-key="YQ==" table:protection-key-digest-algorithm="urn:unknown-digest"/>',
  );
  try {
    expect(source.GetTabProtection(0)?.getStoredPasswordHash()).toEqual({
      bytes: Uint8Array.of(97),
      primary: H.UNSPECIFIED,
      secondary: H.UNSPECIFIED,
    });
    expect(needsOdfPasswordHashRegen(source)).toBe(true);
    await expect(writeOdsXml(source)).rejects.toThrow("re-entering");
  } finally {
    source.Dispose();
  }
});

it("uses the default digest URI, retains the original selection default and accepts the old office extension", /** Verifies default hash URI, native Base64 lexical behavior and older namespace routing. @returns Completion. */ async () => {
  const source = readSheets(
    '<table:table table:name="A" table:protected="true" table:protection-key="`AAA"/><table:table table:name="B" table:protected="true"><officeooo:table-protection officeooo:select-unprotected-cells="true"/></table:table><table:table table:name="C" table:protected="false"><table:table-protection/></table:table>',
  );
  try {
    expect(source.GetTabProtection(0)?.getStoredPasswordHash()).toEqual({
      bytes: Uint8Array.of(0, 0, 0),
      primary: H.SHA1,
      secondary: H.UNSPECIFIED,
    });
    expect(source.GetTabProtection(0)?.isOptionEnabled(O.SELECT_LOCKED_CELLS)).toBe(true);
    expect(source.GetTabProtection(1)?.isOptionEnabled(O.SELECT_LOCKED_CELLS)).toBe(false);
    expect(source.GetTabProtection(1)?.isOptionEnabled(O.SELECT_UNLOCKED_CELLS)).toBe(true);
    expect(source.GetTabProtection(2)).toBeUndefined();
    const content = (await writeOdsXml(source)).files["content.xml"];
    expect(content).toContain(
      'table:protection-key="AAAA" table:protection-key-digest-algorithm="http://www.w3.org/2000/09/xmldsig#sha1"',
    );
  } finally {
    source.Dispose();
  }
});

it("normalizes the SHA-256 URI and uses the native workbook-wide retyping check for mixed families", /** Checks the native SaveAs compatibility condition and leaves source hashes intact. @returns Completion. */ async () => {
  const sha256 =
    '<table:table table:name="A" table:protected="true" table:protection-key="AQID" table:protection-key-digest-algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>';
  const one = readSheets(sha256);
  const mixed = readSheets(
    sha256 + '<table:table table:name="B" table:protected="true" table:protection-key="BAUG"/>',
  );
  try {
    const xml = await writeOdsXml(one);
    expect(xml.files["content.xml"]).toContain(
      'table:protection-key="AQID" table:protection-key-digest-algorithm="http://www.w3.org/2000/09/xmldsig#sha256"',
    );
    const reloaded = await readOdsDocument(xml);
    try {
      expect(reloaded.GetTabProtection(0)?.hasPasswordHash(H.SHA256)).toBe(true);
    } finally {
      reloaded.Dispose();
    }
    expect(needsOdfPasswordHashRegen(mixed)).toBe(true);
    await expect(writeOdsXml(mixed)).rejects.toThrow("re-entering");
    expect(mixed.GetTabProtection(0)?.getStoredPasswordHash()?.primary).toBe(H.SHA256);
    expect(mixed.GetTabProtection(1)?.getStoredPasswordHash()?.primary).toBe(H.SHA1);
  } finally {
    mixed.Dispose();
    one.Dispose();
  }
});
