/** @fileoverview Native XLSX worksheet name validation, export references and restoration. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { InsertRangeNames, RangeDataType } from "../../core/tool/rangenam";
import { ExcelFilter } from "../oox/excelfilter";
import { readOdsDocument } from "../xml/xmlwrap";
import { XclExpXmlStream } from "./xestream";
import { exportXlsx } from "./xetable";

const grammar = FormulaGrammar.Grammar.GRAM_OOXML;

/** Adds each named sheet to the actual model. @param names - Source workbook names. @returns Owned document. */
function createDocument(names: readonly string[]): ScDocument {
  const document = new ScDocument();
  for (const [tab, name] of names.entries()) {
    const source = unicode(name);
    try {
      assert(document.InsertTab(tab, source));
    } finally {
      source.dispose();
    }
  }
  return document;
}

/** Reads the primary name of an initialized sheet. @param document - Model. @param tab - Worksheet. @returns Name. */
function getName(document: ScDocument, tab: number): string {
  const table = document.FetchTable(tab);
  assert(table);
  return text(table.GetName());
}

it("exports the original tdf79998 ODS sheet with its Excel name limit", /** Replays the upstream XLSX save and reload check using its unchanged ODS fixture. @returns Completion. */ async () => {
  const bytes = new Uint8Array(
    readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/ods/tdf79998.ods"),
  );
  const source = await readOdsDocument(bytes);
  let reopened: ScDocument | undefined;
  try {
    const original = "Utilities (FX Kurse, Kreditkarten etc)";
    expect(getName(source, 1)).toBe(original);
    const broken = source.GetRangeName()?.findByUpperName("STANDGIROKONTO");
    assert(broken);
    expect(broken.GetSymbol(grammar)).toBe("#REF!");
    const xlsx = await exportXlsx(source);
    const archive = await DocumentArchive.open(xlsx);
    const workbook = await archive.readTextEntry("xl/workbook.xml");
    expect(workbook).toContain('name="StandGirokonto">#REF!</definedName>');
    expect(await archive.readTextEntry("xl/worksheets/sheet1.xml")).toContain(
      "<f>&apos;Utilities (FX Kurse, Kreditkart&apos;!A1</f>",
    );
    expect(getName(source, 1)).toBe(original);
    reopened = await ExcelFilter.importDocument(xlsx);
    expect(getName(reopened, 1)).toBe("Utilities (FX Kurse, Kreditkart");
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});

it("exports unique sheet names and rewrites formula, defined name and print area references", /** Exercises the temporary names through the same workbook and worksheet serializers used by the file UI. @returns Completion. */ async () => {
  const prefix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ12345";
  const sourceName = prefix + " original";
  const names = ["Main", sourceName, prefix, prefix + " second", prefix.slice(0, 29) + "-1"];
  const document = createDocument(names);
  let reopened: ScDocument | undefined;
  const address = new ScAddress();
  const formula = unicode("='" + sourceName + "'!A1+1");
  try {
    document.SetValue(new ScAddress(0, 0, 1), 41);
    document.SetFormula(address, formula, grammar);
    const tab = document.FetchTable(1);
    assert(tab);
    tab.AddPrintRange(new ScRange(0, 0, 1, 1, 1, 1));
    InsertRangeNames(
      document,
      [
        {
          name: "FirstCell",
          scope: -1,
          pos: address,
          type: RangeDataType.Name,
          symbol: "'" + sourceName + "'!$A$1",
        },
      ],
      grammar,
    );
    const bytes = await exportXlsx(document);
    const archive = await DocumentArchive.open(bytes);
    const workbook = await archive.readTextEntry("xl/workbook.xml");
    const first = prefix.slice(0, 29) + "-2";
    const second = prefix.slice(0, 29) + "-3";
    expect(workbook).toContain('name="' + first + '"');
    expect(workbook).toContain('name="' + second + '"');
    expect(workbook).toContain('name="FirstCell">&apos;' + first + "&apos;!$A$1</definedName>");
    expect(workbook).toContain(
      'localSheetId="1">&apos;' + first + "&apos;!$A$1:$B$2</definedName>",
    );
    expect(await archive.readTextEntry("xl/worksheets/sheet1.xml")).toContain(
      "<f>&apos;" + first + "&apos;!A1+1</f>",
    );
    reopened = await ExcelFilter.importDocument(bytes);
    expect(reopened.GetValue(address)).toBe(42);
    reopened.SetValue(new ScAddress(0, 0, 1), 99);
    expect(reopened.GetValue(address)).toBe(100);
    expect(reopened.FetchTable(1)?.GetPrintRange(0)).toEqual(new ScRange(0, 0, 1, 1, 1, 1));
    expect(text(tab.GetName())).toBe(sourceName);
    expect(getName(document, 3)).toBe(names[3]);
  } finally {
    formula.dispose();
    reopened?.Dispose();
    document.Dispose();
  }
});

it("uses the next available decimal suffix and restores names after a writer error", /** Exercises the native suffix width and the scoped restore path. @returns Nothing. */ () => {
  const prefix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ12345";
  const used = new Set([prefix]);
  for (let suffix = 1; suffix < 10; ++suffix) used.add(prefix.slice(0, 29) + "-" + suffix);
  expect(XclExpXmlStream.GenerateUniqueTableName(prefix + " extra", used)).toBe(
    prefix.slice(0, 28) + "-10",
  );
  const original = prefix + " original";
  const document = createDocument([original, "Other"]);
  try {
    const stream = new XclExpXmlStream(new ZipStorage(), false, false);
    expect(
      /** Emulates a synchronous stream failure while names are bound. @returns Nothing. */ () =>
        stream.WithValidatedTabNames(
          document,
          /** Observes the native candidate while the serializer is active. @returns Nothing. */ () => {
            expect(getName(document, 0)).toBe(prefix);
            throw new Error("Worksheet write failed");
          },
        ),
    ).toThrow("Worksheet write failed");
    expect(getName(document, 0)).toBe(original);
    expect(getName(document, 1)).toBe("Other");
  } finally {
    document.Dispose();
  }
});

it.each([
  [
    "a case-insensitive collision",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ12345",
    "abcdefghijklmnopqrstuvwxyz12345 extra",
  ],
  ["a newly trailing apostrophe", "Other", "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234' extra"],
])(
  "keeps the native rejected rename with %s",
  /** Replays the upstream exact candidate lookup followed by RenameTab validation. @param _scenario - Rejected candidate type. @param existing - Other sheet. @param original - Long source name. @returns Completion. */ async (
    _scenario,
    existing,
    original,
  ) => {
    const document = createDocument([existing, original]);
    try {
      const archive = await DocumentArchive.open(await exportXlsx(document));
      const workbook = await archive.readTextEntry("xl/workbook.xml");
      expect(workbook).toContain('name="' + original.replaceAll("'", "&apos;") + '"');
      expect(getName(document, 1)).toBe(original);
    } finally {
      document.Dispose();
    }
  },
);

it("compiles a legacy bracketed deleted-sheet range as a native invalid reference", /** Checks the range's error value and both modern serialization conventions. @returns Nothing. */ () => {
  const document = createDocument(["Data"]);
  const address = new ScAddress();
  const source = unicode("=SUM([#REF!.$A$1:$B$2])");
  try {
    document.SetFormula(address, source, FormulaGrammar.Grammar.GRAM_ODFF);
    const formula = document.GetFormulaCell(address);
    assert(formula);
    expect(formula.GetErrCode()).toBe(FormulaError.NoRef);
    const odf = formula.GetFormula(FormulaGrammar.Grammar.GRAM_ODFF);
    const excel = formula.GetFormula(grammar);
    try {
      expect(text(odf)).toBe("=SUM([#REF!])");
      expect(text(excel)).toBe("=SUM(#REF!)");
    } finally {
      odf.dispose();
      excel.dispose();
    }
  } finally {
    source.dispose();
    document.Dispose();
  }
});
