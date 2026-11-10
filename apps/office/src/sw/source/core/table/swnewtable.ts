/** @fileoverview Native SwTable selection, PrepareMerge and NewMerge for the native new-table model. */
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwNodeRange } from "../../../inc/ndindex";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { SwPosition } from "../crsr/pam";
import { DelBookmarks } from "../doc/docbm";
import { SaveLeftRightBorder, SaveUpperLowerBorder } from "../doc/tblrwcl";
import { SwTableNode } from "../docnode/node";
import type { SwTextNode } from "../txtnode/ndtxt";
import type { SwTableBox, SwTableLine } from "./swtable-boxline";
import type { SwTable } from "./swtable";

/** One original row of the physical selection. */
interface SwBoxSelectionRow {
  readonly line: SwTableLine;
  readonly boxes: readonly SwTableBox[];
}

/** A native rectangular selection in node order. */
export interface SwBoxSelection {
  readonly rows: readonly SwBoxSelectionRow[];
  readonly mergeWidth: number;
  readonly widthChanges: readonly (readonly [SwTableBox, number])[];
}

/** Reads the native cumulative left border of an actual box. @param box - Connected box. @returns Left border in table coordinates. */
function Box2LeftBorder(box: SwTableBox): number {
  let left = 0;
  for (const candidate of box.GetUpper()?.GetTabBoxes() ?? []) {
    if (candidate === box) break;
    left += candidate.GetFrameFormat().GetFrameSize().GetWidth();
  }
  return left;
}

/** Original continuation lookup retains the position tolerance and first crossing fallback. @param left - Logical position. @param line - Existing row. @returns Matching nonzero box. */
function LeftBorder2Box(left: number, line: SwTableLine | undefined): SwTableBox | undefined {
  let current = 0;
  for (const box of line?.GetTabBoxes() ?? []) {
    const width = box.GetFrameFormat().GetFrameSize().GetWidth();
    if (width && (Math.abs(current - left) <= Math.trunc(left / 1000) || current >= left))
      return box;
    current += width;
  }
  return undefined;
}

/** Resolves a native covered box's original master. @param lines - Original table lines. @param box - Actual continuation. @param row - Its row. @returns The found box and row. */
function FindStartOfRowSpan(
  lines: readonly SwTableLine[],
  box: SwTableBox,
  row: number,
): { box: SwTableBox; row: number } {
  const left = Box2LeftBorder(box);
  while (row > 0 && box.getRowSpan() < 1) {
    const previous = LeftBorder2Box(left, lines[--row]);
    if (!previous) break;
    box = previous;
  }
  return { box, row };
}

/** Tracks a spanning outside neighbor during logical border correction. */
interface SelectionBoundary {
  span: number;
  left: number;
}

