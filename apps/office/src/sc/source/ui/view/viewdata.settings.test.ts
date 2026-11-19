/** @fileoverview Calc active view across XLSX, native view data, the Worker and ODS settings. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { exportXlsx } from "../../filter/excel/xetable";
import { ExcelFilter } from "../../filter/oox/excelfilter";
import { readOdsDocument, writeOdsXml } from "../../filter/xml/xmlwrap";
import { ReadUserDataSequence, WriteUserDataSequence } from "./viewdata.settings";
import type { ScDocument } from "../../../inc/document";
import { ViewOption } from "../../../inc/viewopti";
import { ScViewData } from "./viewdata";

/** Reads an unchanged pinned LibreOffice fixture. @param name - Reference path under Calc unit data. @returns Bytes. */
function fixture(name: string): Uint8Array {
  return new Uint8Array(readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/" + name));
}

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
      '<workbookView activeTab="4"/>',
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
              ],
            ],
          ],
        ],
      ],
      [["ActiveTable", "Sheet1"]],
    ]);
    expect(document.GetVisibleTab()).toBe(1);
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
          ? '<sheetViews><sheetView workbookViewId="0"/><sheetView workbookViewId="1" showGridLines="false"/></sheetViews>'
          : '<sheetViews><sheetView workbookViewId="0" showFormulas="1" showRowColHeaders="0" showZeros="0"/><sheetView workbookViewId="1" showFormulas="0" showRowColHeaders="1" showZeros="1"/></sheetViews>',
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
    for (const part of ["xl/worksheets/sheet1.xml", "xl/worksheets/sheet5.xml"]) {
      const xml = await xlsx.readTextEntry(part);
      expect(xml).toContain('showFormulas="true"');
      expect(xml).toContain('showRowColHeaders="false"');
      expect(xml).toContain('showZeros="false"');
    }
    const reopened = await ExcelFilter.importDocument(exported);
    graphs.push(reopened);
    expect(reopened.GetViewOptions().GetOption(ViewOption.FORMULAS)).toBe(false);
    for (const graph of graphs) {
      const options = graph.GetViewOptions();
      expect(options.GetOption(ViewOption.HEADER)).toBe(false);
      expect(options.GetOption(ViewOption.NULLVALS)).toBe(false);
    }
    const primary = await writeOdsXml(clone);
    expect(primary.files["settings.xml"]).toContain(
      'config:name="HasColumnRowHeaders" config:type="boolean">false',
    );
    expect(primary.files["settings.xml"]).toContain(
      'config:name="ShowZeroValues" config:type="boolean">false',
    );
    expect(primary.files["settings.xml"]).not.toContain('config:name="ShowFormulas"');
    const restored = await readOdsDocument(primary);
    graphs.push(restored);
    expect(restored.GetViewOptions().GetOption(ViewOption.HEADER)).toBe(false);
    expect(restored.GetViewOptions().GetOption(ViewOption.NULLVALS)).toBe(false);
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
