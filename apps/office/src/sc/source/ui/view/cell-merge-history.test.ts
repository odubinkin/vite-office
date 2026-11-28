/** @fileoverview Native merge and split commands over real Calc document and undo owners. */
import { expect, it, vi } from "vitest";
import { ScDocShell } from "../docshell/docsh";
import { ScTabViewShell } from "./tabvwsh4";
import { ScCellShell } from "./cellsh3";
import { ScCellMergeOption } from "./cellmergeoption";
import { ScAddress, ScRange } from "../../../inc/address";
import { ATTR_HOR_JUSTIFY } from "../../../inc/scitems";
import { CellType } from "../../../inc/global";
import { SvxCellHorJustify } from "../../../../editeng/inc/svxenum";
import type { SvxHorJustifyItem } from "../../../../editeng/inc/justifyitem";
import { SfxRequest } from "../../../../sfx2/source/control/request";
import { SfxCallMode } from "../../../../sfx2/source/control/bindings";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { ScMergeCellsOption } from "../miscdlgs/mergecellsdialog";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";

it("centers a source merge and restores both data and original alignment through undo", /** Exercises real merge and split history and the original content dialog path. @returns Promise. */ async () => {
  const shell = new ScDocShell(),
    view = new ScTabViewShell(shell),
    cellShell = new ScCellShell(view);
  const doc = shell.GetDocument(),
    marks = view.GetViewData().GetMarkData();
  const a1 = new ScAddress(0, 0, 0),
    b1 = new ScAddress(1, 0, 0);
  /** Reads the actual native alignment item at the merge origin. @returns Horizontal alignment. */
  const alignment =
    /** Reads the merged cell's effective horizontal justification. @returns Native alignment enum value. */ () =>
      (doc.GetPattern(a1)?.GetItem(ATTR_HOR_JUSTIFY) as SvxHorJustifyItem).GetValue();
  const confirm = vi.fn().mockResolvedValue(ScMergeCellsOption.MoveContentHiddenCells);
  try {
    doc.SetTextCell(a1, unicode("First"));
    doc.SetValue(b1, 42);
    marks.SetMarkArea(new ScRange(a1, b1));
    const request = new SfxRequest(26581);
    expect(cellShell.GetMergeState("toggle")).toEqual({ enabled: true, checked: false });
    expect(await cellShell.ExecuteMerge("toggle", request, confirm)).toBe(true);
    expect(confirm).toHaveBeenCalledOnce();
    expect(request.IsDone()).toBe(false);
    expect(doc.IsMerged(a1)).toBe(true);
    expect(alignment()).toBe(SvxCellHorJustify.Center);
    expect(doc.GetSharedString(a1).getString().equals(unicode("First 42"))).toBe(true);
    expect(doc.GetCellType(b1)).toBe(CellType.CELLTYPE_NONE);
    expect(shell.GetUndoManager().GetUndoAction()?.GetComment()).toBe("Merge");
    expect(shell.Undo()).toBe(true);
    expect(doc.IsMerged(a1)).toBe(false);
    expect(alignment()).toBe(SvxCellHorJustify.Standard);
    expect(doc.GetSharedString(a1).getString().equals(unicode("First"))).toBe(true);
    expect(doc.GetValue(b1)).toBe(42);
    expect(shell.Redo()).toBe(true);
    expect(doc.IsMerged(a1)).toBe(true);
    expect(alignment()).toBe(SvxCellHorJustify.Center);
    expect(doc.GetCellType(b1)).toBe(CellType.CELLTYPE_NONE);

    expect(cellShell.GetMergeState("toggle")).toEqual({ enabled: true, checked: true });
    const split = new SfxRequest(26301);
    expect(await cellShell.ExecuteMerge("split", split, confirm)).toBe(true);
    expect(split.IsDone()).toBe(true);
    expect(doc.IsMerged(a1)).toBe(false);
    expect(doc.SkipOverlapped(1, 0, 0)).toEqual([1, 0]);
    expect(shell.GetUndoManager().GetUndoAction()?.GetComment()).toBe("Split");
    expect(shell.Undo()).toBe(true);
    expect(doc.IsMerged(a1)).toBe(true);
    expect(doc.SkipOverlapped(1, 0, 0)).toEqual([0, 0]);
    expect(shell.Redo()).toBe(true);
    expect(doc.IsMerged(a1)).toBe(false);
  } finally {
    shell.Close();
  }
});

