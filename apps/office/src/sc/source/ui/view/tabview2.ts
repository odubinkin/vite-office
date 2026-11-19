/** @fileoverview Original cursor, reference and block selection over native view and mark state. */
import type { ScTabView } from "../inc/tabview";
import { ScRefType } from "../inc/viewdata";
import { ScAddress, ScRange } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { HasAttrFlags } from "../../../inc/global";
import { ScTableProtectionOption as Option } from "../../../inc/tabprotection";
import { GetMergeFlags } from "../../core/data/document10";
import { ATTR_MERGE } from "../../../inc/scitems";
import type { ScMergeAttr } from "../../../inc/attrib";

/** Source cursor admission for locked and unlocked cells. */
interface SelectionPermissions {
  readonly locked: boolean;
  readonly unlocked: boolean;
}

/** Reads the sheet-wide selection options with the source unprotected defaults. @param doc - Workbook. @param tab - Sheet. @returns Selection options. */
function selectionPermissions(doc: ScDocument, tab: number): SelectionPermissions {
  const protection = doc.GetTabProtection(tab);
  return protection?.isProtected()
    ? {
        locked: protection.isOptionEnabled(Option.SELECT_LOCKED_CELLS),
        unlocked: protection.isOptionEnabled(Option.SELECT_UNLOCKED_CELLS),
      }
    : { locked: true, unlocked: true };
}

/** Tests the cell's native protection attribute against the sheet options. @param doc - Workbook. @param col - Column. @param row - Row. @param tab - Sheet. @param permissions - Source options. @returns Whether the cell may be selected. */
function isCellQualified(
  doc: ScDocument,
  col: number,
  row: number,
  tab: number,
  permissions: SelectionPermissions,
): boolean {
  if (permissions.locked === permissions.unlocked) return permissions.locked;
  const locked = doc.HasAttrib(new ScRange(col, row, tab), HasAttrFlags.Protected);
  return locked ? permissions.locked : permissions.unlocked;
}

/** Tests direct grid cursor admission before changing the selection. @param this - View. @param col - Column. @param row - Row. @param tab - Sheet or the current tab. @returns Whether the cell is selectable. */
export function CanSelectCell(
  this: ScTabView,
  col: number,
  row: number,
  tab = this.GetViewData().GetTabNumber(),
): boolean {
  const doc = this.GetViewData().GetDocument();
  return (
    doc.ValidColRow(col, row) && isCellQualified(doc, col, row, tab, selectionPermissions(doc, tab))
  );
}

/** Reads the native merge overlap flag for the requested axis. @param doc - Workbook. @param col - Column. @param row - Row. @param tab - Sheet. @param horizontal - Movement axis. @returns Whether the cell is covered along the axis. */
function isOverlapped(
  doc: ScDocument,
  col: number,
  row: number,
  tab: number,
  horizontal: boolean,
): boolean {
  const flags = GetMergeFlags.call(doc, col, row, tab);
  return (horizontal ? flags?.IsHorOverlapped() : flags?.IsVerOverlapped()) ?? false;
}

/** Source horizontal cursor search including hidden cells, protection and boundary reversal. @param this - View. @param column - Candidate column. @param old - Old column. @param movement - Direction. @param row - Candidate row. @returns Selected column. */
export function SkipCursorHorizontal(
  this: ScTabView,
  column: number,
  old: number,
  movement: number,
  row = this.GetViewData().GetCurY(),
): number {
  const data = this.GetViewData();
  const doc = data.GetDocument(),
    tab = data.GetTabNumber();
  const permissions = selectionPermissions(doc, tab);
  if (!permissions.locked && !permissions.unlocked) return old;
  const first: [number] = [0];
  const maximum = Math.max(
    doc.ColHidden(doc.MaxCol(), tab, first) ? first[0] + 1 : doc.MaxCol(),
    Math.min((doc.FetchTable(tab)?.GetAllocatedColumnsCount() ?? 0) + 1, doc.MaxCol()),
  );
  let flipped = false;
  while (
    doc.ColHidden(column, tab) ||
    isOverlapped(doc, column, row, tab, true) ||
    !isCellQualified(doc, column, row, tab, permissions)
  ) {
    if (column <= 0 || column >= maximum) {
      if (flipped) return old;
      movement = -movement;
      flipped = true;
    }
    column += movement > 0 ? 1 : -1;
  }
  return column;
}

