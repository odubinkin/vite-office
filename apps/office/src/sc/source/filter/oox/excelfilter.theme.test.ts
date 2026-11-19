/** @fileoverview Native XLSX and ODS theme interpolation, inheritance and package round trips. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";
import { TransformationType } from "../../../../docmodel/inc/color/Transformation";
import { ThemeColorType } from "../../../../docmodel/inc/theme/ThemeColorType";
import type { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import type { SvxColorItem } from "../../../../editeng/inc/colritem";
import type { EECharAttrib } from "../../../../editeng/inc/editdata";
import { EE_CHAR_COLOR } from "../../../../editeng/inc/eeitem";
import type { SvxFontItem } from "../../../../editeng/inc/fontitem";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import * as Which from "../../../inc/scitems";
import { exportXlsx } from "../excel/xetable";
import { readOdsDocument, writeOdsDocument } from "../xml/xmlwrap";
import { ExcelFilter } from "./excelfilter";
import { spreadsheetNamespace } from "./workbookfragment";

it("keeps the pinned tdf113271 theme font ahead of its RGB attribute", /** Replays the upstream precedence and exported font assertions. @returns Completion. */ async () => {
  const bytes = readFileSync(
    resolve("../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/tdf113271.xlsx"),
  );
  const document = await ExcelFilter.importDocument(new Uint8Array(bytes));
  try {
    const output = await DocumentArchive.open(await exportXlsx(document));
    const styles = await output.readTextEntry("xl/styles.xml");
    const first = /<fonts[^>]*><font>(.*?)<\/font>/.exec(styles)?.[1];
    expect(first).toContain('<color theme="1"/>');
    expect(first).toContain('<name val="Calibri"/>');
    expect(first).not.toContain("rgb=");
    expect(await output.readTextEntry("xl/_rels/workbook.xml.rels")).toContain(
      'Target="theme/theme1.xml"',
    );
  } finally {
    document.Dispose();
  }
});

