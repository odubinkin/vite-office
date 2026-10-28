/** @fileoverview Actual CSV explicit-date/calendar integration across native field orders, compact input, month names and time fields. */
import { afterEach, expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { CellType } from "../../../inc/global";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { Date as ToolsDate } from "../../../../tools/source/datetime/tdate";
import { SvNumFormatType as T } from "../../../../svl/inc/zforlist";
import { ScAsciiOptions, SC_COL_DMY, SC_COL_MDY, SC_COL_YMD } from "../dbgui/asciiopt";
import { ScImportExport } from "./impex";
const documents: ScDocument[] = [];
afterEach(
  /** Releases actual document owners. @returns Nothing. */ () => {
    for (const document of documents.splice(0)) document.Dispose();
  },
);
/** Imports one explicit-date column using original options. @param value - Field. @param order - Native column type. @param language - Import language. @returns Actual document. */
function imported(value: string, order: number, language = 0x409): ScDocument {
  const document = new ScDocument(),
    name = unicode("Dates"),
    options = new ScAsciiOptions();
  documents.push(document);
  try {
    document.InsertTab(0, name);
  } finally {
    name.dispose();
  }
  options.eLang = language;
  options.mvColStart = [1];
  options.mvColFormat = [order];
  options.bDetectSpecialNumber = false;
  const converter = new ScImportExport(document);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode(value + "\n"))).toBe(true);
  return document;
}
it.each([
  [SC_COL_DMY, "31122024", 31, 12, 2024, 0],
  [SC_COL_MDY, "12312024", 31, 12, 2024, 0],
  [SC_COL_YMD, "20241231", 31, 12, 2024, 0],
  [SC_COL_DMY, "31 December 2024", 31, 12, 2024, 0],
  [SC_COL_DMY, "30 Sep 2024", 30, 9, 2024, 0],
  [SC_COL_DMY, "31/12/24", 31, 12, 2024, 0],
  [SC_COL_DMY, "31/12/2024 12:00 AM", 31, 12, 2024, 0],
  [SC_COL_DMY, "31/12/2024 1:00 PM", 31, 12, 2024, 13 / 24],
  [SC_COL_DMY, "31/12/2024 12:34:56.125", 31, 12, 2024, 45296.125 / 86400],
  [SC_COL_YMD, "2024-12-31T12:34:56.125", 31, 12, 2024, 45296.125 / 86400],
  [SC_COL_YMD, "20240229", 29, 2, 2024, 0],
])(
  "imports native explicit date %s / %s",
  /** Actual calendar converts fields, with source null-date and time fraction. @param order - Column code. @param value - Input. @param day - Day. @param month - Month. @param year - Year. @param fraction - Fraction of day. @returns Nothing. */ (
    order,
    value,
    day,
    month,
    year,
    fraction,
  ) => {
    const document = imported(value as string, order as number),
      position = new ScAddress(),
      date = new ToolsDate(day as number, month as number, year as number),
      origin = new ToolsDate(30, 12, 1899);
    expect(document.GetCellType(position)).toBe(CellType.CELLTYPE_VALUE);
    expect(document.GetValue(position)).toBeCloseTo(
      date.GetAsNormalizedDays() - origin.GetAsNormalizedDays() + (fraction as number),
      10,
    );
    const key = document.GetPattern(position)?.GetNumberFormat(document.GetFormatTable()) as number;
    expect(document.GetFormatTable().GetEntry(key)).not.toBeNull();
    expect(document.GetFormatTable().GetType(key) & T.DATE).not.toBe(0);
  },
);
it.each(["31 Dezember 2024", "31 December 2024"])(
  "recognizes primary or fallback month names under German import: %s",
  /** English fallback remains the separate original calendar/transliterator pair. @param value - Input. @returns Nothing. */ (
    value,
  ) => {
    const document = imported(value, SC_COL_DMY, 0x407);
    expect(document.GetCellType(new ScAddress())).toBe(CellType.CELLTYPE_VALUE);
    expect(document.GetValue(new ScAddress())).toBe(45657);
  },
);
it.each(["2023-02-29", "2024-12-31T12:34:56Z", "2024-12-31T12:34:56+0200"])(
  "retains original fallback for invalid ISO date or timezone: %s",
  /** ISO branch delegates to formatter and preserves unrecognized timezone input as text. @param value - Input. @returns Nothing. */ (
    value,
  ) => {
    const document = imported(value, SC_COL_YMD);
    expect(document.GetCellType(new ScAddress())).toBe(CellType.CELLTYPE_STRING);
  },
);

it("preserves source seven-part timezone-colon behavior", /** The offset hour becomes the seventh part and the following colon disables ISO; source calendar fallback treats that part as fractional seconds. @returns Nothing. */ () => {
  const document = imported("2024-12-31T12:34:56+02:00", SC_COL_YMD);
  expect(document.GetCellType(new ScAddress())).toBe(CellType.CELLTYPE_VALUE);
  expect(document.GetValue(new ScAddress())).toBeCloseTo(45657 + 45296.02 / 86400, 10);
});
