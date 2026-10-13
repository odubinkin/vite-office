/** @fileoverview Checks native mixed selected hyperlink removal using actual body/cell item owners and bound slots. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "../wrtsh/wrtsh1";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SfxRequest } from "../../../../sfx2/source/control/request";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { RES_TXTATR_INETFMT } from "../../../inc/hintids";
import { SwpHints } from "../../core/txtnode/ndhints";
import { SwTextINetFormat } from "../../core/txtnode/txtatr2";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import {
  SwTextAttrEnd,
  SwFormatAutoFormat,
  createWriterCharacterItemSet,
} from "../../core/txtnode/txatbase";
import { getWriterINetFormatStateAtCursor } from "../../core/edit/edattr";
import { SfxItemState } from "../../../../svl/source/items/itemset";
import { SwTextShell } from "./textsh1";
import { WriterDialogController } from "../dialog/writer-dialog-controller";
const shells: SwWrtShell[] = [];
/** Creates actual separate native URL owners and one unrelated character owner. @param doc - Native document. @param node - Original node. @returns Nothing. */
function links(doc: SwDoc, node: SwTextNode) {
  node.SetText("abcdefgh");
  const chars = createWriterCharacterItemSet(doc.GetAttrPool(), {
    bold: true,
    italic: false,
    underline: false,
  });
  node.SetTextHints(
    new SwpHints(doc.GetAttrPool(), [
      new SwTextINetFormat(new SwFormatINetFormat("https://example.test/a"), 0, 3),
      new SwTextINetFormat(new SwFormatINetFormat("https://example.test/b"), 5, 8),
      new SwTextAttrEnd(new SwFormatAutoFormat(chars), 0, 8),
    ]),
  );
}
/** Creates real native body/cell cursor and undo ownership. @param cell - Actual cell context. @returns Fixture. */
function fixture(cell = false) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("MixedRemove");
  table.AddColumnWidth(3000);
  const box = doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0],
    node = cell ? box?.GetParagraphs()[0] : doc.paragraphs[0];
  if (node === undefined) throw Error("Missing native owner");
  links(doc, node);
  const shell = new SwWrtShell(
    new SwDocShell(doc, createDocument({ id: "mixed-remove", suiteId: "writer", title: "Mixed" })),
  );
  shells.push(shell);
  shell.FocusNode(node);
  doc.GetUndoManager().Clear();
  return { doc, node, shell, table, box };
}
/** Places original native selection. @param f - Fixture. @param end - Actual point. @param start - Actual mark. @returns Nothing. */
function select(f: ReturnType<typeof fixture>, end: number, start: number) {
  const p = new SwPosition(f.node, end),
    m = new SwPosition(f.node, start);
  try {
    f.shell.SetPaM(p, m);
  } finally {
    p.Dispose();
    m.Dispose();
  }
}
/** Resolves real native Remove slot. @param f - Fixture. @returns Bound command. */
function remove(f: ReturnType<typeof fixture>) {
  const owner = f.shell.GetCommandShell(),
    slot = owner.GetInterface().GetSlot(WRITER_COMMAND_IDS.removeHyperlink);
  if (slot === undefined) throw Error("Missing Remove slot");
  const cmd = owner.ResolveSlot(slot.slotId);
  if (cmd === undefined) throw Error("Missing binding");
  return cmd;
}
afterEach(
  /** Releases actual native shell state. @returns Nothing. */ () => {
    for (const shell of shells.splice(0)) shell.Close();
  },
);
it.each([false, true])(
  "mixed selected native hyperlinks enable Remove cell=%s",
  /** Reproduces loss of native INVALID state at command boundary. @param cell - Original cell context. @returns Nothing. */ (
    cell,
  ) => {
    const f = fixture(cell);
    select(f, 8, 0);
    expect(f.shell.GetHyperlinkAtCursor()).toBeUndefined();
    expect(remove(f).getState().enabled).toBe(true);
  },
);

