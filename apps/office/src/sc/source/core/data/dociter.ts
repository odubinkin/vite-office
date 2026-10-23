/** @fileoverview Native ScHorizontalCellIterator over actual column block cursors; no second cell model is retained. */
import { ScAddress, type ScRange, ValidTab } from "../../../inc/address";
import type { ScColumn } from "../../../inc/column";
import type { ScTable } from "../../../inc/table";
import type { ScFormulaCell } from "../../../inc/formulacell";
import type { ScInterpreterContext } from "../../../inc/interpretercontext";
import type { FormulaResultNumber } from "../../../inc/formularesult";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { SubtotalFlags } from "../../../inc/global";
import {
  numeric_block,
  formula_block,
  element_type_numeric,
  element_type_formula,
} from "../../../inc/mtvelements";
import type { base_element_block } from "../../../../external/mdds/include/mdds/multi_type_vector/types";
import type { CellStoreType } from "../../../inc/mtvelements";
import { element_type_empty, toRefCell } from "../../../inc/mtvelements";
import { ScRefCellValue } from "../../../inc/cellvalue";
import type { ScDocument } from "../../../inc/document";
/** Actual native column parameter: const block position/end and column coordinate. */
interface ColParam {
  maPos: ReturnType<CellStoreType["cbegin"]>;
  maEnd: ReturnType<CellStoreType["cend"]>;
  mnCol: number;
}
/** Walks nonempty cells by row, preserving the native logical cursor and stable borrowed result owner. */
export class ScHorizontalCellIterator {
  private maColPos = 0;
  private readonly maColPositions: ColParam[] = [];
  private nEndCol: number;
  private mnCol: number;
  private mnRow: number;
  private readonly maCurCell = new ScRefCellValue();
  private mbMore = false;
  /** Initializes the native area and clamps only the original end column to allocated columns. @param rDoc - Actual document. @param mnTab - Existing sheet. @param nStartCol - First column. @param nStartRow - First row. @param endCol - Last column. @param nEndRow - Last row. @returns Iterator. */
  constructor(
    private readonly rDoc: ScDocument,
    private mnTab: number,
    private readonly nStartCol: number,
    private readonly nStartRow: number,
    endCol: number,
    private readonly nEndRow: number,
  ) {
    this.mnCol = nStartCol;
    this.mnRow = nStartRow;
    const table = rDoc.FetchTable(mnTab);
    if (!table) throw new RangeError("Horizontal cell iterator requires an existing sheet");
    this.nEndCol = table.ClampToAllocatedColumns(endCol);
    if (this.nEndCol < nStartCol) this.nEndCol = nStartCol - 1;
    this.SetTab(mnTab);
  }
  /** Resets the native cursors without widening the original constructor's column clamp. Columns in this native valid domain must already exist. @param tab - Existing sheet. @returns Nothing. */
  SetTab(tab: number): void {
    this.mbMore = false;
    this.mnTab = tab;
    this.mnRow = this.nStartRow;
    this.mnCol = this.nStartCol;
    this.maColPositions.length = 0;
    const table = this.rDoc.FetchTable(this.mnTab);
    if (
      !table ||
      (this.nEndCol >= this.nStartCol && this.nEndCol >= table.GetAllocatedColumnsCount())
    )
      throw new RangeError("Horizontal cell iterator sheet/allocated-column precondition failed");
    for (let col = this.nStartCol; col <= this.nEndCol; col++) {
      const store = table.CreateColumnIfNotExists(col).GetCellStore();
      const parameter: ColParam = {
        maPos: store.cposition(this.nStartRow).first,
        maEnd: store.cend(),
        mnCol: col,
      };
      while (!parameter.maPos.equals(parameter.maEnd)) {
        if (parameter.maPos.get().type === element_type_empty) parameter.maPos.increment();
        else {
          this.maColPositions.push(parameter);
          break;
        }
      }
    }
    if (!this.maColPositions.length) return;
    this.maColPos = 0;
    this.mbMore = true;
    this.SkipInvalid();
  }
  /** Returns the native borrowed result pointer and writes current coordinates before advancing. Null leaves output slots untouched. @param col - Output column slot. @param row - Output row slot. @returns Stable borrowed view or null. */
  GetNext(col: [number], row: [number]): ScRefCellValue | null {
    if (!this.mbMore) return null;
    const parameter = this.maColPositions[this.maColPos] as ColParam;
    col[0] = this.mnCol = parameter.mnCol;
    row[0] = this.mnRow;
    this.maCurCell.copy_assign(
      toRefCell(parameter.maPos, this.mnRow - parameter.maPos.get().position),
    );
    this.Advance();
    return this.maCurCell;
  }
  /** Publishes native current coordinates even at end; the boolean determines whether they identify a live cell. @param col - Column output. @param row - Row output. @returns Whether more cells exist. */
  GetPos(col: [number], row: [number]): boolean {
    col[0] = this.mnCol;
    row[0] = this.mnRow;
    return this.mbMore;
  }
  /** Finds a live block in the current row or removes exhausted columns exactly as the native vector scan does. @returns A valid cell or terminal empty state. */
  private SkipInvalidInRow(): boolean {
    while (this.maColPos < this.maColPositions.length) {
      const parameter = this.maColPositions[this.maColPos] as ColParam,
        block = parameter.maPos.get();
      if (this.mnRow >= block.position) {
        if (this.mnRow < block.position + block.size) {
          this.mnCol = parameter.mnCol;
          return true;
        }
        let more = false;
        for (
          parameter.maPos.increment();
          !parameter.maPos.equals(parameter.maEnd);
          parameter.maPos.increment()
        ) {
          const next = parameter.maPos.get();
          if (this.mnRow < next.position + next.size && next.type !== element_type_empty) {
            more = true;
            break;
          }
        }
        if (!more) {
          this.maColPositions.splice(this.maColPos, 1);
          if (!this.maColPositions.length) this.mbMore = false;
        }
      } else this.maColPos++;
    }
    if (!this.maColPositions.length) {
      this.mbMore = false;
      return true;
    }
    return false;
  }
  /** Finds the next source block start across surviving columns, without scanning empty rows. @returns Next candidate row. */
  private FindNextNonEmptyRow(): number {
    let next = this.rDoc.MaxRow() + 1;
    for (const parameter of this.maColPositions)
      next = Math.min(next, parameter.maPos.get().position);
    return Math.max(next, this.mnRow);
  }
  /** Advances once past the current column before native row/empty-block skipping. @returns Nothing. */
  private Advance(): void {
    this.maColPos++;
    this.SkipInvalid();
  }
  /** Preserves native row increment, same-row retry and sparse-row jump order. @returns Nothing. */
  private SkipInvalid(): void {
    if (this.maColPos === this.maColPositions.length || !this.SkipInvalidInRow()) {
      this.mnRow++;
      if (this.mnRow > this.nEndRow) {
        this.mbMore = false;
        return;
      }
      this.maColPos = 0;
      if (this.SkipInvalidInRow()) return;
      this.mnRow = this.FindNextNonEmptyRow();
      this.maColPos = 0;
      this.SkipInvalidInRow();
    }
    if (this.mnRow > this.nEndRow) this.mbMore = false;
  }
}

