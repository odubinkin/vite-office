/** @fileoverview Consumed native out-of-class ScDocument dependency methods from documen7/document.cxx. Each definition runs on the same ScDocument instance;literal private-member access bridges TypeScript class-file boundaries without another state model. */
import { ScRangeList } from "../../../inc/rangelst";
import { ScLineFlags, SC_LINE_DONTCARE } from "../../../inc/attarray";
import {
  SvxBoxItem,
  SvxBoxInfoItem,
  SvxBoxItemLine as Edge,
  SvxBoxInfoItemLine as InnerEdge,
  SvxBoxInfoItemValidFlags as Valid,
} from "../../../../editeng/source/items/frmitems";
import type { ColumnAction, ColumnSpanSet } from "../../../inc/columnspanset";
import type { ScColumn, ScColumnData } from "../../../inc/column";
import { ScMergePatternState } from "../../../inc/attarray";
import { ScPatternAttr, CellAttributeHolder } from "../../../inc/patattr";
import { SharedString } from "../../../../svl/inc/sharedstring";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { ScTable } from "../../../inc/table";
import type { CopyFromClipContext } from "../../../inc/clipcontext";
import { RefUpdateContext } from "../../../inc/refupdatecontext";
import type { ScMarkData } from "../../../inc/markdata";
import type { SvtBroadcaster } from "../../../../svl/source/notify/broadcast";
import type { SetFormulaDirtyContext } from "../../../inc/refupdatecontext";
import { CellType, HasAttrFlags, InsertDeleteFlags, UpdateRefMode } from "../../../inc/global";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { HardRecalcState, type ScDocument } from "./document";
import type { ScFormulaCell } from "../../../inc/formulacell";
import type { SvtListener } from "../../../../svl/source/notify/listener";
import { SfxHintId, type SfxHint } from "../../../../svl/inc/hint";
import { ScAddress, ScRange, ValidTab, BCA_LISTEN_ALWAYS, MAXTAB } from "../../../inc/address";
import { ScHint } from "../../../inc/brdcst";
import { ScBulkBroadcast } from "../inc/bcaslot";
import type { ColumnBlockPosition } from "../../../inc/mtvelements";
import { type StartListeningContext, EndListeningContext } from "../../../inc/listenercontext";

/** Original document.cxx initialized-column cursor forwarding. @param this - Actual document. @param position - Actual cursor. @param tab - Sheet. @param col - Column. @returns Initialized. */
export function InitColumnBlockPosition(
  this: ScDocument,
  position: ColumnBlockPosition,
  tab: number,
  col: number,
): boolean {
  return this.FetchTable(tab)?.InitColumnBlockPosition(position, col) ?? false;
}
/** Original document.cxx broadcaster purge forwarding. @param this - Actual document. @param position - Initialized cursor. @param top - First cell. @param length - Count. @returns Nothing. */
export function DeleteBroadcasters(
  this: ScDocument,
  position: ColumnBlockPosition,
  top: ScAddress,
  length: number,
): void {
  const table = this.FetchTable(top.Tab());
  if (!table || length <= 0) return;
  table.DeleteBroadcasters(position, top.Col(), top.Row(), top.Row() + length - 1);
}
/** Original ordinary/context start forwarding. @param this - Actual document. @param args - Native overload arguments. @returns Nothing. */
export function StartListeningCell(
  this: ScDocument,
  ...args:
    [ScAddress, SvtListener<SfxHint>] | [StartListeningContext, ScAddress, SvtListener<SfxHint>]
): void {
  if (args.length === 2) this.FetchTable(args[0].Tab())?.StartListening(...args);
  else this.FetchTable(args[1].Tab())?.StartListening(...args);
}
/** Original ordinary/context end forwarding. @param this - Actual document. @param args - Native overload arguments. @returns Nothing. */
export function EndListeningCell(
  this: ScDocument,
  ...args:
    [ScAddress, SvtListener<SfxHint>] | [EndListeningContext, ScAddress, SvtListener<SfxHint>]
): void {
  if (args.length === 2) this.FetchTable(args[0].Tab())?.EndListening(...args);
  else this.FetchTable(args[1].Tab())?.EndListening(...args);
}

/** Clips actual source sheet endpoints symmetrically for area start/end listening. @param range - Source range. @param limited - Output range. @param entirelyOut - Output out-of-bounds flag. @param this - Actual document instance. @returns Whether clipping is needed. */
export function LimitRangeToAvailableSheets(
  this: ScDocument,
  range: ScRange,
  limited: ScRange,
  entirelyOut: [boolean],
): boolean {
  const maxTab = this.GetTableCount() - 1,
    first = range.aStart.Tab(),
    last = range.aEnd.Tab();
  if ((ValidTab(first, maxTab) && ValidTab(last, maxTab)) || range.equals(BCA_LISTEN_ALWAYS()))
    return false;
  if ((first < 0 && last < 0) || (maxTab < first && maxTab < last)) {
    entirelyOut[0] = true;
    return true;
  }
  entirelyOut[0] = false;
  limited.assign(range);
  limited.aStart.SetTab(Math.max(0, Math.min(maxTab, first)));
  limited.aEnd.SetTab(Math.max(0, Math.min(maxTab, last)));
  return true;
}