/** Executes the real bound Remove command. @param f - Native fixture. @returns Dispatch result. */
function execute(f: ReturnType<typeof fixture>) {
  const command = remove(f);
  return command.execute(new SfxRequest(command.slot.slotId));
}
it.each([false, true])(
  "removes mixed native selection with text/owner/endpoints and one undo cell=%s",
  /** Exercises actual native family removal and history. @param cell - Native cell. @returns Nothing. */ (
    cell,
  ) => {
    const f = fixture(cell);
    select(f, 7, 1);
    const cursor = f.shell.GetCursor(),
      point = cursor.GetPoint(),
      index = point.nContent,
      unrelated = f.node
        .GetpSwpHints()
        ?.entries()
        .find(
          /** Finds the unrelated native owner. @param h - Original hint. @returns Whether unrelated. */ (
            h,
          ) => h.Which() !== RES_TXTATR_INETFMT,
        );
    expect(
      getWriterINetFormatStateAtCursor(f.doc, cursor).GetItemState(RES_TXTATR_INETFMT, false),
    ).toBe(SfxItemState.INVALID);
    expect(execute(f).status).toBe("executed");
    expect(f.node.GetText()).toBe("abcdefgh");
    expect(
      f.node
        .GetpSwpHints()
        ?.entries()
        .filter(
          /** Selects native internet owners. @param h - Original hint. @returns Whether internet. */ (
            h,
          ) => h.Which() === RES_TXTATR_INETFMT,
        )
        .map(
          /** Reads literal retained native bounds. @param h - Original hint. @returns Native endpoints. */ (
            h,
          ) => [h.GetStart(), h.GetEnd()],
        ),
    ).toEqual([
      [0, 1],
      [7, 8],
    ]);
    expect(f.node.GetpSwpHints()?.entries()).toContain(unrelated);
    expect(cursor.GetPoint()).toBe(point);
    expect(point.nContent).toBe(index);
    expect([point.GetContentIndex(), cursor.GetMark().GetContentIndex()]).toEqual([7, 1]);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(f.shell.Undo()).toBe(true);
    expect(f.node.GetTextAttrAt(2, RES_TXTATR_INETFMT)).toBeDefined();
    expect(f.node.GetTextAttrAt(6, RES_TXTATR_INETFMT)).toBeDefined();
    expect(f.shell.Redo()).toBe(true);
    expect(f.node.GetTextAttrAt(2, RES_TXTATR_INETFMT)).toBeUndefined();
    expect(f.node.GetpSwpHints()?.entries()).toContain(unrelated);
  },
);
it("resets original marked body/cell ring without destroying it during initial execution", /** Checks actual ring identities and grouped history. @returns Nothing. */ () => {
  const f = fixture(),
    cell = f.box?.GetParagraphs()[0];
  if (cell === undefined) throw Error("Missing cell");
  links(f.doc, cell);
  select(f, 8, 0);
  const root = f.shell.GetCursor(),
    p = new SwPosition(cell, 8),
    m = new SwPosition(cell, 0),
    other = new SwPaM(p, m, root);
  p.Dispose();
  m.Dispose();
  try {
    expect(execute(f).status).toBe("executed");
    expect(root.GetNext()).toBe(other);
    expect([...root.GetRingContainer()]).toHaveLength(2);
    for (const n of [f.node, cell]) {
      expect(n.GetText()).toBe("abcdefgh");
      expect(
        n
          .GetpSwpHints()
          ?.entries()
          .filter(
            /** Selects native internet owners. @param h - Original hint. @returns Whether internet. */ (
              h,
            ) => h.Which() === RES_TXTATR_INETFMT,
          ),
      ).toEqual([]);
    }
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(f.shell.Undo()).toBe(true);
    for (const n of [f.node, cell]) expect(n.GetTextAttrAt(1, RES_TXTATR_INETFMT)).toBeDefined();
    expect(f.shell.Redo()).toBe(true);
    for (const n of [f.node, cell]) expect(n.GetTextAttrAt(1, RES_TXTATR_INETFMT)).toBeUndefined();
  } finally {
    other.Dispose();
  }
});
it("removes all marked multi-node ranges including table text with one undo", /** Uses the actual original node interval. @returns Nothing. */ () => {
  const f = fixture(),
    cell = f.box?.GetParagraphs()[0],
    last = f.doc.nodes.MakeTextNode("last");
  if (cell === undefined) throw Error("Missing cell");
  links(f.doc, cell);
  links(f.doc, last);
  const p = new SwPosition(last, 8),
    m = new SwPosition(f.node, 0);
  try {
    f.shell.SetPaM(p, m);
  } finally {
    p.Dispose();
    m.Dispose();
  }
  expect(execute(f).status).toBe("executed");
  for (const n of [f.node, cell, last])
    expect(n.GetTextAttrAt(1, RES_TXTATR_INETFMT)).toBeUndefined();
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  f.shell.Undo();
  for (const n of [f.node, cell, last])
    expect(n.GetTextAttrAt(1, RES_TXTATR_INETFMT)).toBeDefined();
  f.shell.Redo();
  for (const n of [f.node, cell, last])
    expect(n.GetTextAttrAt(1, RES_TXTATR_INETFMT)).toBeUndefined();
});
it("plain selected ranges remain disabled and direct reset creates no history", /** Checks default/no-op state. @returns Nothing. */ () => {
  const f = fixture();
  select(f, 5, 3);
  const text = new SwTextShell(f.shell, new WriterDialogController());
  expect(remove(f).getState().enabled).toBe(false);
  expect(text.RemoveHyperlink()).toBe(false);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("uniform native attributes expose SET and mixed ones retain INVALID", /** Retains complete native state before final dialog projection. @returns Nothing. */ () => {
  const f = fixture();
  select(f, 3, 0);
  expect(
    getWriterINetFormatStateAtCursor(f.doc, f.shell.GetCursor()).GetItemState(
      RES_TXTATR_INETFMT,
      false,
    ),
  ).toBe(SfxItemState.SET);
  select(f, 8, 0);
  expect(
    getWriterINetFormatStateAtCursor(f.doc, f.shell.GetCursor()).GetItemState(
      RES_TXTATR_INETFMT,
      false,
    ),
  ).toBe(SfxItemState.INVALID);
});
it("later foreign ring owner clears earlier SET native state", /** Ensures partial accumulated state cannot escape. @returns Nothing. */ () => {
  const f = fixture();
  select(f, 3, 0);
  const root = f.shell.GetCursor(),
    foreign = new SwDoc(),
    node = foreign.paragraphs[0];
  if (node === undefined) throw Error("Missing foreign");
  node.SetText("x");
  const p = new SwPosition(node, 0),
    other = new SwPaM(p, undefined, root);
  p.Dispose();
  try {
    expect(
      getWriterINetFormatStateAtCursor(f.doc, root).GetItemState(RES_TXTATR_INETFMT, false),
    ).toBe(SfxItemState.DEFAULT);
  } finally {
    other.Dispose();
  }
});
it("original table box selection resets marked ranges once", /** Exercises real table cursor materialization and native marked box ranges. @returns Nothing. */ () => {
  const f = fixture(true);
  expect(f.shell.SelTable()).toBe(true);
  expect(f.shell.IsTableMode()).toBe(true);
  expect(execute(f).status).toBe("executed");
  expect(f.node.GetTextAttrAt(1, RES_TXTATR_INETFMT)).toBeUndefined();
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.shell.IsTableMode()).toBe(true);
  f.shell.Undo();
  expect(f.node.GetTextAttrAt(1, RES_TXTATR_INETFMT)).toBeDefined();
});
it("the bounded marked-range reset does not invent an unmarked table range", /** Checks the explicit unmarked-table fidelity boundary without a fake target. @returns Nothing. */ () => {
  const f = fixture(true);
  expect(f.shell.SelTable()).toBe(true);
  const cursor = f.shell.GetCursor();
  cursor.DeleteMark();
  expect(f.shell.IsTableMode()).toBe(true);
  const text = new SwTextShell(f.shell, new WriterDialogController());
  expect(text.RemoveHyperlink()).toBe(false);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  expect(f.node.GetTextAttrAt(1, RES_TXTATR_INETFMT)).toBeDefined();
});
