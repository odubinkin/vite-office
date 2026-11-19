/** @fileoverview SpreadsheetML fixture and real native workbook save/reopen. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";
import { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import type { EECharAttrib } from "../../../../editeng/inc/editdata";
import { EE_CHAR_ESCAPEMENT, EE_CHAR_ITALIC, EE_CHAR_WEIGHT } from "../../../../editeng/inc/eeitem";
import { SvxEscapement } from "../../../../editeng/inc/svxenum";
import type { SvxEscapementItem } from "../../../../editeng/source/items/textitem.escapement";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxContourItem } from "../../../../editeng/inc/contouritem";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import type { SvxFontItem } from "../../../../editeng/inc/fontitem";
import {
  SvxHorJustifyItem,
  SvxJustifyMethodItem,
  SvxVerJustifyItem,
} from "../../../../editeng/inc/justifyitem";
import {
  SvxCellHorJustify,
  SvxCellJustifyMethod,
  SvxCellVerJustify,
} from "../../../../editeng/inc/svxenum";
import { SvxShadowedItem } from "../../../../editeng/inc/shdditem";
import { SvxUnderlineItem } from "../../../../editeng/inc/udlnitem";
import {
  SvxFontHeightItem,
  SvxPostureItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import { Color } from "../../../../tools/inc/color";
import {
  FontItalic,
  FontLineStyle,
  FontStrikeout,
  FontWeight,
} from "../../../../tools/inc/fontenum";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { LANGUAGE_GERMAN } from "../../../../i18nlangtag/inc/lang";
import { SfxUInt32Item } from "../../../../svl/source/items/intitem";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { CellAttributeHolder, ScPatternAttr } from "../../../inc/patattr";
import type { ScMergeAttr, ScMergeFlagAttr } from "../../../inc/attrib";
import { ScLineBreakCell } from "../../../inc/attrib";
import * as Which from "../../../inc/scitems";
import { exportXlsx } from "../excel/xetable";
import { ExcelFilter } from "./excelfilter";
import { normalizeFormatCode, NumberFormatsBuffer } from "./numberformatsbuffer";
import { spreadsheetNamespace } from "./workbookfragment";
import { readOdsDocument, writeOdsDocument } from "../xml/xmlwrap";
import { CellType } from "../../../inc/global";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import { writeOutput } from "../../../../test/oox-output";
import { SharedStringsFragment } from "./sharedstringsfragment";
import { SharedStringsBuffer } from "./sharedstringsbuffer";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";

it("retains the original hidden worksheet visibility through XLSX and primary ODS", /** Ports testHiddenSheetsXLSX and exercises the actual file filters and Worker transport. @returns Completion. */ async () => {
  const fixture = readFileSync(
    resolve("../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/hidden_sheets.xlsx"),
  );
  const doc = await ExcelFilter.importDocument(fixture);
  let worker: ScDocument | undefined;
  let stored: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  try {
    expect(doc.GetVisibleTab()).toBe(1);
    expect(doc.IsVisible(-1)).toBe(false);
    expect(doc.IsVisible(3)).toBe(false);
    doc.SetVisible(3, true);
    const sheet = doc.FetchTable(1);
    sheet?.SetStreamValid(true);
    doc.SetVisible(1, true);
    expect(sheet?.IsStreamValid()).toBe(true);
    doc.SetVisible(1, false);
    expect(sheet?.IsStreamValid()).toBe(false);
    doc.SetVisible(1, true);
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(doc)));
    expect(worker.GetVisibleTab()).toBe(1);
    stored = await readOdsDocument(await writeOdsDocument(worker));
    const bytes = await exportXlsx(stored);
    const archive = await DocumentArchive.open(bytes);
    const xml = await archive.readTextEntry("xl/workbook.xml");
    expect(xml).toContain('<workbookView activeTab="1"/>');
    expect(xml.match(/<sheet name="Sheet\d" sheetId="\d" state="(hidden|visible)"/g)).toEqual([
      '<sheet name="Sheet1" sheetId="1" state="hidden"',
      '<sheet name="Sheet2" sheetId="2" state="visible"',
      '<sheet name="Sheet3" sheetId="3" state="hidden"',
    ]);
    reopened = await ExcelFilter.importDocument(bytes);
    for (const candidate of [doc, worker, stored, reopened]) {
      expect(candidate.GetTableCount()).toBe(3);
      expect([candidate.IsVisible(0), candidate.IsVisible(1), candidate.IsVisible(2)]).toEqual([
        false,
        true,
        false,
      ]);
    }
  } finally {
    reopened?.Dispose();
    stored?.Dispose();
    worker?.Dispose();
    doc.Dispose();
  }
});

it("retains Normal alignment and fill while a descendant resets them", /** Checks the same native style base across XLSX and ODS serialization. @returns Completion. */ async () => {
  const document = new ScDocument();
  const name = unicode("Default styles");
  const base = new ScPatternAttr(document.getCellAttributeHelper());
  const centered = new SvxHorJustifyItem(SvxCellHorJustify.Center, Which.ATTR_HOR_JUSTIFY);
  const inheritedFill = new SvxBrushItem(new Color(0xb0c0d0), Which.ATTR_BACKGROUND);
  const general = new SvxHorJustifyItem(SvxCellHorJustify.Standard, Which.ATTR_HOR_JUSTIFY);
  const noFill = new SvxBrushItem(Which.ATTR_BACKGROUND);
  let xlsx: ScDocument | undefined, ods: ScDocument | undefined;
  try {
    base.ItemSetPut(centered);
    base.ItemSetPut(inheritedFill);
    document.GetStyleSheetPool()?.SetDefaultCellStyle(base.GetItemSet());
    document.InsertTab(0, name);
    document.SetValue(new ScAddress(0, 0, 0), 1);
    document.SetValue(new ScAddress(1, 0, 0), 2);
    const sheet = document.FetchTable(0);
    sheet?.ApplyAttr(1, 0, general);
    sheet?.ApplyAttr(1, 0, noFill);
    xlsx = await ExcelFilter.importDocument(await exportXlsx(document));
    ods = await readOdsDocument(await writeOdsDocument(xlsx));
    for (const copy of [document, xlsx, ods]) {
      const inherited = copy.GetPattern(new ScAddress(0, 0, 0));
      const reset = copy.GetPattern(new ScAddress(1, 0, 0));
      expect((inherited?.GetItem(Which.ATTR_HOR_JUSTIFY) as SvxHorJustifyItem).GetValue()).toBe(
        SvxCellHorJustify.Center,
      );
      expect((reset?.GetItem(Which.ATTR_HOR_JUSTIFY) as SvxHorJustifyItem).GetValue()).toBe(
        SvxCellHorJustify.Standard,
      );
      expect(
        (inherited?.GetItem(Which.ATTR_BACKGROUND) as SvxBrushItem)
          .GetColor()
          .equals(new Color(0xb0c0d0)),
      ).toBe(true);
      expect(
        (reset?.GetItem(Which.ATTR_BACKGROUND) as SvxBrushItem).GetColor().IsTransparent(),
      ).toBe(true);
    }
  } finally {
    ods?.Dispose();
    xlsx?.Dispose();
    noFill.Dispose();
    general.Dispose();
    inheritedFill.Dispose();
    centered.Dispose();
    base.Dispose();
    name.dispose();
    document.Dispose();
  }
});

