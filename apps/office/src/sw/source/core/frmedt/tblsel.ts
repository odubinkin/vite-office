/** @fileoverview Represents native CheckSplitCells admission for actual flat table print geometry from tblsel.cxx. */
import type { SwFEShell } from "./fetab";
import { SwTabFrame } from "../layout/tabfrm";
import { SwTable } from "../table/swtable";
/** Checks native unsigned MINLAY spacing against actual selected column print widths. @param shell - Actual native frame-editing shell. @param divisions - Native unsigned division count. @returns Whether the represented layout admits splitting. */
export function CheckSplitCells(shell: SwFEShell, divisions: number): boolean {
  if (!Number.isInteger(divisions) || divisions <= 1) return false;
  const table = shell.IsCursorInTable()?.GetTable();
  if (table === undefined) return false;
  const boxes = shell.GetTableSel(SwTable.SEARCH_COL),
    page = shell.GetDoc().GetPageDesc().GetValue(),
    frame = new SwTabFrame(table),
    upperWidth = page.width - page.leftMargin - page.rightMargin,
    minimum = (divisions * 23) & 0xffff;
  try {
    if (boxes.length === 0 || frame.Format(upperWidth).width <= 0) return false;
    return table.GetTabLines().every(
      /** Checks actual selected boxes without replacing layout/model owners. @param line - Native row. @returns Whether admitted. */
      (line) =>
        line.GetTabBoxes().every(
          /** Tests selected cell print width. @param box - Actual box. @param column - Coordinate. @returns Whether wide enough. */
          (box) => !boxes.includes(box) || frame.GetBoxPrintWidth(box, upperWidth) >= minimum,
        ),
    );
  } finally {
    frame.DestroyImpl();
  }
}
