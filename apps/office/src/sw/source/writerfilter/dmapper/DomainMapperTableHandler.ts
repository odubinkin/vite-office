/** @fileoverview Consumed DomainMapperTableHandler vertical cell bottom-border selection. */
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import type { SwTable } from "../../core/table/swtable";

/** Uses only the final contiguous continuing cell's bottom border on the merge master. @param table - Actual table. @param merges - Original cell merge properties in source grid order. @returns Nothing. */
export function ApplyVerticalMergeBorders(
  table: SwTable,
  merges: readonly (readonly (boolean | undefined)[])[],
): void {
  const lines = table.GetTabLines();
  for (const [row, values] of merges.entries()) {
    for (const [column, restart] of values.entries()) {
      if (restart !== true) continue;
      let last = row;
      while (merges[last + 1]?.[column] === false) ++last;
      if (last === row) continue;
      const first = lines[row]?.GetTabBoxes()[column];
      const final = lines[last]?.GetTabBoxes()[column];
      if (!first || !final) continue;
      const box = first.GetBox();
      const bottom = final.GetFrameFormat().GetBox().GetBottom();
      try {
        box.SetLine(bottom, SvxBoxItemLine.BOTTOM);
        first.ClaimFrameFormat().SetFormatAttr(box);
      } finally {
        box.Dispose();
      }
    }
  }
}
