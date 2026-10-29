/** @fileoverview End-to-end CSV recognition contracts on the actual Calc document; pending failures identify required CSV caller dependencies rather than general formatter feature completeness. */
import { afterEach, expect, it } from "vitest";
import { LANGUAGE_ENGLISH_US, LANGUAGE_GERMAN } from "../../../../i18nlangtag/inc/lang";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { Date as ToolsDate } from "../../../../tools/source/datetime/tdate";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { CellType } from "../../../inc/global";
import {
  ScAsciiOptions,
  SC_COL_STANDARD,
  SC_COL_TEXT,
  SC_COL_DMY,
  SC_COL_MDY,
  SC_COL_YMD,
  SC_COL_ENGLISH,
} from "../dbgui/asciiopt";
import { ScImportExport } from "./impex";
const documents: ScDocument[] = [];
afterEach(
  /** Releases actual document resources even when a pending recognition assertion fails. @returns Nothing. */ () => {
    for (const document of documents.splice(0).reverse()) document.Dispose();
  },
);
/** Imports exactly one source row into the actual document. @param options - Actual filter options. @param line - CSV source. @returns Actual document. */
function imported(options: ScAsciiOptions, line: string): ScDocument {
  const document = new ScDocument(),
    name = unicode("Sheet1");
  documents.push(document);
  try {
    document.InsertTab(0, name);
  } finally {
    name.dispose();
  }
  const converter = new ScImportExport(document);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode(line + "\n"))).toBe(true);
  return document;
}
it("uses original external Standard1/Text2 codes from serialized filter options", /** Zero-based grid type indices must not replace native external codes. @returns Nothing. */ () => {
  expect([
    SC_COL_STANDARD,
    SC_COL_TEXT,
    SC_COL_MDY,
    SC_COL_DMY,
    SC_COL_YMD,
    SC_COL_ENGLISH,
  ]).toEqual([1, 2, 3, 4, 5, 10]);
  const options = new ScAsciiOptions();
  options.ReadFromString("59,34,UTF-8,1,1/1/2/2,1033");
  const document = imported(options, "12;34");
  expect(document.GetCellType(new ScAddress(0, 0, 0))).toBe(CellType.CELLTYPE_VALUE);
  expect(document.GetValue(new ScAddress(0, 0, 0))).toBe(12);
  expect(document.GetCellType(new ScAddress(1, 0, 0))).toBe(CellType.CELLTYPE_STRING);
  const textKey = document
    .GetPattern(new ScAddress(1, 0, 0))
    ?.GetNumberFormat(document.GetFormatTable());
  expect(document.GetFormatTable().GetType(textKey as number)).toBe(SvNumFormatType.TEXT);
});
it.each([
  [SC_COL_DMY, "31/12/2024"],
  [SC_COL_MDY, "12/31/2024"],
  [SC_COL_YMD, "2024/12/31"],
])(
  "imports explicit date column %i through the real calendar and assigns a real date format",
  /** Explicit dates are independent from the automatic special-number option. @param columnType - Source external code. @param input - Source date. @returns Nothing. */ (
    columnType,
    input,
  ) => {
    const options = new ScAsciiOptions();
    options.eLang = LANGUAGE_ENGLISH_US;
    options.mvColStart = [1];
    options.mvColFormat = [columnType as number];
    options.bDetectSpecialNumber = false;
    const document = imported(options, input as string),
      position = new ScAddress(),
      day = new ToolsDate(31, 12, 2024),
      origin = new ToolsDate(30, 12, 1899);
    expect(document.GetCellType(position)).toBe(CellType.CELLTYPE_VALUE);
    expect(document.GetValue(position)).toBe(
      day.GetAsNormalizedDays() - origin.GetAsNormalizedDays(),
    );
    const key = document.GetPattern(position)?.GetNumberFormat(document.GetFormatTable());
    expect(key).toBeDefined();
    expect(document.GetFormatTable().GetEntry(key as number)).not.toBeNull();
    expect(document.GetFormatTable().GetType(key as number) & SvNumFormatType.DATE).not.toBe(0);
  },
);
it("recognizes an English column independently from the German import locale", /** The source SC_COL_ENGLISH branch calls the actual document formatter's English recognition before fallback. @returns Nothing. */ () => {
  const options = new ScAsciiOptions();
  options.eLang = LANGUAGE_GERMAN;
  options.mvColStart = [1];
  options.mvColFormat = [SC_COL_ENGLISH];
  const document = imported(options, "12.5");
  expect(document.GetCellType(new ScAddress())).toBe(CellType.CELLTYPE_VALUE);
  expect(document.GetValue(new ScAddress())).toBe(12.5);
});
it.each([false, true])(
  "applies special-number detection %s through actual auto-input and format attributes",
  /** Percent recognition sets both numeric value and a real percent format only when enabled. @param detect - Native flag. @returns Nothing. */ (
    detect,
  ) => {
    const options = new ScAsciiOptions();
    options.eLang = LANGUAGE_ENGLISH_US;
    options.bDetectSpecialNumber = detect;
    const document = imported(options, "12.5%"),
      position = new ScAddress();
    expect(document.GetCellType(position)).toBe(
      detect ? CellType.CELLTYPE_VALUE : CellType.CELLTYPE_STRING,
    );
    if (detect) {
      expect(document.GetValue(position)).toBe(0.125);
      const key = document.GetPattern(position)?.GetNumberFormat(document.GetFormatTable());
      expect(document.GetFormatTable().GetEntry(key as number)).not.toBeNull();
      expect(document.GetFormatTable().GetType(key as number) & SvNumFormatType.PERCENT).not.toBe(
        0,
      );
    } else {
      const key = document.GetPattern(position)?.GetNumberFormat(document.GetFormatTable());
      expect(document.GetFormatTable().GetType(key as number)).toBe(SvNumFormatType.TEXT);
    }
  },
);

