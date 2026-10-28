/** @fileoverview Native SetOptimalHeightsToRows reducer over actual compressed row flags and calculated heights; drawing services remain unported. */
import type { RowHeightContext } from "../../../inc/rowheightcontext";
import type { ScBitMaskCompressedArray } from "../../../inc/compressedarray";
import type { ScColumn } from "../../../inc/column";
import type { ScTable } from "../../../inc/table";
import type { ScDocument } from "../../../inc/document";
import type { RefUpdateContext } from "../../../inc/refupdatecontext";
import { UpdateRefMode } from "../../../inc/global";
import { CRFlags } from "../../../inc/global";
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
export function SetStreamValid(this: ScTable, value: boolean, ignoreLock: boolean): void {
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
