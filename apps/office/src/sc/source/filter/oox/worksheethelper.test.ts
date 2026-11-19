/** @fileoverview Worksheet model geometry over actual upstream XLSX inputs and native Calc tables. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { CRFlags } from "../../../inc/global";
import { Font } from "../../../../vcl/source/font/font";
import { ATTR_FONT_HEIGHT } from "../../../inc/scitems";
import type { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { ScOutlineArray, SC_OL_MAXDEPTH } from "../../core/data/olinetab";
import { XclExpOutlineBuffer } from "../excel/xetable.outline";
import { exportXlsx } from "../excel/xetable";
import { readOdsDocument, writeOdsDocument } from "../xml/xmlwrap";
import { ExcelFilter } from "./excelfilter";
import { UnitConverter, type XlsxReferenceDevice } from "./unitconverter";
import { WorksheetGlobals } from "./worksheethelper";

/** Reads an original workbook from the pinned Calc corpus. @param name - Filename without extension. @returns XLSX bytes. */
function fixture(name: string): Uint8Array {
  return new Uint8Array(
    readFileSync(`../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/${name}.xlsx`),
  );
}

const device: XlsxReferenceDevice = {
  screenPixelTwips: 15,
  /** Supplies a deterministic reference device whose widest digit is 105 twips. @param font - Actual workbook font. @param digit - Single character. @returns Advance. */
  measureTextWidth(font, digit) {
    expect(font.GetFontHeight()).toBeGreaterThan(0);
    return digit === "8" ? 105 : 100;
  },
};

it("uses the native fallback coefficients when the reference device has no digit advance", /** Covers the same unavailable-measurement path as original UnitConverter. @returns Nothing. */ () => {
  const font = new Font();
  const unavailable: XlsxReferenceDevice = {
    screenPixelTwips: 0,
    /** Reports an invalid width from a missing device font. @returns Unavailable width. */
    measureTextWidth: () => Number.NaN,
  };
  const units = new UnitConverter(font, unavailable);
  expect(units.twipsPerDigit).toBeCloseTo(113.38582677);
  expect(units.twipsPerScreenPixel).toBeCloseTo(28.34645669);
});

it.each([
  ["tdf144642_RowHeight_10mm_SavedByCalc", 567, 300],
  ["tdf144642_RowHeight_28.35pt_SavedByExcel", 555, 300],
  ["tdf145129_DefaultRowHeight_28.35pt_SavedByExcel", 555, 555],
])(
  "preserves the source row-height rounding for %s",
  /** Ports the three upstream Excel generator and default-height regressions. @param name - Source fixture. @param first - First row twips. @param tail - Default tail twips. @returns Completion. */ async (
    name,
    first,
    tail,
  ) => {
    const workbook = await ExcelFilter.importDocument(fixture(name));
    let copy: ScDocument | undefined;
    try {
      copy = await ExcelFilter.importDocument(await exportXlsx(workbook));
      for (const document of [workbook, copy]) {
        expect(document.GetRowHeight(0, 0)).toBe(first);
        expect(document.FetchTable(0)?.GetRowHeight(0, 25, true)).toBe(first * 26);
        expect(document.GetRowHeight(document.MaxRow(), 0)).toBe(tail);
      }
    } finally {
      copy?.Dispose();
      workbook.Dispose();
    }
  },
);

it("keeps the five nondefault widths in the original Excel fixture", /** Adapts testColumnWidthResaveXLSX with a deterministic measurement boundary. @returns Completion. */ async () => {
  const normalDevice: XlsxReferenceDevice = {
    screenPixelTwips: 15,
    /** Distinguishes the fixture's 11-point Normal font from the blank document font. @param font - Original font. @param digit - Source digit. @returns Advance in twips. */
    measureTextWidth(font, digit) {
      return font.GetFontHeight() === 220 ? device.measureTextWidth(font, digit) : 90;
    },
  };
  const workbook = await ExcelFilter.importDocument(
    fixture("different-column-width-excel2010"),
    normalDevice,
  );
  let ods: ScDocument | undefined, copy: ScDocument | undefined;
  try {
    const primary = await writeOdsDocument(workbook);
    const styles = await (await DocumentArchive.open(primary)).readTextEntry("styles.xml");
    expect(styles).toContain('<style:style style:name="Default" style:family="table-cell"');
    expect(styles).toContain('fo:font-size="11pt"');
    ods = await readOdsDocument(primary);
    const bytes = await exportXlsx(ods, normalDevice);
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry("xl/worksheets/sheet1.xml");
    const widthRecords = [
      ...xml.matchAll(
        /<col min="(\d+)" max="\d+" style="\d+" width="([\d.]+)" customWidth="true"/g,
      ),
    ];
    expect(
      widthRecords.map(
        /** Reads exact column and width attributes. @param value - Match. @returns Column and width. */
        (value) => [Number(value[1]), Number(value[2])],
      ),
    ).toEqual([
      [1, 24],
      [2, 12],
      [3, 6],
      [4, 1],
      [5, 250],
    ]);
    copy = await ExcelFilter.importDocument(bytes, normalDevice);
    for (const document of [workbook, ods, copy]) {
      const style = document.GetStyleSheetPool()?.GetDefaultStyle();
      const font = style?.GetItemSet().Get(ATTR_FONT_HEIGHT) as SvxFontHeightItem;
      expect(font.GetHeight()).toBe(220);
      for (const [column, width] of [24, 12, 6, 1, 250].entries())
        expect(document.GetColWidth(column, 0, false)).toBe(width * 105);
    }
  } finally {
    copy?.Dispose();
    ods?.Dispose();
    workbook.Dispose();
  }
});

