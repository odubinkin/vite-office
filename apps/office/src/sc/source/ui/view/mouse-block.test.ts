/** @fileoverview Native block and function-set state vectors over actual view/document owners. */
import { expect, it } from "vitest";
import { CalcViewController } from "../../../browser/controller/calc-view-controller";
import { ScTabView } from "../inc/tabview";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScInputMode } from "../../../inc/global";
it("retains original block initialization,bounds,negative conversion and externally changed marks", /** Direct native method contracts include source diagnostic fallback and Own transition. @returns Nothing. */ () => {
  const c = new CalcViewController(),
    v = new ScTabView(c.viewData),
    mark = c.viewData.GetMarkData(),
    doc = c.shell.GetDocument();
  expect(v.IsMarking(0, 0, 0)).toBe(false);
  v.InitBlockMode(-1, -1, 0);
  v.InitBlockMode(2, 2, 0);
  v.InitOwnBlockMode(new ScRange());
  expect(mark.GetMarkArea().aStart.GetVars()).toEqual([doc.MaxCol(), doc.MaxRow(), 0]);
  v.DoneBlockMode();
  v.MarkCursor(-1, -1, 0);
  expect(mark.GetMarkArea().aEnd.GetVars()).toEqual([doc.MaxCol(), doc.MaxRow(), 0]);
  v.DoneBlockMode();
  v.InitBlockMode(0, 0, 0);
  expect(v.IsMarking(0, 0, 0)).toBe(true);
  expect(v.IsMarking(1, 0, 0)).toBe(false);
  expect(v.IsMarking(0, 1, 0)).toBe(false);
  expect(v.IsMarking(0, 0, 1)).toBe(false);
  mark.SetMarkArea(new ScRange(3, 4, 0, 4, 5, 0));
  v.MarkCursor(6, 7, 0);
  expect(mark.GetMarkArea().aStart.GetVars()).toEqual([3, 4, 0]);
  v.DoneBlockMode();
  v.InitBlockMode(0, 0, 0);
  mark.SetMarkArea(new ScRange(0, 3, 0, 2, 4, 0));
  v.MarkCursor(1, 6, 0);
  expect(mark.GetMarkArea().aStart.GetVars()).toEqual([0, 3, 0]);
  v.DoneBlockMode();
  v.InitOwnBlockMode(new ScRange());
  v.MarkCursor(2, 2, 0);
  expect(mark.IsCellMarked(2, 2)).toBe(true);
  v.DoneBlockMode(true);
  v.InitBlockMode(1, 1, 0, false, false, false, true);
  expect(mark.IsMarkNegative()).toBe(true);
  v.DoneBlockMode();
  expect(mark.IsMarked()).toBe(false);
  c.Close();
});
it("keeps original function-set anchors and the first-Ctrl-click old cursor inclusion", /** Actual native state is independent of the browser pointer adapter. @returns Nothing. */ () => {
  const c = new CalcViewController(),
    v = new ScTabView(c.viewData, true, c.scModule),
    f = v.GetFunctionSet(),
    mark = c.viewData.GetMarkData();
  expect(
    /** Rejects an unavailable native device request instead of silently ignoring it. @returns Actual admission. */ () =>
      f.SetCursorAtCell(0, 0, true),
  ).toThrow(/device alignment/);
  f.CreateAnchor();
  f.CreateAnchor();
  expect(f.SetCursorAtCell(0, 0, false)).toBe(true);
  expect(f.SetCursorAtCell(1, 1, false)).toBe(true);
  f.DestroyAnchor();
  f.DeselectAll();
  mark.ResetMark();
  c.viewData.SetSelCtrlMouseClick(true);
  f.SetCursorAtCell(3, 3, false);
  expect(mark.IsCellMarked(0, 0)).toBe(true);
  expect(mark.IsCellMarked(3, 3)).toBe(true);
  f.DeselectAll();
  mark.ResetMark();
  f.SetCursorAtCell(3, 3, false);
  expect(mark.IsCellMarked(3, 3)).toBe(true);
  f.DestroyAnchor();
  c.viewData.SetSelCtrlMouseClick(false);
  c.StartInput(ScInputMode.SC_INPUT_TYPE, "=SUM(");
  f.DeselectAll();
  expect(f.SetCursorAtCell(1, 1, false)).toBe(true);
  f.CreateAnchor();
  f.SetCursorAtCell(2, 2, false);
  expect(c.Input()).toBe("=SUM(B2:C3");
  f.DestroyAnchor();
  expect(c.Input()).toBe("=SUM(B2:C3;");
  f.DeselectAll();
  c.Cancel();
  const detached = new ScTabView(c.viewData),
    plain = detached.GetFunctionSet();
  plain.CreateAnchor();
  plain.DeselectAll();
  plain.DestroyAnchor();
  plain.SetCursorAtCell(0, 0, false);
  const header = v.GetHeaderFunctionSet();
  header.SetColumn(false);
  header.CreateAnchor();
  header.CreateAnchor();
  header.SetCursorAtCell(0, 2);
  expect(mark.IsRowMarked(0)).toBe(true);
  expect(mark.IsRowMarked(2)).toBe(true);
  header.DestroyAnchor();
  header.SetColumn(true);
  header.CreateAnchor();
  header.SetCursorAtCell(2, 0);
  expect(mark.IsColumnMarked(0)).toBe(false);
  expect(mark.IsColumnMarked(2)).toBe(true);
  header.DeselectAll();
  c.Close();
});
it("protects source block mode during Shift cursor movement", /** A test subclass supplies the original protected native state directly,without a production facade. @returns Nothing. */ () => {
  /** Exposes only the original protected Shift state for a direct native vector. */ class View extends ScTabView {
    /** Supplies actual source cursor Shift state. @param value - Flag. @returns Nothing. */ Shift(
      value: boolean,
    ): void {
      this.bMoveIsShift = value;
    }
  }
  const c = new CalcViewController(),
    v = new View(c.viewData);
  v.InitBlockMode(0, 0, 0);
  v.Shift(true);
  v.DoneBlockMode();
  expect(v.IsBlockMode()).toBe(true);
  v.Shift(false);
  v.DoneBlockMode();
  expect(v.IsBlockMode()).toBe(false);
  c.Close();
});
it("routes actual browser pointer failure,header references,keyboard reference motion and empty gestures", /** Real input and native marks cover admission and lifetime boundaries. @returns Nothing. */ () => {
  const c = new CalcViewController(),
    doc = c.shell.GetDocument();
  c.MovePointer(new ScAddress());
  c.EndPointer();
  c.StartInput(ScInputMode.SC_INPUT_TYPE, "bad\ntext");
  expect(c.StartPointer(new ScAddress())).toBe(false);
  c.Cancel();
  c.viewData.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 1, 1, 0));
  c.StartPointer(new ScAddress(2, 2, 0), true);
  c.EndPointer();
  c.StartInput(ScInputMode.SC_INPUT_TYPE, "=SUM(");
  c.StartPointer(new ScAddress(0, 2, 0), false, false, "row");
  c.MovePointer(new ScAddress(0, 4, 0));
  c.EndPointer();
  expect(c.Input()).toBe("=SUM(A3:XFD5");
  c.StartPointer(new ScAddress(2, 0, 0), false, true, "column");
  c.MovePointer(new ScAddress(4, 0, 0));
  c.EndPointer();
  expect(c.Input()).toBe("=SUM(A3:XFD5;C1:E1048576");
  c.Cancel();
  c.Select(2, 2);
  c.StartInput(ScInputMode.SC_INPUT_TYPE, "=");
  c.NavigateReference(1, 0, false);
  expect(c.Input()).toBe("=D3");
  c.NavigateReference(0, 1, true);
  expect(c.Input()).toBe("=D3:D4");
  c.NavigateReference(-1, 0, false);
  c.NavigateReference(0, -1, false);
  expect(c.Input()).toBe("=C3");
  expect(doc.GetCellType(new ScAddress(2, 2, 0))).toBe(0);
  c.Cancel();
  c.Close();
});
