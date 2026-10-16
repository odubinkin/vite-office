/** @fileoverview Calc cell-store block event owner; counters describe logical blocks and do not manage object lifetime. */
import {
  get_block_type,
  type base_element_block,
} from "../../../../external/mdds/include/mdds/multi_type_vector/types.ts";
import type { EventValueOps } from "../../../../external/mdds/include/mdds/multi_type_vector/soa/main.ts";
import { element_type_formula, element_type_cellnote } from "../../../inc/mtvelements";
import type { ScColumn } from "../../../inc/column";
/** Native per-column block count events. */
export class CellStoreEvent {
  /** Binds an optional actual column owner. @param mpCol - Column. @returns Handler. */
  constructor(private mpCol: ScColumn | null = null) {}
  /** Counts a newly acquired formula/note block. @param block - Nonnull live block when attached. @returns Nothing. */
  element_block_acquired(block: base_element_block | null): void {
    if (!this.mpCol) return;
    const type = get_block_type(block as base_element_block);
    if (type === element_type_formula) this.mpCol.mnBlkCountFormula++;
    else if (type === element_type_cellnote) this.mpCol.mnBlkCountCellNotes++;
  }
  /** Counts a released formula/note block. @param block - Nonnull live block when attached. @returns Nothing. */
  element_block_released(block: base_element_block | null): void {
    if (!this.mpCol) return;
    const type = get_block_type(block as base_element_block);
    if (type === element_type_formula) this.mpCol.mnBlkCountFormula--;
    else if (type === element_type_cellnote) this.mpCol.mnBlkCountCellNotes--;
  }
  /** Stops callbacks without changing existing counters. @returns Nothing. */
  stop(): void {
    this.mpCol = null;
  }
  /** Exchanges the borrowed column bindings. @param other - Other handler. @returns Nothing. */
  swap(other: CellStoreEvent): void {
    const column = this.mpCol;
    this.mpCol = other.mpCol;
    other.mpCol = column;
  }
  /** Borrows the native attached column. @returns Column or null. */
  getColumn(): ScColumn | null {
    return this.mpCol;
  }
}
/** Erased native copy/move/swap field operations; a moved raw column pointer remains in the source. */
export const cell_store_event_value_ops: EventValueOps<CellStoreEvent> = {
  /** Copies the actual borrowed column. @param value - Handler. @returns Independent handler. */
  copy(value) {
    return new CellStoreEvent(value.getColumn());
  },
  /** Moves the actual raw pointer field by value. @param value - Handler. @returns Handler. */
  move(value) {
    return new CellStoreEvent(value.getColumn());
  },
  /** Exchanges the stable event fields. @param left - Left. @param right - Right. @returns Nothing. */
  swap(left, right) {
    left.swap(right);
  },
};
