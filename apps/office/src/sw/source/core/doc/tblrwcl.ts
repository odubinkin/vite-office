/** @fileoverview Native tblrwcl.cxx content-box traversal and border preservation for flat table deletion. */
import type { SwTable, SwTableBox, SwTableLine } from "../table/swtable";
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import type { SvxBorderLine } from "../../../../editeng/source/items/borderline";
/** Original box leaf return and upper delegation. @param box - Actual box. @param table - Owning table. @param search - Original optional search pointer. @returns Previous actual content box or null. */
export function FindPreviousBoxInBox(
  box: SwTableBox,
  table: SwTable,
  search: SwTableBox | null,
): SwTableBox | null {
  if (!search && !box.GetTabLines().length) return box;
  const upper = box.GetUpper();
  if (!upper) throw new Error("assert(native box has an upper line)");
  return upper.FindPreviousBox(table, search ?? box);
}
/** Original descent follows the last line/box without synthesizing a content leaf. @param box - Original predecessor. @returns Actual final descendant. */
function LastBox(box: SwTableBox): SwTableBox {
  while (box.GetTabLines().length) {
    const line = box.GetTabLines().at(-1);
    const last = line?.GetTabBoxes().at(-1);
    if (!last) throw new Error("assert(native nested last line has a box)");
    box = last;
  }
  return box;
}
/** Original line traversal preserves the upper-line ascent even with overTableLines false; that flag only suppresses base-table crossing. @param line - Actual row. @param table - Owning table. @param search - Original optional box. @param overTableLines - Original true default. @returns Actual predecessor or null. */
export function FindPreviousBoxInLine(
  line: SwTableLine,
  table: SwTable,
  search: SwTableBox | null = null,
  overTableLines = true,
): SwTableBox | null {
  const boxes = line.GetTabBoxes();
  if (search && boxes.length) {
    const pos = boxes.indexOf(search);
    if (pos > 0) return LastBox(boxes[pos - 1] as SwTableBox);
  }
  const upper = line.GetUpper();
  let previous: SwTableLine;
  if (upper) {
    const pos = upper.GetTabLines().indexOf(line);
    if (pos < 0) throw new Error("assert(native line belongs to its upper box)");
    if (!pos) {
      const parent = upper.GetUpper();
      if (!parent) throw new Error("assert(native upper box has a row)");
      return parent.FindPreviousBox(table, upper, overTableLines);
    }
    previous = upper.GetTabLines()[pos - 1] as SwTableLine;
  } else if (overTableLines) {
    const pos = table.GetTabLines().indexOf(line);
    if (pos < 0) throw new Error("assert(native line belongs to its table)");
    if (!pos) return null;
    previous = table.GetTabLines()[pos - 1] as SwTableLine;
  } else return null;
  const last = previous.GetTabBoxes().at(-1);
  return last ? LastBox(last) : previous.FindPreviousBox(table, null, overTableLines);
}

const COLFUZZY = 20;

/** Changes one native edge on the actual destination cell. @param box - Original cell. @param edge - Native box side. @param line - Borrowed source border. @returns Nothing. */
function SetBoxBorder(box: SwTableBox, edge: SvxBoxItemLine, line: SvxBorderLine): void {
  const item = box.GetBox();
  try {
    item.SetLine(line, edge);
    box.ClaimFrameFormat().SetFormatAttr(item);
  } finally {
    item.Dispose();
  }
}

/** Original next/previous deletion counterpart search over flat content rows. @param lines - Original table lines. @param row - Removed row. @param step - Direction. @param left - Removed box left. @param width - Removed box width. @param removed - Deletion set. @returns Surviving counterpart. */
function FndNxtPrvDelBox(
  lines: readonly SwTableLine[],
  row: number,
  step: -1 | 1,
  left: number,
  width: number,
  removed: ReadonlySet<SwTableBox>,
): SwTableBox | undefined {
  for (let index = row + step; index >= 0 && index < lines.length; index += step) {
    const cells = lines[index]?.GetTabBoxes() ?? [];
    let candidate = cells[0];
    let candidateWidth = 0;
    let remaining = left + width;
    for (const cell of cells) {
      if (remaining <= 0) break;
      candidate = cell;
      candidateWidth = cell.GetFrameFormat().GetFrameSize().GetWidth();
      remaining -= candidateWidth;
    }
    if (
      candidate &&
      candidate.GetSttIdx() &&
      Math.abs(remaining) <= COLFUZZY &&
      Math.abs(width - candidateWidth) <= COLFUZZY &&
      !removed.has(candidate)
    )
      return candidate;
  }
  return undefined;
}

/** Original pre-delete top/bottom border handoff, including the predecessor's top-edge test. @param lines - Actual flat table lines. @param row - Removed cell's row. @param box - Cell being removed. @param left - Removed cell's left edge. @param removed - Deletion set. @returns Nothing. */
export function SaveUpperLowerBorder(
  lines: readonly SwTableLine[],
  row: number,
  box: SwTableBox,
  left: number,
  removed: ReadonlySet<SwTableBox>,
): void {
  const item = box.GetFrameFormat().GetBox(),
    border = item.GetTop() ?? item.GetBottom();
  if (!border) return;
  const width = box.GetFrameFormat().GetFrameSize().GetWidth(),
    previous = FndNxtPrvDelBox(lines, row, -1, left, width, removed),
    next = FndNxtPrvDelBox(lines, row, 1, left, width, removed),
    previousItem = previous?.GetFrameFormat().GetBox(),
    nextItem = next?.GetFrameFormat().GetBox();
  if (next && !nextItem?.GetTop() && !previousItem?.GetBottom())
    SetBoxBorder(next, SvxBoxItemLine.TOP, border);
  else if (previous && !previousItem?.GetTop() && !nextItem?.GetTop())
    SetBoxBorder(previous, SvxBoxItemLine.BOTTOM, border);
}

/** Original DeleteBox_ left/right border handoff before structural removal. @param box - Cell being removed. @param line - Still-connected original row. @returns Nothing. */
export function SaveLeftRightBorder(box: SwTableBox, line: SwTableLine): void {
  const border =
    box.GetFrameFormat().GetBox().GetLeft() ?? box.GetFrameFormat().GetBox().GetRight();
  if (!border) return;
  const boxes = line.GetTabBoxes(),
    index = boxes.indexOf(box),
    previous = boxes[index - 1],
    next = boxes[index + 1];
  if (previous?.GetFrameFormat().GetBox().GetRight() || next?.GetFrameFormat().GetBox().GetLeft())
    return;
  if (next?.GetSttIdx()) SetBoxBorder(next, SvxBoxItemLine.LEFT, border);
  else if (previous?.GetSttIdx()) SetBoxBorder(previous, SvxBoxItemLine.RIGHT, border);
}
