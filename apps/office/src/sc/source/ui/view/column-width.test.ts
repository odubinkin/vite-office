/** @fileoverview Native typed HMM command,real geometry documents,grouped spans,visibility and source history/cursor witnesses. */
import { expect, it } from "vitest";
import { createCalcSession } from "../../../browser/composition/calc-module";
import { ScCellShell } from "./cellsh3";
import { ScViewFunc } from "./viewfunc";
import { ScSizeMode, InsertDeleteFlags, TwipsToEvenHMM } from "../../../inc/global";
import { ScMarkData } from "../../../inc/markdata";
import { ScRange } from "../../../inc/address";
import { ColRowSpan } from "../../../inc/columnspanset";
import { SfxRequest } from "../../../../sfx2/source/control/request";
import { SfxCallMode } from "../../../../sfx2/source/control/bindings";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { ScUndoWidthOrHeight } from "../undo/undoblk2";
import { ScDocument } from "../../../inc/document";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
it("uses original HMM and optional one-based column routing with API and non-API completion distinctions", /** Actual cell shell and marks. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument(),
    view = new ScViewFunc(c.viewData, c.shell),
    shell = new ScCellShell(view);
  try {
    expect(shell.ExecuteColumnWidth(new SfxRequest(26290), c.viewData)).toBe(false);
    c.viewData.GetMarkData().SetMarkArea(new ScRange(1, 0, 0, 2, doc.MaxRow(), 0));
    const explicit = new SfxRequest(26290, [
      new SfxUInt16Item(26290, 2540),
      new SfxUInt16Item(21160, 2),
    ]);
    expect(shell.ExecuteColumnWidth(explicit, c.viewData)).toBe(true);
    expect(explicit.IsDone()).toBe(false);
    expect(doc.GetColWidth(1, 0)).toBe(1440);
    expect(doc.GetColWidth(2, 0)).toBe(1440);
    expect(doc.GetColWidth(0, 0)).toBe(1280);
    const outside = new SfxRequest(26290, [
      new SfxUInt16Item(26290, 5080),
      new SfxUInt16Item(21160, 5),
    ]);
    shell.ExecuteColumnWidth(outside, c.viewData);
    expect(doc.GetColWidth(4, 0)).toBe(2880);
    c.viewData.GetMarkData().ResetMark();
    c.Select(7, 3);
    const api = new SfxRequest(26290, [new SfxUInt16Item(26290, 2540)], SfxCallMode.API);
    c.ExecuteColumnWidth(api);
    expect(api.IsDone()).toBe(false);
    expect(doc.GetColWidth(7, 0)).toBe(1440);
    const ordinary = new SfxRequest(26290, [new SfxUInt16Item(26290, 5080)]);
    c.ExecuteColumnWidth(ordinary);
    expect(ordinary.IsDone()).toBe(true);
    expect(doc.GetColWidth(7, 0)).toBe(2880);
    const result = c.CompleteColumnWidth(56693);
    expect(TwipsToEvenHMM(56693)).toBe(100000);
    expect(result.IsDone()).toBe(true);
    expect((result.GetArgs()[0] as SfxUInt16Item).GetValue()).toBe(34464);
    expect(doc.GetColWidth(7, 0)).toBe(56693);
  } finally {
    session.Close();
  }
});
it("retains disjoint column geometry on original grouped sheets and native history without resetting cursor or marks", /** Source spans and real undo document. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument();
  try {
    c.InsertSheet();
    c.InsertSheet();
    c.SelectTab(0);
    c.Select(1, 5);
    c.viewData.GetMarkData().SelectTable(2, true);
    const view = new ScViewFunc(c.viewData, c.shell),
      ranges = [new ColRowSpan(1, 1), new ColRowSpan(3, 3)];
    view.SetWidthOrHeight(true, ranges, ScSizeMode.SC_SIZE_DIRECT, 1800);
    expect(doc.GetColWidth(1, 0)).toBe(1800);
    expect(doc.GetColWidth(3, 2)).toBe(1800);
    expect(doc.GetColWidth(2, 0)).toBe(1280);
    expect(doc.GetColWidth(1, 1)).toBe(1280);
    c.Select(9, 12);
    const marks = c.viewData.GetMarkData();
    marks.SetMarkArea(new ScRange(9, 12, 0, 10, 13, 0));
    const manager = c.shell.GetUndoManager(),
      action = manager.GetUndoAction() as ScUndoWidthOrHeight;
    expect(action.GetComment()).toBe("Column Width");
    expect(c.Undo()).toBe(true);
    expect(doc.GetColWidth(1, 0)).toBe(1280);
    expect(c.viewData.GetCurX()).toBe(9);
    expect(marks.GetMarkArea().aEnd.Col()).toBe(10);
    expect(c.Redo()).toBe(true);
    expect(doc.GetColWidth(3, 2)).toBe(1800);
    expect(c.viewData.GetCurY()).toBe(12);
    c.SelectTab(1);
    c.Undo();
    expect(c.viewData.GetTabNumber()).toBe(0);
    c.SelectTab(1);
    c.Redo();
    expect(c.viewData.GetTabNumber()).toBe(0);
    view.SetWidthOrHeight(true, [], ScSizeMode.SC_SIZE_DIRECT, 0);
    expect(
      /** Device-dependent optimal sizing is explicit. @returns Nothing. */ () =>
        view.SetWidthOrHeight(true, ranges, ScSizeMode.SC_SIZE_OPTIMAL, 10),
    ).toThrow("explicit geometry");
    view.SetWidthOrHeight(true, ranges, ScSizeMode.SC_SIZE_ORIGINAL, 0, false);
    expect(doc.GetColWidth(1, 0)).toBe(1800);
    const undo = new ScDocument(),
      name = unicode("Snapshot");
    undo.InsertTab(0, name);
    name.dispose();
    const headless = new ScUndoWidthOrHeight(
      c.shell,
      marks,
      1,
      3,
      0,
      undo,
      true,
      ranges,
      ScSizeMode.SC_SIZE_DIRECT,
      1000,
    );
    headless.RedoWithContext();
    headless.UndoWithContext();
    headless.Dispose();
    const oneTabUndo = new ScDocument(),
      n = unicode("Single");
    oneTabUndo.InsertTab(0, n);
    n.dispose();
    doc.CopyToDocument(
      new ScRange(1, 0, 0, 3, doc.MaxRow(), 0),
      InsertDeleteFlags.NONE,
      false,
      oneTabUndo,
    );
    const oldMarks = new ScMarkData(marks);
    oldMarks.SelectTable(5, true);
    const removedTab = new ScUndoWidthOrHeight(
      c.shell,
      oldMarks,
      1,
      3,
      0,
      oneTabUndo,
      true,
      ranges,
      ScSizeMode.SC_SIZE_DIRECT,
      1000,
    );
    removedTab.UndoWithContext();
    removedTab.Dispose();
  } finally {
    session.Close();
  }
});
it("hides without losing widths,skips hidden cursor columns,reverses at boundaries and survives an all-hidden sheet", /** Real visibility/cursor owners. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument(),
    view = new ScViewFunc(c.viewData, c.shell);
  try {
    c.Select(2, 4);
    doc.SetColWidth(2, 0, 2000);
    doc.SetColHidden(3, 5, 0, true);
    c.ShowColumns(false);
    expect(doc.GetColWidth(2, 0)).toBe(0);
    expect(doc.GetColWidth(2, 0, false)).toBe(2000);
    expect(c.viewData.GetCurX()).toBe(6);
    expect(c.addressText).toBe("G5");
    c.Select(2, 4);
    c.ShowColumns(true);
    expect(doc.GetColWidth(2, 0)).toBe(2000);
    doc.SetColHidden(1, doc.MaxCol(), 0, true);
    expect(view.SkipCursorHorizontal(1, 0, 1)).toBe(0);
    doc.SetColHidden(0, 0, 0, true);
    expect(view.SkipCursorHorizontal(1, 0, 1)).toBe(0);
    doc.SetColHidden(1, 1, 0, false);
    expect(view.SkipCursorHorizontal(0, 1, -1)).toBe(1);
    doc.SetColHidden(doc.MaxCol(), doc.MaxCol(), 0, false);
    expect(view.SkipCursorHorizontal(doc.MaxCol(), 0, 1)).toBe(doc.MaxCol());
  } finally {
    session.Close();
  }
});
