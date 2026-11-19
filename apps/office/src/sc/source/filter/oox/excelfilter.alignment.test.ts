/** @fileoverview Native Calc XF alignment regressions over pinned workbooks and original package filters. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { ScAddress } from "../../../inc/address";
import type { ScProtectionAttr } from "../../../inc/attrib";
import { ScDocument } from "../../../inc/document";
import { SvxFrameDirection as D } from "../../../../editeng/inc/frmdir";
import { SvxCellHorJustify as H, SvxCellVerJustify as V } from "../../../../editeng/inc/svxenum";
import { SvxRotateMode as M } from "../../../../svx/inc/rotmodit";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import * as W from "../../../inc/scitems";
import { ExcelFilter } from "./excelfilter";
import { exportXlsx } from "../excel/xetable";
import { readOdsDocument, writeOdsDocument } from "../xml/xmlwrap";
import { strictSpreadsheetNamespace } from "./workbookfragment";
import type { XlsxReferenceDevice } from "./unitconverter";
import { ScXMLImport } from "../xml/xmlimprt";
import { GetXclRotation } from "../excel/xestyle.alignment";

/** Loads unchanged upstream workbook bytes. @param name - Pinned workbook filename. @returns Bytes. */
function fixture(name: string): Uint8Array {
  return new Uint8Array(
    readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/" + name),
  );
}

/** Reads an actual scalar Calc pool item at a cell. @param document - Current workbook. @param col - Column. @param row - Row. @param which - Native item ID. @returns Value. */
function value(document: ScDocument, col: number, row: number, which: number): unknown {
  const item = document.GetPattern(new ScAddress(col, row, 0))?.GetItem(which);
  if (!item || !("GetValue" in item) || typeof item.GetValue !== "function")
    throw new Error("Missing native Calc scalar item.");
  return item.GetValue();
}

/** Reads the source four-flag Calc cell protection item. @param document - Actual workbook. @param col - Column. @param row - Row. @returns Native flags. */
function protection(document: ScDocument, col: number, row: number): boolean[] {
  const item = document
    .GetPattern(new ScAddress(col, row, 0))
    ?.GetItem(W.ATTR_PROTECTION) as ScProtectionAttr;
  return [item.GetProtection(), item.GetHideFormula(), item.GetHideCell(), item.GetHidePrint()];
}

const metric: XlsxReferenceDevice = {
  screenPixelTwips: 15,
  /** Represents a test reference device with known distinct space and digit advances. @param _font - Reference font. @param text - Character. @returns Advance in twips. */
  measureTextWidth: (_font, text) => (text === " " ? 52 : 118),
};

