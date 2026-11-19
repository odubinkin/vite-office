/** @fileoverview Source protected cursor and range admission through the normal Calc views. */
import { expect, it } from "vitest";
import { CalcViewController } from "../../../browser/controller/calc-view-controller";
import { ScAddress } from "../../../inc/address";
import { ScProtectionAttr } from "../../../inc/attrib";
import { ScInputMode } from "../../../inc/global";
import { ScTableProtectionOption as Option } from "../../../inc/tabprotection";
import { ScTableProtection } from "../../core/data/tabprotection";
import { ScTabView } from "../inc/tabview";

/** Creates a protected sheet with a small number of real unlocked cell patterns. @param selectLocked - Native option. @param selectUnlocked - Native option. @returns Active controller. */
function fixture(selectLocked: boolean, selectUnlocked: boolean): CalcViewController {
  const controller = new CalcViewController();
  const doc = controller.shell.GetDocument();
  const protection = new ScTableProtection();
  protection.setProtected(true);
  protection.setOption(Option.SELECT_LOCKED_CELLS, selectLocked);
  protection.setOption(Option.SELECT_UNLOCKED_CELLS, selectUnlocked);
  doc.SetTabProtection(0, protection);
  const unlocked = new ScProtectionAttr(false);
  const hidden = new ScProtectionAttr(false, false, true);
  try {
    for (const [col, row] of [
      [2, 1],
      [2, 2],
      [2, 4],
      [4, 1],
    ] as const)
      doc.ApplyAttr(col, row, 0, unlocked);
    doc.ApplyAttr(3, 1, 0, hidden);
  } finally {
    unlocked.Dispose();
    hidden.Dispose();
  }
  return controller;
}

it("skips disallowed and hidden spans during movement but stops an extending selection at a disallowed cell", /** Exercises native relative movement and the retained Shift anchor. @returns Nothing. */ () => {
  const controller = fixture(false, true);
  const doc = controller.shell.GetDocument();
  try {
    expect(controller.Select(2, 0)).toBe(false);
    expect(controller.Select(2, 1)).toBe(true);
    expect(controller.Navigate(0, 1, true)).toBe(true);
    expect(controller.Navigate(0, 1, true)).toBe(false);
    expect(controller.Address()).toBe("C2");
    expect(controller.viewData.GetMarkData().GetMarkArea().aEnd.GetVars()).toEqual([2, 2, 0]);
    expect(controller.Navigate(0, 2)).toBe(true);
    expect(controller.Address()).toBe("C5");
    expect(controller.Navigate(0, -1)).toBe(true);
    expect(controller.Address()).toBe("C3");
    doc.SetRowHidden(2, 2, 0, true);
    expect(controller.Navigate(0, -1)).toBe(true);
    expect(controller.Address()).toBe("C2");
    expect(controller.Navigate(1, 0, true)).toBe(false);
    expect(controller.Navigate(1, 0)).toBe(true);
    expect(controller.Address()).toBe("E2");
    doc.SetColHidden(3, 3, 0, true);
    expect(controller.Navigate(-1, 0, true)).toBe(true);
    expect(controller.Address()).toBe("E2");
    expect(controller.viewData.GetMarkData().GetMarkArea().aStart.GetVars()).toEqual([2, 1, 0]);
  } finally {
    controller.Close();
  }
});

it("checks pointer targets before changing marks or formula references", /** Uses actual pointer, cursor and formula input owners. @returns Nothing. */ () => {
  const controller = fixture(false, true);
  try {
    expect(controller.Select(2, 1)).toBe(true);
    const functionSet = new ScTabView(controller.viewData).GetFunctionSet();
    expect(functionSet.SetCursorAtCell(2, 3, false)).toBe(false);
    expect(controller.Address()).toBe("C2");
    expect(controller.StartPointer(new ScAddress(2, 2, 0), true)).toBe(true);
    controller.MovePointer(new ScAddress(2, 3, 0));
    controller.EndPointer();
    expect(controller.viewData.GetMarkData().GetMarkedRanges().Combine().aEnd.Row()).toBe(2);
    expect(controller.StartPointer(new ScAddress(2, 3, 0), false, true)).toBe(false);
    expect(controller.viewData.GetMarkData().GetMarkedRanges().Combine().aEnd.Row()).toBe(2);

    expect(controller.StartInput(ScInputMode.SC_INPUT_TYPE, "=")).toBe(true);
    expect(controller.StartPointer(new ScAddress(2, 3, 0), false, false)).toBe(false);
    expect(controller.inputText).toBe("=");
    expect(controller.StartPointer(new ScAddress(4, 1, 0), false, false)).toBe(true);
    expect(controller.inputText).toBe("=E2");
    controller.MovePointer(new ScAddress(3, 1, 0));
    expect(controller.inputText).toBe("=E2");
    controller.EndPointer();
  } finally {
    controller.Close();
  }
});

