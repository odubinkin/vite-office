/** @fileoverview Consumed original ParseBlock template over real Calc multi_type_vector const cursors. */
import type {
  multi_type_vector,
  ContainerEvent,
} from "../../external/mdds/include/mdds/multi_type_vector/soa/main";
import type { CellStoreType } from "./mtvelements";
/** Native callback argument is an actual borrowed store node,not a copied cell list. */
export type CellStoreNode = Pick<
  ReturnType<ReturnType<CellStoreType["cbegin"]>["get"]>,
  "type" | "position" | "size" | "data"
>;
/** Original block callback signature. */
export interface BlockFunction {
  /** Consumes original node and native partial-block bounds. @param node - Borrowed node. @param offset - Native offset. @param size - Native count. @returns Nothing. */
  call(node: CellStoreNode, offset: number, size: number): void;
}
/** Native ParseBlock specialization,retaining the final block cursor and exact truncation behavior. @param position - Const position hint. @param store - Actual cell store. @param action - Native block functor. @param start - First row. @param end - Last row. @returns Final const cursor. */
export function ParseBlock<E extends ContainerEvent>(
  position: ReturnType<multi_type_vector<E>["cbegin"]>,
  store: multi_type_vector<E>,
  action: BlockFunction,
  start: number,
  end: number,
): ReturnType<multi_type_vector<E>["cbegin"]> {
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
/** Original mutable ProcessBlock specialization with actual mutable store cursors. @param position - Mutable hint. @param store - Actual store. @param action - Block functor. @param start - First row. @param end - Last row. @returns Final mutable cursor. */
export function ProcessBlock(
  position: ReturnType<CellStoreType["begin"]>,
  store: CellStoreType,
  action: BlockFunction,
  start: number,
  end: number,
): ReturnType<CellStoreType["begin"]> {
  const found = store.position(position, start),
    iterator = found.first;
  let offset = found.second,
    current = start;
  for (; !iterator.equals(store.end()) && current <= end; iterator.increment(), offset = 0) {
    let size = iterator.get().size - offset;
    const last = current + size - 1 > end;
    if (last) size = end - current + 1;
    action.call(iterator.get(), offset, size);
    if (last) break;
    current += size;
  }
  return iterator;
}
