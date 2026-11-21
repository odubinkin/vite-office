/** @fileoverview Calc active view across XLSX, native view data, the Worker and ODS settings. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { COL_AUTO } from "../../../../tools/inc/color";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { exportXlsx } from "../../filter/excel/xetable";
import { ExcelFilter } from "../../filter/oox/excelfilter";
import { readOdsDocument, writeOdsXml } from "../../filter/xml/xmlwrap";
import { ReadUserDataSequence, WriteUserDataSequence } from "./viewdata.settings";
import type { ScDocument } from "../../../inc/document";
import { ScGridOptions, ScViewOptions, ViewOption } from "../../../inc/viewopti";
import { ScViewData } from "./viewdata";
import { ScExtDocOptions } from "./scextopt";
import { MAXCOL, MAXROW, ScRange } from "../../../inc/address";
import { ScDocShell } from "../docshell/docsh";
import { ScTabViewShell } from "./tabvwsh4";
import {
  getSheetCursor,
  getSheetPaneLayout,
  getSheetTabSelected,
  setSheetTabSelected,
  SheetPane,
  SheetSplitMode,
} from "../../core/data/document.sheet-visibility";

/** Reads an unchanged pinned LibreOffice fixture. @param name - Reference path under Calc unit data. @returns Bytes. */
function fixture(name: string): Uint8Array {
  return new Uint8Array(readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/" + name));
}

it("preserves the native ODS drawing grid through import, Worker and export", /** Uses the settings of LibreOffice's ManualColWidthRowHeight workbook. @returns Completion. */ async () => {
  const source = await readOdsDocument(fixture("ods/ManualColWidthRowHeight.ods"));
  const transferred = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
  let reopened: ScDocument | undefined;
  try {
    const originalGrid = source.GetViewOptions().GetGridOptions();
    expect(originalGrid.GetFieldDrawX()).toBe(500);
    expect(originalGrid.GetFieldDrawY()).toBe(500);
    expect(originalGrid.GetFieldDivisionX()).toBe(4);
    expect(originalGrid.GetFieldDivisionY()).toBe(4);
    expect(originalGrid.GetUseGridSnap()).toBe(true);
    expect(originalGrid.GetGridVisible()).toBe(true);
    expect(originalGrid.GetSynchronize()).toBe(false);
    expect(transferred.GetViewOptions().GetGridOptions().equals(originalGrid)).toBe(true);

    const exported = await writeOdsXml(transferred);
    expect(exported.files["settings.xml"]).toContain(
      '<config:config-item config:name="RasterResolutionX" config:type="int">500</config:config-item>',
    );
    reopened = await readOdsDocument(exported);
    expect(reopened.GetViewOptions().GetGridOptions().equals(originalGrid)).toBe(true);
  } finally {
    reopened?.Dispose();
    transferred.Dispose();
    source.Dispose();
  }
});

it("uses Calc grid defaults and copies its drawing options by value", /** Verifies native defaults and copy/assignment isolation. @returns Nothing. */ () => {
  const defaults = new ScGridOptions();
  defaults.SetDefaults();
  const options = new ScViewOptions();
  expect(options.GetGridOptions().equals(defaults)).toBe(true);
  defaults.SetFieldDivisionX(8);
  options.SetGridOptions(defaults);
  const copy = new ScViewOptions(options);
  defaults.SetFieldDivisionX(5);
  options.SetGridOptions(defaults);
  expect(copy.GetGridOptions().GetFieldDivisionX()).toBe(8);
  copy.SetDefaults();
  expect(copy.GetGridOptions().GetFieldDivisionX()).toBe(1);
  expect(options.GetGridOptions().GetFieldDivisionX()).toBe(5);
});

it("reads legacy tab colors and writes the current ODS style and display properties", /** Covers legacy color precedence, native signed raster fields and represented display flags. @returns Completion. */ async () => {
  const source = await readOdsDocument(fixture("ods/print-range.ods"));
  let transferred: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  let legacy: ScDocument | undefined;
  try {
    source.SetTabBgColor(0, COL_AUTO);
    ReadUserDataSequence(source, [
      [
        ["ShowNotes", false],
        ["ShowNoteAuthor", false],
        ["ShowFormulasMarks", true],
        ["IsValueHighlightingEnabled", true],
        ["RasterResolutionX", -1],
        ["RasterSubdivisionY", 3, "short"],
        ["RasterIsVisible", true],
        [
          "Tables",
          [
            [
              "Sheet1",
              [
                ["TabColor", 0x123456],
                ["TabColor", -1],
              ],
            ],
            ["Sheet2", [["TabColor", "16711680"]]],
          ],
        ],
      ],
    ]);
    expect(source.GetTabBgColor(0).toUInt32()).toBe(0x123456);
    expect(source.GetTabBgColor(1).equals(COL_AUTO)).toBe(true);
    const record = encodeCalcDocument(source);
    expect(() =>
      decodeCalcDocument({ ...record, drawingGrid: [-1, 500, 4, 4, false, true, true] }),
    ).toThrow("Calc worker drawing grid is invalid.");
    transferred = decodeCalcDocument(structuredClone(record));
    const exported = await writeOdsXml(transferred);
    const settings = exported.files["settings.xml"];
    assert(typeof settings === "string");
    expect(settings).not.toContain('config:name="TabColor"');
    expect(settings).toContain(
      '<config:config-item config:name="RasterResolutionX" config:type="int">-1</config:config-item>',
    );
    reopened = await readOdsDocument(exported);
    const view = reopened.GetViewOptions();
    expect(view.GetGridOptions().GetFieldDrawX()).toBe(0xffffffff);
    expect(view.GetGridOptions().GetFieldDivisionY()).toBe(3);
    expect(view.GetGridOptions().GetGridVisible()).toBe(true);
    expect(view.GetOption(ViewOption.NOTES)).toBe(false);
    expect(view.GetOption(ViewOption.NOTEAUTHOR)).toBe(false);
    expect(view.GetOption(ViewOption.FORMULAS_MARKS)).toBe(true);
    expect(view.GetOption(ViewOption.SYNTAX)).toBe(true);
    expect(reopened.GetTabBgColor(0).toUInt32()).toBe(0x123456);
    const sheetView = '<config:config-item-map-entry config:name="Sheet1">';
    expect(settings).toContain(sheetView);
    legacy = await readOdsDocument({
      ...exported,
      files: {
        ...exported.files,
        "settings.xml": settings.replace(
          sheetView,
          sheetView +
            '<config:config-item config:name="TabColor" config:type="int">255</config:config-item>',
        ),
      },
    });
    expect(legacy.GetTabBgColor(0).toUInt32()).toBe(255);
  } finally {
    legacy?.Dispose();
    reopened?.Dispose();
    transferred?.Dispose();
    source.Dispose();
  }
});

it("restores XLSX worksheet groups through the Worker and exports the live membership", /** Checks source active-sheet inclusion, hidden selected sheets and replacement of stale imported flags. @returns Completion. */ async () => {
  const original = await DocumentArchive.open(fixture("xlsx/sheet-names.xlsx"));
  const writer = new DocumentArchiveWriter();
  const encoder = new TextEncoder();
  for (const part of original.getEntryNames()) {
    if (part === "xl/worksheets/sheet1.xml" || part === "xl/worksheets/sheet3.xml") {
      const xml = await original.readTextEntry(part);
      writer.putNextEntry(
        part,
        encoder.encode(xml.replace("<sheetView ", '<sheetView tabSelected="1" ')),
      );
    } else if (part === "xl/workbook.xml") {
      const xml = await original.readTextEntry(part);
      writer.putNextEntry(
        part,
        encoder.encode(
          xml.replace(
            /sheetId="[23]"/gu,
            /** Hides two secondary sheets before applying their view flags. @param id - Worksheet key. @returns Updated key. */ (
              id,
            ) => `${id} state="hidden"`,
          ),
        ),
      );
    } else writer.putNextEntry(part, await original.readEntry(part));
  }
  const source = await ExcelFilter.importDocument(await writer.finish());
  const transferred = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
  try {
    setSheetTabSelected(transferred, -1, true);
    expect(getSheetTabSelected(transferred, -1)).toBeUndefined();
    expect(transferred.GetVisibleTab()).toBe(4);
    expect(
      [0, 1, 2, 3, 4].map(
        /** Reads the detached native flags. @param tab - Source tab. @returns Membership. */ (
          tab,
        ) => getSheetTabSelected(transferred, tab),
      ),
    ).toEqual([true, false, true, false, true]);
    expect(transferred.IsVisible(1)).toBe(false);
    expect(transferred.IsVisible(2)).toBe(true);
    const shell = new ScDocShell(transferred);
    const view = new ScTabViewShell(shell).GetViewData();
    expect([...view.GetMarkData().GetSelectedTabs()]).toEqual([0, 2, 4]);
    const detached = await DocumentArchive.open(await exportXlsx(source));
    expect(await detached.readTextEntry("xl/worksheets/sheet3.xml")).toContain(
      'tabSelected="true"',
    );
    view.GetMarkData().SelectOneTable(4);
    view.GetMarkData().SelectTable(3, true);
    const live = new ScExtDocOptions();
    view.WriteExtOptions(live);
    const exported = await DocumentArchive.open(await shell.SerializeXlsx(live));
    expect(await exported.readTextEntry("xl/worksheets/sheet1.xml")).toContain(
      'tabSelected="false"',
    );
    expect(await exported.readTextEntry("xl/worksheets/sheet3.xml")).toContain(
      'tabSelected="false"',
    );
    expect(await exported.readTextEntry("xl/worksheets/sheet4.xml")).toContain(
      'tabSelected="true"',
    );
  } finally {
    transferred.Dispose();
    source.Dispose();
  }
});

it("reads the original ODF TableSelected property and keeps the native ODF writer behavior", /** Covers selected and unselected flags, including the documented reader/writer asymmetry. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(fixture("xlsx/sheet-names.xlsx"));
  let ondisk: ScDocument | undefined;
  let withFlags: ScDocument | undefined;
  try {
    ReadUserDataSequence(source, [
      [
        [
          "Tables",
          [
            ["S&P", [["TableSelected", true]]],
            ["Sam's Club", [["TableSelected", false]]],
            ['"The Sheet"', [["TableSelected", "true"]]],
            ["C>D", [["TableSelected", true]]],
          ],
        ],
      ],
    ]);
    expect(getSheetTabSelected(source, 2)).toBe(false);
    const view = new ScTabViewShell(new ScDocShell(source)).GetViewData();
    expect([...view.GetMarkData().GetSelectedTabs()]).toEqual([0, 4]);
    const ods = await writeOdsXml(source);
    const xml = ods.files["settings.xml"];
    assert(typeof xml === "string");
    expect(xml).not.toContain("TableSelected");
    const withSelection = xml.replace(
      /<config:config-item-map-entry config:name="(?:S&amp;P|C&gt;D)">/gu,
      /** Adds the ODF view property accepted by the original settings reader. @param start - Tab entry. @returns Entry with a boolean flag. */ (
        start,
      ) =>
        `${start}<config:config-item config:name="TableSelected" config:type="boolean">true</config:config-item>`,
    );
    withFlags = await readOdsDocument({
      ...ods,
      files: { ...ods.files, "settings.xml": withSelection },
    });
    const imported = new ScTabViewShell(new ScDocShell(withFlags)).GetViewData();
    expect([...imported.GetMarkData().GetSelectedTabs()]).toEqual([0, 4]);
    ondisk = await readOdsDocument(ods);
    const reopened = new ScTabViewShell(new ScDocShell(ondisk)).GetViewData();
    expect([...reopened.GetMarkData().GetSelectedTabs()]).toEqual([4]);
  } finally {
    withFlags?.Dispose();
    ondisk?.Dispose();
    source.Dispose();
  }
});

