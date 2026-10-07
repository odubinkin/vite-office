/** @fileoverview Checks device label-affinity admission and native publication over original nodes. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { applyWriterParagraphList } from "../../core/doc/list";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "../wrtsh/wrtsh1";
import { SwEditWin } from "./edtwin";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
const shells: SwWrtShell[] = [];
afterEach(
  /** Releases native cursor subscriptions. @returns Nothing. */ () => {
    for (const shell of shells.splice(0)) shell.Close();
  },
);
/** Creates original body and cell owners. @param cell - Use cell text. @param kind - Native numbering kind. @returns Real edit-window owners. */
function fixture(cell: boolean, kind: "bullet" | "numbered" | "none") {
  const doc = new SwDoc(),
    body = doc.paragraphs[0];
  if (body === undefined) throw Error("Missing body");
  const table = doc.nodes.MakeTableNode("Labels");
  table.AddColumnWidth(6000);
  const box = doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0],
    node = cell ? box?.GetParagraphs()[0] : body;
  if (node === undefined) throw Error("Missing node");
  node.SetText("Alpha");
  applyWriterParagraphList(node, { kind, level: 0 });
  const docShell = new SwDocShell(
      doc,
      createDocument({ id: "labels", suiteId: "writer", title: "Labels" }),
    ),
    shell = new SwWrtShell(docShell),
    edit = new SwEditWin(shell);
  shells.push(shell);
  shell.FocusNode(node);
  doc.GetUndoManager().Clear();
  return { doc, node, shell, edit };
}
for (const kind of ["bullet", "numbered"] as const)
  it.each([false, true])(
    `native device label affinity preserves original ${kind} owner cell=%s`,
    /** Checks offset0 affinity-only publication, defaults and input/history. @param cell - Cell context. @returns Nothing. */ (
      cell,
    ) => {
      const f = fixture(cell, kind),
        cursor = f.shell.getShellCursor(),
        seen: boolean[] = [];
      const unsubscribe = f.shell.Subscribe(
        /** Observes final native selection state. @returns Nothing. */ () => {
          seen.push(f.shell.IsInFrontOfLabel());
        },
      );
      const point = { nodeIndex: f.node.GetIndex(), contentIndex: 0, inFrontOfLabel: true };
      expect(f.edit.SetSelection({ point })).toBe(true);
      expect(cursor).toBe(f.shell.getShellCursor());
      expect(cursor.GetPoint().GetNode()).toBe(f.node);
      expect(cursor.GetPoint().GetContentIndex()).toBe(0);
      expect(f.shell.IsInFrontOfLabel()).toBe(true);
      expect(seen).toEqual([true]);
      expect(f.edit.SetSelection({ point })).toBe(true);
      expect(seen).toEqual([true]);
      expect(
        f.edit.SetSelection({
          point: { ...point, inFrontOfLabel: false, inRepeatedHeadline: false },
        }),
      ).toBe(true);
      expect(f.shell.IsInFrontOfLabel()).toBe(false);
      expect(seen).toEqual([true, false]);
      expect(f.edit.SetSelection({ point: { ...point, inRepeatedHeadline: false } })).toBe(true);
      expect(f.shell.IsInFrontOfLabel()).toBe(true);
      unsubscribe();
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
      expect(f.edit.InsertText("X")).toBe(true);
      expect(f.shell.IsInFrontOfLabel()).toBe(false);
      expect(f.node.GetText()).toBe("XAlpha");
      expect(f.edit.Undo()).toBe(true);
      expect(f.node.GetText()).toBe("Alpha");
      expect(f.edit.Redo()).toBe(true);
      expect(f.node.GetText()).toBe("XAlpha");
      expect(cursor.GetPoint().GetNode()).toBe(f.node);
    },
  );
it("device label affinity rejects missing labels, nonzero text and marked ranges", /** Checks source visible-label and no-selection guards. @returns Nothing. */ () => {
  const f = fixture(false, "none"),
    point = { nodeIndex: f.node.GetIndex(), contentIndex: 0, inFrontOfLabel: true };
  expect(f.edit.SetSelection({ point })).toBe(true);
  expect(f.shell.IsInFrontOfLabel()).toBe(false);
  applyWriterParagraphList(f.node, { kind: "bullet", level: 0 });
  expect(f.edit.SetSelection({ point: { ...point, contentIndex: 1 } })).toBe(true);
  expect(f.shell.IsInFrontOfLabel()).toBe(false);
  expect(f.edit.SetSelection({ point, mark: { ...point, contentIndex: 3 } })).toBe(true);
  expect(f.shell.getShellCursor().HasMark()).toBe(true);
  expect(f.shell.IsInFrontOfLabel()).toBe(false);
  expect(f.edit.SetSelection({ point: { ...point, nodeIndex: 99999 } })).toBe(false);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("native PaM owns label state and constructed ranges default false", /** Checks source state owner and no fabricated copy of label affinity. @returns Nothing. */ () => {
  const f = fixture(false, "bullet"),
    point = new SwPosition(f.node, 0),
    pam = new SwPaM(point);
  try {
    expect(pam.IsInFrontOfLabel()).toBe(false);
    pam.SetInFrontOfLabel_(true);
    expect(pam.IsInFrontOfLabel()).toBe(true);
    const temporary = new SwPaM(pam.GetPoint());
    expect(temporary.IsInFrontOfLabel()).toBe(false);
    temporary.Dispose();
  } finally {
    pam.Dispose();
    point.Dispose();
  }
});
