/** @fileoverview Native comparison rules, relative operands and conditional style ownership. */
import { assert, expect, it } from "vitest";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScRefCellValue } from "../../../inc/cellvalue";
import {
  ScConditionMode as Mode,
  ScCondFormatEntry,
  ScConditionalFormat,
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

const grammar = FormulaGrammar.Grammar.GRAM_OOXML;

it("evaluates original scalar comparison modes and their approximate boundaries", /** Tests numeric and text comparison over original formula arguments. @returns Nothing. */ () => {
  const document = new ScDocument();
  const position = new ScAddress();
  const string = unicode("Alpha");
  const error = unicode("=1/0");
  const name = unicode("Rules");
  try {
    document.InsertTab(0, name);
    document.SetTextCell(position, string);
    const cell = document.GetRefCellValue(position);
    const formulaPosition = new ScAddress(0, 1, 0);
    document.SetString(formulaPosition, error);
    const formula = document.GetRefCellValue(formulaPosition);
    const cases: readonly (readonly [Mode, string[], ScRefCellValue, boolean])[] = [
      [Mode.Equal, ["0.3"], new ScRefCellValue(0.1 + 0.2), true],
      [Mode.NotEqual, ["0.3"], new ScRefCellValue(0.1 + 0.2), false],
      [Mode.Less, ["0.3"], new ScRefCellValue(0.29999999999999993), false],
      [Mode.Greater, ["0.3"], new ScRefCellValue(0.30000000000000004), false],
      [Mode.EqLess, ["0.3"], new ScRefCellValue(0.30000000000000004), true],
      [Mode.EqGreater, ["0.3"], new ScRefCellValue(0.29999999999999993), true],
      [Mode.Less, ["2"], new ScRefCellValue(1), true],
      [Mode.Greater, ["2"], new ScRefCellValue(1), false],
      [Mode.Between, ["20", "10"], new ScRefCellValue(10), true],
      [Mode.NotBetween, ["20", "10"], new ScRefCellValue(25), true],
      [Mode.Between, ["10", '"text"'], new ScRefCellValue(12), false],
      [Mode.Direct, ["0"], new ScRefCellValue(), false],
      [Mode.Direct, ['"text"'], new ScRefCellValue(100), false],
      [Mode.Equal, ["0"], new ScRefCellValue(), true],
      [Mode.Equal, ['""'], new ScRefCellValue(), true],
      [Mode.Equal, ['"ALPHA"'], cell, true],
      [Mode.Equal, ['"AL"&"PHA"'], cell, true],
      [Mode.Between, ['"z"', '"a"'], cell, true],
      [Mode.NotEqual, ["1"], cell, true],
      [Mode.Equal, ["1"], cell, false],
      [Mode.Equal, ["#REF!"], cell, false],
      [Mode.Equal, ["#REF!"], new ScRefCellValue(0), true],
      [Mode.Equal, ["0"], formula, true],
      [Mode.Equal, [], cell, false],
    ];
    for (const [mode, operands, value, expected] of cases) {
      const rule = new ScCondFormatEntry(mode, operands, document, position, grammar, "Standard");
      try {
        expect(rule.IsCellValid(value, position), JSON.stringify([mode, operands])).toBe(expected);
      } finally {
        rule.Dispose();
      }
    }
  } finally {
    name.dispose();
    string.dispose();
    error.dispose();
    document.Dispose();
  }
});

it("clones condition tokens and moves their reference origins with the native format", /** Verifies ownership and coordinates through sheet and copy contexts. @returns Nothing. */ () => {
  const document = new ScDocument();
  const position = new ScAddress(1, 1, 0);
  const a = unicode("First"),
    b = unicode("Second"),
    c = unicode("Third");
  const format = new ScConditionalFormat(1, document);
  try {
    for (const [tab, name] of [a, b, c].entries()) expect(document.InsertTab(tab, name)).toBe(true);
    const ranges = new ScRangeList();
    ranges.push_back(new ScRange(1, 1, 0, 1, 10, 0));
    format.SetRange(ranges);
    const condition = new ScCondFormatEntry(
      Mode.Direct,
      ["SUM(Second!A1:A2)>0"],
      document,
      position,
      grammar,
      "Standard",
    );
    format.AddEntry(condition);

    const copy = format.Clone(document);
    try {
      const cloned = copy.GetEntry(0);
      assert(cloned instanceof ScCondFormatEntry);
      expect(condition.IsEqual(cloned, false)).toBe(true);
      cloned.UpdateInsertTab(new RefUpdateInsertTabContext(document, 1, 1));
      expect(cloned.GetExpression(cloned.GetSrcPos(), 0, grammar)).toBe("SUM(Third!A1:A2)>0");
      expect(condition.IsEqual(cloned, true)).toBe(false);
      cloned.UpdateDeleteTab(new RefUpdateDeleteTabContext(document, 1, 1));
      expect(condition.IsEqual(cloned, false)).toBe(true);
      cloned.UpdateMoveTab(new RefUpdateMoveTabContext(document, 1, 2));
      expect(cloned.GetExpression(cloned.GetSrcPos(), 0, grammar)).toBe("SUM(Third!A1:A2)>0");

      const context = new RefUpdateContext(document);
      context.meMode = UpdateRefMode.URM_COPY;
      context.maRange.aStart.Set(1, 1, 0);
      context.maRange.aEnd.Set(1, 10, 0);
      cloned.UpdateReference(context);
      expect(cloned.GetSrcPos().equals(position)).toBe(true);
      expect(cloned.GetValidSrcPos().equals(position)).toBe(true);
    } finally {
      copy.Dispose();
    }
  } finally {
    a.dispose();
    b.dispose();
    c.dispose();
    format.Dispose();
    document.Dispose();
  }
});

it("assigns a new format key from the current owned maximum", /** Exercises original key allocation and reuse after deletion. @returns Nothing. */ () => {
  const document = new ScDocument();
  const name = unicode("Formats");
  const missing = new ScConditionalFormat(0, document);
  try {
    expect(document.AddCondFormat(missing, 0)).toBe(0);
    expect(document.InsertTab(0, name)).toBe(true);
    const table = document.FetchTable(0);
    assert(table);
    const list = table.GetCondFormList();
    list.InsertNew(new ScConditionalFormat(30, document));
    list.InsertNew(new ScConditionalFormat(20, document));
    expect(document.AddCondFormat(new ScConditionalFormat(0, document), 0)).toBe(31);
    table.DeleteConditionalFormat(30);
    table.DeleteConditionalFormat(31);
    expect(document.AddCondFormat(new ScConditionalFormat(0, document), 0)).toBe(21);
    list.Dispose();
    expect(document.AddCondFormat(new ScConditionalFormat(0, document), 0)).toBe(1);
    expect(document.GetCondResult(new ScAddress(0, 0, -1))).toBeUndefined();
  } finally {
    missing.Dispose();
    name.dispose();
    document.Dispose();
  }
});

it("matches rich text and textual formula results using the original cell views", /** Exercises actual edit-engine and formula cells through the same rule. @returns Nothing. */ () => {
  const document = new ScDocument();
  const name = unicode("Rules");
  const formatted = unicode("Alpha\nBeta");
  const formula = unicode('="Alpha"&" Beta"');
  const origin = new ScAddress();
  const formulaCell = new ScAddress(1, 0);
  try {
    assert(document.InsertTab(0, name));
    const engine = document.GetEditEngine();
    engine.SetText(formatted);
    assert(document.SetEditText(origin, engine.CreateTextObject()));
    document.SetString(formulaCell, formula);
    const entry = new ScCondFormatEntry(
      Mode.ContainsText,
      ['"beta"'],
      document,
      origin,
      grammar,
      "Standard",
    );
    try {
      expect(entry.IsCellValid(document.GetRefCellValue(origin), origin)).toBe(true);
      expect(entry.IsCellValid(document.GetRefCellValue(formulaCell), formulaCell)).toBe(true);
      expect(entry.GetExpression(formulaCell, 1, grammar)).toBe("");
    } finally {
      entry.Dispose();
    }
  } finally {
    formula.dispose();
    formatted.dispose();
    name.dispose();
    document.Dispose();
  }
});

it("retains absolute and local references when dependent sheets and the original range move", /** Exercises detached and owned source positions with native update contexts. @returns Nothing. */ () => {
  const document = new ScDocument();
  const names = ["First", "Second", "Third"].map(unicode);
  const base = new ScAddress(2, 4, 1);
  try {
    for (const [index, name] of names.entries()) assert(document.InsertTab(index, name));
    const entry = new ScCondFormatEntry(
      Mode.Direct,
      ["A1+Third!$A$1"],
      document,
      base,
      grammar,
      "Standard",
    );
    try {
      const shift = new RefUpdateContext(document);
      shift.meMode = UpdateRefMode.URM_INSDEL;
      shift.mnRowDelta = 1;
      shift.maRange.aStart.Set(2, 4, 1);
      shift.maRange.aEnd.Set(2, 7, 1);
      entry.UpdateReference(shift);
      expect(entry.GetSrcPos().equals(new ScAddress(2, 5, 1))).toBe(true);
      entry.UpdateDeleteTab(new RefUpdateDeleteTabContext(document, 2, 1));
      expect(
        entry.GetExpression(entry.GetValidSrcPos(), 0, FormulaGrammar.Grammar.GRAM_ODFF),
      ).toContain("#REF!");
      entry.UpdateInsertTab(new RefUpdateInsertTabContext(document, 1, 1));
      expect(entry.GetSrcPos().Tab()).toBe(2);
      expect(
        entry.GetExpression(entry.GetValidSrcPos(), 0, FormulaGrammar.Grammar.GRAM_ODFF),
      ).toContain("#REF!");
      expect(entry.GetExpression(entry.GetValidSrcPos(), 0, grammar)).toContain("A2");
    } finally {
      entry.Dispose();
    }
    const detached = new ScCondFormatEntry(
      Mode.Direct,
      ["1"],
      document,
      new ScAddress(0, 0, 4),
      grammar,
      "",
    );
    try {
      expect(detached.GetValidSrcPos().Tab()).toBe(0);
    } finally {
      detached.Dispose();
    }
  } finally {
    for (const name of names) name.dispose();
    document.Dispose();
  }
});
