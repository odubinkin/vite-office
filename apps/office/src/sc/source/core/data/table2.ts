/** @fileoverview Original table2.cxx default-content clipboard dispatch over real contiguous columns. */
import { MatrixEdge } from "../../../inc/types";
import { ScRange } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import type { ScMarkData } from "../../../inc/markdata";
import { ScBitMaskCompressedArray } from "../../../inc/compressedarray";
import {
  ScConditionalFormatList,
  ScConditionalFormat,
  ScCondDateFormatEntry,
} from "../../../inc/conditio";
import { RefUpdateContext } from "../../../inc/refupdatecontext";
import { UpdateRefMode, ScCloneFlags } from "../../../inc/global";
import { DelayFormulaGroupingSwitch } from "../../../inc/scopetools";
import { AutoCalcSwitch } from "../../../inc/scopetools";
import type { CopyToDocContext } from "../../../inc/clipcontext";
import { InsertDeleteFlags } from "../../../inc/global";
import type { ColumnSpanSet } from "../../../inc/columnspanset";
import type { SfxHintId } from "../../../../svl/inc/hint";
import type { ScTable } from "../../../inc/table";
import type { ScColumn } from "../../../inc/column";
import type { ScMF } from "../../../inc/attrib";
import { ScMergeAttr } from "../../../inc/attrib";
import type { ScPatternAttr } from "../../../inc/patattr";
import { ATTR_MERGE } from "../../../inc/scitems";
import type { CopyFromClipContext } from "../../../inc/clipcontext";
import type { EditTextObject } from "../../../../editeng/inc/editobj";
import type { SharedStringConstReference } from "../../../../svl/inc/sharedstring";
/** Returns the data-only extent consumed by the native text exporter. @param this - Table. @param endCol - Last column. @param endRow - Last row. @returns Whether data exists. */
export function GetCellArea(this: ScTable, endCol: [number], endRow: [number]): boolean {
  this.GetLastDataPos(endCol, endRow);
  return this["aCol"].some((column) => !column.IsEmptyData());
}
/** Stores an owned EditEngine cell object at a valid position. @param this - Table. @param col - Column. @param row - Row. @param value - Object. @returns Nothing. */
export function SetEditText(this: ScTable, col: number, row: number, value: EditTextObject): void {
  if (this["rDocument"].ValidColRow(col, row))
    this.CreateColumnIfNotExists(col).SetEditText(row, value);
}
/** Writes a shared string at a valid cell. @param this - Table. @param col - Column. @param row - Row. @param value - Shared string. @returns Nothing. */
export function SetRawString(
  this: ScTable,
  col: number,
  row: number,
  value: SharedStringConstReference,
): void {
  if (this["rDocument"].ValidColRow(col, row))
    this.CreateColumnIfNotExists(col).SetRawString(row, value);
}
/** Original validated general clipboard rectangle;CONTENTS preserves destination attributes and row/column geometry. @param this - Actual destination sheet. @param context - Native paste context. @param col1 - First destination column. @param row1 - First destination row. @param col2 - Last destination column. @param row2 - Last destination row. @param dx - Source-to-destination column displacement. @param dy - Source-to-destination row displacement. @param source - Actual clipboard sheet. @returns Nothing. */
export function CopyFromClip(
  this: ScTable,
  context: CopyFromClipContext,
  col1: number,
  row1: number,
  col2: number,
  row2: number,
  dx: number,
  dy: number,
  source: ScTable,
): void {
  col2 = Math.min(col2, this["rDocument"].MaxCol());
  row2 = Math.min(row2, this["rDocument"].MaxRow());
  if (!this["rDocument"].ValidColRow(col1, row1) || !this["rDocument"].ValidColRow(col2, row2))
    return;
  this.CreateColumnIfNotExists(col2);
  for (let col = col1; col <= col2; ++col) {
    const sourceColumn = source.CreateColumnIfNotExists(col - dx);
    (this["aCol"][col] as ScColumn).CopyFromClip(context, row1, row2, dy, sourceColumn);
  }
}

