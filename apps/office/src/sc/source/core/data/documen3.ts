/** @fileoverview Original documen3.cxx document grammar projection and copy-reference traversal;with exact range-name lookup. */
import { Color, COL_AUTO } from "../../../../tools/inc/color";
import { ScAddress, type ScRange } from "../../../inc/address";
import type { ScRangeList } from "../../../inc/rangelst";
import type { ScRangeData } from "../tool/rangenam";
import type { ScDocument } from "../../../inc/document";
import type { ScTableProtection } from "./tabprotection";
import type { RefUpdateContext } from "../../../inc/refupdatecontext";
import { CellType, ScLinkMode, UpdateRefMode } from "../../../inc/global";
import { FormulaGrammar, type AddressConvention } from "../../../../formula/inc/grammar";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../../sal/inc/rtl/ustrbuf";
import { ScMF, type ScMergeAttr, type ScMergeFlagAttr } from "../../../inc/attrib";
import {
  ATTR_HOR_JUSTIFY,
  ATTR_MERGE,
  ATTR_MERGE_FLAG,
  ATTR_VER_JUSTIFY,
} from "../../../inc/scitems";
import { ScCellValue } from "../../../inc/cellvalue";
import { ScCellFormat } from "../tool/cellform";
import { GetMergeFlags } from "./document10";
import { SvxHorJustifyItem, SvxVerJustifyItem } from "../../../../editeng/inc/justifyitem";
import { SvxCellHorJustify, SvxCellVerJustify } from "../../../../editeng/inc/svxenum";
import type { ScMarkData } from "../../../inc/markdata";
import type { ScPatternStyleReference } from "../../../inc/patattr";

/** Applies a named style across the original selected workbook sheets. @param this - Actual workbook. @param style - Native cell style. @param marks - Actual selection. @returns Nothing. */
export function ApplySelectionStyle(
  this: ScDocument,
  style: ScPatternStyleReference,
  marks: ScMarkData,
): void {
  const simple = marks.IsMarked() && !marks.IsMultiMarked();
  const area = simple ? marks.GetMarkArea() : undefined;
  for (const tab of marks) {
    if (tab >= this.GetTableCount()) break;
    if (area) {
      this.ApplyStyleAreaTab(
        area.aStart.Col(),
        area.aStart.Row(),
        area.aEnd.Col(),
        area.aEnd.Row(),
        tab,
        style,
      );
    } else this.FetchTable(tab)?.ApplySelectionStyle(style, marks);
  }
}

/** Reads the common source style across both native mark representations, including filtered rows. @param this - Workbook. @param marks - Actual selection. @returns Uniform style or null. */
export function GetSelectionStyle(
  this: ScDocument,
  marks: ScMarkData,
): ScPatternStyleReference | null {
  const count = this.GetTableCount();
  let style: ScPatternStyleReference | undefined;
  if (marks.IsMultiMarked()) {
    for (const tab of marks) {
      if (tab >= count) break;
      const next = this.FetchTable(tab)?.GetSelectionStyle(marks);
      if (next === undefined) continue;
      if (!next || (style && style !== next)) return null;
      style = next;
    }
  }
  if (marks.IsMarked()) {
    const { aStart, aEnd } = marks.GetMarkArea();
    for (let tab = aStart.Tab(); tab <= aEnd.Tab() && tab < count; tab++) {
      if (!marks.GetTableSelect(tab)) continue;
      const next = this.FetchTable(tab)?.GetAreaStyle(
        aStart.Col(),
        aStart.Row(),
        aEnd.Col(),
        aEnd.Row(),
      );
      if (next === undefined) continue;
      if (!next || (style && style !== next)) return null;
      style = next;
    }
  }
  return style ?? null;
}

/** Applies the source merge-and-center format to the origin cell. @param document - Actual workbook. @param anchor - Merge origin. @returns Nothing. */
export function ApplyMergeAlignment(document: ScDocument, anchor: ScAddress): void {
  const horizontal = new SvxHorJustifyItem(SvxCellHorJustify.Center, ATTR_HOR_JUSTIFY);
  const vertical = new SvxVerJustifyItem(SvxCellVerJustify.Center, ATTR_VER_JUSTIFY);
  try {
    document.ApplyAttr(anchor.Col(), anchor.Row(), anchor.Tab(), horizontal);
    document.ApplyAttr(anchor.Col(), anchor.Row(), anchor.Tab(), vertical);
  } finally {
    horizontal.Dispose();
    vertical.Dispose();
  }
}

