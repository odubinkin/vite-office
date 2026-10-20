/** @fileoverview Native typed cell action and value-transfer ownership over actual document/history. */
import type { SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import { expect, it } from "vitest";
import { ScUndoSetCell } from "../inc/undocell";
import { ScDocShell } from "../docshell/docsh";
import { ScCellValue } from "../../../inc/cellvalue";
import { ScAddress } from "../../../inc/address";
import { CellType } from "../../../inc/global";
import { ScFormulaCell } from "../../../inc/formulacell";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
it("moves native prior/new values and restores all represented content alternatives", /** Native value owners survive repeated action dispatch and release with history. @returns Nothing. */ () => {
  const shell = new ScDocShell(),
    doc = shell.GetDocument(),
    pos = new ScAddress(1, 2, 0);
  for (const type of [
    CellType.CELLTYPE_NONE,
    CellType.CELLTYPE_VALUE,
    CellType.CELLTYPE_STRING,
    CellType.CELLTYPE_FORMULA,
  ]) {
    const before = new ScCellValue(),
      after = new ScCellValue(99);
    if (type === CellType.CELLTYPE_VALUE) before.set(7);
    if (type === CellType.CELLTYPE_STRING) {
      const string = doc.GetSharedStringPool().intern(unicode("007"));
      before.set(string);
      string.dispose();
    }
    if (type === CellType.CELLTYPE_FORMULA)
      before.set(new ScFormulaCell(doc, pos, unicode("=4+3"), FormulaGrammar.Grammar.GRAM_NATIVE));
    const action = new ScUndoSetCell(shell, pos, before, after);
    expect(before.isEmpty()).toBe(true);
    expect(after.isEmpty()).toBe(true);
    expect(action.GetComment()).toBe("Input");
    action.Undo();
    expect(doc.GetCellType(pos)).toBe(type);
    if (type === CellType.CELLTYPE_STRING)
      expect(
        text(
          (doc.GetRefCellValue(pos).getSharedString() as SharedStringConstReference).getString(),
        ),
      ).toBe("007");
    if (type === CellType.CELLTYPE_VALUE || type === CellType.CELLTYPE_FORMULA)
      expect(doc.GetValue(pos)).toBe(7);
    shell.GetUndoManager().AddUndoAction(action);
    action.Redo();
    expect(doc.GetValue(pos)).toBe(99);
    shell.Undo();
    expect(doc.GetCellType(pos)).toBe(type);
    shell.Redo();
    expect(doc.GetValue(pos)).toBe(99);
    const range = action.getAffectedRange();
    range.aStart.SetCol(3);
    expect(action.getAffectedRange().aStart.equals(pos)).toBe(true);
  }
  shell.Close();
});
it("transfers prepared formulas into the document without cloning or disposing the adopted cell", /** Native release empties its owner while actual dependency listeners stay live. @returns Nothing. */ () => {
  const shell = new ScDocShell(),
    doc = shell.GetDocument(),
    a = new ScAddress(),
    b = new ScAddress(1, 0, 0);
  doc.SetValue(a, 2);
  const formula = new ScFormulaCell(doc, b, unicode("=A1*3"), FormulaGrammar.Grammar.GRAM_NATIVE),
    value = new ScCellValue();
  value.set(formula);
  value.release(doc, b);
  expect(value.isEmpty()).toBe(true);
  value.clear();
  expect(doc.GetFormulaCell(b)).toBe(formula);
  doc.SetValue(a, 4);
  expect(doc.GetValue(b)).toBe(12);
  shell.Close();
});