it.each([
  ["2024-12-31", 45657],
  ["2024-12-31T12:34:56", 45657 + 45296 / 86400],
  ["2024-02-29", 45351],
] as const)(
  "keeps ISO date recognition when special-number detection is disabled: %s",
  /** The original standard-column ISO exception stores a numeric cell and real date format independently from generic special-number recognition. @param input - ISO field. @param expected - Independent spreadsheet serial. @returns Nothing. */ (
    input,
    expected,
  ) => {
    const options = new ScAsciiOptions();
    options.eLang = LANGUAGE_ENGLISH_US;
    options.bDetectSpecialNumber = false;
    const document = imported(options, input),
      position = new ScAddress();
    expect(document.GetCellType(position)).toBe(CellType.CELLTYPE_VALUE);
    expect(document.GetValue(position)).toBeCloseTo(expected, 9);
    const key = document.GetPattern(position)?.GetNumberFormat(document.GetFormatTable());
    expect(key).toBeDefined();
    expect(document.GetFormatTable().GetType(key as number) & SvNumFormatType.DATE).not.toBe(0);
  },
);

it.each(["2024-1", "2024-1-", "2024-123-01", "2024-12-99", "2024-12-31junk"])(
  "retains malformed ISO-like standard input %s as text",
  /** Position checks and the actual SAX converter reject malformed ISO text before any date-format adoption. @param input - Invalid field. @returns Nothing. */ (
    input,
  ) => {
    const options = new ScAsciiOptions();
    options.eLang = LANGUAGE_ENGLISH_US;
    options.bDetectSpecialNumber = false;
    const document = imported(options, input);
    expect(document.GetCellType(new ScAddress())).toBe(CellType.CELLTYPE_STRING);
  },
);

it("retains text after the real English-column numeric recognizer rejects it", /** The explicit English column still falls through to ordinary text ownership for nonnumeric input. @returns Nothing. */ () => {
  const options = new ScAsciiOptions();
  options.eLang = LANGUAGE_GERMAN;
  options.mvColStart = [1];
  options.mvColFormat = [SC_COL_ENGLISH];
  const document = imported(options, "not a number");
  expect(document.GetCellType(new ScAddress())).toBe(CellType.CELLTYPE_STRING);
});
