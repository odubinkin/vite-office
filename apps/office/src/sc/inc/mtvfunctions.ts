/** @fileoverview Consumed original ParseBlock template over real Calc multi_type_vector const cursors. */
import type { CellStoreType } from "./mtvelements";
/** Native callback argument is an actual borrowed store node,not a copied cell list. */
export type CellStoreNode = ReturnType<ReturnType<CellStoreType["cbegin"]>["get"]>;
/** Original block callback signature. */
export interface BlockFunction {
  /** Consumes original node and native partial-block bounds. @param node - Borrowed node. @param offset - Native offset. @param size - Native count. @returns Nothing. */
  call(node: CellStoreNode, offset: number, size: number): void;
}
/** Native ParseBlock specialization,retaining the final block cursor and exact truncation behavior. @param position - Const position hint. @param store - Actual cell store. @param action - Native block functor. @param start - First row. @param end - Last row. @returns Final const cursor. */
export function ParseBlock(
  position: ReturnType<CellStoreType["cbegin"]>,
  store: CellStoreType,
  action: BlockFunction,
  start: number,
  end: number,
): ReturnType<CellStoreType["cbegin"]> {
  const found = store.cposition(position, start),
    iterator = found.first;
  let offset = found.second,
    top = start;
  for (; !iterator.equals(store.cend()) && top <= end; iterator.increment(), offset = 0) {
    let size = iterator.get().size - offset;
    const last = top + size - 1 > end;
    if (last) size = end - top + 1;
    action.call(iterator.get(), offset, size);
    if (last) break;
    top += size;
  }
  return iterator;
}
