/** @fileoverview Native calendar conditions through the Calc kernel, XLSX, ODS and worker transfer. */
import { expect, it, vi } from "vitest";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { SfxStyleFamily, SfxStyleSearchBits } from "../../../../svl/inc/style-values";
import { Date as ToolsDate } from "../../../../tools/source/datetime/tdate";
import { ScAddress, ScRange } from "../../../inc/address";
import {
  ScCondDateFormatEntry,
  ScCondFormatDateType as Kind,
  ScConditionalFormat,
  ScFormatEntryType,
} from "../../../inc/conditio";
import { ScDocument } from "../../../inc/document";
import { ScRangeList } from "../../../inc/rangelst";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { exportXlsx } from "../excel/xetable";
import { readOdsDocument, writeOdsDocument } from "../xml/xmlwrap";
import { ExcelFilter } from "./excelfilter";

/** Creates an actual workbook with one addressed sheet. @returns Calc document. */
function workbook(): ScDocument {
  const document = new ScDocument();
  const name = unicode("Dates");
  try {
    expect(document.InsertTab(0, name)).toBe(true);
  } finally {
    name.dispose();
  }
  return document;
}

/** Sets the platform date used by the source SYSTEM constructor. @param year - Year. @param month - One-based month. @param day - Day. @returns Nothing. */
function switchDate(year: number, month: number, day: number): void {
  vi.setSystemTime(new Date(year, month - 1, day, 12));
}

/** Converts a calendar date to the native document's serial. @param document - Actual workbook. @param year - Year. @param month - Month. @param day - Day. @returns Date serial. */
function serial(document: ScDocument, year: number, month: number, day: number): number {
  return (
    new ToolsDate(day, month, year).GetAsNormalizedDays() -
    document.GetFormatTable().GetNullDate().GetAsNormalizedDays()
  );
}

/** Binds one native date rule to a cell and its workbook style. @param document - Workbook. @param address - Rule target. @param type - Date period. @returns Rule. */
function addRule(document: ScDocument, address: ScAddress, type: Kind): ScCondDateFormatEntry {
  const entry = new ScCondDateFormatEntry(document);
  entry.SetDateType(type);
  const pool = document.GetStyleSheetPool();
  if (!pool) throw new Error("Missing native style pool.");
  const name = unicode("Date style");
  try {
    const style =
      pool.Find(name, SfxStyleFamily.Para) ??
      pool.Make(name, SfxStyleFamily.Para, SfxStyleSearchBits.UserDefined);
    entry.SetStyleName(style.GetName());
  } finally {
    name.dispose();
  }
  const format = new ScConditionalFormat(0, document);
  const ranges = new ScRangeList();
  ranges.push_back(new ScRange(address, address));
  format.SetRange(ranges);
  format.AddEntry(entry);
  const key = document.AddCondFormat(format, 0);
  expect(key).toBeGreaterThan(0);
  document.AddCondFormatData(ranges, 0, key);
  return entry;
}

it("ports the original tomorrow serialization and keeps the native style through real filters", /** Replays testTdf164334 and verifies the actual computed style and persistence. @returns Completion. */ async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  switchDate(2026, 1, 4);
  const document = workbook();
  const cell = new ScAddress();
  const odsOnly = new ScAddress(1, 0);
  let worker: ScDocument | undefined, ods: ScDocument | undefined, excel: ScDocument | undefined;
  try {
    document.SetValue(cell, serial(document, 2026, 1, 5) + 0.75);
    document.SetValue(odsOnly, serial(document, 2027, 1, 5));
    const entry = addRule(document, cell, Kind.TOMORROW);
    addRule(document, odsOnly, Kind.NEXTYEAR);
    expect(entry.GetType()).toBe(ScFormatEntryType.Date);
    expect(entry.IsValid(cell)).toBe(true);
    expect(text(entry.GetStyleName()).length).toBeGreaterThan(0);
    expect(document.GetCondResult(cell)).toBeDefined();
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(document)));
    ods = await readOdsDocument(await writeOdsDocument(worker));
    expect(ods.GetCondResult(cell)).toBeDefined();
    expect(ods.GetCondResult(odsOnly)).toBeDefined();
    const bytes = await exportXlsx(ods);
    const archive = await DocumentArchive.open(bytes);
    const xml = await archive.readTextEntry("xl/worksheets/sheet1.xml");
    expect(xml).toContain('timePeriod="tomorrow"');
    expect(xml.match(/<cfRule /gu)).toHaveLength(1);
    excel = await ExcelFilter.importDocument(bytes);
    expect(excel.GetCondResult(cell)).toBeDefined();
    expect(excel.GetCondResult(odsOnly)).toBeUndefined();
  } finally {
    excel?.Dispose();
    ods?.Dispose();
    worker?.Dispose();
    document.Dispose();
    vi.useRealTimers();
  }
});

