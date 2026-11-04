/** @fileoverview Native tblrwcl.cxx previous-content-box traversal through actual base/nested lines and anonymous boxes. */
import type { SwTable, SwTableBox, SwTableLine } from "../table/swtable";
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
