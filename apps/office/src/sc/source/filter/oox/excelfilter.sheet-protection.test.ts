/** @fileoverview Pinned Calc sheet protection regressions through XLSX and the Worker codec. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { ScTableProtectionOption as O } from "../../../inc/tabprotection";
import { ScTableProtection } from "../../core/data/tabprotection";
import {
  encodeCalcDocument,
  decodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ExcelFilter } from "./excelfilter";
import { exportXlsx } from "../excel/xetable";

const worksheet = "xl/worksheets/sheet1.xml";

/** Loads an unchanged upstream fixture. @param name - Workbook name. @returns XLSX package. */
function fixture(name: string): Uint8Array {
  return readFileSync(`../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/${name}.xlsx`);
}

/** Repackages the upstream worksheet with one substituted protection element. @param protection - Replacement protection element. @returns XLSX bytes. */
async function replaceProtection(protection: string): Promise<Uint8Array> {
  const source = await DocumentArchive.open(fixture("ProtecteSheet1234Pass"));
  const output = new DocumentArchiveWriter();
  for (const part of source.getEntryNames()) {
    const bytes =
      part === worksheet
        ? new TextEncoder().encode(
            (await source.readTextEntry(part))?.replace(/<sheetProtection[^>]*\/>/u, protection),
          )
        : await source.readEntry(part);
    output.putNextEntry(part, bytes);
  }
  return output.finish();
}

it("preserves the original 0xcc3d sheet verifier and disallows objects and scenarios", /** Ports testSheetProtectionXLSX and checks the Worker copy. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(fixture("ProtecteSheet1234Pass"));
  const worker = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
  const bytes = await exportXlsx(worker);
  const reloaded = await ExcelFilter.importDocument(bytes);
  try {
    for (const document of [source, worker, reloaded]) {
      const protection = document.GetTabProtection(0);
      expect(document.IsTabProtected(0)).toBe(true);
      expect(protection?.getXlPasswordHash()).toBe(0xcc3d);
      expect(protection?.isOptionEnabled(O.OBJECTS)).toBe(false);
      expect(protection?.isOptionEnabled(O.SCENARIOS)).toBe(false);
      expect(protection?.isOptionEnabled(O.SELECT_LOCKED_CELLS)).toBe(true);
      expect(protection?.isOptionEnabled(O.SELECT_UNLOCKED_CELLS)).toBe(true);
    }
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry(worksheet);
    expect(xml).toContain(
      '<sheetProtection sheet="true" password="cc3d" objects="true" scenarios="true"/>',
    );
  } finally {
    reloaded.Dispose();
    worker.Dispose();
    source.Dispose();
  }
});

it("keeps filter and pivot permissions independent across all four sheets", /** Ports the sheet-protection assertions of testSheetProtections for XLSX. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(fixture("tdfSheetProts"));
  const reloaded = await ExcelFilter.importDocument(await exportXlsx(source));
  try {
    for (const document of [source, reloaded]) {
      expect(
        [0, 1, 2, 3].map(
          /** Reads permissions on one native tab. @param tab - Sheet index. @returns Filter and pivot permissions. */ (
            tab,
          ) => {
            const protection = document.GetTabProtection(tab);
            return [
              protection?.isOptionEnabled(O.AUTOFILTER),
              protection?.isOptionEnabled(O.PIVOT_TABLES),
            ];
          },
        ),
      ).toEqual([
        [true, false],
        [false, true],
        [false, false],
        [true, false],
      ]);
    }
  } finally {
    reloaded.Dispose();
    source.Dispose();
  }
});

