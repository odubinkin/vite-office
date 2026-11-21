/** @fileoverview Native conditional style lookup through the cell's ordered conditional format indices. */
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SfxStyleFamily } from "../../../../svl/inc/style-values";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { Color } from "../../../../tools/inc/color";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { OpCode } from "../../../../formula/inc/opcode";
import { ScHorizontalCellIterator } from "../../../inc/dociter";
import type { ScFormulaCell } from "../../../inc/formulacell";
import type { ScAddress, ScRange } from "../../../inc/address";
import { UpdateRefMode } from "../../../inc/global";
import type { ScCondFormatItem } from "../../../inc/attrib";
import type { ScConditionalFormat } from "../../../inc/conditio";
import type { ScDocument } from "../../../inc/document";
import { ATTR_CONDITIONAL } from "../../../inc/scitems";

/** Hands an owned conditional format to its sheet. @param this - Native document. @param format - New format. @param tab - Destination sheet. @returns Assigned index or zero. */
export function AddCondFormat(this: ScDocument, format: ScConditionalFormat, tab: number): number {
  return this.FetchTable(tab)?.AddCondFormat(format) ?? 0;
}

/** Returns the first matching style in the cell's conditional format index order. @param this - Native document. @param position - Target cell. @returns Native style items or absence. */
export function GetCondResult(this: ScDocument, position: ScAddress): SfxItemSet | undefined {
  const pool = this.GetStyleSheetPool();
  if (!pool) return undefined;
  for (const format of GetConditionalFormats(this, position)) {
    const name = format.GetCellStyle(this.GetRefCellValue(position), position);
    if (!name) continue;
    const value = unicode(name);
    try {
      const style = pool.Find(value, SfxStyleFamily.Para);
      if (style) return style.GetItemSet();
    } finally {
      value.dispose();
    }
  }
  return undefined;
}

/** Traverses native conditional format indices in cell order. @param document - Workbook. @param position - Target cell. @returns Matched owners. */
function* GetConditionalFormats(
  document: ScDocument,
  position: ScAddress,
): IterableIterator<ScConditionalFormat> {
  const indices = document.GetPattern(position)?.GetItem(ATTR_CONDITIONAL) as
    ScCondFormatItem | undefined;
  const keys = indices?.GetCondFormatData();
  if (!keys || keys.empty()) return;
  const list = document.FetchTable(position.Tab())?.GetCondFormList();
  for (const key of keys) {
    const format = list?.GetFormat(key);
    if (format) yield format;
  }
}

/** Resolves the first available conditional background scale for native painting. @param this - Workbook. @param position - Target cell. @returns Scale color or absence. */
export function GetCondColor(this: ScDocument, position: ScAddress): Color | undefined {
  for (const format of GetConditionalFormats(this, position)) {
    const color = format.GetColor(position);
    if (color) return color;
  }
  return undefined;
}

/** Rebuilds RPN and subscriptions for cells whose lexical code owns label references. @param document - Workbook. @returns Nothing. */
export function CompileColRowNameFormula(document: ScDocument): void {
  const formulas: ScFormulaCell[] = [];
  for (let tab = 0; tab < document.GetTableCount(); tab++) {
    const cells = new ScHorizontalCellIterator(
      document,
      tab,
      0,
      0,
      document.MaxCol(),
      document.MaxRow(),
    );
    const col: [number] = [0],
      row: [number] = [0];
    for (let entry = cells.GetNext(col, row); entry; entry = cells.GetNext(col, row)) {
      const formula = entry.getFormula();
      if (formula?.GetCode().HasOpCode(OpCode.ocColRowName)) formulas.push(formula);
    }
  }
  for (const cell of formulas) cell.EndListeningTo(document);
  for (const cell of formulas) {
    cell.GetCode().SetCodeError(FormulaError.NONE);
    cell.SetCompile(true);
    cell.CompileTokenArray(true);
    if (cell.GetCode().GetCodeError() === FormulaError.NONE) cell.StartListeningTo(document);
    cell.SetDirty();
  }
}

/** Shifts native label pair references when the sheet set changes. @param document - Workbook. @param affected - Shifted sheet range. @param delta - Insertion or deletion. @returns Nothing. */
export function UpdateLabelRangesOnTab(
  document: ScDocument,
  affected: ScRange,
  delta: 1 | -1,
): void {
  for (const list of [document.GetColNameRanges(), document.GetRowNameRanges()]) {
    if (delta < 0) list.DeleteOnTab(affected.aStart.Tab());
    list.UpdateReference(UpdateRefMode.URM_INSDEL, document, affected, 0, 0, delta);
  }
}