it("exports live ordered marks only in the active pane and preserves the native cursor fallback", /** Exercises detached selection values and the original Excel range index. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(fixture("xlsx/freezePaneStartCell.xlsx"));
  let reopened: ScDocument | undefined;
  try {
    const shell = new ScDocShell(source);
    const view = new ScTabViewShell(shell).GetViewData();
    const mark = view.GetMarkData();
    mark.SetMultiMarkArea(new ScRange(2, 3, 0, 3, 4, 0));
    mark.SetMultiMarkArea(new ScRange(5, 10, 0, 8, 13, 0));
    const snapshot = new ScExtDocOptions();
    view.WriteExtOptions(snapshot);
    const settings = snapshot.GetTabSettings(0);
    assert(settings);
    expect(snapshot.GetOrCreateTabSettings(0)).toBe(settings);
    expect(snapshot.GetTabSettings(700)).toBeUndefined();
    mark.ResetMark();
    expect(settings.maSelection.size()).toBe(2);
    const archive = await DocumentArchive.open(await shell.SerializeXlsx(snapshot));
    const xml = await archive.readTextEntry("xl/worksheets/sheet1.xml");
    expect(xml).toContain('tabSelected="true"');
    expect(xml).toContain(
      '<selection pane="bottomRight" activeCell="F11" activeCellId="1" sqref="C4:D5 F11:I14"/>',
    );
    expect(xml).toContain(
      '<selection pane="topLeft" activeCell="A1" activeCellId="0" sqref="A1"/>',
    );
    reopened = await ExcelFilter.importDocument(await shell.SerializeXlsx(snapshot));
    expect(getSheetCursor(reopened, 0)).toEqual([5, 10]);
    const reopenedView = new ScViewData(reopened);
    expect(reopenedView.GetMarkData().GetMarkedRanges().empty()).toBe(true);
    settings.maSelection.RemoveAll();
    settings.maSelection.push_back(new ScRange(MAXCOL + 1, 0, 0, MAXCOL + 2, 0, 0));
    settings.maSelection.push_back(
      new ScRange(MAXCOL - 1, MAXROW - 1, 0, MAXCOL + 1, MAXROW + 1, 0),
    );
    settings.maSelection.push_back(new ScRange(1, 1, 0, 1, 2, 0));
    const corrected = await DocumentArchive.open(await shell.SerializeXlsx(snapshot));
    expect(await corrected.readTextEntry("xl/worksheets/sheet1.xml")).toContain(
      'activeCell="F11" activeCellId="2" sqref="XFC1048575:XFD1048576 B2:B3 F11"',
    );
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});

it("reads the active pane's cursor and round-trips it through the view, Worker, ODS and XLSX", /** Exercises the pinned workbook with four different pane cursors. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(fixture("xlsx/freezePaneStartCell.xlsx"));
  let worker: ScDocument | undefined;
  let stored: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  try {
    expect(getSheetCursor(source, 0)).toEqual([5, 10]);
    const view = new ScTabViewShell(new ScDocShell(source)).GetViewData();
    const layout = {
      horizontalMode: SheetSplitMode.FIX,
      horizontalPosition: 5,
      verticalMode: SheetSplitMode.FIX,
      verticalPosition: 10,
      first: [0, 0],
      second: [0, 0],
      activePane: SheetPane.BOTTOMRIGHT,
    };
    expect(getSheetPaneLayout(source, 0)).toEqual(layout);
    expect(view.GetPaneLayout()).toEqual(layout);
    expect(view.GetActivePart()).toBe(SheetPane.BOTTOMRIGHT);
    expect([view.GetCurX(), view.GetCurY()]).toEqual([5, 10]);
    view.SetCurX(6);
    view.SetCurY(7);
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
    expect(getSheetCursor(worker, 0)).toEqual([6, 7]);
    expect(getSheetPaneLayout(worker, 0)).toEqual(layout);
    const primary = await writeOdsXml(worker);
    expect(primary.files["settings.xml"]).toContain(
      'config:name="CursorPositionX" config:type="int">6<',
    );
    expect(primary.files["settings.xml"]).toContain(
      'config:name="CursorPositionY" config:type="int">7<',
    );
    stored = await readOdsDocument(primary);
    expect(getSheetCursor(stored, 0)).toEqual([6, 7]);
    expect(getSheetPaneLayout(stored, 0)).toEqual(layout);
    const bytes = await exportXlsx(stored);
    const output = await DocumentArchive.open(bytes);
    const sheet = await output.readTextEntry("xl/worksheets/sheet1.xml");
    expect(sheet).toContain(
      '<pane xSplit="5" ySplit="10" topLeftCell="F11" activePane="bottomRight" state="frozen"/>',
    );
    expect(sheet).toContain(
      '<selection pane="bottomRight" activeCell="G8" activeCellId="0" sqref="G8"/>',
    );
    expect(sheet.match(/<selection /gu)).toHaveLength(4);
    reopened = await ExcelFilter.importDocument(bytes);
    expect(getSheetCursor(reopened, 0)).toEqual([6, 7]);
    expect(getSheetPaneLayout(reopened, 0)).toEqual({ ...layout, second: [5, 10] });
  } finally {
    reopened?.Dispose();
    stored?.Dispose();
    worker?.Dispose();
    source.Dispose();
  }
});

it("uses the first view's active selection or its top-left cell and preserves separate sheet cursors", /** Checks first-view source order, missing and invalid addresses and named-sheet cursor ownership. @returns Completion. */ async () => {
  const source = await DocumentArchive.open(fixture("xlsx/sheet-names.xlsx"));
  const writer = new DocumentArchiveWriter();
  const first =
    '<sheetView topLeftCell="D7" workbookViewId="0"><pane activePane="bottomRight"/><selection pane="topLeft" activeCell="C4"/></sheetView>';
  const second =
    '<sheetView workbookViewId="1"><pane activePane="topLeft"/><selection activeCell="E6"/></sheetView>';
  const settings = new Map([
    ["xl/worksheets/sheet1.xml", first + second],
    [
      "xl/worksheets/sheet2.xml",
      '<sheetView topLeftCell="C3" workbookViewId="0"><selection activeCell="not-a-cell"/></sheetView>',
    ],
    ["xl/worksheets/sheet3.xml", ""],
    [
      "xl/worksheets/sheet5.xml",
      '<sheetView workbookViewId="0"><selection activeCell="B6"/><selection activeCell="E2"/></sheetView>',
    ],
  ]);
  for (const name of source.getEntryNames()) {
    const model = settings.get(name);
    if (model === undefined) writer.putNextEntry(name, await source.readEntry(name));
    else
      writer.putNextEntry(
        name,
        new TextEncoder().encode(
          (await source.readTextEntry(name)).replace(
            /<sheetViews>.*?<\/sheetViews>/su,
            `<sheetViews>${model}</sheetViews>`,
          ),
        ),
      );
  }
  const document = await ExcelFilter.importDocument(await writer.finish());
  try {
    expect(document.GetVisibleTab()).toBe(4);
    expect(getSheetCursor(document, 0)).toEqual([3, 6]);
    expect(getSheetCursor(document, 1)).toEqual([9873, 0]);
    expect(getSheetCursor(document, 2)).toEqual([0, 0]);
    expect(getSheetCursor(document, 4)).toEqual([4, 1]);
    const view = new ScTabViewShell(new ScDocShell(document)).GetViewData();
    view.SetTabNo(4);
    expect([view.GetCurX(), view.GetCurY()]).toEqual([4, 1]);
    view.SetCurXForTab(5, 0);
    view.SetCurYForTab(9, 0);
    expect(getSheetCursor(document, 0)).toEqual([5, 9]);
    expect([view.GetCurX(), view.GetCurY()]).toEqual([4, 1]);
  } finally {
    document.Dispose();
  }
});