/** Binds native area subscriptions after central sheet clipping. @param range - Area. @param group - Group mode. @param listener - Actual listener. @param this - Actual document instance. @returns Nothing. */
export function StartListeningArea(
  this: ScDocument,
  range: ScRange,
  group: boolean,
  listener: SvtListener<SfxHint>,
): void {
  if (!this["pBASM"]) return;
  const limited = new ScRange(),
    out: [boolean] = [false];
  if (!this.LimitRangeToAvailableSheets(range, limited, out)) {
    this["pBASM"].StartListeningArea(range, group, listener);
    return;
  }
  if (!out[0]) this["pBASM"].StartListeningArea(limited, group, listener);
}

/** Ends subscriptions using exactly the original start-listening sheet clipping. @param range - Area. @param group - Group mode. @param listener - Listener. @param this - Actual document instance. @returns Nothing. */
export function EndListeningArea(
  this: ScDocument,
  range: ScRange,
  group: boolean,
  listener: SvtListener<SfxHint>,
): void {
  if (!this["pBASM"]) return;
  const limited = new ScRange(),
    out: [boolean] = [false];
  if (!this.LimitRangeToAvailableSheets(range, limited, out)) {
    this["pBASM"].EndListeningArea(range, group, listener);
    return;
  }
  if (!out[0]) this["pBASM"].EndListeningArea(limited, group, listener);
}

/** Broadcasts a normal single-cell change and tracks its dependent formulas. @param hint - Hint. @param this - Actual document instance. @returns Nothing. */
export function Broadcast(this: ScDocument, hint: ScHint): void {
  if (!this["pBASM"] || this["eHardRecalcState"] !== HardRecalcState.OFF) return;
  const bulk = new ScBulkBroadcast(this["pBASM"], hint.GetId());
  try {
    const delivered = this.BroadcastHintInternal(hint);
    if (this["pBASM"].AreaBroadcast(hint) || delivered) this.TrackFormulas(hint.GetId());
  } finally {
    bulk.Dispose();
  }
}

/** Completes native bulk-collected tracking,then performs its final non-bulk round. @param id - Hint ID. @param this - Actual document instance. @returns Nothing. */
export function FinalTrackFormulas(this: ScDocument, id: SfxHintId): void {
  this["mbTrackFormulasPending"] = false;
  this["mbFinalTrackFormulas"] = true;
  const bulk = new ScBulkBroadcast(this["pBASM"], id);
  try {
    this.TrackFormulas(id);
  } finally {
    bulk.Dispose();
  }
  this.TrackFormulas(id);
  this["mbFinalTrackFormulas"] = false;
}

/** Removes native calculation membership and preserves the normal counter/clamp result. @param cell - Formula. @param this - Actual document instance. @returns Nothing. */
export function RemoveFromFormulaTree(this: ScDocument, cell: ScFormulaCell): void {
  const previous = cell.GetPrevious();
  if (!previous && this["pFormulaTree"] !== cell) return;
  const next = cell.GetNext();
  if (previous) previous.SetNext(next);
  else this["pFormulaTree"] = next;
  if (next) next.SetPrevious(previous);
  else this["pEOFormulaTree"] = previous;
  cell.SetPrevious(null);
  cell.SetNext(null);
  this["nFormulaCodeInTree"] = Math.max(
    0,
    this["nFormulaCodeInTree"] - cell.GetCode().GetCodeLen(),
  );
}

/** Removes a formula's native tracking links. @param cell - Formula. @param this - Actual document instance. @returns Nothing. */
export function RemoveFromFormulaTrack(this: ScDocument, cell: ScFormulaCell): void {
  const previous = cell.GetPreviousTrack();
  if (!previous && this["pFormulaTrack"] !== cell) return;
  const next = cell.GetNextTrack();
  if (previous) previous.SetNextTrack(next);
  else this["pFormulaTrack"] = next;
  if (next) next.SetPreviousTrack(previous);
  else this["pEOFormulaTrack"] = previous;
  cell.SetPreviousTrack(null);
  cell.SetNextTrack(null);
  this["nFormulaTrackCount"] = (this["nFormulaTrackCount"] - 1) & 0xffff;
}