/** Source vertical cursor search with hidden and protection attribute runs. @param this - View. @param row - Candidate row. @param old - Old row. @param movement - Direction. @param column - Candidate column. @returns Selected row. */
export function SkipCursorVertical(
  this: ScTabView,
  row: number,
  old: number,
  movement: number,
  column = this.GetViewData().GetCurX(),
): number {
  const data = this.GetViewData();
  const doc = data.GetDocument(),
    tab = data.GetTabNumber();
  const permissions = selectionPermissions(doc, tab);
  if (!permissions.locked && !permissions.unlocked) return old;
  const columnData = doc.FetchTable(tab)?.GetColumnData(column);
  let flipped = false;
  for (;;) {
    const first: [number] = [row],
      last: [number] = [row];
    if (!doc.RowHidden(row, tab, first, last)) {
      if (
        !isOverlapped(doc, column, row, tab, false) &&
        isCellQualified(doc, column, row, tab, permissions)
      )
        return row;
      columnData?.GetPatternRange(first, last, row);
    }
    row = movement > 0 ? last[0] : first[0];
    if (row <= 0 || row >= doc.MaxRow()) {
      if (flipped) return old;
      movement = -movement;
      flipped = true;
    }
    row += movement > 0 ? 1 : -1;
  }
}

/** Moves the edge of a protected selection until the first disallowed visible cell. @param this - View. @param column - Original endpoint column. @param row - Original endpoint row. @param dx - Horizontal motion. @param dy - Vertical motion. @param tab - Sheet to search. @returns Updated endpoint. */
export function MoveCursorByProtection(
  this: ScTabView,
  column: number,
  row: number,
  dx: number,
  dy: number,
  tab = this.GetViewData().CurrentTabForData(),
): [number, number] {
  const doc = this.GetViewData().GetDocument();
  const permissions = selectionPermissions(doc, tab);
  if (!permissions.locked && !permissions.unlocked) return [column, row];
  for (const horizontal of [true, false]) {
    const delta = horizontal ? dx : dy;
    const step = Math.sign(delta);
    const limit = horizontal ? doc.MaxCol() : doc.MaxRow();
    let coordinate = horizontal ? column : row;
    for (let units = 0; units < Math.abs(delta); ++units) {
      let next = coordinate + step;
      if (next < 0 || next > limit) break;
      const first: [number] = [next],
        last: [number] = [next];
      while (
        horizontal ? doc.ColHidden(next, tab, first, last) : doc.RowHidden(next, tab, first, last)
      ) {
        const end = step > 0 ? last[0] : first[0];
        units += Math.abs(end - next) + 1;
        next = end + step;
        if (next < 0 || next > limit) return [column, row];
      }
      if (
        !isCellQualified(doc, horizontal ? next : column, horizontal ? row : next, tab, permissions)
      )
        break;
      coordinate = next;
      if (horizontal) column = coordinate;
      else row = coordinate;
    }
  }
  return [column, row];
}

