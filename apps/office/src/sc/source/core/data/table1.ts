/** @fileoverview Native SetOptimalHeightsToRows reducer over actual compressed row flags and calculated heights; drawing services remain unported. */
import type { ScPrintSaverTab } from "../tool/prnsave";
import { RangeDataType } from "../tool/rangenam";
import { ScOutlineTable } from "./olinetab";
import { Color } from "../../../../tools/inc/color";
import type { RowHeightContext } from "../../../inc/rowheightcontext";
import type { ScBitMaskCompressedArray } from "../../../inc/compressedarray";
import type { ScConditionalFormat } from "../../../inc/conditio";
import type { ScColumn } from "../../../inc/column";
import type { ScTable } from "../../../inc/table";
import type { ScDocument } from "../../../inc/document";
import type { RefUpdateContext } from "../../../inc/refupdatecontext";
import { ScRange } from "../../../inc/address";
import { UpdateRefMode } from "../../../inc/global";
import { CRFlags } from "../../../inc/global";

/** Allocates the original next key before taking ownership. @param this - Native sheet. @param format - Owned conditional format. @returns Assigned key. */
export function AddCondFormat(this: ScTable, format: ScConditionalFormat): number {
  const list = this.GetCondFormList();
  format.SetKey(list.getMaxKey() + 1);
  list.InsertNew(format);
  return format.GetKey();
}

/** Reports the native sheet visibility flag. @param this - Actual sheet. @returns Sheet visibility. */
export function IsVisible(this: ScTable): boolean {
  return this["bVisible"];
}

/** Changes visibility and invalidates the sheet stream when the flag changes. @param this - Actual sheet. @param visible - New visibility. @returns Nothing. */
export function SetVisible(this: ScTable, visible: boolean): void {
  if (this["bVisible"] !== visible) this.SetStreamValid(false);
  this["bVisible"] = visible;
}

/** Returns the original sheet color by value. @param this - Actual sheet. @returns Independent color. */
export function GetTabBgColor(this: ScTable): Color {
  return new Color(this["aTabBgColor"]);
}

/** Updates the original tab color and invalidates the sheet stream when it changes. @param this - Actual sheet. @param color - Tab color or automatic. @returns Nothing. */
export function SetTabBgColor(this: ScTable, color: Readonly<Color>): void {
  if (this["aTabBgColor"].equals(color)) return;
  this["aTabBgColor"] = new Color(color);
  this.SetStreamValid(false);
}

/** Borrows the ordered sheet areas for filter iteration. @param table - Native sheet. @returns Read-only area sequence. */
export function GetPrintRanges(table: ScTable): readonly ScRange[] {
  return table["aPrintRanges"];
}

/** Returns the original UInt16 count. @param this - Native sheet. @returns Area count. */
export function GetPrintRangeCount(this: ScTable): number {
  return this["aPrintRanges"].length;
}

/** Borrows the selected print area. @param this - Native sheet. @param index - Area index. @returns Area or undefined. */
export function GetPrintRange(this: ScTable, index: number): Readonly<ScRange> | undefined {
  return this["aPrintRanges"][index];
}

/** Tests whether the entire sheet is selected for printing. @param this - Native sheet. @returns Whole-sheet selection. */
export function IsPrintEntireSheet(this: ScTable): boolean {
  return this["bPrintEntireSheet"];
}

/** Copies the optional repeat interval on the original column axis. @param this - Native sheet. @returns Columns or undefined. */
export function GetRepeatColRange(this: ScTable): ScRange | undefined {
  return this["moRepeatColRange"] && new ScRange(this["moRepeatColRange"]);
}

/** Copies the optional repeat interval on the original row axis. @param this - Native sheet. @returns Rows or undefined. */
export function GetRepeatRowRange(this: ScTable): ScRange | undefined {
  return this["moRepeatRowRange"] && new ScRange(this["moRepeatRowRange"]);
}

/** Updates the original column title range and invalidates cached layout. @param this - Native sheet. @param range - Repeated columns, or undefined. @returns Nothing. */
export function SetRepeatColRange(this: ScTable, range?: ScRange): void {
  this["moRepeatColRange"] = range && new ScRange(range);
  this.SetStreamValid(false);
  this.InvalidatePageBreaks();
}

/** Updates the original row title range and invalidates cached layout. @param this - Native sheet. @param range - Repeated rows, or undefined. @returns Nothing. */
export function SetRepeatRowRange(this: ScTable, range?: ScRange): void {
  this["moRepeatRowRange"] = range && new ScRange(range);
  this.SetStreamValid(false);
  this.InvalidatePageBreaks();
}

/** Clears explicit and whole-sheet print selection. @param this - Native sheet. @returns Nothing. */
export function ClearPrintRanges(this: ScTable): void {
  this["aPrintRanges"].length = 0;
  this["bPrintEntireSheet"] = false;
  this.SetStreamValid(false);
  this.InvalidatePageBreaks();
}

