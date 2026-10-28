/** @fileoverview Actual owning cell snapshots and native detached formula cloning. */
import { expect, it } from "vitest";
import type { SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScCellValue, ScRefCellValue } from "../../../inc/cellvalue";
import { ScFormulaCell } from "../../../inc/formulacell";
import { CellType } from "../../../inc/global";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Creates the real scalar document and sheet. @returns Document. */
function fixture() {
  const doc = new ScDocument();
  const name = unicode("Data");
  doc.InsertTab(0, name);
  name.dispose();
  return doc;
}
it("copies native empty,numeric,string and formula alternatives and commits real content", /** Only owned native cell values carry persisted Undo content. @returns Nothing. */ () => {
  const doc = fixture(),
    pos = new ScAddress(),
    snapshot = new ScCellValue();
  for (const value of [new ScCellValue(), new ScCellValue(7)]) {
    const copy = new ScCellValue(value);
    copy.commit(doc, pos);
    snapshot.assign(doc, pos);
    expect(snapshot.getType()).toBe(value.getType());
    copy.clear();
    value.clear();
  }
  const string = doc.GetSharedStringPool().intern(unicode("123")),
    own = new ScCellValue(string);
  string.dispose();
  const copied = new ScCellValue(own);
  own.clear();
  copied.commit(doc, pos);
  expect(doc.GetCellType(pos)).toBe(CellType.CELLTYPE_STRING);
  expect(
    text((doc.GetRefCellValue(pos).getSharedString() as SharedStringConstReference).getString()),
  ).toBe("123");
  copied.clear();
  snapshot.assign(doc, pos);
  doc.SetEmptyCell(pos);
  snapshot.commit(doc, pos);
  expect(doc.GetCellType(pos)).toBe(CellType.CELLTYPE_STRING);
  doc.SetFormula(pos, unicode("=2+3"), FormulaGrammar.Grammar.GRAM_NATIVE);
  const formula = doc.GetFormulaCell(pos) as ScFormulaCell;
  snapshot.assign(doc, pos);
  expect(snapshot.getFormula()).not.toBe(formula);
  expect((snapshot.getFormula() as ScFormulaCell).GetCode().GetArray()?.[0]).not.toBe(
    formula.GetCode().GetArray()?.[0],
  );
  const copy = new ScCellValue(snapshot);
  doc.SetValue(pos, 0);
  copy.commit(doc, pos);
  expect(doc.GetValue(pos)).toBe(5);
  expect(doc.GetFormulaCell(pos)).not.toBe(copy.getFormula());
  const moved = ScCellValue.move(copy);
  expect(copy.isEmpty()).toBe(true);
  const assigned = new ScCellValue();
  assigned.move_assign(moved);
  expect(moved.isEmpty()).toBe(true);
  assigned.swap(snapshot);
  assigned.clear();
  snapshot.clear();
  const adopted = new ScCellValue();
  adopted.set(new ScFormulaCell(doc, pos, unicode("=8"), FormulaGrammar.Grammar.GRAM_NATIVE));
  expect((adopted.getFormula() as ScFormulaCell).GetValue()).toBe(8);
  adopted.clear();
  expect(/** Wrong native variant. @returns Nothing. */ () => adopted.getFormula()).toThrow(
    "bad_variant_access",
  );
  const borrowed = new ScCellValue(new ScRefCellValue(doc, pos));
  borrowed.clear();
});
it("clones cached results and dirty state without listeners and preserves the native error-recompile rule", /** Actual dependency writes distinguish detached snapshots from adopted formula cells. @returns Nothing. */ () => {
  const doc = fixture(),
    a = new ScAddress(),
    b = new ScAddress(1, 0, 0);
  doc.SetValue(a, 3);
  doc.SetFormula(b, unicode("=A1*2"), FormulaGrammar.Grammar.GRAM_NATIVE);
  const live = doc.GetFormulaCell(b) as ScFormulaCell;
  expect(live.GetValue()).toBe(6);
  expect(live.GetDirty()).toBe(false);
  const snapshot = live.Clone();
  expect(snapshot.GetValue()).toBe(6);
  expect(snapshot.GetDirty()).toBe(false);
  doc.SetValue(a, 4);
  expect(snapshot.GetDirty()).toBe(false);
  expect(live.GetValue()).toBe(8);
  doc.SetFormulaCell(b, snapshot.Clone());
  expect(doc.GetValue(b)).toBe(8);
  doc.SetValue(a, 5);
  expect(doc.GetValue(b)).toBe(10);
  const dirty = doc.GetFormulaCell(b) as ScFormulaCell;
  dirty.SetDirtyVar();
  expect(dirty.Clone().GetDirty()).toBe(true);
  dirty.GetCode().SetCodeError(FormulaError.NoName);
  const healed = dirty.Clone();
  expect(healed.GetCode().GetCodeError()).toBe(FormulaError.NONE);
  expect(dirty.GetCode().GetCodeError()).toBe(FormulaError.NoName);
  const empty = new ScFormulaCell(doc, b, unicode("= "), FormulaGrammar.Grammar.GRAM_NATIVE);
  expect(empty.GetCode().GetLen()).toBe(0);
  expect(empty.Clone().GetCode().GetCodeError()).toBe(empty.GetCode().GetCodeError());
  const relocated = new ScFormulaCell(snapshot, doc, a);
  expect(relocated.aPos).toEqual(a);
  expect(relocated.GetCode()).not.toBe(snapshot.GetCode());
  expect(relocated.GetValue()).toBe(6);
  expect(relocated.GetDirty()).toBe(false);
  relocated.Dispose();
  expect(
    /** Unsupported foreign document copy is explicit. @returns Cell. */ () =>
      new ScFormulaCell(snapshot, fixture(), b),
  ).toThrow(/foreign-document/);
  snapshot.Dispose();
  healed.Dispose();
  empty.Dispose();
  const adopted = doc.GetFormulaCell(b) as ScFormulaCell;
  adopted.Dispose();
  expect(doc.IsInFormulaTree(adopted)).toBe(false);
  expect(doc.IsInFormulaTrack(adopted)).toBe(false);
});
