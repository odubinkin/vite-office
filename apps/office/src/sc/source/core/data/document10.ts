/** @fileoverview Original document10.cxx delayed formula-group ownership and regroup routing. */
import { EndListeningIntersectedGroups as endTableGroups } from "./table7";
import { StartListeners, SetDirtyIncludingEmptyCells as dirtyColumn } from "./column3";
import { UpdateScriptTypes } from "./column4";
import { AutoCalcSwitch } from "../../../inc/scopetools";
import { ScBulkBroadcast } from "../inc/bcaslot";
import { SfxHintId } from "../../../../svl/inc/hint";
import { ScRangeList } from "../../../inc/rangelst";
import { InsertDeleteFlags } from "../../../inc/global";
import { MAXTAB, ValidTab } from "../../../inc/address";
import { BroadcastAction } from "./documen7";
import { ExtendMerge as extendTableMerge } from "./table2";
import { RefUpdateContext } from "../../../inc/refupdatecontext";
import { UpdateRefMode } from "../../../inc/global";

import { CopyToDocContext, CopyFromClipContext } from "../../../inc/clipcontext";
import type { ScMarkData } from "../../../inc/markdata";
import { ColumnSpanSet } from "../../../inc/columnspanset";
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

/** Original document.cxx single-sheet clipboard listener forwarding,partitioned on the same ScDocument instance. @param this - Actual document. @param start - Actual start context. @param end - Actual end context. @param tab - Sheet. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @returns Nothing. */
export function StartListeningFromClip(
  this: ScDocument,
  start: StartListeningContext,
  end: EndListeningContext,
  tab: number,
  col1: number,
  row1: number,
  col2: number,
  row2: number,
): void {
  this.FetchTable(tab)?.StartListeningFormulaCells(start, end, col1, row1, col2, row2);
}
/** Original getMarkedTableRange sentinel/default and ascending selected-sheet traversal. @param doc - Actual document. @param marks - Actual marks. @returns First and last populated selected sheets. */
function getMarkedTableRange(doc: ScDocument, marks: ScMarkData): [number, number] {
  let first = MAXTAB,
    last = 0;
  for (const tab of marks.GetSelectedTabs()) {
    if (tab >= doc.GetTableCount()) break;
    if (!doc.FetchTable(tab)) continue;
    if (tab < first) first = tab;
    last = tab;
  }
  return [first, last];
}
/** Original document non-refresh merge extension through actual tables;refresh/filter services are outside this consumed path. @param this - Clipboard. @param col - First column. @param row - First row. @param endCol - Last column output. @param endRow - Last row output. @param tab - Source sheet. @returns Merge found. */
export function ExtendMerge(
  this: ScDocument,
  col: number,
  row: number,
  endCol: [number],
  endRow: [number],
  tab: number,
): boolean {
  if (!this.ValidColRow(col, row) || !this.ValidColRow(endCol[0], endRow[0]) || !ValidTab(tab))
    return false;
  const table = this.FetchTable(tab);
  return table ? extendTableMerge.call(table, col, row, endCol, endRow) : false;
}
/** Original nested formatter-merge scope on the actual document. Only the genuine same-formatter branch is admitted;foreign formatter merging has no dummy exchange map. */
class NumFmtMergeHandler {
  /** Runs original formatter queries before their identity check. @param doc - Actual destination. @param source - Clipboard source. @returns Scope. */
  constructor(
    private readonly doc: ScDocument,
    source: ScDocument,
  ) {
    const own = doc.GetFormatTable(),
      other = source.GetFormatTable();
    if (other !== own) throw Error("Foreign number-formatter merging is not implemented");
  }
  /** Original destructor clears the borrowed exchange-table pointer. @returns Nothing. */
  Dispose(): void {
    this.doc["pFormatExchangeList"] = null;
  }
}
/** Original document.cxx CopyFromClip control flow over actual default-CONTENTS owners. Physical partition onto this ScDocument source module preserves its instance/state contracts. Attribute preallocation is unreachable in this admitted context;global clipboard lookup,foreign formatter merge and nondefault paste remain explicit boundaries. @param this - Actual destination. @param destination - Overall destination rectangle. @param marks - Native selected sheets. @param flags - Native insertion flags. @param undo - Reference Undo or null. @param clip - Actual clipboard or unsupported global lookup null. @param resetCut - Original defaulttrue. @param asLink - Original defaultfalse. @param includeFiltered - Original defaulttrue. @param skipEmpty - Original defaultfalse. @param destinations - Native optional destination ranges. @returns Nothing. */
export function CopyFromClip(
  this: ScDocument,
  destination: ScRange,
  marks: ScMarkData,
  flags: InsertDeleteFlags,
  undo: ScDocument | null,
  clip: ScDocument | null,
  resetCut = true,
  asLink = false,
  includeFiltered = true,
  skipEmpty = false,
  destinations: ScRangeList | null = null,
): void {
  if (this.IsClipboard()) return;
  if (!clip) throw Error("Global clipboard lookup is not implemented");
  if (!clip.IsClipboard() || !clip.GetTableCount()) return;
  const autoCalc = new AutoCalcSwitch(this, false);
  let merge: NumFmtMergeHandler | null = null,
    context: CopyFromClipContext | null = null;
  try {
    merge = new NumFmtMergeHandler(this, clip);
    const range = clip.GetClipParam().getWholeRange();
    let width = 0,
      height = 0;
    for (let tab = 0; tab < clip.GetTableCount(); ++tab) {
      if (!clip.FetchTable(tab)) continue;
      const endCol: [number] = [range.aEnd.Col()],
        endRow: [number] = [range.aEnd.Row()];
      ExtendMerge.call(clip, range.aStart.Col(), range.aStart.Row(), endCol, endRow, tab);
      width = Math.max(width, endCol[0] - range.aEnd.Col());
      height = Math.max(height, endRow[0] - range.aEnd.Row());
    }
    const cols: [number] = [0],
      rows: [number] = [0];
    clip.GetClipArea(cols, rows, includeFiltered);
    width += cols[0];
    height += rows[0];
    let deletion = flags;
    if (flags & InsertDeleteFlags.CONTENTS) deletion |= InsertDeleteFlags.FORMULA;
    if (
      (flags & (InsertDeleteFlags.CONTENTS | InsertDeleteFlags.ADDNOTES)) ===
      (InsertDeleteFlags.NOTE | InsertDeleteFlags.ADDNOTES)
    )
      deletion &= ~InsertDeleteFlags.NOTE;
    if (flags & InsertDeleteFlags.ATTRIB) deletion |= InsertDeleteFlags.ATTRIB;
    context = new CopyFromClipContext(this, undo, clip, flags, asLink, skipEmpty);
    const tabs = getMarkedTableRange(this, marks);
    context.setTabRange(tabs[0], tabs[1]);
    context.setDeleteFlag(deletion);
    const local = new ScRangeList();
    if (!destinations) {
      local.push_back(destination);
      destinations = local;
    }
    this.SetInsertingFromOtherDoc(true);
    const broadcasts = new ColumnSpanSet();
    const clipCol = range.aStart.Col(),
      clipEnd = range.aEnd.Row();
    let clipRow = range.aStart.Row();
    try {
      for (const target of destinations) {
        const col1 = target.aStart.Col(),
          row1 = target.aStart.Row(),
          col2 = target.aEnd.Col(),
          row2 = target.aEnd.Row();
        context.setDestRange(col1, row1, col2, row2);
        this.DeleteBeforeCopyFromClip(context, marks, broadcasts);
        if (CopyOneCellFromClip.call(this, context, col1, row1, col2, row2)) continue;
        let c1 = col1,
          r1 = row1,
          c2 = Math.min(c1 + width, col2),
          r2 = Math.min(r1 + height, row2);
        do {
          const saved = clipRow;
          do {
            clipRow = saved;
            const dx = c1 - clipCol,
              dy = r1 - clipRow;
            if (includeFiltered) {
              this.CopyBlockFromClip(context, c1, r1, c2, r2, marks, dx, dy);
              clipRow += r2 - r1 + 1;
            } else {
              const cursor: [number] = [clipRow];
              this.CopyNonFilteredFromClip(context, c1, r1, c2, r2, marks, dx, cursor, clipEnd);
              clipRow = cursor[0];
            }
            c1 = c2 + 1;
            c2 = Math.min(c1 + width, col2);
          } while (c1 <= col2);
          if (clipRow > clipEnd) clipRow = range.aStart.Row();
          c1 = col1;
          c2 = Math.min(c1 + width, col2);
          r1 = r2 + 1;
          r2 = Math.min(r1 + height, row2);
        } while (r1 <= row2);
      }
    } finally {
      this.SetInsertingFromOtherDoc(false);
    }
    // The actual context constructor admits exactly CONTENTS,so the native content guard is proven true here.
    for (const tab of marks.GetSelectedTabs())
      context.setListeningFormulaSpans(
        tab,
        destination.aStart.Col(),
        destination.aStart.Row(),
        destination.aEnd.Col(),
        destination.aEnd.Row(),
      );
    context.startListeningFormulas();
    const bulk = new ScBulkBroadcast(this.GetBASM(), SfxHintId.ScDataChanged);
    try {
      this.SetDirtyFromClip(
        destination.aStart.Col(),
        destination.aStart.Row(),
        destination.aEnd.Col(),
        destination.aEnd.Row(),
        marks,
        flags,
        broadcasts,
      );
      broadcasts.executeColumnAction(this, new BroadcastAction(this));
    } finally {
      bulk.Dispose();
    }
    if (resetCut) clip.GetClipParam().mbCutMode = false;
  } finally {
    context?.Dispose();
    merge?.Dispose();
    autoCalc.Dispose();
  }
}

