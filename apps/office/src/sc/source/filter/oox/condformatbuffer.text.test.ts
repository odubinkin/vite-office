/** @fileoverview Original Calc QA for condition literals, live formatting and Excel compatibility formulas. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScRefCellValue } from "../../../inc/cellvalue";
import { ScCondFormatEntry, ScConditionalFormat, ScConditionMode } from "../../../inc/conditio";
import type { ScDocument } from "../../../inc/document";
import { ScRangeList } from "../../../inc/rangelst";
import { exportXlsx } from "../excel/xetable";
import { readOdsDocument, writeOdsDocument } from "../xml/xmlwrap";
import { ExcelFilter } from "./excelfilter";

/** Reads a pinned upstream fixture. @param name - Format directory and file name. @returns Package bytes. */
function fixture(name: string): Uint8Array {
  return new Uint8Array(readFileSync(`../../vendor/libreoffice-reference/sc/qa/unit/data/${name}`));
}

/** Reads emitted compatibility formulas in their actual cell-range groups. @param document - Workbook. @returns Range and formula pairs. */
async function exportFormulas(
  document: ScDocument,
): Promise<Map<string, string | null | undefined>> {
  const archive = await DocumentArchive.open(await exportXlsx(document));
  const xml = await archive.readTextEntry("xl/worksheets/sheet1.xml");
  const sheet = new DOMParser().parseFromString(xml, "application/xml");
  const rules = new Map<string, string | null | undefined>();
  for (const group of sheet.getElementsByTagName("conditionalFormatting")) {
    rules.set(
      group.getAttribute("sqref") ?? "",
      group.getElementsByTagName("formula")[0]?.textContent,
    );
  }
  return rules;
}

/** Checks actual rendered-style decisions for the four rules in tdf166413. @param document - Workbook. @returns Nothing. */
function checkQuoteRules(document: ScDocument): void {
  for (let row = 0; row < 4; ++row) {
    for (let col = 0; col < 3; ++col) {
      expect(document.GetCondResult(new ScAddress(col, row)) !== undefined).toBe(
        row === 1 ? col !== 2 : col === 2,
      );
    }
  }
}

it("ports the four quoted literal formula assertions from tdf166413", /** Uses the original input and reopens both output formats. @returns Completion. */ async () => {
  const document = await ExcelFilter.importDocument(fixture("xlsx/tdf166413.xlsx"));
  try {
    checkQuoteRules(document);
    const formulas = await exportFormulas(document);
    expect(formulas.size).toBe(4);
    expect(formulas.get("A1:C1")).toBe('NOT(ISERROR(SEARCH("""ABC""",A1)))');
    expect(formulas.get("A2:C2")).toBe('ISERROR(SEARCH("""ABC""",A2))');
    expect(formulas.get("A3:C3")).toBe('LEFT(A3,LEN("""ABC"""))="""ABC"""');
    expect(formulas.get("A4:C4")).toBe('RIGHT(A4,LEN("""ABC"""))="""ABC"""');
    const excel = await ExcelFilter.importDocument(await exportXlsx(document));
    const ods = await readOdsDocument(await writeOdsDocument(document));
    try {
      checkQuoteRules(excel);
      checkQuoteRules(ods);
    } finally {
      excel.Dispose();
      ods.Dispose();
    }
  } finally {
    document.Dispose();
  }
}, 120_000);

it("uses the source corner for disjoint rules and exports the native ODF text condition", /** Ports the original origin and cross-format tests. @returns Completion. */ async () => {
  const excel = await ExcelFilter.importDocument(fixture("xlsx/conditional_fmt_origin.xlsx"));
  const ods = await readOdsDocument(fixture("ods/conditionalformat_containstext.ods"));
  try {
    expect((await exportFormulas(excel)).get("B3:C6 F1:G2")).toBe('NOT(ISERROR(SEARCH("BAC",B1)))');
    expect((await exportFormulas(ods)).get("A1:A4")).toBe('NOT(ISERROR(SEARCH("test",A1)))');
    expect(ods.GetCondResult(new ScAddress())).toBeDefined();
  } finally {
    excel.Dispose();
    ods.Dispose();
  }
});

