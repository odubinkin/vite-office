/** @fileoverview Original SwHTMLTableLayout construction, grid ownership and width/spacing utility operations from htmltbl.cxx/htmltbl.hxx; including native width allocation and publication. */
import type { SwTable, SwTableLine } from "../table/swtable";
import type { SwHTMLTableLayoutCell } from "./htmltbl.values";
import type { SwHTMLTableLayoutColumn } from "./htmltbl.column";
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import { MIN_BORDER_DIST, MINLAY } from "../../../inc/swtypes";
import type { SwTableBox } from "../table/swtable";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";

import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import type { SwFrameFormat } from "../layout/atrfrm";
import type { SwStartNode } from "../docnode/node";

const USHRT_MAX = 65535;
const MAX_TABWIDTH = USHRT_MAX - 2001;

/** Original first-pass constraint for one spanning cell, linked in native insertion order. */
export class SwHTMLTableLayoutConstraints {
  private m_pNext: SwHTMLTableLayoutConstraints | null = null;
  /** Owns the measured cell widths and original grid position. @param minimum - Provisional minimum. @param maximum - Provisional maximum. @param row - Start row. @param column - Start column. @param span - Column span. @returns Constraint. */
  constructor(
    private readonly minimum: number,
    private readonly maximum: number,
    private readonly row: number,
    private readonly column: number,
    private readonly span: number,
  ) {}
  /** Original insertion stops on either greater coordinate. @param value - Detached constraint. @returns Chain head after insertion. */
  InsertNext(value: SwHTMLTableLayoutConstraints): SwHTMLTableLayoutConstraints {
    if (this.row > value.row || this.column > value.column) {
      value.m_pNext = this;
      return value;
    }
    let next = this.m_pNext;
    let previous: SwHTMLTableLayoutConstraints | null = null;
    while (next !== null && next.row <= value.row && next.column <= value.column) {
      previous = next;
      next = next.m_pNext;
    }
    value.m_pNext = next;
    if (previous === null) this.m_pNext = value;
    else previous.m_pNext = value;
    return this;
  }
  /** Original provisional minimum. @returns Width. */
  GetMinNoAlign(): number {
    return this.minimum;
  }
  /** Original provisional maximum. @returns Width. */
  GetMaxNoAlign(): number {
    return this.maximum;
  }
  /** Original start column. @returns Column. */
  GetColumn(): number {
    return this.column;
  }
  /** Original covered column count. @returns Span. */
  GetColSpan(): number {
    return this.span;
  }
  /** Borrows the next constraint. @returns Native successor or null. */
  GetNext(): SwHTMLTableLayoutConstraints | null {
    return this.m_pNext;
  }
}

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
  /** Applies native cell wrapping, authored width and border policy to measured content. @param row - Native row. @param index - Native start column. @param minimum - Content minimum. @param maximum - Content maximum. @param absoluteMinimum - Absolute content minimum. @returns Constraint for a spanning cell, otherwise null after merging the column. */
  protected AccumulatePass1CellWidths(
    row: number,
    index: number,
    minimum: number,
    maximum: number,
    absoluteMinimum: number,
  ): SwHTMLTableLayoutConstraints | null {
    const cell = this.GetCell(row, index);
    if (cell === null) throw new Error("assert(layout cell)");
    const span = cell.GetColSpan(),
      width = cell.GetWidthOption(),
      relative = cell.IsPercentWidthOption();
    if (cell.HasNoWrapOption()) {
      if (!width || relative) minimum = absoluteMinimum = maximum;
      else {
        minimum = Math.max(width, minimum);
        absoluteMinimum = Math.max(width, absoluteMinimum);
      }
    }
    const cellMin: [number] = [Math.max(minimum, MINLAY)],
      cellMax: [number] = [Math.max(maximum, MINLAY)],
      cellAbsMin: [number] = [Math.max(absoluteMinimum, MINLAY)];
    this.AddBorderWidth(cellMin, cellMax, cellAbsMin, index, span);
    if (span === 1) {
      const column = this.LayoutColumn(index);
      column.MergeMinMaxNoAlign(cellMin[0], cellMax[0], cellAbsMin[0]);
      if (!this.HasColTags()) column.MergeCellWidthOption(width, relative);
      return null;
    }
    if (!this.HasColTags() && width && !relative) {
      const absoluteWidth: [number] = [width];
      this.AddBorderWidth(absoluteWidth, [0], [0], index, span, false);
      if (absoluteWidth[0] >= cellMin[0]) {
        cellMax[0] = absoluteWidth[0];
        if (this.HasColsOption()) cellMin[0] = absoluteWidth[0];
      } else cellMin[0] = cellMax[0] = Math.max(absoluteWidth[0], cellAbsMin[0]);
    } else if (this.HasColsOption() || this.HasColTags()) cellMin[0] = cellAbsMin[0];
    return new SwHTMLTableLayoutConstraints(cellMin[0], cellMax[0], row, index, span);
  }

  /** Resolves a scanned column with single-span cells using its native provisional widths. @param index - Native column. @returns Nothing. */
  protected SetPass1ColumnWidths(index: number): void {
    const column = this.LayoutColumn(index);
    if (column.GetWidthOption() && !column.IsRelWidthOption()) {
      const absolute: [number] = [column.GetWidthOption()];
      this.AddBorderWidth(absolute, [0], [0], index, 1, false);
      const width = absolute[0];
      if (width >= column.GetMinNoAlign())
        column.SetMinMax(this.HasColsOption() ? width : column.GetMinNoAlign(), width);
      else {
        const minimum = Math.max(width, column.GetAbsMinNoAlign());
        column.SetMinMax(minimum, minimum);
      }
    } else
      column.SetMinMax(
        this.HasColsOption() ? column.GetAbsMinNoAlign() : column.GetMinNoAlign(),
        column.GetMaxNoAlign(),
      );
  }

  /** Completes the original first pass after cell measurement has populated column totals and constraints. @param constraints - Native spanning-cell chain. @param fixRelative - Relative-width admission from the column scan. @returns Nothing. */
  protected FinishAutoLayoutPass1(
    constraints: SwHTMLTableLayoutConstraints | null,
    fixRelative: boolean,
  ): void {
    for (let constraint = constraints; constraint !== null; constraint = constraint.GetNext()) {
      const start = constraint.GetColumn(),
        end = start + constraint.GetColSpan(),
        constraintMin = constraint.GetMinNoAlign(),
        constraintMax = constraint.GetMaxNoAlign();
      let columnsMin = 0,
        columnsMax = 0;
      for (let index = start; index < end; ++index) {
        const column = this.LayoutColumn(index);
        columnsMin += column.GetMin();
        columnsMax += column.GetMax();
      }

      if (columnsMin < constraintMin) {
        const difference = constraintMin - columnsMin;
        let remainder = difference;
        if (constraintMin > columnsMax) {
          for (let index = start; index < end; ++index) {
            const column = this.LayoutColumn(index),
              oldMin = column.GetMin(),
              oldMax = column.GetMax(),
              add = index < end - 1 ? dividePass1(oldMin * difference, columnsMin) : remainder,
              minimum = oldMin + add,
              maximum = Math.max(oldMax, minimum);
            this.m_nMin += add;
            this.m_nMax += maximum - oldMax;
            columnsMax += maximum - oldMax;
            remainder -= add;
            column.SetMinMax(minimum, maximum);
          }
        } else {
          for (let index = start; index < end; ++index) {
            const column = this.LayoutColumn(index),
              add = Math.min(remainder, column.GetMax() - column.GetMin());
            column.AddToMin(add);
            this.m_nMin += add;
            remainder -= add;
          }
        }
      }

      if (!this.HasColTags() && columnsMax < constraintMax) {
        const difference = constraintMax - columnsMax;
        for (let index = start; index < end; ++index) {
          const column = this.LayoutColumn(index),
            add = dividePass1(column.GetMax() * difference, columnsMax);
          column.AddToMax(add);
          this.m_nMax += add;
        }
      }
    }
    if (!fixRelative) return;
    if (this.HasColTags()) this.FixPass1RelativeColumnTags();
    else this.FixPass1RelativeCellWidths();
  }

  /** Applies original COL/COLGROUP relative weights while retaining the limiting column minimum. @returns Nothing. */
  private FixPass1RelativeColumnTags(): void {
    let absoluteMinimum = 0;
    for (let index = 0; index < this.m_nCols; ++index) {
      const column = this.LayoutColumn(index);
      if (column.IsRelWidthOption() && column.GetWidthOption()) absoluteMinimum += column.GetMin();
    }
    let quotient = Infinity;
    for (let index = 0; index < this.m_nCols; ++index) {
      const column = this.LayoutColumn(index);
      if (!column.IsRelWidthOption()) continue;
      this.m_nMax -= column.GetMax();
      if (column.GetWidthOption() && column.GetMin()) {
        column.SetMax(absoluteMinimum * column.GetWidthOption());
        quotient = Math.min(quotient, dividePass1(column.GetMax(), column.GetMin()));
      }
    }
    for (let index = 0; index < this.m_nCols; ++index) {
      const column = this.LayoutColumn(index);
      if (!column.IsRelWidthOption()) continue;
      column.SetMax(
        column.GetWidthOption() ? dividePass1(column.GetMax(), quotient) : column.GetMin(),
      );
      this.m_nMax += column.GetMax();
    }
  }

  /** Applies original cell-derived percentages and maximum widths when COL tags were absent. @returns Nothing. */
  private FixPass1RelativeCellWidths(): void {
    let relative = 0,
      relativeColumns = 0,
      relativeMaximum = 0;
    for (let index = 0; index < this.m_nCols; ++index) {
      const column = this.LayoutColumn(index);
      if (column.IsRelWidthOption() && column.GetWidthOption()) {
        let width = column.GetWidthOption();
        if (relative + width > 100) {
          width = 100 - relative;
          column.SetWidthOption(width);
        }
        relativeMaximum += column.GetMax();
        relative += width;
        ++relativeColumns;
      } else if (!column.GetMin()) ++relativeColumns;
    }
    const fixedMaximum =
      relative < 100 && relativeColumns < this.m_nCols ? this.m_nMax - relativeMaximum : 0;
    if (fixedMaximum) {
      for (let index = 0; index < this.m_nCols; ++index) {
        const column = this.LayoutColumn(index);
        if (!column.IsRelWidthOption() && !column.GetWidthOption() && column.GetMin())
          column.SetWidthOption(dividePass1(column.GetMax() * (100 - relative), fixedMaximum));
      }
    }

    let quotient = Infinity;
    const oldMaximum = this.m_nMax;
    this.m_nMax = 0;
    for (let index = 0; index < this.m_nCols; ++index) {
      const column = this.LayoutColumn(index);
      if (column.IsRelWidthOption() && column.GetWidthOption()) {
        const maximum = (this.m_nWidthOption ? this.m_nMin : oldMaximum) * column.GetWidthOption(),
          divisor = this.m_nWidthOption ? column.GetMin() : column.GetMax();
        quotient = Math.min(quotient, dividePass1(maximum, divisor));
        column.SetMax(maximum);
      } else if (this.HasColsOption() || this.m_nWidthOption || column.IsRelWidthOption())
        column.SetMax(column.GetMin());
    }
    for (let index = 0; index < this.m_nCols; ++index) {
      const column = this.LayoutColumn(index);
      if (column.IsRelWidthOption() && column.GetWidthOption() && quotient)
        column.SetMax(Math.max(column.GetMin(), dividePass1(column.GetMax(), quotient)));
      this.m_nMax += column.GetMax();
    }
  }

  /** Distributes an actual available width over the native first-pass column metrics. @param absolute - Available twips. @param relative - Available relative width, zero for a top table. @param leftSpace - Surrounding left cell space. @param rightSpace - Surrounding right cell space. @param parentInherited - Surrounding inherited space. @returns Nothing. */
  AutoLayoutPass2(
    absolute: number,
    relative: number,
    leftSpace: number,
    rightSpace: number,
    parentInherited: number,
  ): void {
    absolute &= USHRT_MAX;
    relative &= USHRT_MAX;
    leftSpace &= USHRT_MAX;
    rightSpace &= USHRT_MAX;
    parentInherited &= USHRT_MAX;
    this.m_nLastResizeAbsAvail = absolute;

    const top = this.IsTopTable();
    let leftFill = 0,
      rightFill = 0;
    if (!top && this.m_nMin + leftSpace + rightSpace <= absolute) {
      leftFill = leftSpace;
      rightFill = rightSpace;
    }
    if (top) absolute = (absolute - this.m_nLeftMargin - this.m_nRightMargin) & USHRT_MAX;
    else if (this.m_nMin + this.m_nLeftMargin + this.m_nRightMargin <= absolute) {
      leftFill = (leftFill + this.m_nLeftMargin) & USHRT_MAX;
      rightFill = (rightFill + this.m_nRightMargin) & USHRT_MAX;
    }
    this.m_nRelLeftFill = this.m_nRelRightFill = 0;
    if (!top && (leftFill || rightFill)) {
      this.m_nRelLeftFill = ((leftFill * relative) / absolute) & USHRT_MAX;
      this.m_nRelRightFill = ((rightFill * relative) / absolute) & USHRT_MAX;
      absolute = (absolute - leftFill - rightFill) & USHRT_MAX;
      if (relative) relative = (relative - this.m_nRelLeftFill - this.m_nRelRightFill) & USHRT_MAX;
    }

    let tableWidth = 0;
    this.m_bUseRelWidth = false;
    if (this.m_nWidthOption) {
      if (this.m_bPercentWidthOption) {
        this.m_nWidthOption = Math.min(this.m_nWidthOption, 100);
        tableWidth = Math.trunc((absolute * this.m_nWidthOption) / 100);
        if (top && tableWidth > this.m_nMin) {
          relative = USHRT_MAX;
          this.m_bUseRelWidth = true;
        }
      } else tableWidth = Math.min(this.m_nWidthOption, MAX_TABWIDTH);
    }
    if ((!top || relative) && tableWidth > absolute) tableWidth = absolute;

    if ((!top && this.m_nMin > absolute) || this.m_nMin > MAX_TABWIDTH) {
      tableWidth = top ? MAX_TABWIDTH : absolute;
      this.m_nRelTabWidth = relative || tableWidth;
      this.DistributeConstrainedMinimum(tableWidth);
    } else if (this.m_nMax <= (tableWidth || absolute)) {
      tableWidth ||= this.m_nMax & USHRT_MAX;
      absolute = Math.max(absolute, tableWidth);
      this.m_nRelTabWidth = relative
        ? relativeTableWidth(tableWidth, relative, absolute)
        : tableWidth;
      this.DistributeMaximum(tableWidth);
    } else {
      tableWidth ||= absolute;
      if (tableWidth < this.m_nMin) tableWidth = this.m_nMin & USHRT_MAX;
      absolute = Math.max(absolute, tableWidth);
      this.m_nRelTabWidth = relative
        ? relativeTableWidth(tableWidth, relative, absolute)
        : tableWidth;
      const available = tableWidth - this.m_nMin,
        difference = this.m_nMax - this.m_nMin || 1;
      let usedAbsolute = 0,
        usedRelative = 0;
      for (let index = 0; index < this.m_nCols - 1; ++index) {
        const column = this.LayoutColumn(index),
          width =
            column.GetMin() +
            Math.trunc(((column.GetMax() - column.GetMin()) * available) / difference),
          relWidth = relative ? (width * this.m_nRelTabWidth) / tableWidth : width;
        column.SetAbsColWidth(width);
        column.SetRelColWidth(relWidth);
        usedAbsolute += column.GetAbsColWidth();
        usedRelative += column.GetRelColWidth();
      }
      const last = this.LayoutColumn(this.m_nCols - 1);
      last.SetAbsColWidth(tableWidth - usedAbsolute);
      last.SetRelColWidth(this.m_nRelTabWidth - usedRelative);
    }

    this.m_nInhAbsLeftSpace = this.m_nInhAbsRightSpace = 0;
    if (!top && (this.m_nRelLeftFill || this.m_nRelRightFill || tableWidth < absolute))
      this.DistributeFill(
        (absolute - tableWidth) & USHRT_MAX,
        (relative - this.m_nRelTabWidth) & USHRT_MAX,
        leftFill,
        rightFill,
        leftSpace,
        rightSpace,
        parentInherited,
      );
  }

  /** Publishes the original width pass on actual content, container boxes and table formats. @param callPass2 - Recalculate against the supplied available widths. @param absolute - Native absolute availability. @param relative - Native relative availability. @param leftSpace - Parent cell left space. @param rightSpace - Parent cell right space. @param parentInherited - Parent inherited space. @returns Nothing. */
  SetWidths(
    callPass2 = false,
    absolute = 0,
    relative = 0,
    leftSpace = 0,
    rightSpace = 0,
    parentInherited = 0,
  ): void {
    this.m_nWidthSet = (this.m_nWidthSet + 1) & 255;
    if (callPass2) this.AutoLayoutPass2(absolute, relative, leftSpace, rightSpace, parentInherited);
    for (let row = 0; row < this.m_nRows; ++row) {
      for (let column = 0; column < this.m_nCols; ++column) {
        const cell = this.GetCell(row, column);
        if (cell === null) throw new Error("assert(layout cell)");
        const span = cell.GetColSpan();
        let contents = cell.GetContents();
        while (contents !== null && !contents.IsWidthSet(this.m_nWidthSet)) {
          const box = contents.GetTableBox();
          if (box !== null) this.SetBoxWidth(box, column, span);
          else {
            const table = contents.GetTable();
            if (table !== null) {
              const abs: [number] = [0],
                rel: [number] = [0];
              if (callPass2) this.GetAvail(column, span, abs, rel);
              table.SetWidths(
                callPass2,
                abs[0],
                rel[0],
                callPass2 ? this.GetLeftCellSpace(column, span) : 0,
                callPass2 ? this.GetRightCellSpace(column, span) : 0,
                callPass2 ? this.GetInhCellSpace(column, span) : 0,
              );
            }
          }
          contents.SetWidthSet(this.m_nWidthSet);
          contents = contents.GetNext();
        }
      }
    }

    const table = this.m_pSwTable;
    if (table === null) return;
    for (const line of table.GetTabLines()) resizeLine(line);
    const format = table.GetFrameFormat(),
      size = format.GetFrameSize().Clone();
    table.LockModify();
    try {
      size.SetWidth(this.m_nRelTabWidth);
      const useRelative =
        this.m_bUseRelWidth && format.GetHoriOrient().GetHoriOrient() !== HoriOrientation.FULL;
      size.SetWidthPercent(useRelative ? this.m_nWidthOption : 0);
      format.SetFormatAttr(size);
    } finally {
      size.Dispose();
      table.UnlockModify();
    }
    if (this.MayBeInFlyFrame()) {
      const fly = this.FindFlyFrameFormat();
      if (fly !== undefined) {
        const flySize = new SwFormatFrameSize(SwFrameSize.Variable, this.m_nRelTabWidth, MINLAY);
        try {
          if (this.m_bUseRelWidth) {
            flySize.SetWidth(Math.min(this.m_nMin, USHRT_MAX));
            flySize.SetWidthPercent(this.m_nWidthOption);
          }
          fly.SetFormatAttr(flySize);
        } finally {
          flySize.Dispose();
        }
      }
    }
  }

  /** Follows the first real content-box path through anonymous core box groups. @returns Original content start. */
  private GetAnyBoxStartNode(): SwStartNode {
    let box = this.m_pSwTable?.GetTabLines()[0]?.GetTabBoxes()[0];
    while (box !== undefined) {
      const start = box.GetSttNd();
      if (start !== null) return start;
      box = box.GetTabLines()[0]?.GetTabBoxes()[0];
    }
    throw new Error("assert(table content box)");
  }

  /** Resolves the actual enclosing fly through the original content box and table node. @returns Actual enclosing fly format or absent. */
  private FindFlyFrameFormat(): SwFrameFormat | undefined {
    const node = this.GetAnyBoxStartNode().FindTableNode();
    if (node === null) throw new Error("assert(table node)");
    return node.GetFlyFormat();
  }

  /** Dereferences an original populated column during layout. @param index - Native column index. @returns Actual column. */
  private LayoutColumn(index: number): SwHTMLTableLayoutColumn {
    const column = this.GetColumn(index);
    if (column === null) throw new Error("assert(layout column)");
    return column;
  }

  /** Preserves the source proportional minimum, optionally keeping native content and border minima. @param tableWidth - Actual absolute table width. @returns Nothing. */
  private DistributeConstrainedMinimum(tableWidth: number): void {
    const minima: number[] = [];
    let realMinimum = 0;
    for (let index = 0; index < this.m_nCols; ++index) {
      const minimum: [number] = [MINLAY];
      this.AddBorderWidth(minimum, [0], [0], index, 1);
      minima.push(minimum[0]);
      realMinimum += minimum[0];
    }
    const preserveMinima = realMinimum < tableWidth && realMinimum < this.m_nMin;
    let usedAbsolute = 0,
      usedRelative = 0;
    for (let index = 0; index < this.m_nCols - 1; ++index) {
      const column = this.LayoutColumn(index),
        columnMinimum = column.GetMin();
      if (preserveMinima) {
        const minimum = minima[index] as number,
          difference = this.m_nMin - realMinimum,
          weight = columnMinimum - minimum;
        const integral = columnMinimum <= USHRT_MAX;
        column.SetAbsColWidth(
          scaleMinimumDelta(weight, tableWidth - realMinimum, difference, minimum, integral),
        );
        column.SetRelColWidth(
          scaleMinimumDelta(
            weight,
            this.m_nRelTabWidth - realMinimum,
            difference,
            minimum,
            integral,
          ),
        );
      } else {
        column.SetAbsColWidth((columnMinimum * tableWidth) / this.m_nMin);
        column.SetRelColWidth((columnMinimum * this.m_nRelTabWidth) / this.m_nMin);
      }
      usedAbsolute += column.GetAbsColWidth();
      usedRelative += column.GetRelColWidth();
    }
    const last = this.LayoutColumn(this.m_nCols - 1);
    last.SetAbsColWidth(tableWidth - usedAbsolute);
    last.SetRelColWidth(this.m_nRelTabWidth - usedRelative);
  }

  /** Expands maximum widths, keeping fixed columns when relative options are mixed. @param tableWidth - Actual absolute table width. @returns Nothing. */
  private DistributeMaximum(tableWidth: number): void {
    let fixedMaximum = this.m_nMax;
    for (let index = 0; index < this.m_nCols; ++index) {
      const column = this.LayoutColumn(index);
      if (column.IsRelWidthOption() && column.GetWidthOption() > 0) fixedMaximum -= column.GetMax();
    }
    if (fixedMaximum > 0 && fixedMaximum < this.m_nMax) {
      let usedAbsolute = 0,
        usedRelative = 0,
        finished = 0;
      for (let index = 0; index < this.m_nCols; ++index) {
        const column = this.LayoutColumn(index);
        if (column.IsRelWidthOption() && column.GetWidthOption() > 0) continue;
        const width = column.GetMax();
        let relative = Math.trunc((width * this.m_nRelTabWidth) / tableWidth);
        const check = Math.trunc((relative * tableWidth) / this.m_nRelTabWidth);
        if (check < width) ++relative;
        else if (check > width) --relative;
        column.SetAbsColWidth(width);
        column.SetRelColWidth(relative);
        usedAbsolute += column.GetAbsColWidth();
        usedRelative += column.GetRelColWidth();
        ++finished;
      }
      const max = this.m_nMax - fixedMaximum,
        absolute = (tableWidth - usedAbsolute) & USHRT_MAX,
        relative = (this.m_nRelTabWidth - usedRelative) & USHRT_MAX;
      for (let index = 0; index < this.m_nCols; ++index) {
        const column = this.LayoutColumn(index);
        if (!column.IsRelWidthOption() || !column.GetWidthOption()) continue;
        if (++finished === this.m_nCols) {
          column.SetAbsColWidth(tableWidth - usedAbsolute);
          column.SetRelColWidth(this.m_nRelTabWidth - usedRelative);
        } else {
          column.SetAbsColWidth((column.GetMax() * absolute) / max);
          column.SetRelColWidth((column.GetMax() * relative) / max);
        }
        usedAbsolute += column.GetAbsColWidth();
        usedRelative += column.GetRelColWidth();
      }
    } else if (this.m_nCols > 0) {
      if (this.m_nMax === 0) throw new RangeError("division by zero");
      for (let index = 0; index < this.m_nCols; ++index) {
        const column = this.LayoutColumn(index);
        column.SetAbsColWidth((column.GetMax() * tableWidth) / this.m_nMax);
        column.SetRelColWidth((column.GetMax() * this.m_nRelTabWidth) / this.m_nMax);
      }
    }
  }

  /** Allocates the remaining native nested-table spaces and merges fillers that cannot own a box. @param absolute - Remaining absolute space. @param relative - Remaining relative space. @param left - Initial left filler. @param right - Initial right filler. @param leftSpace - Parent cell left space. @param rightSpace - Parent cell right space. @param inherited - Parent inherited space. @returns Nothing. */
  private DistributeFill(
    absolute: number,
    relative: number,
    left: number,
    right: number,
    leftSpace: number,
    rightSpace: number,
    inherited: number,
  ): void {
    let inheritedLeft = 0,
      inheritedRight = 0;
    switch (this.m_eTableAdjust) {
      case SvxAdjust.Right:
        left += absolute;
        this.m_nRelLeftFill += relative;
        inheritedLeft = inherited;
        break;
      case SvxAdjust.Center: {
        const leftAbsolute = absolute >> 1,
          leftRelative = relative >> 1;
        left += leftAbsolute;
        right += absolute - leftAbsolute;
        this.m_nRelLeftFill += leftRelative;
        this.m_nRelRightFill += relative - leftRelative;
        inheritedLeft = inherited >> 1;
        inheritedRight = inherited - inheritedLeft;
        break;
      }
      default:
        right += absolute;
        this.m_nRelRightFill += relative;
        inheritedRight = inherited;
    }
    left &= USHRT_MAX;
    right &= USHRT_MAX;
    this.m_nRelLeftFill &= USHRT_MAX;
    this.m_nRelRightFill &= USHRT_MAX;
    if (
      this.m_nRelLeftFill &&
      (this.m_nWidthSet > 0 ||
        left < MINLAY + this.m_nInhLeftBorderWidth ||
        (this.HasColTags() && left < leftSpace + inheritedLeft + 20))
    ) {
      const column = this.LayoutColumn(0);
      column.SetAbsColWidth(column.GetAbsColWidth() + left);
      column.SetRelColWidth(column.GetRelColWidth() + this.m_nRelLeftFill);
      this.m_nRelLeftFill = 0;
      this.m_nInhAbsLeftSpace = (leftSpace + inheritedLeft) & USHRT_MAX;
    }
    if (
      this.m_nRelRightFill &&
      (this.m_nWidthSet > 0 ||
        right < MINLAY + this.m_nInhRightBorderWidth ||
        (this.HasColTags() && right < rightSpace + inheritedRight + 20))
    ) {
      const column = this.LayoutColumn(this.m_nCols - 1);
      column.SetAbsColWidth(column.GetAbsColWidth() + right);
      column.SetRelColWidth(column.GetRelColWidth() + this.m_nRelRightFill);
      this.m_nRelRightFill = 0;
      this.m_nInhAbsRightSpace = (rightSpace + inheritedRight) & USHRT_MAX;
    }
  }
}
/** Native relative table-width calculation preserves the guarded zero denominator. @param width - Absolute table width. @param relative - Relative available width. @param absolute - Absolute available width. @returns Native uint16 result. */
function relativeTableWidth(width: number, relative: number, absolute: number): number {
  if (absolute === 0) throw new RangeError("division by zero");
  return ((width * relative) / absolute) & USHRT_MAX;
}

