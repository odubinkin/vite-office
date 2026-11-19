/** @fileoverview Native Calc XLSX outer-border width, style and theme regressions through XLSX and primary ODS. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { TransformationType } from "../../../../docmodel/inc/color/Transformation";
import { ThemeColorType } from "../../../../docmodel/inc/theme/ThemeColorType";
import { SvxBorderLineStyle as Line } from "../../../../editeng/source/items/borderline";
import type { SvxLineItem } from "../../../../editeng/inc/lineitem";
import type { SvxBoxInfoItem, SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import {
  ATTR_BORDER,
  ATTR_BORDER_INNER,
  ATTR_BORDER_TLBR,
  ATTR_BORDER_BLTR,
} from "../../../inc/scitems";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { exportXlsx } from "../excel/xetable";
import { readOdsDocument, writeOdsDocument } from "../xml/xmlwrap";
import { strictSpreadsheetNamespace } from "./workbookfragment";
import { ExcelFilter } from "./excelfilter";

/** Imports the pinned unchanged workbook. @param name - LibreOffice XLSX fixture name. @returns Native workbook. */
function fixture(name: string): Promise<ScDocument> {
  return ExcelFilter.importDocument(
    new Uint8Array(readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/" + name)),
  );
}

/** Reads the actual box item over the original Calc cell pattern. @param document - Calc document. @param row - Zero-based row in column C. @returns Effective native box. */
function boxAt(document: ScDocument, row: number): SvxBoxItem {
  return document.GetPattern(new ScAddress(2, row, 0))?.GetItem(ATTR_BORDER) as SvxBoxItem;
}

it("retains original cell-border line styles and twip widths on XLSX reopen", /** Ports the original compact Excel border matrix. @returns Completion. */ async () => {
  const source = await fixture("cell-borders.xlsx");
  let xlsx: ScDocument | undefined;
  try {
    xlsx = await ExcelFilter.importDocument(await exportXlsx(source));
    for (const doc of [source, xlsx]) {
      for (const [row, style, width] of [
        [1, Line.SOLID, 1],
        [3, Line.DOTTED, 15],
        [5, Line.DASH_DOT_DOT, 15],
        [7, Line.DASH_DOT, 15],
        [9, Line.FINE_DASHED, 15],
        [11, Line.SOLID, 15],
        [13, Line.DASH_DOT_DOT, 35],
        [17, Line.DASH_DOT, 35],
        [19, Line.DASHED, 35],
        [21, Line.SOLID, 35],
        [23, Line.SOLID, 50],
        [25, Line.DOUBLE_THIN, undefined],
      ] as const) {
        const line = boxAt(doc, row).GetTop();
        expect(line?.GetBorderLineStyle()).toBe(style);
        if (width !== undefined) expect(line?.GetWidth()).toBe(width);
      }
    }
  } finally {
    xlsx?.Dispose();
    source.Dispose();
  }
});

it("retains the original themed borders through XLSX, ODS and the Worker record", /** Ports both native Calc theme border round trips. @returns Completion. */ async () => {
  const source = await fixture("Test_ThemeColor_Text_Background_Border.xlsx");
  let xlsx: ScDocument | undefined;
  let ods: ScDocument | undefined;
  let transfer: ScDocument | undefined;
  try {
    const bytes = await exportXlsx(source);
    const archive = await DocumentArchive.open(bytes);
    const styles = await archive.readTextEntry("xl/styles.xml");
    expect(styles).toContain('<color theme="8"/>');
    expect(Number(/<color theme="8" tint="([0-9.]+)"\/>/u.exec(styles)?.[1])).toBeCloseTo(0.8);
    xlsx = await ExcelFilter.importDocument(bytes);
    const odsBytes = await writeOdsDocument(source);
    const odtArchive = await DocumentArchive.open(odsBytes);
    expect(await odtArchive.readTextEntry("content.xml")).toContain(
      '<loext:border-left-complex-color loext:theme-type="accent5"',
    );
    ods = await readOdsDocument(odsBytes);
    transfer = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
    for (const doc of [source, xlsx, ods, transfer]) {
      const c1 = boxAt(doc, 0);
      const c2 = boxAt(doc, 1);
      const c3 = boxAt(doc, 2);
      expect([
        c1.GetLeft(),
        c1.GetRight(),
        c1.GetBottom(),
        c2.GetTop(),
        c3.GetLeft(),
        c3.GetRight(),
      ]).toEqual(Array(6).fill(undefined));
      for (const [line, rgb, transforms] of [
        [c1.GetTop(), 0x3e8853, []],
        [
          c2.GetLeft(),
          0xd4ebdb,
          [
            [TransformationType.LumMod, 20],
            [TransformationType.LumOff, 80],
          ],
        ],
        [
          c2.GetRight(),
          0xd4ebdb,
          [
            [TransformationType.LumMod, 20],
            [TransformationType.LumOff, 80],
          ],
        ],
        [c2.GetBottom(), 0x1f442a, [[TransformationType.LumMod, 50]]],
        [c3.GetTop(), 0x1f442a, [[TransformationType.LumMod, 50]]],
        [c3.GetBottom(), 0x1f442a, [[TransformationType.LumMod, 50]]],
      ] as const) {
        expect(line?.GetColor().toUInt32()).toBe(rgb);
        expect(line?.getComplexColor().getThemeColorType()).toBe(ThemeColorType.Accent5);
        expect(
          line
            ?.getComplexColor()
            .getTransformations()
            .map(
              /** Rounds native hundredths of percent to upstream test precision. @param transformation - Native value. @returns Type and whole percentage. */
              ({ meType, mnValue }) => [meType, Math.round(mnValue / 100)],
            ),
        ).toEqual(transforms);
      }
    }
  } finally {
    transfer?.Dispose();
    ods?.Dispose();
    xlsx?.Dispose();
    source.Dispose();
  }
});

it("imports Strict logical sides and uses the native shared diagonal record on export", /** Exercises explicit border override, inner lines and the source diagonal theme omission. @returns Completion. */ async () => {
  const source = await DocumentArchive.open(
    new Uint8Array(
      readFileSync(
        "../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/Test_ThemeColor_Text_Background_Border.xlsx",
      ),
    ),
  );
  const parts = new Map([
    [
      "xl/styles.xml",
      `<styleSheet xmlns="${strictSpreadsheetNamespace}"><borders><border/><border diagonalDown="true" diagonalUp="1"><start style="thin"><color rgb="FFFF0000"/></start><end style="slantDashDot"/><bottom style="mediumDashDot"/><vertical style="medium"/><horizontal style="dotted"/><diagonal style="thin"><color theme="8"/></diagonal></border></borders><cellStyleXfs><xf borderId="1"/></cellStyleXfs><cellXfs><xf borderId="1" xfId="0"/><xf borderId="0" xfId="0" applyBorder="0"/></cellXfs><cellStyles><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`,
    ],
    [
      "xl/worksheets/sheet1.xml",
      `<worksheet xmlns="${strictSpreadsheetNamespace}"><sheetData><row r="1"><c r="C1" s="0"><v>1</v></c></row><row r="2"><c r="C2" s="1"><v>2</v></c></row></sheetData></worksheet>`,
    ],
  ]);
  const writer = new DocumentArchiveWriter();
  for (const path of source.getEntryNames()) {
    const part = parts.get(path);
    writer.putNextEntry(
      path,
      part === undefined ? await source.readEntry(path) : new TextEncoder().encode(part),
    );
  }
  const document = await ExcelFilter.importDocument(await writer.finish());
  try {
    const edge = boxAt(document, 0);
    expect(edge.GetLeft()?.GetColor().toUInt32()).toBe(0xff0000);
    expect(edge.GetRight()?.GetBorderLineStyle()).toBe(Line.FINE_DASHED);
    expect(edge.GetBottom()?.GetBorderLineStyle()).toBe(Line.DASH_DOT);
    expect(boxAt(document, 1).GetLeft()).toBeUndefined();
    const pattern = document.GetPattern(new ScAddress(2, 0, 0));
    const inner = pattern?.GetItem(ATTR_BORDER_INNER) as SvxBoxInfoItem;
    expect(inner.GetVert()?.GetWidth()).toBe(35);
    expect(inner.GetHori()?.GetBorderLineStyle()).toBe(Line.DOTTED);
    for (const which of [ATTR_BORDER_TLBR, ATTR_BORDER_BLTR]) {
      const line = (pattern?.GetItem(which) as SvxLineItem).GetLine();
      expect(line?.GetColor().toUInt32()).toBe(0x3e8853);
      expect(line?.getComplexColor().isValidThemeType()).toBe(false);
    }
    const archive = await DocumentArchive.open(await exportXlsx(document));
    const styles = await archive.readTextEntry("xl/styles.xml");
    expect(styles).toContain('<border diagonalUp="1" diagonalDown="1">');
    expect(styles).toContain('<diagonal style="thin"><color rgb="FF3E8853"/></diagonal>');
    expect(styles).toContain('<right style="slantDashDot"/>');
  } finally {
    document.Dispose();
  }
});
