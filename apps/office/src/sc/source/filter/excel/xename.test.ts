/** @fileoverview Native name expansion and workbook-defined names through file and worker round trips. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { InsertRangeNames, RangeDataType, ScRangeData } from "../../core/tool/rangenam";
import { ExcelFilter } from "../oox/excelfilter";
import { readOdsDocument, writeOdsDocument, writeOdsXml } from "../xml/xmlwrap";
import { exportXlsx } from "./xetable";

const xlsx = FormulaGrammar.Grammar.GRAM_OOXML;

/** Inserts sheets through the document's actual name owner. @param document - Calc document. @param names - Sheet names in order. @returns Nothing. */
function tabs(document: ScDocument, ...names: string[]): void {
  for (const [index, name] of names.entries()) {
    const value = unicode(name);
    try {
      expect(document.InsertTab(index, value)).toBe(true);
    } finally {
      value.dispose();
    }
  }
}

/** Writes a real native formula cell. @param document - Calc document. @param cell - Destination. @param formula - OOXML source. @returns Nothing. */
function setFormula(document: ScDocument, cell: ScAddress, formula: string): void {
  const value = unicode(formula);
  try {
    document.SetFormula(cell, value, xlsx);
  } finally {
    value.dispose();
  }
}

it("preserves a forward name, a local override and a hidden qualified range through XLSX, ODS and worker transfer", /** Asserts scope-qualified tokens and native calculation on actual cells. @returns Completion. */ async () => {
  const source = new ScDocument();
  let reopened: ScDocument | undefined, ods: ScDocument | undefined, worker: ScDocument | undefined;
  try {
    tabs(source, "Sales Data", "Report");
    const first = new ScAddress(0, 0, 0),
      second = new ScAddress(0, 0, 1);
    InsertRangeNames(
      source,
      [
        {
          name: "Total",
          scope: -1,
          pos: first,
          type: RangeDataType.Name,
          symbol: "SUM(Sales)*Factor",
        },
        {
          name: "Sales",
          scope: -1,
          pos: first,
          type: RangeDataType.Hidden,
          symbol: "'Sales Data'!$A$1:$A$2",
        },
        { name: "Factor", scope: -1, pos: first, type: RangeDataType.Name, symbol: "5" },
        { name: "Factor", scope: 1, pos: second, type: RangeDataType.Name, symbol: "3" },
        { name: "LocalValue", scope: 1, pos: second, type: RangeDataType.Name, symbol: "$A$1" },
      ],
      xlsx,
    );
    source.SetValue(first, 2);
    source.SetValue(new ScAddress(0, 1, 0), 4);
    source.SetValue(second, 11);
    const report = new ScAddress(1, 0, 1);
    const externalName = new ScAddress(2, 0, 0);
    setFormula(source, report, "=Total+factor");
    setFormula(source, externalName, "=Report!LocalValue+Report!Factor");
    expect(source.GetValue(report)).toBe(33);
    expect(source.GetValue(externalName)).toBe(14);

    const bytes = await exportXlsx(source);
    const workbook = await (await DocumentArchive.open(bytes)).readTextEntry("xl/workbook.xml");
    expect(workbook).toContain('<definedName name="Factor" localSheetId="1">3</definedName>');
    expect(workbook).toContain(
      '<definedName name="Sales" hidden="true">&apos;Sales Data&apos;!$A$1:$A$2</definedName>',
    );
    reopened = await ExcelFilter.importDocument(bytes);
    expect(reopened.GetValue(report)).toBe(33);
    expect((await writeOdsXml(reopened)).files["content.xml"]).toContain(
      'table:range-usable-as="hidden"',
    );
    ods = await readOdsDocument(await writeOdsDocument(reopened));
    worker = decodeCalcDocument(encodeCalcDocument(ods));
    expect(worker.GetValue(report)).toBe(33);
    expect(worker.GetValue(externalName)).toBe(14);
    expect(worker.GetRangeName(1)?.findByUpperName("FACTOR")?.GetSymbol()).toBe("3");
    worker.SetValue(first, 4);
    expect(worker.GetValue(report)).toBe(43);
    const sheet = await (
      await DocumentArchive.open(await exportXlsx(worker))
    ).readTextEntry("xl/worksheets/sheet2.xml");
    expect(sheet).toContain("<f>Total+Factor</f>");
  } finally {
    worker?.Dispose();
    ods?.Dispose();
    reopened?.Dispose();
    source.Dispose();
  }
});

it.each([
  ["tdf115159", "Munka1!$1:$1"],
  ["tdf112567", "Munka1!$A:$A,Munka1!$1:$1"],
])(
  "keeps the built-in Print Titles name once in %s",
  /** Replays the two pinned Excel name regressions. @param fixture - Original workbook. @param expected - Formula text. @returns Completion. */ async (
    fixture,
    expected,
  ) => {
    const bytes = readFileSync(
      `../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/${fixture}.xlsx`,
    );
    const document = await ExcelFilter.importDocument(new Uint8Array(bytes));
    try {
      const original = document.GetRangeName(0)?.findByUpperName("EXCEL_BUILTIN_PRINT_TITLES");
      assert(original);
      expect(original.type & RangeDataType.RowHeader).toBeTruthy();
      const table = document.FetchTable(0);
      expect(table?.GetRepeatRowRange()?.aStart.Row()).toBe(0);
      expect(table?.GetRepeatRowRange()?.aEnd.Row()).toBe(0);
      const xml = await (
        await DocumentArchive.open(await exportXlsx(document))
      ).readTextEntry("xl/workbook.xml");
      expect(xml.match(/<definedName\s/gu)).toHaveLength(1);
      expect(xml).toContain(`localSheetId="0">${expected}</definedName>`);
    } finally {
      document.Dispose();
    }
  },
);