/** Performs native two-pass single-cell tracking, including contiguous-row hint compression. Bulk/area/group/script services are not represented. @param id - Hint ID. @param this - Actual document instance. @returns Nothing. */
export function TrackFormulas(this: ScDocument, id: SfxHintId): void {
  if (!this["pBASM"]) return;
  if (
    this["pBASM"].IsInBulkBroadcast() &&
    !this.IsFinalTrackFormulas() &&
    (id === SfxHintId.ScDataChanged || id === SfxHintId.ScHiddenRowsChanged)
  ) {
    this["mbTrackFormulasPending"] = true;
    return;
  }
  for (let cell = this["pFormulaTrack"]; cell; cell = cell.GetNextTrack()) {
    const address = new ScAddress(cell.aPos);
    let rows = 1;
    for (let next = cell.GetNextTrack(); next; next = next.GetNextTrack()) {
      if (!next.aPos.equals(new ScAddress(address.Col(), address.Row() + rows, address.Tab())))
        break;
      rows++;
      cell = next;
    }
    this.BroadcastHintInternal(new ScHint(id, address, rows));
    this["pBASM"].AreaBroadcast(new ScHint(id, address, rows));
  }
  let forced = false;
  while (this["pFormulaTrack"]) {
    const cell = this["pFormulaTrack"];
    this.RemoveFromFormulaTrack(cell);
    this.PutInFormulaTree(cell);
    if (cell.GetCode().IsRecalcModeForced()) forced = true;
  }
  if (forced) {
    this["bHasForcedFormulas"] = true;
    if (this["bAutoCalc"] && !this["bCalculatingFormulaTree"]) this.CalcFormulaTree(true);
  }
}

/** Calculates represented dirty scalar formulas from the real tree; re-scan after recursive reads remove other tree nodes. @param onlyForced - Native forced-only mode. @param this - Actual document instance. @returns Nothing. */
export function CalcFormulaTree(this: ScDocument, onlyForced: boolean): void {
  const oldAutoCalc = this["bAutoCalc"];
  this["bAutoCalc"] = true;
  this["bCalculatingFormulaTree"] = true;
  try {
    for (;;) {
      let cell = this["pFormulaTree"];
      while (cell && (!cell.GetDirty() || (onlyForced && !cell.GetCode().IsRecalcModeForced())))
        cell = cell.GetNext();
      if (!cell) break;
      cell.Interpret();
    }
  } finally {
    this["bAutoCalc"] = oldAutoCalc;
    this["bCalculatingFormulaTree"] = false;
  }
}

/** Marks all represented formulas with the actual native default dirty context; deleted-tab restoration is unsupported. @param context - Dirty context. @param this - Actual document instance. @returns Nothing. */
export function SetAllFormulasDirty(this: ScDocument, context: SetFormulaDirtyContext): void {
  if (context.mbClearTabDeletedFlag)
    throw new Error("Deleted-sheet flag clearing is not implemented");
  const old = this["bAutoCalc"];
  this["bAutoCalc"] = false;
  try {
    for (const table of this["maTabs"]) table?.SetAllFormulasDirty(context);
  } finally {
    this.SetAutoCalc(old);
  }
}

/** Original documen7 single-cell hint dispatch,defined on the same actual document. @param this - Actual document. @param hint - Source hint. @returns Whether delivered. */
export function BroadcastHintInternal(this: ScDocument, hint: ScHint): boolean {
  let delivered = false,
    last: SvtBroadcaster<SfxHint> | null = null;
  for (let row = 0; row < hint.GetRowCount(); row++) {
    const address = new ScAddress(hint.GetStartAddress());
    address.SetRow(address.Row() + row);
    const broadcaster = this.GetBroadcaster(address);
    if (broadcaster && broadcaster !== last) {
      broadcaster.Broadcast(hint);
      delivered = true;
      last = broadcaster;
    }
  }
  return delivered;
}

/** Original document.cxx connected-area delegation on the same actual owner. @param this - Document. @param tab - Sheet. @param firstCol - First column. @param firstRow - First row. @param lastCol - Last column. @param lastRow - Last row. @param includeOld - Retain input. @param onlyDown - Restrict extension. @returns Nothing. */
export function GetDataArea(
  this: ScDocument,
  tab: number,
  firstCol: [number],
  firstRow: [number],
  lastCol: [number],
  lastRow: [number],
  includeOld: boolean,
  onlyDown: boolean,
): void {
  this.FetchTable(tab)?.GetDataArea(firstCol, firstRow, lastCol, lastRow, includeOld, onlyDown);
}

/** Original document.cxx address-only cached script query. @param this - Actual document. @param position - Cell. @returns Stored flags. */
export function GetScriptType(this: ScDocument, position: ScAddress): SvtScriptType {
  return (
    this.FetchTable(position.Tab())?.GetScriptType(position.Col(), position.Row()) ??
    SvtScriptType.NONE
  );
}
/** Original document.cxx sheet traversal for the consumed native NeedHeight query. @param this - Document. @param range - Area. @param mask - Native query. @returns Found. */
export function HasAttrib(this: ScDocument, range: ScRange, mask: HasAttrFlags): boolean {
  for (let tab = range.aStart.Tab(); tab <= range.aEnd.Tab() && tab < this.GetTableCount(); tab++) {
    const table = this.FetchTable(tab);
    if (
      table &&
      table.HasAttrib(
        range.aStart.Col(),
        range.aStart.Row(),
        range.aEnd.Col(),
        range.aEnd.Row(),
        mask,
      )
    )
      return true;
  }
  return false;
}