/** Collects a rectangle using source endpoint borders and extends through enclosed row spans. @param table - Actual owner. @param start - First endpoint. @param end - Last endpoint. @returns Actual connected selection or null. */
export function CollectBoxSelection(
  table: SwTable,
  start: SwTableBox,
  end: SwTableBox,
): SwBoxSelection | null {
  const startLine = start.GetUpper(),
    endLine = end.GetUpper(),
    lines = table.GetTabLines();
  if (!startLine || !endLine || start === end) return null;
  const top = lines.indexOf(startLine);
  let bottom = lines.indexOf(endLine);
  if (top < 0 || bottom < top) return null;
  const firstLeft = Box2LeftBorder(start),
    lastLeft = Box2LeftBorder(end),
    min = Math.min(firstLeft, lastLeft),
    max = Math.max(
      firstLeft + start.GetFrameFormat().GetFrameSize().GetWidth(),
      lastLeft + end.GetFrameFormat().GetFrameSize().GetWidth(),
    ),
    mid = Math.trunc((min + max) / 2);
  if (max <= min) return null;
  const rows: SwBoxSelectionRow[] = [];
  const widthChanges: [SwTableBox, number][] = [];
  const leftBoundary: SelectionBoundary = { span: 0, left: 0 };
  const rightBoundary: SelectionBoundary = { span: 0, left: 0 };
  let checkBottom = bottom;
  for (let row = top; row <= bottom && row < lines.length; ++row) {
    const line = lines[row] as SwTableLine,
      cells = line.GetTabBoxes(),
      boxes: SwTableBox[] = [];
    let right = 0;
    const adjust =
      /** Applies original paired boundary changes after validating neighboring spans. @param inner - Selected cell. @param outer - Outside cell. @param boundary - Original side state. @param outerLeft - Desired lookup border. @param delta - Width transferred to the outer box. @returns Whether the adjustment is valid. */ (
        inner: SwTableBox,
        outer: SwTableBox,
        boundary: SelectionBoundary,
        outerLeft: number,
        delta: number,
      ): boolean => {
        if (row === bottom) bottom += Math.max(0, Math.abs(inner.getRowSpan()) - 1);
        let span = outer.getRowSpan();
        let firstRow = row;
        if (span < 0) {
          const master = FindStartOfRowSpan(lines, outer, row);
          span = master.box.getRowSpan();
          firstRow = master.row;
          if (firstRow < top || !boundary.span || outerLeft !== boundary.left) return false;
        } else {
          if (boundary.span) return false;
          if (span !== 1) {
            boundary.left = outerLeft;
            boundary.span = span;
          }
        }
        if (span !== 1) checkBottom = Math.max(checkBottom, firstRow + span - 1);
        widthChanges.push([inner, -delta], [outer, delta]);
        return true;
      };
    for (const [index, box] of cells.entries()) {
      const left = right;
      right += box.GetFrameFormat().GetFrameSize().GetWidth();
      if (right <= min) {
        if (right === min && leftBoundary.span) return null;
        continue;
      }
      if (left < min) {
        const previous = cells[index - 1],
          next = cells[index + 1];
        if (right >= mid || right + left >= min + min) {
          if (!previous || !adjust(box, previous, leftBoundary, left, min - left)) return null;
          boxes.push(box);
          if (right > max) {
            if (!next || !adjust(box, next, rightBoundary, right, right - max)) return null;
          } else if (right === max && rightBoundary.span) return null;
        } else if (!next || !adjust(next, box, leftBoundary, right, min - right)) return null;
      } else if (right <= max) {
        boxes.push(box);
        const span = box.getRowSpan();
        if (row === top && span < 0) return null;
        bottom = Math.max(bottom, row + Math.abs(span) - 1);
        if (right === max && rightBoundary.span) return null;
      } else if (left < max) {
        if (left <= mid || right + left <= max) {
          const next = cells[index + 1];
          if (!next || !adjust(box, next, rightBoundary, right, right - max)) return null;
          boxes.push(box);
        } else {
          const previous = cells[index - 1];
          if (!previous || !adjust(previous, box, rightBoundary, left, left - max)) return null;
        }
      } else break;
    }
    if (!boxes.length) return null;
    for (const box of boxes) {
      if (!box.GetSttIdx()) return null;
      const section = box.GetStartNode(),
        nodes = section.GetNodes(),
        endIndex = section.EndOfSectionIndex();
      if (endIndex <= section.GetIndex() + 1) return null;
      for (let index = section.GetIndex() + 1; index < endIndex;) {
        const node = nodes.at(index);
        if (node.IsTextNode()) index++;
        else if (node instanceof SwTableNode && node.EndOfSectionIndex() < endIndex)
          index = node.EndOfSectionIndex() + 1;
        else return null;
      }
    }
    if (leftBoundary.span) --leftBoundary.span;
    if (rightBoundary.span) --rightBoundary.span;
    rows.push({ line, boxes });
  }
  return checkBottom > bottom ? null : { rows, widthChanges, mergeWidth: max - min };
}