it("preserves literal error formulas and bounds mutually recursive names", /** Compiles the original name source and exercises the expansion stack. @returns Nothing. */ () => {
  const source = new ScDocument();
  try {
    tabs(source, "Sheet1");
    const pos = new ScAddress();
    InsertRangeNames(
      source,
      [
        { name: "FirstName", scope: -1, pos, type: RangeDataType.Name, symbol: "SecondName" },
        { name: "SecondName", scope: -1, pos, type: RangeDataType.Name, symbol: "FirstName" },
        { name: "InvalidRef", scope: -1, pos, type: RangeDataType.Name, symbol: "#REF!-#REF!" },
      ],
      xlsx,
    );
    setFormula(source, pos, "=FirstName");
    expect(source.GetFormulaCell(pos)?.GetCode().GetCodeError()).toBe(FormulaError.StackOverflow);
    expect(source.GetRangeName()?.findByUpperName("INVALIDREF")?.GetSymbol()).toBe("#REF!-#REF!");
  } finally {
    source.Dispose();
  }
});

it("retains a hidden ODS expression when its original base address is invalid", /** Replays the native fallback in RangeNameInserter. @returns Completion. */ async () => {
  const source = new ScDocument();
  let reopened: ScDocument | undefined;
  try {
    tabs(source, "First", "Second");
    InsertRangeNames(
      source,
      [
        {
          name: "Offset",
          scope: 1,
          pos: new ScAddress(2, 7, 1),
          type: RangeDataType.Hidden,
          symbol: "10+1",
        },
      ],
      xlsx,
    );
    const xml = await writeOdsXml(source);
    const content = xml.files["content.xml"];
    assert(typeof content === "string");
    const changed = content.replace(
      'table:base-cell-address="$Second.$C$8" table:expression="10+1"',
      'table:base-cell-address="$Missing.$C$8" table:expression="of:=10+1"',
    );
    expect(changed).not.toBe(content);
    reopened = await readOdsDocument({ ...xml, files: { ...xml.files, "content.xml": changed } });
    const name = reopened.GetRangeName(1)?.findByUpperName("OFFSET");
    expect(name?.GetSymbol()).toBe("10+1");
    expect(name?.pos.GetVars()).toEqual([0, 0, 1]);
    expect(name?.type).toBe(RangeDataType.Hidden);
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});

it("indexes each native name once and skips definitions without a sheet", /** Checks case-insensitive collisions and native name indexes. @returns Nothing. */ () => {
  const document = new ScDocument();
  try {
    tabs(document, "Sheet1");
    const pos = new ScAddress();
    const names = document.GetRangeName();
    assert(names);
    const first = new ScRangeData(document, "FirstName", pos);
    first.SetIndex(1);
    expect(names.insert(first)).toBe(true);
    const collision = new ScRangeData(document, "OtherName", pos);
    collision.SetIndex(1);
    expect(names.insert(collision)).toBe(false);
    expect(names.insert(new ScRangeData(document, "firstName", pos))).toBe(false);
    expect(names.insert(new ScRangeData(document, "", pos))).toBe(false);
    const second = new ScRangeData(document, "SecondName", pos);
    expect(names.insert(second)).toBe(true);
    expect(second.GetIndex()).toBe(2);
    expect(names.findByIndex(1)).toBe(first);
    expect(names.findByIndex(2)).toBe(second);
    InsertRangeNames(
      document,
      [{ name: "BadScope", scope: 7, pos, type: RangeDataType.Name, symbol: "4" }],
      xlsx,
    );
    expect([...names]).toEqual([first, second]);
  } finally {
    document.Dispose();
  }
});

it("loads ordinary worksheet names next to function, VBA, and invalid-scope records", /** Exercises admission through an external workbook fragment. @returns Completion. */ async () => {
  const source = new ScDocument();
  let reopened: ScDocument | undefined;
  try {
    tabs(source, "Sheet1");
    const original = await DocumentArchive.open(await exportXlsx(source));
    const path = "xl/workbook.xml";
    const workbook = await original.readTextEntry(path);
    const replacement = workbook.replace(
      "</workbook>",
      '<definedNames><definedName name="OrdinaryName">4</definedName><definedName name="InvalidScope" localSheetId="8">5</definedName><definedName name="FunctionName" function="true">6</definedName><definedName name="VbaName" vbProcedure="true">7</definedName><definedName>8</definedName></definedNames></workbook>',
    );
    expect(replacement).not.toBe(workbook);
    const archive = new DocumentArchiveWriter();
    for (const entry of original.getEntryNames())
      archive.putNextEntry(
        entry,
        entry === path ? new TextEncoder().encode(replacement) : await original.readEntry(entry),
      );
    reopened = await ExcelFilter.importDocument(await archive.finish());
    const globals = reopened.GetRangeName();
    assert(globals);
    expect([...globals]).toHaveLength(1);
    expect(globals.findByUpperName("ORDINARYNAME")?.GetSymbol()).toBe("4");
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});