it("preserves both OOXML and legacy hash attributes and inverts explicit permission values", /** Covers both hash types and schema defaults across the Worker. @returns Completion. */ async () => {
  const bytes = await replaceProtection(
    '<sheetProtection sheet="1" formatRows="0" insertColumns="false" selectUnlockedCells="1" password="ABCD" algorithmName="SHA-512" hashValue="AQID" saltValue="BAUG" spinCount="100000"/>',
  );
  const source = await ExcelFilter.importDocument(bytes);
  const worker = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
  try {
    const saved = await exportXlsx(worker);
    const xml = await (await DocumentArchive.open(saved)).readTextEntry(worksheet);
    expect(xml).toContain(
      '<sheetProtection algorithmName="SHA-512" hashValue="AQID" saltValue="BAUG" spinCount="100000" sheet="true" password="abcd" formatRows="false" insertColumns="false" selectUnlockedCells="true"/>',
    );
    const protection = worker.GetTabProtection(0);
    expect(protection?.isOptionEnabled(O.FORMAT_ROWS)).toBe(true);
    expect(protection?.isOptionEnabled(O.FORMAT_CELLS)).toBe(false);
    expect(protection?.isOptionEnabled(O.OBJECTS)).toBe(true);
    expect(protection?.isOptionEnabled(O.SELECT_UNLOCKED_CELLS)).toBe(false);
  } finally {
    worker.Dispose();
    source.Dispose();
  }
});

it("omits inactive protection and validates the sheet verifier", /** Covers native false defaults, bounded legacy hashes and modern attributes without a hash. @returns Completion. */ async () => {
  for (const [element, expected] of [
    ['<sheetProtection objects="1" password="10000"/>', null],
    [
      '<sheetProtection sheet="true" password="10000" algorithmName="SHA-512"/>',
      '<sheetProtection sheet="true"/>',
    ],
    [
      '<sheetProtection sheet="true" hashValue="AQID"/>',
      '<sheetProtection hashValue="AQID" sheet="true"/>',
    ],
  ] as const) {
    const doc = await ExcelFilter.importDocument(await replaceProtection(element));
    try {
      expect(doc.IsTabProtected(0)).toBe(expected !== null);
      const xml = await (
        await DocumentArchive.open(await exportXlsx(doc))
      ).readTextEntry(worksheet);
      if (expected) expect(xml).toContain(expected);
      else expect(xml).not.toContain("sheetProtection");
    } finally {
      doc.Dispose();
    }
  }
});

it("copies native table protection and retains settings while disabled", /** Covers independent ownership and the original constructor defaults. @returns Completion. */ async () => {
  const doc = await ExcelFilter.importDocument(fixture("ProtecteSheet1234Pass"));
  try {
    const settings = new ScTableProtection();
    settings.setOption(O.NONE, true);
    expect(settings.isOptionEnabled(O.NONE)).toBe(false);
    settings.setXlPasswordHash(0xcc3d);
    settings.setOoxPasswordHash({
      algorithmName: "SHA-512",
      hashValue: "",
      saltValue: "",
      spinCount: 0,
    });
    expect(settings.getXlPasswordHash()).toBe(0xcc3d);
    settings.setOoxPasswordHash({
      algorithmName: "SHA-512",
      hashValue: "AQID",
      saltValue: "",
      spinCount: 0,
    });
    expect(settings.getXlPasswordHash()).toBe(0);
    settings.setOption(O.OBJECTS, true);
    const table = doc.FetchTable(0);
    table?.SetStreamValid(true);
    doc.SetTabProtection(0, settings);
    expect(table?.IsStreamValid()).toBe(false);
    settings.setProtected(true);
    settings.setOption(O.OBJECTS, false);
    expect(doc.IsTabProtected(0)).toBe(false);
    expect(doc.GetTabProtection(0)?.isOptionEnabled(O.OBJECTS)).toBe(true);
    const worker = decodeCalcDocument(structuredClone(encodeCalcDocument(doc)));
    try {
      expect(worker.IsTabProtected(0)).toBe(false);
      expect(worker.GetTabProtection(0)?.isOptionEnabled(O.OBJECTS)).toBe(true);
    } finally {
      worker.Dispose();
    }
    doc.SetTabProtection(0);
    expect(doc.GetTabProtection(0)).toBeUndefined();
  } finally {
    doc.Dispose();
  }
});