it("admits only locked and hidden-cell targets when the sheet disallows selecting unlocked cells", /** Checks both native option combinations and an entirely blocked worksheet. @returns Nothing. */ () => {
  const controller = fixture(true, false);
  const unavailable = fixture(false, false);
  try {
    expect(controller.Select(2, 1)).toBe(false);
    expect(controller.Select(3, 1)).toBe(true);
    expect(controller.Navigate(-1, 0)).toBe(true);
    expect(controller.Address()).toBe("B2");
    expect(unavailable.StartPointer(new ScAddress(), false, false)).toBe(false);
    expect(unavailable.Navigate(0, 1)).toBe(false);
    expect(unavailable.Navigate(0, 1, true)).toBe(false);
    expect(unavailable.Address()).toBe("A1");
  } finally {
    controller.Close();
    unavailable.Close();
  }
});

it("uses the native merge anchor while preserving the perpendicular position for the next move", /** Verifies original covered-cell and old-cursor handling against a real merge. @returns Nothing. */ () => {
  const controller = fixture(true, true);
  const doc = controller.shell.GetDocument();
  try {
    doc.FetchTable(0)?.SetMergedCells(2, 1, 3, 2);
    expect(controller.Select(1, 2)).toBe(true);
    expect(controller.Navigate(1, 0)).toBe(true);
    expect(controller.Address()).toBe("C2");
    expect(controller.viewData.GetOldCurY()).toBe(2);
    expect(controller.Navigate(1, 0)).toBe(true);
    expect(controller.Address()).toBe("E3");
    expect(controller.Select(3, 0)).toBe(true);
    expect(controller.Navigate(0, 1)).toBe(true);
    expect(controller.Address()).toBe("C2");
    expect(controller.viewData.GetOldCurX()).toBe(3);
    expect(controller.Navigate(0, 1)).toBe(true);
    expect(controller.Address()).toBe("D4");
  } finally {
    controller.Close();
  }
});

it("returns the original position when the hidden extent consumes the remaining movement", /** Checks both sheet edges and protected horizontal extension. @returns Nothing. */ () => {
  const controller = fixture(false, true);
  const doc = controller.shell.GetDocument();
  const view = new ScTabView(controller.viewData);
  try {
    expect(controller.Select(4, 1)).toBe(true);
    doc.SetColHidden(5, doc.MaxCol(), 0, true);
    expect(view.SkipCursorHorizontal(5, 4, 1, 1)).toBe(4);
    expect(view.MoveCursorByProtection(4, 1, 1, 0)).toEqual([4, 1]);
    expect(view.MoveCursorByProtection(0, 1, -1, 0)).toEqual([0, 1]);
    doc.SetColHidden(0, 4, 0, true);
    expect(view.SkipCursorHorizontal(5, 4, 1, 1)).toBe(4);
    expect(view.CanSelectCell(-1, 1)).toBe(false);
  } finally {
    controller.Close();
  }
});

it("keeps the original cell while expanding and contracting across adjacent merges", /** Exercises native Shift block geometry over real merge flags. @returns Nothing. */ () => {
  const controller = new CalcViewController();
  const table = controller.shell.GetDocument().FetchTable(0);
  if (!table) throw new Error("The active sheet is missing");
  try {
    table.SetMergedCells(1, 1, 2, 2);
    table.SetMergedCells(3, 1, 5, 2);
    table.SetMergedCells(1, 3, 2, 5);
    expect(controller.Select(1, 1)).toBe(true);
    expect(controller.Navigate(1, 0, true)).toBe(true);
    const marks = controller.viewData.GetMarkData();
    expect(marks.GetMarkArea().aEnd.GetVars()).toEqual([5, 2, 0]);
    expect(controller.Address()).toBe("B2");
    expect(controller.Navigate(-1, 0, true)).toBe(true);
    expect(marks.GetMarkArea().aEnd.GetVars()).toEqual([2, 2, 0]);
    expect(controller.Navigate(0, 1, true)).toBe(true);
    expect(marks.GetMarkArea().aEnd.GetVars()).toEqual([2, 5, 0]);
    expect(controller.Navigate(0, -1, true)).toBe(true);
    expect(marks.GetMarkArea().aEnd.GetVars()).toEqual([2, 2, 0]);
  } finally {
    controller.Close();
  }
});