it("shares theme and indexed color resolution across workbook styles and rich text", /** Reads independent XLSX declarations, exports their native values and reopens the result. @returns Completion. */ async () => {
  const source = await DocumentArchive.open(
    new Uint8Array(
      readFileSync(
        resolve("../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/tdf113271.xlsx"),
      ),
    ),
  );
  const overrides = new Map([
    [
      "xl/theme/theme1.xml",
      '<a:theme xmlns:a="http://purl.oclc.org/ooxml/drawingml/main" xmlns:foreign="urn:foreign" name="Native theme"><a:themeElements><foreign:fontScheme name="Ignore"/><a:clrScheme name="Native colors"><a:dk2><a:sysClr val="future" lastClr="010203"/></a:dk2><a:lt2><a:srgbClr val="invalid"/></a:lt2><a:accent1><a:srgbClr val="FF0000"/></a:accent1></a:clrScheme><a:fontScheme name="Native font families"><a:majorFont><a:latin typeface="Major family" pitchFamily="32"/><a:font script="Jpan" typeface="Supplemental family"/></a:majorFont><a:minorFont><a:ea typeface="Minor family" charset="128"/><a:font script="Hang" typeface="Minor supplemental"/></a:minorFont></a:fontScheme></a:themeElements></a:theme>',
    ],
    [
      "xl/styles.xml",
      `<styleSheet xmlns="${spreadsheetNamespace}"><fonts><font><name val="Explicit family"/><scheme val="major"/><color theme="4" tint="0.5" rgb="FFFFFFFF"/></font><font><color indexed="0" tint="-0.5"/></font></fonts><fills><fill><patternFill patternType="solid"><fgColor theme="4" tint="-0.5"/></patternFill></fill></fills><cellStyleXfs><xf fontId="0" fillId="0"/></cellStyleXfs><cellXfs><xf fontId="0" fillId="0" xfId="0"/><xf fontId="1" fillId="0" xfId="0"/></cellXfs><cellStyles><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><colors><indexedColors><rgbColor rgb="FF00FF00"/></indexedColors></colors></styleSheet>`,
    ],
    [
      "xl/worksheets/sheet1.xml",
      `<worksheet xmlns="${spreadsheetNamespace}"><sheetData><row r="1"><c r="A1"><v>1</v></c><c r="B1" s="1"><v>2</v></c><c r="C1" t="inlineStr"><is><r><rPr><color theme="4"/></rPr><t>red</t></r></is></c></row></sheetData></worksheet>`,
    ],
  ]);
  const writer = new DocumentArchiveWriter();
  for (const path of source.getEntryNames()) {
    const replacement = overrides.get(path);
    writer.putNextEntry(
      path,
      replacement === undefined
        ? await source.readEntry(path)
        : new TextEncoder().encode(replacement),
    );
  }
  const document = await ExcelFilter.importDocument(await writer.finish());
  let reopened: ScDocument | undefined;
  let ods: ScDocument | undefined;
  try {
    const bytes = await exportXlsx(document);
    const archive = await DocumentArchive.open(bytes);
    expect(await archive.readTextEntry("xl/theme/theme1.xml")).toContain(
      'script="Jpan" typeface="Supplemental family"',
    );
    expect(await archive.readTextEntry("xl/styles.xml")).toContain(
      '<fgColor theme="4" tint="-0.5"/>',
    );
    reopened = await ExcelFilter.importDocument(bytes);
    const odsBytes = await writeOdsDocument(document);
    const odsArchive = await DocumentArchive.open(odsBytes);
    expect(await odsArchive.readTextEntry("styles.xml")).toContain(
      '<loext:theme-colors loext:name="Native colors">',
    );
    expect(await odsArchive.readTextEntry("content.xml")).toContain(
      '<loext:char-complex-color loext:theme-type="accent1" loext:color-type="theme">',
    );
    ods = await readOdsDocument(odsBytes);
    for (const copy of [document, reopened, ods]) {
      const theme = copy.theme;
      expect(theme?.name).toBe("Native theme");
      expect(theme?.fontScheme.majorFont.get("latin")?.typeface).toBe(
        copy === ods ? "Arial" : "Major family",
      );
      expect(theme?.colorSet?.getColor(ThemeColorType.Accent1).toUInt32()).toBe(0xff0000);
      expect(theme?.colorSet?.getColor(ThemeColorType.Dark2).toUInt32()).toBe(0x010203);
      const first = copy.GetPattern(new ScAddress());
      const second = copy.GetPattern(new ScAddress(1, 0, 0));
      expect((first?.GetItem(Which.ATTR_FONT) as SvxFontItem).GetFamilyName()).toBe(
        "Explicit family",
      );
      expect((first?.GetItem(Which.ATTR_FONT_COLOR) as SvxColorItem).GetValue().toUInt32()).toBe(
        0xff8080,
      );
      expect((second?.GetItem(Which.ATTR_FONT_COLOR) as SvxColorItem).GetValue().toUInt32()).toBe(
        0x008000,
      );
      expect((first?.GetItem(Which.ATTR_BACKGROUND) as SvxBrushItem).GetColor().toUInt32()).toBe(
        0x800000,
      );
      const attrs: EECharAttrib[] = [];
      copy
        .GetRefCellValue(new ScAddress(2, 0, 0))
        .getEditText()
        ?.GetCharAttribs(0, attrs);
      const color = attrs.find(
        /** Finds the actual EditEngine character color. @param entry - Native attribute. @returns Match. */ (
          entry,
        ) => entry.pAttr?.Which() === EE_CHAR_COLOR,
      )?.pAttr as SvxColorItem;
      expect(color.GetValue().toUInt32()).toBe(0xff0000);
      expect(color.getComplexColor().getThemeColorType()).toBe(ThemeColorType.Accent1);
    }
  } finally {
    ods?.Dispose();
    reopened?.Dispose();
    document.Dispose();
  }
});

