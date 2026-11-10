/** @fileoverview Original HTMLTableRow ownership, span maintenance and group/default values from htmltab.cxx. */
import { HTMLTableCell } from "./htmltab.cell";
import type { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
/** Native row owns its cells and unique background brush, independently of core table geometry. */
export class HTMLTableRow {
  private readonly m_aCells: HTMLTableCell[];
  private m_xBGBrush: SvxBrushItem | null = null;
  private m_eAdjust = SvxAdjust.End;
  private m_nHeight = 0;
  private m_nEmptyRows = 0;
  private m_eVertOri: number = V.TOP;
  private m_bIsEndOfGroup = false;
  private m_bBottomBorder = false;
  /** Original vector of distinct empty cells. @param cells - Native uint16 count. @returns Row. */
  constructor(cells: number) {
    this.m_aCells = Array.from(
      { length: cells & 65535 },
      /** Creates an actual independent native cell. @returns Cell. */
      () => new HTMLTableCell(),
    );
  }
  /** Original bottom-border setter. @param value - Flag. @returns Nothing. */
  SetBottomBorder(value: boolean): void {
    this.m_bBottomBorder = value;
  }
  /** Original bottom-border query. @returns Flag. */
  GetBottomBorder(): boolean {
    return this.m_bBottomBorder;
  }
  /** Original height is a monotonic maximum. @param height - Native uint16. @returns Nothing. */
  SetHeight(height: number): void {
    height &= 65535;
    if (height > this.m_nHeight) this.m_nHeight = height;
  }
  /** Original height query. @returns Height. */
  GetHeight(): number {
    return this.m_nHeight;
  }
  /** Original vector::at range checking, without exposing private cell storage. @param index - Native uint16 index. @returns Borrowed actual cell. */
  GetCell(index: number): HTMLTableCell {
    const cell = this.m_aCells[index & 65535];
    if (!cell) throw new RangeError("HTMLTableRow cell index is out of range");
    return cell;
  }
  /** Original row-adjustment setter. @param value - Native enum. @returns Nothing. */
  SetAdjust(value: SvxAdjust): void {
    this.m_eAdjust = value;
  }
  /** Original row adjustment. @returns Enum. */
  GetAdjust(): SvxAdjust {
    return this.m_eAdjust;
  }
  /** Original orientation setter. @param value - Native signed16. @returns Nothing. */
  SetVertOri(value: number): void {
    this.m_eVertOri = (value << 16) >> 16;
  }
  /** Original row orientation sentinel is TOP. @returns Orientation. */
  GetVertOri(): number {
    return this.m_eVertOri;
  }
  /** Original unique_ptr reference transfer clears the caller's owner. @param brush - Native unique owner reference. @returns Nothing. */
  SetBGBrush(brush: [SvxBrushItem | null]): void {
    this.m_xBGBrush = brush[0];
    brush[0] = null;
  }
  /** Original borrowed unique background. @returns Brush or null. */
  GetBGBrush(): SvxBrushItem | null {
    return this.m_xBGBrush;
  }
  /** Original group-end marker. @returns Nothing. */
  SetEndOfGroup(): void {
    this.m_bIsEndOfGroup = true;
  }
  /** Original group-end query. @returns Flag. */
  IsEndOfGroup(): boolean {
    return this.m_bIsEndOfGroup;
  }
  /** Original uint16 empty-row counter increment. @returns Nothing. */
  IncEmptyRows(): void {
    this.m_nEmptyRows = (this.m_nEmptyRows + 1) & 65535;
  }
  /** Original empty-row count. @returns Count. */
  GetEmptyRows(): number {
    return this.m_nEmptyRows;
  }
  /** Original expansion appends independent cells; one-cell mode sets decreasing spans only on new cells. Smaller counts do not shrink. @param cells - Required native count. @param oneCell - Original fill selector. @returns Nothing. */
  Expand(cells: number, oneCell = false): void {
    cells &= 65535;
    let span = (cells - this.m_aCells.length) & 65535;
    for (let index = this.m_aCells.length; index < cells; ++index) {
      const cell = new HTMLTableCell();
      this.m_aCells.push(cell);
      if (oneCell) cell.SetColSpan(span);
      span = (span - 1) & 65535;
    }
  }
  /** Original shrink fixes trailing contentless cells, including protected cells, and stops at the first cell carrying contents. @param cells - Required smaller native count. @returns Nothing. */
  Shrink(cells: number): void {
    cells &= 65535;
    let index = cells;
    while (index) {
      const cell = this.GetCell(--index);
      if (!cell.GetContents()) cell.SetColSpan(cells - index);
      else break;
    }
    this.m_aCells.splice(cells);
  }
}
