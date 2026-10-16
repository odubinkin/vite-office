/** @fileoverview Whole-store ProcessFormula specialization of native mtvcellfunc.hxx/ProcessElements1. */
import { type CellStoreType, formula_block, element_type_formula } from "./mtvelements";
import type { ScFormulaCell } from "./formulacell";
import type { base_element_block } from "../../external/mdds/include/mdds/multi_type_vector/types.ts";
/** Visits actual nonnull formula pointers in row order, skipping other block types. @param store - Cell store. @param func - Native row/cell functor. @returns Nothing. */
export function ProcessFormula(
  store: CellStoreType,
  func: (row: number, cell: ScFormulaCell) => void,
): void {
  for (const it = store.begin(), end = store.end(); !it.equals(end); it.increment()) {
    const block = it.get();
    if (block.type !== element_type_formula) continue;
    let row = block.position;
    for (
      const cell = formula_block.begin(block.data as base_element_block),
        stop = formula_block.end(block.data as base_element_block);
      !cell.equals(stop);
      cell.advance(1)
    )
      func(row++, cell.get() as ScFormulaCell);
  }
}
