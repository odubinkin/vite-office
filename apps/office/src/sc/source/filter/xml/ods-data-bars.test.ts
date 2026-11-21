/** @fileoverview Calc native data-bar limits, colors and geometry through ODS and the Worker. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScAddress, ScRange } from "../../../inc/address";
import {
  ScAxisPosition as Axis,
  ScColorScaleEntry,
  ScColorScaleEntryType as Type,
  ScDataBarFormat,
} from "../../../inc/colorscale";
import { ScConditionMode } from "../../../inc/conditio";
import type { ScDocument } from "../../../inc/document";
import { readOdsDocument, writeOdsDocument, writeOdsXml } from "./xmlwrap";

/** Reads the original Calc conditional-format test workbook. @returns ODS bytes. */
function fixture(): Uint8Array {
  return new Uint8Array(
    readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/ods/databar.ods"),
  );
}

/** Finds the one data bar in a native conditional range. @param document - Workbook. @param range - Original format range. @returns Native rule. */
function findRule(document: ScDocument, range: ScRange): ScDataBarFormat {
  const sheet = document.FetchTable(range.aStart.Tab());
  assert(sheet);
  const format = [...sheet.GetCondFormList()].find(
    /** Matches the native enclosing range. @param candidate - Format. @returns Range match. */
    (candidate) => candidate.GetRange().Combine().equals(range),
  );
  expect(format?.size()).toBe(1);
  const entry = format?.GetEntry(0);
  assert(entry instanceof ScDataBarFormat);
  return entry;
}

it("preserves the data-bar rules from LibreOffice testDataBarODS and testDataBarExportODS", /** Ports the native range and limit assertions and checks Worker formula adoption. @returns Completion. */ async () => {
  const original = await readOdsDocument(fixture());
  let restored: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  try {
    restored = decodeCalcDocument(structuredClone(encodeCalcDocument(original)));
    const bytes = await writeOdsDocument(restored);
    const content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    expect(content).toContain('calcext:type="auto-maximum"');
    expect(content).toContain('calcext:axis-position="middle"');
    expect(content).toContain('calcext:negative-color="#ffff00"');
    reopened = await readOdsDocument(bytes);
    for (const document of [original, restored, reopened]) {
      for (const [range, lower, upper, axis] of [
        [new ScRange(1, 2, 0, 1, 5, 0), Type.AUTO, Type.AUTO, Axis.AUTOMATIC],
        [new ScRange(3, 2, 0, 3, 5, 0), Type.MIN, Type.MAX, Axis.AUTOMATIC],
        [new ScRange(5, 2, 0, 5, 5, 0), Type.PERCENTILE, Type.PERCENT, Axis.AUTOMATIC],
        [new ScRange(7, 2, 0, 7, 5, 0), Type.VALUE, Type.FORMULA, Axis.AUTOMATIC],
        [new ScRange(1, 9, 0, 1, 12, 0), Type.AUTO, Type.AUTO, Axis.MIDDLE],
      ] as const) {
        const data = findRule(document, range).GetDataBarData();
        expect(data.mpLowerLimit.GetType()).toBe(lower);
        expect(data.mpUpperLimit.GetType()).toBe(upper);
        expect(data.meAxisPosition).toBe(axis);
      }
      const rule = findRule(document, new ScRange(7, 2, 0, 7, 5, 0));
      expect(rule.GetDataBarData().mpUpperLimit.GetValue()).toBe(5);
      document.SetValue(new ScAddress(0, 0, 0), 2);
      expect(rule.GetDataBarData().mpUpperLimit.GetValue()).toBe(8);
      const axis = findRule(document, new ScRange(1, 9, 0, 1, 12, 0));
      expect(axis.GetDataBarData().maAxisColor.toUInt32()).toBe(0x000080);
    }
  } finally {
    reopened?.Dispose();
    restored?.Dispose();
    original.Dispose();
  }
});

