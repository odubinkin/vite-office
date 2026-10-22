/** @fileoverview Checks original crossed-out item state, enum toggle, pending text and actual Writer history/ODT owners. */
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import { FontStrikeout as S } from "../../../../tools/inc/fontenum";
import { RES_CHRATR_CROSSEDOUT as WHICH } from "../../../inc/hintids";
import { SwPosition } from "../../core/crsr/pam";
import { SwAttrIter } from "../../core/text/itratr";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";
import {
  createOdtWriterTransfer,
  restoreOdtWriterTransfer,
} from "../../../browser/filter/xml/odt-transfer";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwEditWin } from "../docvw/edtwin";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases original frame owners. @returns Nothing. */ () => {
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Creates actual native shell and text. @returns Fixture. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell(),
    doc = shell.GetDoc();
  const node = doc.paragraphs[0] as SwTextNode;
  node.SetText("abcdef");
  return { session, shell, doc, node, view: session.view };
}
/** Uses actual text selection and disposes temporary position indices. @param f - Fixture. @param start - Mark. @param end - Point. @returns Nothing. */
function select(f: ReturnType<typeof fixture>, start: number, end: number): void {
  const point = new SwPosition(f.node, end),
    mark = new SwPosition(f.node, start);
  f.shell.SetPaM(point, mark);
  point.Dispose();
  mark.Dispose();
}
/** Reads actual stacked enum rather than projected bool state. @param node - Native node. @param offset - Text offset. @returns Complete value. */
function value(node: SwTextNode, offset: number): S {
  const iterator = new SwAttrIter(node);
  iterator.Seek(offset);
  return (iterator.GetAttrHandler().ReadItem(WHICH) as SvxCrossedOutItem).GetStrikeout();
}
it("distinguishes SINGLE/DOUBLE mixed state and uses the native mixed enum factory before history", /** Exercises real command dispatch and original nodes. @returns Nothing. */ () => {
  const f = fixture();
  expect((f.node.GetAttr(WHICH) as SvxCrossedOutItem).GetStrikeout()).toBe(S.STRIKEOUT_NONE);
  select(f, 0, 3);
  expect(
    f.view.Execute(".uno:Strikeout", [new SvxCrossedOutItem(S.STRIKEOUT_DOUBLE, WHICH)]),
  ).toMatchObject({ status: "executed", value: true });
  select(f, 3, 6);
  f.view.Execute(".uno:Strikeout", [new SvxCrossedOutItem(S.STRIKEOUT_SINGLE, WHICH)]);
  select(f, 0, 6);
  expect(f.view.QueryState(".uno:Strikeout")).toMatchObject({ checked: false, mixed: true });
  const cursor = f.shell.CaptureCursorState();
  f.view.Execute(".uno:Strikeout");
  expect([value(f.node, 0), value(f.node, 4)]).toEqual([S.STRIKEOUT_SINGLE, S.STRIKEOUT_SINGLE]);
  expect(f.view.QueryState(".uno:Strikeout")).toMatchObject({ checked: true, mixed: false });
  expect(f.shell.Undo()).toBe(true);
  expect([value(f.node, 0), value(f.node, 4)]).toEqual([S.STRIKEOUT_DOUBLE, S.STRIKEOUT_SINGLE]);
  expect(f.shell.CaptureCursorState()).toEqual(cursor);
  expect(f.shell.Redo()).toBe(true);
  f.view.Execute(".uno:Strikeout");
  expect([value(f.node, 0), value(f.node, 4)]).toEqual([S.STRIKEOUT_NONE, S.STRIKEOUT_NONE]);
});
it.each([
  S.STRIKEOUT_NONE,
  S.STRIKEOUT_SINGLE,
  S.STRIKEOUT_DOUBLE,
  S.STRIKEOUT_BOLD,
  S.STRIKEOUT_SLASH,
  S.STRIKEOUT_X,
])(
  "preserves native enum %i through actual transfer and repeated ODT",
  /** Checks full typed value, explicit NONE and original item classes. @param strikeout - Native value. @returns Completion. */ async (
    strikeout,
  ) => {
    const f = fixture();
    f.node.GetTextFormatColl().SetFormatAttr(new SvxCrossedOutItem(S.STRIKEOUT_DOUBLE, WHICH));
    select(f, 0, 3);
    f.view.Execute(".uno:Strikeout", [new SvxCrossedOutItem(strikeout, WHICH)]);
    const transferred = restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(f.doc)));
    let bytes = writeOdtDocument(transferred, f.session.docShell.GetDocumentState());
    const zip = new ZipFile(bytes);
    const xml = (await zip.readTextEntry("content.xml")) + (await zip.readTextEntry("styles.xml"));
    expect(xml).toContain("style:text-line-through-style=");
    for (let pass = 0; pass < 2; pass++) {
      const restored = (await readOdtDocument(bytes, f.session.docShell.GetDocumentState()))
        .document;
      const node = restored.paragraphs[0] as SwTextNode;
      expect([value(node, 0), value(node, 4)]).toEqual([strikeout, S.STRIKEOUT_DOUBLE]);
      expect(node.GetAttr(WHICH)).toBeInstanceOf(SvxCrossedOutItem);
      bytes = writeOdtDocument(restored, f.session.docShell.GetDocumentState());
    }
  },
);