/** Original document.cxx clipboard range ownership,partitioned unchanged from the facade. @param this - Actual clipboard. @param range - Source range. @param cut - Original defaultfalse mode. @returns Nothing. */
export function SetClipArea(this: ScDocument, range: ScRange, cut = false): void {
  if (!this.IsClipboard()) return;
  const parameter = this.GetClipParam();
  parameter.maRanges.RemoveAll();
  parameter.maRanges.push_back(range);
  parameter.mbCutMode = cut;
}
/** Original document.cxx UndoToDocument overloads deliberately retain different auto-calc receivers,assertions,bounds and tail-copy sentinels. All CopyToDocument calls retain native geometry defaults. @param this - Actual source Undo document. @param args - Native range/flags/mark/destination or six coordinates/flags/mark/destination. @returns Nothing. */
export function UndoToDocument(
  this: ScDocument,
  ...args:
    | [ScRange, InsertDeleteFlags, boolean, ScDocument]
    | [number, number, number, number, number, number, InsertDeleteFlags, boolean, ScDocument]
): void {
  if (args[0] instanceof ScRange) {
    const [input, flags, marked, target] = args as [
      ScRange,
      InsertDeleteFlags,
      boolean,
      ScDocument,
    ];
    const autoCalc = new AutoCalcSwitch(this, false);
    try {
      const range = new ScRange(input);
      range.PutInOrder();
      const first = range.aStart.Tab(),
        last = range.aEnd.Tab(),
        context = new CopyToDocContext(target);
      if (first > 0)
        this.CopyToDocument(
          0,
          0,
          0,
          this.MaxCol(),
          this.MaxRow(),
          first - 1,
          InsertDeleteFlags.FORMULA,
          false,
          target,
        );
      const count = Math.min(this.GetTableCount(), target.GetTableCount());
      for (let tab = first; tab <= last && tab < count; ++tab) {
        const source = this.FetchTable(tab),
          destination = target.FetchTable(tab);
        if (source && destination)
          source.UndoToTable(
            context,
            range.aStart.Col(),
            range.aStart.Row(),
            range.aEnd.Col(),
            range.aEnd.Row(),
            flags,
            marked,
            destination,
          );
      }
      if (last < this.GetTableCount())
        this.CopyToDocument(
          0,
          0,
          last + 1,
          this.MaxCol(),
          this.MaxRow(),
          this.GetTableCount(),
          InsertDeleteFlags.FORMULA,
          false,
          target,
        );
    } finally {
      autoCalc.Dispose();
    }
    return;
  }
  const [x1, y1, t1, x2, y2, t2, flags, marked, target] = args as [
    number,
    number,
    number,
    number,
    number,
    number,
    InsertDeleteFlags,
    boolean,
    ScDocument,
  ];
  const col1 = Math.min(x1, x2),
    col2 = Math.max(x1, x2),
    row1 = Math.min(y1, y2),
    row2 = Math.max(y1, y2),
    first = Math.min(t1, t2),
    last = Math.max(t1, t2);
  if (!ValidTab(first) || !ValidTab(last)) return;
  const autoCalc = new AutoCalcSwitch(target, false);
  try {
    if (first > 0)
      this.CopyToDocument(
        0,
        0,
        0,
        this.MaxCol(),
        this.MaxRow(),
        first - 1,
        InsertDeleteFlags.FORMULA,
        false,
        target,
      );
    const context = new CopyToDocContext(target);
    if (last >= this.GetTableCount() || last >= target.GetTableCount())
      throw Error("UndoToDocument sheet-count assertion");
    for (let tab = first; tab <= last; ++tab) {
      const source = this.FetchTable(tab),
        destination = target.FetchTable(tab);
      if (source && destination)
        source.UndoToTable(context, col1, row1, col2, row2, flags, marked, destination);
    }
    if (last < MAXTAB)
      this.CopyToDocument(
        0,
        0,
        last + 1,
        this.MaxCol(),
        this.MaxRow(),
        MAXTAB,
        InsertDeleteFlags.FORMULA,
        false,
        target,
      );
  } finally {
    autoCalc.Dispose();
  }
}