/** Removes the sheet-local names that also designate print areas. @param this - Native sheet. @returns Nothing. */
export function ClearPrintNamedRanges(this: ScTable): void {
  const names = this.GetRangeName();
  for (const entry of names) if (entry.type & RangeDataType.PrintArea) names.erase(entry);
}

/** Enables the original exclusive whole-sheet print selection. @param this - Native sheet. @returns Nothing. */
export function SetPrintEntireSheet(this: ScTable): void {
  if (!this.IsPrintEntireSheet()) {
    this.ClearPrintRanges();
    this["bPrintEntireSheet"] = true;
  }
}

/** Appends an explicit print area within the native UInt16 limit. @param this - Native sheet. @param range - Print area. @returns Nothing. */
export function AddPrintRange(this: ScTable, range: ScRange): void {
  this["bPrintEntireSheet"] = false;
  if (this.GetPrintRangeCount() < 0xffff) this["aPrintRanges"].push(new ScRange(range));
  this.SetStreamValid(false);
  this.InvalidatePageBreaks();
}
/** Copies an original sheet's print data into its workbook snapshot entry. @param this - Native sheet. @param saver - Sheet snapshot. @returns Nothing. */
export function FillPrintSaver(this: ScTable, saver: ScPrintSaverTab): void {
  saver.SetAreas(
    this["aPrintRanges"].map((range) => new ScRange(range)),
    this.IsPrintEntireSheet(),
  );
  saver.SetRepeat(this.GetRepeatColRange(), this.GetRepeatRowRange());
}

/** Restores an original sheet's print data and clears page layout caches. @param this - Native sheet. @param saver - Sheet snapshot. @returns Nothing. */
export function RestorePrintRanges(this: ScTable, saver: ScPrintSaverTab): void {
  this["aPrintRanges"].length = 0;
  for (const range of saver.ranges) this["aPrintRanges"].push(new ScRange(range));
  this["bPrintEntireSheet"] = saver.entire;
  this.SetRepeatColRange(saver.columns);
  this.SetRepeatRowRange(saver.rows);
}

/** Applies native grouping, manual/force flags and extra-height semantics. @param context - Shared calculation. @param apply - Actual sheet height mutation. @param flags - Row flags. @param first - First row. @param last - Last row. @param api - Allow interactive single-row shrinking. @returns Whether geometry changed. */
export function SetOptimalHeightsToRows(
  context: RowHeightContext,
  apply: (first: number, last: number, height: number, api: boolean) => boolean,
  flags: ScBitMaskCompressedArray,
  first: number,
  last: number,
  api: boolean,
): boolean {
  let changed = false,
    start = 0,
    end = 0,
    previous = 0;
  const extra = context.getExtraHeight(),
    heights = context.getHeightArray();
  for (let row = first; row <= last;) {
    const region = flags.GetRangeData(row),
      stop = Math.min(last, region.mnRow2);
    const automatic = !(region.maValue & CRFlags.ManualSize);
    if (automatic || context.isForceAutoSize()) {
      if (extra) {
        if (automatic) flags.SetValue(row, stop, region.maValue | CRFlags.ManualSize);
      } else if (!automatic) flags.SetValue(row, stop, region.maValue & ~CRFlags.ManualSize);
      for (let inner = row; inner <= stop; inner++) {
        if (previous) {
          const run = heights.GetRangeData(inner);
          if (run.maValue + extra === previous) {
            end = Math.min(stop, run.mnRow2);
            inner = run.mnRow2;
          } else {
            changed = apply(start, end, previous, api) || changed;
            previous = 0;
          }
        }
        if (!previous) {
          previous = (heights.GetValue(inner) + extra) & 0xffff;
          start = inner;
          end = inner;
        }
      }
    } else {
      if (previous) changed = apply(start, end, previous, api) || changed;
      previous = 0;
    }
    row = stop + 1;
  }
  if (previous) changed = apply(start, end, previous, api) || changed;
  return changed;
}

/** Original table1 copy-reference traversal over allocated columns;drawing,names,printing and validation owners remain unrepresented. @param this - Actual native owner. @param context - Native context. @param undo - Undo document. @param includeDraw - Original default. @param updateNoteCaptionPos - Original default. @returns Nothing. */
export function UpdateReference(
  this: ScTable,
  context: RefUpdateContext,
  undo: ScDocument | null = null,
  includeDraw = true,
  updateNoteCaptionPos = true,
): void {
  void includeDraw;
  void updateNoteCaptionPos;
  if (context.meMode !== UpdateRefMode.URM_COPY)
    throw new Error("Non-copy table reference updates are not implemented");
  const last = Math.min(context.maRange.aEnd.Col(), this.GetAllocatedColumnsCount() - 1);
  for (let col = Math.max(0, context.maRange.aStart.Col()); col <= last; ++col)
    (this["aCol"][col] as ScColumn).UpdateReference(context, undo);
  this["mpCondFormatList"]?.UpdateReference(context);
}

