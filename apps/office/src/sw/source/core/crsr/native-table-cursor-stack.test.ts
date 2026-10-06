/** @fileoverview Verifies source cursor stack modes over registered native points and original table selections. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { SwDocShell } from "../../uibase/app/docsh";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { PopMode } from "./trvltbl";
/** Authors original table and shell owners. @returns Native fixture. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Stack", {});
  table.AddColumnWidth(6000);
  for (let i = 0; i < 3; i++) doc.nodes.AppendTableRow(table, 1);
  const nodes = table
    .GetTabLines()
    .map(
      /** Reads actual text owners. @param row - Native row. @returns Original text. */ (row) =>
        required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]),
    );
  for (const node of nodes) node.SetText("cell");
  const shell = new SwWrtShell(
    new SwDocShell(doc, createDocument({ id: "stack", suiteId: "writer", title: "Stack" })),
  );
  shell.FocusNode(required(nodes[1]));
  return { doc, table, nodes, shell };
}
it("native Push/Pop uses LIFO modes and preserves the persistent ordinary cursor", /** Checks saved endpoint copies, DeleteStack and ClearMark. @returns Nothing. */ () => {
  const f = fixture(),
    cursor = f.shell.getShellCursor();
  try {
    expect(f.shell.Pop(PopMode.DeleteCurrent)).toBe(false);
    cursor.GetPoint().SetContent(1);
    cursor.SetMark();
    cursor.GetPoint().SetContent(3);
    f.shell.Push();
    cursor.GetPoint().SetContent(4);
    f.shell.Push();
    cursor.GetPoint().SetContent(0);
    expect(f.shell.Pop(PopMode.DeleteStack)).toBe(true);
    expect(cursor.GetPoint().GetContentIndex()).toBe(0);
    expect(f.shell.Pop(PopMode.DeleteCurrent)).toBe(true);
    expect(f.shell.getShellCursor()).toBe(cursor);
    expect(cursor.GetPoint().GetContentIndex()).toBe(3);
    expect(cursor.GetMark().GetContentIndex()).toBe(1);
    expect(f.shell.Pop(PopMode.DeleteStack)).toBe(false);
    f.shell.Push();
    f.shell.SelTable();
    const displayed = f.shell.getShellCursor().GetPoint().GetNode();
    f.shell.ClearMark();
    expect(f.shell.IsTableMode()).toBe(false);
    expect(cursor.GetPoint().GetNode()).toBe(displayed);
    expect(cursor.HasMark()).toBe(false);
    f.shell.Pop(PopMode.DeleteCurrent);
    expect(cursor.GetPoint().GetNode()).toBe(f.nodes[1]);
    expect(cursor.GetPoint().GetContentIndex()).toBe(3);
    expect(cursor.GetMark().GetContentIndex()).toBe(1);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    f.shell.Push();
    f.shell.Push();
  } finally {
    f.shell.Close();
  }
  expect(f.shell.Pop(PopMode.DeleteStack)).toBe(false);
});
it("native table cursor restoration keeps actual selected boxes and original table owner", /** Checks selected mode and rebuilt editing rings. @returns Nothing. */ () => {
  const f = fixture();
  try {
    f.shell.SelTableRow();
    const cursor = f.shell.getShellCursor(),
      before = f.shell.CaptureCursorState(),
      boxes = [...f.shell.GetTableSel()];
    f.shell.Push();
    f.shell.SelTable();
    expect(f.shell.GetTableSel()).toHaveLength(3);
    expect(f.shell.Pop(PopMode.DeleteCurrent)).toBe(true);
    expect(f.shell.getShellCursor()).toBe(cursor);
    expect(f.shell.CaptureCursorState().point).toEqual(before.point);
    expect(f.shell.CaptureCursorState().mark).toEqual(before.mark);
    expect(f.shell.GetTableSel()).toEqual(boxes);
    expect(f.shell.IsTableMode()).toBe(true);
    f.shell.ClearMark();
    f.shell.ClearMark();
    expect(f.shell.GetCursor().IsMultiSelection()).toBe(false);
    expect(f.shell.GetCursor().HasMark()).toBe(false);
  } finally {
    f.shell.Close();
  }
});

