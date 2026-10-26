/** @fileoverview Calc cell-store block event owner; counters describe logical blocks and do not manage object lifetime. */
import type { EventValueOps } from "../../../../external/mdds/include/mdds/multi_type_vector/soa/main.ts";
import {
  get_block_type,
  type base_element_block,
} from "../../../../external/mdds/include/mdds/multi_type_vector/types.ts";
import { ScRefCellValue } from "../../../inc/cellvalue";
import type { ScColumn } from "../../../inc/column";
import type { ScDocument } from "../../../inc/document";
import type { ScFormulaCell } from "../../../inc/formulacell";
import {
  ColumnBlockPosition,
  edittext_block,
  element_type_cellnote,
  element_type_edittext,
  element_type_formula,
  element_type_numeric,
  element_type_string,
  formula_block,
  numeric_block,
  string_block,
  type CellStoreType,
} from "../../../inc/mtvelements";
import type { ScTable } from "../../../inc/table";

/** Original one-sheet block-position cache used by ScDocumentImport. */
export class TableColumnBlockPositionSet {
  private readonly table: ScTable;
  private readonly columns = new Map<number, ColumnBlockPosition>();
  /** Resolves the native sheet once. @param document - Document. @param tab - Existing sheet.  @returns Constructed instance. */
  constructor(document: ScDocument, tab: number) {
    const table = document.FetchTable(tab);
    if (!table) throw new RangeError(`Passed table index ${tab} is invalid.`);
    this.table = table;
  }
  /** Source insertion precedes initialization, including a retained failed entry. @param col - Column. @returns Cached position or null on failed initialization. */
  getBlockPosition(col: number): ColumnBlockPosition | null {
    const existing = this.columns.get(col);
    if (existing) return existing;
    const position = new ColumnBlockPosition();
    this.columns.set(col, position);
    return this.table.InitColumnBlockPosition(position, col) ? position : null;
  }
  /** Invalidates all hints after external store changes. @returns Nothing. */
  invalidate(): void {
    this.columns.clear();
  }
}
/** Original per-document cached column cursor ownership;workers use independent instances rather than a physical mutex facade. */
export class ColumnBlockPositionSet {
  private readonly maTables = new Map<number, Map<number, ColumnBlockPosition>>();
  /** Borrows the actual document. @param mrDoc - Document. @returns Cache. */
  constructor(private readonly mrDoc: ScDocument) {}
  /** Original insertion precedes InitColumnBlockPosition;failed initialization remains cached as upstream. Native allocator insertion failures are outside managed allocation. @param tab - Sheet. @param col - Column. @returns Cached cursor or null on initial failed initialization. */
  getBlockPosition(tab: number, col: number): ColumnBlockPosition | null {
    let columns = this.maTables.get(tab);
    if (!columns) {
      columns = new Map();
      this.maTables.set(tab, columns);
    }
    const existing = columns.get(col);
    if (existing) return existing;
    const position = new ColumnBlockPosition();
    columns.set(col, position);
    if (!this.mrDoc.InitColumnBlockPosition(position, tab, col)) return null;
    return position;
  }
  /** Original cache clear releases cursor values. @returns Nothing. */
  clear(): void {
    this.maTables.clear();
  }
}
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

/** Converts the actual typed block at an offset into a borrowed cell view; edit-text blocks are not represented by the current store traits. @param position - Native const block iterator. @param offset - Offset inside its actual block. @returns Cell view. */
export function toRefCell(
  position: ReturnType<CellStoreType["cbegin"]>,
  offset: number,
): ScRefCellValue {
  const block = position.get(),
    data = block.data as base_element_block;
  if (block.type === element_type_numeric)
    return new ScRefCellValue(numeric_block.at(data, offset));
  if (block.type === element_type_string) return new ScRefCellValue(string_block.at(data, offset));
  if (block.type === element_type_edittext)
    return new ScRefCellValue(edittext_block.at(data, offset));
  if (block.type === element_type_formula)
    return new ScRefCellValue(formula_block.at(data, offset) as ScFormulaCell);
  return new ScRefCellValue();
}
