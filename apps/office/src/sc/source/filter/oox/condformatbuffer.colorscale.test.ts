/** @fileoverview LibreOffice color-scale fixtures across the native Calc model and file filters. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { Color } from "../../../../tools/inc/color";
import { ScAddress, ScRange } from "../../../inc/address";
import {
  ScColorScaleEntry,
  ScColorScaleEntryType as Type,
  ScColorScaleFormat,
} from "../../../inc/colorscale";
import {
  ScConditionalFormat,
  ScCondDateFormatEntry,
  ScFormatEntryType,
} from "../../../inc/conditio";
import { ScDocument } from "../../../inc/document";
import { UpdateRefMode } from "../../../inc/global";
import { ScRangeList } from "../../../inc/rangelst";
import {
  RefUpdateContext,
  RefUpdateDeleteTabContext,
  RefUpdateInsertTabContext,
  RefUpdateMoveTabContext,
} from "../../../inc/refupdatecontext";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { exportXlsx } from "../excel/xetable";
import { readOdsDocument, writeOdsDocument } from "../xml/xmlwrap";
import { ExcelFilter } from "./excelfilter";

/** Reads an unchanged upstream workbook. @param name - File name. @returns Fixture bytes. */
function fixture(name: string): Uint8Array {
  const extension = name.slice(name.lastIndexOf(".") + 1);
  return new Uint8Array(
    readFileSync(`../../vendor/libreoffice-reference/sc/qa/unit/data/${extension}/${name}`),
  );
}

/** Reads the native scale that covers the actual cell. @param document - Workbook. @param cell - Cell address. @returns Native rule. */
function scaleAt(document: ScDocument, cell: ScAddress): ScColorScaleFormat {
  const table = document.FetchTable(cell.Tab());
  assert(table);
  for (const format of table.GetCondFormList()) {
    if (!format.GetRange().Contains(new ScRange(cell, cell))) continue;
    expect(format.size()).toBe(1);
    const scale = format.GetEntry(0);
    assert(scale instanceof ScColorScaleFormat);
    return scale;
  }
  throw new Error("Missing color scale.");
}

/** Ports the two- and three-stop expectations of cond_format.cxx. @param document - Workbook. @returns Nothing. */
function checkColorScales(document: ScDocument): void {
  const types = [
    [
      [Type.MIN, Type.MAX],
      [Type.PERCENTILE, Type.PERCENT],
      [Type.VALUE, Type.FORMULA],
    ],
    [
      [Type.MIN, Type.PERCENTILE, Type.MAX],
      [Type.PERCENTILE, Type.VALUE, Type.PERCENT],
      [Type.VALUE, Type.VALUE, Type.FORMULA],
    ],
  ];
  for (const [tab, rules] of types.entries()) {
    for (const [index, expected] of rules.entries()) {
      const scale = scaleAt(document, new ScAddress(index * 2 + 1, tab ? 1 : 2, tab));
      expect(
        Array.from(
          scale,
          /** Reads the original model type. @param stop - Stop. @returns Type. */ (stop) =>
            stop.GetType(),
        ),
      ).toEqual(expected);
    }
  }
}

it("ports the upstream two- and three-stop ODS and XLSX color-scale round trips", /** Loads genuine packages and checks the Worker and filter routes. @returns Completion. */ async () => {
  const xlsx = await ExcelFilter.importDocument(fixture("colorscale.xlsx"));
  const ods = await readOdsDocument(fixture("colorscale.ods"));
  const worker = decodeCalcDocument(structuredClone(encodeCalcDocument(xlsx)));
  try {
    for (const document of [xlsx, ods, worker]) checkColorScales(document);
    const saved = await exportXlsx(worker);
    const archive = await DocumentArchive.open(saved);
    expect(await archive.readTextEntry("xl/worksheets/sheet1.xml")).toMatch(
      /<colorScale>.*?<cfvo type="min" val="0".*?<color rgb="FFFF0000"/u,
    );
    const reloadedXlsx = await ExcelFilter.importDocument(saved);
    const reloadedOds = await readOdsDocument(await writeOdsDocument(ods));
    try {
      checkColorScales(reloadedXlsx);
      checkColorScales(reloadedOds);
    } finally {
      reloadedOds.Dispose();
      reloadedXlsx.Dispose();
    }
  } finally {
    worker.Dispose();
    ods.Dispose();
    xlsx.Dispose();
  }
}, 120_000);