/** Original IsEmptyBox test for a lone empty text node with no paragraph or character fly. @param paragraph - First direct paragraph of the selected box. @param count - Number of nodes in the cell. @returns Whether the box is empty. */
function IsEmptyBox(paragraph: SwTextNode, count: number): boolean {
  if (count !== 1 || paragraph.Len() !== 0) return false;
  for (const format of paragraph.GetDoc().GetSpzFrameFormats()) {
    const anchor = format.GetAnchor();
    if (
      anchor.GetAnchorNode() === paragraph &&
      (anchor.GetAnchorId() === RndStdIds.FLY_AT_PARA ||
        anchor.GetAnchorId() === RndStdIds.FLY_AT_CHAR)
    )
      return false;
  }
  return true;
}

/** Moves the complete original cell section content to the master, retaining direct and nested nodes. @param box - Original visible cell. @param master - Surviving cell. @returns Nothing. */
function MoveBoxContent(box: SwTableBox, master: SwTableBox): void {
  const source = box.GetStartNode();
  const nodes = source.GetNodes();
  const end = source.EndOfSectionNode();
  const first = nodes.at(source.GetIndex() + 1);
  const text = first.GetTextNode();
  if (text && IsEmptyBox(text, end.GetIndex() - first.GetIndex())) return;
  const destination = master.GetStartNode().EndOfSectionNode();
  const ops = destination.GetDoc().GetDocumentContentOperationsManager();
  const last = nodes.at(end.GetIndex() - 1);
  const position = new SwPosition(last, last.GetTextNode()?.Len() ?? 0);
  try {
    ops.AppendTextNode(position);
    const range = new SwNodeRange(first, position.GetNode());
    try {
      if (!ops.MoveNodeRange(range, destination))
        throw new Error("assert(complete native cell range)");
    } finally {
      range.Dispose();
    }
  } finally {
    position.Dispose();
  }
}

/** Source prepared merge, carrying the actual master and the boxes marked for removal. */
export interface SwPreparedMerge {
  readonly master: SwTableBox;
  readonly removed: ReadonlySet<SwTableBox>;
}

/** Moves visible content, assigns native signed row spans, and leaves zero-width redundant boxes for deletion. @param selection - Validated native selection. @returns Prepared operation or null if no new visible box is merged. */
export function PrepareMerge(selection: SwBoxSelection): SwPreparedMerge | null {
  const master = (selection.rows[0] as SwBoxSelectionRow).boxes[0] as SwTableBox;
  let last: SwTableBox | undefined;
  let merged = false;
  const removed = new Set<SwTableBox>();
  for (const { boxes } of selection.rows) {
    for (const [column, box] of boxes.entries()) {
      if (column > 0) removed.add(box);
      if (box.getRowSpan() < 1) continue;
      if (column + 1 === boxes.length) last = box;
      if (box !== master) merged = true;
    }
  }
  if (!merged) return null;
  for (const [box, delta] of selection.widthChanges)
    box.SetFrameSize(
      new SwFormatFrameSize(
        SwFrameSize.Variable,
        box.GetFrameFormat().GetFrameSize().GetWidth() + delta,
        0,
      ),
    );
  for (const [row, { boxes }] of selection.rows.entries()) {
    for (const [column, box] of boxes.entries()) {
      if (box !== master && box.getRowSpan() > 0) MoveBoxContent(box, master);
      if (column === 0)
        box.setRowSpan(row === 0 ? selection.rows.length : row - selection.rows.length);
    }
  }
  for (const { line } of selection.rows.slice(1)) {
    const boxes = line.GetTabBoxes();
    if (
      boxes.every(
        /** Checks source superfluous row predicate. @param box - Actual box. @returns Whether this cell can be discarded. */ (
          box,
        ) => box.getRowSpan() < 1 || removed.has(box),
      )
    )
      for (const box of boxes) removed.add(box);
  }
  const format = master.ClaimFrameFormat();
  format.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Variable, selection.mergeWidth, 0));
  for (const [row, { boxes }] of selection.rows.entries()) {
    for (const [column, box] of boxes.entries()) {
      if (column > 0) box.SetFrameSize(new SwFormatFrameSize(SwFrameSize.Variable, 0, 0));
      else if (row > 0) {
        box.ChgFrameFormat(format);
        const start = box.GetStartNode();
        const nodes = start.GetNodes();
        for (let index = start.GetIndex() + 1; index < start.EndOfSectionIndex(); ++index) {
          const paragraph = nodes.at(index).GetTextNode();
          if (!paragraph) break;
          paragraph.SetCountedInList(false);
        }
      }
    }
  }
  if (last) {
    const outside = last.GetFrameFormat().GetBox(),
      borders = master.GetBox();
    try {
      borders.SetLine(outside.GetRight(), SvxBoxItemLine.RIGHT);
      borders.SetLine(outside.GetBottom(), SvxBoxItemLine.BOTTOM);
      if (
        borders.GetLeft() ||
        borders.GetTop() ||
        borders.GetRight() ||
        borders.GetBottom() ||
        format.GetBox().GetRight() ||
        format.GetBox().GetBottom()
      )
        format.SetFormatAttr(borders);
    } finally {
      borders.Dispose();
    }
  }
  return { master, removed };
}

