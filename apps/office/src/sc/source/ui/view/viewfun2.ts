/** @fileoverview Consumed AdjustBlockHeight standard attribute path from viewfun2.cxx; device-based script and EditEngine layout remain unported. */
import { ScFormulaCell } from "../../../inc/formulacell";
import type { ScViewFunc } from "./viewfunc";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScPatternAttr } from "../../../inc/patattr";
import { scPasteResourcesEnglish } from "../../../inc/globstr";
import { InsertDeleteFlags, ScPasteFunc, InsCellCmd } from "../../../inc/global";
import { ATTR_VALUE_FORMAT } from "../../../inc/scitems";
import type { SfxUInt32Item } from "../../../../svl/inc/intitem";
import type { ScMarkData } from "../../../inc/markdata";
import type { ScTable } from "../../../inc/table";
import { ScDirection, CellType } from "../../../inc/global";
import { ScRefCellValue } from "../../../inc/cellvalue";
import { ScAddress } from "../../../inc/address";
import { ScRange } from "../../../inc/address";
import { ScRangeList } from "../../../inc/rangelst";
import { ScTokenArray } from "../../../inc/tokenarray";
import { ScComplexRefData } from "../../../inc/refdata";
import { ScCompiler } from "../../../inc/compiler";
import { OpCode } from "../../../../formula/inc/opcode";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { ScViewData } from "../inc/viewdata";
import { RowHeightContext } from "../../../inc/rowheightcontext";
/** Recalculates affected whole rows on original selected sheets, retaining source shared-context ordering. @param doc - Actual document. @param marks - Selected sheets. @param first - First row. @param last - Last row. @returns Whether geometry changed. */
export function AdjustBlockHeight(
  doc: ScDocument,
  marks: ScMarkData,
  first: number,
  last: number,
): boolean {
  const context = new RowHeightContext(doc.MaxRow(), 1 / 15, 1 / 15, 1, 1, null);
  let changed = false;
  for (const tab of marks.GetSelectedTabs())
    changed =
      (doc.FetchTable(tab) as ScTable).SetOptimalHeight(context, first, last, true) || changed;
  return changed;
}