/** Original document.cxx selection-pattern merge on the same document instance. @param this - Actual document owner. @param marks - Actual selection. @param deep - Include inherited items. @returns Independent merged pattern. */
export function CreateSelectionPattern(
  this: ScDocument,
  marks: ScMarkData,
  deep: boolean,
): ScPatternAttr {
  const state = new ScMergePatternState();
  try {
    if (marks.IsMultiMarked())
      for (const tab of marks.GetSelectedTabs()) {
        if (tab >= this.GetTableCount()) break;
        this["maTabs"][tab]?.MergeSelectionPattern(state, marks, deep);
      }
    if (marks.IsMarked()) {
      const range = marks.GetMarkArea();
      for (const tab of marks.GetSelectedTabs()) {
        if (tab >= this.GetTableCount()) break;
        this["maTabs"][tab]?.MergePatternArea(
          state,
          range.aStart.Col(),
          range.aStart.Row(),
          range.aEnd.Col(),
          range.aEnd.Row(),
          deep,
        );
      }
    }
    if (state.pItemSet !== undefined) {
      const pattern = new ScPatternAttr(this.getCellAttributeHelper(), state.pItemSet);
      if (state.mbValidPatternId) pattern.SetPAKey(state.mnPatternId);
      return pattern;
    }
    return new ScPatternAttr(this.getCellAttributeHelper());
  } finally {
    state.Dispose();
  }
}

/** Original document.cxx consumed document copy definition on the same instance. @param this - Actual document. @param range - Copied area. @param flags - Native flags. @param marked - Restrict to marks. @param destination - Actual receiving document. @param marks - Optional real mark data. @returns Nothing. */
export function CopyToDocument(
  this: ScDocument,
  range: ScRange,
  flags: InsertDeleteFlags,
  marked: boolean,
  destination: ScDocument,
  marks?: ScMarkData,
): void {
  if (flags === InsertDeleteFlags.NONE) {
    for (let tab = range.aStart.Tab(); tab <= range.aEnd.Tab(); tab++) {
      if (marks !== undefined && !marks.GetTableSelect(tab)) continue;
      const source = this.FetchTable(tab),
        target = destination.FetchTable(tab);
      if (source && target)
        source.CopyToTable(
          range.aStart.Col(),
          range.aStart.Row(),
          range.aEnd.Col(),
          range.aEnd.Row(),
          target,
        );
    }
    return;
  }
  if (
    (flags & InsertDeleteFlags.ATTRIB) !== InsertDeleteFlags.ATTRIB ||
    flags &
      ~(
        InsertDeleteFlags.ATTRIB |
        InsertDeleteFlags.STRING |
        InsertDeleteFlags.EDITATTR |
        InsertDeleteFlags.NOCAPTIONS
      )
  )
    throw new Error("Only attribute document copying is implemented");
  if (marked) {
    if (marks === undefined) throw new Error("Marked attribute copying requires mark data");
    for (let tab = range.aStart.Tab(); tab <= range.aEnd.Tab(); tab++) {
      if (!marks.GetTableSelect(tab)) continue;
      for (const part of marks.GetMarkedRangesForTab(tab)) {
        const firstCol = Math.max(part.aStart.Col(), range.aStart.Col()),
          firstRow = Math.max(part.aStart.Row(), range.aStart.Row()),
          lastCol = Math.min(part.aEnd.Col(), range.aEnd.Col()),
          lastRow = Math.min(part.aEnd.Row(), range.aEnd.Row());
        if (firstCol > lastCol || firstRow > lastRow) continue;
        this.CopyToDocument(
          new ScRange(firstCol, firstRow, tab, lastCol, lastRow, tab),
          flags,
          false,
          destination,
          marks,
        );
      }
    }
    return;
  }
  const start = range.aStart,
    end = range.aEnd;
  for (let tab = start.Tab(); tab <= end.Tab(); tab++) {
    if (marks !== undefined && !marks.GetTableSelect(tab)) continue;
    const source = this.FetchTable(tab),
      target = destination.FetchTable(tab);
    if (!source || !target) continue;
    const last =
      end.Col() === this.MaxCol()
        ? Math.max(
            start.Col(),
            source.GetAllocatedColumnsCount(),
            target.GetAllocatedColumnsCount(),
          ) - 1
        : end.Col();
    for (let col = start.Col(); col <= last; col++) {
      copyColumnAttributes(
        source.GetColumnData(col),
        target.CreateColumnIfNotExists(col),
        start.Row(),
        end.Row(),
        destination,
      );
      if (flags & InsertDeleteFlags.STRING && col < source.GetAllocatedColumnsCount())
        source
          .CreateColumnIfNotExists(col)
          .CopyToColumn(start.Row(), end.Row(), target.CreateColumnIfNotExists(col));
    }
    if (end.Col() === this.MaxCol()) {
      // INITIALCOLCOUNT=1 and grow-only column storage imply the original last>=0 guard.
      target.CreateColumnIfNotExists(last);
      copyColumnAttributes(
        source.GetDefaultColumnData(),
        target.GetDefaultColumnData(),
        start.Row(),
        end.Row(),
        destination,
      );
    }
  }
}
/** Copies real pattern runs across actual helper/pool ownership. @param source - Source attributes. @param target - Target attributes. @param start - First row. @param end - Last row. @param destination - Target document. @returns Nothing. */
function copyColumnAttributes(
  source: ScColumnData,
  target: ScColumnData,
  start: number,
  end: number,
  destination: ScDocument,
): void {
  const first: [number] = [0],
    last: [number] = [0];
  for (let row = start; row <= end;) {
    const old = source.GetPatternRange(first, last, row) as ScPatternAttr;
    const next = new ScPatternAttr(
      destination.getCellAttributeHelper(),
      old.GetItemSet(),
      old.GetStyleName() ?? undefined,
    );
    const holder = new CellAttributeHolder(next, true);
    try {
      const stop = Math.min(end, last[0]);
      target.SetPatternArea(row, stop, holder);
      row = stop + 1;
    } finally {
      holder.Dispose();
    }
  }
}