it("writes all source CalcThemeTest palette entries and theme-backed styles", /** Ports the upstream OOXML theme palette and style attribute checks. @returns Completion. */ async () => {
  const bytes = readFileSync(
    resolve("../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/CalcThemeTest.xlsx"),
  );
  const document = await ExcelFilter.importDocument(new Uint8Array(bytes));
  try {
    const archive = await DocumentArchive.open(await exportXlsx(document));
    const theme = await archive.readTextEntry("xl/theme/theme1.xml");
    expect(theme).toContain('<a:clrScheme name="Office">');
    for (const [name, color] of Object.entries({
      dk1: "000000",
      lt1: "FFFFFF",
      dk2: "44546A",
      lt2: "E7E6E6",
      accent1: "4472C4",
      accent2: "ED7D31",
      accent3: "A5A5A5",
      accent4: "FFC000",
      accent5: "5B9BD5",
      accent6: "70AD47",
      hlink: "0563C1",
      folHlink: "954F72",
    }))
      expect(theme).toContain(`<a:${name}><a:srgbClr val="${color}"/></a:${name}>`);
    const styles = await archive.readTextEntry("xl/styles.xml");
    expect(styles).toContain('<color theme="7"/>');
    expect(styles).toContain('<color rgb="FF9C5700"/>');
    expect(styles).toContain('<fgColor rgb="FFFFEB9C"/>');
    expect(styles).toContain('<fgColor theme="4"/>');
  } finally {
    document.Dispose();
  }
});

it("preserves the source tinted font and fill through XLSX and ODS", /** Ports the pinned theme color fixture and native Calc color assertions. @returns Completion. */ async () => {
  const bytes = readFileSync(
    resolve(
      "../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/Test_ThemeColor_Text_Background_Border.xlsx",
    ),
  );
  const source = await ExcelFilter.importDocument(new Uint8Array(bytes));
  let xlsx: ScDocument | undefined;
  let ods: ScDocument | undefined;
  try {
    xlsx = await ExcelFilter.importDocument(await exportXlsx(source));
    ods = await readOdsDocument(await writeOdsDocument(source));
    for (const doc of [source, xlsx, ods]) {
      for (const [row, expected] of [0x27ced7, 0xd4f5f7, 0x14676b].entries()) {
        const item = doc
          .GetPattern(new ScAddress(0, row, 0))
          ?.GetItem(Which.ATTR_BACKGROUND) as SvxBrushItem;
        expect(item.GetColor().toUInt32()).toBe(expected);
        expect(item.getComplexColor().getThemeColorType()).toBe(ThemeColorType.Accent3);
        expect(
          item
            .getComplexColor()
            .getTransformations()
            .map(
              /** Rounds the native hundredths of percent to the pinned test precision. @param value - Actual transform. @returns Type and integer percent. */
              (value) => [value.meType, Math.round(value.mnValue / 100)],
            ),
        ).toEqual(
          [
            [],
            [
              [TransformationType.LumMod, 20],
              [TransformationType.LumOff, 80],
            ],
            [[TransformationType.LumMod, 50]],
          ][row],
        );
      }
      for (const [row, expected] of [0x62a39f, 0xa1c8c5, 0x305250].entries()) {
        const item = doc
          .GetPattern(new ScAddress(1, row, 0))
          ?.GetItem(Which.ATTR_FONT_COLOR) as SvxColorItem;
        expect(item.GetValue().toUInt32()).toBe(expected);
        expect(item.getComplexColor().getThemeColorType()).toBe(ThemeColorType.Accent6);
        expect(
          item
            .getComplexColor()
            .getTransformations()
            .map(
              /** Rounds the native hundredths of percent to the pinned test precision. @param value - Actual transform. @returns Type and integer percent. */
              (value) => [value.meType, Math.round(value.mnValue / 100)],
            ),
        ).toEqual(
          [
            [],
            [
              [TransformationType.LumMod, 60],
              [TransformationType.LumOff, 40],
            ],
            [[TransformationType.LumMod, 50]],
          ][row],
        );
      }
    }
  } finally {
    ods?.Dispose();
    xlsx?.Dispose();
    source.Dispose();
  }
});
