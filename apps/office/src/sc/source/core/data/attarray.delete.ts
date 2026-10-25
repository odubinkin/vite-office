/** @fileoverview Original attarray.cxx deletion/merge responsibilities partitioned from its size-bounded ScAttrArray facade;all operations use the same native attribute owner. */
import type { ScDocumentPool } from "./docpool";
import type { ScAttrArray, ScAttrEntry } from "./attarray";
import { CellAttributeHolder, ScPatternAttr } from "../../../inc/patattr";
import { ScMergeAttr, ScMergeFlagAttr, ScMF } from "../../../inc/attrib";
import { ATTR_MERGE, ATTR_MERGE_FLAG } from "../../../inc/scitems";
import { HasAttrFlags } from "../../../inc/global";
/** Original merge-anchor removal clears the full actual merge rectangle before deleting attributes. @param this - Actual attribute array. @param first - First row. @param last - Last row. @returns Nothing. */
export function RemoveAreaMerge(this: ScAttrArray, first: number, last: number): void {
  if (this["nCol"] === -1) throw Error("RemoveAreaMerge requires a real column");
  this["SetDefaultIfNotInit"]();
  const entries = this["mvData"],
    doc = this["rDocument"],
    index: [number] = [0];
  this["Search"](first, index);
  let row = Math.max(first, index[0] > 0 ? (entries[index[0] - 1] as ScAttrEntry).nEndRow + 1 : 0);
  while (row <= last) {
    const stop = Math.min((entries[index[0]] as ScAttrEntry).nEndRow, last),
      pattern = (entries[index[0]] as ScAttrEntry).getScPatternAttr() as ScPatternAttr,
      merge = pattern.GetItem(ATTR_MERGE) as ScMergeAttr,
      columns = merge.GetColMerge(),
      rows = merge.GetRowMerge();
    if (columns > 1 || rows > 1) {
      const attr = (doc.GetPool() as ScDocumentPool).GetUserOrPoolDefaultItem(ATTR_MERGE),
        flag = (doc.GetPool() as ScDocumentPool).GetUserOrPoolDefaultItem(ATTR_MERGE_FLAG),
        col = this["nCol"],
        tab = this["nTab"];
      for (let current = row; current <= stop; ++current) doc.ApplyAttr(col, current, tab, attr);
      const delta = new ScPatternAttr(doc.getCellAttributeHelper());
      try {
        delta.ItemSetPut(flag);
        doc.ApplyPatternAreaTab(col, row, col + columns - 1, stop + rows - 1, tab, delta);
      } finally {
        delta.Dispose();
      }
      this["Search"](stop, index);
    }
    ++index[0];
    row =
      index[0] < entries.length
        ? (entries[index[0] - 1] as ScAttrEntry).nEndRow + 1
        : doc.MaxRow() + 1;
  }
}
/** Original safe assignment retains overlapping/autofilter flags from each canonical old run. @param this - Actual attribute array. @param first - First row. @param last - Last row. @param wanted - Borrowed wanted holder. @returns Nothing. */
export function SetPatternAreaSafe(
  this: ScAttrArray,
  first: number,
  last: number,
  wanted: CellAttributeHolder,
): void {
  this["SetDefaultIfNotInit"]();
  const entries = this["mvData"],
    index: [number] = [0];
  this["Search"](first, index);
  let row = index[0] > 0 ? (entries[index[0] - 1] as ScAttrEntry).nEndRow + 1 : 0;
  while (row <= last) {
    const old = entries[index[0]] as ScAttrEntry;
    if (!CellAttributeHolder.areSame(old, wanted)) {
      if (row < first) row = first;
      const stop = Math.min((entries[index[0]] as ScAttrEntry).nEndRow, last),
        flag = (old.getScPatternAttr() as ScPatternAttr).GetItem(
          ATTR_MERGE_FLAG,
        ) as ScMergeFlagAttr;
      if (flag.IsOverlapped() || flag.HasAutoFilter()) {
        const next = new ScPatternAttr(wanted.getScPatternAttr() as ScPatternAttr);
        next.ItemSetPut(flag);
        const holder = new CellAttributeHolder(next, true);
        try {
          this.SetPatternArea(row, stop, holder);
        } finally {
          holder.Dispose();
        }
      } else this.SetPatternArea(row, stop, wanted);
      this["Search"](row, index);
    }
    ++index[0];
    row = (entries[index[0] - 1] as ScAttrEntry).nEndRow + 1;
  }
}
/** Original full attribute deletion removes anchor merges and resets actual styles while retaining foreign merge/autofilter flags. @param this - Actual attribute array. @param first - First row. @param last - Last row. @returns Nothing. */
export function DeleteArea(this: ScAttrArray, first: number, last: number): void {
  this["SetDefaultIfNotInit"]();
  if (this["nCol"] !== -1) this.RemoveAreaMerge(first, last);
  const defaults = new CellAttributeHolder(
    this["rDocument"].getCellAttributeHelper().getDefaultCellAttribute(),
  );
  try {
    if (!this.HasAttrib(first, last, HasAttrFlags.Overlapped | HasAttrFlags.AutoFilter))
      this.SetPatternArea(first, last, defaults);
    else this.SetPatternAreaSafe(first, last, defaults);
  } finally {
    defaults.Dispose();
  }
}