/** Original document.cxx selection-frame query on the same document instance;definition partitioned to preserve the file-size boundary. @param this - Actual document. @param marks - Actual marks. @param outer - Outer result. @param inner - Inner result. @returns Nothing. */
export function GetSelectionFrame(
  this: ScDocument,
  marks: ScMarkData,
  outer: SvxBoxItem,
  inner: SvxBoxInfoItem,
): void {
  for (const edge of [Edge.TOP, Edge.BOTTOM, Edge.LEFT, Edge.RIGHT]) outer.SetLine(undefined, edge);
  outer.SetAllDistances(0);
  inner.SetLine(undefined, InnerEdge.HORI);
  inner.SetLine(undefined, InnerEdge.VERT);
  inner.SetTable(true);
  inner.SetDist(true);
  inner.SetMinDist(false);
  const flags = new ScLineFlags();
  if (marks.IsMultiMarked()) {
    const ranges = new ScRangeList();
    marks.FillRangeListWithMarks(ranges, false);
    let rows = false,
      cols = false;
    for (const range of ranges) {
      rows = rows || range.aStart.Row() !== range.aEnd.Row();
      cols = cols || range.aStart.Col() !== range.aEnd.Col();
      for (const tab of marks.GetSelectedTabs()) {
        if (tab >= this.GetTableCount()) break;
        this.FetchTable(tab)?.MergeBlockFrame(
          outer,
          inner,
          flags,
          range.aStart.Col(),
          range.aStart.Row(),
          range.aEnd.Col(),
          range.aEnd.Row(),
        );
      }
    }
    inner.EnableHor(rows);
    inner.EnableVer(cols);
  } else if (marks.IsMarked()) {
    const range = marks.GetMarkArea();
    inner.EnableHor(range.aStart.Row() !== range.aEnd.Row());
    inner.EnableVer(range.aStart.Col() !== range.aEnd.Col());
    for (const tab of marks.GetSelectedTabs()) {
      if (tab >= this.GetTableCount()) break;
      this.FetchTable(tab)?.MergeBlockFrame(
        outer,
        inner,
        flags,
        range.aStart.Col(),
        range.aStart.Row(),
        range.aEnd.Col(),
        range.aEnd.Row(),
      );
    }
  }
  inner.SetValid(Valid.LEFT, flags.nLeft !== SC_LINE_DONTCARE);
  inner.SetValid(Valid.RIGHT, flags.nRight !== SC_LINE_DONTCARE);
  inner.SetValid(Valid.TOP, flags.nTop !== SC_LINE_DONTCARE);
  inner.SetValid(Valid.BOTTOM, flags.nBottom !== SC_LINE_DONTCARE);
  inner.SetValid(Valid.HORI, flags.nHori !== SC_LINE_DONTCARE);
  inner.SetValid(Valid.VERT, flags.nVert !== SC_LINE_DONTCARE);
}