it("preserves distributed row heights and the default tail from miscrowheights.xlsx", /** Adapts testMiscRowHeightExport to check native twips and XLSX row compression. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(fixture("miscrowheights"));
  let copy: ScDocument | undefined;
  try {
    copy = await ExcelFilter.importDocument(await exportXlsx(source));
    for (const document of [source, copy]) {
      const sheet = document.FetchTable(0);
      assert(sheet);
      expect(sheet.GetRowHeight(0, 4)).toBe(300 * 5);
      expect(sheet.GetRowHeight(5, 10)).toBe(600 * 6);
      expect(sheet.GetRowHeight(17, 20)).toBe(990 * 4);
      expect(sheet.GetRowHeight(1048573, 1048575)).toBe(300 * 3);
    }
  } finally {
    copy?.Dispose();
    source.Dispose();
  }
});

it("exports geometry-only rows and preserves hidden dimensions through XLSX and ODS", /** Keeps row visibility independent of height and of the cell iterator. @returns Completion. */ async () => {
  const document = new ScDocument();
  const name = unicode("Geometry");
  let xlsx: ScDocument | undefined, ods: ScDocument | undefined;
  try {
    document.InsertTab(0, name);
    const table = document.FetchTable(0);
    assert(table);
    table.SetRowHeightOnly(0, document.MaxRow(), 300);
    table.SetOptimalMinRowHeight(300);
    table.SetRowHidden(0, document.MaxRow(), true);
    table.SetRowHidden(2, 3, false);
    table.SetRowHeightOnly(2, 2, 640);
    table.SetManualHeight(2, 2, true);
    table.SetRowHeightOnly(4999, 4999, 580);
    table.SetColWidthOnly(2, 2100);
    table.SetColHidden(2, 2, true);
    document.SetValue(new ScAddress(0, 3, 0), 42);
    const bytes = await exportXlsx(document, device);
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry("xl/worksheets/sheet1.xml");
    expect(xml).toMatch(/<sheetFormatPr[^>]*defaultRowHeight="15"[^>]*zeroHeight="true"/);
    expect(xml).toContain(
      '<row r="3" ht="32" hidden="false" customHeight="true" outlineLevel="0" collapsed="false"></row>',
    );
    expect(xml).toContain(
      '<row r="5000" ht="29" hidden="true" customHeight="false" outlineLevel="0" collapsed="false"></row>',
    );
    xlsx = await ExcelFilter.importDocument(bytes, device);
    ods = await readOdsDocument(await writeOdsDocument(xlsx));
    for (const copy of [xlsx, ods]) {
      const sheet = copy.FetchTable(0);
      assert(sheet);
      expect(copy.GetValue(new ScAddress(0, 3, 0))).toBe(42);
      expect(copy.GetRowHeight(0, 0)).toBe(0);
      expect(copy.GetRowHeight(2, 0)).toBe(640);
      expect(copy.GetRowHeight(4999, 0, false)).toBe(580);
      expect(copy.GetRowHeight(copy.MaxRow(), 0, false)).toBe(300);
      expect(sheet.GetRowFlagsRange(2).maValue & CRFlags.ManualSize).toBeTruthy();
      expect(copy.GetColWidth(2, 0)).toBe(0);
      expect(copy.GetColWidth(2, 0, false)).toBe(2100);
    }
  } finally {
    name.dispose();
    ods?.Dispose();
    xlsx?.Dispose();
    document.Dispose();
  }
});

