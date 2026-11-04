/** @fileoverview Original tblrwcl.cxx predecessor algorithms for the currently represented base table lines and leaf boxes; anonymous nested-line boxes are not represented by these classes. */
import type { SwTable, SwTableBox, SwTableLine } from "../table/swtable";
/** Original SwTableBox::FindPreviousBox leaf branch and actual upper-line delegation. This model resolves the actual upper line from its owning table graph. @param box - Actual leaf box. @param table - Actual owning table. @param search - Original search pointer; null returns this leaf. @returns Actual predecessor or null. */
export function FindPreviousBoxInBox(
  box: SwTableBox,
  table: SwTable,
  search: SwTableBox | null,
): SwTableBox | null {
  if (!search) return box;
  const line = table.GetTabLines().find(
    /** Resolves actual ownership without creating an alternate line list. @param candidate - Actual row. @returns Ownership match. */
    (candidate) => candidate.GetTabBoxes().includes(box),
  );
  if (!line) throw new Error("assert(native box belongs to an upper line)");
  return line.FindPreviousBox(table, search);
}
/** Original SwTableLine::FindPreviousBox base-line/leaf algorithm, including empty previous rows and original over-table-lines default. @param line - Actual base row. @param table - Actual table. @param search - Optional source box pointer. @param overTableLines - Original true default. @returns Previous actual leaf or null. */
export function FindPreviousBoxInLine(
  line: SwTableLine,
  table: SwTable,
  search: SwTableBox | null = null,
  overTableLines = true,
): SwTableBox | null {
  const boxes = line.GetTabBoxes();
  if (search && boxes.length) {
    const pos = boxes.indexOf(search);
    if (pos > 0) return boxes[pos - 1] as SwTableBox;
  }
  if (!overTableLines) return null;
  const lines = table.GetTabLines(),
    pos = lines.indexOf(line);
  if (pos < 0) throw new Error("assert(native line belongs to its table)");
  if (!pos) return null;
  const previous = lines[pos - 1] as SwTableLine;
  return previous.GetTabBoxes().at(-1) ?? previous.FindPreviousBox(table, null, overTableLines);
}