it("preserves the original Excel sheet names and the fifth active sheet through primary ODS", /** Ports testSheetNamesXLSX and checks the active view by name, not position alone. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(fixture("xlsx/sheet-names.xlsx"));
  let worker: ScDocument | undefined;
  let stored: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  try {
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
    const primary = await writeOdsXml(worker);
    expect(primary.files["settings.xml"]).toContain(
      'config:name="ActiveTable" config:type="string">C&gt;D</config:config-item>',
    );
    expect(primary.files["META-INF/manifest.xml"]).toContain('manifest:full-path="settings.xml"');
    stored = await readOdsDocument(primary);
    const bytes = await exportXlsx(stored);
    const archive = await DocumentArchive.open(bytes);
    expect(await archive.readTextEntry("xl/workbook.xml")).toContain(
      '<workbookView activeTab="4" showSheetTabs="true"/>',
    );
    reopened = await ExcelFilter.importDocument(bytes);
    for (const graph of [source, worker, stored, reopened]) {
      const names = graph.GetAllTableNames();
      try {
        expect(names.map(text)).toEqual(["S&P", "Sam's Club", '"The Sheet"', "A<B", "C>D"]);
        expect(graph.GetVisibleTab()).toBe(4);
      } finally {
        for (const name of names) name.dispose();
      }
    }
  } finally {
    reopened?.Dispose();
    stored?.Dispose();
    worker?.Dispose();
    source.Dispose();
  }
});

it("reads the native ODS first view and ignores unresolved properties", /** Verifies the pinned print-range workbook's existing ActiveTable and view lookup guards. @returns Completion. */ async () => {
  const document = await readOdsDocument(fixture("ods/print-range.ods"));
  try {
    expect(document.GetVisibleTab()).toBe(1);
    ReadUserDataSequence(document, []);
    ReadUserDataSequence(document, [
      [
        ["Unrelated", "Sheet1"],
        ["ActiveTable", "Unknown"],
        ["ActiveTable", false],
        ["ShowGrid", "false"],
        ["Tables", true],
        [
          "Tables",
          [
            ["Unknown", [["ShowGrid", false]]],
            [
              "Sheet2",
              [
                ["Unrelated", false],
                ["ShowGrid", "false"],
                ["CursorPositionX", 65540],
                ["CursorPositionY", "4"],
              ],
            ],
          ],
        ],
      ],
      [["ActiveTable", "Sheet1"]],
    ]);
    expect(document.GetVisibleTab()).toBe(1);
    expect(getSheetCursor(document, 1)).toEqual([4, 65540]);
    ReadUserDataSequence(document, [[["Tables", [["Sheet2", [["CursorPositionY", 2147483647]]]]]]]);
    expect(getSheetCursor(document, 1)).toEqual([4, document.MaxRow()]);
    expect(WriteUserDataSequence(document)[0]).toContainEqual(["ActiveTable", "Sheet2"]);
    document.SetVisible(1, false);
    expect(WriteUserDataSequence(document)).toEqual([]);
  } finally {
    document.Dispose();
  }
});

