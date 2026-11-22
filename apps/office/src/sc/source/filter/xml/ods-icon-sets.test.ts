/** @fileoverview Original Calc ODS icon-set formula and matching behavior through native ownership. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScAddress } from "../../../inc/address";
import { ScIconSetFormat, ScIconSetType } from "../../../inc/colorscale";
import { ScConditionMode } from "../../../inc/conditio";
import { ScDocument } from "../../../inc/document";
import { ScXMLImport } from "./xmlimprt";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";

/** Reads an unchanged Calc ODS fixture. @param name - Original filename. @returns Workbook. */
function fixture(name: string): Promise<ScDocument> {
  return readOdsDocument(
    new Uint8Array(
      readFileSync(`../../vendor/libreoffice-reference/sc/qa/unit/data/ods/${name}.ods`),
    ),
  );
}

/** Borrows the original icon set by its native range. @param document - Workbook. @param address - Target cell. @returns Rule. */
function iconAt(document: ScDocument, address: ScAddress): ScIconSetFormat {
  const sheet = document.FetchTable(address.Tab());
  assert(sheet);
  const format = [...sheet.GetCondFormList()].find(
    /** Matches the fixture range. @param candidate - Conditional format. @returns Range match. */ (
      candidate,
    ) => candidate.GetRange().Find(address) !== null,
  );
  const entry = format?.GetEntry(0);
  assert(entry instanceof ScIconSetFormat);
  return entry;
}

it("ports LibreOffice testTdf64401 formula thresholds through Worker and ODS", /** Exercises the original live formulas and round-trip icon selection. @returns Completion. */ async () => {
  const document = await fixture("tdf64401");
  let worker: ScDocument | undefined;
  let saved: ScDocument | undefined;
  try {
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(document)));
    saved = await readOdsDocument(await writeOdsDocument(worker));
    for (const current of [document, worker, saved]) {
      const format = iconAt(current, new ScAddress());
      expect(current.FetchTable(0)?.GetCondFormList().size()).toBe(1);
      for (let row = 0; row < 10; row++)
        expect(format.GetIconSetInfo(new ScAddress(0, row, 0))).toMatchObject({
          eIconSetType: ScIconSetType.IconSet_3Arrows,
          nIconIndex: row >= 7 ? 2 : row >= 3 ? 1 : 0,
        });
      current.SetValue(new ScAddress(1, 3, 0), 2);
      current.SetValue(new ScAddress(1, 4, 0), 9);
      for (let row = 0; row < 10; row++)
        expect(format.GetIconSetInfo(new ScAddress(0, row, 0))?.nIconIndex).toBe(
          row >= 8 ? 2 : row >= 1 ? 1 : 0,
        );
    }
  } finally {
    saved?.Dispose();
    worker?.Dispose();
    document.Dispose();
  }
});

it("ports LibreOffice testTdf101104 and selects the last matching threshold", /** Checks the original workbook with overlapping matches. @returns Completion. */ async () => {
  const document = await fixture("tdf101104");
  try {
    expect(document.FetchTable(0)?.GetCondFormList().size()).toBe(2);
    const format = iconAt(document, new ScAddress(1, 1, 0));
    for (let row = 1; row < 10; row++)
      expect(format.GetIconSetInfo(new ScAddress(1, row, 0))).toMatchObject({
        eIconSetType: ScIconSetType.IconSet_3Arrows,
        nIconIndex: 2,
      });
  } finally {
    document.Dispose();
  }
});

it("retains complete Worker icon settings and preserves native ODS visibility placement", /** Checks native package asymmetry and lossless Worker adoption separately. @returns Completion. */ async () => {
  const document = await fixture("tdf64401");
  let worker: ScDocument | undefined;
  let saved: ScDocument | undefined;
  const position = new ScAddress();
  try {
    const data = iconAt(document, position).GetIconSetData();
    data.mbShowValue = false;
    data.mbReverse = true;
    data.mbCustom = true;
    data.maCustomVector.push(
      [ScIconSetType.IconSet_3Stars, 2],
      [ScIconSetType.IconSet_3Arrows, -1],
    );
    data.m_Entries[0]?.SetMode(ScConditionMode.NotEqual);
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(document)));
    const transferred = iconAt(worker, position).GetIconSetData();
    expect(transferred).toMatchObject({
      mbShowValue: false,
      mbReverse: true,
      mbCustom: true,
      maCustomVector: data.maCustomVector,
    });
    expect(transferred.m_Entries[0]?.GetMode()).toBe(ScConditionMode.NotEqual);
    const bytes = await writeOdsDocument(worker);
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    expect(xml).toContain('calcext:icon-set-type="3Arrows" calcext:custom="true"');
    expect(xml).toContain('calcext:custom-iconset-name="3Stars" calcext:custom-iconset-index="2"');
    expect(xml).toContain('<calcext:formatting-entry calcext:show-value="false"');
    saved = await readOdsDocument(bytes);
    const reopened = iconAt(saved, position).GetIconSetData();
    expect(reopened).toMatchObject({ mbShowValue: true, mbReverse: false, mbCustom: false });
    expect(reopened.m_Entries[0]?.GetMode()).toBe(ScConditionMode.Greater);

    const withParentVisibility = new ScDocument();
    try {
      new ScXMLImport(withParentVisibility).importContent(
        xml.replace(
          'calcext:icon-set-type="3Arrows"',
          'calcext:icon-set-type="3Arrows" calcext:show-value="true"',
        ),
      );
      expect(iconAt(withParentVisibility, position).GetIconSetData().mbShowValue).toBe(false);
    } finally {
      withParentVisibility.Dispose();
    }
  } finally {
    saved?.Dispose();
    worker?.Dispose();
    document.Dispose();
  }
});