it("applies native length calculations for automatic, centered and absent axes", /** Ports representative lengths from the native core data-bar tests. @returns Completion. */ async () => {
  const document = await readOdsDocument(fixture());
  try {
    const range = new ScRange(1, 2, 0, 1, 5, 0);
    const bar = findRule(document, range);
    const data = bar.GetDataBarData();
    const position = range.aStart;
    data.mpLowerLimit = new ScColorScaleEntry(-4);
    data.mpUpperLimit = new ScColorScaleEntry(8);
    document.SetValue(position, -3);
    expect(bar.GetDataBarInfo(position)?.mnZero).toBeCloseTo(100 / 3);
    expect(bar.GetDataBarInfo(position)?.mnLength).toBe(-75);
    expect(bar.GetDataBarInfo(position)?.maColor.toUInt32()).toBe(0xff0000);

    data.meAxisPosition = Axis.MIDDLE;
    expect(bar.GetDataBarInfo(position)).toMatchObject({ mnZero: 50, mnLength: -37.5 });
    document.SetValue(position, 3);
    expect(bar.GetDataBarInfo(position)?.maColor.toUInt32()).toBe(0x0000ff);
    data.meAxisPosition = Axis.NONE;
    data.mnMinLength = 10;
    data.mnMaxLength = 70;
    data.mbOnlyBar = true;
    expect(bar.GetDataBarInfo(position)).toMatchObject({
      mnZero: 0,
      mnLength: 45,
      mbShowValue: false,
    });
    expect(bar.GetDataBarInfo(new ScAddress(0, 1, 0))).toBeUndefined();
  } finally {
    document.Dispose();
  }
});

it("reads legacy entries and rewrites ODF data-bar defaults", /** Covers the current native output, length fallbacks and native equality. @returns Completion. */ async () => {
  const original = await readOdsDocument(fixture());
  let document: ScDocument | undefined;
  try {
    const ods = await writeOdsXml(original);
    const xml = ods.files["content.xml"];
    assert(typeof xml === "string");
    const withLegacy = xml.replace(
      /<calcext:data-bar\b[^>]*>[\s\S]*?<\/calcext:data-bar>/u,
      '<calcext:data-bar calcext:gradient="false" calcext:show-value="false" calcext:axis-position="none" calcext:min-length="12.5" calcext:max-length="0" calcext:positive-color="#gggggg"><calcext:data-bar-entry calcext:type="percent" calcext:value="12" calcext:greater_equal="false"/></calcext:data-bar>',
    );
    expect(withLegacy).not.toBe(xml);
    document = await readOdsDocument({
      ...ods,
      files: { ...ods.files, "content.xml": withLegacy },
    });
    const bar = findRule(document, new ScRange(1, 2, 0, 1, 5, 0));
    const data = bar.GetDataBarData();
    expect(data).toMatchObject({
      mbOnlyBar: true,
      mbGradient: false,
      mbNeg: false,
      meAxisPosition: Axis.NONE,
      mnMinLength: 12.5,
      mnMaxLength: 100,
    });
    expect(data.maPositiveColor.toUInt32()).toBe(0xffffffff);
    expect(data.mpLowerLimit.GetMode()).toBe(ScConditionMode.Greater);
    expect(data.mpUpperLimit.GetType()).toBe(Type.VALUE);
    const clone = bar.Clone(document);
    try {
      clone.GetDataBarData().mpLowerLimit = new ScColorScaleEntry(77, undefined, Type.FORMULA);
      clone.GetDataBarData().mnMinLength = 2;
      expect(bar.IsEqual(clone)).toBe(true);
    } finally {
      clone.Dispose();
    }
    const exported = (await writeOdsXml(document)).files["content.xml"];
    expect(exported).not.toContain("calcext:data-bar-entry");
    expect(exported).toContain('calcext:max-length="100"');
    expect(exported).toContain('calcext:min-length="12.5"');
    expect(exported).toContain('calcext:positive-color="#ffffff"');
  } finally {
    document?.Dispose();
    original.Dispose();
  }
});