it("keeps the complete caret item through typing, undo and redo", /** Exercises pending native attributes through the original edit window. @returns Nothing. */ () => {
  const f = fixture();
  const point = new SwPosition(f.node, 3);
  f.shell.SetCursor(point);
  point.Dispose();
  expect(
    f.view.Execute(".uno:Strikeout", [new SvxCrossedOutItem(S.STRIKEOUT_X, WHICH)]),
  ).toMatchObject({ status: "executed", value: false });
  expect((f.view.QueryState(".uno:Strikeout").value as SvxCrossedOutItem).GetStrikeout()).toBe(
    S.STRIKEOUT_X,
  );
  expect(new SwEditWin(f.view).InsertText("X")).toBe(true);
  expect(f.node.GetText()).toBe("abcXdef");
  expect([value(f.node, 2), value(f.node, 3), value(f.node, 4)]).toEqual([
    S.STRIKEOUT_NONE,
    S.STRIKEOUT_X,
    S.STRIKEOUT_NONE,
  ]);
  expect(f.shell.Undo()).toBe(true);
  expect(f.node.GetText()).toBe("abcdef");
  expect(f.shell.Redo()).toBe(true);
  expect(value(f.node, 3)).toBe(S.STRIKEOUT_X);
});

it("applies one table selection across original nonempty cell owners with atomic history", /** Checks native cursor rings and complete item equality across two original cell paragraphs. @returns Nothing. */ () => {
  const f = fixture();
  const table = f.doc.nodes.MakeTableNode("Native strikeout cells");
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const row = f.doc.nodes.AppendTableRow(table, 2);
  const first = row.GetTabBoxes()[0]?.GetParagraphs()[0],
    second = row.GetTabBoxes()[1]?.GetParagraphs()[0];
  if (!first || !second) throw new Error("Missing original strikeout cells");
  first.SetText("First");
  second.SetText("Second");
  const point = new SwPosition(first, 0);
  f.shell.SetCursor(point);
  point.Dispose();
  f.view.Execute(".uno:SelectTable");
  const cursor = f.shell.CaptureCursorState();
  f.doc.GetUndoManager().Clear();
  expect(f.view.Execute(".uno:Strikeout")).toMatchObject({ status: "executed", value: true });
  expect([value(first, 0), value(second, 0)]).toEqual([S.STRIKEOUT_SINGLE, S.STRIKEOUT_SINGLE]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.shell.Undo()).toBe(true);
  expect([value(first, 0), value(second, 0)]).toEqual([S.STRIKEOUT_NONE, S.STRIKEOUT_NONE]);
  expect(f.shell.CaptureCursorState()).toEqual(cursor);
  expect(f.shell.Redo()).toBe(true);
  expect(row.GetTabBoxes()[0]?.GetParagraphs()[0]).toBe(first);
  expect(value(second, 0)).toBe(S.STRIKEOUT_SINGLE);
});