it("keeps the original XLSX indentation levels with the same reference font metrics", /** Ports the focused tdf130104 export regression. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(fixture("tdf130104_indent.xlsx"), metric);
  let reopened: ScDocument | undefined;
  try {
    reopened = await ExcelFilter.importDocument(await exportXlsx(source, metric), metric);
    for (const doc of [source, reopened])
      for (const [row, units] of [
        [0, 0],
        [2, 1],
        [5, 2],
        [8, 3],
        [11, 4],
        [14, 5],
        [17, 6],
        [20, 7],
        [23, 8],
        [26, 9],
        [29, 10],
      ] as const)
        expect(value(doc, 0, row, W.ATTR_INDENT)).toBe(3 * 52 * units);
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});

it("uses the distinct native headless indentation fallbacks", /** Replays the original three-unit indent without a reference device. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(fixture("tdf130104_indent.xlsx"));
  let reopened: ScDocument | undefined;
  try {
    expect(value(source, 0, 8, W.ATTR_INDENT)).toBe(510);
    reopened = await ExcelFilter.importDocument(await exportXlsx(source));
    expect(value(reopened, 0, 8, W.ATTR_INDENT)).toBe(680);
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});

it("preserves both original Excel reading orders through Worker transport and XLSX export", /** Ports the pinned writingMode regression through the real browser graph codec. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(fixture("writingMode.xlsx"));
  let copy: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  try {
    copy = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
    const bytes = await exportXlsx(copy);
    const styles = await (await DocumentArchive.open(bytes)).readTextEntry("xl/styles.xml");
    expect(styles).toContain('readingOrder="1"');
    expect(styles).toContain('readingOrder="2"');
    reopened = await ExcelFilter.importDocument(bytes);
    for (const doc of [source, copy, reopened]) {
      expect(value(doc, 0, 3, W.ATTR_WRITINGDIR)).toBe(D.Horizontal_LR_TB);
      expect(value(doc, 0, 4, W.ATTR_WRITINGDIR)).toBe(D.Horizontal_RL_TB);
    }
  } finally {
    reopened?.Dispose();
    copy?.Dispose();
    source.Dispose();
  }
});

it("imports explicit alignment and protection even when both native apply flags are zero", /** Ports all alignment and protection assertions from the unchanged tdf123139. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(fixture("tdf123139_applyAlignment.xlsx"));
  let worker: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  let primary: ScDocument | undefined;
  try {
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
    const bytes = await exportXlsx(worker);
    const archive = await DocumentArchive.open(bytes);
    const sheet = await archive.readTextEntry("xl/worksheets/sheet1.xml");
    expect(sheet).toMatch(
      /<c\b[^>]*\br="C1"[^>]*\bt="str"[^>]*><f>CONCATENATE\([^<]+\)<\/f><v>hidden {2}formula<\/v>/u,
    );
    const styles = await archive.readTextEntry("xl/styles.xml");
    expect(styles).toContain('<protection locked="true" hidden="true"/>');
    expect(styles).toContain('<protection locked="false" hidden="false"/>');
    reopened = await ExcelFilter.importDocument(bytes);
    primary = await readOdsDocument(await writeOdsDocument(worker));
    for (const doc of [source, worker, reopened, primary]) {
      expect(value(doc, 0, 0, W.ATTR_HOR_JUSTIFY)).toBe(H.Repeat);
      expect(value(doc, 0, 1, W.ATTR_HOR_JUSTIFY)).toBe(H.Center);
      expect(value(doc, 2, 0, W.ATTR_HOR_JUSTIFY)).toBe(H.Standard);
      expect(value(doc, 2, 1, W.ATTR_HOR_JUSTIFY)).toBe(H.Block);
      expect(protection(doc, 0, 1)).toEqual([true, false, false, false]);
      expect(protection(doc, 2, 0)).toEqual([true, true, false, false]);
      expect(protection(doc, 2, 1)).toEqual([false, false, false, false]);
      const formula = doc.GetFormulaCell(new ScAddress(2, 0, 0));
      expect(formula).toBeDefined();
      expect(formula && text(formula.GetString().getString())).toBe("hidden  formula");
      const expression = formula?.GetFormula(FormulaGrammar.Grammar.GRAM_OOXML);
      try {
        expect(expression && text(expression)).toBe('=CONCATENATE("hidden "," formula")');
      } finally {
        expression?.dispose();
      }
    }
  } finally {
    primary?.Dispose();
    reopened?.Dispose();
    worker?.Dispose();
    source.Dispose();
  }
});

it("preserves the native XLSX reference-string policy through Worker and primary ODS", /** Ports both tdf169326 assertions over the original workbook. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(
    fixture("tdf169326_ignore_line_breaks_in_referenced_cells.xlsx"),
  );
  const expression = unicode("=A1");
  const reference = new ScAddress(1, 1, 0);
  const added = new ScAddress(2, 2, 0);
  let worker: ScDocument | undefined;
  let ods: ScDocument | undefined;
  let xlsx: ScDocument | undefined;
  try {
    source.SetFormula(added, expression, FormulaGrammar.Grammar.GRAM_OOXML);
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
    const odsBytes = await writeOdsDocument(worker);
    const styles = await (await DocumentArchive.open(odsBytes)).readTextEntry("styles.xml");
    expect(styles).toMatch(
      /<style:default-style style:family="table-cell"><style:table-cell-properties[^>]*fo:wrap-option="wrap"/u,
    );
    ods = await readOdsDocument(odsBytes);
    xlsx = await ExcelFilter.importDocument(await exportXlsx(worker));
    const fresh = new ScAddress(3, 3, 0);
    for (const document of [source, worker, ods, xlsx]) {
      expect(document.GetDocOptions().IsIgnoreLineBreaks()).toBe(true);
      expect(value(document, 3, 0, W.ATTR_LINEBREAK)).toBe(false);
      document.SetFormula(fresh, expression, FormulaGrammar.Grammar.GRAM_OOXML);
      for (const address of [reference, added, fresh]) {
        const cell = document.GetFormulaCell(address);
        expect(cell && text(cell.GetString().getString())).toBe("HelloWorld");
      }
    }
  } finally {
    xlsx?.Dispose();
    ods?.Dispose();
    worker?.Dispose();
    source.Dispose();
    expression.dispose();
  }
});

it("round-trips Strict rotation, stacking, justification and shrink through XLSX and ODS", /** Checks source angle defaults, border reference and original ODF projection. @returns Completion. */ async () => {
  const fixtureZip = await DocumentArchive.open(fixture("writingMode.xlsx"));
  const archive = new DocumentArchiveWriter();
  const ns = strictSpreadsheetNamespace;
  const styles = `<styleSheet xmlns="${ns}"><fonts><font><name val="Calibri"/></font></fonts><borders><border/><border><top style="thin"/></border></borders><cellStyleXfs><xf fontId="0" borderId="0"/></cellStyleXfs><cellXfs><xf borderId="0" xfId="0"/><xf borderId="1" xfId="0"><alignment textRotation="135" vertical="distributed" indent="3" shrinkToFit="1" readingOrder="2"/></xf><xf borderId="0" xfId="0"><alignment textRotation="255" horizontal="distributed" vertical="justify" wrapText="0"/></xf><xf xfId="0"><alignment textRotation="12" indent="2147483648" readingOrder="invalid" vertical="unknown"/></xf><xf xfId="0"><alignment textRotation="180" indent="-2"/></xf></cellXfs><cellStyles><cellStyle name="Normal" builtinId="0" xfId="0"/></cellStyles></styleSheet>`;
  const sheet = `<worksheet xmlns="${ns}"><sheetData><row r="1"><c r="A1" s="1"><v>1</v></c><c r="B1" s="2"><v>2</v></c><c r="C1" s="3"><v>3</v></c><c r="D1" s="4"><v>4</v></c></row></sheetData></worksheet>`;
  for (const part of fixtureZip.getEntryNames()) {
    const xml =
      part === "xl/styles.xml" ? styles : part === "xl/worksheets/sheet1.xml" ? sheet : null;
    archive.putNextEntry(
      part,
      xml === null ? await fixtureZip.readEntry(part) : new TextEncoder().encode(xml),
    );
  }
  const source = await ExcelFilter.importDocument(await archive.finish(), metric);
  let xlsx: ScDocument | undefined;
  let ods: ScDocument | undefined;
  try {
    xlsx = await ExcelFilter.importDocument(await exportXlsx(source, metric), metric);
    ods = await readOdsDocument(await writeOdsDocument(source));
    for (const doc of [source, xlsx, ods]) {
      expect(value(doc, 0, 0, W.ATTR_ROTATE_VALUE)).toBe(31500);
      expect(value(doc, 0, 0, W.ATTR_ROTATE_MODE)).toBe(M.SVX_ROTATE_MODE_BOTTOM);
      expect(value(doc, 0, 0, W.ATTR_INDENT)).toBe(468);
      expect(value(doc, 0, 0, W.ATTR_HOR_JUSTIFY)).toBe(H.Right);
      expect(value(doc, 0, 0, W.ATTR_VER_JUSTIFY)).toBe(V.Block);
      expect(value(doc, 0, 0, W.ATTR_SHRINKTOFIT)).toBe(true);
      expect(value(doc, 0, 0, W.ATTR_LINEBREAK)).toBe(true);
      expect(value(doc, 1, 0, W.ATTR_STACKED)).toBe(true);
      expect(value(doc, 1, 0, W.ATTR_LINEBREAK)).toBe(true);
      expect(value(doc, 1, 0, W.ATTR_HOR_JUSTIFY_METHOD)).toBe(1);
      expect(value(doc, 2, 0, W.ATTR_INDENT)).toBe(0);
      expect(value(doc, 3, 0, W.ATTR_ROTATE_VALUE)).toBe(27000);
    }
  } finally {
    ods?.Dispose();
    xlsx?.Dispose();
    source.Dispose();
  }
  expect([9000, 13500, 18000, 22500, 35900, 36000].map(GetXclRotation)).toEqual([
    90, 135, 0, 45, 91, 0,
  ]);
});