/** Original bulk listener teardown shares one purge context and returns immediately for empty input. @param this - Actual document. @param cells - Borrowed actual formulas. @returns Nothing. */
export function EndListeningFormulaCells(this: ScDocument, cells: readonly ScFormulaCell[]): void {
  if (!cells.length) return;
  const context = new EndListeningContext(this);
  for (const cell of cells) cell.EndListeningTo(context);
  context.purgeEmptyBroadcasters();
}

/** Original document selected-sheet deferred clipboard dirty phase. @param this - Actual document. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @param marks - Selected tabs. @param flags - Native insert flags. @param spans - Deferred broadcasts. @returns Nothing. */
export function SetDirtyFromClip(
  this: ScDocument,
  col1: number,
  row1: number,
  col2: number,
  row2: number,
  marks: ScMarkData,
  flags: InsertDeleteFlags,
  spans: ColumnSpanSet,
): void {
  if (!(flags & InsertDeleteFlags.CONTENTS)) return;
  for (const tab of marks.GetSelectedTabs()) {
    if (tab >= this.GetTableCount()) break;
    this.FetchTable(tab)?.SetDirtyFromClip(col1, row1, col2, row2, spans);
  }
}
/** Original document7 rectangular broadcast coordinates actual individual and area subscriptions under one native bulk scope. Unrepresented group-compute cache,stream-valid and UNO shell notification owners are not synthesized. @param this - Actual document. @param range - Changed rectangle. @param id - Hint ID. @param singles - Native individual-broadcaster default. @returns Nothing. */
export function BroadcastCells(
  this: ScDocument,
  range: ScRange,
  id: SfxHintId,
  singles: boolean,
): void {
  if (!this["pBASM"] || this["eHardRecalcState"] !== HardRecalcState.OFF) return;
  const bulk = new ScBulkBroadcast(this["pBASM"], id);
  try {
    let delivered = false;
    if (singles)
      for (let tab = range.aStart.Tab(); tab <= range.aEnd.Tab(); ++tab) {
        const table = this.FetchTable(tab);
        if (table)
          delivered =
            table.BroadcastBroadcasters(
              range.aStart.Col(),
              range.aStart.Row(),
              range.aEnd.Col(),
              range.aEnd.Row(),
              id,
            ) || delivered;
      }
    if (this["pBASM"].AreaBroadcast(range, id) || delivered) this.TrackFormulas(id);
  } finally {
    bulk.Dispose();
  }
}

/** Original document.cxx deferred scalar/deletion broadcast action. */
export class BroadcastAction implements ColumnAction {
  private mpCol: ScColumn | null = null;
  /** Borrows the real destination document. @param mrDoc - Actual document. @returns Action. */
  constructor(private readonly mrDoc: ScDocument) {}
  /** Original callback borrows the actual allocated column. @param column - Native column. @returns Nothing. */
  startColumn(column: ScColumn): void {
    this.mpCol = column;
  }
  /** Original false-span early return and inclusive changed-row notification. @param first - First row. @param last - Last row. @param value - Changed flag. @returns Nothing. */
  execute(first: number, last: number, value: boolean): void {
    if (!value) return;
    if (!this.mpCol) throw new Error("BroadcastAction requires an initialized column");
    const range = new ScRange(this.mpCol.GetCol(), first, this.mpCol.GetTab());
    range.aEnd.SetRow(last);
    this.mrDoc.BroadcastCells(range, SfxHintId.ScDataChanged);
  }
}