it("uses the first view per sheet and the active sheet for global display options", /** Exercises conflicting views, native defaults, Worker transport and both package formats. @returns Completion. */ async () => {
  const file = fixture("xlsx/sheet-names.xlsx");
  const source = await DocumentArchive.open(file);
  const output = new DocumentArchiveWriter();
  for (const entry of source.getEntryNames()) {
    if (entry === "xl/worksheets/sheet1.xml" || entry === "xl/worksheets/sheet5.xml") {
      const xml = await source.readTextEntry(entry);
      const payload = xml.replace(
        /<sheetViews\b[^>]*>[\s\S]*?<\/sheetViews>/u,
        entry.endsWith("sheet1.xml")
          ? '<sheetViews><sheetView workbookViewId="0"/><sheetView workbookViewId="1" showGridLines="false" showOutlineSymbols="0"/></sheetViews>'
          : '<sheetViews><sheetView workbookViewId="0" showFormulas="1" showRowColHeaders="0" showZeros="0" showOutlineSymbols="0"/><sheetView workbookViewId="1" showFormulas="0" showRowColHeaders="1" showZeros="1" showOutlineSymbols="1"/></sheetViews>',
      );
      expect(payload).not.toBe(xml);
      output.putNextEntry(entry, new TextEncoder().encode(payload));
    } else if (entry === "xl/workbook.xml") {
      const xml = await source.readTextEntry(entry);
      const payload = xml.replace(
        /<bookViews\b[^>]*>[\s\S]*?<\/bookViews>/u,
        '<bookViews><workbookView activeTab="4" showSheetTabs="off"/><workbookView activeTab="0" showSheetTabs="1"/></bookViews>',
      );
      expect(payload).not.toBe(xml);
      output.putNextEntry(entry, new TextEncoder().encode(payload));
    } else output.putNextEntry(entry, await source.readEntry(entry));
  }
  const doc = await ExcelFilter.importDocument(await output.finish());
  const graphs = [doc];
  try {
    expect(doc.GetSheetShowGrid(0)).toBe(true);
    expect(doc.GetVisibleTab()).toBe(4);
    expect(doc.GetViewOptions().GetOption(ViewOption.FORMULAS)).toBe(false);
    doc.GetViewOptions().SetOption(ViewOption.FORMULAS, true);
    const clone = decodeCalcDocument(structuredClone(encodeCalcDocument(doc)));
    graphs.push(clone);
    expect(clone.GetViewOptions().GetOption(ViewOption.FORMULAS)).toBe(true);
    const exported = await exportXlsx(clone);
    const xlsx = await DocumentArchive.open(exported);
    expect(await xlsx.readTextEntry("xl/workbook.xml")).toContain('showSheetTabs="false"');
    for (const part of ["xl/worksheets/sheet1.xml", "xl/worksheets/sheet5.xml"]) {
      const xml = await xlsx.readTextEntry(part);
      expect(xml).toContain('showFormulas="true"');
      expect(xml).toContain('showRowColHeaders="false"');
      expect(xml).toContain('showZeros="false"');
      expect(xml).toContain('showOutlineSymbols="false"');
    }
    const reopened = await ExcelFilter.importDocument(exported);
    graphs.push(reopened);
    expect(reopened.GetViewOptions().GetOption(ViewOption.FORMULAS)).toBe(false);
    const primary = await writeOdsXml(clone);
    expect(primary.files["settings.xml"]).toContain(
      'config:name="HasColumnRowHeaders" config:type="boolean">false',
    );
    expect(primary.files["settings.xml"]).toContain(
      'config:name="ShowZeroValues" config:type="boolean">false',
    );
    expect(primary.files["settings.xml"]).toContain(
      'config:name="IsOutlineSymbolsSet" config:type="boolean">false',
    );
    expect(primary.files["settings.xml"]).toContain(
      'config:name="HasSheetTabs" config:type="boolean">false',
    );
    expect(primary.files["settings.xml"]).not.toContain('config:name="ShowFormulas"');
    const restored = await readOdsDocument(primary);
    graphs.push(restored);
    for (const graph of graphs) {
      const options = graph.GetViewOptions();
      expect(options.GetOption(ViewOption.HEADER)).toBe(false);
      expect(options.GetOption(ViewOption.NULLVALS)).toBe(false);
      expect(options.GetOption(ViewOption.OUTLINER)).toBe(false);
      expect(options.GetOption(ViewOption.TABCONTROLS)).toBe(false);
    }
    expect(restored.GetViewOptions().GetOption(ViewOption.FORMULAS)).toBe(false);
  } finally {
    for (const graph of graphs) graph.Dispose();
  }
});

