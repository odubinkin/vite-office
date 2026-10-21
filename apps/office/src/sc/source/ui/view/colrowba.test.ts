/** @fileoverview Actual header geometry, native integer boundaries, marks, hidden entries and document-backed history. */
import { expect, it } from "vitest";
import { ScDocShell } from "../docshell/docsh";
import { ScTabViewShell } from "../inc/tabvwsh";
import { ScColBar, ScRowBar } from "../inc/colrowba";
import { HDR_SIZE_OPTIMUM } from "../inc/hdrcont";
import { ScRange } from "../../../inc/address";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";

for (const width of [true, false]) {
  it(`retains ${width ? "column" : "row"} minimum, UInt16 narrowing, stored hidden dimensions and native history`, /** Uses genuine document/view/header owners. @returns Nothing. */ () => {
    const shell = new ScDocShell(),
      view = new ScTabViewShell(shell),
      doc = shell.GetDocument(),
      bar = width ? new ScColBar(view, 1 / 16) : new ScRowBar(view, 1 / 16);
    expect(bar.GetEntrySize(0)).toBe(width ? 80 : 16);
    bar.SetEntrySize(0, 65536 + 2);
    expect(bar.GetEntrySize(0)).toBe(10);
    expect(shell.Undo()).toBe(true);
    expect(bar.GetEntrySize(0)).toBe(width ? 80 : 16);
    expect(shell.Redo()).toBe(true);
    expect(bar.GetEntrySize(0)).toBe(10);
    bar.SetEntrySize(0, 120);
    expect(bar.GetEntrySize(0)).toBe(120);
    bar.HideEntries(0, 0);
    expect(bar.GetEntrySize(0)).toBe(0);
    expect(width ? doc.GetColWidth(0, 0, false) : doc.GetRowHeight(0, 0, false)).toBe(1920);
    expect(shell.Undo()).toBe(true);
    expect(bar.GetEntrySize(0)).toBe(120);
    bar.SetEntrySize(0, 4096);
    expect(bar.GetEntrySize(0)).toBe(0);
    expect(width ? doc.GetColWidth(0, 0, false) : doc.GetRowHeight(0, 0, false)).toBe(1920);
    expect(
      /** The original optimum sentinel reaches the existing explicit unported device branch. @returns Nothing. */ () =>
        bar.SetEntrySize(0, HDR_SIZE_OPTIMUM),
    ).toThrow("explicit geometry");
    shell.GetUndoManager().Clear();
  });

  it(`resizes full selected ${width ? "columns" : "rows"} on grouped sheets while an unselected hit affects only itself`, /** Preserves real marks,cursor,groups and attribute-only geometry undo. @returns Nothing. */ () => {
    const shell = new ScDocShell(),
      view = new ScTabViewShell(shell),
      doc = shell.GetDocument(),
      data = view.GetViewData(),
      marks = data.GetMarkData(),
      bar = width ? new ScColBar(view, 1 / 15) : new ScRowBar(view, 1 / 15);
    const name = unicode("Second");
    doc.InsertTab(1, name);
    name.dispose();
    marks.SelectTable(1, true);
    marks.SetMarkArea(
      width ? new ScRange(1, 0, 0, 2, doc.MaxRow(), 0) : new ScRange(0, 1, 0, doc.MaxCol(), 2, 0),
    );
    data.SetCurX(5);
    data.SetCurY(6);
    bar.SetEntrySize(1, 100);
    for (const tab of [0, 1])
      for (const entry of [1, 2])
        expect(width ? doc.GetColWidth(entry, tab) : doc.GetRowHeight(entry, tab, false)).toBe(
          1500,
        );
    bar.SetEntrySize(4, 80);
    expect(width ? doc.GetColWidth(4, 0) : doc.GetRowHeight(4, 0, false)).toBe(1200);
    expect(width ? doc.GetColWidth(1, 0) : doc.GetRowHeight(1, 0, false)).toBe(1500);
    expect(data.GetCurX()).toBe(5);
    expect(data.GetCurY()).toBe(6);
    expect(marks.GetTableSelect(1)).toBe(true);
    expect(marks.GetMarkArea().aStart[width ? "Col" : "Row"]()).toBe(1);
    expect(shell.Undo()).toBe(true);
    expect(shell.Undo()).toBe(true);
    expect(bar.GetEntrySize(1)).toBe(width ? 85 : 17);
    expect(shell.Redo()).toBe(true);
    expect(bar.GetEntrySize(2)).toBe(100);
    shell.GetUndoManager().Clear();
  });

  it(`retains disjoint ${width ? "column" : "row"} marks through the final sheet entry`, /** Covers native scan termination and isolated trailing marked entries at the real coordinate limit. @returns Nothing. */ () => {
    const shell = new ScDocShell(),
      view = new ScTabViewShell(shell),
      doc = shell.GetDocument(),
      marks = view.GetViewData().GetMarkData(),
      bar = width ? new ScColBar(view, 1 / 15) : new ScRowBar(view, 1 / 15),
      last = width ? doc.MaxCol() : doc.MaxRow();
    marks.SetMultiMarkArea(
      width ? new ScRange(2, 0, 0, 2, doc.MaxRow(), 0) : new ScRange(0, 2, 0, doc.MaxCol(), 2, 0),
    );
    marks.SetMultiMarkArea(
      width
        ? new ScRange(last, 0, 0, last, doc.MaxRow(), 0)
        : new ScRange(0, last, 0, doc.MaxCol(), last, 0),
    );
    bar.SetEntrySize(last, 60);
    expect(bar.GetEntrySize(2)).toBe(60);
    expect(bar.GetEntrySize(last)).toBe(60);
    expect(bar.GetEntrySize(3)).toBe(width ? 85 : 17);
    shell.GetUndoManager().Clear();
  });
}

it("keeps filtered rows hidden while native header sizing changes their stored height", /** Source ShowFilteredRows and height history stay authoritative. @returns Nothing. */ () => {
  const shell = new ScDocShell(),
    view = new ScTabViewShell(shell),
    doc = shell.GetDocument(),
    bar = new ScRowBar(view, 1 / 15);
  doc.SetRowFiltered(1, 1, 0, true);
  doc.SetRowHidden(1, 1, 0, true);
  bar.SetEntrySize(1, 50);
  expect(bar.GetEntrySize(1)).toBe(0);
  expect(doc.GetRowHeight(1, 0, false)).toBe(750);
  expect(doc.RowFiltered(1, 0)).toBe(true);
  expect(shell.Undo()).toBe(true);
  expect(doc.GetRowHeight(1, 0, false)).toBe(256);
  expect(doc.RowHidden(1, 0)).toBe(true);
  shell.GetUndoManager().Clear();
});