it("fills default spans and clips or discards overlapping dimension records", /** Pins source first-definition precedence including gaps and absent explicit height. @returns Nothing. */ () => {
  const document = new ScDocument();
  const name = unicode("Geometry");
  try {
    document.InsertTab(0, name);
    const table = document.FetchTable(0);
    assert(table);
    const geometry = new WorksheetGlobals(table, false, new UnitConverter(undefined, device));
    geometry.setDefaultColumnWidth(8, 9);
    geometry.setDefaultColumnWidth(11, 0);
    geometry.setDefaultRowSettings(15, true, true);
    expect(geometry.setColumnModel(6, 8, 10, true)).not.toBeNull();
    expect(geometry.setColumnModel(5, 8, 10, false)?.last).toBe(5);
    expect(geometry.setColumnModel(6, 7, 12, false)).toBeNull();
    expect(geometry.setColumnModel(-1, 2, 10, false)).toBeNull();
    expect(geometry.setColumnModel(4, 2, 10, false)).toBeNull();
    geometry.setColumnModel(document.MaxCol(), document.MaxCol() + 2, 0, false);
    geometry.setRowModel(4, -1, false, false);
    geometry.setRowModel(4, 25, false, true);
    geometry.setRowModel(document.MaxRow() + 1, 25, false, true);
    geometry.finalizeImport();
    expect(table.GetColWidth(0)).toBe(1020);
    expect(table.GetColWidth(5)).toBe(1134);
    expect(table.GetColWidth(document.MaxCol())).toBe(1280);
    expect(table.ColHidden(6)).toBe(true);
    expect(table.GetRowHeight(4)).toBe(300);
    expect(table.GetRowHeight(3)).toBe(0);
    expect(table.GetRowFlagsRange(4).maValue & CRFlags.ManualSize).toBeFalsy();
    expect(table.GetRowFlagsRange(5).maValue & CRFlags.ManualSize).toBeTruthy();
  } finally {
    name.dispose();
    document.Dispose();
  }
});

it("keeps the four outline levels and hidden widths from LibreOffice outline.ods", /** Adapts testOutlineExportXLSX and verifies the browser's ODS persistence path. @returns Completion. */ async () => {
  const fixture = new Uint8Array(
    readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/ods/outline.ods"),
  );
  const original = await readOdsDocument(fixture);
  let reopened: ScDocument | undefined, primary: ScDocument | undefined;
  try {
    const sheet = original.FetchTable(0);
    assert(sheet);
    const groups = sheet.GetOutlineTable();
    assert(groups);
    expect(groups.GetRowArray().GetDepth()).toBe(4);
    expect(groups.GetColArray().GetDepth()).toBe(4);

    const output = await exportXlsx(original, device);
    const xml = await (
      await DocumentArchive.open(output)
    ).readTextEntry("xl/worksheets/sheet1.xml");
    const worksheet = new DOMParser().parseFromString(xml, "application/xml");
    const format = worksheet.getElementsByTagName("sheetFormatPr")[0];
    expect(format?.getAttribute("outlineLevelRow")).toBe("4");
    expect(format?.getAttribute("outlineLevelCol")).toBe("4");
    const rows = [...worksheet.getElementsByTagName("row")];
    expect(rows).toHaveLength(29);
    expect(rows[0]?.getAttribute("r")).toBe("2");
    expect(rows[20]?.getAttribute("r")).toBe("22");
    expect(rows[20]?.getAttribute("collapsed")).toBe("true");
    expect(rows[20]?.getAttribute("outlineLevel")).toBe("3");
    const columns = [...worksheet.getElementsByTagName("col")].map(
      /** Reads original column attributes. @param column - Column record. @returns Span and state. */
      (column) =>
        ["min", "max", "outlineLevel", "collapsed", "hidden"].map(
          /** Reads a single worksheet attribute. @param attribute - XML name. @returns Value. */
          (attribute) => column.getAttribute(attribute),
        ),
    );
    expect(columns).toEqual([
      ["1", "2", "1", "false", "false"],
      ["3", "3", "2", "false", "true"],
      ["4", "4", "2", "false", "true"],
      ["5", "6", "3", "false", "true"],
      ["7", "7", "4", "false", "true"],
      ["8", "8", "4", "false", "true"],
      ["9", "19", "4", "false", "true"],
      ["20", "20", "3", "true", "true"],
      ["21", "21", "3", "false", "true"],
      ["22", "23", "2", "false", "true"],
      ["24", "24", "1", "true", "false"],
      ["25", "26", "1", "false", "false"],
    ]);
    reopened = await ExcelFilter.importDocument(output, device);
    primary = await readOdsDocument(await writeOdsDocument(reopened));
    for (const doc of [reopened, primary]) {
      const copy = doc.FetchTable(0);
      assert(copy);
      const outline = copy.GetOutlineTable();
      expect(outline?.GetColArray().GetEntryByPos(3, 7)?.hidden).toBe(true);
      expect(outline?.GetRowArray().GetDepth()).toBe(4);
      expect(
        Math.abs(copy.GetColWidth(3, false) - sheet.GetColWidth(3, false)),
      ).toBeLessThanOrEqual(2);
      expect(copy.ColHidden(3)).toBe(true);
    }
  } finally {
    primary?.Dispose();
    reopened?.Dispose();
    original.Dispose();
  }
});