/** Resolves a normal or extending cursor move on the current sheet. @param this - View. @param oldCol - Source column. @param oldRow - Source row. @param dx - Horizontal motion. @param dy - Vertical motion. @returns Destination coordinates. */
export function GetRelativeCursor(
  this: ScTabView,
  oldCol: number,
  oldRow: number,
  dx: number,
  dy: number,
): [number, number] {
  const data = this.GetViewData(),
    doc = data.GetDocument();
  const tab = data.GetTabNumber();
  const permissions = selectionPermissions(doc, tab);
  if (!permissions.locked && !permissions.unlocked) return [oldCol, oldRow];
  if ((dx < 0 && oldCol === 0 && dy === 0) || (dy < 0 && oldRow === 0 && dx === 0))
    return [oldCol, oldRow];
  let col = dx || data.IsRefMode() ? oldCol + dx : data.GetOldCurX();
  let row = dy || data.IsRefMode() ? oldRow + dy : data.GetOldCurY();
  data.ResetOldCursor();
  if (dx && doc.ValidColRow(col, row)) {
    col = this.SkipCursorHorizontal(col, oldCol, dx, row);
    if (isOverlapped(doc, col, row, tab, false)) {
      data.SetOldCursor(col, row);
      while (row > 0 && isOverlapped(doc, col, row, tab, false)) --row;
    }
  }
  if (dy && doc.ValidColRow(col, row)) {
    row = this.SkipCursorVertical(row, oldRow, dy, col);
    if (isOverlapped(doc, col, row, tab, true)) {
      data.SetOldCursor(col, row);
      while (col > 0 && isOverlapped(doc, col, row, tab, true)) --col;
    }
  }
  return [Math.max(0, Math.min(doc.MaxCol(), col)), Math.max(0, Math.min(doc.MaxRow(), row))];
}

/** Tests a rectangle with the original per-cell selection rule. @param doc - Workbook. @param area - Ordered rectangle. @param tab - Data sheet. @param options - Native selection permissions. @returns Whether every cell is qualified. */
function areCellsQualified(
  doc: ScDocument,
  area: ScRange,
  tab: number,
  options: SelectionPermissions,
): boolean {
  if (options.locked === options.unlocked) return options.locked;
  for (let col = area.aStart.Col(); col <= area.aEnd.Col(); ++col)
    for (let row = area.aStart.Row(); row <= area.aEnd.Row(); ++row)
      if (!isCellQualified(doc, col, row, tab, options)) return false;
  return true;
}

/** Reads the actual merge dimensions at an anchor. @param doc - Workbook. @param col - Column. @param row - Row. @param tab - Sheet. @returns Native merge attribute. */
function getMerge(doc: ScDocument, col: number, row: number, tab: number): ScMergeAttr | undefined {
  return doc.GetPattern(new ScAddress(col, row, tab))?.GetItem(ATTR_MERGE) as
    ScMergeAttr | undefined;
}

/** Moves the reference before applying native merge and boundary adjustments. @param this - View. @param dx - Column delta. @param dy - Row delta. @returns Nothing. */
export function ExpandReference(this: ScTabView, dx: number, dy: number): void {
  if (!dx && !dy) return;
  const data = this.GetViewData(),
    doc = data.GetDocument();
  if (!data.IsRefMode())
    this.InitRefMode(
      data.GetCurX(),
      data.GetCurY(),
      data.CurrentTabForData(),
      ScRefType.SC_REFTYPE_REF,
    );
  const old: [number, number] = [data.GetRefEndX(), data.GetRefEndY()];
  const tab = data.GetRefEndZ();
  const options = selectionPermissions(doc, tab);
  const point = this.MoveCursorByProtection(old[0], old[1], dx, dy, tab);
  for (const axis of [0, 1] as const) {
    const delta = axis === 0 ? dx : dy;
    if (!delta) continue;
    const max = axis === 0 ? doc.MaxCol() : doc.MaxRow();
    const step = Math.sign(delta);
    const candidate: [number, number] = [...point];
    while (isOverlapped(doc, candidate[0], candidate[1], tab, axis === 0)) {
      const next = candidate[axis] + step;
      candidate[axis] = Math.max(0, Math.min(max, next));
      if (candidate[axis] !== next) break;
    }
    if (isCellQualified(doc, candidate[0], candidate[1], tab, options))
      point[axis] = candidate[axis];
    if (delta < 0 && point[axis] > 0) {
      const merge = getMerge(doc, point[0], point[1], tab);
      // The source uses the row span for both axes when looking back into the same merge.
      if (
        merge?.IsMerged() &&
        old[axis] >= point[axis] &&
        old[axis] <= point[axis] + merge.GetRowMerge() - 1
      )
        --point[axis];
    }
  }
  const [col, row] = doc.SkipOverlapped(point[0], point[1], tab);
  this.UpdateRef(col, row, tab);
}

