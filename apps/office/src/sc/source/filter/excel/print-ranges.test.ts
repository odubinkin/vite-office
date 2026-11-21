/** @fileoverview Native Excel and ODF print-area and repeating-title regression fixtures. */
import { GetPrintRanges } from "../../core/data/table1";
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScAddress, ScRange, ScRefFlags } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { InsertRangeNames, RangeDataType } from "../../core/tool/rangenam";
import { extractCellRangeList } from "../oox/formulabase";
import { ExcelFilter } from "../oox/excelfilter";
import { readOdsDocument, writeOdsDocument, writeOdsXml } from "../xml/xmlwrap";
import { exportXlsx } from "./xetable";

/** Resolves an original reference fixture. @param path - Path under the upstream Calc unit data. @returns Package bytes. */
function fixture(path: string): Uint8Array {
  return new Uint8Array(readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/" + path));
}

/** Reads the emitted workbook name records. @param document - Native workbook. @returns OOXML workbook part. */
async function workbook(document: ScDocument): Promise<string> {
  return (await DocumentArchive.open(await exportXlsx(document))).readTextEntry("xl/workbook.xml");
}

it("imports the Calc name and print area from built-in_ranges.xlsx", /** Replays testTdf113596 and verifies the native sheet state through primary ODS. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(fixture("xlsx/built-in_ranges.xlsx"));
  let reopened: ScDocument | undefined;
  try {
    const tab = source.FetchTable(0);
    assert(tab);
    const definition = tab.GetRangeName().findByUpperName("EXCEL_BUILTIN_PRINT_AREA");
    assert(definition);
    expect(definition.type).toBe(RangeDataType.PrintArea | RangeDataType.AbsArea);
    expect(GetPrintRanges(tab)).toEqual([new ScRange(0, 0, 0, 0, 4, 0)]);
    expect(tab.GetPrintRangeCount()).toBe(1);
    expect(tab.GetPrintRange(1)).toBeUndefined();
    expect(tab.IsPrintEntireSheet()).toBe(false);
    reopened = await readOdsDocument(await writeOdsDocument(source));
    expect(reopened.FetchTable(1)?.GetPrintRange(0)).toEqual(new ScRange(10, 9, 1, 12, 17, 1));
    const xml = await workbook(reopened);
    expect(xml.match(/name="_xlnm\.Print_Area"/gu)).toHaveLength(2);
    expect(xml).toContain('localSheetId="1">&apos;Sheet2 Test&apos;!$K$10:$M$18</definedName>');
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});

it("loads the original ODF repeated rows and emits a single XLSX title record", /** Replays testPrintRangeODS and testTdf112567b over the complete packages. @returns Completion. */ async () => {
  const ranges = await readOdsDocument(fixture("ods/print-range.ods"));
  let titles: ScDocument | undefined;
  try {
    expect(ranges.FetchTable(0)?.GetRepeatRowRange()).toEqual(new ScRange(0, 0, 0, 0, 1, 0));
    expect(ranges.FetchTable(1)?.GetRepeatRowRange()).toEqual(new ScRange(0, 2, 0, 0, 4, 0));
    titles = await readOdsDocument(fixture("ods/tdf112567.ods"));
    const xml = await workbook(titles);
    expect(xml.match(/<definedName\s/gu)).toHaveLength(1);
    expect(xml).toContain(
      'name="_xlnm.Print_Titles" localSheetId="0">Sheet1!$A:$A,Sheet1!$1:$1</definedName>',
    );
  } finally {
    titles?.Dispose();
    ranges.Dispose();
  }
});

it("keeps quoted print areas, excluded sheets and repeating headers across ODS and the Worker", /** Preserves explicit areas and splits title wrappers at nested outline boundaries. @returns Completion. */ async () => {
  const source = new ScDocument();
  let reopened: ScDocument | undefined, transferred: ScDocument | undefined;
  try {
    for (const [index, name] of ["O'Brien. Sales", "Excluded"].entries()) {
      const value = unicode(name);
      try {
        expect(source.InsertTab(index, value)).toBe(true);
      } finally {
        value.dispose();
      }
    }
    const tab = source.FetchTable(0);
    assert(tab);
    tab.mbPageBreaksValid = true;
    tab.SetStreamValid(true);
    tab.AddPrintRange(new ScRange(1, 2, 0, 3, 4, 0));
    tab.AddPrintRange(new ScRange(1, 6, 0, 3, 7, 0));
    expect(tab.mbPageBreaksValid).toBe(false);
    expect(tab.IsStreamValid()).toBe(false);
    tab.SetRepeatRowRange(new ScRange(0, 1, 0, 0, 6, 0));
    tab.SetRepeatColRange(new ScRange(0, 0, 0, 2, 0, 0));
    tab.StartOutlineTable().GetRowArray().Insert(3, 4, false);
    source.FetchTable(1)?.ClearPrintRanges();

    const xml = (await writeOdsXml(source)).files["content.xml"];
    expect(xml).toContain("O&apos;&apos;Brien. Sales&apos;.B3");
    expect(xml).toContain('table:name="Excluded" table:print="false"');
    expect((xml as string).match(/<table:table-header-rows>/gu)).toHaveLength(3);
    reopened = await readOdsDocument(await writeOdsDocument(source));
    transferred = decodeCalcDocument(encodeCalcDocument(reopened));
    expect(transferred.FetchTable(0)?.GetPrintRangeCount()).toBe(2);
    expect(transferred.FetchTable(0)?.GetPrintRange(0)).toEqual(tab.GetPrintRange(0));
    expect(transferred.FetchTable(0)?.GetPrintRange(1)).toEqual(tab.GetPrintRange(1));
    expect(transferred.FetchTable(0)?.GetRepeatRowRange()).toEqual(tab.GetRepeatRowRange());
    expect(transferred.FetchTable(0)?.GetRepeatColRange()).toEqual(tab.GetRepeatColRange());
    expect(transferred.FetchTable(1)?.IsPrintEntireSheet()).toBe(false);
    const builtins = await workbook(transferred);
    expect(builtins).toContain(
      "&apos;O&apos;&apos;Brien. Sales&apos;!$B$3:$D$5,&apos;O&apos;&apos;Brien. Sales&apos;!$B$7:$D$8",
    );
    expect(builtins).toContain(
      "&apos;O&apos;&apos;Brien. Sales&apos;!$A:$C,&apos;O&apos;&apos;Brien. Sales&apos;!$2:$7",
    );
    const record = encodeCalcDocument(reopened);
    const [firstSheet, ...otherSheets] = record.sheets;
    assert(firstSheet);
    expect(
      /** Rejects a transfer whose title extends beyond the native row limit. @returns Candidate graph. */ () =>
        decodeCalcDocument({
          ...record,
          sheets: [
            { ...firstSheet, repeatRows: [0, 0, 0, 0, source.MaxRow() + 1, 0] },
            ...otherSheets,
          ],
        }),
    ).toThrow("Calc worker print range is invalid.");
  } finally {
    transferred?.Dispose();
    reopened?.Dispose();
    source.Dispose();
  }
});

it("extracts only absolute same-sheet references from a reference-only expression", /** Exercises the original source-token states and reference filters. @returns Nothing. */ () => {
  const source = new ScDocument();
  try {
    for (const [tab, name] of ["Sheet1", "Sheet2"].entries()) {
      const value = unicode(name);
      try {
        expect(source.InsertTab(tab, value)).toBe(true);
      } finally {
        value.dispose();
      }
    }
    const pos = new ScAddress();
    InsertRangeNames(
      source,
      [
        {
          name: "Areas",
          scope: 0,
          pos,
          type: RangeDataType.Name,
          symbol: "(Sheet1!$A$1, Sheet1!A1, Sheet2!$A$2, Sheet1!$B$1:$B$2)",
        },
        {
          name: "Arithmetic",
          scope: 0,
          pos,
          type: RangeDataType.Name,
          symbol: "Sheet1!$A$1 + Sheet1!$A$2",
        },
      ],
      FormulaGrammar.Grammar.GRAM_OOXML,
    );
    const areas = source.GetRangeName(0)?.findByUpperName("AREAS");
    const arithmetic = source.GetRangeName(0)?.findByUpperName("ARITHMETIC");
    assert(areas && arithmetic);
    expect(extractCellRangeList(source, areas, 0)).toEqual([
      new ScRange(0, 0, 0, 0, 0, 0),
      new ScRange(1, 0, 0, 1, 1, 0),
    ]);
    expect(extractCellRangeList(source, arithmetic, 0)).toEqual([]);
  } finally {
    source.Dispose();
  }
});

it("keeps whole-sheet selection exclusive and copies title values", /** Checks the native defaults and cache effects of changing print setup. @returns Nothing. */ () => {
  const document = new ScDocument();
  const name = unicode("Sheet1");
  try {
    expect(document.InsertTab(0, name)).toBe(true);
    const table = document.FetchTable(0);
    assert(table);
    expect(table.IsPrintEntireSheet()).toBe(true);
    table.mbPageBreaksValid = true;
    table.SetPrintEntireSheet();
    expect(table.mbPageBreaksValid).toBe(true);
    const range = new ScRange(0, 0, 0, 0, 1, 0);
    table.AddPrintRange(range);
    expect(table.GetPrintRange(0)).toEqual(range);
    expect(table.GetPrintRange(0)).not.toBe(range);
    table.SetRepeatRowRange(range);
    const rows = table.GetRepeatRowRange();
    assert(rows);
    rows.aEnd.SetRow(2);
    expect(table.GetRepeatRowRange()?.aEnd.Row()).toBe(1);
    table.SetPrintEntireSheet();
    expect(table.IsPrintEntireSheet()).toBe(true);
    expect(table.GetPrintRangeCount()).toBe(0);
    expect(table.GetRepeatRowRange()?.aEnd.Row()).toBe(1);
    table.SetRepeatRowRange();
    table.SetRepeatColRange();
    expect(table.GetRepeatRowRange()).toBeUndefined();
    expect(table.GetRepeatColRange()).toBeUndefined();
    const qualified = unicode("$Sheet1.$A$2");
    try {
      const address = new ScAddress();
      const flags = address.Parse(qualified, document, ScAddress.detailsOOOa1);
      expect(flags & ScRefFlags.TAB_ABS_3D).toBe(ScRefFlags.TAB_ABS_3D);
      const formatted = address.Format(flags, document);
      const local = address.Format(flags);
      try {
        expect(text(formatted)).toBe("$Sheet1.$A$2");
        expect(text(local)).toBe("$A$2");
      } finally {
        formatted.dispose();
        local.dispose();
      }
    } finally {
      qualified.dispose();
    }
    for (const spelling of ["", "$Missing.$A$1", "Sheet1.XFE1", "Sheet1.A0", "Sheet1.A1048577"]) {
      const input = unicode(spelling);
      try {
        expect(new ScAddress().Parse(input, document, ScAddress.detailsOOOa1)).toBe(
          ScRefFlags.ZERO,
        );
      } finally {
        input.dispose();
      }
    }
    for (const [tab, [sheet, expected]] of [
      ["A1", "'A1'"],
      ["ZZ1", "'ZZ1'"],
      ["R1suffix", "'R1suffix'"],
      ["TRUE", "'TRUE'"],
      ["FALSE", "'FALSE'"],
      ["123", "'123'"],
      ["XFC1", "'XFC1'"],
      ["XFD1", "XFD1"],
      ["XFC0", "XFC0"],
      ["XFC1048577", "XFC1048577"],
    ].entries()) {
      const name = unicode(sheet as string);
      try {
        expect(document.InsertTab(tab + 1, name)).toBe(true);
        const printed = new ScAddress(0, 0, tab + 1).Format(
          ScRefFlags.VALID | ScRefFlags.TAB_3D,
          document,
        );
        try {
          expect(text(printed)).toBe(expected + ".A1");
        } finally {
          printed.dispose();
        }
      } finally {
        name.dispose();
      }
    }
  } finally {
    name.dispose();
    document.Dispose();
  }
});