/** Original allocated-column clipping for deferred clipboard dirty processing. @param this - Actual sheet. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @param spans - Deferred changes. @returns Nothing. */
export function SetDirtyFromClip(
  this: ScTable,
  col1: number,
  row1: number,
  col2: number,
  row2: number,
  spans: ColumnSpanSet,
): void {
  col2 = Math.min(col2, this["aCol"].length - 1, this["rDocument"].MaxCol());
  row2 = Math.min(row2, this["rDocument"].MaxRow());
  if (this["rDocument"].ValidColRow(col1, row1) && this["rDocument"].ValidColRow(col2, row2))
    for (let col = col1; col <= col2; ++col)
      (this["aCol"][col] as ScColumn).SetDirtyFromClip(row1, row2, spans);
}
/** Original per-table sparse broadcaster delivery suppresses auto calc for the whole column walk. @param this - Actual sheet. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @param id - Hint ID. @returns Whether delivered. */
export function BroadcastBroadcasters(
  this: ScTable,
  col1: number,
  row1: number,
  col2: number,
  row2: number,
  id: SfxHintId,
): boolean {
  const autoCalc = new AutoCalcSwitch(this["rDocument"], false);
  let delivered = false;
  try {
    col2 = this.ClampToAllocatedColumns(col2);
    for (let col = col1; col <= col2; ++col)
      delivered =
        (this["aCol"][col] as ScColumn).BroadcastBroadcasters(row1, row2, id) || delivered;
    return delivered;
  } finally {
    autoCalc.Dispose();
  }
}

/** Original conditional-format attribute traversal allocates only the actual covered columns. @param this - Destination sheet. @param ranges - Native ranges. @param index - Format key. @returns Nothing. */
export function AddCondFormatData(
  this: ScTable,
  ranges: import("../../../inc/rangelst").ScRangeList,
  index: number,
): void {
  for (const range of ranges)
    for (let col = range.aStart.Col(); col <= range.aEnd.Col(); ++col)
      this.CreateColumnIfNotExists(col).AddCondFormat(range.aStart.Row(), range.aEnd.Row(), index);
}

/** Original conditional-index removal clamps to allocated columns without creating storage. @param this - Destination sheet. @param ranges - Native ranges. @param index - Key,or zero for all. @returns Nothing. */
export function RemoveCondFormatData(
  this: ScTable,
  ranges: import("../../../inc/rangelst").ScRangeList,
  index: number,
): void {
  for (const range of ranges) {
    const last = this.ClampToAllocatedColumns(range.aEnd.Col());
    for (let col = range.aStart.Col(); col <= last; ++col)
      (this["aCol"][col] as ScColumn).RemoveCondFormat(range.aStart.Row(), range.aEnd.Row(), index);
  }
}

/** Original table2 Undo traverses all allocated columns and restores full-axis geometry. Sheet-local names are outside the represented kernel. @param this - Actual Undo sheet. @param context - Destination copy context. @param col1 - First edited column. @param row1 - First edited row. @param col2 - Last edited column. @param row2 - Last edited row. @param flags - Original copy flags. @param marked - Original mark argument. @param target - Actual destination. @returns Nothing. */
export function UndoToTable(
  this: ScTable,
  context: CopyToDocContext,
  col1: number,
  row1: number,
  col2: number,
  row2: number,
  flags: InsertDeleteFlags,
  marked: boolean,
  target: ScTable,
): void {
  const doc = this["rDocument"];
  if (!(doc.ValidColRow(col1, row1) && doc.ValidColRow(col2, row2))) return;
  const width =
    row1 === 0 &&
    row2 === doc.MaxRow() &&
    this["mpColWidth"] !== null &&
    target["mpColWidth"] !== null;
  const height =
    col1 === 0 &&
    col2 === doc.MaxCol() &&
    this["mpRowHeights"] !== null &&
    target["mpRowHeights"] !== null;
  for (let col = 0; col < this["aCol"].length; ++col) {
    const destination = target.CreateColumnIfNotExists(col),
      source = this["aCol"][col] as ScColumn;
    if (col >= col1 && col <= col2)
      source.UndoToColumn(context, row1, row2, flags, marked, destination);
    else
      source.CopyToColumn(context, 0, doc.MaxRow(), InsertDeleteFlags.FORMULA, false, destination);
  }
  if (flags & InsertDeleteFlags.ATTRIB)
    target.SetCondFormList(
      (this["mpCondFormatList"] as NonNullable<ScTable["mpCondFormatList"]>).Clone(
        target["rDocument"],
      ),
    );
  if (!(width || height)) return;
  if (width) {
    const destination = target["mpColWidth"] as NonNullable<ScTable["mpColWidth"]>;
    destination.CopyFrom(this["mpColWidth"] as NonNullable<ScTable["mpColWidth"]>, col1, col2);
    target.SetColManualBreaks(new Set(this["maColManualBreaks"]));
  }
  if (height) {
    target.CopyRowHeight(this, row1, row2, 0);
    target.SetRowManualBreaks(new Set(this["maRowManualBreaks"]));
  }
}