/** Formats a native cell with its effective workbook format. @param document - Native workbook. @param address - Cell address. @returns Display text. */
function display(document: ScDocument, address: ScAddress): string {
  const formatter = document.GetFormatTable();
  const format = document.GetPattern(address)?.GetNumberFormat(formatter) ?? 0;
  const result = new OUString();
  try {
    formatter.GetOutputString(document.GetValue(address), format, result, [null]);
    return text(result);
  } finally {
    result.dispose();
  }
}

/** Extracts the actual scalar or edit-cell value through the native document. @param document - Workbook. @param address - Native cell address. @returns Literal text. */
function getText(document: ScDocument, address: ScAddress): string {
  const cell = document.GetRefCellValue(address);
  const edit = cell.getEditText();
  if (!edit) {
    const string = cell.getSharedString();
    return string ? text(string.getString()) : "";
  }
  const engine = document.GetEditEngine();
  engine.SetText(edit);
  const paragraphs: string[] = [];
  for (let i = 0; i < edit.GetParagraphCount(); ++i) {
    const value = engine.GetParagraphText(i);
    try {
      paragraphs.push(text(value));
    } finally {
      value.dispose();
    }
  }
  return paragraphs.join("\n");
}

it("imports the original escaped Unicode fixture and reopens its multiline cell from XLSX and primary ODS", /** Ports testEscapedUnicodeXLSX and checks both actual output owners. @returns Completion. */ async () => {
  const fixture = readFileSync(
    resolve("../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/escape-unicode.xlsx"),
  );
  const document = await ExcelFilter.importDocument(fixture);
  let xlsx: ScDocument | undefined;
  let ods: ScDocument | undefined;
  try {
    const bytes = await exportXlsx(document);
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry("xl/sharedStrings.xml");
    expect(xml).not.toContain("_x000D_");
    xlsx = await ExcelFilter.importDocument(bytes);
    ods = await readOdsDocument(await writeOdsDocument(document));
    const address = new ScAddress(1, 1, 0);
    for (const copy of [document, xlsx, ods]) {
      expect(copy.GetCellType(address)).toBe(CellType.CELLTYPE_EDIT);
      expect(getText(copy, address)).toBe("Line 1\nLine 2\nLine 3\nLine 4");
    }
  } finally {
    ods?.Dispose();
    xlsx?.Dispose();
    document.Dispose();
  }
});

it("preserves text whitespace and run weight in the original no-wrap LibreOffice fixture", /** Ports the text and style assertions of testPreserveTextWhitespace2XLSX. @returns Completion. */ async () => {
  const fixture = readFileSync(
    resolve("../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/preserve_space.xlsx"),
  );
  const document = await ExcelFilter.importDocument(fixture);
  let reopened: ScDocument | undefined;
  let ods: ScDocument | undefined;
  try {
    const bytes = await exportXlsx(document);
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry("xl/sharedStrings.xml");
    expect(xml.match(/<t xml:space="preserve">/gu)).toHaveLength(3);
    expect(xml).toMatch(
      /<rPr><b val="true"\/>[^<]*(?:<[^>]+\/>)*<\/rPr><t xml:space="preserve">123&#10;<\/t>/u,
    );
    reopened = await ExcelFilter.importDocument(bytes);
    const address = new ScAddress(1, 0, 0);
    const primary = await writeOdsDocument(document);
    const content = await (await DocumentArchive.open(primary)).readTextEntry("content.xml");
    expect(content).toContain('style:family="text"');
    expect(content).toMatch(/<text:span text:style-name="T\d+">123<\/text:span>/u);
    ods = await readOdsDocument(primary);
    for (const copy of [document, reopened, ods]) {
      expect(getText(copy, address)).toBe("123\n456");
      const edit = copy.GetRefCellValue(address).getEditText();
      const first: EECharAttrib[] = [],
        second: EECharAttrib[] = [];
      edit?.GetCharAttribs(0, first);
      edit?.GetCharAttribs(1, second);
      const heavy = first.find(
        /** Finds the full first text run. @param item - Native attribute. @returns Match. */
        (item) => item.pAttr?.Which() === EE_CHAR_WEIGHT && item.nEnd === 3,
      );
      const normal = second.find(
        /** Finds the full second text run. @param item - Native attribute. @returns Match. */
        (item) => item.pAttr?.Which() === EE_CHAR_WEIGHT && item.nEnd === 3,
      );
      expect((heavy?.pAttr as SvxWeightItem | undefined)?.GetValue()).toBe(FontWeight.WEIGHT_BOLD);
      expect((normal?.pAttr as SvxWeightItem | undefined)?.GetValue()).toBe(
        FontWeight.WEIGHT_NORMAL,
      );
    }
    expect(
      (reopened.GetPattern(address)?.GetItem(Which.ATTR_LINEBREAK) as ScLineBreakCell).GetValue(),
    ).toBe(false);
  } finally {
    ods?.Dispose();
    reopened?.Dispose();
    document.Dispose();
  }
});

