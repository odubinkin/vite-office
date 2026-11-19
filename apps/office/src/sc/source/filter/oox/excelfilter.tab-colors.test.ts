/** @fileoverview Pinned worksheet tab colors through XLSX, ODS and the Worker graph. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { Color, COL_AUTO } from "../../../../tools/inc/color";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScDocument } from "../../../inc/document";
import { exportXlsx } from "../excel/xetable";
import { ScXMLImport } from "../xml/xmlimprt";
import { readOdsDocument, writeOdsDocument } from "../xml/xmlwrap";
import { ExcelFilter } from "./excelfilter";

const worksheets = "xl/worksheets/sheet";

/** Reads an unmodified input from the pinned export suite. @param name - Fixture stem. @returns XLSX bytes. */
function fixture(name: string): Uint8Array {
  return readFileSync(`../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/${name}.xlsx`);
}

/** Places the upstream chart-sheet color and theme into an ordinary worksheet for the current worksheet-only filter. @param properties - Optional replacement sheet properties. @returns XLSX bytes. */
async function themedWorksheet(properties?: string): Promise<Uint8Array> {
  const themed = await DocumentArchive.open(fixture("tdf107586"));
  const chart = await themed.readTextEntry("xl/chartsheets/sheet1.xml");
  const original = chart.match(/<sheetPr>.*?<\/sheetPr>/u)?.[0];
  if (!original) throw new Error("Missing upstream chart sheet properties.");
  const sheets = await DocumentArchive.open(fixture("sheet-tab-color"));
  const target = new DocumentArchiveWriter();
  for (const name of sheets.getEntryNames()) {
    const data =
      name === "xl/theme/theme1.xml"
        ? await themed.readEntry(name)
        : name === `${worksheets}1.xml`
          ? new TextEncoder().encode(
              (await sheets.readTextEntry(name)).replace(
                /<sheetPr>.*?<\/sheetPr>/u,
                properties ?? original,
              ),
            )
          : await sheets.readEntry(name);
    target.putNextEntry(name, data);
  }
  return target.finish();
}

it("keeps the four tab colors from testSheetTabColorsXLSX through XLSX, Worker and ODS", /** Verifies the same sheet names and colors as upstream before and after the actual file filters. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(fixture("sheet-tab-color"));
  const worker = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
  worker.SetVisible(1, false);
  const ods = await writeOdsDocument(worker);
  const reopened = await readOdsDocument(ods);
  const xlsx = await exportXlsx(reopened);
  const final = await ExcelFilter.importDocument(xlsx);
  try {
    for (const document of [source, worker, reopened, final]) {
      const names = document.GetAllTableNames();
      try {
        expect(names.map(text)).toEqual(["Green", "Red", "Blue", "Yellow"]);
      } finally {
        for (const name of names) name.dispose();
      }
      for (const [tab, color] of [0x00b050, 0xff0000, 0x0070c0, 0xffff00].entries()) {
        expect(document.GetTabBgColor(tab).toUInt32()).toBe(color);
        expect(document.IsDefaultTabBgColor(tab)).toBe(false);
      }
    }
    const content = await (await DocumentArchive.open(ods)).readTextEntry("content.xml");
    expect(content).toContain('table:display="false" table:tab-color="#ff0000"');
    expect(reopened.IsVisible(1)).toBe(false);
    expect(final.IsVisible(1)).toBe(false);
    const archive = await DocumentArchive.open(xlsx);
    for (const [tab, rgb] of ["FF00B050", "FFFF0000", "FF0070C0", "FFFFFF00"].entries()) {
      const xml = await archive.readTextEntry(`${worksheets}${tab + 1}.xml`);
      expect(xml).toContain(`<sheetPr><tabColor rgb="${rgb}"/></sheetPr><sheetViews>`);
    }
  } finally {
    for (const document of [source, worker, reopened, final]) document.Dispose();
  }
});

it("exports the testTdf107586 theme value from its original theme into a worksheet", /** Ports the native FF9BBB59 assertion with an ordinary worksheet container. @returns Completion. */ async () => {
  const document = await ExcelFilter.importDocument(await themedWorksheet());
  try {
    expect(document.GetTabBgColor(0).toUInt32()).toBe(0x9bbb59);
    const archive = await DocumentArchive.open(await exportXlsx(document));
    expect(await archive.readTextEntry(`${worksheets}1.xml`)).toContain(
      '<sheetPr><tabColor rgb="FF9BBB59"/></sheetPr>',
    );
  } finally {
    document.Dispose();
  }
});

it("omits automatic tab colors from exported XLSX and the Worker graph", /** Exercises explicit auto, a misnested color, and the missing-sheet default. @returns Completion. */ async () => {
  const document = await ExcelFilter.importDocument(
    await themedWorksheet(
      '<sheetPr><tabColor auto="1"/><outlinePr><tabColor rgb="FFFF0000"/></outlinePr></sheetPr>',
    ),
  );
  try {
    expect(document.GetTabBgColor(-1).equals(COL_AUTO)).toBe(true);
    expect(document.IsDefaultTabBgColor(0)).toBe(true);
    const record = encodeCalcDocument(document);
    expect(record.sheets[0]).not.toHaveProperty("tabColor");
    const archive = await DocumentArchive.open(await exportXlsx(document));
    expect(await archive.readTextEntry(`${worksheets}1.xml`)).not.toContain("<tabColor");
    const malformed = structuredClone(record);
    const sheet = malformed.sheets[0];
    if (!sheet) throw new Error("Missing first worksheet in Worker record.");
    malformed.sheets[0] = { ...sheet, tabColor: -1 };
    expect(
      /** Decodes an invalid unsigned color. @returns Decoded graph. */ () =>
        decodeCalcDocument(malformed),
    ).toThrow("Invalid Calc sheet color.");
  } finally {
    document.Dispose();
  }
});

it("owns its tab color and applies ODF 1.2 extension and invalid-attribute handling", /** Exercises detached color objects and original table style namespaces. @returns Nothing. */ () => {
  const document = new ScDocument();
  const name = unicode("Owned");
  try {
    document.InsertTab(0, name);
    const color = new Color(0x112233);
    document.SetTabBgColor(0, color);
    document.SetTabBgColor(0, color);
    color.SetRed(0);
    document.GetTabBgColor(0).SetBlue(0);
    expect(document.GetTabBgColor(0).toUInt32()).toBe(0x112233);
  } finally {
    name.dispose();
    document.Dispose();
  }

  const loaded = new ScDocument();
  const importer = new ScXMLImport(loaded);
  try {
    importer.importContent(`<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:tableooo="http://openoffice.org/2009/table">
      <office:automatic-styles><style:style style:name="ta" style:family="table"><style:table-properties tableooo:tab-color="#445566" table:tab-color="invalid"/></style:style>
      <style:style style:name="tb" style:family="table"><style:table-properties table:tab-color="invalid"/></style:style></office:automatic-styles>
      <office:body><office:spreadsheet><table:table table:name="Legacy" table:style-name="ta"/><table:table table:name="Default" table:style-name="tb"/></office:spreadsheet></office:body></office:document-content>`);
    expect(loaded.GetTabBgColor(0).toUInt32()).toBe(0x445566);
    expect(loaded.IsDefaultTabBgColor(1)).toBe(true);
  } finally {
    loaded.Dispose();
  }
});
