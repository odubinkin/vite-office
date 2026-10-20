/** @fileoverview Actual ScViewFunc frame application and attribute history preserve adjacent envelopes, filtered/disjoint/grouped marks and frame ownership. */
import { expect, it } from "vitest";
import { ScDocShell } from "../docshell/docsh";
import { ScTabViewShell } from "./tabvwsh4";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScPatternAttr } from "../../../inc/patattr";
import {
  SvxBoxItem,
  SvxBoxInfoItem,
  SvxBoxItemLine as Edge,
  SvxBoxInfoItemLine as Inner,
} from "../../../../editeng/source/items/frmitems";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Reads actual canonical outer frame. @param shell - Document owner. @param col - Column. @param row - Row. @param tab - Sheet. @returns Borrowed native box. */
function box(shell: ScDocShell, col: number, row: number, tab = 0): SvxBoxItem {
  return (shell.GetDocument().GetPattern(new ScAddress(col, row, tab)) as ScPatternAttr).GetItem(
    150,
  ) as SvxBoxItem;
}
/** Makes real outer/inner frames with independent lines. @returns Native frame pair. */
function frame(): [SvxBoxItem, SvxBoxInfoItem] {
  const outer = new SvxBoxItem(150),
    inner = new SvxBoxInfoItem(151);
  for (const edge of [Edge.TOP, Edge.BOTTOM, Edge.LEFT, Edge.RIGHT])
    outer.SetLine(new SvxBorderLine(null, 20), edge);
  inner.SetLine(new SvxBorderLine(null, 30), Inner.HORI);
  inner.SetLine(new SvxBorderLine(null, 40), Inner.VERT);
  return [outer, inner];
}
it("records adjacent-cell envelope undo and preserves source rectangle-redo envelope loss independently of request items", /** Source snapshot and real holder ownership. @returns Nothing. */ () => {
  const shell = new ScDocShell(),
    view = new ScTabViewShell(shell),
    doc = shell.GetDocument(),
    marks = view.GetViewData().GetMarkData(),
    [outer, inner] = frame(),
    delta = new ScPatternAttr(doc.getCellAttributeHelper());
  try {
    marks.SetMarkArea(new ScRange(0, 0, 0, 2, 2, 0));
    doc.ApplySelectionFrame(marks, outer, inner);
    doc.SetValue(new ScAddress(1, 1, 0), 42);
    marks.SetMarkArea(new ScRange(1, 1, 0, 1, 1, 0));
    const clear = new SvxBoxItem(150);
    clear.SetRemoveAdjacentCellBorder(true);
    view.ApplyPatternLines(delta, clear, inner);
    expect(shell.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(shell.GetUndoManager().GetUndoAction()?.GetComment()).toBe("Attributes/Lines");
    expect(box(shell, 1, 0).GetBottom()).toBeUndefined();
    expect(box(shell, 0, 1).GetRight()).toBeUndefined();
    clear.SetRemoveAdjacentCellBorder(false);
    inner.SetValid(255, false);
    expect(shell.Undo()).toBe(true);
    expect(box(shell, 1, 0).GetBottom()?.GetWidth()).toBe(30);
    expect(box(shell, 0, 1).GetRight()?.GetWidth()).toBe(40);
    expect(shell.Redo()).toBe(true);
    expect(box(shell, 1, 1).GetTop()).toBeUndefined();
    expect(box(shell, 1, 0).GetBottom()?.GetWidth()).toBe(30);
    expect(box(shell, 0, 1).GetRight()?.GetWidth()).toBe(40);
    expect(doc.GetValue(new ScAddress(1, 1, 0))).toBe(42);
    expect(box(shell, 0, 0).GetTop()?.GetWidth()).toBe(20);
    expect(shell.Undo()).toBe(true);
    expect(box(shell, 1, 1).GetTop()?.GetWidth()).toBe(30);
  } finally {
    delta.Dispose();
    shell.Close();
  }
});
it("applies real disjoint grouped frames, ignores filtered rows and retains unselected gaps through undo/redo", /** Real copied marks and selected tabs. @returns Nothing. */ () => {
  const shell = new ScDocShell(),
    view = new ScTabViewShell(shell),
    doc = shell.GetDocument(),
    marks = view.GetViewData().GetMarkData(),
    [outer, inner] = frame(),
    delta = new ScPatternAttr(doc.getCellAttributeHelper()),
    name = unicode("Second");
  try {
    doc.InsertTab(1, name);
    marks.SelectTable(1, true);
    marks.SetMultiMarkArea(new ScRange(0, 0, 0, 0, 2, 0));
    marks.SetMultiMarkArea(new ScRange(2, 0, 0, 2, 2, 0));
    doc.SetRowFiltered(1, 1, 0, true);
    view.ApplyPatternLines(delta, outer, inner);
    expect(box(shell, 0, 0).GetTop()?.GetWidth()).toBe(20);
    expect(box(shell, 0, 1).GetTop()).toBeUndefined();
    expect(box(shell, 1, 0).GetTop()).toBeUndefined();
    expect(box(shell, 2, 2, 1).GetBottom()?.GetWidth()).toBe(20);
    expect(shell.Undo()).toBe(true);
    expect(box(shell, 0, 0).GetTop()).toBeUndefined();
    expect(box(shell, 2, 2, 1).GetBottom()).toBeUndefined();
    expect(shell.Redo()).toBe(true);
    expect(box(shell, 0, 1).GetTop()).toBeUndefined();
    expect(box(shell, 1, 0).GetTop()).toBeUndefined();
    expect(box(shell, 2, 2, 1).GetBottom()?.GetWidth()).toBe(20);
    expect(marks.IsMultiMarked()).toBe(true);
  } finally {
    name.dispose();
    delta.Dispose();
    shell.Close();
  }
});
it("uses the actual cursor when no marks exist and retains native default frame-line state across view commands", /** Real source view lifetime. @returns Nothing. */ () => {
  const shell = new ScDocShell(),
    view = new ScTabViewShell(shell),
    data = view.GetViewData(),
    delta = new ScPatternAttr(shell.GetDocument().getCellAttributeHelper()),
    [outer, inner] = frame();
  try {
    expect(data.GetViewShell()).toBe(view);
    expect(view.GetDefaultFrameLine()?.GetWidth()).toBe(20);
    data.SetCurX(4);
    data.SetCurY(6);
    view.ApplyPatternLines(delta, outer, inner);
    expect(box(shell, 4, 6).GetTop()?.GetWidth()).toBe(20);
    expect(box(shell, 0, 0).GetTop()).toBeUndefined();
    expect(data.GetMarkData().IsMarked()).toBe(true);
    shell.Undo();
    expect(box(shell, 4, 6).GetTop()).toBeUndefined();
    shell.Redo();
    expect(box(shell, 4, 6).GetTop()?.GetWidth()).toBe(20);
    const line = new SvxBorderLine(null, 75);
    view.SetDefaultFrameLine(line);
    line.SetWidth(120);
    expect(view.GetDefaultFrameLine()?.GetWidth()).toBe(75);
    view.SetDefaultFrameLine(undefined);
    expect(view.GetDefaultFrameLine()).toBeUndefined();
  } finally {
    delta.Dispose();
    shell.Close();
  }
});
