/** @fileoverview Native table5 manual/page-break sets and ownership transfers;pagination/device calculation remains outside this kernel slice. */
import type { ScAddress } from "../../../inc/address";
import type { ScColumn } from "../../../inc/column";
import type { StartListeningContext, EndListeningContext } from "../../../inc/listenercontext";
import type { SfxHint } from "../../../../svl/inc/hint";
import type { SvtListener } from "../../../../svl/source/notify/listener";
import type { ScTable } from "../../../inc/table";
import { ScTableProtection } from "./tabprotection";
import { scStyleNameResourcesEnglish } from "../../../inc/globstr";
import { ScBitMaskCompressedArray } from "../../../inc/compressedarray";
import type { ScFlatUInt16RowSegments, ScFlatUInt16RowRangeData } from "../../../inc/segmenttree";

/** Native initial and fallback page style name. */
export const DEFAULT_PAGE_STYLE = scStyleNameResourcesEnglish.STR_STYLENAME_STANDARD;

/** Reads the sheet's page style name. @param this - Native sheet. @returns Style name. */
export function GetPageStyle(this: ScTable): string {
  return this["aPageStyle"];
}

/** Assigns a known page style or the original Standard fallback. @param this - Native sheet. @param name - Requested page style. @returns Nothing. */
export function SetPageStyle(this: ScTable, name: string): void {
  if (name === this["aPageStyle"]) return;
  const styles = this["rDocument"].GetStyleSheetPool();
  const resolved = styles?.GetPageStyle(name) ? name : DEFAULT_PAGE_STYLE;
  if (this["aPageStyle"] === resolved) return;
  this["aPageStyle"] = resolved;
  this.SetStreamValid(false);
}

/** Native ordered integer set enumeration in the browser Set binding. @param left - First index. @param right - Second index. @returns Integer order. */
function compare(left: number, right: number): number {
  return left - right;
}
/** Original clears both manual sets before invalidating geometry and XML stream state. @param this - Actual sheet. @returns Nothing. */
export function RemoveManualBreaks(this: ScTable): void {
  this["maRowManualBreaks"].clear();
  this["maColManualBreaks"].clear();
  this.InvalidatePageBreaks();
  this.SetStreamValid(false);
}
/** Original row-first manual-presence query. @param this - Actual sheet. @returns Presence. */
export function HasManualBreaks(this: ScTable): boolean {
  return this["maRowManualBreaks"].size !== 0 || this["maColManualBreaks"].size !== 0;
}
/** Original rvalue row set transfer;the host value move severs aliases to the caller's Set. @param this - Actual sheet. @param breaks - Moved set. @returns Nothing. */
export function SetRowManualBreaks(this: ScTable, breaks: Set<number>): void {
  this["maRowManualBreaks"] = new Set([...breaks].sort(compare));
  breaks.clear();
  this.InvalidatePageBreaks();
  this.SetStreamValid(false);
}
/** Original rvalue column set transfer. @param this - Actual sheet. @param breaks - Moved set. @returns Nothing. */
export function SetColManualBreaks(this: ScTable, breaks: Set<number>): void {
  this["maColManualBreaks"] = new Set([...breaks].sort(compare));
  breaks.clear();
  this.InvalidatePageBreaks();
  this.SetStreamValid(false);
}
/** Original page assignment then manual insertion into the caller's ordered set. @param this - Actual sheet. @param breaks - Output. @param page - Include computed breaks. @param manual - Include manual breaks. @returns Nothing. */
export function GetAllRowBreaks(
  this: ScTable,
  breaks: Set<number>,
  page: boolean,
  manual: boolean,
): void {
  const result = new Set(page ? this["maRowPageBreaks"] : breaks);
  if (manual) for (const row of this["maRowManualBreaks"]) result.add(row);
  breaks.clear();
  for (const row of [...result].sort(compare)) breaks.add(row);
}
/** Original column page assignment then manual insertion. @param this - Actual sheet. @param breaks - Output. @param page - Include computed breaks. @param manual - Include manual breaks. @returns Nothing. */
export function GetAllColBreaks(
  this: ScTable,
  breaks: Set<number>,
  page: boolean,
  manual: boolean,
): void {
  const result = new Set(page ? this["maColPageBreaks"] : breaks);
  if (manual) for (const col of this["maColManualBreaks"]) result.add(col);
  breaks.clear();
  for (const col of [...result].sort(compare)) breaks.add(col);
}
/** Original row break flags validate before inserting;manual changes invalidate pagination. @param this - Actual sheet. @param row - Row. @param page - Page break. @param manual - Manual break. @returns Nothing. */
export function SetRowBreak(this: ScTable, row: number, page: boolean, manual: boolean): void {
  if (!this["rDocument"].ValidRow(row)) return;
  if (page) this["maRowPageBreaks"].add(row);
  if (manual) {
    this["maRowManualBreaks"].add(row);
    this.InvalidatePageBreaks();
  }
}
/** Original column break flags validate before inserting. @param this - Actual sheet. @param col - Column. @param page - Page break. @param manual - Manual break. @returns Nothing. */
export function SetColBreak(this: ScTable, col: number, page: boolean, manual: boolean): void {
  if (!this["rDocument"].ValidCol(col)) return;
  if (page) this["maColPageBreaks"].add(col);
  if (manual) {
    this["maColManualBreaks"].add(col);
    this.InvalidatePageBreaks();
  }
}

/** Removes the row break flags independently. @param this - Native sheet. @param row - Row. @param page - Remove computed break. @param manual - Remove manual break. @returns Nothing. */
export function RemoveRowBreak(this: ScTable, row: number, page: boolean, manual: boolean): void {
  if (!this["rDocument"].ValidRow(row)) return;
  if (page) this["maRowPageBreaks"].delete(row);
  if (manual) {
    this["maRowManualBreaks"].delete(row);
    this.InvalidatePageBreaks();
  }
}

