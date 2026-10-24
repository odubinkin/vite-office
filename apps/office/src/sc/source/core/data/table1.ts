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