/** Original stream validity short circuit and lock/default ordering. @param this - Actual sheet. @param value - New state. @param ignoreLock - Resolved native argument. @returns Nothing. */
export function SetStreamValid(this: ScTable, value: boolean, ignoreLock = false): void {
  if (!this["bStreamValid"] && !value) return;
  if (ignoreLock || !this["rDocument"].IsStreamValidLocked()) this["bStreamValid"] = value;
}

/** Original table1.cxx connected-area expansion and shrinking. Uses the real uncached HasDataAt overload;native iterator hints only optimize lookup. @param this - Actual sheet. @param firstCol - Start column reference. @param firstRow - Start row reference. @param lastCol - End column reference. @param lastRow - End row reference. @param includeOld - Retain original bounds. @param onlyDown - Change only final row. @returns Nothing. */
export function GetDataArea(
  this: ScTable,
  firstCol: [number],
  firstRow: [number],
  lastCol: [number],
  lastRow: [number],
  includeOld: boolean,
  onlyDown: boolean,
): void {
  firstCol[0] = Math.min(firstCol[0], this["aCol"].length - 1);
  lastCol[0] = Math.min(lastCol[0], this["aCol"].length - 1);
  let left = false,
    right = false,
    top = false,
    bottom = false,
    changed: boolean;
  do {
    changed = false;
    if (!onlyDown) {
      let start = firstRow[0],
        end = lastRow[0];
      if (start > 0) --start;
      if (end < this["rDocument"].MaxRow()) ++end;
      if (
        lastCol[0] < this["aCol"].length - 1 &&
        !(this["aCol"][lastCol[0] + 1] as ScColumn).IsEmptyData(start, end)
      ) {
        ++lastCol[0];
        changed = true;
        right = true;
      }
      if (firstCol[0] > 0 && !(this["aCol"][firstCol[0] - 1] as ScColumn).IsEmptyData(start, end)) {
        --firstCol[0];
        changed = true;
        left = true;
      }
      if (firstRow[0] > 0) {
        let extend = false;
        for (let col = firstCol[0]; col <= lastCol[0] && !extend; col++)
          if ((this["aCol"][col] as ScColumn).HasDataAt(firstRow[0] - 1)) extend = true;
        if (extend) {
          --firstRow[0];
          changed = true;
          top = true;
        }
      }
    }
    if (lastRow[0] < this["rDocument"].MaxRow()) {
      let extend = false;
      for (let col = firstCol[0]; col <= lastCol[0] && !extend; col++)
        if ((this["aCol"][col] as ScColumn).HasDataAt(lastRow[0] + 1)) extend = true;
      if (extend) {
        ++lastRow[0];
        changed = true;
        bottom = true;
      }
    }
  } while (changed);
  if (!includeOld && !onlyDown) {
    if (!left)
      while (
        firstCol[0] < lastCol[0] &&
        firstCol[0] < this["aCol"].length - 1 &&
        (this["aCol"][firstCol[0]] as ScColumn).IsEmptyData(firstRow[0], lastRow[0])
      )
        ++firstCol[0];
    if (!right)
      while (
        lastCol[0] > 0 &&
        firstCol[0] < lastCol[0] &&
        (this["aCol"][lastCol[0]] as ScColumn).IsEmptyData(firstRow[0], lastRow[0])
      )
        --lastCol[0];
    if (!top && firstRow[0] < this["rDocument"].MaxRow() && firstRow[0] < lastRow[0]) {
      let shrink = true;
      do {
        for (let col = firstCol[0]; col <= lastCol[0] && shrink; col++)
          if ((this["aCol"][col] as ScColumn).HasDataAt(firstRow[0])) shrink = false;
        if (shrink) ++firstRow[0];
      } while (shrink && firstRow[0] < this["rDocument"].MaxRow() && firstRow[0] < lastRow[0]);
    }
  }
  if (!includeOld && !bottom && lastRow[0] > 0 && firstRow[0] < lastRow[0]) {
    const last = this.GetLastDataRow(firstCol[0], lastCol[0], lastRow[0]);
    if (last < lastRow[0]) lastRow[0] = Math.max(firstRow[0], last);
  }
}

/** Borrows the sheet's outline. @param this - Source sheet. @returns Allocated outline, if present. */
export function GetOutlineTable(this: ScTable): ScOutlineTable | undefined {
  return this["pOutlineTable"];
}

/** Allocates the original outline lazily. @param this - Source sheet. @returns Outline. */
export function StartOutlineTable(this: ScTable): ScOutlineTable {
  return (this["pOutlineTable"] ??= new ScOutlineTable());
}

/** Replaces or clears the canonical sheet outline. @param this - Source sheet. @param outline - Owned outline. @returns Nothing. */
export function SetOutlineTable(this: ScTable, outline?: ScOutlineTable): void {
  this["pOutlineTable"] = outline;
}