/** Removes the column break flags independently. @param this - Native sheet. @param col - Column. @param page - Remove computed break. @param manual - Remove manual break. @returns Nothing. */
export function RemoveColBreak(this: ScTable, col: number, page: boolean, manual: boolean): void {
  if (!this["rDocument"].ValidCol(col)) return;
  if (page) this["maColPageBreaks"].delete(col);
  if (manual) {
    this["maColManualBreaks"].delete(col);
    this.InvalidatePageBreaks();
  }
}

/** Gets the sheet protection state. @param this - Sheet. @returns Whether the sheet is protected. */
export function IsProtected(this: ScTable): boolean {
  return this["pTabProtection"]?.isProtected() ?? false;
}

/** Gets the protection owned by the sheet. @param this - Sheet. @returns Borrowed protection. */
export function GetProtection(this: ScTable): Readonly<ScTableProtection> | undefined {
  return this["pTabProtection"];
}

/** Replaces sheet protection and invalidates the sheet stream. @param this - Sheet. @param protection - State to copy or clear. @returns Nothing. */
export function SetProtection(this: ScTable, protection?: ScTableProtection): void {
  this["pTabProtection"] = protection && new ScTableProtection(protection);
  this.SetStreamValid(false);
}

/** Original validated manual-break query. @param this - Sheet. @param index - Native row index. @returns Membership. */
export function HasRowManualBreak(this: ScTable, index: number): boolean {
  return this["rDocument"].ValidRow(index) && this["maRowManualBreaks"].has(index);
}

/** Original validated manual-break query. @param this - Sheet. @param index - Native col index. @returns Membership. */
export function HasColManualBreak(this: ScTable, index: number): boolean {
  return this["rDocument"].ValidCol(index) && this["maColManualBreaks"].has(index);
}

/** Starts actual single-cell listening, allocating only required columns. @param this - Native sheet. @param args - Position, listener and optional context. @returns Nothing. */
export function StartListening(
  this: ScTable,
  ...args:
    [ScAddress, SvtListener<SfxHint>] | [StartListeningContext, ScAddress, SvtListener<SfxHint>]
): void {
  if (args.length === 3) {
    const [context, address, listener] = args;
    if (this["rDocument"].ValidCol(address.Col()))
      this.CreateColumnIfNotExists(address.Col()).StartListening(context, address, listener);
    return;
  }
  const [address, listener] = args;
  if (this["rDocument"].ValidColRow(address.Col(), address.Row()))
    this.CreateColumnIfNotExists(address.Col()).StartListening(listener, address.Row());
}
/** Ends single-cell listening without allocating. @param this - Native sheet. @param args - Position, listener and optional context. @returns Nothing. */
export function EndListening(
  this: ScTable,
  ...args:
    [ScAddress, SvtListener<SfxHint>] | [EndListeningContext, ScAddress, SvtListener<SfxHint>]
): void {
  if (args.length === 3) {
    const [context, address, listener] = args;
    if (this["rDocument"].ValidCol(address.Col()) && address.Col() < this["aCol"].length)
      (this["aCol"][address.Col()] as ScColumn).EndListening(context, address, listener);
    return;
  }
  const [address, listener] = args;
  if (
    this["rDocument"].ValidColRow(address.Col(), address.Row()) &&
    address.Col() < this["aCol"].length
  )
    (this["aCol"][address.Col()] as ScColumn).EndListening(listener, address.Row());
}

/** Original CopyRowHeight requires actual source/destination height stores and reads raw heights,not hidden-as-zero queries. @param this - Native sheet. @param source - Source table. @param first - Destination start. @param last - Destination end. @param offset - Source row offset. @returns Nothing. */
export function CopyRowHeight(
  this: ScTable,
  source: ScTable,
  first: number,
  last: number,
  offset: number,
): void {
  for (let row = first; row <= last;) {
    const run: ScFlatUInt16RowRangeData = { mnRow1: 0, mnRow2: 0, mnValue: 0 };
    if (!(source["mpRowHeights"] as ScFlatUInt16RowSegments).getRangeData(row + offset, run))
      return;
    const end = Math.min(last, run.mnRow2 - offset);
    (this["mpRowHeights"] as ScFlatUInt16RowSegments).setValue(row, end, run.mnValue);
    row = end + 1;
  }
}

/** Borrows real compressed geometry boundaries for valid rows with allocated row information. @param this - Native sheet. @param row - Valid row. @returns Native range. */
export function GetRowHeightRange(this: ScTable, row: number): ScFlatUInt16RowRangeData {
  const data = { mnRow1: 0, mnRow2: 0, mnValue: 0 };
  (this["mpRowHeights"] as ScFlatUInt16RowSegments).getRangeData(row, data);
  return data;
}

/** Reads genuine compressed row flag bounds;allocated row information is required. @param this - Native sheet. @param row - Row. @returns Flags and range. */
export function GetRowFlagsRange(
  this: ScTable,
  row: number,
): ReturnType<ScBitMaskCompressedArray["GetRangeData"]> {
  return (this["pRowFlags"] as ScBitMaskCompressedArray).GetRangeData(row);
}

/** Stores geometry without device pixel comparison, as used by import. @param this - Native sheet. @param first - First row. @param last - Last row. @param height - UInt16 twips. @returns Nothing. */
export function SetRowHeightOnly(this: ScTable, first: number, last: number, height: number): void {
  if (
    !this["rDocument"].ValidRow(first) ||
    !this["rDocument"].ValidRow(last) ||
    !this["mpRowHeights"]
  )
    return;
  this["mpRowHeights"].setValue(first, last, height & 0xffff || this.GetOptimalMinRowHeight());
}