it("matches mixed case without treating a numeric operand as a string needle", /** Tests the native begins-with, ends-with and substring services. @returns Completion. */ async () => {
  const document = await readOdsDocument(fixture("ods/conditionalformat_containstext.ods"));
  const address = new ScAddress();
  const source = unicode("Alpha Beta");
  const cell = document.GetSharedStringPool().intern(source);
  try {
    for (const [mode, criterion, expected] of [
      [ScConditionMode.BeginsWith, '"alpha"', true],
      [ScConditionMode.BeginsWith, '"bet"', false],
      [ScConditionMode.EndsWith, '"bETA"', true],
      [ScConditionMode.EndsWith, '"PrefixAlpha Beta"', false],
      [ScConditionMode.ContainsText, '"HA be"', true],
      [ScConditionMode.NotContainsText, "3", false],
    ] as const) {
      const rule = new ScCondFormatEntry(
        mode,
        [criterion],
        document,
        address,
        FormulaGrammar.Grammar.GRAM_OOXML,
        "Good",
      );
      try {
        expect(rule.IsCellValid(new ScRefCellValue(cell), address)).toBe(expected);
      } finally {
        rule.Dispose();
      }
    }
  } finally {
    cell.dispose();
    source.dispose();
    document.Dispose();
  }
});

it("evaluates numeric cells using the original number-to-string and empty operand rules", /** Checks non-integer numeric matching on the same condition owner. @returns Completion. */ async () => {
  const document = await readOdsDocument(fixture("ods/conditionalformat_containstext.ods"));
  const address = new ScAddress();
  const grammar = FormulaGrammar.Grammar.GRAM_OOXML;
  try {
    for (const [mode, criterion, cell, matches] of [
      [ScConditionMode.BeginsWith, "15", 153.6, true],
      [ScConditionMode.EndsWith, "6", 153.6, true],
      [ScConditionMode.ContainsText, '".6"', 153.6, true],
      [ScConditionMode.NotContainsText, '""', 153.6, true],
      [ScConditionMode.ContainsText, '""', 10, true],
    ] as const) {
      const rule = new ScCondFormatEntry(mode, [criterion], document, address, grammar, "Good");
      try {
        expect(rule.IsCellValid(new ScRefCellValue(cell), address)).toBe(matches);
      } finally {
        rule.Dispose();
      }
    }
  } finally {
    document.Dispose();
  }
});

it("exports the original numeric criterion as a string operand and reimports it", /** Ports testConditionalFormatNumberInTextRule using real filter graphs. @returns Completion. */ async () => {
  const document = await ExcelFilter.importDocument(fixture("xlsx/universal-content.xlsx"));
  const address = new ScAddress();
  const grammar = FormulaGrammar.Grammar.GRAM_OOXML;
  try {
    const ranges = new ScRangeList();
    ranges.push_back(new ScRange(address, address));
    const format = new ScConditionalFormat(0, document);
    format.SetRange(ranges);
    format.AddEntry(
      new ScCondFormatEntry(ScConditionMode.BeginsWith, ["15"], document, address, grammar, ""),
    );
    const key = document.AddCondFormat(format, 0);
    expect(key).toBeGreaterThan(0);
    document.AddCondFormatData(ranges, 0, key);
    const saved = await exportXlsx(document);
    const archive = await DocumentArchive.open(saved);
    expect(await archive.readTextEntry("xl/worksheets/sheet1.xml")).toMatch(
      /type="beginsWith"[^>]*text="15"/u,
    );
    const reopened = await ExcelFilter.importDocument(saved);
    try {
      const [first] = Array.from(reopened.FetchTable(0)?.GetCondFormList() ?? []);
      const entry = first?.GetEntry(0);
      expect(entry).toBeInstanceOf(ScCondFormatEntry);
      expect((entry as ScCondFormatEntry).GetOperation()).toBe(ScConditionMode.BeginsWith);
      expect((entry as ScCondFormatEntry).GetExpression(address, 0, grammar)).toBe('"15"');
    } finally {
      reopened.Dispose();
    }
  } finally {
    document.Dispose();
  }
});