/** Recursively recalculates anonymous boxes from the last actual subline width, as the native width reference is replaced on each row. @param line - Actual Writer table line. @returns Width of the original line. */
function resizeLine(line: SwTableLine): number {
  let width = 0;
  for (const box of line.GetTabBoxes()) {
    const format = box.GetFrameFormat();
    if (box.GetSttNd() !== null) width += format.GetFrameSize().GetWidth();
    else {
      let boxWidth = 0;
      for (const lower of box.GetTabLines()) boxWidth = resizeLine(lower);
      const size = new SwFormatFrameSize(SwFrameSize.Variable, boxWidth, 0);
      try {
        format.SetFormatAttr(size);
      } finally {
        size.Dispose();
      }
      width += boxWidth;
    }
  }
  return width;
}

/** Keeps the native integral product width when the available delta or column delta wraps. @param weight - Column delta. @param available - Available delta. @param total - Total minimum delta. @param base - Native column baseline. @param integral - Source integer rather than double branch. @returns Scaled width before final uint16 storage. */
function scaleMinimumDelta(
  weight: number,
  available: number,
  total: number,
  base: number,
  integral: boolean,
): number {
  if (weight < 0 || available < 0) {
    const availableUnsigned = BigInt.asUintN(64, BigInt(available));
    if (integral) {
      const product = BigInt.asUintN(64, BigInt(weight) * availableUnsigned);
      return Number((product / BigInt(total) + BigInt(base)) & 65535n);
    }
    return Math.trunc((weight * Number(availableUnsigned)) / total + base);
  }
  return Math.trunc((weight * available) / total) + base;
}

/** Performs the original integral quotient over represented layout metrics. @param numerator - Native dividend. @param denominator - Nonzero native divisor, or the unchanged maximum sentinel. @returns Truncated result. */
function dividePass1(numerator: number, denominator: number): number {
  if (denominator === 0) throw new Error("division by zero in HTML table first pass");
  return Math.trunc(numerator / denominator);
}