/** Original table2 scalar and range row-height definitions on this actual sheet. @param this - Sheet. @param first - Scalar or first row. @param second - Scalar hidden policy or last row. @param hidden - Range hidden policy. @returns Twips. */
export function GetRowHeight(
  this: ScTable,
  first: number,
  second: boolean | number,
  hidden: boolean,
): number {
  const doc = this.GetDoc(),
    heights = this["mpRowHeights"];
  if (typeof second === "boolean") {
    if (!doc.ValidRow(first) || !heights) return this.GetOptimalMinRowHeight();
    return second && this.RowHidden(first) ? 0 : heights.getValue(first);
  }
  if (!doc.ValidRow(first) || !doc.ValidRow(second) || !heights)
    return (second - first + 1) * this.GetOptimalMinRowHeight();
  let height = 0,
    row = first;
  while (row <= second) {
    const end: [number] = [-1];
    if (!(this.RowHidden(row, undefined, end) && hidden)) {
      if (end[0] > second) end[0] = second;
      height += Number(heights.getSumValue(row, end[0]));
    }
    row = end[0] + 1;
  }
  return height;
}

/** Original table2 full copy dispatch for represented native cells,attributes and geometry. Names,database ranges,outline,sparkline and caption owners remain outside this kernel profile. @param this - Actual source. @param context - Destination context. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @param flags - Native mask. @param marked - Restrict actual multi marks. @param target - Actual target. @param marks - Optional original marks. @param asLink - Link policy. @param colRowFlags - Geometry policy. @param cloneFlags - Clone policy. @param copyCaptions - Caption policy,unconsumed without note owners. @returns Nothing. */
export function CopyToTable(
  this: ScTable,
  context: CopyToDocContext,
  col1: number,
  row1: number,
  col2: number,
  row2: number,
  flags: InsertDeleteFlags,
  marked: boolean,
  target: ScTable,
  marks: ScMarkData | null,
  asLink: boolean,
  colRowFlags: boolean,
  cloneFlags: ScCloneFlags,
  copyCaptions: boolean,
): void {
  const doc = this.GetDoc();
  if (!doc.ValidColRow(col1, row1) || !doc.ValidColRow(col2, row2)) return;
  const toUndo = target.GetDoc().IsUndo(),
    fromUndo = doc.IsUndo();
  if (toUndo && flags & InsertDeleteFlags.ATTRIB && col2 >= this.GetAllocatedColumnsCount())
    this["aDefaultColData"]["pAttrArray"].CopyArea(
      row1,
      row2,
      0,
      target["aDefaultColData"]["pAttrArray"],
    );
  if (flags !== InsertDeleteFlags.NONE) {
    const temporary = flags & ~(InsertDeleteFlags.NOTE | InsertDeleteFlags.ADDNOTES),
      grouping = new DelayFormulaGroupingSwitch(target.GetDoc(), true);
    try {
      target.CreateColumnIfNotExists(this.ClampToAllocatedColumns(col2));
      for (let col = col1; col <= this.ClampToAllocatedColumns(col2); ++col)
        (this["aCol"][col] as ScColumn).CopyToColumn(
          context,
          row1,
          row2,
          toUndo ? flags : temporary,
          marked,
          target.CreateColumnIfNotExists(col),
          marks,
          asLink,
          cloneFlags,
        );
      if (fromUndo && flags & InsertDeleteFlags.ATTRIB && col2 >= this.GetAllocatedColumnsCount()) {
        const defaults = this["aDefaultColData"]["pAttrArray"];
        defaults.CopyArea(row1, row2, 0, target["aDefaultColData"]["pAttrArray"]);
        const last = target.ClampToAllocatedColumns(col2);
        for (let col = this.GetAllocatedColumnsCount(); col <= last; ++col)
          defaults.CopyArea(row1, row2, 0, (target["aCol"][col] as ScColumn)["pAttrArray"]);
      }
    } finally {
      grouping.Dispose();
    }
  }
  if (!colRowFlags) return;
  if (toUndo && flags & InsertDeleteFlags.ATTRIB)
    target.SetCondFormList(
      (this["mpCondFormatList"] as ScConditionalFormatList).Clone(target.GetDoc()),
    );
  const charts = target.GetDoc().GetChartListenerCollection();
  let changed = false;
  if (row1 === 0 && row2 === doc.MaxRow() && this["mpColWidth"] && target["mpColWidth"]) {
    const targetWidth = target["mpColWidth"].begin().add(col1),
      sourceWidth = this["mpColWidth"].begin().add(col1);
    target["mpColWidth"].CopyFrom(this["mpColWidth"], col1, col2);
    (target["mpColFlags"] as ScBitMaskCompressedArray).CopyFrom(
      this["mpColFlags"] as ScBitMaskCompressedArray,
      col1,
      col2,
    );
    for (let col = col1; col <= col2; ++col) {
      const hidden = this.ColHidden(col),
        hiddenChange = target.ColHidden(col) !== hidden,
        widthChange = hiddenChange || targetWidth.getValue() !== sourceWidth.getValue();
      target.SetColHidden(col, col, hidden);
      if (hiddenChange && charts)
        charts.SetRangeDirty(new ScRange(col, 0, this["nTab"], col, doc.MaxRow(), this["nTab"]));
      if (widthChange) changed = true;
      targetWidth.increment();
      sourceWidth.increment();
    }
    target.SetColManualBreaks(new Set(this["maColManualBreaks"]));
  }
  if (col1 === 0 && col2 === doc.MaxCol() && this["mpRowHeights"] && target["mpRowHeights"]) {
    if (target.GetRowHeight(row1, row2) !== this.GetRowHeight(row1, row2)) changed = true;
    target.CopyRowHeight(this, row1, row2, 0);
    (target["pRowFlags"] as ScBitMaskCompressedArray).CopyFrom(
      this["pRowFlags"] as ScBitMaskCompressedArray,
      row1,
      row2,
    );
    for (let row = row1; row <= row2; ++row) {
      const last: [number] = [0],
        hidden = this.RowHidden(row, undefined, last);
      if (last[0] >= row2) last[0] = row2;
      const hiddenChanged = target.SetRowHidden(row, last[0], hidden);
      if (hiddenChanged && charts)
        charts.SetRangeDirty(
          new ScRange(0, row, this["nTab"], doc.MaxCol(), last[0], this["nTab"]),
        );
      if (hiddenChanged) changed = true;
      row = last[0];
    }
    for (let row = row1; row <= row2; ++row) {
      const last: [number] = [0],
        filtered = this.getFilterData().rowFiltered(row, undefined, last);
      if (last[0] >= row2) last[0] = row2;
      target.getFilterData().setRowFiltered(row, last[0], filtered);
      row = last[0];
    }
    target.SetRowManualBreaks(new Set(this["maRowManualBreaks"]));
  }
  if (changed) target.InvalidatePageBreaks();
  if (flags & InsertDeleteFlags.ATTRIB) {
    (target["mpCondFormatList"] as ScConditionalFormatList).DeleteArea(col1, row1, col2, row2);
    target.CopyConditionalFormat(col1, row1, col2, row2, 0, 0, this);
  }
  // No caption/outline/sparkline store can be created in this represented native profile.
  void copyCaptions;
}

