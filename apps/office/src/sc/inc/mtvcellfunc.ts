/** @fileoverview Whole-store ProcessFormula specialization of native mtvcellfunc.hxx/ProcessElements1. */
import { type CellStoreType, formula_block, element_type_formula } from "./mtvelements";
import { ProcessBlock } from "./mtvfunctions";
import type { ScFormulaCell } from "./formulacell";
import type { base_element_block } from "../../external/mdds/include/mdds/multi_type_vector/types.ts";
/** Original row/formula functor template argument. */
type FormulaAction = (row: number, cell: ScFormulaCell) => void;
/** Original non-formula block functor template argument. */
type OtherAction = (type: number, first: number, length: number) => void;
/** Original mutable iterator specialization. */
type CellIterator = ReturnType<CellStoreType["begin"]>;
/** Visits actual nonnull formula pointers in row order,skipping other block types. @param store - Cell store. @param func - Native row/cell functor. @returns Nothing. */
export function ProcessFormula(store: CellStoreType, func: FormulaAction): void;
/** Original bounded formula-only/two-functor overloads retain the optional stateless FuncElseNoOp erasure and real non-formula span dispatch. @param position - Mutable cursor. @param store - Cell store. @param first - First row. @param last - Last row. @param func - Formula functor. @param other - Non-formula functor. @returns Last cursor. */
export function ProcessFormula(
  position: CellIterator,
  store: CellStoreType,
  first: number,
  last: number,
  func: FormulaAction,
  other?: OtherAction,
): CellIterator;
/** Binds original whole-store and bounded template overloads. @param args - Native specialization arguments. @returns Original result. */
export function ProcessFormula(
  ...args:
    | [CellStoreType, FormulaAction]
    | [CellIterator, CellStoreType, number, number, FormulaAction, (OtherAction | undefined)?]
): void | CellIterator {
  if (args.length !== 2) {
    const [position, store, first, last, func, other] = args;
    return ProcessBlock(
      position,
      store,
      {
        /** Original ProcessElements1 specialization consumes genuine block spans. @param node - Store node. @param offset - First element. @param length - Count. @returns Nothing. */
        call(node, offset, length) {
          const row = node.position + offset;
          if (node.type !== element_type_formula) {
            other?.(node.type, row, length); // Original absent functor is stateless FuncElseNoOp.
            return;
          }
          for (let index = 0; index < length; ++index)
            func(
              row + index,
              formula_block.at(node.data as base_element_block, offset + index) as ScFormulaCell,
            );
        },
      },
      first,
      last,
    );
  }
  const [store, func] = args;
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
