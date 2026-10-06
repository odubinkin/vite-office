/** @fileoverview Collects represented native row split items from original selected lines in ndtbl1.cxx. */
import type { SwTable, SwTableBox } from "../table/swtable";

/** Reads a common native row item, retaining no-item for empty or mixed selection. @param table - Original table owner. @param boxes - Original selected boxes, or whole table dialog input. @returns Common split value or no item. */
export function GetSwRowSplit(table: SwTable, boxes?: readonly SwTableBox[]): boolean | undefined {
  const rows = table.GetTabLines().filter(
    /** Collects actual selected row owners. @param row - Original line. @returns Whether represented in the selection. */
    (row) =>
      boxes === undefined ||
      row.GetTabBoxes().some(
        /** Resolves a connected original box. @param box - Original box. @returns Whether selected. */
        (box) => boxes.includes(box),
      ),
  );
  const first = rows[0];
  if (first === undefined) return undefined;
  const value = !(first.GetFormat().keepTogether ?? false);
  for (const row of rows) if (!(row.GetFormat().keepTogether ?? false) !== value) return undefined;
  return value;
}