it("keeps inclusive boundaries and nested operands as ordinary rules through both filters", /** Exercises every supported scalar comparison through the native document and format owners. @returns Completion. */ async () => {
  const document = await ExcelFilter.importDocument(fixture("xlsx/universal-content.xlsx"));
  const grammar = FormulaGrammar.Grammar.GRAM_OOXML;
  const cases = [
    [ScConditionMode.Equal, ["5"], [false, true, false]],
    [ScConditionMode.NotEqual, ["5"], [true, false, true]],
    [ScConditionMode.Less, ["5"], [true, false, false]],
    [ScConditionMode.EqLess, ["5"], [true, true, false]],
    [ScConditionMode.Greater, ["5"], [false, false, true]],
    [ScConditionMode.EqGreater, ["5"], [false, true, true]],
    [ScConditionMode.Between, ["(1+1)", "(3*3)"], [false, true, true]],
    [ScConditionMode.NotBetween, ["(1+1)", "(3*3)"], [true, false, false]],
  ] as const;
  let ods: ScDocument | undefined;
  let xlsx: ScDocument | undefined;
  try {
    const style = document.GetStyleSheetPool()?.GetDefaultStyle();
    if (!style) throw new Error("Missing native default cell style.");
    for (const [index, [mode, operands]] of cases.entries()) {
      const col = index + 8;
      const first = new ScAddress(col, 0);
      const ranges = new ScRangeList();
      ranges.push_back(new ScRange(first, new ScAddress(col, 2)));
      const format = new ScConditionalFormat(0, document);
      format.SetRange(ranges);
      format.AddEntry(
        new ScCondFormatEntry(mode, operands, document, first, grammar, text(style.GetName())),
      );
      const key = document.AddCondFormat(format, 0);
      expect(key).toBeGreaterThan(0);
      document.AddCondFormatData(ranges, 0, key);
      for (const [row, value] of [0, 5, 9].entries())
        document.SetValue(new ScAddress(col, row), value);
    }
    ods = await readOdsDocument(await writeOdsDocument(document));
    xlsx = await ExcelFilter.importDocument(await exportXlsx(ods));
    for (const graph of [document, ods, xlsx]) {
      for (const [index, [, , values]] of cases.entries()) {
        for (const [row, expected] of values.entries())
          expect(graph.GetCondResult(new ScAddress(index + 8, row)) !== undefined).toBe(expected);
      }
    }
  } finally {
    xlsx?.Dispose();
    ods?.Dispose();
    document.Dispose();
  }
});

it("keeps usable XLSX rules beside malformed rule records and missing differential styles", /** Exercises rule admission, priority replacement and default style through the native filter. @returns Completion. */ async () => {
  const original = await DocumentArchive.open(fixture("xlsx/universal-content.xlsx"));
  const writer = new DocumentArchiveWriter();
  const worksheet = "xl/worksheets/sheet1.xml";
  const valid =
    '<cfRule type="cellIs" operator="equal" dxfId="999" priority="5"><formula>1</formula></cfRule>';
  const ignored = '<cfRule type="cellIs" operator="equal"><formula>1</formula></cfRule>';
  const noOperator = '<cfRule type="cellIs" priority="6"><formula>1</formula></cfRule>';
  const shortBetween =
    '<cfRule type="cellIs" operator="between" priority="7"><formula>1</formula></cfRule>';
  const emptyOperand =
    '<cfRule type="cellIs" operator="equal" priority="8"><formula> </formula></cfRule>';
  const previous =
    '<cfRule type="cellIs" operator="equal" priority="5"><formula>2</formula></cfRule>';
  const invalidRange = `<conditionalFormatting sqref="XFE1048577">${valid}</conditionalFormatting>`;
  const conditions = `<conditionalFormatting sqref="A1">${previous}${valid}${ignored}${noOperator}${shortBetween}${emptyOperand}</conditionalFormatting>`;
  for (const path of original.getEntryNames()) {
    if (path !== worksheet) writer.putNextEntry(path, await original.readEntry(path));
    else {
      const xml = await original.readTextEntry(path);
      writer.putNextEntry(
        path,
        new TextEncoder().encode(
          xml.replace("</worksheet>", invalidRange + conditions + "</worksheet>"),
        ),
      );
    }
  }
  const document = await ExcelFilter.importDocument(await writer.finish());
  try {
    const [format] = Array.from(document.FetchTable(0)?.GetCondFormList() ?? []);
    expect(format?.size()).toBe(1);
    expect(document.GetCondResult(new ScAddress())).toBeDefined();
    document.SetValue(new ScAddress(), 2);
    expect(document.GetCondResult(new ScAddress())).toBeUndefined();
    const formulas = await exportFormulas(document);
    expect([...formulas]).toEqual([["A1", "1"]]);
  } finally {
    document.Dispose();
  }
}, 120_000);