/** Original numeric/outer-function AutoSum categories from viewfun2.cxx. */
enum ScAutoSum {
  None,
  Data,
  Sum,
  Average,
  Max,
  Min,
  Count,
  CountA,
  Product,
  StDev,
  StDevP,
  Var,
  VarP,
  End,
}
/** Original outer-opcode classification;unrecognized adjacent outer functions retain None. */
const autoSumCodes = new Map<OpCode, ScAutoSum>([
  [OpCode.ocSum, ScAutoSum.Sum],
  [OpCode.ocAverage, ScAutoSum.Average],
  [OpCode.ocMax, ScAutoSum.Max],
  [OpCode.ocMin, ScAutoSum.Min],
  [OpCode.ocCount, ScAutoSum.Count],
  [OpCode.ocCount2, ScAutoSum.CountA],
  [OpCode.ocProduct, ScAutoSum.Product],
  [OpCode.ocStDev, ScAutoSum.StDev],
  [OpCode.ocStDevP, ScAutoSum.StDevP],
  [OpCode.ocVar, ScAutoSum.Var],
  [OpCode.ocVarP, ScAutoSum.VarP],
]);
/** Original data classification over actual cell results and real RPN references. @param doc - Document. @param col - Column. @param row - Row. @param tab - Sheet. @param direction - Scan direction. @param extend - Output preceding aggregate extent. @returns Source category. */
function lcl_IsAutoSumData(
  doc: ScDocument,
  col: number,
  row: number,
  tab: number,
  direction: ScDirection,
  extend: [number],
): ScAutoSum {
  const cell = new ScRefCellValue(doc, new ScAddress(col, row, tab));
  if (cell.hasNumeric()) {
    if (cell.getType() === CellType.CELLTYPE_FORMULA) {
      const code = (cell.getFormula() as ScFormulaCell).GetCode(),
        value = autoSumCodes.get(code.GetOuterFuncOpCode()) ?? ScAutoSum.None;
      if (code.GetAdjacentExtendOfOuterFuncRefs(extend, new ScAddress(col, row, tab), direction))
        return value;
    }
    return ScAutoSum.Data;
  }
  return ScAutoSum.None;
}
/** Original twenty-position directional seek;coordinate references retain the final attempted position. @param doc - Document. @param col - In/out column. @param row - In/out row. @param tab - Sheet. @param direction - Top or left. @param extend - Aggregate extent. @returns Source category. */
function lcl_SeekAutoSumData(
  doc: ScDocument,
  col: [number],
  row: [number],
  tab: number,
  direction: ScDirection,
  extend: [number],
): ScAutoSum {
  let count = 0;
  while (count < 20) {
    if (direction === ScDirection.DIR_TOP) {
      if (row[0] > 0) --row[0];
      else return ScAutoSum.None;
    } else {
      if (col[0] > 0) --col[0];
      else return ScAutoSum.None;
    }
    const value = lcl_IsAutoSumData(doc, col[0], row[0], tab, direction, extend);
    if (value !== ScAutoSum.None) return value;
    ++count;
  }
  return ScAutoSum.None;
}
/** Original previous aggregate search down one column. @param doc - Document. @param col - Column. @param row - In/out row. @param tab - Sheet. @param extend - Extent output. @param minimum - Source lower bound. @returns Another aggregate found. */
function lcl_FindNextSumEntryInColumn(
  doc: ScDocument,
  col: number,
  row: [number],
  tab: number,
  extend: [number],
  minimum: number,
): boolean {
  const previous = row[0];
  let value: ScAutoSum;
  for (;;) {
    value = lcl_IsAutoSumData(doc, col, row[0], tab, ScDirection.DIR_TOP, extend);
    if (value !== ScAutoSum.Data || row[0] <= minimum) break;
    --row[0];
  }
  return value >= ScAutoSum.Sum && row[0] < previous;
}
/** Original previous aggregate search along one row. @param doc - Document. @param col - In/out column. @param row - Row. @param tab - Sheet. @param extend - Extent output. @param minimum - Source lower bound. @returns Another aggregate found. */
function lcl_FindNextSumEntryInRow(
  doc: ScDocument,
  col: [number],
  row: number,
  tab: number,
  extend: [number],
  minimum: number,
): boolean {
  const previous = col[0];
  let value: ScAutoSum;
  for (;;) {
    value = lcl_IsAutoSumData(doc, col[0], row, tab, ScDirection.DIR_LEFT, extend);
    if (value !== ScAutoSum.Data || col[0] <= minimum) break;
    --col[0];
  }
  return value >= ScAutoSum.Sum && col[0] < previous;
}
/** Original GetAutoSumArea infers ordered native ranges around the actual cursor,including aggregates above/left of other data. @param view - Actual view. @param ranges - Output native list,appended rather than cleared. @returns Data found. */
export function GetAutoSumArea(view: ScViewData, ranges: ScRangeList): boolean {
  const doc = view.GetDocument(),
    tab = view.GetTabNumber(),
    col = view.GetCurX(),
    row = view.GetCurY(),
    extend: [number] = [0],
    seekCol: [number] = [col],
    seekRow: [number] = [row];
  let startCol = col,
    startRow = row,
    endCol = col,
    endRow = row,
    byColumn = false,
    byRow = false,
    value: ScAutoSum;
  if (
    row !== 0 &&
    lcl_IsAutoSumData(doc, col, row - 1, tab, ScDirection.DIR_TOP, extend) === ScAutoSum.Data &&
    (value = lcl_IsAutoSumData(doc, col, row - 1, tab, ScDirection.DIR_LEFT, extend)) ===
      ScAutoSum.Data
  ) {
    byRow = true;
    seekRow[0] = row - 1;
  } else if (
    col !== 0 &&
    (value = lcl_IsAutoSumData(doc, col - 1, row, tab, ScDirection.DIR_LEFT, extend)) ===
      ScAutoSum.Data
  ) {
    byColumn = true;
    seekCol[0] = col - 1;
  } else if (
    (value = lcl_SeekAutoSumData(doc, [col], seekRow, tab, ScDirection.DIR_TOP, extend)) !==
    ScAutoSum.None
  )
    byRow = true;
  else if (
    (value = lcl_SeekAutoSumData(doc, seekCol, [row], tab, ScDirection.DIR_LEFT, extend)) !==
    ScAutoSum.None
  )
    byColumn = true;
  if (byColumn || byRow) {
    if (byRow) {
      startRow = seekRow[0];
      endRow = value >= ScAutoSum.Sum && value < ScAutoSum.End ? startRow : row - 1;
    } else {
      startCol = seekCol[0];
      endCol = value >= ScAutoSum.Sum ? startCol : col - 1;
    }
    let more = false;
    do {
      if (value === ScAutoSum.Data) {
        if (byRow) {
          while (
            startRow !== 0 &&
            lcl_IsAutoSumData(doc, col, startRow - 1, tab, ScDirection.DIR_TOP, extend) === value
          )
            --startRow;
        } else {
          while (
            startCol !== 0 &&
            lcl_IsAutoSumData(doc, startCol - 1, row, tab, ScDirection.DIR_LEFT, extend) === value
          )
            --startCol;
        }
      }
      ranges.push_back(new ScRange(startCol, startRow, tab, endCol, endRow, tab));
      if (value >= ScAutoSum.Sum) {
        if (byRow) {
          const previous: [number] = [extend[0]];
          more = lcl_FindNextSumEntryInColumn(doc, col, previous, tab, extend, 0);
          endRow = previous[0];
          if (more) startRow = endRow;
        } else {
          const previous: [number] = [extend[0]];
          more = lcl_FindNextSumEntryInRow(doc, previous, row, tab, extend, 0);
          endCol = previous[0];
          if (more) startCol = endCol;
        }
      }
    } while (more);
    return true;
  }
  return false;
}
/** Original formula token construction for the consumed ordinary,unfiltered aggregate path. SUBTOTAL evaluation remains explicitly unavailable. @param view - Actual view. @param ranges - Ordered source ranges. @param subtotal - Native filtered-data request. @param address - Formula position. @param code - Aggregate opcode. @returns Owned formula source. */
export function GetAutoSumFormula(
  view: ScViewData,
  ranges: ScRangeList,
  subtotal: boolean,
  address: ScAddress,
  code: OpCode,
): OUString {
  if (subtotal) throw new Error("SUBTOTAL formula construction/evaluation is not implemented");
  const doc = view.GetDocument(),
    array = new ScTokenArray(doc),
    output = new OUString();
  array.AddOpCode(code);
  array.AddOpCode(OpCode.ocOpen);
  let index = 0;
  for (const range of ranges) {
    if (index++ !== 0) array.AddOpCode(OpCode.ocSep);
    const reference = new ScComplexRefData();
    reference.InitRangeRel(doc, range, address);
    array.AddDoubleReference(reference);
  }
  array.AddOpCode(OpCode.ocClose);
  try {
    new ScCompiler(doc, address, array, doc.GetGrammar()).CreateStringFromTokenArray(output);
    return unicode("=" + text(output));
  } finally {
    output.dispose();
  }
}

