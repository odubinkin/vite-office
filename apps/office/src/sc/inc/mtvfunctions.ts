/** @fileoverview Consumed original ParseBlock template over real Calc multi_type_vector const cursors. */
import type {
  multi_type_vector,
  ContainerEvent,
} from "../../external/mdds/include/mdds/multi_type_vector/soa/main";
import type { CellStoreType } from "./mtvelements";
import { const_iterator_base } from "../../external/mdds/include/mdds/multi_type_vector/soa/iterator";
import type {
  base_element_block,
  BlockConstructor,
  element_block,
} from "../../external/mdds/include/mdds/multi_type_vector/types";
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

/** Original typed CheckElem scans borrowed elements without copying the store. @param block - Actual block specialization. @param store - Actual owner. @param iterator - Borrowed const block. @param offset - First element. @param size - Count. @param predicate - Original row/value predicate. @returns Found const position or end. */
export function CheckElem<T, E extends ContainerEvent>(
  block: BlockConstructor<T> & Pick<typeof element_block, "at">,
  store: multi_type_vector<E>,
  iterator: ReturnType<multi_type_vector<E>["cbegin"]>,
  offset: number,
  size: number,
  predicate: (row: number, value: T) => boolean,
): [ReturnType<multi_type_vector<E>["cbegin"]>, number] {
  const node = iterator.get();
  for (let index = offset; index < offset + size; ++index)
    if (predicate(node.position + index, block.at<T>(node.data as base_element_block, index)))
      return [iterator, index];
  return [store.cend(), 0];
}

/** Original SetElementsToEmpty1 retains mutable cursor continuation after every matching run is removed. @param block - Actual typed specialization. @param store - Actual owner. @param predicate - Original row/value predicate. @returns Nothing. */
export function SetElementsToEmpty1<T, E extends ContainerEvent>(
  block: BlockConstructor<T> & Pick<typeof element_block, "at">,
  store: multi_type_vector<E>,
  predicate: (row: number, value: T) => boolean,
): void {
  let iterator = store.begin();
  for (; !iterator.equals(store.end()); iterator.increment()) {
    if (iterator.get().type !== block.block_type) continue;
    const position = const_iterator_base.from_mutable(iterator),
      first = CheckElem(block, store, position, 0, iterator.get().size, predicate);
    if (first[0].equals(store.cend())) continue;
    const remaining = iterator.get().size - first[1],
      last = CheckElem(
        block,
        store,
        position,
        first[1],
        remaining,
        /** Original FuncNotElem negates the same borrowed predicate. @param row - Native row. @param value - Borrowed element. @returns Inverse result. */ (
          row,
          value,
        ) => !predicate(row, value),
      ),
      lastOffset = last[0].equals(store.cend()) ? iterator.get().size - 1 : last[1] - 1;
    iterator = store.set_empty(
      iterator,
      iterator.get().position + first[1],
      iterator.get().position + lastOffset,
    );
  }
}
