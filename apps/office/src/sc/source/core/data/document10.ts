/** @fileoverview Original document10.cxx delayed formula-group ownership and regroup routing. */
import { UpdateScriptTypes } from "./column4";
import { RefUpdateContext } from "../../../inc/refupdatecontext";
import { UpdateRefMode } from "../../../inc/global";

import type { CopyFromClipContext } from "../../../inc/clipcontext";
import type { ScMarkData } from "../../../inc/markdata";
import type { ColumnSpanSet } from "../../../inc/columnspanset";
import type { ScColumn } from "../../../inc/column";
import { ColumnBlockPositionSet } from "../../../inc/mtvelements";
import { StartListeningContext, EndListeningContext } from "../../../inc/listenercontext";
import type { ScTable } from "../../../inc/table";
import { ScAddress, ScRange } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import type { ScFormulaCell } from "../../../inc/formulacell";
/** Original merged-anchor query returns false for an absent sheet and delegates otherwise. @param this - Actual document. @param position - Queried cell. @returns Merged anchor. */
export function IsMerged(this: ScDocument, position: ScAddress): boolean {
  const table = this.FetchTable(position.Tab());
  if (!table) return false;
  return table.IsMerged(position.Col(), position.Row());
}
/** Original range/coordinate regroup overloads operate on the same document's actual sheets. @param this - Actual document. @param args - Native range or sheet/column. @returns Nothing. */
export function RegroupFormulaCells(this: ScDocument, ...args: [ScRange] | [number, number]): void {
  if (args[0] instanceof ScRange) {
    const range = args[0];
    for (let tab = range.aStart.Tab(); tab <= range.aEnd.Tab(); tab++)
      for (let col = range.aStart.Col(); col <= range.aEnd.Col(); col++)
        this.RegroupFormulaCells(tab, col);
  } else this.FetchTable(args[0])?.RegroupFormulaCells(args[1] as number);
}
/** Original nullable range owns delayed grouping without a replacement queue. @param this - Actual document. @param delay - Delay flag. @returns Nothing. */
export function DelayFormulaGrouping(this: ScDocument, delay: boolean): void {
  if (delay) this["pDelayedFormulaGrouping"] ??= new ScRange(ScAddress.INITIALIZE_INVALID);
  else {
    const range = this["pDelayedFormulaGrouping"];
    if (range?.IsValid()) this.RegroupFormulaCells(range);
    this["pDelayedFormulaGrouping"] = null;
  }
}
/** Original delayed range grows only when a member lies outside its current bounds. @param this - Actual document with active delay. @param cell - Formula cell. @returns Nothing. */
export function AddDelayedFormulaGroupingCell(this: ScDocument, cell: ScFormulaCell): void {
  const range = this["pDelayedFormulaGrouping"] as ScRange;
  if (!range.Contains(cell.aPos)) range.ExtendTo(new ScRange(cell.aPos));
}

/** Original document10 pooled-resource sharing uses genuine owners and initializes the source helper first. @param this - Destination document. @param source - Source document. @returns Nothing. */
export function SharePooledResources(this: ScDocument, source: ScDocument): void {
  const next = source["mxPoolHelper"],
    previous = this["mxPoolHelper"];
  next?.acquire(); // Original rtl::Reference::set also retains/releases on same-body assignment.
  this["mxPoolHelper"] = next;
  previous?.release();
  this["mpCellStringPool"] = source["mpCellStringPool"];
  source.getCellAttributeHelper();
  this["mpCellAttributeHelper"] = source["mpCellAttributeHelper"];
}

/** Original document10 pre-paste deletion cycles actual sparse clipboard tabs only for selected existing destinations. @param this - Destination document. @param context - Paste context. @param marks - Native selected tabs. @param broadcasts - Deferred changed spans. @returns Nothing. */
export function DeleteBeforeCopyFromClip(
  this: ScDocument,
  context: CopyFromClipContext,
  marks: ScMarkData,
  broadcasts: ColumnSpanSet,
): void {
  let clipTab = 0;
  const clip = context.getClipDoc(),
    count = clip.GetTableCount();
  for (let tab = context.getTabStart(); tab <= context.getTabEnd(); ++tab) {
    const table = this.FetchTable(tab);
    if (!table || !marks.GetTableSelect(tab)) continue;
    // A populated clipboard is the original caller precondition.
    while (!clip.FetchTable(clipTab)) clipTab = (clipTab + 1) % count;
    table.DeleteBeforeCopyFromClip(context, clip.FetchTable(clipTab) as ScTable, broadcasts);
    clipTab = (clipTab + 1) % count;
  }
}

