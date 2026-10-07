/** @fileoverview Checks pinned frame/cursor/shell line margins over real body and cell owners. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPosition, SwPaM } from "../../core/crsr/pam";
import { SwTextCursor } from "../../core/text/itrtxt";
import { SwTextFrame } from "../../core/text/txtfrm";
import { SwCursorShell, PopMode } from "../../core/crsr/trvltbl";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "./wrtsh1";
import { SwEditWin } from "../docvw/edtwin";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
const shells: SwWrtShell[] = [];
afterEach(
  /** Releases registered native cursor owners. @returns Nothing. */ () => {
    for (const shell of shells.splice(0)) shell.Close();
    SwTextCursor.SetRightMargin(false);
  },
);
/** Creates actual native body/cell owners with fixed device line offsets. @param text - Native text. @param cell - Cell context. @returns Real editing graph. */
function fixture(text: string, cell = false) {
  const doc = new SwDoc(),
    body = doc.paragraphs[0];
  if (body === undefined) throw Error("Missing body");
  const table = doc.nodes.MakeTableNode("Table1");
  table.AddColumnWidth(6000);
  const box = doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0],
    node = cell ? box?.GetParagraphs()[0] : body;
  if (node === undefined || box === undefined) throw Error("Missing cell");
  node.SetText(text);
  const docShell = new SwDocShell(
      doc,
      createDocument({ id: "margins", suiteId: "writer", title: "Margins" }),
    ),
    shell = new SwWrtShell(docShell),
    edit = new SwEditWin(shell);
  shells.push(shell);
  shell.FocusNode(node);
  doc.GetUndoManager().Clear();
  return { doc, node, box, table, shell, edit };
}
/** Assigns a literal point and optional reversed mark through native owners. @param f - Actual fixture. @param point - Moving offset. @param mark - Fixed offset. @returns Nothing. */
function select(f: ReturnType<typeof fixture>, point: number, mark?: number): void {
  const p = new SwPosition(f.node, point),
    m = mark === undefined ? undefined : new SwPosition(f.node, mark);
  try {
    f.shell.SetPaM(p, m);
  } finally {
    p.Dispose();
    m?.Dispose();
  }
  SwTextCursor.SetRightMargin(false);
}
it.each([
  ["abc   def", [6, 9], 1, false, false, 3],
  ["abc   def", [6, 9], 1, false, true, 6],
  ["abc   def", [6, 9], 7, true, false, 6],
  ["abc   def", [6, 9], 7, false, false, 9],
  ["abc   ", [6], 1, false, false, 6],
  ["abc\ndef", [4, 7], 1, false, false, 3],
  ["abc\ndef", [4, 7], 1, false, true, 3],
  ["abc\ndef", [4, 7], 4, true, false, 4],
  ["", [0], 0, false, false, 0],
  ["", [0], 0, true, false, 0],
  ["A😀B  C", [6, 7], 2, false, false, 4],
  ["ab\tcd", [3, 5], 1, false, false, 3],
] as const)(
  "frame native %s %s offset%s left%s API%s =>%s",
  /** Checks literal source contracts independently of browser geometry. @param text - Text. @param ends - Device line ends. @param offset - Point. @param left - Direction. @param api - API flag. @param expected - Literal native target. @returns Nothing. */ (
    text,
    ends,
    offset,
    left,
    api,
    expected,
  ) => {
    const f = fixture(text),
      lines = ends.map(
        /** Builds explicitly authored device boundaries. @param end - Line end. @param index - Line index. @returns Device line. */ (
          end,
          index,
        ) => ({ start: ends[index - 1] ?? 0, end, height: 240 }),
      );
    f.shell.GetLayout().SetCursorTextFrame(f.node, lines, 0, text.length);
    select(f, offset);
    const cursor = f.shell.getShellCursor();
    expect(cursor.LeftRightMargin(f.shell.GetLayout(), left, api)).toBe(true);
    expect(cursor.GetPoint().GetNode()).toBe(f.node);
    expect(cursor.GetPoint().GetContentIndex()).toBe(expected);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(SwTextCursor.IsRightMargin()).toBe(!left && !api);
  },
);
it("retains soft-boundary affinity and excludes hard-break affinity", /** Checks direct native frame ambiguity and complete follow geometry. @returns Nothing. */ () => {
  const f = fixture("abcdef");
  f.shell.GetLayout().SetCursorTextFrame(
    f.node,
    [
      { start: 0, end: 3, height: 240 },
      { start: 3, end: 6, height: 240 },
    ],
    0,
    6,
  );
  const cursor = f.shell.getShellCursor();
  select(f, 2);
  expect(cursor.LeftRightMargin(f.shell.GetLayout(), false)).toBe(true);
  expect(cursor.GetPoint().GetContentIndex()).toBe(3);
  expect(cursor.LeftRightMargin(f.shell.GetLayout(), true)).toBe(true);
  expect(cursor.GetPoint().GetContentIndex()).toBe(0);
  select(f, 3);
  expect(cursor.LeftRightMargin(f.shell.GetLayout(), true)).toBe(true);
  expect(cursor.GetPoint().GetContentIndex()).toBe(3);
  expect(cursor.IsAtLeftRightMargin(f.shell.GetLayout(), true)).toBe(true);
  select(f, 6);
  expect(cursor.IsAtLeftRightMargin(f.shell.GetLayout(), false, true)).toBe(true);
  select(f, 0);
  expect(cursor.IsAtLeftRightMargin(f.shell.GetLayout(), false, true)).toBe(false);
  f.node.SetText("abc\ndef");
  f.shell.GetLayout().SetCursorTextFrame(
    f.node,
    [
      { start: 0, end: 4, height: 240 },
      { start: 4, end: 7, height: 240 },
    ],
    0,
    7,
  );
  select(f, 4);
  SwTextCursor.SetRightMargin(true);
  expect(cursor.LeftRightMargin(f.shell.GetLayout(), true)).toBe(true);
  expect(cursor.GetPoint().GetContentIndex()).toBe(4);
  f.node.SetText("abc   def");
  select(f, 1);
  f.shell.GetLayout().SetCursorTextFrame(f.node, [{ start: 0, end: 6, height: 240 }], 0, 6);
  expect(cursor.LeftRightMargin(f.shell.GetLayout(), false)).toBe(true);
  expect(cursor.GetPoint().GetContentIndex()).toBe(3);
  const iterator = new SwTextCursor([], "");
  expect(iterator.CharCursorToLine(0)).toBeUndefined();
  const emptyFrame = new SwTextFrame("empty", 0, 0, false, 0, []),
    pam = new SwPaM(cursor.GetPoint());
  try {
    expect(emptyFrame.LeftMargin(pam)).toBe(false);
    expect(emptyFrame.RightMargin(pam)).toBe(false);
  } finally {
    pam.Dispose();
  }
});
it.each([false, true])(
  "shell selection, stack, pending input and continued editing cell=%s",
  /** Checks one actual native body or cell graph, original owners and history. @param cell - Cell context. @returns Nothing. */ (
    cell,
  ) => {
    const f = fixture("abcdef", cell),
      undo = f.doc.GetUndoManager(),
      layout = f.shell.GetLayout(),
      node = f.node;
    f.edit.SetCursorTextFrame(
      node.GetIndex(),
      [
        { start: 0, end: 3, height: 240 },
        { start: 3, end: 6, height: 240 },
      ],
      0,
      6,
    );
    select(f, 4, 5);
    f.shell.Push();
    expect(f.edit.MoveLineBoundary(true, true)).toBe(true);
    expect(f.shell.Pop(PopMode.DeleteStack)).toBe(false);
    expect(f.shell.getShellCursor().GetMark().GetContentIndex()).toBe(5);
    expect(f.shell.getShellCursor().GetPoint().GetContentIndex()).toBe(3);
    expect(f.edit.MoveLineBoundary(false, true)).toBe(true);
    expect(f.shell.getShellCursor().GetMark().GetContentIndex()).toBe(5);
    expect(f.shell.getShellCursor().GetPoint().GetContentIndex()).toBe(6);
    expect(f.edit.MoveLineBoundary(true)).toBe(true);
    expect(f.shell.getShellCursor().HasMark()).toBe(false);
    expect(f.shell.getShellCursor().GetPoint().GetContentIndex()).toBe(3);
    expect(f.shell.GetPendingCharacterItems().Equals(node.GetCharacterItemsAt(3), true)).toBe(true);
    expect(undo.GetUndoActionCount()).toBe(0);
    expect(f.shell.Insert("X")).toBe(true);
    expect(node.GetText()).toBe("abcXdef");
    expect(layout.GetCursorTextFrame(node)).toBeUndefined();
    expect(f.shell.RightMargin()).toBe(false);
    expect(f.shell.Undo()).toBe(true);
    expect(node.GetText()).toBe("abcdef");
    expect(f.shell.Redo()).toBe(true);
    expect(node.GetText()).toBe("abcXdef");
    expect(f.node).toBe(node);
    if (cell) expect(f.box.GetParagraphs()[0]).toBe(node);
  },
);
it("native repeated Home enters visible labels and End clears without document history", /** Checks source label state transitions and empty/missing frames. @returns Nothing. */ () => {
  const f = fixture("List");
  f.shell.SetParagraphListKind("bullet");
  f.doc.GetUndoManager().Clear();
  select(f, 2);
  f.edit.SetCursorTextFrame(f.node.GetIndex(), [{ start: 0, end: 4, height: 240 }], 0, 4);
  expect(f.edit.MoveLineBoundary(true)).toBe(true);
  expect(f.shell.IsInFrontOfLabel()).toBe(false);
  expect(f.edit.MoveLineBoundary(true)).toBe(true);
  expect(f.shell.IsInFrontOfLabel()).toBe(true);
  expect(f.shell.SetInFrontOfLabel(true)).toBe(false);
  expect(f.edit.MoveLineBoundary(false)).toBe(true);
  expect(f.shell.IsInFrontOfLabel()).toBe(false);
  select(f, 2);
  expect(f.edit.MoveLineBoundary(true, true)).toBe(true);
  expect(f.shell.getShellCursor().GetMark().GetContentIndex()).toBe(2);
  expect(f.shell.IsInFrontOfLabel()).toBe(false);
  expect(f.edit.SetCursorTextFrame(-1, [], 0, 0)).toBe(false);
  const root = SwCursorShell.prototype.GetLayout.call(f.shell);
  expect(SwCursorShell.prototype.GetLayout.call(f.shell)).toBe(root);
  expect(f.shell.getShellCursor().LeftRightMargin(root, true)).toBe(false);
  expect(f.shell.getShellCursor().IsAtLeftRightMargin(root, true)).toBe(false);
  const other = new SwDoc().paragraphs[0];
  if (other === undefined) throw Error("Missing other owner");
  root.SetCursorTextFrame(other, [{ start: 0, end: 0, height: 240 }], 0, 0);
  expect(root.GetCursorTextFrame(other)).toBeUndefined();
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});