it("preserves absolute formula thresholds and swapped theme colors from the pinned workbooks", /** Ports the original formula and theme assertions. @returns Completion. */ async () => {
  const formulas = await ExcelFilter.importDocument(fixture("colorscale_num_with_ref.xlsx"));
  const theme = await ExcelFilter.importDocument(fixture("cond_format_theme_color3.xlsx"));
  try {
    const rule = scaleAt(formulas, new ScAddress(3, 3));
    const stop = rule.GetEntry(1);
    assert(stop);
    expect(stop.GetFormula(FormulaGrammar.Grammar.GRAM_NATIVE)).toBe("=$A$1");
    expect(stop.GetValue()).toBe(5);
    formulas.SetValue(new ScAddress(0, 0), 6);
    expect(stop.GetValue()).toBe(6);
    const saved = await exportXlsx(formulas);
    const xml = await (await DocumentArchive.open(saved)).readTextEntry("xl/worksheets/sheet1.xml");
    expect(xml).toContain('<cfvo type="formula" val="$A$1"');
    const colors = scaleAt(theme, new ScAddress(1, 3));
    expect(colors.GetEntry(0)?.GetColor().toUInt32()).toBe(0xafabab);
    expect(colors.GetEntry(1)?.GetColor().toUInt32()).toBe(0x333f50);
  } finally {
    theme.Dispose();
    formulas.Dispose();
  }
});

it.each([
  ["tdf155321.xlsx", 1],
  ["tdf156028.xlsx", 0],
])(
  "keeps the original upper percentile color in %s",
  /** Ports the original tied and single numeric percentile cases. @param name - Workbook. @param column - Tested column. @returns Completion. */ async (
    name,
    column,
  ) => {
    const document = await ExcelFilter.importDocument(fixture(name));
    try {
      expect(document.GetCondColor(new ScAddress(column, 0))?.toUInt32()).toBe(0x63be7b);
    } finally {
      document.Dispose();
    }
  },
);

it("invalidates the native scale cache after an edit to a tracked range", /** Checks exact interpolation including falling channels and queries after invalidation. @returns Completion. */ async () => {
  const document = await ExcelFilter.importDocument(fixture("colorscale.xlsx"));
  try {
    const cell = new ScAddress(1, 3);
    expect(document.GetCondColor(cell)?.toUInt32()).toBe(0xaa0055);
    document.SetValue(new ScAddress(1, 5), 6);
    expect(document.GetCondColor(cell)?.toUInt32()).toBe(0xcc0033);
    expect(document.GetCondColor(new ScAddress(0, 0))).toBeUndefined();
  } finally {
    document.Dispose();
  }
});

/** Creates named sheets for exercising native rule ownership. @returns Workbook. */
function createDocument(): ScDocument {
  const document = new ScDocument();
  for (const [tab, label] of ["First", "Second", "Third"].entries()) {
    const name = unicode(label);
    try {
      expect(document.InsertTab(tab, name)).toBe(true);
    } finally {
      name.dispose();
    }
  }
  return document;
}

it("copies and updates independently owned formula thresholds", /** Exercises the native rule reference contexts and formula lifetimes. @returns Nothing. */ () => {
  const document = createDocument();
  const source = new ScColorScaleFormat(document);
  const date = new ScCondDateFormatEntry(document);
  const cell = new ScAddress(2, 0, 0);
  const grammar = FormulaGrammar.Grammar.GRAM_OOXML;
  const red = new Color(255, 0, 0);
  const stop = new ScColorScaleEntry(0, red, Type.FORMULA);
  source.AddEntry(stop);
  source.AddEntry(new ScColorScaleEntry(10, red));
  document.SetValue(new ScAddress(0, 0, 1), 3);
  document.SetValue(new ScAddress(0, 1, 1), 4);
  document.SetValue(new ScAddress(0, 0, 2), 17);
  try {
    stop.SetFormula("SUM(Second!A1:A2)+Second!A1", document, cell, grammar);
    expect(source.GetType()).toBe(ScFormatEntryType.Colorscale);
    expect(stop.GetValue()).toBe(10);
    expect(source.IsEqual(date)).toBe(false);
    const copy = source.Clone(document);
    try {
      const cloned = copy.GetEntry(0);
      assert(cloned);
      expect(copy.IsEqual(source)).toBe(true);
      const context = new RefUpdateContext(document);
      context.meMode = UpdateRefMode.URM_COPY;
      context.maRange.aStart.Set(2, 0, 0);
      context.maRange.aEnd.Set(2, 10, 0);
      copy.UpdateReference(context);
      copy.UpdateInsertTab(new RefUpdateInsertTabContext(document, 1, 1));
      expect(cloned.GetFormula(grammar)).toBe("=SUM(Third!A1:A2)+Third!A1");
      expect(cloned.GetValue()).toBe(34);
      expect(copy.IsEqual(source)).toBe(false);
      copy.UpdateDeleteTab(new RefUpdateDeleteTabContext(document, 1, 1));
      expect(copy.IsEqual(source)).toBe(true);
      copy.UpdateMoveTab(new RefUpdateMoveTabContext(document, 1, 2));
      expect(cloned.GetValue()).toBe(34);
      copy.UpdateDeleteTab(new RefUpdateDeleteTabContext(document, 2, 1));
      expect(cloned.GetFormula(grammar)).toContain("#REF!");
      expect(cloned.GetValue()).toBe(0);
      copy.UpdateMoveTab(new RefUpdateMoveTabContext(document, 0, 1));
      expect(cloned.GetFormula(grammar)).toContain("#REF!");
      expect(stop.GetFormula(grammar)).toBe("=SUM(Second!A1:A2)+Second!A1");
      cloned.SetFormula('="text"', document, cell, grammar);
      expect(cloned.GetValue()).toBe(Number.MAX_VALUE);
    } finally {
      copy.Dispose();
    }
  } finally {
    source.Dispose();
    date.Dispose();
    document.Dispose();
  }
});

