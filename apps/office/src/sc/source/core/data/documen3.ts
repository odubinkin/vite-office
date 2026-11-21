/** @fileoverview Original documen3.cxx document grammar projection and copy-reference traversal;with exact range-name lookup. */
import { Color, COL_AUTO } from "../../../../tools/inc/color";
import type { ScRange } from "../../../inc/address";
import type { ScRangeData } from "../tool/rangenam";
import type { ScDocument } from "../../../inc/document";
import type { ScTableProtection } from "./tabprotection";
import type { RefUpdateContext } from "../../../inc/refupdatecontext";
import { UpdateRefMode } from "../../../inc/global";
import { FormulaGrammar, type AddressConvention } from "../../../../formula/inc/grammar";
/** Returns the native sheet color with the original missing-sheet default. @param this - Workbook. @param tab - Sheet index. @returns Tab color. */
export function GetTabBgColor(this: ScDocument, tab: number): Color {
  return this.FetchTable(tab)?.GetTabBgColor() ?? new Color(COL_AUTO);
}

/** Dispatches tab color to its sheet. @param this - Workbook. @param tab - Sheet index. @param color - Tab color. @returns Nothing. */
export function SetTabBgColor(this: ScDocument, tab: number, color: Readonly<Color>): void {
  this.FetchTable(tab)?.SetTabBgColor(color);
}

/** Checks whether the sheet has the original automatic color. @param this - Workbook. @param tab - Sheet index. @returns Whether the tab uses the default. */
export function IsDefaultTabBgColor(this: ScDocument, tab: number): boolean {
  return this.GetTabBgColor(tab).equals(COL_AUTO);
}

/** Original document grammar-to-reference-convention projection. @param this - Actual document owner. @returns Stored grammar's reference convention. */
export function GetAddressConvention(this: ScDocument): AddressConvention {
  return FormulaGrammar.extractRefConvention(this.GetGrammar()) as AddressConvention;
}
/** Resolves an exact local name before consulting the global scope. @param this - Workbook. @param block - Selected block. @returns Definition and its scope. */
export function GetRangeAtBlock(
  this: ScDocument,
  block: ScRange,
): { readonly data: ScRangeData; readonly sheetLocal: boolean } | undefined {
  if (block.aStart.Tab() === block.aEnd.Tab()) {
    const data = this.GetRangeName(block.aStart.Tab())?.findByRange(block);
    if (data) return { data, sheetLocal: true };
  }
  const data = this.GetRangeName()?.findByRange(block);
  return data && { data, sheetLocal: false };
}
/** Original valid-range and sparse sheet traversal for copy updates. @param this - Actual native owner. @param context - Native context. @param undo - Optional actual undo document. @param includeDraw - Original default true. @param updateNoteCaptionPos - Original default true. @returns Nothing. */
export function UpdateReference(
  this: ScDocument,
  context: RefUpdateContext,
  undo: ScDocument | null = null,
  includeDraw = true,
  updateNoteCaptionPos = true,
): void {
  if (!this.GetSheetLimits().ValidRange(context.maRange)) return;
  if (context.meMode !== UpdateRefMode.URM_COPY)
    throw new Error("Non-copy document reference updates are not implemented");
  const last = Math.min(context.maRange.aEnd.Tab(), this.GetTableCount() - 1);
  for (let tab = context.maRange.aStart.Tab(); tab <= last; ++tab)
    this.FetchTable(tab)?.UpdateReference(context, undo, includeDraw, updateNoteCaptionPos);
}

import { SfxBroadcaster } from "../../../../svl/source/notify/SfxBroadcaster";
import type { SfxListener } from "../../../../svl/source/notify/lstner";
/** Original lazy UNO broadcaster creation and actual registration. @param this - Actual document. @param listener - Native listener. @returns Nothing. */
export function AddUnoObject(this: ScDocument, listener: SfxListener): void {
  if (this["pUnoBroadcaster"] === null) this["pUnoBroadcaster"] = new SfxBroadcaster();
  listener.StartListening(this["pUnoBroadcaster"]);
}
/** Original serial/no-active-BroadcastUno removal. Active finalizer/broadcast waiting remains outside the admitted owner domain. @param this - Actual document. @param listener - Native listener. @returns Nothing. */
export function RemoveUnoObject(this: ScDocument, listener: SfxListener): void {
  if (this["pUnoBroadcaster"] !== null) listener.EndListening(this["pUnoBroadcaster"]);
}
/** Original document language scalar field reads. @param this - Actual document. @param latin - Latin output. @param cjk - CJK output. @param ctl - CTL output. @returns Nothing. */
export function GetLanguage(this: ScDocument, latin: [number], cjk: [number], ctl: [number]): void {
  latin[0] = this["languageFields"].eLanguage;
  cjk[0] = this["languageFields"].eCjkLanguage;
  ctl[0] = this["languageFields"].eCtlLanguage;
}

/** Tests whether the given tab is protected. @param this - Workbook. @param tab - Sheet index. @returns Protection state. */
export function IsTabProtected(this: ScDocument, tab: number): boolean {
  return this.FetchTable(tab)?.IsProtected() ?? false;
}

/** Gets protection from the native sheet. @param this - Workbook. @param tab - Sheet index. @returns Borrowed protection. */
export function GetTabProtection(
  this: ScDocument,
  tab: number,
): Readonly<ScTableProtection> | undefined {
  return this.FetchTable(tab)?.GetProtection();
}

/** Passes protection to the native sheet. @param this - Workbook. @param tab - Sheet index. @param protection - State to copy or clear. @returns Nothing. */
export function SetTabProtection(
  this: ScDocument,
  tab: number,
  protection?: ScTableProtection,
): void {
  this.FetchTable(tab)?.SetProtection(protection);
}