it("moves a lone covered value without asking and preserves the originating selected sheets", /** Exercises actual grouped merge targets and sparse occupied-cell admission. @returns Promise. */ async () => {
  const shell = new ScDocShell(),
    view = new ScTabViewShell(shell),
    cellShell = new ScCellShell(view);
  const doc = shell.GetDocument(),
    marks = view.GetViewData().GetMarkData();
  const confirm = vi.fn();
  try {
    doc.InsertTab(1, unicode("Second"));
    doc.InsertTab(2, unicode("Third"));
    marks.SelectTable(2, true);
    marks.SetMarkArea(new ScRange(0, 1, 0, 0, 3, 0));
    doc.SetValue(new ScAddress(0, 2, 2), 23);
    expect(await cellShell.ExecuteMerge("merge", new SfxRequest(26300), confirm)).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
    expect(doc.IsMerged(new ScAddress(0, 1, 0))).toBe(true);
    expect(doc.IsMerged(new ScAddress(0, 1, 1))).toBe(false);
    expect(doc.IsMerged(new ScAddress(0, 1, 2))).toBe(true);
    expect(doc.GetValue(new ScAddress(0, 1, 2))).toBe(23);
    expect(doc.GetCellType(new ScAddress(0, 2, 2))).toBe(CellType.CELLTYPE_NONE);
    expect(shell.Undo()).toBe(true);
    expect(doc.IsMerged(new ScAddress(0, 1, 0))).toBe(false);
    expect(doc.GetValue(new ScAddress(0, 2, 2))).toBe(23);

    const option = new ScCellMergeOption(new ScRange(0, 1, 1, 0, 3, 1));
    expect(shell.GetDocFunc().MergeCells(option, false, true, false)).toBe(true);
    expect(doc.IsMerged(new ScAddress(0, 1, 1))).toBe(true);
    option.maTabs.clear();
    expect(shell.Undo()).toBe(true);
    expect(doc.IsMerged(new ScAddress(0, 1, 1))).toBe(false);
  } finally {
    shell.Close();
  }
});

it("preserves the original empty-contents redo and occupied API request behaviors", /** Covers the source discrepancies CALC-820 and CALC-821 through the actual cell shell. @returns Promise. */ async () => {
  const shell = new ScDocShell(),
    view = new ScTabViewShell(shell),
    cellShell = new ScCellShell(view);
  const doc = shell.GetDocument(),
    marks = view.GetViewData().GetMarkData();
  const a1 = new ScAddress(0, 0, 0),
    b1 = new ScAddress(1, 0, 0);
  const confirm = vi.fn().mockResolvedValue(ScMergeCellsOption.EmptyContentHiddenCells);
  try {
    doc.SetValue(a1, 1);
    doc.SetValue(b1, 2);
    marks.SetMarkArea(new ScRange(a1, b1));
    const api = new SfxRequest(26300, [new SfxBoolItem(26300, true)], SfxCallMode.API);
    expect(await cellShell.ExecuteMerge("merge", api, confirm)).toBe(false);
    expect(confirm).not.toHaveBeenCalled();
    expect(doc.IsMerged(a1)).toBe(false);
    expect(await cellShell.ExecuteMerge("merge", new SfxRequest(26300), confirm)).toBe(true);
    expect(doc.GetValue(a1)).toBe(1);
    expect(doc.GetCellType(b1)).toBe(CellType.CELLTYPE_NONE);
    expect(shell.Undo()).toBe(true);
    expect(doc.GetValue(b1)).toBe(2);
    expect(shell.Redo()).toBe(true);
    expect(doc.IsMerged(a1)).toBe(true);
    expect(doc.GetValue(b1)).toBe(2);
  } finally {
    shell.Close();
  }
});
