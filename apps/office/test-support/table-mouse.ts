/** @fileoverview Supplies physical table frames to real native edit-window acceptance fixtures. */
import type { SwEditWin } from "../src/sw/source/uibase/docvw/edtwin";
import { SwTabFrame } from "../src/sw/source/core/layout/tabfrm";

/** Selects a real row through measured native mouse geometry, never a production row-index adapter. @param edit - Actual edit-window owner. @param nodeIndex - Fixture paragraph address. @returns Native admission result. */
export function selectTableRow(edit: SwEditWin, nodeIndex: number): boolean {
  let point = { x: 93, y: 125 };
  const frames: SwTabFrame[] = [];
  for (const table of edit.GetDoc().GetTables()) {
    const rows = table.GetTabLines(),
      cells = [];
    let matched = false;
    for (const [r, row] of rows.entries())
      for (const [c, box] of row.GetTabBoxes().entries()) {
        const rect = {
          left: 100 + c * 100,
          right: 200 + c * 100,
          top: 100 + r * 50,
          bottom: 150 + r * 50,
        };
        cells.push({ box, rect });
        if (
          box.GetParagraphs().some(
            /** Finds the fixture's original node. @param node - Native paragraph. @returns Whether addressed. */
            (node) => node.GetIndex() === nodeIndex,
          )
        ) {
          point = { x: 93, y: rect.top + 25 };
          matched = true;
        }
      }
    if (matched)
      frames.push(
        new SwTabFrame(table, {
          rect: {
            left: 100,
            right: 100 + table.GetColumnWidths().length * 100,
            top: 100,
            bottom: 100 + rows.length * 50,
          },
          cells,
        }),
      );
  }
  edit.SetTableMouseFrames(frames);
  const admitted = edit.MouseButtonDown(point);
  edit.MouseButtonUp();
  return admitted;
}