/** Requires an actual native owner without non-null assertions. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native row owner");
  return value;
}
it("restoring a collapsed native cursor after temporary row selection retains caret input", /** Checks no-mark restoration and source stack input lifetime. @returns Nothing. */ () => {
  const f = fixture();
  try {
    f.shell.ToggleCharacterFormat("bold");
    const input = f.shell.GetPendingCharacterItems(),
      cursor = f.shell.getShellCursor();
    f.shell.Push();
    f.shell.SelTableRow();
    expect(f.shell.GetPendingCharacterItems().Equals(input, true)).toBe(true);
    f.shell.ClearMark();
    expect(f.shell.Pop(PopMode.DeleteCurrent)).toBe(true);
    expect(f.shell.getShellCursor()).toBe(cursor);
    expect(cursor.HasMark()).toBe(false);
    expect(f.shell.GetPendingCharacterItems().Equals(input, true)).toBe(true);
  } finally {
    f.shell.Close();
  }
});
it("nested saved selections retain native endpoints and pending input in ordinary and table modes", /** Checks restored marked selection and actual nested stack input lifetime. @returns Nothing. */ () => {
  for (const selected of [false, true]) {
    const f = fixture();
    try {
      if (selected) f.shell.SelTableRow();
      else {
        f.shell.getShellCursor().SetMark();
        f.shell.getShellCursor().GetPoint().SetContent(3);
      }
      f.shell.ToggleCharacterFormat("bold");
      const cursor = f.shell.getShellCursor(),
        before = f.shell.CaptureCursorState();
      f.shell.Push();
      f.shell.Push();
      f.shell.SelTable();
      if (!selected) f.shell.ClearMark();
      expect(f.shell.Pop(PopMode.DeleteCurrent)).toBe(true);
      expect(f.shell.Pop(PopMode.DeleteCurrent)).toBe(true);
      expect(f.shell.getShellCursor()).toBe(cursor);
      expect(f.shell.CaptureCursorState().point).toEqual(before.point);
      expect(f.shell.CaptureCursorState().mark).toEqual(before.mark);
      expect(f.shell.GetPendingCharacterItems().Equals(before.pendingCharacterItems, true)).toBe(
        true,
      );
      expect(f.shell.IsTableMode()).toBe(selected);
      expect(f.shell.Pop(PopMode.DeleteStack)).toBe(false);
    } finally {
      f.shell.Close();
    }
  }
});
it("native Pop exits temporary table mode for a saved collapsed cursor and retains DeleteStack selection", /** Checks source cursor-mode transitions and stack deletion without movement. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const cursor = f.shell.getShellCursor(),
      before = f.shell.CaptureCursorState();
    f.shell.Push();
    expect(f.shell.Pop(PopMode.DeleteCurrent)).toBe(true);
    f.shell.Push();
    f.shell.SelTable();
    expect(f.shell.Pop(PopMode.DeleteCurrent)).toBe(true);
    expect(f.shell.IsTableMode()).toBe(false);
    expect(f.shell.getShellCursor()).toBe(cursor);
    expect(f.shell.CaptureCursorState().point).toEqual(before.point);
    expect(cursor.HasMark()).toBe(false);
    f.shell.Push();
    f.shell.SelTable();
    const whole = f.shell.CaptureCursorState();
    expect(f.shell.Pop(PopMode.DeleteStack)).toBe(true);
    expect(f.shell.IsTableMode()).toBe(true);
    expect(f.shell.CaptureCursorState().point).toEqual(whole.point);
    expect(f.shell.CaptureCursorState().mark).toEqual(whole.mark);
    f.shell.Push();
    f.shell.SelTableRow();
    expect(f.shell.Pop(PopMode.DeleteCurrent)).toBe(true);
    expect(f.shell.GetTableSel()).toHaveLength(3);
    f.shell.ClearMark();
    expect(f.shell.Pop(PopMode.DeleteStack)).toBe(false);
  } finally {
    f.shell.Close();
  }
});