it("native iterator resolves backward queries and ordinary repeated Home stays in text", /** Checks reusable source CharToLine and nonlist left margin admission. @returns Nothing. */ () => {
  const lines = [
      { start: 0, end: 3, height: 240 },
      { start: 3, end: 6, height: 240 },
    ],
    iterator = new SwTextCursor(lines, "abcdef");
  expect(iterator.CharCursorToLine(5)).toBe(lines[1]);
  expect(iterator.CharCursorToLine(1)).toBe(lines[0]);
  const blank = new SwTextCursor(
    [
      { start: 0, end: 0, height: 240 },
      { start: 0, end: 3, height: 240 },
    ],
    "abc",
  );
  SwTextCursor.SetRightMargin(true);
  expect(blank.CharCursorToLine(0)?.end).toBe(3);
  const f = fixture("abcdef");
  select(f, 0);
  f.edit.SetCursorTextFrame(f.node.GetIndex(), lines, 0, 6);
  expect(f.shell.LeftMargin()).toBe(true);
  expect(f.shell.LeftMargin()).toBe(true);
  expect(f.shell.IsInFrontOfLabel()).toBe(false);
  expect(f.shell.RightMargin(false, true)).toBe(true);
  expect(f.shell.getShellCursor().GetPoint().GetContentIndex()).toBe(3);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