it("reports a broken worksheet after styled cells were imported", /** Verifies native cleanup preserves the format failure after a workbook has live styles. @returns Completion. */ async () => {
  const fixture = readFileSync(
    resolve("../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/preserve_space.xlsx"),
  );
  const source = await DocumentArchive.open(fixture);
  const writer = new DocumentArchiveWriter();
  for (const entry of source.getEntryNames()) {
    if (entry === "xl/worksheets/sheet1.xml") {
      const xml = await source.readTextEntry(entry);
      const broken = xml.replace("</sheetData>", "</broken>");
      expect(broken).toContain("</broken>");
      writer.putNextEntry(entry, new TextEncoder().encode(broken));
    } else writer.putNextEntry(entry, await source.readEntry(entry));
  }
  await expect(ExcelFilter.importDocument(await writer.finish())).rejects.toThrow(
    "Excel worksheet is missing or invalid",
  );
});

it("keeps shared-string positions and decodes XString escapes within each original run", /** Uses the actual workbook filter and package storage for shared and inline text. @returns Completion. */ async () => {
  const storage = new ZipStorage();
  const relationship = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/";
  const relationRoot = "http://schemas.openxmlformats.org/package/2006/relationships";
  const parts = [
    [
      "_rels/.rels",
      "application/vnd.openxmlformats-package.relationships+xml",
      `<Relationships xmlns="${relationRoot}"><Relationship Id="rId1" Type="${relationship}officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    ],
    [
      "xl/_rels/workbook.xml.rels",
      "application/vnd.openxmlformats-package.relationships+xml",
      `<Relationships xmlns="${relationRoot}"><Relationship Id="rId1" Type="${relationship}worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="${relationship}sharedStrings" Target="sharedStrings.xml"/><Relationship Id="rId3" Type="${relationship}styles" Target="styles.xml"/></Relationships>`,
    ],
    [
      "xl/workbook.xml",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml",
      `<workbook xmlns="${spreadsheetNamespace}" xmlns:r="${relationship.slice(0, -1)}"><sheets><sheet name="Text" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    ],
    [
      "xl/sharedStrings.xml",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml",
      `<sst xmlns="${spreadsheetNamespace}" xmlns:x="urn:extension"><x:si><x:t>ignored</x:t></x:si><si><t>first item</t></si><si/><si><t x:hint="ignored" xml:space="preserve"> a_x0<![CDATA[009]]>_b </t></si><si><x:t>ignored</x:t><r> <t>left_x00</t> </r><r><t>41_right</t></r><rPh sb="0" eb="1"><t>phonetic</t></rPh></si><extLst/></sst>`,
    ],
    [
      "xl/styles.xml",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml",
      `<styleSheet xmlns="${spreadsheetNamespace}"><fonts><font/><font><vertAlign val="subscript"/></font></fonts><cellXfs><xf fontId="0"/><xf fontId="1" applyFont="1"/></cellXfs></styleSheet>`,
    ],
    [
      "xl/other.xml",
      "application/xml",
      `<si xmlns="${spreadsheetNamespace}"><t>not an SST root</t></si>`,
    ],
    [
      "xl/worksheets/sheet1.xml",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml",
      `<worksheet xmlns="${spreadsheetNamespace}"><sheetData><row r="1"><c r="A1" t="s"><v>1</v></c><c r="B1" t="s"><v>2</v></c><c r="C1" t="s"><v>3</v></c><c r="D1" t="s"><v>99</v></c><c r="E1" t="inlineStr"><is><r><rPr><i/><vertAlign val="superscript"/></rPr><t>first_x000A_</t></r><r><t xml:space="preserve">second </t></r></is></c><c r="F1" t="str"><v>_x0001_</v></c><c r="G1" t="s"><v>bad</v></c><c r="H1" s="1" t="inlineStr"><is><t>styled</t></is></c></row></sheetData></worksheet>`,
    ],
  ] as const;
  const encoder = new TextEncoder();
  for (const [path, mediaType, xml] of parts)
    writeOutput(storage.openOutputStream(path, mediaType), encoder.encode(xml));
  const bytes = await storage.commit();
  const input = await ZipStorage.open(bytes);
  const strings = new SharedStringsBuffer();
  try {
    const filter = new XmlFilterBase(input);
    expect(
      await filter.importFragment(new SharedStringsFragment(filter, "xl/other.xml", strings)),
    ).toBe(true);
    expect(strings.getString(0)).toBeUndefined();
  } finally {
    strings.dispose();
    input.dispose();
  }
  const first = await ExcelFilter.importDocument(bytes);
  let reopened: ScDocument | undefined;
  let ods: ScDocument | undefined;
  try {
    reopened = await ExcelFilter.importDocument(await exportXlsx(first));
    ods = await readOdsDocument(await writeOdsDocument(first));
    for (const document of [first, reopened, ods]) {
      expect(document.GetCellType(new ScAddress(0, 0, 0))).toBe(CellType.CELLTYPE_NONE);
      expect(getText(document, new ScAddress(1, 0, 0))).toBe(" a\tb ");
      expect(getText(document, new ScAddress(2, 0, 0))).toBe("left_x0041_right");
      expect(document.GetCellType(new ScAddress(3, 0, 0))).toBe(CellType.CELLTYPE_NONE);
      const inline = new ScAddress(4, 0, 0);
      expect(getText(document, inline)).toBe("first\nsecond ");
      const attributes: EECharAttrib[] = [];
      document.GetRefCellValue(inline).getEditText()?.GetCharAttribs(0, attributes);
      const italic = attributes.find(
        /** Finds the italic first portion. @param item - Native attribute. @returns Match. */
        (item) => item.pAttr?.Which() === EE_CHAR_ITALIC && item.nEnd === 5,
      );
      const superscript = attributes.find(
        /** Finds superscript on the first portion. @param item - Native attribute. @returns Match. */
        (item) => item.pAttr?.Which() === EE_CHAR_ESCAPEMENT && item.nEnd === 5,
      );
      expect((italic?.pAttr as SvxPostureItem | undefined)?.GetValue()).toBe(
        FontItalic.ITALIC_NORMAL,
      );
      expect((superscript?.pAttr as SvxEscapementItem | undefined)?.GetEscapement()).toBe(
        SvxEscapement.Superscript,
      );
      expect(getText(document, new ScAddress(5, 0, 0))).toBe("_x0001_");
      expect(getText(document, new ScAddress(6, 0, 0))).toBe("first item");
      const cellFontAttributes: EECharAttrib[] = [];
      document
        .GetRefCellValue(new ScAddress(7, 0, 0))
        .getEditText()
        ?.GetCharAttribs(0, cellFontAttributes);
      const subscript = cellFontAttributes.find(
        /** Finds the inherited cell escapement on the whole portion. @param item - Native attribute. @returns Match. */
        (item) => item.pAttr?.Which() === EE_CHAR_ESCAPEMENT && item.nEnd === 6,
      );
      expect((subscript?.pAttr as SvxEscapementItem | undefined)?.GetEscapement()).toBe(
        SvxEscapement.Subscript,
      );
    }
  } finally {
    ods?.Dispose();
    reopened?.Dispose();
    first.Dispose();
  }
});

it("imports actual Strict worksheet relationships, shared strings and formulas", /** Original upstream fixture contains multiple worksheets and values. @returns Completion. */ async () => {
  const raw = readFileSync(
    resolve(
      "../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/universal-content-strict.xlsx",
    ),
  );
  const document = await ExcelFilter.importDocument(new Uint8Array(raw));
  try {
    expect(document.GetTableCount()).toBe(2);
    expect(document.GetValue(new ScAddress(0, 0, 0))).toBe(1);
    expect(document.GetRefCellValue(new ScAddress(1, 0, 0)).getSharedString()).not.toBeNull();
    expect(document.GetFormulaCell(new ScAddress(2, 3, 0))?.GetValue()).toBe(11);
    const anchor = document
      .GetPattern(new ScAddress(4, 1, 0))
      ?.GetItem(Which.ATTR_MERGE) as ScMergeAttr;
    expect([anchor.GetColMerge(), anchor.GetRowMerge()]).toEqual([2, 2]);
    const overlap = document
      .GetPattern(new ScAddress(5, 2, 0))
      ?.GetItem(Which.ATTR_MERGE_FLAG) as ScMergeFlagAttr;
    expect(overlap.IsHorOverlapped() && overlap.IsVerOverlapped()).toBe(true);
    const archive = await DocumentArchive.open(await exportXlsx(document));
    expect(await archive.readTextEntry("xl/worksheets/sheet1.xml")).toContain(
      '<mergeCells count="1"><mergeCell ref="E2:F3"/></mergeCells>',
    );
  } finally {
    document.Dispose();
  }
});

it("imports the LibreOffice column defaults fixture and exports its formatting as a column span", /** Ports testColumnStyle2XLSX over native Calc cells. @returns Completion. */ async () => {
  const source = new Uint8Array(
    readFileSync(
      resolve("../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/column_style.xlsx"),
    ),
  );
  const first = await ExcelFilter.importDocument(source);
  let second: ScDocument | undefined;
  try {
    const bytes = await exportXlsx(first);
    const packageXml = await (
      await DocumentArchive.open(bytes)
    ).readTextEntry("xl/worksheets/sheet1.xml");
    expect(packageXml).toMatch(/<col min="1" max="1025" style="\d+"[^>]*\/>/);
    expect(packageXml).toContain("<sheetData></sheetData>");
    second = await ExcelFilter.importDocument(bytes);
    for (const document of [first, second]) {
      const pattern = document.GetPattern(new ScAddress(1, 1, 0));
      expect((pattern?.GetItem(Which.ATTR_FONT) as SvxFontItem).GetFamilyName()).toBe(
        "Linux Biolinum G",
      );
      expect((pattern?.GetItem(Which.ATTR_FONT_HEIGHT) as SvxFontHeightItem).GetHeight()).toBe(240);
      expect(
        (pattern?.GetItem(Which.ATTR_BACKGROUND) as SvxBrushItem)
          .GetColor()
          .equals(new Color(255, 51, 51)),
      ).toBe(true);
      expect((pattern?.GetItem(Which.ATTR_HOR_JUSTIFY) as SvxHorJustifyItem).GetValue()).toBe(
        SvxCellHorJustify.Center,
      );
    }
  } finally {
    second?.Dispose();
    first.Dispose();
  }
});

it("round trips visual styles on populated cells and sparse styled blanks", /** Checks native XF deduplication and row ordering over multirow attribute runs. @returns Completion. */ async () => {
  const document = new ScDocument();
  const name = unicode("Styles");
  try {
    document.InsertTab(0, name);
    const table = document.FetchTable(0);
    const address = new ScAddress(1, 799, 0);
    const blank = new ScAddress(2, 1200, 0);
    document.SetValue(address, 7);
    for (const item of [
      new SvxFontHeightItem(400, 100, Which.ATTR_FONT_HEIGHT),
      new SvxWeightItem(FontWeight.WEIGHT_BOLD, Which.ATTR_FONT_WEIGHT),
      new SvxPostureItem(FontItalic.ITALIC_NORMAL, Which.ATTR_FONT_POSTURE),
      new SvxCrossedOutItem(FontStrikeout.STRIKEOUT_SINGLE, Which.ATTR_FONT_CROSSEDOUT),
      new SvxContourItem(true, Which.ATTR_FONT_CONTOUR),
      new SvxShadowedItem(true, Which.ATTR_FONT_SHADOWED),
      new SvxUnderlineItem(FontLineStyle.LINESTYLE_SINGLE, Which.ATTR_FONT_UNDERLINE),
      new SvxColorItem(new Color(0x224466), Which.ATTR_FONT_COLOR),
      new SvxBrushItem(new Color(0xaabbcc), Which.ATTR_BACKGROUND),
      new SvxHorJustifyItem(SvxCellHorJustify.Block, Which.ATTR_HOR_JUSTIFY),
      new SvxVerJustifyItem(SvxCellVerJustify.Block, Which.ATTR_VER_JUSTIFY),
      new SvxJustifyMethodItem(SvxCellJustifyMethod.Distribute, Which.ATTR_HOR_JUSTIFY_METHOD),
      new SvxJustifyMethodItem(SvxCellJustifyMethod.Distribute, Which.ATTR_VER_JUSTIFY_METHOD),
      new ScLineBreakCell(true),
    ]) {
      try {
        table?.ApplyAttr(address.Col(), address.Row(), item);
        table?.ApplyAttr(blank.Col(), blank.Row(), item);
        table?.ApplyAttr(blank.Col(), blank.Row() + 1, item);
      } finally {
        item.Dispose();
      }
    }
    const profile = document.GetPattern(address);
    if (!profile || !table) throw new Error("Missing native cell style.");
    document.ApplyPatternAreaTab(3, 0, 3, document.MaxRow(), 0, profile);
    const normal = new CellAttributeHolder(
      document.getCellAttributeHelper().getDefaultCellAttribute(),
    );
    try {
      table.SetPattern(3, 12, normal);
    } finally {
      normal.Dispose();
    }
    document.SetValue(new ScAddress(3, 13, 0), 11);
    const bytes = await exportXlsx(document);
    const archive = await DocumentArchive.open(bytes);
    const sheet = await archive.readTextEntry("xl/worksheets/sheet1.xml");
    expect(sheet).toContain('<c r="B800" s="1"><v>7</v></c>');
    expect(sheet).toContain('<c r="C1201" s="1"/>');
    expect(sheet).toContain('<c r="C1202" s="1"/>');
    expect(sheet).toContain('<col min="4" max="4" style="1"');
    expect(sheet).toContain('<c r="D13" s="0"/>');
    expect(sheet).toContain('<c r="D14"><v>11</v></c>');
    expect(await archive.readTextEntry("xl/_rels/workbook.xml.rels")).toContain(
      'Target="styles.xml"',
    );
    const styles = await archive.readTextEntry("xl/styles.xml");
    expect(styles).toContain('<fonts count="2">');
    expect(styles).toContain('<cellXfs count="2">');
    expect(styles).toContain('<fgColor rgb="FFAABBCC"/>');
    expect(styles).toContain(
      '<alignment horizontal="distributed" vertical="distributed" textRotation="0" wrapText="1" indent="0" shrinkToFit="0"/>',
    );
    const reopened = await ExcelFilter.importDocument(bytes);
    try {
      expect(reopened.GetValue(address)).toBe(7);
      expect(
        (
          reopened
            .GetPattern(new ScAddress(3, 12, 0))
            ?.GetItem(Which.ATTR_BACKGROUND) as SvxBrushItem
        )
          .GetColor()
          .IsTransparent(),
      ).toBe(true);
      expect(
        (
          reopened
            .GetPattern(new ScAddress(3, 13, 0))
            ?.GetItem(Which.ATTR_FONT_HEIGHT) as SvxFontHeightItem
        ).GetHeight(),
      ).toBe(400);
      for (const cell of [address, blank]) {
        const pattern = reopened.GetPattern(cell);
        expect((pattern?.GetItem(Which.ATTR_FONT_HEIGHT) as SvxFontHeightItem).GetHeight()).toBe(
          400,
        );
        expect((pattern?.GetItem(Which.ATTR_FONT_WEIGHT) as SvxWeightItem).GetValue()).toBe(
          FontWeight.WEIGHT_BOLD,
        );
        expect(
          (pattern?.GetItem(Which.ATTR_FONT_UNDERLINE) as SvxUnderlineItem).GetLineStyle(),
        ).toBe(FontLineStyle.LINESTYLE_SINGLE);
        expect(
          (pattern?.GetItem(Which.ATTR_FONT_COLOR) as SvxColorItem)
            .GetValue()
            .equals(new Color(0x224466)),
        ).toBe(true);
        expect((pattern?.GetItem(Which.ATTR_VER_JUSTIFY) as SvxVerJustifyItem).GetValue()).toBe(
          SvxCellVerJustify.Block,
        );
        expect((pattern?.GetItem(Which.ATTR_FONT_CONTOUR) as SvxContourItem).GetValue()).toBe(true);
        expect((pattern?.GetItem(Which.ATTR_FONT_SHADOWED) as SvxShadowedItem).GetValue()).toBe(
          true,
        );
        expect(
          (pattern?.GetItem(Which.ATTR_VER_JUSTIFY_METHOD) as SvxJustifyMethodItem).GetValue(),
        ).toBe(SvxCellJustifyMethod.Distribute);
        expect((pattern?.GetItem(Which.ATTR_LINEBREAK) as ScLineBreakCell).GetValue()).toBe(true);
      }
    } finally {
      reopened.Dispose();
    }
  } finally {
    name.dispose();
    document.Dispose();
  }
});

it("relocates shared formulas from the pinned workbook using the native cell copy", /** Checks recalculation on a shared follower. @returns Completion. */ async () => {
  const raw = readFileSync(
    resolve("../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/shared-formula/basic.xlsx"),
  );
  const document = await ExcelFilter.importDocument(new Uint8Array(raw));
  try {
    const follower = document.GetFormulaCell(new ScAddress(1, 18, 0));
    expect(follower?.GetValue()).toBe(180);
    document.SetValue(new ScAddress(0, 18, 0), 3);
    expect(follower?.GetValue()).toBe(30);
  } finally {
    document.Dispose();
  }
});

it("honors explicit font zeros and inherited or overridden XF alignment", /** Uses independent style XML inside an upstream workbook envelope. @returns Completion. */ async () => {
  const source = await DocumentArchive.open(
    new Uint8Array(
      readFileSync(
        resolve("../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/column_style.xlsx"),
      ),
    ),
  );
  const styles = `<styleSheet xmlns="${spreadsheetNamespace}">
    <fonts count="3"><font><b val="0"/><u val="none"/></font><font><name val="Example Mono"/><family val="3"/><sz val="16.625"/><u val="doubleAccounting"/></font><font><name val="Fallback"/><family val="999"/><charset val="256"/><sz val="invalid"/><color auto="1"/></font></fonts>
    <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
    <cellStyleXfs count="2"><xf fontId="0" fillId="0"/><xf fontId="1" fillId="0"><alignment horizontal="fill" vertical="center" wrapText="1"/></xf></cellStyleXfs>
    <cellXfs count="4"><xf fontId="0" xfId="0"/><xf xfId="1" applyAlignment="0"/><xf xfId="1" applyAlignment="1"/><xf fontId="2" xfId="0"><alignment horizontal="right"/></xf></cellXfs>
  </styleSheet>`;
  const sheet = `<worksheet xmlns="${spreadsheetNamespace}"><sheetData><row r="1"><c r="A1"><v>1</v></c><c r="B1" s="1"><v>2</v></c><c r="C1" s="2"><v>3</v></c><c r="D1" s="3"><v>4</v></c><c r="E1" s="2147483648"><v>5</v></c></row></sheetData></worksheet>`;
  const external = new DocumentArchiveWriter();
  for (const path of source.getEntryNames()) {
    const replacement =
      path === "xl/styles.xml" ? styles : path === "xl/worksheets/sheet1.xml" ? sheet : null;
    external.putNextEntry(
      path,
      replacement === null ? await source.readEntry(path) : new TextEncoder().encode(replacement),
    );
  }
  const document = await ExcelFilter.importDocument(await external.finish());
  try {
    const standard = document.GetPattern(new ScAddress(0, 0, 0));
    expect((standard?.GetItem(Which.ATTR_FONT) as SvxFontItem).GetFamilyName()).toBe("Cambria");
    expect((standard?.GetItem(Which.ATTR_FONT_HEIGHT) as SvxFontHeightItem).GetHeight()).toBe(220);
    expect((standard?.GetItem(Which.ATTR_FONT_WEIGHT) as SvxWeightItem).GetValue()).toBe(
      FontWeight.WEIGHT_NORMAL,
    );
    const inherited = document.GetPattern(new ScAddress(1, 0, 0));
    expect((inherited?.GetItem(Which.ATTR_FONT_HEIGHT) as SvxFontHeightItem).GetHeight()).toBe(332);
    expect((inherited?.GetItem(Which.ATTR_FONT_UNDERLINE) as SvxUnderlineItem).GetLineStyle()).toBe(
      FontLineStyle.LINESTYLE_DOUBLE,
    );
    expect((inherited?.GetItem(Which.ATTR_HOR_JUSTIFY) as SvxHorJustifyItem).GetValue()).toBe(
      SvxCellHorJustify.Standard,
    );
    expect((inherited?.GetItem(Which.ATTR_VER_JUSTIFY) as SvxVerJustifyItem).GetValue()).toBe(
      SvxCellVerJustify.Bottom,
    );
    expect((inherited?.GetItem(Which.ATTR_LINEBREAK) as ScLineBreakCell).GetValue()).toBe(false);
    const override = document.GetPattern(new ScAddress(2, 0, 0));
    expect((override?.GetItem(Which.ATTR_HOR_JUSTIFY) as SvxHorJustifyItem).GetValue()).toBe(
      SvxCellHorJustify.Standard,
    );
    expect((override?.GetItem(Which.ATTR_LINEBREAK) as ScLineBreakCell).GetValue()).toBe(false);
    const fallback = document.GetPattern(new ScAddress(3, 0, 0));
    expect((fallback?.GetItem(Which.ATTR_FONT_HEIGHT) as SvxFontHeightItem).GetHeight()).toBe(220);
    expect((fallback?.GetItem(Which.ATTR_FONT) as SvxFontItem).GetFamilyName()).toBe("Fallback");
    expect((fallback?.GetItem(Which.ATTR_VER_JUSTIFY) as SvxVerJustifyItem).GetValue()).toBe(
      SvxCellVerJustify.Bottom,
    );
    expect(document.GetValue(new ScAddress(4, 0, 0))).toBe(5);
    expect(
      (
        document.GetPattern(new ScAddress(4, 0, 0))?.GetItem(Which.ATTR_FONT) as SvxFontItem
      ).GetFamilyName(),
    ).toBe("Cambria");
  } finally {
    document.Dispose();
  }
});

it("preserves built-in and custom numeric display through XLSX and the primary ODS format", /** Uses independent XLSX style IDs and checks real workbook rendering on every open. @returns Completion. */ async () => {
  const source = await DocumentArchive.open(
    new Uint8Array(
      readFileSync(
        resolve("../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/column_style.xlsx"),
      ),
    ),
  );
  const styles = `<styleSheet xmlns="${spreadsheetNamespace}"><numFmts count="2"><numFmt numFmtId="164" formatCode="[$]#,##0.000&quot; kg&quot;"/><numFmt numFmtId="165" formatCode="YYYY-MM-DD"/></numFmts><cellStyleXfs count="1"><xf numFmtId="0"/></cellStyleXfs><cellXfs count="5"><xf numFmtId="0" xfId="0"/><xf numFmtId="10" xfId="0"/><xf numFmtId="164" xfId="0"/><xf numFmtId="165" xfId="0"/><xf numFmtId="11" xfId="0"/></cellXfs></styleSheet>`;
  const sheet = `<worksheet xmlns="${spreadsheetNamespace}"><sheetData><row r="1"><c r="A1" s="1"><v>0.1234</v></c><c r="B1" s="2"><v>1234.5</v></c><c r="C1" s="3"><v>45292</v></c><c r="D1" s="2"/><c r="E1" s="4"><v>1290.5</v></c></row></sheetData></worksheet>`;
  const external = new DocumentArchiveWriter();
  for (const path of source.getEntryNames()) {
    const replacement =
      path === "xl/styles.xml" ? styles : path === "xl/worksheets/sheet1.xml" ? sheet : null;
    external.putNextEntry(
      path,
      replacement === null ? await source.readEntry(path) : new TextEncoder().encode(replacement),
    );
  }
  const first = await ExcelFilter.importDocument(await external.finish());
  let xlsx: ScDocument | undefined, ods: ScDocument | undefined;
  try {
    const xlsxBytes = await exportXlsx(first);
    const xlsxXml = await (await DocumentArchive.open(xlsxBytes)).readTextEntry("xl/styles.xml");
    expect(xlsxXml).toContain('<numFmts count="5">');
    expect(xlsxXml).toContain('<numFmt numFmtId="164" formatCode="General"/>');
    expect(xlsxXml).toContain('formatCode="#,##0.000&quot; kg&quot;"');
    expect(xlsxXml).toContain('applyNumberFormat="1"');
    xlsx = await ExcelFilter.importDocument(xlsxBytes);
    const odsBytes = await writeOdsDocument(xlsx);
    const odsXml = await (await DocumentArchive.open(odsBytes)).readTextEntry("content.xml");
    expect(odsXml).toContain("<number:percentage-style");
    expect(odsXml).toContain("<number:date-style");
    expect(odsXml).toContain("<number:scientific-number");
    expect(odsXml).toContain('style:data-style-name="');
    ods = await readOdsDocument(odsBytes);
    for (const document of [first, xlsx, ods]) {
      expect(display(document, new ScAddress(0, 0, 0))).toBe("12.34%");
      expect(display(document, new ScAddress(1, 0, 0))).toBe("1,234.500 kg");
      expect(display(document, new ScAddress(2, 0, 0))).toBe("2024-01-01");
      expect(display(document, new ScAddress(4, 0, 0))).toBe("1.29E+03");
      expect(document.GetValue(new ScAddress(0, 0, 0))).toBe(0.1234);
      const styledBlank = new ScAddress(3, 0, 0);
      expect(document.GetPattern(styledBlank)?.GetNumberFormatKey()).toBeGreaterThan(0);
    }
  } finally {
    ods?.Dispose();
    xlsx?.Dispose();
    first.Dispose();
  }
});

it("keeps non-fraction escapes in the pinned upstream workbook", /** Adapts testEscapeCharInNumberFormatXLSX by matching codes rather than generated IDs. @returns Completion. */ async () => {
  const file = new Uint8Array(
    readFileSync(resolve("../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/tdf81939.xlsx")),
  );
  const document = await ExcelFilter.importDocument(file);
  let ods: ScDocument | undefined;
  try {
    const styles = await (
      await DocumentArchive.open(await exportXlsx(document))
    ).readTextEntry("xl/styles.xml");
    expect(styles).toContain(String.raw`formatCode="00\ 00\ 00\ 00\ 00"`);
    expect(styles).toContain(String.raw`formatCode="00\.00\.00\.000\.0"`);
    expect(styles).toContain('formatCode="General"');
    expect(styles).toContain(
      String.raw`formatCode="_-* #,##0\ _€_-;\-* #,##0\ _€_-;_-* &quot;- &quot;_€_-;_-@_-"`,
    );
    expect(styles).toContain(
      String.raw`formatCode="_-* #,##0&quot; €&quot;_-;\-* #,##0&quot; €&quot;_-;_-* &quot;- €&quot;_-;_-@_-"`,
    );
    expect(styles).toContain(String.raw`formatCode="# ?/?;[RED]\-# #/#####"`);
    expect(document.GetValue(new ScAddress(0, 4, 0))).toBe(-Math.PI);
    const odsBytes = await writeOdsDocument(document);
    const odsXml = await (await DocumentArchive.open(odsBytes)).readTextEntry("content.xml");
    expect(odsXml).toContain('<number:embedded-text number:position="8"> </number:embedded-text>');
    ods = await readOdsDocument(odsBytes);
    for (const row of [0, 1]) {
      const address = new ScAddress(0, row, 0);
      expect(display(ods, address)).toBe(display(document, address));
    }
    expect(normalizeFormatCode(String.raw`"#\ ?/?" 0;[RED]#\ ?/?`)).toBe(
      String.raw`"#\ ?/?" 0;[RED]# ?/?`,
    );
  } finally {
    ods?.Dispose();
    document.Dispose();
  }
});