/** Original deduplication for represented date/empty entries. Date IsEqual is native false;empty entries are not range-dependent. Color-scale,databar and icon-set entry owners are unported. @param doc - Target owner. @param old - Existing format. @param incoming - Real copied format. @param tab - Destination sheet. @returns Deduplicated. */
function CheckAndDeduplicateCondFormat(
  doc: ScDocument,
  old: ScConditionalFormat | null,
  incoming: ScConditionalFormat,
  tab: number,
): boolean {
  if (!old) return false;
  if (old.EqualEntries(incoming, true)) {
    const ranges = incoming.GetRange(),
      destination = old.GetRangeList();
    for (const range of ranges) destination.Join(range);
    doc.AddCondFormatData(ranges, tab, old.GetKey());
    return true;
  }
  return false;
}
/** Original conditional-format intersection,clone,reference relocation,key allocation and style dispatch. Current concrete entries are native date entries;range-dependent visual entry families remain unported. @param this - Destination sheet. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @param dx - Column displacement. @param dy - Row displacement. @param source - Actual source sheet. @returns Nothing. */
export function CopyConditionalFormat(
  this: ScTable,
  col1: number,
  row1: number,
  col2: number,
  row2: number,
  dx: number,
  dy: number,
  source: ScTable,
): void {
  const doc = this.GetDoc(),
    tab = this["nTab"],
    sourceTab = source["nTab"],
    oldRange = new ScRange(col1 - dx, row1 - dy, sourceTab, col2 - dx, row2 - dy, sourceTab),
    newRange = new ScRange(col1, row1, tab, col2, row2, tab),
    undo = doc.IsUndo() || source.GetDoc().IsUndo(),
    same = doc.GetStyleSheetPool() === source.GetDoc().GetStyleSheetPool(),
    destination = this["mpCondFormatList"] as ScConditionalFormatList;
  for (const format of source["mpCondFormatList"] as ScConditionalFormatList) {
    const ranges = format.GetRange();
    if (!ranges.Intersects(oldRange)) continue;
    const intersection = ranges.GetIntersectedRange(oldRange),
      incoming = format.Clone(doc);
    let retained = false;
    try {
      incoming.SetRange(intersection);
      const context = new RefUpdateContext(doc);
      context.meMode = UpdateRefMode.URM_COPY;
      context.maRange.assign(newRange);
      context.mnColDelta = dx;
      context.mnRowDelta = dy;
      context.mnTabDelta = tab - sourceTab;
      incoming.UpdateReference(context, true);
      if (
        !undo &&
        same &&
        sourceTab === tab &&
        CheckAndDeduplicateCondFormat(doc, destination.GetFormat(format.GetKey()), incoming, tab)
      )
        continue;
      let max = 0,
        duplicate = false;
      for (const existing of destination) {
        if (!undo && CheckAndDeduplicateCondFormat(doc, existing, incoming, tab)) {
          duplicate = true;
          break;
        }
        if (existing.GetKey() > max) max = existing.GetKey();
      }
      if (duplicate) continue;
      incoming.SetKey(max + 1);
      destination.InsertNew(incoming);
      retained = true;
      if (!same)
        for (let index = 0; index < incoming.size(); ++index) {
          const entry = incoming.GetEntry(index) as ScCondDateFormatEntry,
            name = entry.GetStyleName();
          if (!name.isEmpty())
            throw Error("Foreign conditional-format styles require native style-pool copying");
        }
      doc.AddCondFormatData(incoming.GetRange(), tab, incoming.GetKey());
    } finally {
      if (!retained) incoming.Dispose();
    }
  }
}