/** Original column-range sum-of-sums construction,including the originally selected leading rows. @param doc - Document. @param ranges - Appended references. @param range - Source column. @returns Source category. */
function lcl_GetAutoSumForColumnRange(
  doc: ScDocument,
  ranges: ScRangeList,
  range: ScRange,
): ScAutoSum {
  const start = range.aStart,
    end = range.aEnd;
  // The sole native caller constructs both endpoints with the same column.
  const tab = end.Tab(),
    col = end.Col(),
    extend: [number] = [0];
  let endRow = end.Row(),
    startRow = endRow,
    value = lcl_IsAutoSumData(doc, col, endRow, tab, ScDirection.DIR_TOP, extend);
  if (value >= ScAutoSum.Sum) {
    let more: boolean;
    do {
      ranges.push_back(new ScRange(col, startRow, tab, col, endRow, tab));
      const row: [number] = [extend[0]];
      more = lcl_FindNextSumEntryInColumn(doc, col, row, tab, extend, start.Row());
      endRow = row[0];
      if (more) startRow = endRow;
    } while (more);
  } else {
    while (startRow > start.Row()) {
      value = lcl_IsAutoSumData(doc, col, startRow - 1, tab, ScDirection.DIR_TOP, extend);
      if (value >= ScAutoSum.Sum) break;
      --startRow;
    }
    ranges.push_back(new ScRange(col, startRow, tab, col, endRow, tab));
    if (value === ScAutoSum.None) value = ScAutoSum.Data;
  }
  return value;
}
/** Original row-range sum-of-sums construction,including the originally selected leading columns. @param doc - Document. @param ranges - Appended references. @param range - Source row. @returns Source category. */
function lcl_GetAutoSumForRowRange(
  doc: ScDocument,
  ranges: ScRangeList,
  range: ScRange,
): ScAutoSum {
  const start = range.aStart,
    end = range.aEnd;
  // The sole native caller constructs both endpoints with the same row.
  const tab = end.Tab(),
    row = end.Row(),
    extend: [number] = [0];
  let endCol = end.Col(),
    startCol = endCol,
    value = lcl_IsAutoSumData(doc, endCol, row, tab, ScDirection.DIR_LEFT, extend);
  if (value >= ScAutoSum.Sum) {
    let more: boolean;
    do {
      ranges.push_back(new ScRange(startCol, row, tab, endCol, row, tab));
      const col: [number] = [extend[0]];
      more = lcl_FindNextSumEntryInRow(doc, col, row, tab, extend, start.Col());
      endCol = col[0];
      if (more) startCol = endCol;
    } while (more);
  } else {
    while (startCol > start.Col()) {
      value = lcl_IsAutoSumData(doc, startCol - 1, row, tab, ScDirection.DIR_LEFT, extend);
      if (value >= ScAutoSum.Sum) break;
      --startCol;
    }
    ranges.push_back(new ScRange(startCol, row, tab, endCol, row, tab));
    if (value === ScAutoSum.None) value = ScAutoSum.Data;
  }
  return value;
}
/** Original selected-block AutoSum placement and mark/cursor updates;every inserted formula uses actual EnterData operations. @param view - Actual view functions. @param range - Selection. @param subtotal - Filtered request. @param setCursor - Move cursor at completion. @param continueMarks - Retain previous marked blocks. @param code - Aggregate opcode. @returns Formula placement was possible. */
export function AutoSum(
  view: ScViewFunc,
  range: ScRange,
  subtotal: boolean,
  setCursor: boolean,
  continueMarks: boolean,
  code: OpCode,
): boolean {
  const doc = view.GetViewData().GetDocument(),
    tab = range.aStart.Tab(),
    endCol = range.aEnd.Col(),
    endRow = range.aEnd.Row(),
    extend: [number] = [0];
  let startCol = range.aStart.Col(),
    startRow = range.aStart.Row(),
    rowData = false;
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++)
      if (lcl_IsAutoSumData(doc, col, row, tab, ScDirection.DIR_TOP, extend) !== ScAutoSum.None) {
        rowData = true;
        break;
      }
    if (rowData) {
      startRow = row;
      break;
    }
  }
  if (!rowData) return false;
  let colData = false;
  for (let col = startCol; col <= endCol; col++) {
    for (let row = startRow; row <= endRow; row++)
      if (lcl_IsAutoSumData(doc, col, row, tab, ScDirection.DIR_LEFT, extend) !== ScAutoSum.None) {
        colData = true;
        break;
      }
    if (colData) {
      startCol = col;
      break;
    }
  }
  if (!colData) return false;
  const endRowEmpty = doc.IsBlockEmpty(startCol, endRow, endCol, endRow, tab),
    endColEmpty = doc.IsBlockEmpty(endCol, startRow, endCol, endRow, tab);
  let byRow = startRow !== endRow && (endRowEmpty || !endColEmpty),
    byCol = startCol !== endCol && (endColEmpty || startRow === endRow),
    insertRow = endRow,
    insertCol = endCol;
  if (byRow && !endRowEmpty) {
    if (insertRow < doc.MaxRow()) {
      ++insertRow;
      while (!doc.IsBlockEmpty(startCol, insertRow, endCol, insertRow, tab)) {
        if (insertRow < doc.MaxRow()) ++insertRow;
        else {
          byRow = false;
          break;
        }
      }
    } else byRow = false;
  }
  if (byCol && !endColEmpty) {
    if (insertCol < doc.MaxCol()) {
      ++insertCol;
      while (!doc.IsBlockEmpty(insertCol, startRow, insertCol, endRow, tab)) {
        if (insertCol < doc.MaxCol()) ++insertCol;
        else {
          byCol = false;
          break;
        }
      }
    } else byCol = false;
  }
  if (!byRow && !byCol) return false;
  let markEndCol = endCol,
    markEndRow = endRow,
    value = ScAutoSum.None,
    colSums = 0,
    rowSums = 0,
    colSumsStartRow = 0,
    rowSumsStartCol = 0;
  if (byRow) {
    let sumEndRow = endRow;
    if (endRowEmpty) --sumEndRow;
    else ++markEndRow;
    for (let col = startCol; col <= endCol; col++) {
      if (!doc.IsBlockEmpty(col, startRow, col, sumEndRow, tab)) {
        const ranges = new ScRangeList(),
          area = new ScRange(col, range.aStart.Row(), tab, col, sumEndRow, tab);
        value = lcl_GetAutoSumForColumnRange(doc, ranges, area);

        if (++rowSums === 1) rowSumsStartCol = ranges.front().aStart.Col();
        const formula = view.GetAutoSumFormula(
          ranges,
          subtotal,
          new ScAddress(col, insertRow, tab),
          code,
        );
        try {
          view.EnterData(col, insertRow, tab, formula);
        } finally {
          formula.dispose();
        }
      }
    }
  }
  if (byCol) {
    let sumEndCol = endCol;
    if (endColEmpty) --sumEndCol;
    else ++markEndCol;
    for (let row = startRow; row <= endRow; row++) {
      if (!doc.IsBlockEmpty(startCol, row, sumEndCol, row, tab)) {
        const ranges = new ScRangeList(),
          area = new ScRange(range.aStart.Col(), row, tab, sumEndCol, row, tab);
        value = lcl_GetAutoSumForRowRange(doc, ranges, area);

        if (++colSums === 1) colSumsStartRow = ranges.front().aStart.Row();
        const formula = view.GetAutoSumFormula(
          ranges,
          subtotal,
          new ScAddress(insertCol, row, tab),
          code,
        );
        try {
          view.EnterData(insertCol, row, tab, formula);
        } finally {
          formula.dispose();
        }
      }
    }
  }
  view.MarkRange(
    new ScRange(
      value >= ScAutoSum.Sum ? (rowSums === 1 ? rowSumsStartCol : startCol) : range.aStart.Col(),
      value >= ScAutoSum.Sum ? (colSums === 1 ? colSumsStartRow : startRow) : range.aStart.Row(),
      tab,
      markEndCol,
      markEndRow,
      tab,
    ),
    false,
    continueMarks,
  );
  if (setCursor) view.SetCursor(markEndCol, markEndRow);
  return true;
}