/** Original document10 sparse-sheet boundary-group teardown through actual table7/column4 owners. @param this - Actual document. @param context - Shared end context. @param range - Native area. @param groups - Optional native outputs. @returns Nothing. */
export function EndListeningIntersectedGroups(
  this: ScDocument,
  context: EndListeningContext,
  range: ScRange,
  groups: ScAddress[] | null,
): void {
  for (let tab = range.aStart.Tab(); tab <= range.aEnd.Tab(); ++tab) {
    const table = this.FetchTable(tab);
    if (!table) continue;
    endTableGroups.call(
      table,
      context,
      range.aStart.Col(),
      range.aStart.Row(),
      range.aEnd.Col(),
      range.aEnd.Row(),
      groups,
    );
  }
}
/** Original document10 needs-listening marking returns at the first absent sheet. @param this - Actual document. @param groups - Actual group addresses. @returns Nothing. */
export function SetNeedsListeningGroups(this: ScDocument, groups: ScAddress[]): void {
  for (const address of groups) {
    const table = this.FetchTable(address.Tab());
    if (!table) return;
    if (this.ValidCol(address.Col()))
      table.CreateColumnIfNotExists(address.Col()).SetNeedsListeningGroup(address.Row());
  }
}
/** Original no-ColumnSet StartNeededListeners/Table::StartListeners path shares one real context and visits actual allocated columns. @param this - Actual document. @returns Nothing. */
export function StartNeededListeners(this: ScDocument): void {
  const context = new StartListeningContext(this);
  for (const table of this["maTabs"])
    if (table)
      for (let col = 0; col < table.GetAllocatedColumnsCount(); ++col)
        StartListeners.call(table.FetchColumn(col) as ScColumn, context, false);
}
/** Original document.cxx SetDirty include-empty branch with native table/column scopes and area-only final broadcast. Optional UNO/stream side effects remain unrepresented. @param this - Actual document. @param range - Native dirty area. @returns Nothing. */
export function SetDirtyIncludingEmptyCells(this: ScDocument, range: ScRange): void {
  const old = this.GetAutoCalc();
  this["bAutoCalc"] = false;
  const bulk = new ScBulkBroadcast(this.GetBASM(), SfxHintId.ScDataChanged);
  try {
    for (
      let tab = range.aStart.Tab();
      tab <= range.aEnd.Tab() && tab < this.GetTableCount();
      ++tab
    ) {
      const table = this.FetchTable(tab);
      if (!table) continue;
      const scope = new AutoCalcSwitch(this, false);
      try {
        for (
          let col = range.aStart.Col();
          col <= table.ClampToAllocatedColumns(range.aEnd.Col());
          ++col
        )
          dirtyColumn.call(
            table.FetchColumn(col) as ScColumn,
            range.aStart.Row(),
            range.aEnd.Row(),
          );
      } finally {
        scope.Dispose();
      }
    }
    this.BroadcastCells(range, SfxHintId.ScDataChanged, false);
  } finally {
    bulk.Dispose();
    this.SetAutoCalc(old);
  }
}