/** Original table2 merge extension,including allocated-column clamp and default-column invariant. The native inline ScColumn delegate is erased directly to its actual attribute-array owner. @param this - Actual sheet. @param firstCol - First column. @param firstRow - First row. @param lastCol - Extended column output. @param lastRow - Extended row output. @param refresh - Native defaultfalse. @returns Whether a merge was found. */
export function ExtendMerge(
  this: ScTable,
  firstCol: number,
  firstRow: number,
  lastCol: [number],
  lastRow: [number],
  refresh = false,
): boolean {
  const doc = this.GetDoc();
  if (!doc.ValidCol(firstCol) || !doc.ValidCol(lastCol[0])) return false;
  if (
    lastCol[0] >= this.GetAllocatedColumnsCount() &&
    (
      (this.GetDefaultColumnData().GetPattern(firstRow) as ScPatternAttr).GetItem(
        ATTR_MERGE,
      ) as ScMergeAttr
    ).IsMerged()
  )
    throw Error("Merged default-column assertion");
  let found = false;
  const endCol = this.ClampToAllocatedColumns(lastCol[0]),
    endRow = lastRow[0];
  for (let col = firstCol; col <= endCol; ++col)
    found =
      (this.FetchColumn(col) as ScColumn)["pAttrArray"].ExtendMerge(
        col,
        firstRow,
        endRow,
        lastCol,
        lastRow,
        refresh,
      ) || found;
  return found;
}

