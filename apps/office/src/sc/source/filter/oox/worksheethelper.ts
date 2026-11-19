/** @fileoverview WorksheetGlobals geometry models converted to the real Calc table. */
import { SC_OL_MAXDEPTH } from "../../core/data/olinetab";
import type { ScTable } from "../../../inc/table";
import type { UnitConverter } from "./unitconverter";

/** Original point-based row geometry before sheet conversion. */
interface OutlineModel {
  level: number;
  collapsed: boolean;
}

const defaultOutline: OutlineModel = { level: 0, collapsed: false };

/** Original point-based row geometry and outline state. */
interface RowModel extends OutlineModel {
  height: number;
  customHeight: boolean;
  hidden: boolean;
}
/** Original character-based column span after coordinate clipping. */
interface ColumnModel extends OutlineModel {
  first: number;
  last: number;
  width: number;
  hidden: boolean;
}

/** Source manual page break and its original cross-axis interval. */
export interface PageBreakModel {
  readonly position: number;
  readonly min: number;
  readonly max: number;
  readonly manual: boolean;
}

/** Collects source geometry before applying explicit models and default spans. */
export class WorksheetGlobals {
  private defaultColumnWidth = 8.5;
  private hasDefaultColumnWidth = false;
  private defaultRow: RowModel = {
    ...defaultOutline,
    height: 0,
    customHeight: false,
    hidden: false,
  };
  private readonly columns: ColumnModel[] = [];
  private readonly rows = new Map<number, RowModel>();

  /** Binds the models to a native sheet. @param sheet - Table. @param microsoft - Original generator classification. @param units - Workbook unit converter. @returns Geometry owner. */
  constructor(
    private readonly sheet: ScTable,
    private readonly microsoft: boolean,
    private readonly units: UnitConverter,
  ) {}

  /** Applies the original whole-row or whole-column break. @param model - Worksheet break. @param rowBreak - Whether the break precedes a row. @returns Nothing. */
  setPageBreak(model: PageBreakModel, rowBreak: boolean): void {
    if (!model.manual || model.position <= 0) return;
    if (rowBreak) this.sheet.SetRowBreak(model.position, false, true);
    else this.sheet.SetColBreak(model.position, false, true);
  }

  /** Applies the default column width with the source five-pixel base correction. @param base - Base digit count. @param width - Explicit default width. @returns Nothing. */
  setDefaultColumnWidth(base: number, width: number): void {
    if (!this.hasDefaultColumnWidth && base > 0)
      this.defaultColumnWidth =
        base + (5 * this.units.twipsPerScreenPixel) / this.units.twipsPerDigit;
    if (width > 0) {
      this.defaultColumnWidth = width;
      this.hasDefaultColumnWidth = true;
    }
  }

  /** Records the source default row. @param height - Points. @param customHeight - Manual height. @param hidden - Default visibility flag. @returns Nothing. */
  setDefaultRowSettings(height: number, customHeight: boolean, hidden: boolean): void {
    this.defaultRow = {
      ...defaultOutline,
      height: this.adjustRowHeight(height),
      customHeight,
      hidden,
    };
  }

  /** Clips source intervals and retains the first submitted model on overlap. @param first - First zero-based column. @param last - Last zero-based column. @param width - Digit count. @param hidden - Hidden flag. @param level - XLSX outline level. @param collapsed - Closing collapse flag. @returns Accepted interval or null. */
  setColumnModel(
    first: number,
    last: number,
    width: number,
    hidden: boolean,
    level = 0,
    collapsed = false,
  ): ColumnModel | null {
    const doc = this.sheet.GetDoc();
    if (!doc.ValidCol(first) || first > last) return null;
    let insertion = this.columns.length;
    while (insertion > 0 && (this.columns[insertion - 1]?.first ?? -1) > first) --insertion;
    const previous = this.columns[insertion - 1];
    const next = this.columns[insertion];
    if (previous) first = Math.max(first, previous.last + 1);
    last = Math.min(last, next ? next.first - 1 : doc.MaxCol());
    if (first > last) return null;
    const model = { first, last, width, hidden, level, collapsed };
    this.columns.splice(insertion, 0, model);
    return model;
  }

  /** Records the first valid model at a row. @param row - Zero-based index. @param height - Points or absence sentinel. @param customHeight - Manual flag. @param hidden - Hidden flag. @param level - XLSX outline level. @param collapsed - Closing collapse flag. @returns Nothing. */
  setRowModel(
    row: number,
    height: number,
    customHeight: boolean,
    hidden: boolean,
    level = 0,
    collapsed = false,
  ): void {
    if (this.sheet.GetDoc().ValidRow(row) && !this.rows.has(row))
      this.rows.set(row, {
        height: this.adjustRowHeight(height),
        customHeight,
        hidden,
        level,
        collapsed,
      });
  }

