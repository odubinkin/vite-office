/** @fileoverview ScAttrArray canonical pattern row runs, default-column inheritance and native split/merge algorithm. VCL width caches, stream-copy validity and rich edit-text stripping are outside this document slice. */
import { ScIndentItem } from "../../../inc/attrib";
import { SvxHorJustifyItem } from "../../../../editeng/inc/justifyitem";
import { SvxCellHorJustify } from "../../../../editeng/inc/svxenum";
import { SC_INDENT_STEP } from "../../../inc/global";
import { ATTR_INDENT, ATTR_HOR_JUSTIFY } from "../../../inc/scitems";
import { CellAttributeHolder, ScPatternAttr } from "../../../inc/patattr";
import type { ScDocument } from "../../../inc/document";
import type { ScMergePatternState } from "../../../inc/attarray";
import { SfxItemSet, SfxItemState } from "../../../../svl/inc/itemset";
import { SfxPoolItem } from "../../../../svl/inc/poolitem";
import {
  ATTR_PATTERN_START,
  ATTR_PATTERN_END,
  ATTR_MERGE,
  ATTR_MERGE_FLAG,
} from "../../../inc/scitems";

/** Original lcl_MergeDeep compares inherited values against actual pool defaults;existing invalid states remain invalid. @param merged - Parentless accumulator. @param source - Source pattern set. @returns Nothing. */
function lcl_MergeDeep(merged: SfxItemSet, source: SfxItemSet): void {
  for (let which = ATTR_PATTERN_START; which <= ATTR_PATTERN_END; which++) {
    const oldState = merged.GetItemState(which, false);
    if (oldState === SfxItemState.DEFAULT) {
      if (
        source.GetItemState(which, true) === SfxItemState.SET &&
        !source.Get(which).equals(merged.GetPool().GetUserOrPoolDefaultItem(which))
      )
        merged.InvalidateItem(which);
    } else if (oldState === SfxItemState.SET) {
      if (source.GetItemState(which, true) === SfxItemState.SET) {
        if (
          !SfxPoolItem.areSame(source.GetItemIfSet(which, true), merged.GetItemIfSet(which, false))
        )
          merged.InvalidateItem(which);
      } else if (!merged.Get(which).equals(source.GetPool().GetUserOrPoolDefaultItem(which)))
        merged.InvalidateItem(which);
    }
  }
}
/** Original end-row entry with actual canonical holder ownership. */
class ScAttrEntry extends CellAttributeHolder {
  nEndRow = 0;
}
/** Original column attribute interval owner; rows without cell contents retain real patterns. */
export class ScAttrArray {
  private readonly mvData: ScAttrEntry[] = [];
  /** Original pattern-run selection merge without allocating cells or traversing individual rows. @param startRow - First row. @param endRow - Last row. @param state - Shared accumulator. @param deep - Whether inherited items participate. @returns Nothing. */
  MergePatternArea(
    startRow: number,
    endRow: number,
    state: ScMergePatternState,
    deep: boolean,
  ): void {
    if (!this.rDocument.ValidRow(startRow) || !this.rDocument.ValidRow(endRow)) return;
    const position: [number] = [0];
    let start: number;
    if (this.mvData.length !== 0 && !this.Search(startRow, position)) return;
    do {
      const pattern =
        this.mvData.length === 0
          ? this.rDocument.getCellAttributeHelper().getDefaultCellAttribute()
          : ((this.mvData[position[0]] as ScAttrEntry).getScPatternAttr() as ScPatternAttr);
      if (
        !ScPatternAttr.areSame(pattern, state.aOld1.getScPatternAttr()) &&
        !ScPatternAttr.areSame(pattern, state.aOld2.getScPatternAttr())
      ) {
        const source = pattern.GetItemSet();
        if (state.pItemSet !== undefined) {
          state.mbValidPatternId = false;
          if (deep) lcl_MergeDeep(state.pItemSet, source);
          else state.pItemSet.MergeValues(source);
        } else {
          state.pItemSet = new SfxItemSet(source.GetPool(), source.GetRanges());
          state.pItemSet.Set(source, deep);
          state.mnPatternId = pattern.GetPAKey();
        }
        state.aOld2.assign(state.aOld1);
        state.aOld1.setScPatternAttr(pattern);
      }
      start =
        this.mvData.length !== 0
          ? (this.mvData[position[0]] as ScAttrEntry).nEndRow + 1
          : this.rDocument.MaxRow() + 1;
      position[0]++;
    } while (start <= endRow);
  }
  /** Copies the source default column's runs, retaining real canonical holders. @param nCol - Column or default-column sentinel. @param nTab - Sheet. @param rDocument - Owner. @param defaults - Actual default-column array. @returns Array. */
  constructor(
    private readonly nCol: number,
    private nTab: number,
    private readonly rDocument: ScDocument,
    defaults?: ScAttrArray,
  ) {
    if (nCol !== -1 && defaults !== undefined)
      for (const old of defaults.mvData) {
        const entry = new ScAttrEntry(old);
        entry.nEndRow = old.nEndRow;
        this.mvData.push(entry);
      }
  }
  /** Original sheet-position update. @param tab - Sheet. @returns Nothing. */
  SetTab(tab: number): void {
    this.nTab = tab;
  }
  /** Original ChangeIndent over canonical pattern runs;alignment coercion is independent of numeric changes. @param first - First row. @param last - Last row. @param increment - Increase versus decrease. @returns Nothing. */
  ChangeIndent(first: number, last: number, increment: boolean): void {
    this.SetDefaultIfNotInit();
    const index: [number] = [0];
    this.Search(first, index);
    let row = Math.max(
      first,
      index[0] > 0 ? (this.mvData[index[0] - 1] as ScAttrEntry).nEndRow + 1 : 0,
    );
    while (row <= last) {
      const entry = this.mvData[index[0]] as ScAttrEntry,
        old = entry.getScPatternAttr() as ScPatternAttr,
        set = old.GetItemSet(),
        justify = set.GetItemIfSet(ATTR_HOR_JUSTIFY, false) as SvxHorJustifyItem | undefined,
        needJust =
          !justify ||
          (justify.GetValue() !== SvxCellHorJustify.Left &&
            justify.GetValue() !== SvxCellHorJustify.Right),
        oldValue = (set.Get(ATTR_INDENT) as ScIndentItem).GetValue(),
        width = this.rDocument.GetColWidth(
          this.nCol === -1 ? this.rDocument.MaxCol() : this.nCol,
          this.nTab,
        );
      let value = oldValue;
      if (increment) {
        if (value < width - SC_INDENT_STEP) {
          value = (value + SC_INDENT_STEP) & 0xffff;
          if (value > width - SC_INDENT_STEP) value = width - SC_INDENT_STEP;
        }
      } else if (value > 0) value = value > SC_INDENT_STEP ? value - SC_INDENT_STEP : 0;
      const end = entry.nEndRow;
      if (needJust || value !== oldValue) {
        const next = new ScPatternAttr(old);
        next.ItemSetPut(new ScIndentItem(value));
        if (needJust)
          next.ItemSetPut(new SvxHorJustifyItem(SvxCellHorJustify.Left, ATTR_HOR_JUSTIFY));
        const holder = new CellAttributeHolder(next, true);
        try {
          this.SetPatternArea(row, Math.min(end, last), holder);
        } finally {
          holder.Dispose();
        }
        row = end + 1;
        this.Search(row, index);
      } else {
        row = end + 1;
        ++index[0];
      }
    }
  }
  /** Releases actual logical registrations when a sheet/document is discarded. @returns Nothing. */
  Dispose(): void {
    for (const entry of this.mvData) entry.Dispose();
    this.mvData.length = 0;
  }
  /** Creates the native full-height default run lazily. @returns Nothing. */
  private SetDefaultIfNotInit(): void {
    if (this.mvData.length) return;
    const entry = new ScAttrEntry(
      this.rDocument.getCellAttributeHelper().getDefaultCellAttribute(),
    );
    entry.nEndRow = this.rDocument.MaxRow();
    this.mvData.push(entry);
  }
  /** Native binary search, including the source single-entry fast path. Callers preserve row preconditions. @param row - Row. @param index - Output index. @returns Found. */
  private Search(row: number, index: [number]): boolean {
    if (this.mvData.length === 1) {
      index[0] = 0;
      return true;
    }
    let low = 0,
      high = this.mvData.length - 1;
    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      if ((this.mvData[middle] as ScAttrEntry).nEndRow < row) low = middle + 1;
      else if (middle > 0 && (this.mvData[middle - 1] as ScAttrEntry).nEndRow >= row)
        high = middle - 1;
      else {
        index[0] = middle;
        return true;
      }
    }
    index[0] = 0;
    return false;
  }
  /** Reads native canonical pattern/default. @param row - Row. @returns Pattern or null. */
  GetPattern(row: number): ScPatternAttr | null {
    if (!this.mvData.length)
      return this.rDocument.ValidRow(row)
        ? this.rDocument.getCellAttributeHelper().getDefaultCellAttribute()
        : null;
    const index: [number] = [0];
    return this.Search(row, index)
      ? (this.mvData[index[0]] as ScAttrEntry).getScPatternAttr()
      : null;
  }
  /** Borrows a complete native run without enumerating cells. @param start - Start output. @param end - End output. @param row - Query row. @returns Pattern or null. */
  GetPatternRange(start: [number], end: [number], row: number): ScPatternAttr | null {
    if (!this.mvData.length) {
      if (!this.rDocument.ValidRow(row)) return null;
      start[0] = 0;
      end[0] = this.rDocument.MaxRow();
      return this.rDocument.getCellAttributeHelper().getDefaultCellAttribute();
    }
    const index: [number] = [0];
    if (!this.Search(row, index)) return null;
    start[0] = index[0] > 0 ? (this.mvData[index[0] - 1] as ScAttrEntry).nEndRow + 1 : 0;
    end[0] = (this.mvData[index[0]] as ScAttrEntry).nEndRow;
    return (this.mvData[index[0]] as ScAttrEntry).getScPatternAttr();
  }
  /** Replaces all runs with the supplied real canonical value. @param pattern - Holder. @returns Nothing. */
  Reset(pattern: CellAttributeHolder): void {
    const value = pattern.getScPatternAttr();
    if (value === null) return;
    this.Dispose();
    const entry = new ScAttrEntry(value);
    entry.nEndRow = this.rDocument.MaxRow();
    this.mvData.push(entry);
  }
  /** Original DeleteHardAttr clears direct items while retaining styles and both merge items;canonical runs are re-searched after replacement. @param first - Ordered valid first row. @param last - Ordered valid last row. @returns Nothing. */
  DeleteHardAttr(first: number, last: number): void {
    this.SetDefaultIfNotInit();
    const defaults = new CellAttributeHolder(
        this.rDocument.getCellAttributeHelper().getDefaultCellAttribute(),
      ),
      index: [number] = [0];
    try {
      this.Search(first, index);
      let row = index[0] > 0 ? (this.mvData[index[0] - 1] as ScAttrEntry).nEndRow + 1 : 0;
      if (row < first) row = first;
      while (row <= last) {
        const entry = this.mvData[index[0]] as ScAttrEntry,
          old = entry.getScPatternAttr() as ScPatternAttr;
        if (old.GetItemSet().Count()) {
          const stop = Math.min(entry.nEndRow, last),
            next = new ScPatternAttr(old);
          for (let which = ATTR_PATTERN_START; which <= ATTR_PATTERN_END; which++)
            if (which !== ATTR_MERGE && which !== ATTR_MERGE_FLAG) next.ItemSetClearItem(which);
          if (next.equals(defaults.getScPatternAttr() as ScPatternAttr)) {
            next.Dispose();
            this.SetPatternArea(row, stop, defaults);
          } else {
            const holder = new CellAttributeHolder(next, true);
            try {
              this.SetPatternArea(row, stop, holder);
            } finally {
              holder.Dispose();
            }
          }
          this.Search(row, index);
        }
        ++index[0];
        row = (this.mvData[index[0] - 1] as ScAttrEntry).nEndRow + 1;
      }
    } finally {
      defaults.Dispose();
    }
  }
  /** Original SetPatternAreaImpl logical split/shrink/replace/combine operations. Rich text is not a represented cell alternative. @param start - Ordered first row. @param end - Ordered last row. @param holder - Canonical source. @returns Nothing. */
  SetPatternArea(start: number, end: number, holder: CellAttributeHolder): void {
    const pattern = holder.getScPatternAttr();
    if (pattern === null || !this.rDocument.ValidRow(start) || !this.rDocument.ValidRow(end))
      return;
    if (start === 0 && end === this.rDocument.MaxRow()) {
      this.Reset(holder);
      return;
    }
    this.SetDefaultIfNotInit();
    const same =
      /** Compares actual canonical native patterns. @param index - Existing run. @returns Equality. */ (
        index: number,
      ): boolean =>
        ScPatternAttr.areSame((this.mvData[index] as ScAttrEntry).getScPatternAttr(), pattern);
    let ni = 0;
    if (start > 0) {
      const index: [number] = [0];
      this.Search(start, index);
      ni = index[0];
    }
    let insert: number,
      combined = false,
      split = false;
    if (start > 0) {
      insert = this.rDocument.MaxRow() + 1;
      if (!same(ni)) {
        if (ni === 0 || (this.mvData[ni - 1] as ScAttrEntry).nEndRow < start - 1) {
          if ((this.mvData[ni] as ScAttrEntry).nEndRow > end) split = true;
          ni++;
          insert = ni;
        } else {
          // Search guarantees previousEnd < start; after the < start-1 test,
          // native integer row endpoints necessarily satisfy previousEnd === start-1.
          insert = ni;
        }
      }
      if (ni > 0 && same(ni - 1)) {
        (this.mvData[ni - 1] as ScAttrEntry).nEndRow = end;
        insert = this.rDocument.MaxRow() + 1;
        combined = true;
      }
    } else insert = 0;
    let nj = ni;
    while (nj < this.mvData.length && (this.mvData[nj] as ScAttrEntry).nEndRow <= end) nj++;
    if (!split) {
      if (nj < this.mvData.length && same(nj)) {
        if (ni > 0) {
          if (same(ni - 1)) {
            (this.mvData[ni - 1] as ScAttrEntry).nEndRow = (this.mvData[nj] as ScAttrEntry).nEndRow;
            nj++;
          } else if (ni === insert) (this.mvData[ni - 1] as ScAttrEntry).nEndRow = start - 1;
        }
        insert = this.rDocument.MaxRow() + 1;
        combined = true;
      } else if (ni > 0 && ni === insert) (this.mvData[ni - 1] as ScAttrEntry).nEndRow = start - 1;
    }
    if (ni < nj) {
      if (!combined) {
        (this.mvData[ni] as ScAttrEntry).nEndRow = end;
        (this.mvData[ni] as ScAttrEntry).setScPatternAttr(pattern);
        ni++;
        insert = this.rDocument.MaxRow() + 1;
      }
      for (const entry of this.mvData.splice(ni, nj - ni)) entry.Dispose();
    }
    if (insert < this.rDocument.MaxRow() + 1) {
      if (!split) this.mvData.splice(insert, 0, new ScAttrEntry());
      else {
        const tail = new ScAttrEntry(this.mvData[insert - 1] as ScAttrEntry);
        tail.nEndRow = (this.mvData[insert - 1] as ScAttrEntry).nEndRow;
        this.mvData.splice(insert, 0, new ScAttrEntry(), tail);
      }
      if (insert) (this.mvData[insert - 1] as ScAttrEntry).nEndRow = start - 1;
      (this.mvData[insert] as ScAttrEntry).nEndRow = end;
      (this.mvData[insert] as ScAttrEntry).setScPatternAttr(pattern);
    }
  }
}
