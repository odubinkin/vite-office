/** @fileoverview Native formula tree traversal and workbook-wide calculation. */
import { ProcessFormula } from "../../../inc/mtvcellfunc";
import type { ScDocument } from "./document";
import { HardRecalcState } from "./document.modes";
import type { ScFormulaCell } from "../../../inc/formulacell";

/** Recalculates the actual dirty and volatile formula tree, preserving the user's automatic calculation mode. @param this - Workbook. @param onlyForced - Selects only forced formulas. @returns Nothing. */
export function CalcFormulaTree(this: ScDocument, onlyForced: boolean): void {
  if (this["bCalculatingFormulaTree"]) return;
  const oldAutoCalc = this["bAutoCalc"];
  this["bAutoCalc"] = true;
  this["bCalculatingFormulaTree"] = true;
  try {
    if (this.GetHardRecalcState() === HardRecalcState.ETERNAL) {
      this.CalcAll();
      return;
    }
    const volatile: ScFormulaCell[] = [];
    for (let cell = this["pFormulaTree"]; cell; cell = cell.GetNext())
      if (!cell.GetDirty() && cell.GetCode().IsRecalcModeAlways()) volatile.push(cell);
    for (const cell of volatile) if (!cell.GetDirty()) cell.SetDirty();

    // Interpreting references can remove other cells from the tree.
    for (;;) {
      let cell = this["pFormulaTree"];
      while (cell && (!cell.GetDirty() || (onlyForced && !cell.GetCode().IsRecalcModeForced())))
        cell = cell.GetNext();
      if (!cell) return;
      cell.Interpret();
    }
  } finally {
    this["bAutoCalc"] = oldAutoCalc;
    this["bCalculatingFormulaTree"] = false;
  }
}

/** Marks all allocated formulas before interpreting them in sheet/column/row order. @param this - Workbook. @returns Nothing. */
export function CalcAll(this: ScDocument): void {
  const previous = this["bAutoCalc"];
  const inTree = this["bCalculatingFormulaTree"];
  this["bAutoCalc"] = true;
  this["bCalculatingFormulaTree"] = true;
  try {
    ForEachFormula(
      this,
      /** Marks visited formulas dirty before dependency recalculation. @param cell - Visited formula cell. @returns Nothing. */ (
        cell,
      ) => cell.SetDirtyVar(),
    );
    ForEachFormula(
      this,
      /** Interprets only the formulas that remain marked dirty. @param cell - Visited formula cell. @returns Nothing. */ (
        cell,
      ) => {
        if (cell.GetDirty()) cell.Interpret();
      },
    );
    for (let cell = this["pFormulaTree"]; cell;) {
      const next = cell.GetNext();
      if (!cell.GetCode().IsRecalcModeAlways()) this.RemoveFromFormulaTree(cell);
      cell = next;
    }
  } finally {
    this["bAutoCalc"] = previous;
    this["bCalculatingFormulaTree"] = inTree;
  }
}

/** Traverses original formula blocks without allocating unused columns. @param doc - Workbook. @param visit - Source formula operation. @returns Nothing. */
function ForEachFormula(doc: ScDocument, visit: (cell: ScFormulaCell) => void): void {
  for (let tab = 0; tab < doc.GetTableCount(); ++tab) {
    const table = doc.FetchTable(tab);
    if (!table) continue;
    for (let col = 0; col < table.GetAllocatedColumnsCount(); ++col)
      ProcessFormula(
        table.CreateColumnIfNotExists(col).GetCellStore(),
        /** Dispatches the shared visitor for each formula in a sparse column span. @param _row - Unused source row. @param cell - Visited formula cell. @returns Visitor result. */ (
          _row,
          cell,
        ) => visit(cell),
      );
  }
}