it("writes a local-format table entry in Excel scan syntax", /** Checks locale conversion using a native German formatter entry on a real cell. @returns Completion. */ async () => {
  const document = new ScDocument();
  const source = unicode('#.##0,000" kg"');
  try {
    document.InsertTab(0, unicode("Data"));
    const formatter = document.GetFormatTable();
    const key: [number] = [0];
    const check: [number] = [0];
    formatter.PutEntry(source, check, [0], key, LANGUAGE_GERMAN);
    expect(check[0]).toBe(0);
    expect(key[0]).toBeGreaterThan(0);
    document.SetValue(new ScAddress(0, 0, 0), 1234.5);
    document.FetchTable(0)?.ApplyAttr(0, 0, new SfxUInt32Item(Which.ATTR_VALUE_FORMAT, key[0]));
    const styles = await (
      await DocumentArchive.open(await exportXlsx(document))
    ).readTextEntry("xl/styles.xml");
    expect(styles).toContain('formatCode="#,##0.000&quot; kg&quot;"');
    const formats = new NumberFormatsBuffer();
    formats.importNumFmt(-1, "0.0");
    expect(normalizeFormatCode('0"unfinished')).toBe('0"unfinished');
    expect(formats.getNumberFormat(-1, formatter)).toBe(0);
    expect(formats.getNumberFormat(165, formatter)).toBe(0);
    expect(formats.getNumberFormat(49, formatter)).toBeGreaterThan(0);
  } finally {
    source.dispose();
    document.Dispose();
  }
});