/** Resolves the native display string after interpreting a formula with an inherited format. @param document - Actual workbook. @param position - Source cell. @returns Owned cell display string. */
function GetString(document: ScDocument, position: ScAddress): OUString {
  const cell = document.GetRefCellValue(position);
  if (cell.isEmpty()) return new OUString();
  cell.getFormula()?.GetErrCode();
  const context = document.GetNonThreadedContext();
  const format = document.GetPattern(position)?.GetNumberFormat(context) ?? 0;
  return ScCellFormat.GetString(cell, format, [null], context, document);
}

/** Joins displayed cell contents in source row order and preserves the first rich-text cell when the anchor is empty. @param this - Actual workbook. @param startCol - First column. @param startRow - First row. @param endCol - Last column. @param endRow - Last row. @param tab - Source sheet. @returns Nothing. */
export function DoMergeContents(
  this: ScDocument,
  startCol: number,
  startRow: number,
  endCol: number,
  endRow: number,
  tab: number,
): void {
  const anchor = new ScAddress(startCol, startRow, tab),
    total = new OUStringBuffer(),
    empty = new OUString();
  let rich = new ScCellValue();
  try {
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const position = new ScAddress(col, row, tab);
        const value = GetString(this, position);
        try {
          if (value.getLength()) {
            if (total.getLength()) total.appendUtf32(0x20);
            total.append(value);
            if (rich.isEmpty() && this.GetCellType(position) === CellType.CELLTYPE_EDIT)
              rich = new ScCellValue(this.GetRefCellValue(position));
          }
        } finally {
          value.dispose();
        }
        if (col !== startCol || row !== startRow) this.SetString(position, empty);
      }
    }
    const anchorText = GetString(this, anchor);
    const replace = rich.isEmpty() || anchorText.getLength() !== 0;
    anchorText.dispose();
    if (replace) {
      const value = total.makeStringAndClear();
      try {
        this.SetString(anchor, value);
      } finally {
        value.dispose();
      }
    } else rich.release(this, anchor);
  } finally {
    rich.clear();
    empty.dispose();
    total.dispose();
  }
}

/** Clears covered contents using the original string setter and leaves the anchor alone. @param this - Actual workbook. @param startCol - First column. @param startRow - First row. @param endCol - Last column. @param endRow - Last row. @param tab - Source sheet. @returns Nothing. */
export function DoEmptyBlock(
  this: ScDocument,
  startCol: number,
  startRow: number,
  endCol: number,
  endRow: number,
  tab: number,
): void {
  const empty = new OUString();
  try {
    for (let row = startRow; row <= endRow; row++)
      for (let col = startCol; col <= endCol; col++)
        if (col !== startCol || row !== startRow) this.SetString(col, row, tab, empty);
  } finally {
    empty.dispose();
  }
}

/** Applies the original merge span and coverage to the actual sheet. @param this - Actual workbook. @param startCol - First column. @param startRow - First row. @param endCol - Last column. @param endRow - Last row. @param tab - Source sheet. @returns Nothing. */
export function DoMerge(
  this: ScDocument,
  startCol: number,
  startRow: number,
  endCol: number,
  endRow: number,
  tab: number,
): void {
  this.FetchTable(tab)?.SetMergedCells(startCol, startRow, endCol, endRow);
}

/** Clears the native overlap flags and restores the pool's span default. @param this - Actual workbook. @param col - Anchor column. @param row - Anchor row. @param tab - Sheet. @returns Nothing. */
export function RemoveMerge(this: ScDocument, col: number, row: number, tab: number): void {
  const attr = this.GetPattern(new ScAddress(col, row, tab))?.GetItem(ATTR_MERGE) as
    ScMergeAttr | undefined;
  const defaultItem = this.GetPool()?.GetUserOrPoolDefaultItem(ATTR_MERGE);
  if (!attr?.IsMerged() || !defaultItem) return;
  this.RemoveFlagsTab(
    col,
    row,
    col + attr.GetColMerge() - 1,
    row + attr.GetRowMerge() - 1,
    tab,
    ScMF.Hor | ScMF.Ver,
  );
  this.ApplyAttr(col, row, tab, defaultItem);
}

