/** @fileoverview Original SwHTMLTableLayout construction, grid ownership and width/spacing utility operations from htmltbl.cxx/htmltbl.hxx; automatic measurement/resize passes are separate consumers. */
import type { SwTable } from "../table/swtable";
import type { SwHTMLTableLayoutCell } from "./htmltbl.values";
import type { SwHTMLTableLayoutColumn } from "./htmltbl.column";
import type { SvxAdjust } from "../../../../editeng/inc/svxenum";
import { MIN_BORDER_DIST } from "../../../inc/swtypes";
import type { SwTableBox } from "../table/swtable";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";

/** Native layout owns its original grid/options. Protected visibility binds original private fields across forthcoming responsibility fragments without a second state object. */
export class SwHTMLTableLayout {
  protected readonly m_aColumns: (SwHTMLTableLayoutColumn | null)[];
  protected readonly m_aCells: (SwHTMLTableLayoutCell | null)[];
  protected m_nMin = 0;
  protected m_nMax = 0;
  protected m_nInhAbsLeftSpace = 0;
  protected m_nInhAbsRightSpace = 0;
  protected m_nRelLeftFill = 0;
  protected m_nRelRightFill = 0;
  protected m_nRelTabWidth = 0;
  protected m_nInhLeftBorderWidth = 0;
  protected m_nInhRightBorderWidth = 0;
  protected m_nDelayedResizeAbsAvail = 0;
  protected m_nLastResizeAbsAvail = 0;
  protected m_nPass1Done = 0;
  protected m_nWidthSet = 0;
  protected m_bUseRelWidth = false;
  protected m_bMustResize = true;
  protected m_bExportable = true;
  protected m_bBordersChanged = false;
  protected m_bMayBeInFlyFrame = false;
  protected m_bDelayedResizeRecalc = false;
  protected m_bMustNotResize = false;
  protected m_bMustNotRecalc = false;
  /** Original constructor preserves all options and zero/default state. No measurements, timer result or auto-layout success is synthesized. @param m_pSwTable - Actual top-level core table or null. @param m_nRows - Native row count. @param m_nCols - Native column count. @param m_bColsOption - Original COLS admission. @param m_bColTags - Original COL/COLGROUP admission. @param m_nWidthOption - Native width. @param m_bPercentWidthOption - Original percent selector. @param m_nBorder - Netscape width-accounting border. @param m_nCellPadding - Native twips. @param m_nCellSpacing - Native twips. @param m_eTableAdjust - Native adjustment. @param m_nLeftMargin - Native margin. @param m_nRightMargin - Native margin. @param m_nBorderWidth - Actual inner border space. @param m_nLeftBorderWidth - Actual left border space. @param m_nRightBorderWidth - Actual right border space. @returns Native layout owner. */
  constructor(
    protected readonly m_pSwTable: SwTable | null,
    protected readonly m_nRows: number,
    protected readonly m_nCols: number,
    protected readonly m_bColsOption: boolean,
    protected readonly m_bColTags: boolean,
    protected m_nWidthOption: number,
    protected readonly m_bPercentWidthOption: boolean,
    protected readonly m_nBorder: number,
    protected readonly m_nCellPadding: number,
    protected readonly m_nCellSpacing: number,
    protected readonly m_eTableAdjust: SvxAdjust,
    protected readonly m_nLeftMargin: number,
    protected readonly m_nRightMargin: number,
    protected readonly m_nBorderWidth: number,
    protected readonly m_nLeftBorderWidth: number,
    protected readonly m_nRightBorderWidth: number,
  ) {
    this.m_nRows &= 65535;
    this.m_nCols &= 65535;
    this.m_nWidthOption &= 65535;
    this.m_nBorder &= 65535;
    this.m_nCellPadding &= 65535;
    this.m_nCellSpacing &= 65535;
    this.m_nLeftMargin &= 65535;
    this.m_nRightMargin &= 65535;
    this.m_nBorderWidth &= 65535;
    this.m_nLeftBorderWidth &= 65535;
    this.m_nRightBorderWidth &= 65535;
    this.m_aColumns = new Array<SwHTMLTableLayoutColumn | null>(this.m_nCols).fill(null);
    this.m_aCells = new Array<SwHTMLTableLayoutCell | null>(this.m_nRows * this.m_nCols).fill(null);
  }
  /** Original column pointer borrow; valid indices are the native precondition. @param column - Native index. @returns Actual owner or null before assignment. */
  GetColumn(column: number): SwHTMLTableLayoutColumn | null {
    return this.m_aColumns[column] as SwHTMLTableLayoutColumn | null;
  }
  /** Original unique column assignment. @param value - Actual native owner. @param column - Native index. @returns Nothing. */
  SetColumn(value: SwHTMLTableLayoutColumn | null, column: number): void {
    this.m_aColumns[column] = value;
  }
  /** Original flattened grid borrow. @param row - Native row. @param column - Native column. @returns Actual cell or null before assignment. */
  GetCell(row: number, column: number): SwHTMLTableLayoutCell | null {
    return this.m_aCells[row * this.m_nCols + column] as SwHTMLTableLayoutCell | null;
  }
  /** Original unique cell assignment. @param value - Native owner. @param row - Native row. @param column - Native column. @returns Nothing. */
  SetCell(value: SwHTMLTableLayoutCell | null, row: number, column: number): void {
    this.m_aCells[row * this.m_nCols + column] = value;
  }
  /** Original calculated minimum, initially zero until a real pass runs. @returns Metric. */
  GetMin(): number {
    return this.m_nMin;
  }
  /** Original calculated maximum, initially zero until a real pass runs. @returns Metric. */
  GetMax(): number {
    return this.m_nMax;
  }
  /** Original browse-width selector. @returns Current source metric. */
  GetBrowseWidthMin(): number {
    return !this.m_nWidthOption || this.m_bPercentWidthOption ? this.m_nMin : this.m_nRelTabWidth;
  }
  /** Original COLS flag. @returns Flag. */
  HasColsOption(): boolean {
    return this.m_bColsOption;
  }
  /** Original COL/COLGROUP flag. @returns Flag. */
  HasColTags(): boolean {
    return this.m_bColTags;
  }
  /** Original top table predicate uses the borrowed core owner. @returns Flag. */
  IsTopTable(): boolean {
    return this.m_pSwTable !== null;
  }
  /** Original resize admission mutation. @param value - Flag. @returns Nothing. */
  SetMustResize(value: boolean): void {
    this.m_bMustResize = value;
  }
  /** Original resize prohibition. @param value - Flag. @returns Nothing. */
  SetMustNotResize(value: boolean): void {
    this.m_bMustNotResize = value;
  }
  /** Original recalculation prohibition. @param value - Flag. @returns Nothing. */
  SetMustNotRecalc(value: boolean): void {
    this.m_bMustNotRecalc = value;
  }
  /** Original authored width. @returns Native width option. */
  GetWidthOption(): number {
    return this.m_nWidthOption;
  }
  /** Original percentage selector. @returns Flag. */
  HasPercentWidthOption(): boolean {
    return this.m_bPercentWidthOption;
  }
  /** Original padding. @returns Twips. */
  GetCellPadding(): number {
    return this.m_nCellPadding;
  }
  /** Original spacing. @returns Twips. */
  GetCellSpacing(): number {
    return this.m_nCellSpacing;
  }
  /** Original Netscape border width. @returns Twips. */
  GetBorder(): number {
    return this.m_nBorder;
  }
  /** Original row count. @returns Count. */
  GetRowCount(): number {
    return this.m_nRows;
  }
  /** Original column count. @returns Count. */
  GetColCount(): number {
    return this.m_nCols;
  }
  /** Original exportability mutation. @param value - Flag. @returns Nothing. */
  SetExportable(value: boolean): void {
    this.m_bExportable = value;
  }
  /** Original exportability query. @returns Flag. */
  IsExportable(): boolean {
    return this.m_bExportable;
  }
  /** Original border invalidation query. @returns Flag. */
  HaveBordersChanged(): boolean {
    return this.m_bBordersChanged;
  }
  /** Original fly-frame admission mutation. @param value - Flag. @returns Nothing. */
  SetMayBeInFlyFrame(value: boolean): void {
    this.m_bMayBeInFlyFrame = value;
  }
  /** Original fly-frame admission query. @returns Flag. */
  MayBeInFlyFrame(): boolean {
    return this.m_bMayBeInFlyFrame;
  }
  /** Original inherited space adds each applicable outside edge. @param column - Start column. @param span - Column span. @returns Native uint16 space. */
  GetInhCellSpace(column: number, span: number): number {
    return (
      ((column === 0 ? this.m_nInhAbsLeftSpace : 0) +
        (column + span === this.m_nCols ? this.m_nInhAbsRightSpace : 0)) &
      65535
    );
  }
  /** Original inherited border setters. @param left - Native uint16. @param right - Native uint16. @returns Nothing. */
  SetInhBorderWidths(left: number, right: number): void {
    this.m_nInhLeftBorderWidth = left & 65535;
    this.m_nInhRightBorderWidth = right & 65535;
  }
  /** Original available-width summation uses separately narrowed absolute/relative outputs. @param column - Start column. @param span - Column count. @param absolute - Native output. @param relative - Native output. @returns Nothing. */
  GetAvail(column: number, span: number, absolute: [number], relative: [number]): void {
    absolute[0] = relative[0] = 0;
    for (let index = column; index < column + span; ++index) {
      const value = this.GetColumn(index);
      if (!value) throw new Error("assert(layout column)");
      absolute[0] = (absolute[0] + value.GetAbsColWidth()) & 65535;
      relative[0] = (relative[0] + value.GetRelColWidth()) & 65535;
    }
  }
  /** Original border contribution uses a wide sum after each side has applied its native uint16 accounting. @param min - Native minimum reference. @param max - Native maximum reference. @param absolute - Native absolute minimum reference. @param column - Start column. @param span - Column span. @param swBorders - Respect actual border minima. @returns Nothing. */
  protected AddBorderWidth(
    min: [number],
    max: [number],
    absolute: [number],
    column: number,
    span: number,
    swBorders = true,
  ): void {
    const add =
      this.GetLeftCellSpace(column, span, swBorders) +
      this.GetRightCellSpace(column, span, swBorders);
    min[0] += add;
    max[0] += add;
    absolute[0] += add;
  }
  /** Original box-width publication sums relative columns in the wider SwTwips domain and sets the actual box frame format. @param box - Actual core box. @param column - Start column. @param span - Column span. @returns Nothing. */
  protected SetBoxWidth(box: SwTableBox, column: number, span: number): void {
    let width = 0;
    while (span--) {
      const value = this.GetColumn(column++);
      if (!value) throw new Error("assert(layout box column)");
      width += value.GetRelColWidth();
    }
    const size = new SwFormatFrameSize(SwFrameSize.Variable, width, 0);
    try {
      box.GetFrameFormat().SetFormatAttr(size);
    } finally {
      size.Dispose();
    }
  }
  /** Original left spacing combines Netscape accounting and actual line minima. @param column - Start column. @param span - Native span. @param swBorders - Respect actual lines. @returns Native uint16. */
  GetLeftCellSpace(column: number, span: number, swBorders = true): number {
    let space = (this.m_nCellSpacing + this.m_nCellPadding) & 65535;
    if (column === 0) {
      space = (space + this.m_nBorder) & 65535;
      if (swBorders && space < this.m_nLeftBorderWidth) space = this.m_nLeftBorderWidth & 65535;
    } else if (swBorders) {
      const value = this.GetColumn(column);
      if (!value) throw new Error("assert(layout column)");
      if (value.HasLeftBorder()) {
        if (space < this.m_nBorderWidth) space = this.m_nBorderWidth & 65535;
      } else if (
        column + span === this.m_nCols &&
        this.m_nRightBorderWidth &&
        space < MIN_BORDER_DIST
      )
        space = MIN_BORDER_DIST;
    }
    return space;
  }
  /** Original right spacing tests the current column's left border for the opposite-side minimum. @param column - Start column. @param span - Native span. @param swBorders - Respect actual lines. @returns Native uint16. */
  GetRightCellSpace(column: number, span: number, swBorders = true): number {
    let space = this.m_nCellPadding;
    if (column + span === this.m_nCols) {
      space = (space + this.m_nBorder + this.m_nCellSpacing) & 65535;
      if (swBorders && space < this.m_nRightBorderWidth) space = this.m_nRightBorderWidth & 65535;
    } else if (swBorders) {
      const value = this.GetColumn(column);
      if (!value) throw new Error("assert(layout column)");
      if (value.HasLeftBorder() && space < MIN_BORDER_DIST) space = MIN_BORDER_DIST;
    }
    return space;
  }
}