it("uses the interactive Excel grid defaults while retaining the per-sheet setting", /** Ports the tdf126541 interactive UI test and checks the primary ODS and XLSX output. @returns Completion. */ async () => {
  const directory = "../../vendor/libreoffice-reference/sc/qa/uitest/data/";
  const incoming = await ExcelFilter.importDocument(
    new Uint8Array(readFileSync(directory + "tdf126541_GridOff.xlsx")),
  );
  const globalOff = await readOdsDocument(
    new Uint8Array(readFileSync(directory + "tdf126541_GridOffGlobally.ods")),
  );
  const graphs = [incoming, globalOff];
  try {
    expect(new ScViewData(globalOff).GetOptions().GetOption(ViewOption.GRID)).toBe(false);
    const globalClone = decodeCalcDocument(structuredClone(encodeCalcDocument(globalOff)));
    graphs.push(globalClone);
    expect(globalClone.GetViewOptions().GetOption(ViewOption.GRID)).toBe(false);

    const view = new ScViewData(incoming);
    expect(view.GetOptions().GetOption(ViewOption.GRID)).toBe(true);
    expect(view.GetShowGrid()).toBe(false);
    expect(incoming.GetSheetShowGrid(1234)).toBe(true);
    const name = unicode("Grid On");
    try {
      expect(incoming.InsertTab(1, name)).toBe(true);
    } finally {
      name.dispose();
    }
    view.SetTabNo(1);
    expect(view.GetShowGrid()).toBe(true);
    view.SetShowGrid(false);
    view.SetShowGrid(true);
    view.SetTabNo(0);
    expect(view.GetShowGrid()).toBe(false);

    const copied = decodeCalcDocument(structuredClone(encodeCalcDocument(incoming)));
    graphs.push(copied);
    const primary = await writeOdsXml(copied);
    expect(primary.files["settings.xml"]).toContain(
      '<config:config-item-map-named config:name="Tables">',
    );
    const restored = await readOdsDocument(primary);
    graphs.push(restored);
    const output = await exportXlsx(restored);
    const archive = await DocumentArchive.open(output);
    expect(await archive.readTextEntry("xl/worksheets/sheet1.xml")).toContain(
      'showGridLines="false"',
    );
    expect(await archive.readTextEntry("xl/worksheets/sheet2.xml")).toContain(
      'showGridLines="true"',
    );
    graphs.push(await ExcelFilter.importDocument(output));
    for (const graph of graphs.slice(3)) {
      expect(graph.GetViewOptions().GetOption(ViewOption.GRID)).toBe(true);
      expect(graph.GetSheetShowGrid(0)).toBe(false);
      expect(graph.GetSheetShowGrid(1)).toBe(true);
    }
  } finally {
    for (const graph of graphs) graph.Dispose();
  }
});