/** Original column-major numeric iterator,consuming only ordinary NONE/false default options. Format,CalcAsShown and subtotal services remain unported. */
export class ScValueIterator {
  private readonly mrDoc: ScDocument;
  private readonly maStartPos: ScAddress;
  private readonly maEndPos: ScAddress;
  private mnCol = 0;
  private mnTab = 0;
  private mpCells: CellStoreType | null = null;
  private maCurPos: ReturnType<CellStoreType["cposition"]> | null = null;
  /** Binds the genuine context/range with native out-of-domain coordinate clamping. @param context - Context. @param range - Source range. @param flags - Native subtotal flags. @param textAsZero - Native text mode. @returns Iterator. */
  constructor(
    context: ScInterpreterContext,
    range: ScRange,
    flags = SubtotalFlags.NONE,
    textAsZero = false,
  ) {
    if (flags !== SubtotalFlags.NONE || textAsZero)
      throw new Error("Subtotal/text-as-zero iteration services are not implemented");
    this.mrDoc = context.mpDoc;
    this.maStartPos = new ScAddress(range.aStart);
    this.maEndPos = new ScAddress(range.aEnd);
    const lastTab = this.mrDoc.GetTableCount() - 1;
    for (const point of [this.maStartPos, this.maEndPos]) {
      if (!this.mrDoc.ValidCol(point.Col())) point.SetCol(this.mrDoc.MaxCol());
      if (!this.mrDoc.ValidRow(point.Row())) point.SetRow(this.mrDoc.MaxRow());
      if (!ValidTab(point.Tab()) || point.Tab() > lastTab) point.SetTab(lastTab);
    }
  }
  /** Reads the actual cursor's row. @returns Row. */
  private GetRow(): number {
    const position = this.maCurPos as ReturnType<CellStoreType["cposition"]>;
    return position.first.get().position + position.second;
  }
  /** Advances the original block cursor and resets its offset. @returns Nothing. */
  private IncBlock(): void {
    const position = this.maCurPos as ReturnType<CellStoreType["cposition"]>;
    position.first.increment();
    position.second = 0;
  }
  /** Advances within the native typed block or onto the next block. @returns Nothing. */
  private IncPos(): void {
    const position = this.maCurPos as ReturnType<CellStoreType["cposition"]>;
    if (position.second + 1 < position.first.get().size) position.second++;
    else this.IncBlock();
  }
  /** Original GetThis scans native allocated columns and typed blocks without expanding empty rows. @param output - Native error/value references. @returns Found numeric/error cell. */
  private GetThis(output: FormulaResultNumber): boolean {
    while (true) {
      let nextColumn =
        !this.mpCells ||
        (this.maCurPos as ReturnType<CellStoreType["cposition"]>).first.equals(this.mpCells.cend());
      if (!nextColumn && this.GetRow() > this.maEndPos.Row()) nextColumn = true;
      if (nextColumn) {
        let column: ScColumn;
        do {
          this.mnCol++;
          while (
            this.mnCol > this.maEndPos.Col() ||
            this.mnCol >= (this.mrDoc.FetchTable(this.mnTab) as ScTable).GetAllocatedColumnsCount()
          ) {
            this.mnCol = this.maStartPos.Col();
            this.mnTab++;
            if (this.mnTab > this.maEndPos.Tab()) {
              output.error = FormulaError.NONE;
              return false;
            }
          }
          column = (this.mrDoc.FetchTable(this.mnTab) as ScTable).CreateColumnIfNotExists(
            this.mnCol,
          );
        } while (column.IsEmptyData());
        this.mpCells = column.GetCellStore();
        this.maCurPos = this.mpCells.cposition(this.maStartPos.Row());
      }
      const position = this.maCurPos as ReturnType<CellStoreType["cposition"]>,
        node = position.first.get();
      switch (node.type) {
        case element_type_numeric:
          output.value = numeric_block.at(node.data as base_element_block, position.second);
          output.error = FormulaError.NONE;
          return true;
        case element_type_formula: {
          const cell = formula_block.at(
            node.data as base_element_block,
            position.second,
          ) as ScFormulaCell;
          if (cell.GetErrorOrValue(output)) return true;
          this.IncPos();
          break;
        }
        default:
          this.IncBlock();
          break;
      }
    }
  }
  /** Original first-value search;an absent sheet leaves both outputs untouched. @param output - Error/value references. @returns Found value. */
  GetFirst(output: FormulaResultNumber): boolean {
    this.mnCol = this.maStartPos.Col();
    this.mnTab = this.maStartPos.Tab();
    const table = this.mrDoc.FetchTable(this.mnTab);
    if (!table) return false;
    if (this.mnCol < table.GetAllocatedColumnsCount()) {
      this.mpCells = table.CreateColumnIfNotExists(this.mnCol).GetCellStore();
      this.maCurPos = this.mpCells.cposition(this.maStartPos.Row());
    } else this.mpCells = null;
    return this.GetThis(output);
  }
  /** Original next-value search;terminal search preserves the previous value. @param output - Error/value references. @returns Found value. */
  GetNext(output: FormulaResultNumber): boolean {
    this.IncPos();
    return this.GetThis(output);
  }
}