it("handles percentile bounds, reversed endpoints, and nonnumeric cells", /** Checks the original scale edge cases against native range ownership. @returns Nothing. */ () => {
  const document = createDocument();
  const position = new ScAddress(0, 1);
  const group = new ScConditionalFormat(1, document);
  const red = new Color(255, 0, 0);
  const blue = new Color(0, 0, 255);
  const scale = new ScColorScaleFormat(document);
  const range = new ScRangeList();
  range.push_back(new ScRange(0, 0, 0, 0, 4, 0));
  range.push_back(new ScRange(0, 0, 9, 0, 4, 9));
  group.SetRange(range);
  group.AddEntry(scale);
  try {
    for (const [row, value] of [10, 15, 30].entries())
      document.SetValue(new ScAddress(0, row), value);
    scale.AddEntry(new ScColorScaleEntry(-10, red, Type.PERCENTILE));
    expect(scale.GetColor(position)).toBeUndefined();
    const prefix = scale.Clone(document);
    scale.AddEntry(new ScColorScaleEntry(120, blue, Type.PERCENTILE));
    try {
      expect(prefix.IsEqual(scale)).toBe(true);
      expect(scale.IsEqual(prefix)).toBe(false);
      expect(prefix.GetEntry(0)?.GetFormula(FormulaGrammar.Grammar.GRAM_ODFF)).toBe("");
      prefix.AddEntry(new ScColorScaleEntry(120, blue));
      expect(scale.IsEqual(prefix)).toBe(false);
    } finally {
      prefix.Dispose();
    }
    expect(scale.GetColor(position)?.toUInt32()).toBe(0xc0003f);
    expect(scale.GetColor(new ScAddress(0, 3))).toBeUndefined();
    const reversed = new ScColorScaleFormat(document);
    try {
      reversed.AddEntry(new ScColorScaleEntry(50, red));
      reversed.AddEntry(new ScColorScaleEntry(0, blue));
      expect(reversed.GetColor(position)).toBeUndefined();
      expect(reversed.IsEqual(scale)).toBe(false);
    } finally {
      reversed.Dispose();
    }
    const unbound = new ScColorScaleFormat(document);
    try {
      unbound.AddEntry(new ScColorScaleEntry(50, red, Type.PERCENTILE));
      unbound.AddEntry(new ScColorScaleEntry(0, blue, Type.MAX));
      expect(unbound.GetColor(position)).toBeUndefined();
      const empty = new ScColorScaleFormat(document);
      try {
        empty.AddEntry(new ScColorScaleEntry(0, red));
        empty.AddEntry(new ScColorScaleEntry(10, blue));
        empty.AddEntry(new ScColorScaleEntry(50, red, Type.PERCENTILE));
        expect(empty.GetColor(position)).toBeUndefined();
        expect(empty.IsEqual(unbound)).toBe(false);
      } finally {
        empty.Dispose();
      }
    } finally {
      unbound.Dispose();
    }
  } finally {
    group.Dispose();
    document.Dispose();
  }
});