it("ports fixed and normal split positions relative to their original sheet origins", /** Exercises both split units, pane-pair normalization, and the original non-A1 export bound. @returns Completion. */ async () => {
  const source = await DocumentArchive.open(fixture("xlsx/sheet-names.xlsx"));
  const writer = new DocumentArchiveWriter();
  const geometry = [
    '<sheetView topLeftCell="E4" workbookViewId="0"><pane xSplit="2" topLeftCell="B2" activePane="topRight" state="frozenSplit"/><selection pane="topRight" activeCell="H7"/></sheetView>',
    '<sheetView topLeftCell="B3" workbookViewId="0"><pane xSplit="1200.4" topLeftCell="F9" activePane="topRight"/><selection pane="topRight" activeCell="G3"/></sheetView>',
    '<sheetView workbookViewId="0"><pane ySplit="1800.9" topLeftCell="A4" activePane="topRight" state="split"/><selection pane="topRight" activeCell="C1"/></sheetView>',
    '<sheetView topLeftCell="D9" workbookViewId="0"><pane xSplit="2" state="unknown"/></sheetView>',
    '<sheetView workbookViewId="0"><pane xSplit="0.5" ySplit="1048577" activePane="bottomRight" state="frozen"/></sheetView>',
  ];
  for (const name of source.getEntryNames()) {
    const index = Number(name.match(/^xl\/worksheets\/sheet(\d+)\.xml$/u)?.[1]) - 1;
    const view = geometry[index];
    writer.putNextEntry(
      name,
      view === undefined
        ? await source.readEntry(name)
        : new TextEncoder().encode(
            (await source.readTextEntry(name)).replace(
              /<sheetViews>.*?<\/sheetViews>/su,
              `<sheetViews>${view}</sheetViews>`,
            ),
          ),
    );
  }
  const document = await ExcelFilter.importDocument(await writer.finish());
  let reopened: ScDocument | undefined;
  try {
    expect(getSheetPaneLayout(document, 0)).toEqual({
      horizontalMode: SheetSplitMode.FIX,
      horizontalPosition: 6,
      verticalMode: SheetSplitMode.NONE,
      verticalPosition: 0,
      activePane: SheetPane.BOTTOMRIGHT,
      first: [4, 3],
      second: [1, 3],
    });
    expect(getSheetPaneLayout(document, 1)).toMatchObject({
      horizontalMode: SheetSplitMode.NORMAL,
      horizontalPosition: 1200,
      verticalMode: SheetSplitMode.NONE,
      verticalPosition: 0,
      activePane: SheetPane.BOTTOMRIGHT,
      first: [1, 2],
      second: [5, 2],
    });
    expect(getSheetPaneLayout(document, 2)).toMatchObject({
      horizontalMode: SheetSplitMode.NONE,
      verticalMode: SheetSplitMode.NORMAL,
      verticalPosition: 1801,
      activePane: SheetPane.TOPLEFT,
    });
    for (let tab = 3; tab <= 4; ++tab)
      expect(getSheetPaneLayout(document, tab)).toMatchObject({
        horizontalMode: SheetSplitMode.NONE,
        verticalMode: SheetSplitMode.NONE,
        activePane: SheetPane.BOTTOMLEFT,
      });
    const primary = await writeOdsXml(document);
    expect(primary.files["settings.xml"]).toContain(
      'config:name="HorizontalSplitMode" config:type="short">2<',
    );
    expect(primary.files["settings.xml"]).toContain(
      'config:name="HorizontalSplitPositionTwips" config:type="int">1200<',
    );
    reopened = await readOdsDocument(primary);
    for (let tab = 0; tab < 5; ++tab)
      expect(getSheetPaneLayout(reopened, tab)).toEqual(getSheetPaneLayout(document, tab));

    const output = await DocumentArchive.open(await exportXlsx(reopened));
    const frozen = await output.readTextEntry("xl/worksheets/sheet1.xml");
    expect(frozen).toContain('topLeftCell="E4"');
    // The source compares the second origin with the relative split count. CALC-753.
    expect(frozen).toContain(
      '<pane xSplit="2" ySplit="0" topLeftCell="C4" activePane="topRight" state="frozen"/>',
    );
    expect(frozen).toContain(
      '<selection pane="topRight" activeCell="H7" activeCellId="0" sqref="H7"/>',
    );
    const horizontal = await output.readTextEntry("xl/worksheets/sheet2.xml");
    expect(horizontal).toContain(
      '<pane xSplit="1200" ySplit="0" topLeftCell="F3" activePane="topRight" state="split"/>',
    );
    const vertical = await output.readTextEntry("xl/worksheets/sheet3.xml");
    expect(vertical).toContain(
      '<pane xSplit="0" ySplit="1801" topLeftCell="A4" activePane="topLeft" state="split"/>',
    );
    for (let tab = 4; tab <= 5; ++tab)
      expect(await output.readTextEntry(`xl/worksheets/sheet${tab}.xml`)).not.toContain("<pane ");
  } finally {
    reopened?.Dispose();
    document.Dispose();
  }
});