it("matches the native insertion and outline exporter boundary rules", /** Covers crossed ranges, depth admission and the upstream collapsed-cache edges. @returns Nothing. */ () => {
  const outline = new ScOutlineArray();
  expect(outline.Insert(5, 4)).toBeUndefined();
  const inner = outline.Insert(2, 4, true);
  assert(inner);
  const outer = outline.Insert(1, 6, true);
  assert(outer);
  outline.SetVisibleBelow(0, outer, false);
  expect(inner.visible).toBe(false);
  expect(outline.FindTouchedLevel(5, 2)).toBe(1);
  expect(outline.Insert(4, 8)).toBeUndefined();
  const buffer = new XclExpOutlineBuffer(outline, 20);
  expect(buffer.GetRange(5)).toMatchObject({ level: 1, collapsed: true });
  expect(buffer.GetRange(6)).toMatchObject({ level: 1, collapsed: false });
  expect(buffer.GetRange(7)).toMatchObject({ level: 0, collapsed: false });

  const fromZero = new ScOutlineArray();
  fromZero.Insert(0, 3, true);
  fromZero.Insert(0, 7);
  expect(new XclExpOutlineBuffer(fromZero, 20).GetRange(4).collapsed).toBe(false);

  const atLimit = new ScOutlineArray();
  for (let index = 0; index < SC_OL_MAXDEPTH; index++)
    expect(atLimit.Insert(index, 20 - index)).toBeDefined();
  expect(atLimit.Insert(7, 13)).toBeUndefined();
  expect(atLimit.Insert(0, 20)).toBeUndefined();
  expect(atLimit.GetDepth()).toBe(SC_OL_MAXDEPTH);

  outline.finalizeImport(
    /** Resolves the native end of the actually hidden detail. @param start - Group start. @returns Last hidden row. */
    (start) => (start === 2 ? 4 : -1),
  );
  expect(outer.hidden).toBe(false);
  expect(inner.hidden).toBe(true);
  expect(inner.visible).toBe(true);
});

it("updates only the visible descendant paths of a reconciled ODS group", /** Separates hidden descendants, visible children and unrelated group branches. @returns Nothing. */ () => {
  const outline = new ScOutlineArray();
  const parent = outline.Insert(2, 12, true);
  const child = outline.Insert(2, 7);
  const nested = outline.Insert(3, 5);
  const sibling = outline.Insert(15, 18);
  const unrelated = outline.Insert(16, 17);
  assert(parent && child && nested && sibling && unrelated);
  expect(outline.FindTouchedLevel(30, 40)).toBeUndefined();
  outline.SetVisibleBelow(0, parent, false);
  expect(nested.visible).toBe(false);
  expect(unrelated.visible).toBe(true);
  outline.finalizeImport(
    /** Returns a partially hidden parent. @returns Hidden endpoint. */ () => 3,
  );
  expect(parent.hidden).toBe(false);
  expect(child.visible).toBe(true);
  expect(nested.visible).toBe(true);
  expect(outline.Insert(2, 10)).toBeDefined();
  expect(outline.GetEntryByPos(3, 4)).toBe(nested);
});

it("preserves the two-axis hide-detail operation for the source row marker", /** Checks CALC704 on native table and group owners. @returns Nothing. */ () => {
  const document = new ScDocument();
  const name = unicode("Outline");
  try {
    document.InsertTab(0, name);
    const sheet = document.FetchTable(0);
    assert(sheet);
    const geometry = new WorksheetGlobals(sheet, false, new UnitConverter());
    geometry.setColumnModel(0, 1, 8, false, 1);
    geometry.setRowModel(2, 15, false, false, 1);
    geometry.setRowModel(3, 15, false, false, 0, true);
    geometry.finalizeImport();
    expect(sheet.GetOutlineTable()?.GetRowArray().GetEntryByPos(0, 2)?.hidden).toBe(true);
    expect(sheet.GetOutlineTable()?.GetColArray().GetEntryByPos(0, 0)?.hidden).toBe(true);
    expect(sheet.RowHidden(2)).toBe(true);
    expect(sheet.ColHidden(0)).toBe(true);
  } finally {
    name.dispose();
    document.Dispose();
  }
});