/** Original pre-deletion adjustments for nonzero-width master or follow cells in deleted rows. @param lines - Table lines before removal. @param box - Actual cell to remove. @param row - Row coordinate. @returns Nothing. */
function PrepareDelBox(lines: readonly SwTableLine[], box: SwTableBox, row: number): void {
  let span = box.getRowSpan();
  if (span === 1 || !box.GetFrameFormat().GetFrameSize().GetWidth()) return;
  const left = Box2LeftBorder(box);
  if (span > 1) LeftBorder2Box(left, lines[row + 1])?.setRowSpan(span - 1);
  else {
    while (span < 0 && row > 0) {
      const previous = LeftBorder2Box(left, lines[--row]);
      if (!previous) break;
      span = previous.getRowSpan();
      span += span > 1 ? -1 : 1;
      previous.setRowSpan(span);
    }
  }
}

/** Deletes redundant cell sections or wholly covered lines in reverse node order. @param table - Table owner. @param merge - Prepared native operation. @returns Nothing. */
export function NewMerge(table: SwTable, merge: SwPreparedMerge): void {
  table.SetHTMLTableLayout(null);
  const target = merge.master.GetParagraphs()[0] as SwTextNode,
    lines = table.GetTabLines(),
    nodes = target.GetNodes();
  for (const [row, line] of lines.entries()) {
    let left = 0;
    for (const box of line.GetTabBoxes()) {
      if (merge.removed.has(box)) SaveUpperLowerBorder(lines, row, box, left, merge.removed);
      left += box.GetFrameFormat().GetFrameSize().GetWidth();
    }
  }
  for (const [row, line] of lines.entries())
    for (const box of line.GetTabBoxes())
      if (merge.removed.has(box)) PrepareDelBox(lines, box, row);
  for (const line of [...lines].reverse()) {
    const boxes = [...line.GetTabBoxes()];
    const removed = boxes.filter(
      /** Retains the source deletion order within this row. @param box - Actual cell. @returns Whether it was marked for removal. */ (
        box,
      ) => merge.removed.has(box),
    );
    for (const box of removed) {
      const start = box.GetStartNode();
      DelBookmarks(start, start.EndOfSectionNode());
    }
    if (!removed.length) continue;
    if (removed.length === boxes.length) {
      const start = (boxes[0] as SwTableBox).GetStartNode().GetIndex(),
        end = (boxes.at(-1) as SwTableBox).GetStartNode().EndOfSectionIndex();
      nodes.RemoveTableRow(
        table,
        { line, nodes: nodes.entries().slice(start, end + 1) },
        target,
        0,
      );
    } else {
      for (const box of removed.reverse()) {
        const start = box.GetStartNode();
        SaveLeftRightBorder(box, line);
        nodes.RemoveTableBox(
          table,
          line,
          { box, nodes: nodes.entries().slice(start.GetIndex(), start.EndOfSectionIndex() + 1) },
          target,
          0,
        );
      }
    }
  }
}
