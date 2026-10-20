/** @fileoverview Consumed unmerged frame Array style storage,clipping and neighbor conflict selection from framelinkarray.cxx. Merged/rotation/mirroring and drawing primitives remain unported;GC replaces physical registered-cell interning. */
import { Style } from "./framelink";
/** Original empty style shared by clipped and absent frame queries. */
const OBJ_STYLE_NONE = new Style();
/** Original unmerged Cell owns the four independent frame styles. */
class Cell {
  readonly styles = [new Style(), new Style(), new Style(), new Style()];
  /** Copies actual source style values rather than a browser border model. @returns Independent cell. */
  Clone(): Cell {
    const copy = new Cell();
    for (let i = 0; i < 4; i++) copy.styles[i] = (this.styles[i] as Style).Clone();
    return copy;
  }
}
/** Original immutable empty-cell fallback. */
const OBJ_CELL_NONE = new Cell();
/** Original ArrayImpl dimensions,clip bounds and actual frame cells. */
class ArrayImpl {
  readonly maCells: Cell[] = [];
  mnFirstClipCol = 0;
  mnFirstClipRow = 0;
  mnLastClipCol: number;
  mnLastClipRow: number;
  /** Initializes actual source empty-cell storage and full clip range. @param mnWidth - Columns. @param mnHeight - Rows. @returns Owner. */
  constructor(
    readonly mnWidth: number,
    readonly mnHeight: number,
  ) {
    this.mnLastClipCol = mnWidth - 1;
    this.mnLastClipRow = mnHeight - 1;
    const empty = new Cell();
    this.maCells = new globalThis.Array<Cell>(mnWidth * mnHeight).fill(empty);
  }
  /** Original row-major cell index. @param col - Column. @param row - Row. @returns Index. */
  GetIndex(col: number, row: number): number {
    return row * this.mnWidth + col;
  }
  /** Original valid-position predicate;negative indexing remains outside the native defined caller domain. @param col - Column. @param row - Row. @returns Valid. */
  IsValidPos(col: number, row: number): boolean {
    return col < this.mnWidth && row < this.mnHeight;
  }
  /** Borrows an actual source cell or the empty fallback outside the array. @param col - Column. @param row - Row. @returns Cell. */
  GetCell(col: number, row: number): Cell {
    return this.IsValidPos(col, row)
      ? (this.maCells[this.GetIndex(col, row)] as Cell)
      : OBJ_CELL_NONE;
  }
  /** Original cell replacement;physical interning is erased while values remain independent. @param col - Column. @param row - Row. @param cell - Source cell. @returns Nothing. */
  PutCell(col: number, row: number, cell: Cell): void {
    if (this.IsValidPos(col, row)) this.maCells[this.GetIndex(col, row)] = cell;
  }
  /** Original column clip predicate. @param col - Column. @returns Inside. */
  IsColInClipRange(col: number): boolean {
    return col >= this.mnFirstClipCol && col <= this.mnLastClipCol;
  }
  /** Original row clip predicate. @param row - Row. @returns Inside. */
  IsRowInClipRange(row: number): boolean {
    return row >= this.mnFirstClipRow && row <= this.mnLastClipRow;
  }
}
/** Native unmerged frame-array surface consumed by the browser paint projection. */
export class Array {
  private mxImpl = new ArrayImpl(0, 0);
  /** Original clears all styles and reinitializes dimensions/clip. @param width - Columns. @param height - Rows. @returns Nothing. */
  Initialize(width: number, height: number): void {
    this.mxImpl = new ArrayImpl(width, height);
  }
  /** Original explicit clip assignment,valid ordered coordinates are caller preconditions. @param firstCol - First column. @param firstRow - First row. @param lastCol - Last column. @param lastRow - Last row. @returns Nothing. */
  SetClipRange(firstCol: number, firstRow: number, lastCol: number, lastRow: number): void {
    Object.assign(this.mxImpl, {
      mnFirstClipCol: firstCol,
      mnFirstClipRow: firstRow,
      mnLastClipCol: lastCol,
      mnLastClipRow: lastRow,
    });
  }
  /** Stores a copied native cell style. @param col - Column. @param row - Row. @param side - Source side index. @param style - Actual style. @returns Nothing. */
  private SetCellStyle(col: number, row: number, side: number, style: Style): void {
    const cell = this.mxImpl.GetCell(col, row).Clone();
    cell.styles[side] = style.Clone();
    this.mxImpl.PutCell(col, row, cell);
  }
  /** Original left style assignment. @param col - Column. @param row - Row. @param style - Style. @returns Nothing. */
  SetCellStyleLeft(col: number, row: number, style: Style): void {
    this.SetCellStyle(col, row, 0, style);
  }
  /** Original right style assignment. @param col - Column. @param row - Row. @param style - Style. @returns Nothing. */
  SetCellStyleRight(col: number, row: number, style: Style): void {
    this.SetCellStyle(col, row, 1, style);
  }
  /** Original top style assignment. @param col - Column. @param row - Row. @param style - Style. @returns Nothing. */
  SetCellStyleTop(col: number, row: number, style: Style): void {
    this.SetCellStyle(col, row, 2, style);
  }
  /** Original bottom style assignment. @param col - Column. @param row - Row. @param style - Style. @returns Nothing. */
  SetCellStyleBottom(col: number, row: number, style: Style): void {
    this.SetCellStyle(col, row, 3, style);
  }
  /** Borrows an actual unmerged cell edge. @param col - Column. @param row - Row. @param side - Side. @returns Native style. */
  private GetStyle(col: number, row: number, side: number): Style {
    return this.mxImpl.GetCell(col, row).styles[side] as Style;
  }
  /** Original std::max retains the first edge on equal precedence. @param own - Own edge. @param adjacent - Neighbor edge. @returns Borrowed winning style. */
  private Max(own: Style, adjacent: Style): Style {
    return own.lessThan(adjacent) ? adjacent : own;
  }
  /** Original left clipping and own-left/neighbor-right precedence. @param col - Column. @param row - Row. @returns Borrowed style. */
  GetCellStyleLeft(col: number, row: number): Style {
    const a = this.mxImpl;
    if (!a.IsRowInClipRange(row)) return OBJ_STYLE_NONE;
    if (col === a.mnFirstClipCol) return this.GetStyle(col, row, 0);
    if (col === a.mnLastClipCol + 1) return this.GetStyle(col - 1, row, 1);
    if (!a.IsColInClipRange(col)) return OBJ_STYLE_NONE;
    return this.Max(this.GetStyle(col, row, 0), this.GetStyle(col - 1, row, 1));
  }
  /** Original right clipping and own-right/neighbor-left precedence. @param col - Column. @param row - Row. @returns Borrowed style. */
  GetCellStyleRight(col: number, row: number): Style {
    const a = this.mxImpl;
    if (!a.IsRowInClipRange(row)) return OBJ_STYLE_NONE;
    if (col + 1 === a.mnFirstClipCol) return this.GetStyle(col + 1, row, 0);
    if (col === a.mnLastClipCol) return this.GetStyle(col, row, 1);
    if (!a.IsColInClipRange(col)) return OBJ_STYLE_NONE;
    return this.Max(this.GetStyle(col, row, 1), this.GetStyle(col + 1, row, 0));
  }
  /** Original top clipping and own-top/neighbor-bottom precedence. @param col - Column. @param row - Row. @returns Borrowed style. */
  GetCellStyleTop(col: number, row: number): Style {
    const a = this.mxImpl;
    if (!a.IsColInClipRange(col)) return OBJ_STYLE_NONE;
    if (row === a.mnFirstClipRow) return this.GetStyle(col, row, 2);
    if (row === a.mnLastClipRow + 1) return this.GetStyle(col, row - 1, 3);
    if (!a.IsRowInClipRange(row)) return OBJ_STYLE_NONE;
    return this.Max(this.GetStyle(col, row, 2), this.GetStyle(col, row - 1, 3));
  }
  /** Original bottom clipping and own-bottom/neighbor-top precedence. @param col - Column. @param row - Row. @returns Borrowed style. */
  GetCellStyleBottom(col: number, row: number): Style {
    const a = this.mxImpl;
    if (!a.IsColInClipRange(col)) return OBJ_STYLE_NONE;
    if (row + 1 === a.mnFirstClipRow) return this.GetStyle(col, row + 1, 2);
    if (row === a.mnLastClipRow) return this.GetStyle(col, row, 3);
    if (!a.IsRowInClipRange(row)) return OBJ_STYLE_NONE;
    return this.Max(this.GetStyle(col, row, 3), this.GetStyle(col, row + 1, 2));
  }
}