it("reads ODF pane scalar types and native last-position ordering", /** Covers the native signed column domain and legacy pixel position property. @returns Completion. */ async () => {
  const document = await ExcelFilter.importDocument(fixture("xlsx/sheet-names.xlsx"));
  try {
    ReadUserDataSequence(document, [
      [
        [
          "Tables",
          [
            [
              "S&P",
              [
                ["HorizontalSplitMode", 2, "short"],
                ["HorizontalSplitPositionTwips", 8],
                ["HorizontalSplitPosition", 65539],
                ["VerticalSplitMode", 1, "short"],
                ["VerticalSplitPositionTwips", 999],
                ["VerticalSplitPosition", 100],
                ["HorizontalSplitMode", 1],
                ["ActiveSplitRange", 4, "short"],
                ["PositionLeft", 65537],
                ["PositionRight", 65543],
                ["PositionTop", 3],
                ["PositionBottom", 9],
              ],
            ],
            [
              "Sam's Club",
              [
                ["HorizontalSplitMode", 2, "short"],
                ["HorizontalSplitPosition", 8],
                ["HorizontalSplitPositionTwips", 9],
                ["VerticalSplitMode", 2, "short"],
                ["PositionTop", -1],
                ["ActiveSplitRange", 0, "short"],
              ],
            ],
            [
              '"The Sheet"',
              [
                ["HorizontalSplitMode", 1, "short"],
                ["VerticalSplitMode", 2, "short"],
                ["VerticalSplitPosition", 0],
                ["PositionBottom", "bad"],
              ],
            ],
            [
              "A<B",
              [
                ["PositionLeft", 1],
                ["PositionTop", 117],
                ["PositionBottom", 23],
              ],
            ],
          ],
        ],
      ],
    ]);
    expect(getSheetPaneLayout(document, 0)).toEqual({
      horizontalMode: SheetSplitMode.FIX,
      horizontalPosition: 3,
      verticalMode: SheetSplitMode.NORMAL,
      verticalPosition: 1500,
      activePane: SheetPane.BOTTOMLEFT,
      first: [1, 3],
      second: [7, 9],
    });
    expect(getSheetPaneLayout(document, 1)).toEqual({
      horizontalMode: SheetSplitMode.FIX,
      horizontalPosition: 9,
      verticalMode: SheetSplitMode.NONE,
      verticalPosition: 0,
      activePane: SheetPane.BOTTOMLEFT,
      first: [0, 0],
      second: [0, 0],
    });
    expect(getSheetPaneLayout(document, 2)).toMatchObject({
      horizontalMode: SheetSplitMode.NONE,
      verticalMode: SheetSplitMode.NONE,
    });
    expect(getSheetPaneLayout(document, 3)).toMatchObject({ first: [1, 23], second: [0, 23] });
    const primary = await writeOdsXml(document);
    expect(primary.files["settings.xml"]).toContain(
      '<config:config-item config:name="PositionTop" config:type="int">0</config:config-item>',
    );
    expect(primary.files["settings.xml"]).toContain(
      '<config:config-item config:name="PositionBottom" config:type="int">23</config:config-item>',
    );
  } finally {
    document.Dispose();
  }
});

