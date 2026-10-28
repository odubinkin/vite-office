/** @fileoverview Existing original neighboring formula joins split intact from the column facade. */
import type { ScColumn } from "../../../inc/column";
import type { ScFormulaCell } from "../../../inc/formulacell";
import { SharedFormulaUtil } from "../../../inc/sharedformula";
import { formula_block, element_type_formula, type CellStoreType } from "../../../inc/mtvelements";
import type { base_element_block } from "../../../../external/mdds/include/mdds/multi_type_vector/types";
/** Original neighboring formula-cell join body. @param this - Actual column. @param position - Store position. @param cell - New formula. @returns Nothing. */
export function JoinNewFormulaCell(
  this: ScColumn,
  position: ReturnType<CellStoreType["position"]>,
  cell: ScFormulaCell,
): void {
  const node = position.first.get(),
    data = node.data as base_element_block;
  if (node.type === element_type_formula && position.second > 0) {
    const previous = formula_block.at(data, position.second - 1) as ScFormulaCell;
    SharedFormulaUtil.joinFormulaCells(
      { first: position.first, second: position.second - 1 },
      previous,
      cell,
    );
  }
  if (node.type === element_type_formula && position.second + 1 < node.size)
    SharedFormulaUtil.joinFormulaCells(
      position,
      cell,
      formula_block.at(data, position.second + 1) as ScFormulaCell,
    );
}
