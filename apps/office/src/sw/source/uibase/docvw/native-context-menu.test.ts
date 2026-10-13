/** @fileoverview Verifies original edit-window context menus retain native marked selections and frame ownership. */
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwPaM, SwPosition, getWriterSelectedTextRange } from "../../core/crsr/pam";
import { copyWriterTextRangeRuns } from "../../core/txtnode/ndtxt";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases native frame owners. @returns Nothing. */ () => {
    for (const session of sessions.splice(0)) session.Close();
  },
);
it("native context mouse hit retains the original selected PaM before popup dispatch", /** Reproduces missing original context event policy. @returns Nothing. */ () => {
  const s = createWriterDocumentSession();
  sessions.push(s);
  const node = s.docShell.GetDoc().paragraphs[0];
  if (node === undefined) throw Error("Missing native paragraph");
  node.SetText("abcdef");
  const shell = s.view.GetWrtShell(),
    point = new SwPosition(node, 4),
    mark = new SwPosition(node, 1);
  shell.SetPaM(point, mark);
  point.Dispose();
  mark.Dispose();
  const names: string[] = [];
  expect(
    s.view.GetEditWin().ContextMenu(
      { nodeIndex: node.GetIndex(), contentIndex: 2 },
      /** Captures actual original resource. @param name - Native resource. @returns Nothing. */ (
        name,
      ) => {
        names.push(name);
      },
    ),
  ).toBe(true);
  expect(names).toEqual(["text"]);
  expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(4);
  expect(shell.GetCursor().GetMark().GetContentIndex()).toBe(1);
});