/** Resolves the merge anchor by walking horizontal flags followed by vertical flag runs. @param this - Document. @param col - Column. @param row - Row. @param tab - Sheet. @returns Anchor coordinates. */
export function SkipOverlapped(
  this: ScDocument,
  col: number,
  row: number,
  tab: number,
): [number, number] {
  while (GetMergeFlags.call(this, col, row, tab)?.IsHorOverlapped()) --col;
  const column = this.FetchTable(tab)?.FetchColumn(col);
  const first: [number] = [row],
    last: [number] = [row];
  while (column && row >= 0) {
    const pattern = column.GetPatternRange(first, last, row);
    if (!(pattern?.GetItem(ATTR_MERGE_FLAG) as ScMergeFlagAttr | undefined)?.IsVerOverlapped())
      break;
    row = first[0] - 1;
  }
  return [col, row];
}
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

/** Queries original unlocked ranges on one sheet. @param this - Workbook. @param ranges - Output owner. @param tab - Sheet. @returns Nothing. */
export function GetUnprotectedCells(this: ScDocument, ranges: ScRangeList, tab: number): void {
  this.FetchTable(tab)?.GetUnprotectedCells(ranges);
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

/** Reports the native linked state of a sheet. @param this - Workbook. @param tab - Native sheet index. @returns Whether linked. */
export function IsLinked(this: ScDocument, tab: number): boolean {
  return this.FetchTable(tab)?.IsLinked() ?? false;
}

/** Queries the original sheet link mode. @param this - Workbook. @param tab - Native sheet index. @returns Link mode or none. */
export function GetLinkMode(this: ScDocument, tab: number): ScLinkMode {
  return this.FetchTable(tab)?.GetLinkMode() ?? ScLinkMode.NONE;
}

/** Copies the external file URL. @param this - Workbook. @param tab - Native sheet index. @returns Owned URL. */
export function GetLinkDoc(this: ScDocument, tab: number): OUString {
  const table = this.FetchTable(tab);
  return table ? new OUString(table.GetLinkDoc()) : new OUString();
}

/** Copies the external file filter name. @param this - Workbook. @param tab - Native sheet index. @returns Owned filter name. */
export function GetLinkFlt(this: ScDocument, tab: number): OUString {
  const table = this.FetchTable(tab);
  return table ? new OUString(table.GetLinkFlt()) : new OUString();
}

/** Copies the external file filter options. @param this - Workbook. @param tab - Native sheet index. @returns Owned options. */
export function GetLinkOpt(this: ScDocument, tab: number): OUString {
  const table = this.FetchTable(tab);
  return table ? new OUString(table.GetLinkOpt()) : new OUString();
}

/** Copies the name of the external sheet. @param this - Workbook. @param tab - Native sheet index. @returns Owned source name. */
export function GetLinkTab(this: ScDocument, tab: number): OUString {
  const table = this.FetchTable(tab);
  return table ? new OUString(table.GetLinkTab()) : new OUString();
}

/** Returns the original refresh delay. @param this - Workbook. @param tab - Native sheet index. @returns Seconds. */
export function GetLinkRefreshDelay(this: ScDocument, tab: number): number {
  return this.FetchTable(tab)?.GetLinkRefreshDelay() ?? 0;
}

/** Sets link values on the canonical sheet. @param this - Workbook. @param sheet - Actual sheet index. @param mode - Native link mode. @param doc - File URL. @param filter - Native filter. @param options - Filter options. @param tab - Source sheet name. @param delay - Refresh seconds. @returns Nothing. */
export function SetLink(
  this: ScDocument,
  sheet: number,
  mode: ScLinkMode,
  doc: OUStringConstReference,
  filter: OUStringConstReference,
  options: OUStringConstReference,
  tab: OUStringConstReference,
  delay: number,
): void {
  this.FetchTable(sheet)?.SetLink(mode, doc, filter, options, tab, delay);
}
