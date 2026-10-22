/** @fileoverview Consumed native out-of-class ScDocument dependency methods from documen7/document.cxx. Each definition runs on the same ScDocument instance;literal private-member access bridges TypeScript class-file boundaries without another state model. */
import type { SetFormulaDirtyContext } from "../../../inc/refupdatecontext";
import { HardRecalcState, type ScDocument } from "./document";
import type { ScFormulaCell } from "../../../inc/formulacell";
import type { SvtListener } from "../../../../svl/source/notify/listener";
import { SfxHintId, type SfxHint } from "../../../../svl/inc/hint";
import { ScAddress, ScRange, ValidTab, BCA_LISTEN_ALWAYS } from "../../../inc/address";
import { ScHint } from "../../../inc/brdcst";
import { ScBulkBroadcast } from "../inc/bcaslot";

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
    for (const table of this["maTabs"]) table.SetAllFormulasDirty(context);
  } finally {
    this.SetAutoCalc(old);
  }
}