/** Resolves a contracting block edge against every merge intersecting its perpendicular span. @param doc - Workbook. @param point - Mutable endpoint. @param anchor - Original anchor. @param dx - Column delta. @param dy - Row delta. @param tab - Data sheet. @param beforeMove - Seek the near side before crossing the anchor. @returns Nothing. */
function moveBlockEdge(
  doc: ScDocument,
  point: [number, number],
  anchor: [number, number],
  dx: number,
  dy: number,
  tab: number,
  beforeMove: boolean,
): void {
  const original: [number, number] = [...point];
  const options = selectionPermissions(doc, tab);
  for (const axis of [0, 1] as const) {
    const horizontal = axis === 0;
    const step = Math.sign(horizontal ? dx : dy);
    const other = horizontal ? 1 : 0;
    const perpendicular = beforeMove ? original[other] : point[other];
    const first = Math.min(perpendicular, anchor[other]);
    const last = Math.max(perpendicular, anchor[other]);
    const max = horizontal ? doc.MaxCol() : doc.MaxRow();
    const origin = anchor[axis];
    let edge = point[axis];
    if (!step || (beforeMove && (step > 0 ? origin >= max : origin <= 0))) continue;
    for (let i = first; i <= last && (origin - edge) * step > 0;) {
      let next = edge;
      const offset = (beforeMove ? step > 0 : step < 0) ? 1 : 0;
      while (
        next >= 0 &&
        next <= max &&
        isOverlapped(
          doc,
          horizontal ? next + offset : i,
          horizontal ? i : next + offset,
          tab,
          horizontal,
        )
      )
        next += step;
      if (next === edge) {
        ++i;
        continue;
      }
      if (!beforeMove) {
        if ((next - origin) * step > 0) next -= step;
        const area = horizontal
          ? new ScRange(edge + step, first, tab, next, last, tab)
          : new ScRange(first, edge + step, tab, last, next, tab);
        area.PutInOrder();
        if (!areCellsQualified(doc, area, tab, options)) break;
      }
      edge = next;
      i = first;
    }
    if (!beforeMove || (origin - edge) * step <= 0) point[axis] = edge;
  }
}

/** Extends the native keyboard block with the active cell as its retained origin. @param this - View. @param dx - Column motion. @param dy - Row motion. @returns Whether the marked rectangle changed. */
export function ExpandBlock(this: ScTabView, dx: number, dy: number): boolean {
  if (!dx && !dy) return false;
  const data = this.GetViewData(),
    doc = data.GetDocument(),
    mark = data.GetMarkData();
  const tab = data.CurrentTabForData();
  const previous = new ScRange(mark.GetMarkArea());
  const active = this.IsBlockMode();
  const origin: [number, number] = [data.GetCurX(), data.GetCurY()];
  let end: [number, number] = active ? [this["nBlockEndX"], this["nBlockEndY"]] : [...origin];
  if (!active) {
    const merge = getMerge(doc, origin[0], origin[1], tab);
    if (merge?.IsMerged())
      end = [origin[0] + merge.GetColMerge() - 1, origin[1] + merge.GetRowMerge() - 1];
  }
  const anchor: [number, number] = active ? [this["nBlockStartX"], this["nBlockStartY"]] : origin;
  moveBlockEdge(doc, end, anchor, dx, dy, tab, true);
  end = this.MoveCursorByProtection(end[0], end[1], dx, dy, tab);
  moveBlockEdge(doc, end, anchor, dx, dy, tab, false);
  end[0] = Math.max(0, Math.min(doc.MaxCol(), end[0]));
  end[1] = Math.max(0, Math.min(doc.MaxRow(), end[1]));
  if (!active && end[0] === origin[0] && end[1] === origin[1]) return false;
  if (!active) this.InitBlockMode(origin[0], origin[1], tab, true);
  this.MarkCursor(end[0], end[1], tab, false, false, true);
  return !previous.equals(mark.GetMarkArea());
}

