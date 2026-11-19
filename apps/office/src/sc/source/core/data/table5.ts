/** @fileoverview Native table5 manual/page-break sets and ownership transfers;pagination/device calculation remains outside this kernel slice. */
import type { ScTable } from "../../../inc/table";
import { ScTableProtection } from "./tabprotection";
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