it("reads the original FODS hundredth-degree rotation and preserves the native whole-degree export", /** Ports tdf161483 using the original source cell style records. @returns Completion. */ async () => {
  const flat = readFileSync(
    "../../vendor/libreoffice-reference/sc/qa/unit/data/fods/tdf161483_CellTextRotation.fods",
    "utf8",
  );
  const originalStyles = /<office:styles>[\s\S]*?<\/office:styles>/u.exec(flat)?.[0] ?? "";
  const originalCellStyles =
    originalStyles
      .match(
        /<style:style\b[^>]*style:family="table-cell"[^>]*(?<!\/)>(?:(?!<style:style\b)[\s\S])*?<\/style:style>/gu,
      )
      ?.filter(
        /** Selects cell styles to which the native QA applies. @param style - Original style XML. @returns Whether it has a rotation. */
        (style) => style.includes("style:rotation-angle"),
      ) ?? [];
  expect(originalCellStyles).toHaveLength(4);
  const document = new ScDocument();
  const importer = new ScXMLImport(document);
  try {
    const root =
      '<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0">';
    const cells = originalCellStyles.map(
      /** Assigns the native style with its original name. @param style - Original style. @returns Cell. */
      (style) =>
        `<table:table-cell table:style-name="${/style:name="([^"]+)"/u.exec(style)?.[1]}" office:value-type="float" office:value="1"/>`,
    );
    importer.importContent(
      `${root}<office:automatic-styles>${originalCellStyles.join("")}</office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Sheet"><table:table-row>${cells.join("")}</table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`,
    );
    for (let col = 0; col < 4; ++col)
      expect(value(document, col, 0, W.ATTR_ROTATE_VALUE)).toBe(3267);
    const copy = await readOdsDocument(await writeOdsDocument(document));
    try {
      expect(value(copy, 0, 0, W.ATTR_ROTATE_VALUE)).toBe(3200);
    } finally {
      copy.Dispose();
    }
  } finally {
    importer.DisposeStyles();
    document.Dispose();
  }
});

