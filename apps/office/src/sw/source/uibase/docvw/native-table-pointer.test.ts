/** @fileoverview Checks native edit-window pointer ownership and table-mode policy with actual shell cursors. */
import { afterEach, expect, it, vi } from "vitest";
import { SwPosition } from "../../core/crsr/pam";
import { SwDoc } from "../../core/doc/doc";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "../wrtsh/wrtsh1";
import { SwEditWin } from "./edtwin";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { PointerStyle } from "../../../../vcl/ptrstyle";
import { SwTab } from "../../../inc/fesh";
const shells: SwWrtShell[] = [];
afterEach(
  /** Releases actual native cursors and isolated classification spies. @returns Nothing. */ () => {
    for (const shell of shells.splice(0)) shell.Close();
    vi.restoreAllMocks();
  },
);
/** Constructs a connected native table and ordinary shell. @returns Actual pointer owners. */
function fixture() {
  const doc = new SwDoc(),
    body = doc.paragraphs[0];
  if (body === undefined) throw new Error("Missing paragraph");
  const table = doc.nodes.MakeTableNode("Pointer", {}, body);
  table.AddColumnWidth(1500);
  doc.nodes.AppendTableRow(table, 1);
  const shell = new SwWrtShell(
    new SwDocShell(doc, createDocument({ id: "pointer", suiteId: "writer", title: "Pointer" })),
  );
  const node = table.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0];
  if (node === undefined) throw new Error("Missing cell");
  shell.SetPaM(new SwPosition(node, 0));
  shells.push(shell);
  return { doc, shell, edit: new SwEditWin(shell) };
}
it.each([
  [SwTab.COL_HORI, PointerStyle.HSizeBar],
  [SwTab.COL_VERT, PointerStyle.VSizeBar],
  [SwTab.ROW_HORI, PointerStyle.VSizeBar],
  [SwTab.ROW_VERT, PointerStyle.HSizeBar],
  [SwTab.SEL_HORI, PointerStyle.TabSelectSE],
  [SwTab.SEL_HORI_RTL, PointerStyle.TabSelectSW],
  [SwTab.ROWSEL_HORI, PointerStyle.TabSelectE],
  [SwTab.ROWSEL_HORI_RTL, PointerStyle.TabSelectW],
  [SwTab.COLSEL_HORI, PointerStyle.TabSelectS],
  [SwTab.SEL_VERT, PointerStyle.TabSelectSW],
  [SwTab.ROWSEL_VERT, PointerStyle.TabSelectS],
  [SwTab.COLSEL_VERT, PointerStyle.TabSelectW],
])(
  "native mouse kind %s chooses pointer %s",
  /** Checks the full native switch while leaving unsupported physical directions unclaimed. @param kind - Isolated native classification. @param pointer - Literal source pointer. @returns Nothing. */ (
    kind,
    pointer,
  ) => {
    const f = fixture(),
      cursor = f.shell.getShellCursor();
    vi.spyOn(f.shell, "WhichMouseTabCol").mockReturnValue(kind);
    expect(f.edit.changeMousePointer({ x: 0, y: 0 })).toBe(true);
    expect(f.edit.GetPointer()).toBe(pointer);
    expect(f.shell.IsTableMode()).toBe(false);
    expect(f.shell.getShellCursor()).toBe(cursor);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  },
);
it("native table mode keeps resize pointer state but permits enhanced selection and reset", /** Checks actual table cursor presence and read-only hover. @returns Nothing. */ () => {
  const f = fixture();
  expect(f.edit.GetPointer()).toBe(PointerStyle.Null);
  const hit = vi.spyOn(f.shell, "WhichMouseTabCol").mockReturnValue(SwTab.ROWSEL_HORI);
  f.edit.changeMousePointer({ x: 0, y: 0 });
  expect(f.edit.GetPointer()).toBe(PointerStyle.TabSelectE);
  expect(f.shell.SelectTable()).toBe(true);
  expect(f.shell.IsTableMode()).toBe(true);
  const cursor = f.shell.getShellCursor();
  for (const kind of [SwTab.COL_HORI, SwTab.COL_VERT, SwTab.ROW_HORI, SwTab.ROW_VERT]) {
    hit.mockReturnValue(kind);
    expect(f.edit.changeMousePointer({ x: 0, y: 0 })).toBe(true);
    expect(f.edit.GetPointer()).toBe(PointerStyle.TabSelectE);
  }
  hit.mockReturnValue(SwTab.COLSEL_HORI);
  f.edit.changeMousePointer({ x: 0, y: 0 });
  expect(f.edit.GetPointer()).toBe(PointerStyle.TabSelectS);
  hit.mockReturnValue(SwTab.COL_NONE);
  expect(f.edit.changeMousePointer({ x: 0, y: 0 })).toBe(false);
  expect(f.edit.GetPointer()).toBe(PointerStyle.Null);
  expect(f.shell.getShellCursor()).toBe(cursor);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
