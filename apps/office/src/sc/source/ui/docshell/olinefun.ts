/** @fileoverview Native manual Calc outline operations from olinefun.cxx. */
import { ScRange } from "../../../inc/address";
import type { ScTable } from "../../../inc/table";
import type { ScOutlineArray, ScOutlineEntry } from "../../core/data/olinetab";
import { ScOutlineUndoState, ScUndoOutline, type OutlineSpan } from "../undo/undodat";
import type { ScDocShell } from "./docsh";

/** Reads inclusive native selection endpoints on one axis. @param range - Actual simple range. @param columns - Column axis. @returns Span. */
export function outlineSpan(range: ScRange, columns: boolean): OutlineSpan {
  return columns ? [range.aStart.Col(), range.aEnd.Col()] : [range.aStart.Row(), range.aEnd.Row()];
}

/** Native marked visibility query for one axis. @param tree - Row or column outline. @param span - Inclusive marked interval. @param operation - Applicable outline action. @returns Whether a group qualifies. */
export function hasOutlineEntry(
  tree: ScOutlineArray,
  [first, last]: OutlineSpan,
  operation: "remove" | "hide" | "show",
): boolean {
  for (let level = 0; level < tree.GetDepth(); level++) {
    for (const entry of tree.GetEntries(level)) {
      if (
        operation === "show"
          ? entry.hidden && first <= entry.start && entry.end <= last
          : first <= entry.end && last >= entry.start && (operation === "remove" || !entry.hidden)
      )
        return true;
    }
  }
  return false;
}

/** Groups or ungroups the selected axis without modifying its current hidden rows or columns. @param shell - Native document owner. @param range - Current simple selection. @param columns - Chosen axis. @param make - Group rather than ungroup. @returns Changed. */
export function changeOutline(
  shell: ScDocShell,
  range: ScRange,
  columns: boolean,
  make: boolean,
): boolean {
  const tab = range.aStart.Tab();
  const sheet = shell.GetDocument().FetchTable(tab);
  if (!sheet) return false;
  const outline = make ? sheet.StartOutlineTable() : sheet.GetOutlineTable();
  if (!outline) return false;
  const before = new ScOutlineUndoState(sheet, [], []);
  const tree = columns ? outline.GetColArray() : outline.GetRowArray();
  const span = outlineSpan(range, columns);
  const changed = make ? Boolean(tree.Insert(...span)) : tree.Remove(...span);
  if (!changed) {
    shell.ErrorMessage(make ? "Grouping not possible" : "Ungrouping not possible");
    return false;
  }
  finish(
    shell,
    range,
    make ? "Group" : "Ungroup",
    before,
    new ScOutlineUndoState(sheet, [], []),
    "both",
  );
  return true;
}

/** Shows an outline span without exposing rows hidden by an active filter. @param sheet - Target sheet. @param span - Affected rows. @returns Nothing. */
function showRows(sheet: ScTable, [first, last]: OutlineSpan): void {
  const filter = sheet.getFilterData();
  for (let row = first; row <= last;) {
    const end: [number] = [row];
    const filtered = filter.rowFiltered(row, undefined, end);
    const stop = Math.min(end[0], last);
    if (!filtered) sheet.SetRowHidden(row, stop, false);
    row = stop + 1;
  }
}

/** Changes a group's sheet geometry using the original filtered-row exception. @param sheet - Actual sheet. @param columns - Axis. @param span - Affected entries. @param show - Whether to reveal the span. @returns Nothing. */
function setOutlineVisibility(
  sheet: ScTable,
  columns: boolean,
  span: OutlineSpan,
  show: boolean,
): void {
  if (columns) sheet.SetColHidden(...span, !show);
  else if (show) showRows(sheet, span);
  else sheet.SetRowHidden(...span, true);
}

/** Outline header action. A missing entry selects a whole level. */
export interface ScOutlineControl {
  readonly columns: boolean;
  readonly level: number;
  readonly entry?: number;
}

/** Executes SelectLevel, ShowOutline or HideOutline from an outline window. @param shell - Document owner. @param tab - Active sheet. @param control - Displayed axis, level and optional entry. @param editing - Position on this axis being edited. @returns Whether a mutation was applied. */
export function applyOutlineControl(
  shell: ScDocShell,
  tab: number,
  { columns, level, entry }: ScOutlineControl,
  editing?: number,
): boolean {
  const sheet = shell.GetDocument().FetchTable(tab);
  const outline = sheet?.GetOutlineTable();
  if (!sheet || !outline) return false;
  const tree = columns ? outline.GetColArray() : outline.GetRowArray();
  if (level < 0 || level > tree.GetDepth() || !tree.GetDepth()) return false;
  const target = entry === undefined ? undefined : tree.GetEntries(level)[entry];
  if (
    entry !== undefined &&
    (!target?.visible ||
      (!target.hidden && editing !== undefined && target.start <= editing && editing <= target.end))
  )
    return false;

  const spans: OutlineSpan[] = target ? [[target.start, target.end]] : levelZeroSpans(tree);
  const [x, y] = columns ? [spans, []] : [[], spans];
  const previous = new ScOutlineUndoState(sheet, x, y);
  let label = "Select outline level";
  if (target) {
    const show = target.hidden;
    label = show ? "View Details" : "Hide details";
    target.hidden = !show;
    setOutlineVisibility(sheet, columns, [target.start, target.end], show);
    if (show) {
      for (let depth = level + 1; depth < tree.GetDepth(); ++depth)
        for (const child of tree.GetEntries(depth))
          if (child.hidden && target.start <= child.start && child.end <= target.end)
            setOutlineVisibility(sheet, columns, [child.start, child.end], false);
    }
    tree.SetVisibleBelow(level, target, show, show);
  } else {
    for (let depth = 0; depth < tree.GetDepth(); ++depth) {
      const show = depth < level;
      for (const group of tree.GetEntries(depth)) {
        const { start, end } = group;
        if (!show && editing !== undefined && start <= editing && editing <= end) continue;
        if (depth <= level) group.hidden = !show;
        group.visible = depth <= level;
        setOutlineVisibility(sheet, columns, [start, end], show);
      }
    }
  }
  sheet.InvalidatePageBreaks();
  finish(
    shell,
    new ScRange(0, 0, tab),
    label,
    previous,
    new ScOutlineUndoState(sheet, x, y),
    "none",
  );
  return true;
}