/** Original selected-sheet deletion,partitioned unchanged onto this same document instance. @param this - Actual document. @param flags - Deletion flags. @param marks - Actual selection. @returns Nothing. */
export function DeleteSelection(
  this: ScDocument,
  flags: InsertDeleteFlags,
  marks: ScMarkData,
): void {
  const oldAutoCalc = this.GetAutoCalc();
  this.SetAutoCalc(false);
  try {
    for (const tab of marks.GetSelectedTabs()) {
      if (tab >= this.GetTableCount()) break;
      (this.FetchTable(tab) as ScTable).DeleteSelection(flags, marks);
    }
  } finally {
    this.SetAutoCalc(oldAutoCalc);
  }
}
/** Original block copying and consecutive-sheet reference phase for the admitted CONTENTS context;source clipboard must contain an actual sheet. Same-pool cut/move services remain unported. @param this - Destination. @param context - Native context. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @param marks - Selected sheets. @param dx - Column displacement. @param dy - Row displacement. @returns Nothing. */
export function CopyBlockFromClip(
  this: ScDocument,
  context: CopyFromClipContext,
  col1: number,
  row1: number,
  col2: number,
  row2: number,
  marks: ScMarkData,
  dx: number,
  dy: number,
): void {
  const clip = context.getClipDoc(),
    count = clip.GetTableCount(),
    cut = clip.GetClipParam().mbCutMode;
  if (cut && clip.GetPool() === this.GetPool())
    throw new Error("Same-document cut reference updates are not implemented");
  let clipTab = 0;
  for (
    let tab = context.getTabStart();
    tab <= context.getTabEnd() && tab < this.GetTableCount();
    ++tab
  ) {
    const table = this.FetchTable(tab);
    if (!table || !marks.GetTableSelect(tab)) continue;
    while (!clip.FetchTable(clipTab)) clipTab = (clipTab + 1) % count;
    table.CopyFromClip(
      context,
      col1,
      row1,
      col2,
      row2,
      dx,
      dy,
      clip.FetchTable(clipTab) as ScTable,
    );
    clipTab = (clipTab + 1) % count;
  }
  clipTab = 0;
  for (
    let tab = context.getTabStart();
    tab <= context.getTabEnd() && tab < this.GetTableCount();
    ++tab
  ) {
    if (!this.FetchTable(tab) || !marks.GetTableSelect(tab)) continue;
    while (!clip.FetchTable(clipTab)) clipTab = (clipTab + 1) % count;
    let follow = 0;
    while (
      tab + follow < context.getTabEnd() &&
      marks.GetTableSelect(tab + follow + 1) &&
      clipTab + follow < MAXTAB &&
      clip.FetchTable((clipTab + follow + 1) % count)
    )
      ++follow;
    const references = new RefUpdateContext(this, clip);
    references.maRange.assign(new ScRange(col1, row1, tab, col2, row2, tab + follow));
    references.mnColDelta = dx;
    references.mnRowDelta = dy;
    references.mnTabDelta = tab - clipTab;
    references.setBlockPositionReference(context.getBlockPositionSet());
    if (!cut) {
      references.meMode = UpdateRefMode.URM_COPY;
      this.UpdateReference(references, context.getUndoDoc(), false);
    }
    clipTab = (clipTab + follow + 1) % count;
    tab += follow;
  }
}
/** Original filtered-row runs use the first populated source sheet's filter flags and publish the native source cursor,including its SCROW-max sentinel. @param this - Destination. @param context - Native context. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @param marks - Destination sheets. @param dx - Column displacement. @param sourceRow - Source cursor output. @param sourceEnd - Last source row. @returns Skipped source-row count. */
export function CopyNonFilteredFromClip(
  this: ScDocument,
  context: CopyFromClipContext,
  col1: number,
  row1: number,
  col2: number,
  row2: number,
  marks: ScMarkData,
  dx: number,
  sourceRow: [number],
  sourceEnd: number,
): number {
  const clip = context.getClipDoc();
  let flagTab = 0;
  while (flagTab < clip.GetTableCount() && !clip.FetchTable(flagTab)) ++flagTab;
  let row = sourceRow[0],
    destination = row1,
    filtered = 0;
  while (row <= sourceEnd && destination <= row2) {
    const old = row;
    row = clip.FirstNonFilteredRow(row, sourceEnd, flagTab);
    filtered += row - old;
    if (row <= sourceEnd) {
      const last: [number] = [row];
      clip.RowFiltered(row, flagTab, undefined, last);
      const follow = Math.min(last[0] - row, sourceEnd - row, row2 - destination);
      this.CopyBlockFromClip(
        context,
        col1,
        destination,
        col2,
        destination + follow,
        marks,
        dx,
        destination - row,
      );
      row += follow + 1;
      destination += follow + 1;
    }
  }
  sourceRow[0] = row;
  return filtered;
}