it("round trips sparse values, escaped Unicode and formulas on native Calc tabs", /** Checks actual workbook parts and reopened native cells. @returns Completion. */ async () => {
  const document = new ScDocument();
  const first = unicode("Alpha & Omega"),
    second = unicode("Data"),
    value = unicode("  Ω & 漢字 "),
    formula = unicode("=SUM(A1,2)"),
    multiline = unicode("One\nTwo"),
    hashFirst = unicode("Aa"),
    hashSecond = unicode("BB"),
    stringFormula = unicode('="Complete"');
  try {
    expect(document.InsertTab(0, first)).toBe(true);
    expect(document.InsertTab(1, second)).toBe(true);
    document.SetValue(new ScAddress(0, 0, 0), 40);
    document.SetFormula(new ScAddress(2, 0, 0), formula, FormulaGrammar.Grammar.GRAM_OOXML);
    document.SetFormula(new ScAddress(4, 0, 0), stringFormula, FormulaGrammar.Grammar.GRAM_OOXML);
    document.SetTextCell(new ScAddress(5, 0, 0), multiline);
    document.SetTextCell(new ScAddress(5, 999, 1), value);
    document.SetTextCell(new ScAddress(6, 999, 1), value);
    document.SetTextCell(new ScAddress(1, 1000, 1), hashFirst);
    document.SetTextCell(new ScAddress(2, 1000, 1), hashSecond);
    document.FetchTable(1)?.SetMergedCells(7, 1300, 8, 1300);
    document.FetchTable(1)?.SetMergedCells(2, 1100, 2, 1102);
    document.FetchTable(1)?.SetMergedCells(4, 1100, 4, 1101);
    const bytes = await exportXlsx(document);
    const archive = await DocumentArchive.open(bytes);
    expect(await archive.readTextEntry("xl/workbook.xml")).toContain(
      'name="Alpha &amp; Omega" sheetId="1" state="visible" r:id="rId1"',
    );
    const sheet1 = await archive.readTextEntry("xl/worksheets/sheet1.xml");
    expect(sheet1).toContain('<c r="E1" t="str"><f>&quot;Complete&quot;</f><v>Complete</v></c>');
    const sharedStrings = await archive.readTextEntry("xl/sharedStrings.xml");
    expect(sharedStrings).toContain('count="5" uniqueCount="4"');
    expect(sharedStrings).toContain('<t xml:space="preserve">One&#10;Two</t>');
    expect(await archive.readTextEntry("xl/_rels/workbook.xml.rels")).toContain(
      'Target="sharedStrings.xml"',
    );
    const sheet2 = await archive.readTextEntry("xl/worksheets/sheet2.xml");
    expect(sheet2).toContain('<c r="F1000" t="s"><v>1</v></c>');
    expect(sheet2).toContain('<c r="G1000" t="s"><v>1</v></c>');
    expect(sheet2).toContain('<c r="B1001" t="s"><v>2</v></c>');
    expect(sheet2).toContain('<c r="C1001" t="s"><v>3</v></c>');
    expect(await archive.readTextEntry("xl/worksheets/sheet2.xml")).toContain(
      '<mergeCells count="3"><mergeCell ref="C1101:C1103"/><mergeCell ref="E1101:E1102"/><mergeCell ref="H1301:I1301"/></mergeCells>',
    );
    const reopened = await ExcelFilter.importDocument(bytes);
    try {
      expect(reopened.GetFormulaCell(new ScAddress(2, 0, 0))?.GetValue()).toBe(42);
      const saved = reopened.GetRefCellValue(new ScAddress(5, 999, 1)).getSharedString();
      expect(saved && text(saved.getString())).toBe("  Ω & 漢字 ");
      expect(reopened.IsMerged(new ScAddress(7, 1300, 1))).toBe(true);
      expect(reopened.IsMerged(new ScAddress(2, 1100, 1))).toBe(true);
    } finally {
      reopened.Dispose();
    }
  } finally {
    stringFormula.dispose();
    hashSecond.dispose();
    hashFirst.dispose();
    multiline.dispose();
    formula.dispose();
    value.dispose();
    second.dispose();
    first.dispose();
    document.Dispose();
  }
});

