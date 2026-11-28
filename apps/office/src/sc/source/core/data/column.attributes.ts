/** @fileoverview Owns Calc column pattern runs, including the native default column. */
import type { HasAttrFlags } from "../../../inc/global";
import type { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import type { ScLineFlags, ScMergePatternState } from "../../../inc/attarray";
import type { SvxBoxItem, SvxBoxInfoItem } from "../../../../editeng/source/items/frmitems";
import type { ScDocument } from "../../../inc/document";
import type { ScMarkData } from "../../../inc/markdata";
import { ScItemPoolCache } from "../../../inc/poolcach";
import type { ScInterpreterContext } from "../../../inc/interpretercontext";
import { ScMultiSelIter } from "../../../inc/markmulti";
import { ScAttrArray, type ScAttrEntry } from "./attarray";
import type {
  ScPatternAttr,
  CellAttributeHolder,
  ScPatternStyleReference,
} from "../../../inc/patattr";

/** Attribute portion of native ScColumnData, also used for the real default column. */
export class ScColumnData {
  /** Original existing-line mutation traverses only actual multi marks. @param marks - Marks. @param line - Style or absence. @param colorOnly - Color mode. @returns Nothing. */
  ApplySelectionLineStyle(
    marks: ScMarkData,
    line: SvxBorderLine | undefined,
    colorOnly: boolean,
  ): void {
    if (colorOnly && !line) return;
    if (marks.IsMultiMarked()) {
      const iter = new ScMultiSelIter(marks.GetMultiSelData(), this.nCol);
      for (let span = iter.Next(0, 0); span[0]; span = iter.Next(0, 0))
        this.pAttrArray.ApplyLineStyleArea(span[1], span[2], line, colorOnly);
    }
  }
  /** Original native frame accumulation delegation. @param outer - Outer accumulator. @param inner - Inner accumulator. @param flags - Shared flags. @param first - First row. @param last - Last row. @param left - First column. @param right - Right distance. @returns Nothing. */
  MergeBlockFrame(
    outer: SvxBoxItem,
    inner: SvxBoxInfoItem,
    flags: ScLineFlags,
    first: number,
    last: number,
    left: boolean,
    right: number,
  ): void {
    this.pAttrArray.MergeBlockFrame(outer, inner, flags, first, last, left, right);
  }
  /** Original frame delegation to actual attribute runs. @param outer - Outer lines. @param inner - Inner lines. @param first - First row. @param last - Last row. @param left - Left column. @param distance - Distance to right edge. @returns Nothing. */
  ApplyBlockFrame(
    outer: SvxBoxItem,
    inner: SvxBoxInfoItem,
    first: number,
    last: number,
    left: boolean,
    distance: number,
  ): void {
    this.pAttrArray.ApplyBlockFrame(outer, inner, first, last, left, distance);
  }
  /** Original selection indentation delegates to actual attributes. @param first - First row. @param last - Last row. @param increment - Direction. @returns Nothing. */
  ChangeSelectionIndent(first: number, last: number, increment: boolean): void {
    this.pAttrArray.ChangeIndent(first, last, increment);
  }
  /** Original column.hxx forwarding to the actual attribute array. @param state - Selection accumulator. @param first - First row. @param last - Last row. @param deep - Include inherited items. @returns Nothing. */
  MergePatternArea(state: ScMergePatternState, first: number, last: number, deep: boolean): void {
    this.pAttrArray.MergePatternArea(first, last, state, deep);
  }
  protected nCol = 0;
  protected nTab = 0;
  /** Original column attribute query delegates to its actual row runs. @param first - First row. @param last - Last row. @param mask - Native mask. @returns Found. */
  HasAttrib(first: number, last: number, mask: HasAttrFlags): boolean {
    return this.pAttrArray.HasAttrib(first, last, mask);
  }
  protected pAttrArray: ScAttrArray;
  /** Creates an uninitialized-position attribute owner. @param rDocument - Document. @returns Owner. */
  constructor(protected readonly rDocument: ScDocument) {
    this.pAttrArray = new ScAttrArray(0, 0, rDocument);
  }
  /** Initializes native position and default-column inheritance. @param col - Column or sentinel. @param tab - Sheet. @param defaults - Real default column. @returns Nothing. */
  Init(col: number, tab: number, defaults?: ScColumnData): void {
    this.nCol = col;
    this.nTab = tab;
    this.pAttrArray.Dispose();
    this.pAttrArray = new ScAttrArray(col, tab, this.rDocument, defaults?.pAttrArray);
  }
  /** Updates source sheet position. @param tab - Sheet. @returns Nothing. */
  SetTabNo(tab: number): void {
    this.nTab = tab;
    this.pAttrArray.SetTab(tab);
  }
  /** Releases real canonical registrations. @returns Nothing. */
  DisposeAttributes(): void {
    this.pAttrArray.Dispose();
  }
  /** Borrows a canonical pattern. @param row - Row. @returns Pattern or null. */
  GetPattern(row: number): ScPatternAttr | null {
    return this.pAttrArray.GetPattern(row);
  }
  /** Original column.hxx number-format forwarding uses this column's actual canonical pattern. @param context - Actual interpreter context. @param row - Valid row. @returns Effective native format key. */
  GetNumberFormat(context: ScInterpreterContext, row: number): number {
    return (this.pAttrArray.GetPattern(row) as ScPatternAttr).GetNumberFormat(context);
  }
  /** Reads a uniform number format across native pattern runs. @param first - First row. @param last - Last row. @returns Format key or General on a mismatch. */
  GetNumberFormatRange(first: number, last: number): number {
    const formatter = this.rDocument.GetFormatTable();
    const start: [number] = [0],
      end: [number] = [0];
    let result: number | undefined;
    for (let row = first; row <= last; row = end[0] + 1) {
      const pattern = this.GetPatternRange(start, end, row);
      if (!pattern) return 0;
      const key = pattern.GetNumberFormat(formatter);
      if (result !== undefined && result !== key) return 0;
      result = key;
    }
    return result ?? 0;
  }
  /** Borrows a complete attribute run. @param start - First output. @param end - Last output. @param row - Query row. @returns Pattern or null. */
  GetPatternRange(start: [number], end: [number], row: number): ScPatternAttr | null {
    return this.pAttrArray.GetPatternRange(start, end, row);
  }

  /** Reads one column's style identity across native pattern runs. @param first - First row. @param last - Last row. @returns Uniform style, null for mixed, or undefined for no rows. */
  GetAreaStyle(first: number, last: number): ScPatternStyleReference | null | undefined {
    const start: [number] = [0],
      end: [number] = [0];
    let style: ScPatternStyleReference | undefined;
    for (let row = first; row <= last; row = end[0] + 1) {
      const pattern = this.GetPatternRange(start, end, row);
      if (!pattern) break;
      const next = pattern.GetStyleSheet();
      if (!next || (style && style !== next)) return null;
      style = next;
    }
    return style;
  }

  /** Replaces actual run attributes. @param start - Ordered first row. @param end - Ordered last row. @param pattern - Canonical holder. @returns Nothing. */
  SetPatternArea(start: number, end: number, pattern: CellAttributeHolder): void {
    this.pAttrArray.SetPatternArea(start, end, pattern);
  }
  /** Original column.cxx itemset cache applies real canonical patterns and optional change output. @param first - First row. @param last - Last row. @param cache - Borrowed shared cache. @param changed - Original changed flag. @returns Nothing. */
  ApplyCacheArea(first: number, last: number, cache: ScItemPoolCache, changed?: [boolean]): void {
    this.pAttrArray.ApplyCacheArea(first, last, cache, changed);
  }
  /** Original column.hxx vector move forwarding to the actual attribute owner. @param entries - Owned original row runs. @returns Nothing. */
  SetAttrEntries(entries: ScAttrEntry[]): void {
    this.pAttrArray.SetAttrEntries(entries);
  }
  /** Passes the named style to the native column attribute runs. @param first - First row. @param last - Last row. @param style - Native style. @returns Nothing. */
  ApplyStyleArea(first: number, last: number, style: ScPatternStyleReference): void {
    this.pAttrArray.ApplyStyleArea(first, last, style);
  }

  /** Original ApplyPatternArea owns one actual native itemset cache. @param start - First row. @param end - Last row. @param delta - Borrowed actual pattern. @returns Stored attribute change. */
  ApplyPatternArea(start: number, end: number, delta: ScPatternAttr): boolean {
    const cache = new ScItemPoolCache(this.rDocument.getCellAttributeHelper(), delta.GetItemSet()),
      changed: [boolean] = [false];
    try {
      this.pAttrArray.ApplyCacheArea(start, end, cache, changed);
      return changed[0];
    } finally {
      cache.Dispose();
    }
  }
}