/** Native IsMarking compares the retained block anchor. @param this - Actual view. @param col - Column. @param row - Row. @param tab - Sheet. @returns Anchor matches. */
export function IsMarking(this: ScTabView, col: number, row: number, tab: number): boolean {
  return (
    this.IsBlockMode() &&
    this["nBlockStartX"] === col &&
    this["nBlockStartY"] === row &&
    this["nBlockStartZ"] === tab
  );
}
/** Original normal block initialization preserves negative/full-axis tests and source defaults. @param this - Actual view. @param col - Anchor column. @param row - Anchor row. @param tab - Anchor sheet. @param testNegative - Test existing selection. @param cols - Full columns. @param rows - Full rows. @param forceNegative - Force subtract mode. @returns Nothing. */
export function InitBlockMode(
  this: ScTabView,
  col: number,
  row: number,
  tab: number,
  testNegative: boolean,
  cols: boolean,
  rows: boolean,
  forceNegative: boolean,
): void {
  if (this.IsBlockMode()) return;
  const data = this.GetViewData(),
    doc = data.GetDocument(),
    mark = data.GetMarkData();
  if (!doc.ValidCol(col)) col = doc.MaxCol();
  if (!doc.ValidRow(row)) row = doc.MaxRow();
  this["bBlockNeg"] =
    forceNegative ||
    (testNegative &&
      (cols
        ? mark.IsColumnMarked(col)
        : rows
          ? mark.IsRowMarked(row)
          : mark.IsCellMarked(col, row)));
  mark.SetMarkNegative(this["bBlockNeg"]);
  this["meBlockMode"] = 1;
  this["bBlockCols"] = cols;
  this["bBlockRows"] = rows;
  this["nBlockStartX"] = this["nBlockStartXOrig"] = col;
  this["nBlockStartY"] = this["nBlockStartYOrig"] = row;
  this["nBlockStartZ"] = tab;
  this["nBlockEndX"] = this["nOldCurX"] = col;
  this["nBlockEndY"] = this["nOldCurY"] = row;
  this["nBlockEndZ"] = tab;
  if (cols) {
    this["nBlockStartY"] = this["nBlockStartYOrig"] = 0;
    this["nBlockEndY"] = doc.MaxRow();
  }
  if (rows) {
    this["nBlockStartX"] = this["nBlockStartXOrig"] = 0;
    this["nBlockEndX"] = doc.MaxCol();
  }
  mark.SetMarkArea(
    new ScRange(
      this["nBlockStartX"],
      this["nBlockStartY"],
      data.GetTabNumber(),
      this["nBlockEndX"],
      this["nBlockEndY"],
      data.GetTabNumber(),
    ),
  );
}
/** Original Own block initialization retains selection endpoints without synthesizing a marked rectangle. @param this - Actual view. @param range - Existing selection. @returns Nothing. */
export function InitOwnBlockMode(this: ScTabView, range: ScRange): void {
  if (this.IsBlockMode()) return;
  const mark = this.GetViewData().GetMarkData();
  if (!mark.IsMarked() && !mark.IsMultiMarked()) this.GetFunctionSet().DeselectAll();
  this["meBlockMode"] = 2;
  this["nBlockStartX"] = range.aStart.Col();
  this["nBlockStartY"] = range.aStart.Row();
  this["nBlockStartZ"] = range.aStart.Tab();
  this["nBlockEndX"] = range.aEnd.Col();
  this["nBlockEndY"] = range.aEnd.Row();
  this["nBlockEndZ"] = range.aEnd.Tab();
}
/** Original DoneBlockMode applies native multi-mark conversion before finishing;paint-only effects are projected by the browser. @param this - Actual view. @param continued - Retain completed selection as multi marks. @returns Nothing. */
export function DoneBlockMode(this: ScTabView, continued: boolean): void {
  if (!this.IsBlockMode() || this["bMoveIsShift"]) return;
  const mark = this.GetViewData().GetMarkData(),
    marking = mark.GetMarkingFlag();
  mark.SetMarking(false);
  if (this["bBlockNeg"] && !continued) mark.MarkToMulti();
  if (continued) mark.MarkToMulti();
  else mark.ResetMark();
  this["meBlockMode"] = 0;
  mark.SetMarking(marking);
  mark.SetMarkNegative(false);
}
/** Original MarkCursor updates the block endpoint while leaving the editing/active cursor at its anchor. @param this - Actual view. @param col - Endpoint column. @param row - Endpoint row. @param tab - Endpoint sheet. @param cols - Full-column gesture. @param rows - Full-row gesture. @param cellSelection - Whether to expand to complete merges. @returns Nothing. */
export function MarkCursor(
  this: ScTabView,
  col: number,
  row: number,
  tab: number,
  cols: boolean,
  rows: boolean,
  cellSelection: boolean,
): void {
  const data = this.GetViewData(),
    doc = data.GetDocument(),
    mark = data.GetMarkData();
  if (!doc.ValidCol(col)) col = doc.MaxCol();
  if (!doc.ValidRow(row)) row = doc.MaxRow();
  if (!this.IsBlockMode()) this.InitBlockMode(col, row, tab, false, cols, rows);
  if (cols) row = doc.MaxRow();
  if (rows) col = doc.MaxCol();
  const area = new ScRange(mark.GetMarkArea());
  if (
    (area.aStart.Col() !== this["nBlockStartX"] && area.aEnd.Col() !== this["nBlockStartX"]) ||
    (area.aStart.Row() !== this["nBlockStartY"] && area.aEnd.Row() !== this["nBlockStartY"]) ||
    this["meBlockMode"] === 2
  ) {
    const oldShift = this["bMoveIsShift"];
    this["bMoveIsShift"] = false;
    this.DoneBlockMode();
    this["bMoveIsShift"] = oldShift;
    this.InitBlockMode(
      area.aStart.Col(),
      area.aStart.Row(),
      this["nBlockStartZ"],
      mark.IsMarkNegative(),
      cols,
      rows,
    );
  }
  if (!cols && !rows) this.GetHeaderFunctionSet().SetAnchorFlag(false);
  if (col === this["nOldCurX"] && row === this["nOldCurY"]) return;
  if (cellSelection) {
    const startX = this["nBlockStartXOrig"],
      startY = this["nBlockStartYOrig"];
    const selection = new ScRange(startX, startY, tab, col, row, tab);
    selection.PutInOrder();
    let last: ScRange;
    do {
      last = new ScRange(selection);
      doc.ExtendOverlapped(selection);
      doc.ExtendMergeRange(selection);
    } while (!last.equals(selection));
    const forwardX = col >= startX,
      forwardY = row >= startY;
    this["nBlockStartX"] = (forwardX ? selection.aStart : selection.aEnd).Col();
    this["nBlockStartY"] = (forwardY ? selection.aStart : selection.aEnd).Row();
    col = (forwardX ? selection.aEnd : selection.aStart).Col();
    row = (forwardY ? selection.aEnd : selection.aStart).Row();
  }
  this["nBlockEndX"] = col;
  this["nBlockEndY"] = row;
  mark.SetMarkArea(new ScRange(this["nBlockStartX"], this["nBlockStartY"], tab, col, row, tab));
  this["nOldCurX"] = col;
  this["nOldCurY"] = row;
}
