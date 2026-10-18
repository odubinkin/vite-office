/** @fileoverview Scalar/local-reference ScDocument chain with native logical formula tracking. Full construction,formatting,area/group and shell services remain unsupported. */
import { ScRefCellValue } from "../../../inc/cellvalue";
import { ScHint } from "../../../inc/brdcst";
import { SetFormulaDirtyContext } from "../../../inc/refupdatecontext";
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
import type { SvtListener } from "../../../../svl/source/notify/listener";
import type { SvtBroadcaster } from "../../../../svl/source/notify/broadcast";
import { ScSheetLimits } from "../../../inc/sheetlimits";
import { ScInterpreterContext } from "../../../inc/interpretercontext";
import type { ScFormulaCell } from "../../../inc/formulacell";
import type { Grammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { ScTable } from "../../../inc/table";
import {
  ScAddress,
  MAXCOL,
  MAXROW,
  MAXROWCOUNT,
  MAXTAB,
  SC_TAB_APPEND,
  ValidCol,
  ValidRow,
  ValidTab,
} from "../../../inc/address";
import { CellType } from "../../../inc/global";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { SharedString } from "../../../../svl/inc/sharedstring";
import { SharedStringPool } from "../../../../svl/inc/sharedstringpool";
import { uppercase } from "../../../../unotools/inc/charclass";
import { MsLangId } from "../../../../i18nlangtag/inc/mslangid";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";

/** Explicit initial document subset;all supported cells live in its actual sheet/column chain. */
export class ScDocument {
  private pFormulaTree: ScFormulaCell | null = null;
  private pEOFormulaTree: ScFormulaCell | null = null;
  private pFormulaTrack: ScFormulaCell | null = null;
  private pEOFormulaTrack: ScFormulaCell | null = null;
  private nFormulaTrackCount = 0;
  private nFormulaCodeInTree = 0;
  private bHasForcedFormulas = false;
  private bCalculatingFormulaTree = false;
  private readonly mxSheetLimits = new ScSheetLimits(MAXCOL, MAXROW);
  private readonly maInterpreterContext = new ScInterpreterContext(this, null);
  private bAutoCalc = true;
  private readonly maTabs: ScTable[] = [];
  private readonly locale = MsLangId.Conversion.convertLanguageToLocale(0, false);
  private readonly mpCellStringPool: SharedStringPool;
  /** Creates the scalar document's shared pool using the existing prepared-locale uppercase operation. @returns Document. */
  constructor() {
    const locale = this.locale;
    this.mpCellStringPool = new SharedStringPool({
      /** Applies the existing real whole-string classifier field binding. @param value - Unicode source. @returns Uppercase value. */
      uppercase(value) {
        return uppercase(value, locale);
      },
    });
  }
  /** Borrows document-independent native sheet limits. @returns Limits. */
  GetSheetLimits(): ScSheetLimits {
    return this.mxSheetLimits;
  }
  /** Borrows the actual nonthreaded numeric interpreter context. @returns Context. */
  GetNonThreadedContext(): ScInterpreterContext {
    return this.maInterpreterContext;
  }
  /** Reads the normal document's native automatic-calculation default. @returns Enabled. */
  GetAutoCalc(): boolean {
    return this.bAutoCalc;
  }
  /** Applies the native normal-document auto-calc switch and forced-formula wakeup. Shell/interpreter callback modes are unsupported. @param enabled - Enabled. @returns Nothing. */
  SetAutoCalc(enabled: boolean): void {
    const old = this.bAutoCalc;
    this.bAutoCalc = enabled;
    if (!old && enabled && this.bHasForcedFormulas && !this.bCalculatingFormulaTree)
      this.CalcFormulaTree(true);
  }
  /** Borrows the native numeric/string/formula cell view. @param position - Cell. @returns View. */
  GetRefCellValue(position: ScAddress): ScRefCellValue {
    return (
      this.FetchTable(position.Tab())?.GetRefCellValue(position.Col(), position.Row()) ??
      new ScRefCellValue()
    );
  }
  /** Borrows a source broadcaster. @param position - Cell. @returns Broadcaster or null. */
  GetBroadcaster(position: ScAddress): SvtBroadcaster<SfxHint> | null {
    return this.FetchTable(position.Tab())?.GetBroadcaster(position.Col(), position.Row()) ?? null;
  }
  /** Registers the original native listener at a cell. @param position - Cell. @param listener - Listener. @returns Nothing. */
  StartListeningCell(position: ScAddress, listener: SvtListener<SfxHint>): void {
    this.FetchTable(position.Tab())?.StartListening(position, listener);
  }
  /** Ends an original reciprocal registration. @param position - Cell. @param listener - Listener. @returns Nothing. */
  EndListeningCell(position: ScAddress, listener: SvtListener<SfxHint>): void {
    this.FetchTable(position.Tab())?.EndListening(position, listener);
  }
  /** Dispatches native hints through existing single-cell broadcasters. Area subscribers remain unsupported. @param hint - Hint. @returns Whether delivered. */
  BroadcastHintInternal(hint: ScHint): boolean {
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
  /** Broadcasts a normal single-cell change and tracks its dependent formulas. @param hint - Hint. @returns Nothing. */
  Broadcast(hint: ScHint): void {
    if (this.BroadcastHintInternal(hint)) this.TrackFormulas(hint.GetId());
  }
  /** Reports native logical formula-tree membership. @param cell - Formula. @returns Membership. */
  IsInFormulaTree(cell: ScFormulaCell): boolean {
    return cell.GetPrevious() !== null || this.pFormulaTree === cell;
  }
  /** Reports native logical tracking membership. @param cell - Formula. @returns Membership. */
  IsInFormulaTrack(cell: ScFormulaCell): boolean {
    return cell.GetPreviousTrack() !== null || this.pFormulaTrack === cell;
  }
  /** Appends a formula to the native calculation list. This is logical ordering, not object lifetime management. @param cell - Formula. @returns Nothing. */
  PutInFormulaTree(cell: ScFormulaCell): void {
    this.RemoveFromFormulaTree(cell);
    if (this.pEOFormulaTree) this.pEOFormulaTree.SetNext(cell);
    else this.pFormulaTree = cell;
    cell.SetPrevious(this.pEOFormulaTree);
    cell.SetNext(null);
    this.pEOFormulaTree = cell;
    this.nFormulaCodeInTree += cell.GetCode().GetCodeLen();
  }
  /** Removes native calculation membership and preserves the normal counter/clamp result. @param cell - Formula. @returns Nothing. */
  RemoveFromFormulaTree(cell: ScFormulaCell): void {
    const previous = cell.GetPrevious();
    if (!previous && this.pFormulaTree !== cell) return;
    const next = cell.GetNext();
    if (previous) previous.SetNext(next);
    else this.pFormulaTree = next;
    if (next) next.SetPrevious(previous);
    else this.pEOFormulaTree = previous;
    cell.SetPrevious(null);
    cell.SetNext(null);
    this.nFormulaCodeInTree = Math.max(0, this.nFormulaCodeInTree - cell.GetCode().GetCodeLen());
  }
  /** Reads the actual native RPN count in the calculation list. @returns Count. */
  GetFormulaCodeInTree(): number {
    return this.nFormulaCodeInTree;
  }
  /** Appends tracking membership after removing calculation membership. @param cell - Formula. @returns Nothing. */
  AppendToFormulaTrack(cell: ScFormulaCell): void {
    this.RemoveFromFormulaTrack(cell);
    this.RemoveFromFormulaTree(cell);
    if (this.pEOFormulaTrack) this.pEOFormulaTrack.SetNextTrack(cell);
    else this.pFormulaTrack = cell;
    cell.SetPreviousTrack(this.pEOFormulaTrack);
    cell.SetNextTrack(null);
    this.pEOFormulaTrack = cell;
    this.nFormulaTrackCount = (this.nFormulaTrackCount + 1) & 0xffff;
  }
  /** Removes a formula's native tracking links. @param cell - Formula. @returns Nothing. */
  RemoveFromFormulaTrack(cell: ScFormulaCell): void {
    const previous = cell.GetPreviousTrack();
    if (!previous && this.pFormulaTrack !== cell) return;
    const next = cell.GetNextTrack();
    if (previous) previous.SetNextTrack(next);
    else this.pFormulaTrack = next;
    if (next) next.SetPreviousTrack(previous);
    else this.pEOFormulaTrack = previous;
    cell.SetPreviousTrack(null);
    cell.SetNextTrack(null);
    this.nFormulaTrackCount = (this.nFormulaTrackCount - 1) & 0xffff;
  }
  /** Performs native two-pass single-cell tracking, including contiguous-row hint compression. Bulk/area/group/script services are not represented. @param id - Hint ID. @returns Nothing. */
  TrackFormulas(id: SfxHintId = SfxHintId.ScDataChanged): void {
    for (let cell = this.pFormulaTrack; cell; cell = cell.GetNextTrack()) {
      const address = new ScAddress(cell.aPos);
      let rows = 1;
      for (let next = cell.GetNextTrack(); next; next = next.GetNextTrack()) {
        if (!next.aPos.equals(new ScAddress(address.Col(), address.Row() + rows, address.Tab())))
          break;
        rows++;
        cell = next;
      }
      this.BroadcastHintInternal(new ScHint(id, address, rows));
    }
    let forced = false;
    while (this.pFormulaTrack) {
      const cell = this.pFormulaTrack;
      this.RemoveFromFormulaTrack(cell);
      this.PutInFormulaTree(cell);
      if (cell.GetCode().IsRecalcModeForced()) forced = true;
    }
    if (forced) {
      this.bHasForcedFormulas = true;
      if (this.bAutoCalc && !this.bCalculatingFormulaTree) this.CalcFormulaTree(true);
    }
  }
  /** Calculates represented dirty scalar formulas from the real tree; re-scan after recursive reads remove other tree nodes. @param onlyForced - Native forced-only mode. @returns Nothing. */
  CalcFormulaTree(onlyForced = false): void {
    const oldAutoCalc = this.bAutoCalc;
    this.bAutoCalc = true;
    this.bCalculatingFormulaTree = true;
    try {
      for (;;) {
        let cell = this.pFormulaTree;
        while (cell && (!cell.GetDirty() || (onlyForced && !cell.GetCode().IsRecalcModeForced())))
          cell = cell.GetNext();
        if (!cell) break;
        cell.Interpret();
      }
    } finally {
      this.bAutoCalc = oldAutoCalc;
      this.bCalculatingFormulaTree = false;
    }
  }
  /** Marks all represented formulas with the actual native default dirty context; deleted-tab restoration is unsupported. @param context - Dirty context. @returns Nothing. */
  SetAllFormulasDirty(context: SetFormulaDirtyContext): void {
    if (context.mbClearTabDeletedFlag)
      throw new Error("Deleted-sheet flag clearing is not implemented");
    const old = this.bAutoCalc;
    this.bAutoCalc = false;
    try {
      for (const table of this.maTabs) table.SetAllFormulasDirty(context);
    } finally {
      this.SetAutoCalc(old);
    }
  }
  /** Writes supported numeric formula content through the existing sheet/column owner chain. @param position - Cell. @param source - Formula. @param grammar - ODFF grammar. @returns Nothing. */
  SetFormula(position: ScAddress, source: OUStringConstReference, grammar: Grammar): void {
    this.FetchTable(position.Tab())?.SetFormula(position.Col(), position.Row(), source, grammar);
  }
  /** Borrows the actual formula cell, or native null. @param position - Cell. @returns Formula cell or null. */
  GetFormulaCell(position: ScAddress): ScFormulaCell | null {
    return this.FetchTable(position.Tab())?.GetFormulaCell(position.Col(), position.Row()) ?? null;
  }
  /** Reads the native compiler/interpreter error code. @param position - Cell. @returns Error. */
  GetErrCode(position: ScAddress): FormulaError {
    return this.FetchTable(position.Tab())?.GetErrCode(position) ?? FormulaError.NONE;
  }
  /** Borrows the actual shared string pool. @returns Pool. */
  GetSharedStringPool(): SharedStringPool {
    return this.mpCellStringPool;
  }
  /** Reads the normal native row limit. @returns Last row. */
  MaxRow(): number {
    return MAXROW;
  }
  /** Reads the normal native column limit. @returns Last column. */
  MaxCol(): number {
    return MAXCOL;
  }
  /** Reports the full logical row domain of every column store. @returns Count. */
  GetMaxRowCount(): number {
    return MAXROWCOUNT;
  }
  /** Checks native row bounds. @param row - Row. @returns Validity. */
  ValidRow(row: number): boolean {
    return ValidRow(row, MAXROW);
  }
  /** Checks native column/row bounds. @param col - Column. @param row - Row. @returns Validity. */
  ValidColRow(col: number, row: number): boolean {
    return ValidCol(col, MAXCOL) && this.ValidRow(row);
  }
  /** Reports actual sheet ownership count. @returns Count. */
  GetTableCount(): number {
    return this.maTabs.length;
  }
  /** Borrows a real existing sheet or native null result. @param tab - Sheet. @returns Owner or null. */
  FetchTable(tab: number): ScTable | null {
    return ValidTab(tab) && tab < this.maTabs.length ? (this.maTabs[tab] as ScTable) : null;
  }
  /** Copies the sheet name or clears the output for a missing sheet. @param tab - Sheet. @param output - Unicode target. @returns Found. */
  GetName(tab: number, output: OUString): boolean {
    const table = this.FetchTable(tab);
    if (!table) {
      output.clear();
      return false;
    }
    output.assign(table.GetName());
    return true;
  }
  /** Applies native editable sheet-name character constraints without a fabricated length limit. @param name - Native Unicode name. @returns Validity. */
  static ValidTabName(name: OUStringConstReference): boolean {
    const value = text(name);
    return !!value && !/[:\\/?*[\]]/.test(value) && !value.startsWith("'") && !value.endsWith("'");
  }
  /** Rejects duplicate names using the existing real uppercase operation. @param name - New name. @returns Availability. */
  ValidNewTabName(name: OUStringConstReference): boolean {
    if (!ScDocument.ValidTabName(name)) return false;
    const candidate = uppercase(name, this.locale);
    for (const table of this.maTabs)
      if (uppercase(table.GetName(), this.locale).equals(candidate)) return false;
    return true;
  }
  /** Inserts a normal scalar sheet and updates shifted sheet/column positions. External-document/undo-delete modes remain unsupported APIs. @param position - Position or native append sentinel. @param name - Native sheet name. @returns Inserted. */
  InsertTab(position: number, name: OUStringConstReference): boolean {
    if (this.maTabs.length > MAXTAB || !this.ValidNewTabName(name)) return false;
    if (position === SC_TAB_APPEND || position >= this.maTabs.length) position = this.maTabs.length;
    if (!ValidTab(position)) return false;
    this.maTabs.splice(position, 0, new ScTable(this, position, name));
    for (let i = position + 1; i < this.maTabs.length; i++) (this.maTabs[i] as ScTable).SetTabNo(i);
    this.SetAllFormulasDirty(new SetFormulaDirtyContext());
    return true;
  }
  /** Writes a number through the actual sheet/column chain. @param position - Cell address. @param value - Number. @returns Nothing. */
  SetValue(position: ScAddress, value: number): void {
    this.FetchTable(position.Tab())?.SetValue(position.Col(), position.Row(), value);
  }
  /** Reads numeric cells with native zero fallback. @param position - Cell address. @returns Value. */
  GetValue(position: ScAddress): number {
    return this.FetchTable(position.Tab())?.GetValue(position.Col(), position.Row()) ?? 0;
  }
  /** Reads the actual stored scalar discriminator. @param position - Cell address. @returns Type. */
  GetCellType(position: ScAddress): CellType {
    return (
      this.FetchTable(position.Tab())?.GetCellType(position.Col(), position.Row()) ??
      CellType.CELLTYPE_NONE
    );
  }
  /** Returns an independent shared-string value. @param position - Cell address. @returns Shared text. */
  GetSharedString(position: ScAddress): SharedString {
    return (
      this.FetchTable(position.Tab())?.GetSharedString(position.Col(), position.Row()) ??
      new SharedString()
    );
  }
  /** Implements the literal single-line content portion of SetTextCell;rich edit-text and number-format attributes are explicit gaps. @param position - Cell address. @param value - Literal Unicode input. @returns Nothing. */
  SetTextCell(position: ScAddress, value: OUStringConstReference): void {
    const table = this.FetchTable(position.Tab());
    if (!table || !this.ValidColRow(position.Col(), position.Row())) return;
    if (/[\r\n]/.test(text(value)))
      throw new Error("Multiline edit-text cells are not implemented");
    if (!value.getLength()) {
      table.SetEmptyCell(position.Col(), position.Row());
      return;
    }
    const shared = this.mpCellStringPool.intern(value);
    try {
      table.SetRawString(position.Col(), position.Row(), shared);
    } finally {
      shared.dispose();
    }
  }
  /** Clears an existing scalar cell without allocating a missing column or sheet. @param position - Cell address. @returns Nothing. */
  SetEmptyCell(position: ScAddress): void {
    this.FetchTable(position.Tab())?.SetEmptyCell(position.Col(), position.Row());
  }
}