it("recalculates the original tdf70455 dynamic range and preserves its defined errors across storage", /** Ports testTdf70455 over the pinned unmodified workbook and the local file paths. @returns Completion. */ async () => {
  const fixture = readFileSync(
    resolve("../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/tdf70455.xlsx"),
  );
  const document = await ExcelFilter.importDocument(fixture);
  const position = new ScAddress(7, 7, 0);
  let worker: ScDocument | undefined;
  let stored: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  try {
    expect(document.GetFormulaCell(position)?.GetErrCode()).toBe(FormulaError.NONE);
    expect(document.GetValue(position)).toBe(780);
    expect(display(document, position)).toBe("€780.00");
    expect(document.GetDocOptions().IsIgnoreCase()).toBe(true);
    expect(
      document
        .GetRangeName()
        ?.findByUpperName("__XLFN_SUMIFS")
        ?.GetSymbol(FormulaGrammar.Grammar.GRAM_OOXML),
    ).toBe("NA()");
    expect(
      document
        .GetRangeName()
        ?.findByUpperName("___XLFN_SUMIFS")
        ?.GetSymbol(FormulaGrammar.Grammar.GRAM_OOXML),
    ).toBe("#N/A");
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(document)));
    expect(display(worker, position), "Worker").toBe("€780.00");
    stored = await readOdsDocument(await writeOdsDocument(worker));
    expect(stored.GetValue(position)).toBe(780);
    const bytes = await exportXlsx(stored);
    const archive = await DocumentArchive.open(bytes);
    expect(await archive.readTextEntry("xl/worksheets/sheet1.xml")).toContain(
      "SUM(H2:INDIRECT(ADDRESS(ROW()-1,COLUMN())))",
    );
    reopened = await ExcelFilter.importDocument(bytes);
    for (const graph of [worker, stored, reopened]) {
      expect(graph.GetDocOptions().IsIgnoreCase()).toBe(true);
      expect(graph.GetFormulaCell(position)?.GetErrCode()).toBe(FormulaError.NONE);
      expect(graph.GetValue(position)).toBe(780);
      expect(display(graph, position)).toBe("€780.00");
    }
  } finally {
    reopened?.Dispose();
    stored?.Dispose();
    worker?.Dispose();
    document.Dispose();
  }
});