it("reaches the same merged formula ranges as upstream keyboard and mouse gestures", /** Ports the keyboard and pointer assertions from ScUiCalcTest. @returns Nothing. */ () => {
  const controller = new CalcViewController();
  const table = controller.shell.GetDocument().FetchTable(0);
  if (!table) throw new Error("The active sheet is missing");
  try {
    table.SetMergedCells(0, 0, 0, 4);
    table.SetMergedCells(0, 5, 0, 9);
    expect(controller.Select(1, 0)).toBe(true);
    expect(controller.StartInput(ScInputMode.SC_INPUT_TYPE, "=")).toBe(true);
    expect(controller.PointReference(new ScAddress(0, 0, 0))).toBe(true);
    expect(controller.Input()).toBe("=A1");
    controller.NavigateReference(0, 1, true);
    expect(controller.Input()).toBe("=A1:A10");
    controller.NavigateReference(0, -1, true);
    expect(controller.Input()).toBe("=A1:A5");
    expect(controller.Address()).toBe("B1");

    controller.Cancel();
    expect(controller.StartInput(ScInputMode.SC_INPUT_TYPE, "=")).toBe(true);
    expect(controller.StartPointer(new ScAddress(0, 0, 0))).toBe(true);
    controller.MovePointer(new ScAddress(0, 5, 0));
    controller.EndPointer();
    expect(controller.Input()).toBe("=A1:A10");
  } finally {
    controller.Close();
  }
});

it("uses the original row span for a leftward reference through a horizontal merge", /** Records the non-square source span comparison in CALC-739. @returns Nothing. */ () => {
  const controller = new CalcViewController();
  try {
    const table = controller.shell.GetDocument().FetchTable(0);
    if (!table) throw new Error("The active sheet is missing");
    table.SetMergedCells(1, 1, 3, 1);
    expect(controller.Select(4, 1)).toBe(true);
    expect(controller.StartInput(ScInputMode.SC_INPUT_TYPE, "=")).toBe(true);
    expect(controller.PointReference(new ScAddress(1, 1, 0))).toBe(true);
    controller.DragReference(new ScAddress(3, 1, 0));
    controller.NavigateReference(-1, 0, true);
    expect(controller.Input()).toBe("=B2:D2");
    expect(controller.viewData.GetRefEndX()).toBe(3);
  } finally {
    controller.Close();
  }
});

it("checks the whole merged block edge against the protected sheet options", /** Retains the mark when the edge of a merging contraction contains a prohibited cell. @returns Nothing. */ () => {
  const controller = fixture(false, true),
    doc = controller.shell.GetDocument(),
    table = doc.FetchTable(0);
  if (!table) throw new Error("The active sheet is missing");
  const unlocked = new ScProtectionAttr(false),
    locked = new ScProtectionAttr(true);
  try {
    for (let col = 1; col <= 5; ++col)
      for (let row = 1; row <= 2; ++row) doc.ApplyAttr(col, row, 0, unlocked);
    table.SetMergedCells(1, 1, 2, 2);
    table.SetMergedCells(3, 1, 5, 2);
    expect(controller.Select(1, 1)).toBe(true);
    expect(controller.Navigate(1, 0, true)).toBe(true);
    doc.ApplyAttr(3, 2, 0, locked);
    expect(controller.Navigate(-1, 0, true)).toBe(false);
    doc.ApplyAttr(3, 2, 0, unlocked);
    expect(controller.Navigate(-1, 0, true)).toBe(true);
    expect(controller.viewData.GetMarkData().GetMarkArea().aEnd.GetVars()).toEqual([2, 2, 0]);
  } finally {
    locked.Dispose();
    unlocked.Dispose();
    controller.Close();
  }
});

it("expands the reversed formula anchor and initializes an inactive Shift reference", /** Exercises both the reference anchor and endpoint branches over a real merge. @returns Nothing. */ () => {
  const controller = new CalcViewController(),
    table = controller.shell.GetDocument().FetchTable(0);
  if (!table) throw new Error("The active sheet is missing");
  try {
    table.SetMergedCells(3, 3, 4, 4);
    expect(controller.Select(2, 3)).toBe(true);
    expect(controller.StartInput(ScInputMode.SC_INPUT_TYPE, "=")).toBe(true);
    controller.NavigateReference(0, 0, true);
    expect(controller.Input()).toBe("=");
    controller.NavigateReference(1, 0, true);
    expect(controller.Input()).toBe("=C4:E5");

    controller.Cancel();
    expect(controller.StartInput(ScInputMode.SC_INPUT_TYPE, "=")).toBe(true);
    expect(controller.PointReference(new ScAddress(3, 3, 0))).toBe(true);
    controller.DragReference(new ScAddress(2, 2, 0));
    expect(controller.Input()).toBe("=C3:E5");

    controller.Cancel();
    expect(controller.StartInput(ScInputMode.SC_INPUT_TYPE, "=")).toBe(true);
    expect(controller.PointReference(new ScAddress(2, 2, 0))).toBe(true);
    controller.DragReference(new ScAddress(2, 1, 0));
    controller.NavigateReference(0, 1, true);
    expect(controller.Input()).toBe("=C3");
  } finally {
    controller.Close();
  }
});