/** Original merge envelope and refresh re-search after actual flag mutations. @param this - Actual owner. @param col - Source column. @param first - First row. @param last - Last row. @param paintCol - Last column output. @param paintRow - Last row output. @param refresh - Native defaultfalse. @returns Whether a merge was found. */
export function ExtendMerge(
  this: ScAttrArray,
  col: number,
  first: number,
  last: number,
  paintCol: [number],
  paintRow: [number],
  refresh = false,
): boolean {
  if (this["nCol"] === -1) throw Error("Default-column ExtendMerge assertion");
  this["SetDefaultIfNotInit"]();
  const start: [number] = [0],
    end: [number] = [0];
  this["Search"](first, start);
  this["Search"](last, end);
  let found = false;
  for (let i = start[0]; i <= end[0]; ++i) {
    const pattern = (this["mvData"][i] as ScAttrEntry).getScPatternAttr() as ScPatternAttr;
    const merge = pattern.GetItem(ATTR_MERGE) as ScMergeAttr;
    const columns = merge.GetColMerge(),
      rows = merge.GetRowMerge();
    if (columns > 1 || rows > 1) {
      const row = i > 0 ? (this["mvData"][i - 1] as ScAttrEntry).nEndRow + 1 : 0;
      const endCol = col + columns - 1,
        endRow = row + rows - 1;
      if (endCol > paintCol[0] && endCol <= this["rDocument"].MaxCol()) paintCol[0] = endCol;
      if (endRow > paintRow[0] && endRow <= this["rDocument"].MaxRow()) paintRow[0] = endRow;
      found = true;
      if (refresh) {
        const doc = this["rDocument"],
          tab = this["nTab"];
        if (endCol > col)
          doc.ApplyFlagsTab(
            col + 1,
            row,
            endCol,
            (this["mvData"][i] as ScAttrEntry).nEndRow,
            tab,
            ScMF.Hor,
          );
        if (endRow > row) doc.ApplyFlagsTab(col, row + 1, col, endRow, tab, ScMF.Ver);
        if (endCol > col && endRow > row)
          doc.ApplyFlagsTab(col + 1, row + 1, endCol, endRow, tab, ScMF.Hor | ScMF.Ver);
        const current: [number] = [i];
        this["Search"](row, current);
        i = current[0];
        this["Search"](first, start);
        this["Search"](last, end);
      }
    }
  }
  return found;
}

/** Original ApplyFlags run mutation with canonical holders and post-split re-search. @param this - Actual owner. @param first - First row. @param last - Last row. @param flags - Native flags. @returns Whether changed. */
export function ApplyFlags(this: ScAttrArray, first: number, last: number, flags: ScMF): boolean {
  this["SetDefaultIfNotInit"]();
  const entries = this["mvData"],
    index: [number] = [0];
  this["Search"](first, index);
  let row = index[0] > 0 ? (entries[index[0] - 1] as ScAttrEntry).nEndRow + 1 : 0;
  if (row < first) row = first;
  let changed = false;
  while (row <= last) {
    const entry = entries[index[0]] as ScAttrEntry,
      pattern = entry.getScPatternAttr() as ScPatternAttr;
    const old = (pattern.GetItem(ATTR_MERGE_FLAG) as ScMergeFlagAttr).GetValue();
    if ((old | flags) !== old) {
      const stop = Math.min(entry.nEndRow, last),
        next = new ScPatternAttr(pattern);
      next.ItemSetPut(new ScMergeFlagAttr(old | flags));
      const holder = new CellAttributeHolder(next, true);
      try {
        this.SetPatternArea(row, stop, holder);
      } finally {
        holder.Dispose();
      }
      this["Search"](row, index);
      changed = true;
    }
    ++index[0];
    row = (entries[index[0] - 1] as ScAttrEntry).nEndRow + 1;
  }
  return changed;
}

/** Original RemoveFlags run mutation with canonical holders and post-split re-search. @param this - Actual owner. @param first - First row. @param last - Last row. @param flags - Native flags. @returns Whether changed. */
export function RemoveFlags(this: ScAttrArray, first: number, last: number, flags: ScMF): boolean {
  this["SetDefaultIfNotInit"]();
  const entries = this["mvData"],
    index: [number] = [0];
  this["Search"](first, index);
  let row = index[0] > 0 ? (entries[index[0] - 1] as ScAttrEntry).nEndRow + 1 : 0;
  if (row < first) row = first;
  let changed = false;
  while (row <= last) {
    const entry = entries[index[0]] as ScAttrEntry,
      pattern = entry.getScPatternAttr() as ScPatternAttr;
    const old = (pattern.GetItem(ATTR_MERGE_FLAG) as ScMergeFlagAttr).GetValue();
    if ((old & ~flags) !== old) {
      const stop = Math.min(entry.nEndRow, last),
        next = new ScPatternAttr(pattern);
      next.ItemSetPut(new ScMergeFlagAttr(old & ~flags));
      const holder = new CellAttributeHolder(next, true);
      try {
        this.SetPatternArea(row, stop, holder);
      } finally {
        holder.Dispose();
      }
      this["Search"](row, index);
      changed = true;
    }
    ++index[0];
    row = (entries[index[0] - 1] as ScAttrEntry).nEndRow + 1;
  }
  return changed;
}