/** Calculates and applies the original marked detail operation on one axis. @param tree - Source outline tree. @param span - Marked endpoints. @param show - Whether to expand. @returns Affected visibility spans and outline mutation. */
function markedAxis(tree: ScOutlineArray, [first, last]: OutlineSpan, show: boolean) {
  if (!show) {
    const level = tree.FindTouchedLevel(first, last) ?? 0;
    const groups = tree.GetEntries(level).filter(
      /** Selects intersecting groups at the touched level. @param entry - Group. @returns Whether to collapse. */
      (entry) => entry.end >= first && entry.start <= last,
    );
    return {
      spans: groups.map(
        /** Reads one affected visibility group. @param group - Group. @returns Outline span. */
        (group): OutlineSpan => [group.start, group.end],
      ),
      /** Collapses these groups and hides their descendant controls. @returns Nothing. */
      apply() {
        for (const group of groups) {
          group.hidden = true;
          tree.SetVisibleBelow(level, group, false);
        }
      },
    };
  }
  let begin = last,
    end = first;
  const groups: ScOutlineEntry[] = [];
  for (let level = 0; level < tree.GetDepth(); ++level) {
    for (const entry of tree.GetEntries(level)) {
      if (first > entry.start || entry.end > last) continue;
      groups.push(entry);
      begin = Math.min(begin, entry.start);
      end = Math.max(end, entry.end);
    }
  }
  return {
    spans: groups.length ? ([[begin, end]] as OutlineSpan[]) : [],
    /** Expands these groups and shows their controls. @returns Nothing. */
    apply() {
      for (const group of groups) {
        group.hidden = false;
        group.visible = true;
      }
    },
  };
}

/** Applies marked detail or removes the entire outline after showing its groups. @param shell - Native document owner. @param range - Current simple range. @param operation - Source command. @returns Changed. */
export function changeOutlineDetail(
  shell: ScDocShell,
  range: ScRange,
  operation: "hide" | "show" | "clear",
): boolean {
  const tab = range.aStart.Tab(),
    document = shell.GetDocument(),
    sheet = document.FetchTable(tab);
  const outline = sheet?.GetOutlineTable();
  if (!sheet || !outline) return false;
  const show = operation !== "hide";
  const columns = markedAxis(outline.GetColArray(), outlineSpan(range, true), show);
  const rows = markedAxis(outline.GetRowArray(), outlineSpan(range, false), show);
  // SelectLevel at maximum depth reveals individual groups, not the gaps between them.
  if (operation === "clear") {
    columns.spans = levelZeroSpans(outline.GetColArray());
    rows.spans = levelZeroSpans(outline.GetRowArray());
  }
  const before = new ScOutlineUndoState(sheet, columns.spans, rows.spans);
  if (operation === "clear") sheet.SetOutlineTable();
  else {
    columns.apply();
    rows.apply();
  }
  for (const span of columns.spans) setOutlineVisibility(sheet, true, span, show);
  for (const span of rows.spans) setOutlineVisibility(sheet, false, span, show);
  sheet.InvalidatePageBreaks();
  const label = operation === "clear" ? "Clear Outline" : show ? "View Details" : "Hide details";
  finish(
    shell,
    range,
    label,
    before,
    new ScOutlineUndoState(sheet, columns.spans, rows.spans),
    operation === "clear" ? "none" : "redo",
  );
  return true;
}

/** Reads each top-level outline span, which contains all of its descendants. @param tree - Source outline tree. @returns Group spans. */
function levelZeroSpans(tree: ScOutlineArray): OutlineSpan[] {
  return tree.GetEntries(0).map(
    /** Projects one outline entry. @param entry - Source group. @returns Inclusive span. */
    (entry) => [entry.start, entry.end],
  );
}

/** Records document mutation in the existing shared history. @param shell - Active shell. @param range - Original marked block. @param label - Undo label. @param before - Original state. @param after - Resulting state. @param mark - When source history resets the view selection. @returns Nothing. */
function finish(
  shell: ScDocShell,
  range: ScRange,
  label: string,
  before: ScOutlineUndoState,
  after: ScOutlineUndoState,
  mark: "both" | "redo" | "none",
): void {
  shell
    .GetUndoManager()
    .AddUndoAction(new ScUndoOutline(new ScRange(range), label, before, after, mark));
  shell.SetDocumentModified();
}