/** Original per-column listening delay keeps the actual adjacent row span and flushes before erasing it. @param this - Actual document. @param column - Actual column. @param delay - Enable or finish. @returns Nothing. */
export function EnableDelayStartListeningFormulaCells(
  this: ScDocument,
  column: ScColumn,
  delay: boolean,
): void {
  const pending = this["pDelayedStartListeningFormulaCells"];
  if (delay) {
    if (!pending.has(column)) pending.set(column, [-1, -1]);
  } else {
    const span = pending.get(column);
    if (span) {
      if (span[0] !== -1) {
        const positions = new ColumnBlockPositionSet(this),
          start = new StartListeningContext(this, positions),
          end = new EndListeningContext(this, positions);
        column.StartListeningFormulaCells(start, end, span[0], span[1]);
      }
      pending.delete(column);
    }
  }
}
/** Original delay accepts overlapping/adjacent intervals and rejects disjoint intervals without changing the pending span. @param this - Actual document. @param column - Actual column. @param first - First row. @param last - Last row. @returns Deferred. */
export function CanDelayStartListeningFormulaCells(
  this: ScDocument,
  column: ScColumn,
  first: number,
  last: number,
): boolean {
  const pending = this["pDelayedStartListeningFormulaCells"],
    span = pending.get(column);
  if (!span) return false;
  if (span[0] === -1 && span[1] === -1) pending.set(column, [first, last]);
  else {
    if (first > span[1] + 1 || last < span[0] - 1) return false;
    span[0] = Math.min(span[0], first);
    span[1] = Math.max(span[1], last);
  }
  return true;
}

/** Original delay toggle flushes allocated sheets only when leaving delay. @param this - Actual document. @param delay - Enable or flush. @returns Nothing. */
export function EnableDelayDeletingBroadcasters(this: ScDocument, delay: boolean): void {
  if (this["bDelayedDeletingBroadcasters"] === delay) return;
  this["bDelayedDeletingBroadcasters"] = delay;
  if (!delay) for (const table of this["maTabs"]) table?.DeleteEmptyBroadcasters();
}
/** Original copied-range completion shares native block cursors across populated sheets. @param this - Actual document. @param range - Copied range. @returns Nothing. */
export function StartAllListeners(this: ScDocument, range: ScRange): void {
  if (this.IsClipOrUndo() || this.GetNoListening()) return;
  const positions = new ColumnBlockPositionSet(this),
    start = new StartListeningContext(this, positions),
    end = new EndListeningContext(this, positions);
  for (let tab = range.aStart.Tab(); tab <= range.aEnd.Tab(); ++tab) {
    const table = this.FetchTable(tab);
    if (!table) continue;
    table.StartListeningFormulaCells(
      start,
      end,
      range.aStart.Col(),
      range.aStart.Row(),
      range.aEnd.Col(),
      range.aEnd.Row(),
    );
  }
}

/** Original document10 single-row fast path through native context preparation,real table/column copying and original reference completion. Notes/sparklines have no represented stores in this CONTENTS slice and no fake getters are installed. @param this - Actual destination. @param context - Actual paste context. @param col1 - First destination column. @param row1 - First destination row. @param col2 - Last destination column. @param row2 - Last destination row. @returns Whether this native fast path handled the source. */
export function CopyOneCellFromClip(
  this: ScDocument,
  context: CopyFromClipContext,
  col1: number,
  row1: number,
  col2: number,
  row2: number,
): boolean {
  const clip = context.getClipDoc();
  if (clip.GetClipParam().mbCutMode) return false;
  const range = clip.GetClipParam().getWholeRange();
  if (range.aStart.Row() !== range.aEnd.Row()) return false;
  const width = range.aEnd.Col() - range.aStart.Col() + 1;
  if (col2 - col1 + 1 < width) return false;
  if (clip.GetTableCount() > 1) return false;
  const source = new ScAddress(range.aStart);
  for (let col = range.aStart.Col(); col <= range.aEnd.Col(); ++col) {
    const test = new ScAddress(source);
    test.SetCol(col);
    if (clip.IsMerged(test)) return false;
  }
  const table = clip.FetchTable(source.Tab());
  if (!table) return false;
  context.setSingleCellColumnSize(width);
  for (let offset = 0; offset < width; ++offset, source.IncCol()) {
    context.setSingleCellPattern(offset, clip.GetPattern(source));
    const column = table.FetchColumn(source.Col());
    if (!column) throw Error("Clipboard source column assertion");
    UpdateScriptTypes.call(column, source.Row(), source.Row());
    context.setSingleCell(source, column);
  }
  const end = context.getTabEnd();
  for (let tab = context.getTabStart(); tab <= end && tab < this.GetTableCount(); ++tab) {
    const target = this.FetchTable(tab);
    if (!target) throw Error("Clipboard destination table assertion");
    target.CopyOneCellFromClip(context, col1, row1, col2, row2, range.aStart.Row(), table);
  }
  const update = new RefUpdateContext(this);
  update.maRange.assign(new ScRange(col1, row1, context.getTabStart(), col2, row2, end));
  update.mnColDelta = col1 - source.Col();
  update.mnRowDelta = row1 - source.Row();
  update.mnTabDelta = context.getTabStart() - source.Tab();
  update.meMode = UpdateRefMode.URM_COPY;
  this.UpdateReference(update, context.getUndoDoc(), false);
  return true;
}