/** Original ordinary-formula EnterBlock through an actual one-cell clipboard and native paste Undo. Rich-edit/nonformula input remains unported,without reparsing copied formulas or repeated EnterData loops. @param this - Actual view. @param source - Formula source. @param rich - Native absent rich object. @returns Nothing. */
export function EnterBlock(this: ScViewFunc, source: OUStringConstReference, rich: null): void {
  if (rich !== null) throw Error("Native rich-edit EnterBlock services are not implemented");
  const data = this.GetViewData(),
    col = data.GetCurX(),
    row = data.GetCurY(),
    tab = data.CurrentTabForData();
  const marks = data.GetMarkData();
  if (marks.IsMultiMarked()) {
    marks.MarkToSimple();
    if (marks.IsMultiMarked()) {
      this.ErrorMessage(scPasteResourcesEnglish.STR_MSSG_PASTEFROMCLIP_0);
      this.EnterData(col, row, tab, source);
      return;
    }
  }
  if (data.SelectionForbidsCellFill()) return;
  if (source.getStr()[0] !== 61)
    throw Error("Native nonformula EnterBlock services are not implemented");
  const doc = data.GetDocument(),
    position = new ScAddress(col, row, tab),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  try {
    clip.ResetClip(doc, tab);
    clip.SetFormulaCell(position, new ScFormulaCell(doc, position, source, doc.GetGrammar()));
    clip.SetClipArea(new ScRange(position));
    if (
      !this.PasteFromClip(
        InsertDeleteFlags.CONTENTS,
        clip,
        ScPasteFunc.NONE,
        false,
        false,
        false,
        InsCellCmd.INS_NONE,
        InsertDeleteFlags.ATTRIB,
      )
    )
      return;
    const item = (clip.GetPattern(position) as ScPatternAttr).GetItem(
      ATTR_VALUE_FORMAT,
    ) as SfxUInt32Item;
    const pattern = new ScPatternAttr(doc.getCellAttributeHelper());
    try {
      pattern.ItemSetPut(item);
      const type = doc.GetFormatTable().GetType(item.GetValue());
      doc.ApplyPatternIfNumberformatIncompatible(marks.GetMarkArea(), marks, pattern, type);
    } finally {
      pattern.Dispose();
    }
  } finally {
    clip.Dispose();
  }
}

/** Original EnterAutoSum constructs one formula for native block input. @param this - Actual view. @param ranges - Actual ordered references. @param subtotal - Native category. @param address - Result reference position. @param code - Function opcode. @returns Nothing. */
export function EnterAutoSum(
  this: ScViewFunc,
  ranges: ScRangeList,
  subtotal: boolean,
  address: ScAddress,
  code: OpCode,
): void {
  const formula = this.GetAutoSumFormula(ranges, subtotal, address, code);
  try {
    this.EnterBlock(formula, null);
  } finally {
    formula.dispose();
  }
}