it("handles explicit ODF alignment defaults and rejects invalid lexical values", /** Verifies real automatic cell style dispatch and ODS reload. @returns Completion. */ async () => {
  const ns = "urn:oasis:names:tc:opendocument:xmlns:";
  const root = `<office:document-content xmlns:office="${ns}office:1.0" xmlns:style="${ns}style:1.0" xmlns:table="${ns}table:1.0">`;
  const styles =
    '<style:style style:name="valid" style:family="table-cell"><style:table-cell-properties style:direction="ltr" style:vertical-justify="auto" style:shrink-to-fit="false"/></style:style><style:style style:name="invalid" style:family="table-cell"><style:table-cell-properties style:direction="invalid" style:rotation-angle="invalid" style:rotation-align="invalid" style:shrink-to-fit="invalid" style:vertical-justify="invalid"/></style:style>';
  const document = new ScDocument();
  const importer = new ScXMLImport(document);
  try {
    importer.importContent(
      `${root}<office:automatic-styles>${styles}</office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Sheet"><table:table-row><table:table-cell table:style-name="valid" office:value-type="float" office:value="1"/><table:table-cell table:style-name="invalid" office:value-type="float" office:value="2"/></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`,
    );
    const bytes = await writeOdsDocument(document);
    const content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    expect(content).toContain('style:direction="ltr"');
    expect(content).toContain('style:shrink-to-fit="false"');
    expect(content).toContain('loext:vertical-justify="auto"');
    const copy = await readOdsDocument(bytes);
    try {
      for (const sheet of [document, copy]) {
        expect(value(sheet, 0, 0, W.ATTR_STACKED)).toBe(false);
        expect(value(sheet, 1, 0, W.ATTR_ROTATE_VALUE)).toBe(0);
      }
    } finally {
      copy.Dispose();
    }
  } finally {
    importer.DisposeStyles();
    document.Dispose();
  }
});

