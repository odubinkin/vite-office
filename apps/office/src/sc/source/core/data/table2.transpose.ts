/** @fileoverview Original Calc clipboard cell and attribute transposition in table2.cxx. */
import { SvxBoxItem, SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { SfxItemState } from "../../../../svl/inc/itemset";
import { ScAddress, type ScRange } from "../../../inc/address";
import { CellType, InsertDeleteFlags } from "../../../inc/global";
import { ATTR_BORDER, ATTR_MERGE, ATTR_MERGE_FLAG } from "../../../inc/scitems";
import { ScMergeFlagAttr, ScMF } from "../../../inc/attrib";
import type { ScColumn } from "../../../inc/column";
import { ScFormulaCell, ScMatrixMode } from "../../../inc/formulacell";
import { ScHorizontalCellIterator } from "../../../inc/dociter";
import { CellAttributeHolder, ScPatternAttr } from "../../../inc/patattr";
import type { ScTable } from "../../../inc/table";

const rotatedEdges = [
  [SvxBoxItemLine.TOP, SvxBoxItemLine.LEFT],
  [SvxBoxItemLine.LEFT, SvxBoxItemLine.TOP],
  [SvxBoxItemLine.BOTTOM, SvxBoxItemLine.RIGHT],
  [SvxBoxItemLine.RIGHT, SvxBoxItemLine.BOTTOM],
] as const;

/** Rotates hard borders and clears the original overlap flags. @param pattern - Source cell pattern. @returns Owned replacement when a change is needed. */
function TransposePattern(pattern: ScPatternAttr): ScPatternAttr | undefined {
  const set = pattern.GetItemSet();
  if (
    [ATTR_BORDER, ATTR_MERGE, ATTR_MERGE_FLAG].every(
      (which) => set.GetItemState(which, false) === SfxItemState.DEFAULT,
    )
  )
    return undefined;
  const border = pattern.GetItem(ATTR_BORDER) as SvxBoxItem;
  const flags = pattern.GetItem(ATTR_MERGE_FLAG) as ScMergeFlagAttr;
  const hasBorder = border.GetTop() || border.GetBottom() || border.GetLeft() || border.GetRight();
  if (!hasBorder && !flags.IsOverlapped()) return undefined;
  const rotated = new ScPatternAttr(pattern);
  if (hasBorder) {
    const box = new SvxBoxItem(ATTR_BORDER);
    for (const [from, to] of rotatedEdges) {
      box.SetLine(border.GetLine(from), to);
      box.SetDistance(border.GetDistance(from), to);
    }
    rotated.ItemSetPut(box);
  }
  if (flags.IsOverlapped()) {
    const other = flags.GetValue() & ~(ScMF.Hor | ScMF.Ver);
    if (other) rotated.ItemSetPut(new ScMergeFlagAttr(other));
    else rotated.ItemSetClearItem(ATTR_MERGE_FLAG);
  }
  return rotated;
}

/** Transposes nondefault attribute runs, applying the source border permutation. @param column - Source column. @param target - Target clipboard sheet. @param range - Original rectangle. @returns Nothing. */
function TransposeColPatterns(column: ScColumn, target: ScTable, range: ScRange): void {
  const first = range.aStart;
  const end = range.aEnd.Row();
  const row = first.Row() + column.GetCol() - first.Col();
  const defaultPattern = column.GetDoc().getCellAttributeHelper().getDefaultCellAttribute();
  const runStart: [number] = [0];
  const runEnd: [number] = [0];
  for (let start = first.Row(); start <= end; start = runEnd[0] + 1) {
    const pattern = column.GetPatternRange(runStart, runEnd, start);
    if (!pattern) return;
    if (pattern === defaultPattern) continue;
    const rotated = TransposePattern(pattern);
    const holder = new CellAttributeHolder(rotated ?? pattern, rotated !== undefined);
    try {
      for (let from = start; from <= Math.min(end, runEnd[0]); ++from)
        target.SetPattern(first.Col() + from - first.Row(), row, holder);
    } finally {
      holder.Dispose();
    }
  }
}

/** Transposes the source sheet's stored cells and patterns at the original clip origin. @param source - Source clipboard table. @param target - Temporary clipboard table. @param range - Original rectangle. @param flags - Native insertion mask. @returns Nothing. */
export function TransposeTableClip(
  source: ScTable,
  target: ScTable,
  range: ScRange,
  flags: InsertDeleteFlags,
): void {
  const doc = target.GetDoc();
  const { aStart, aEnd } = range;
  const tab = target["nTab"];
  const cells = new ScHorizontalCellIterator(
    source.GetDoc(),
    tab,
    aStart.Col(),
    aStart.Row(),
    aEnd.Col(),
    aEnd.Row(),
  );
  const col: [number] = [0];
  const row: [number] = [0];
  for (let cell = cells.GetNext(col, row); cell; cell = cells.GetNext(col, row)) {
    const x = aStart.Col() + row[0] - aStart.Row();
    const y = aStart.Row() + col[0] - aStart.Col();
    switch (cell.getType()) {
      case CellType.CELLTYPE_VALUE:
        target.SetValue(x, y, cell.getDouble());
        break;
      case CellType.CELLTYPE_STRING: {
        const string = cell.getSharedString();
        if (string) target.SetRawString(x, y, string);
        break;
      }
      case CellType.CELLTYPE_EDIT:
        target.SetEditText(x, y, cell.getEditText()?.Clone() ?? null);
        break;
      case CellType.CELLTYPE_FORMULA: {
        const formula = cell.getFormula();
        if (!formula) break;
        if (formula.GetMatrixFlag() !== ScMatrixMode.NONE)
          throw Error("Transposition of matrix clipboard cells is not implemented");
        const rotated = new ScFormulaCell(formula, doc, new ScAddress(x, y, tab));
        rotated.TransposeReference();
        target.SetFormulaCell(x, y, rotated);
        break;
      }
    }
  }
  if (flags & InsertDeleteFlags.ATTRIB) {
    const end = source.ClampToAllocatedColumns(aEnd.Col());
    for (let col = aStart.Col(); col <= end; ++col) {
      const column = source.FetchColumn(col);
      if (column) TransposeColPatterns(column, target, range);
    }
  }
}