it("rejects pane records outside the worker graph's native coordinate domains", /** Checks format-invalid view metadata across the existing isolated graph codec. @returns Completion. */ async () => {
  const document = await ExcelFilter.importDocument(fixture("xlsx/freezePaneStartCell.xlsx"));
  try {
    const record = encodeCalcDocument(document);
    const [sheet, ...remainingSheets] = record.sheets;
    assert(sheet);
    const base = getSheetPaneLayout(document, 0);
    expect(base).toBeDefined();
    for (const panes of [
      null,
      { ...base, horizontalMode: SheetSplitMode.NONE },
      { ...base, horizontalPosition: -5 },
      { ...base, verticalPosition: document.MaxRow() + 1 },
      { ...base, activePane: 4 },
      { ...base, activePane: -1 },
      { ...base, first: [] },
      { ...base, first: [null, 3] },
      { ...base, second: [1, "bad"] },
      { ...base, second: [document.MaxCol() + 1, 2] },
    ]) {
      const sheets = [{ ...sheet, panes }, ...remainingSheets];
      expect(
        /** Attempts to adopt a malformed candidate view. @returns Unexpected document. */ () =>
          decodeCalcDocument({ ...record, sheets } as unknown as typeof record),
      ).toThrow("Calc worker sheet pane layout is invalid.");
    }
  } finally {
    document.Dispose();
  }
});