it("resolves Strict protection defaults across Normal and cell XF overrides", /** Verifies parent comparison, explicit application and round-trip metadata. @returns Completion. */ async () => {
  const template = await DocumentArchive.open(fixture("writingMode.xlsx"));
  const archive = new DocumentArchiveWriter();
  const ns = strictSpreadsheetNamespace;
  const styles = `<styleSheet xmlns="${ns}"><fonts><font><name val="Calibri"/></font></fonts><cellStyleXfs><xf fontId="0"><protection locked="false" hidden="true"/></xf><xf fontId="0" applyProtection="0"><protection locked="0" hidden="1"/></xf></cellStyleXfs><cellXfs><xf xfId="0"/><xf xfId="0" applyProtection="0"><protection hidden="1"/></xf><xf xfId="1" applyProtection="0"/><xf xfId="0"><protection locked="off" hidden="2"/></xf></cellXfs><cellStyles><cellStyle name="Normal" builtinId="0" xfId="0"/></cellStyles></styleSheet>`;
  const sheet = `<worksheet xmlns="${ns}"><sheetData><row r="1"><c r="A1" s="0"><v>1</v></c><c r="B1" s="1"><v>2</v></c><c r="C1" s="2"><v>3</v></c><c r="D1" s="3"><v>4</v></c></row></sheetData></worksheet>`;
  for (const part of template.getEntryNames()) {
    const xml =
      part === "xl/styles.xml" ? styles : part === "xl/worksheets/sheet1.xml" ? sheet : null;
    archive.putNextEntry(
      part,
      xml === null ? await template.readEntry(part) : new TextEncoder().encode(xml),
    );
  }
  const source = await ExcelFilter.importDocument(await archive.finish());
  let reopened: ScDocument | undefined;
  let copy: ScDocument | undefined;
  try {
    copy = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
    const bytes = await exportXlsx(copy);
    const output = await DocumentArchive.open(bytes);
    expect(await output.readTextEntry("xl/styles.xml")).toMatch(
      /<cellStyleXfs[^>]*>.*?<protection locked="false" hidden="true"\/>.*?<\/cellStyleXfs>/u,
    );
    reopened = await ExcelFilter.importDocument(bytes);
    for (const document of [source, copy, reopened]) {
      expect(protection(document, 0, 0)).toEqual([true, false, false, false]);
      expect(protection(document, 1, 0)).toEqual([true, true, false, false]);
      expect(protection(document, 2, 0)).toEqual([true, false, false, false]);
      expect(protection(document, 3, 0)).toEqual([false, true, false, false]);
    }
  } finally {
    reopened?.Dispose();
    copy?.Dispose();
    source.Dispose();
  }
});

it("merges the original ODF cell and print visibility values and projects them to the two XLSX flags", /** Tests the original XmlScPropHdl_CellProtection and PrintContent branches. @returns Completion. */ async () => {
  const ns = "urn:oasis:names:tc:opendocument:xmlns:";
  const table = '<table:table-cell office:value-type="float" office:value="1"';
  const cases = [
    ['style:cell-protect="none"', [false, false, false, false]],
    [
      'style:cell-protect="hidden-and-protected" style:print-content="false"',
      [true, true, true, true],
    ],
    ['style:cell-protect="protected"', [true, false, false, false]],
    ['style:cell-protect="formula-hidden"', [false, true, false, false]],
    [
      'style:print-content="false" style:cell-protect="formula-hidden protected"',
      [true, true, false, true],
    ],
    ['style:cell-protect="bad lexical"', [false, false, false, false]],
    ['style:print-content="false"', [true, false, false, true]],
    ['style:print-content="invalid"', [true, false, false, false]],
    ['style:print-content="true"', [true, false, false, false]],
    ['style:cell-protect="other"', [false, false, false, false]],
  ] as const;
  const styles: string[] = [];
  const cells: string[] = [];
  cases.forEach(
    /** Projects each actual lexical attribute into a native automatic style. @param entry - ODF case. @param index - Style index. @returns Nothing. */
    ([attributes], index) => {
      styles.push(
        `<style:style style:name="p${index}" style:family="table-cell"><style:table-cell-properties ${attributes}/></style:style>`,
      );
      cells.push(`${table} table:style-name="p${index}"/>`);
    },
  );
  const document = new ScDocument();
  const importer = new ScXMLImport(document);
  let ods: ScDocument | undefined;
  let xlsx: ScDocument | undefined;
  try {
    importer.importContent(
      `<office:document-content xmlns:office="${ns}office:1.0" xmlns:style="${ns}style:1.0" xmlns:table="${ns}table:1.0"><office:automatic-styles>${styles.join("")}</office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Sheet"><table:table-row>${cells.join("")}</table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`,
    );
    ods = await readOdsDocument(await writeOdsDocument(document));
    xlsx = await ExcelFilter.importDocument(await exportXlsx(document));
    for (const [col, [, expected]] of cases.entries()) {
      expect(protection(document, col, 0)).toEqual(expected);
      expect(protection(ods, col, 0)).toEqual(expected);
      expect(protection(xlsx, col, 0)).toEqual([
        expected[0],
        expected[1] || expected[2],
        false,
        false,
      ]);
    }
  } finally {
    xlsx?.Dispose();
    ods?.Dispose();
    importer.DisposeStyles();
    document.Dispose();
  }
});