it("honors the native rolling-week boundaries and day cache at Sunday and midweek", /** Tests the original inclusive endpoints and start/end render scopes. @returns Nothing. */ () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  const document = workbook();
  const cell = new ScAddress();
  const entry = addRule(document, cell, Kind.TODAY);
  const list = document.FetchTable(0)?.GetCondFormList();
  if (!list) throw new Error("Missing date conditional format list.");
  try {
    for (const [day, weekCases] of [
      [
        4,
        [
          [Kind.LASTWEEK, -8, -1],
          [Kind.THISWEEK, 0, 6],
          [Kind.NEXTWEEK, 7, 13],
        ],
      ],
      [
        7,
        [
          [Kind.LASTWEEK, -10, -4],
          [Kind.THISWEEK, -3, 3],
          [Kind.NEXTWEEK, 4, 10],
        ],
      ],
    ] as const) {
      switchDate(2026, 1, day);
      list.startRendering();
      const today = serial(document, 2026, 1, day);
      for (const [kind, first, last] of [[Kind.LAST7DAYS, -6, 0], ...weekCases] as const) {
        entry.SetDateType(kind);
        for (const [offset, matches] of [
          [first - 1, false],
          [first, true],
          [last, true],
          [last + 1, false],
        ] as const) {
          document.SetValue(cell, today + offset);
          expect(entry.IsValid(cell)).toBe(matches);
        }
      }
      list.endRendering();
    }
    entry.SetDateType(Kind.TODAY);
    document.SetValue(cell, serial(document, 2026, 1, 7));
    expect(entry.IsValid(cell)).toBe(true);
    switchDate(2026, 1, 8);
    expect(entry.IsValid(cell)).toBe(true);
    list.startRendering();
    expect(entry.IsValid(cell)).toBe(false);
    entry.SetDateType(Kind.YESTERDAY);
    expect(entry.IsValid(cell)).toBe(true);
    expect(entry.IsValid(new ScAddress(2, 0))).toBe(false);
    entry.SetDateType(999 as Kind);
    expect(entry.IsValid(cell)).toBe(false);
    list.endRendering();
  } finally {
    document.Dispose();
    vi.useRealTimers();
  }
});

it("checks native month and year rollover at both ends of the year", /** Exercises all year periods and trial dates on either side of December and January. @returns Nothing. */ () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  const document = workbook();
  const cell = new ScAddress();
  const entry = addRule(document, cell, Kind.TODAY);
  try {
    for (const [year, month, kind, targetYear, targetMonth, matches] of [
      [2026, 1, Kind.LASTMONTH, 2025, 12, true],
      [2026, 1, Kind.LASTMONTH, 2024, 12, false],
      [2026, 1, Kind.LASTMONTH, 2026, 1, false],
      [2026, 6, Kind.LASTMONTH, 2026, 5, true],
      [2026, 6, Kind.LASTMONTH, 2025, 5, false],
      [2026, 6, Kind.THISMONTH, 2026, 6, true],
      [2026, 6, Kind.THISMONTH, 2026, 5, false],
      [2026, 6, Kind.NEXTMONTH, 2026, 7, true],
      [2026, 12, Kind.NEXTMONTH, 2027, 1, true],
      [2026, 12, Kind.NEXTMONTH, 2027, 2, false],
      [2026, 12, Kind.NEXTMONTH, 2025, 1, false],
      [2026, 1, Kind.LASTYEAR, 2025, 2, true],
      [2026, 1, Kind.THISYEAR, 2026, 12, true],
      [2026, 1, Kind.THISYEAR, 2025, 1, false],
      [2026, 12, Kind.NEXTYEAR, 2027, 12, true],
      [2026, 12, Kind.NEXTYEAR, 2026, 12, false],
    ] as const) {
      switchDate(year, month, 1);
      entry.startRendering();
      entry.SetDateType(kind);
      document.SetValue(cell, serial(document, targetYear, targetMonth, 1));
      expect(entry.IsValid(cell)).toBe(matches);
      entry.endRendering();
    }
  } finally {
    document.Dispose();
    vi.useRealTimers();
  }
});

it("keeps the ten XLSX periods and defaults an unknown period to Today", /** Checks the original SpreadsheetML import and export vocabulary. @returns Completion. */ async () => {
  const document = workbook();
  const expected = [
    "today",
    "yesterday",
    "tomorrow",
    "last7Days",
    "thisWeek",
    "lastWeek",
    "nextWeek",
    "thisMonth",
    "lastMonth",
    "nextMonth",
  ];
  try {
    for (const [column] of expected.entries()) addRule(document, new ScAddress(column, 0), column);
    const part = "xl/worksheets/sheet1.xml";
    const original = await DocumentArchive.open(await exportXlsx(document));
    const rewritten = new DocumentArchiveWriter();
    for (const name of original.getEntryNames()) {
      if (name !== part) rewritten.putNextEntry(name, await original.readEntry(name));
      else {
        const source = await original.readTextEntry(part);
        expect(
          Array.from(
            source.matchAll(/ timePeriod="([^"]+)"/gu),
            /** Reads the period lexeme. @param match - Original attribute match. @returns Period name. */ (
              match,
            ) => match[1],
          ),
        ).toEqual(expected);
        rewritten.putNextEntry(
          name,
          new TextEncoder().encode(
            source.replace('timePeriod="today"', 'timePeriod="unknown-period"'),
          ),
        );
      }
    }
    const copy = await ExcelFilter.importDocument(await rewritten.finish());
    try {
      const table = copy.FetchTable(0);
      if (!table) throw new Error("Missing reopened worksheet.");
      for (const [column, condition] of Array.from(table.GetCondFormList()).entries()) {
        const entry = condition.GetEntry(0);
        expect(entry).toBeInstanceOf(ScCondDateFormatEntry);
        expect((entry as ScCondDateFormatEntry).GetDateType()).toBe(column);
      }
    } finally {
      copy.Dispose();
    }
  } finally {
    document.Dispose();
  }
});