/** Original clipboard dimensions,partitioned unchanged onto the same document. @param this - Actual document. @param cols - Width difference. @param rows - Height difference. @param includeFiltered - Filtered mode. @returns Nothing. */
export function GetClipArea(
  this: ScDocument,
  cols: [number],
  rows: [number],
  includeFiltered: boolean,
): void {
  if (!this.IsClipboard()) return;
  const ranges = this.GetClipParam().maRanges;
  if (ranges.empty()) return;
  const whole = ranges.Combine();
  cols[0] = whole.aEnd.Col() - whole.aStart.Col();
  if (includeFiltered) rows[0] = whole.aEnd.Row() - whole.aStart.Row();
  else {
    let tab = 0;
    while (tab < this.GetTableCount() && !this.FetchTable(tab)) ++tab;
    rows[0] = Math.max(0, this.CountNonFilteredRows(whole.aStart.Row(), whole.aEnd.Row(), tab) - 1);
  }
}
/** Original native contiguous Undo initialization;source shell-medium URL propagation remains unrepresented. @param this - Undo document. @param source - Source owner. @param first - First sheet. @param last - Last sheet. @param colInfo - Original default false. @param rowInfo - Original default false. @returns Nothing. */
export function InitUndo(
  this: ScDocument,
  source: ScDocument,
  first: number,
  last: number,
  colInfo = false,
  rowInfo = false,
): void {
  if (!this.IsUndo()) return;
  this.Clear();
  this.SharePooledResources(source);
  const tabs = this["maTabs"];
  while (tabs.length <= last) tabs.push(null);
  for (let tab = first; tab <= last; ++tab)
    tabs[tab] = new ScTable(this, tab, new OUString(), colInfo, rowInfo);
}
/** Original selected-sheet Undo initialization retains intervening null slots and clears previous payload owners. @param this - Undo document. @param source - Source owner. @param marks - Source-selected sheets. @param colInfo - Original default false. @param rowInfo - Original default false. @returns Nothing. */
export function InitUndoSelected(
  this: ScDocument,
  source: ScDocument,
  marks: ScMarkData,
  colInfo = false,
  rowInfo = false,
): void {
  if (!this.IsUndo()) return;
  this.Clear();
  this.SharePooledResources(source);
  for (let tab = 0; tab <= marks.GetLastSelected(); ++tab)
    this["maTabs"].push(
      marks.GetTableSelect(tab) ? new ScTable(this, tab, new OUString(), colInfo, rowInfo) : null,
    );
}
/** Original incremental Undo allocation leaves existing tables and their geometry owners intact. @param this - Undo document. @param first - First sheet. @param last - Last sheet. @param colInfo - Original default false. @param rowInfo - Original default false. @returns Nothing. */
export function AddUndoTab(
  this: ScDocument,
  first: number,
  last: number,
  colInfo = false,
  rowInfo = false,
): void {
  if (!this.IsUndo()) return;
  const tabs = this["maTabs"];
  while (tabs.length <= last) tabs.push(null);
  for (let tab = first; tab <= last; ++tab)
    if (!tabs[tab]) tabs[tab] = new ScTable(this, tab, new OUString(), colInfo, rowInfo);
}

/** Original selected-sheet DeleteArea body,partitioned unchanged on the same document owner. @param this - Actual document. @param firstCol - First column. @param firstRow - First row. @param lastCol - Last column. @param lastRow - Last row. @param marks - Selected sheets. @param flags - Native deletion flags. @returns Nothing. */
export function DeleteArea(
  this: ScDocument,
  firstCol: number,
  firstRow: number,
  lastCol: number,
  lastRow: number,
  marks: ScMarkData,
  flags: InsertDeleteFlags,
): void {
  const oldAutoCalc = this.GetAutoCalc();
  this.SetAutoCalc(false);
  try {
    [firstCol, lastCol] = [Math.min(firstCol, lastCol), Math.max(firstCol, lastCol)];
    [firstRow, lastRow] = [Math.min(firstRow, lastRow), Math.max(firstRow, lastRow)];
    for (let tab = 0; tab < this.GetTableCount(); tab++)
      if (marks.GetTableSelect(tab))
        (this.FetchTable(tab) as ScTable).DeleteArea(firstCol, firstRow, lastCol, lastRow, flags);
  } finally {
    this.SetAutoCalc(oldAutoCalc);
  }
}

/** Existing native data-area clipping body,partitioned unchanged onto this same document. @param this - Actual document. @param tab - Sheet. @param firstCol - First column output. @param firstRow - First row output. @param lastCol - Last column output. @param lastRow - Last row output. @returns Valid clipped range. */
export function ShrinkToDataArea(
  this: ScDocument,
  tab: number,
  firstCol: [number],
  firstRow: [number],
  lastCol: [number],
  lastRow: [number],
): boolean {
  const table = this.FetchTable(tab);
  if (table === null) return false;
  const col1: [number] = [0],
    row1: [number] = [0],
    col2: [number] = [0],
    row2: [number] = [0];
  table.GetFirstDataPos(col1, row1);
  table.GetLastDataPos(col2, row2);
  if (col1[0] > col2[0] || row1[0] > row2[0]) return false;
  if (firstCol[0] < col1[0]) firstCol[0] = col1[0];
  if (col2[0] < lastCol[0]) lastCol[0] = col2[0];
  if (firstRow[0] < row1[0]) firstRow[0] = row1[0];
  if (row2[0] < lastRow[0]) lastRow[0] = row2[0];
  if (firstCol[0] > lastCol[0] || firstRow[0] > lastRow[0]) return false;
  return true;
}

/** Original document.cxx GetCellType body,partitioned unchanged on the same instance. @param this - Actual document. @param position - Cell address. @returns Native value. */
export function GetCellType(this: ScDocument, position: ScAddress): CellType {
  return (
    this.FetchTable(position.Tab())?.GetCellType(position.Col(), position.Row()) ??
    CellType.CELLTYPE_NONE
  );
}

/** Original document.cxx GetSharedString body,partitioned unchanged on the same instance. @param this - Actual document. @param position - Cell address. @returns Native value. */
export function GetSharedString(this: ScDocument, position: ScAddress): SharedString {
  return (
    this.FetchTable(position.Tab())?.GetSharedString(position.Col(), position.Row()) ??
    new SharedString()
  );
}