/** Original HasBlockMatrixFragment visit order for the admitted ordinary-cell profile. Real column queries return Nothing or reject unported matrix geometry,so positive edge tests are erased under that invariant. @param this - Actual table. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @param noMatrix - Original defaultfalse. @returns No actual fragment in the admitted nonmatrix profile. */
export function HasBlockMatrixFragment(
  this: ScTable,
  col1: number,
  row1: number,
  col2: number,
  row2: number,
  noMatrix = false,
): boolean {
  if (!this.IsColValid(col1)) return false;
  const last = Math.min(col2, this.GetAllocatedColumnsCount() - 1);
  if (col1 === last)
    (this.FetchColumn(col1) as ScColumn).GetBlockMatrixEdges(
      row1,
      row2,
      MatrixEdge.Left | MatrixEdge.Right,
      noMatrix,
    );
  else {
    (this.FetchColumn(col1) as ScColumn).GetBlockMatrixEdges(row1, row2, MatrixEdge.Left, noMatrix);
    (this.FetchColumn(last) as ScColumn).GetBlockMatrixEdges(
      row1,
      row2,
      MatrixEdge.Right,
      noMatrix,
    );
  }
  if (noMatrix) {
    for (let col = col1; col <= last; ++col)
      (this.FetchColumn(col) as ScColumn).GetBlockMatrixEdges(
        row1,
        row2,
        MatrixEdge.Nothing,
        noMatrix,
      );
  } else if (row1 === row2) {
    for (let col = col1; col <= last; ++col)
      (this.FetchColumn(col) as ScColumn).GetBlockMatrixEdges(
        row1,
        row1,
        MatrixEdge.Bottom | MatrixEdge.Top,
        noMatrix,
      );
  } else {
    for (let edge = 0; edge < 2; ++edge)
      for (let col = col1; col <= last; ++col)
        (this.FetchColumn(col) as ScColumn).GetBlockMatrixEdges(
          edge === 0 ? row1 : row2,
          edge === 0 ? row1 : row2,
          edge === 0 ? MatrixEdge.Top : MatrixEdge.Bottom,
          noMatrix,
        );
  }
  return false;
}
/** Original IsBlockEditable normal unprotected/unlocked nonscenario profile;read-only/protection/scenario services remain unrepresented. Actual cells must pass real matrix-boundary queries. @param this - Actual table. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @param onlyMatrix - Optional output. @param noMatrix - Original defaultfalse. @returns Block editable in admitted profile. */
export function IsBlockEditable(
  this: ScTable,
  col1: number,
  row1: number,
  col2: number,
  row2: number,
  onlyMatrix: [boolean] | null = null,
  noMatrix = false,
): boolean {
  if (!this.GetDoc().ValidColRow(col2, row2)) {
    if (onlyMatrix) onlyMatrix[0] = false;
    return false;
  }
  this.HasBlockMatrixFragment(col1, row1, col2, row2, noMatrix);
  if (onlyMatrix) onlyMatrix[0] = false;
  return true;
}

/** Original table2 ApplyFlags rectangle traversal. @param this - Actual table. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @param flags - Native flags. @returns Whether changed. */
export function ApplyFlags(
  this: ScTable,
  col1: number,
  row1: number,
  col2: number,
  row2: number,
  flags: ScMF,
): boolean {
  const doc = this.GetDoc();
  if (!doc.ValidColRow(col1, row1) || !doc.ValidColRow(col2, row2)) return false;
  let changed = false;
  for (let col = col1; col <= col2; ++col)
    changed = this.CreateColumnIfNotExists(col).ApplyFlags(row1, row2, flags) || changed;
  return changed;
}

/** Original table2 RemoveFlags rectangle traversal. @param this - Actual table. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @param flags - Native flags. @returns Whether changed. */
export function RemoveFlags(
  this: ScTable,
  col1: number,
  row1: number,
  col2: number,
  row2: number,
  flags: ScMF,
): boolean {
  const doc = this.GetDoc();
  if (!doc.ValidColRow(col1, row1) || !doc.ValidColRow(col2, row2)) return false;
  let changed = false;
  col2 = this.ClampToAllocatedColumns(col2);
  for (let col = col1; col <= col2; ++col)
    changed = (this.FetchColumn(col) as ScColumn).RemoveFlags(row1, row2, flags) || changed;
  return changed;
}

/** Original preallocated-column format compatibility dispatch. @param this - Actual table. @param range - Destination range. @param pattern - Format delta. @param type - New category. @returns Nothing. */
export function ApplyPatternIfNumberformatIncompatible(
  this: ScTable,
  range: ScRange,
  pattern: ScPatternAttr,
  type: number,
): void {
  for (let col = range.aStart.Col(); col <= range.aEnd.Col(); ++col)
    (this.FetchColumn(col) as ScColumn).ApplyPatternIfNumberformatIncompatible(
      range,
      pattern,
      type,
    );
}