  /** Reproduces Excel display increments for Microsoft-produced documents. @param height - Source points. @returns Effective points. */
  private adjustRowHeight(height: number): number {
    return this.microsoft && height > 0 ? height - (height % 0.75) : height;
  }

  /** Applies explicit models and fills intervening and trailing default spans. @returns Nothing. */
  finalizeImport(): void {
    const doc = this.sheet.GetDoc();
    const columnLevels: number[] = [],
      rowLevels: number[] = [];
    let column = 0;
    for (const model of this.columns) {
      if (column < model.first) {
        this.convertColumns(column, model.first - 1, this.defaultColumnWidth, false);
        this.convertOutlines(columnLevels, column, defaultOutline, false);
      }
      this.convertColumns(model.first, model.last, model.width, model.hidden);
      this.convertOutlines(columnLevels, model.first, model, false);
      column = model.last + 1;
    }
    this.convertColumns(column, doc.MaxCol(), this.defaultColumnWidth, false);
    this.convertOutlines(columnLevels, column, defaultOutline, false);
    this.sheet.SetOptimalMinRowHeight(Math.trunc(this.defaultRow.height * 20));
    let row = 0;
    const ordered = [...this.rows].sort(
      /** Orders source rows. @param a - First entry. @param b - Second entry. @returns Difference. */
      (a, b) => a[0] - b[0],
    );
    for (const [position, model] of ordered) {
      if (row < position) {
        this.convertRows(row, position - 1, this.defaultRow);
        this.convertOutlines(rowLevels, row, defaultOutline, true);
      }
      this.convertRows(position, position, model);
      this.convertOutlines(rowLevels, position, model, true);
      row = position + 1;
    }
    this.convertRows(row, doc.MaxRow(), this.defaultRow);
    this.convertOutlines(rowLevels, row, defaultOutline, true);
  }

  /** Opens groups and closes levels at a transition; only the first popped group uses the marker. @param starts - Open group starts. @param position - Source boundary. @param model - Outline fields. @param rows - Row orientation. @returns Nothing. */
  private convertOutlines(
    starts: number[],
    position: number,
    model: OutlineModel,
    rows: boolean,
  ): void {
    const level = Math.min(SC_OL_MAXDEPTH, Math.max(0, model.level));
    let collapsed = model.collapsed;
    while (starts.length > level) {
      const first = starts.pop() as number;
      this.groupColumnsOrRows(first, position - 1, collapsed, rows);
      collapsed = false;
    }
    while (starts.length < level) starts.push(position);
  }

  /** Applies the native group and hide-detail operations to the same outline owner. @param first - Start. @param last - End. @param collapse - Whether to hide detail. @param rows - Row orientation. @returns Nothing. */
  private groupColumnsOrRows(first: number, last: number, collapse: boolean, rows: boolean): void {
    const table = this.sheet.StartOutlineTable();
    const axis = rows ? table.GetRowArray() : table.GetColArray();
    axis.Insert(first, last);
    if (!collapse) return;
    // XSheetOutline::hideDetail considers both axes of the supplied cell range.
    for (const isRow of [false, true]) {
      const group = isRow ? table.GetRowArray() : table.GetColArray();
      const start = isRow === rows ? first : 0;
      const end = isRow === rows ? last : 0;
      const level = group.FindTouchedLevel(start, end) ?? 0;
      for (const entry of group.GetEntries(level)) {
        if (start > entry.end || end < entry.start) continue;
        entry.hidden = true;
        group.SetVisibleBelow(level, entry, false);
        if (isRow) this.sheet.SetRowHidden(entry.start, entry.end, true);
        else this.sheet.SetColHidden(entry.start, entry.end, true);
      }
    }
  }

  /** Applies a column span to native width and visibility. @param first - Start. @param last - End. @param width - Digit units. @param hidden - Hidden state. @returns Nothing. */
  private convertColumns(first: number, last: number, width: number, hidden: boolean): void {
    if (first > last) return;
    const twips = Math.round(width * this.units.twipsPerDigit);
    if (twips > 0)
      for (let column = first; column <= last; ++column) this.sheet.SetColWidthOnly(column, twips);
    if (hidden) this.sheet.SetColHidden(first, last, true);
  }

  /** Applies a row span to native height, manual state and visibility. @param first - Start. @param last - End. @param model - Source row model. @returns Nothing. */
  private convertRows(first: number, last: number, model: RowModel): void {
    if (first > last) return;
    const twips = Math.round(20 * (model.height >= 0 ? model.height : this.defaultRow.height));
    if (twips > 0) {
      this.sheet.SetRowHeightOnly(first, last, twips);
      if (model.customHeight) this.sheet.SetManualHeight(first, last, true);
    }
    if (model.hidden) this.sheet.SetRowHidden(first, last, true);
  }
}