/** Creates original native body and frame owners. @returns Session and nonempty body. */
function fixture() {
  const s = createWriterDocumentSession();
  sessions.push(s);
  const node = s.docShell.GetDoc().paragraphs[0];
  if (node === undefined) throw Error("Missing body");
  node.SetText("abcdef");
  return { s, node, shell: s.view.GetWrtShell(), win: s.view.GetEditWin() };
}
it("collapsed original marked PaM has no selected text range or context hit", /** Checks empty native selection remains empty rather than becoming a text operation. @returns Nothing. */ () => {
  const f = fixture(),
    point = new SwPosition(f.node, 2);
  f.shell.SetPaM(point, point);
  point.Dispose();
  expect(f.shell.GetCursor().HasMark()).toBe(true);
  expect(getWriterSelectedTextRange(f.shell.GetCursor())).toBeUndefined();
  expect(f.win.SelectMenuPosition({ nodeIndex: f.node.GetIndex(), contentIndex: 2 })).toBe(true);
  expect(f.shell.GetCursor().HasMark()).toBe(false);
});
it("existing range projection derives native fragment bytes without mutating source or hints", /** Checks retained public compatibility API after direct native menu commands stopped using it. @returns Nothing. */ () => {
  const f = fixture(),
    before = f.node.CaptureTextFragment(0, f.node.Len()),
    count = f.s.docShell.GetDoc().GetUndoManager().GetUndoActionCount();
  expect(
    copyWriterTextRangeRuns(f.node, 1, 4)
      .map(
        /** Reads derived text only. @param run - Immutable derived fragment. @returns Text. */ (
          run,
        ) => run.text,
      )
      .join(""),
  ).toBe("bcd");
  expect(f.node.CaptureTextFragment(0, f.node.Len())).toEqual(before);
  expect(f.s.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(count);
});
it("native popup hit uses inclusive start and exclusive end in either direction", /** Checks source TestCurrPam ring bounds and exact cursor movement. @returns Nothing. */ () => {
  const f = fixture();
  for (const reverse of [false, true]) {
    const p = new SwPosition(f.node, reverse ? 1 : 4),
      m = new SwPosition(f.node, reverse ? 4 : 1);
    f.shell.SetPaM(p, m);
    p.Dispose();
    m.Dispose();
    for (const [offset, inside] of [
      [0, false],
      [1, true],
      [3, true],
      [4, false],
      [6, false],
    ] as const) {
      const hit = new SwPosition(f.node, offset);
      expect(f.shell.TestCurrPam(hit)).toBe(inside);
      hit.Dispose();
    }
    expect(f.win.SelectMenuPosition({ nodeIndex: f.node.GetIndex(), contentIndex: 1 })).toBe(true);
    expect(f.shell.GetCursor().HasMark()).toBe(true);
    expect(f.win.SelectMenuPosition({ nodeIndex: f.node.GetIndex(), contentIndex: 4 })).toBe(true);
    expect(f.shell.GetCursor().HasMark()).toBe(false);
    expect(f.shell.GetCursor().GetPoint().GetContentIndex()).toBe(4);
  }
});
it("native keyboard popup retains the exact original moving point and marked direction", /** Checks keyboard skips source SelectMenuPosition. @returns Nothing. */ () => {
  const f = fixture(),
    p = new SwPosition(f.node, 1),
    m = new SwPosition(f.node, 5);
  f.shell.SetPaM(p, m);
  p.Dispose();
  m.Dispose();
  const cursor = f.shell.GetCursor(),
    before = f.shell.CaptureCursorState(),
    names: string[] = [];
  expect(
    f.win.ContextMenu(
      undefined,
      /** Captures original resource. @param name - Resource. @returns Nothing. */ (name) => {
        names.push(name);
      },
    ),
  ).toBe(true);
  expect(names).toEqual(["text"]);
  expect(f.shell.GetCursor()).toBe(cursor);
  expect(f.shell.CaptureCursorState()).toEqual(before);
});
it("native popup rejects invalid node/content hits without dispatch or cursor change", /** Checks current native node admission. @returns Nothing. */ () => {
  const f = fixture(),
    names: string[] = [],
    before = f.shell.CaptureCursorState();
  for (const hit of [
    { nodeIndex: -1, contentIndex: 0 },
    { nodeIndex: f.node.GetIndex(), contentIndex: 99 },
    { nodeIndex: f.node.GetIndex(), contentIndex: -1 },
  ])
    expect(
      f.win.ContextMenu(
        hit,
        /** Captures unexpected popup. @param name - Resource. @returns Nothing. */ (name) => {
          names.push(name);
        },
      ),
    ).toBe(false);
  expect(names).toEqual([]);
  expect(f.shell.CaptureCursorState()).toEqual(before);
});
it("native standalone selection hit rejects foreign documents and collapsed ranges", /** Prevents native position indexes crossing document ownership. @returns Nothing. */ () => {
  const f = fixture(),
    g = fixture(),
    p = new SwPosition(g.node, 1);
  expect(f.shell.TestCurrPam(p)).toBe(false);
  p.Dispose();
  const h = new SwPosition(f.node, 0);
  expect(f.shell.TestCurrPam(h)).toBe(false);
  f.shell.GetCursor().SetMark();
  expect(f.shell.TestCurrPam(h)).toBe(false);
  h.Dispose();
});
it("native selected cells keep table mode until an actual outside body hit", /** Checks original selected cell ownership. @returns Nothing. */ () => {
  const f = fixture(),
    doc = f.s.docShell.GetDoc(),
    t = doc.nodes.MakeTableNode("PopupCells");
  t.AddColumnWidth(3000);
  t.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(t, 2),
    a = row.GetTabBoxes()[0]?.GetParagraphs()[0],
    b = row.GetTabBoxes()[1]?.GetParagraphs()[0];
  if (a === undefined || b === undefined) throw Error("Missing native boxes");
  a.SetText("aaa");
  b.SetText("bbb");
  f.shell.FocusNode(a);
  expect(f.shell.SelTableRow()).toBe(true);
  const cursor = f.shell.getShellCursor(),
    boxes = [...f.shell.GetTableSel()],
    names: string[] = [];
  expect(
    f.win.ContextMenu(
      { nodeIndex: b.GetIndex(), contentIndex: 1 },
      /** Captures current original table resource. @param name - Resource. @returns Nothing. */ (
        name,
      ) => {
        names.push(name);
      },
    ),
  ).toBe(true);
  expect(names).toEqual(["table"]);
  expect(f.shell.getShellCursor()).toBe(cursor);
  expect(f.shell.GetTableSel()).toEqual(boxes);
  expect(f.shell.IsTableMode()).toBe(true);
  expect(f.win.SelectMenuPosition({ nodeIndex: f.node.GetIndex(), contentIndex: 2 })).toBe(true);
  expect(f.shell.IsTableMode()).toBe(false);
  expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(f.node);
  expect(f.shell.GetCursor().GetPoint().GetContentIndex()).toBe(2);
});

it("native secondary marked ring hit preserves all original owners", /** Checks every original range rather than only root selection. @returns Nothing. */ () => {
  const f = fixture(),
    p = new SwPosition(f.node, 4),
    m = new SwPosition(f.node, 1),
    root = f.shell.GetCursor(),
    originalOffset = root.GetPoint().GetContentIndex(),
    other = new SwPaM(p, m, root);
  p.Dispose();
  m.Dispose();
  try {
    expect(f.win.SelectMenuPosition({ nodeIndex: f.node.GetIndex(), contentIndex: 2 })).toBe(true);
    expect(f.shell.GetCursor()).toBe(root);
    expect(root.GetNext()).toBe(other);
    expect(root.GetPoint().GetContentIndex()).toBe(originalOffset);
    expect(other.GetMark().GetContentIndex()).toBe(1);
    expect(other.GetPoint().GetContentIndex()).toBe(4);
  } finally {
    other.Dispose();
  }
});
