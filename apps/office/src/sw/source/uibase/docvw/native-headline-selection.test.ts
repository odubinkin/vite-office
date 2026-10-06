/** @fileoverview Checks native flat-table cursor admission and repeated-headline restrictions using actual document owners. */
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwPosition } from "../../core/crsr/pam";
import { SwTableCursor } from "../../core/crsr/swcrsr";
/** Requires an actual fixture owner. @param value - Resolved owner. @returns Connected owner. */
function required<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error("Missing actual fixture owner");
  return value;
}
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Closes actual shells. @returns Nothing. */ () => {
    for (const s of sessions.splice(0)) s.Close();
  },
);
/** Creates actual cell sections and current edit window. @returns Native owners. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    body = required(doc.paragraphs[0]);
  body.SetText("Body");
  const table = doc.nodes.MakeTableNode(
    "Native",
    { headerRows: 1, repeatHeaderRows: true, width: 4000 },
    body,
  );
  table.AddColumnWidth(2000);
  table.AddColumnWidth(2000);
  const nodes = [];
  for (let row = 0; row < 3; row++)
    for (const box of doc.nodes.AppendTableRow(table, 2).GetTabBoxes()) {
      const node = required(box.GetParagraphs()[0]);
      node.SetText("Cell" + nodes.length);
      nodes.push(node);
    }
  const other = doc.nodes.MakeTableNode("Other", { width: 2000 });
  other.AddColumnWidth(2000);
  const outside = required(
    required(doc.nodes.AppendTableRow(other, 1).GetTabBoxes()[0]).GetParagraphs()[0],
  );
  outside.SetText("Other");
  const shell = session.view.GetWrtShell(),
    edit = session.view.GetEditWin();
  shell.FocusNode(body);
  doc.GetUndoManager().Clear();
  return { doc, shell, edit, table, nodes, body, outside };
}
/** Builds current native hit. @param node - Actual text owner. @param offset - UTF16 offset. @param repeated - Follow headline occurrence. @returns Edit endpoint. */
function hit(node: ReturnType<typeof fixture>["body"], offset = 1, repeated = false) {
  return {
    nodeIndex: node.GetIndex(),
    contentIndex: offset,
    inRepeatedHeadline: repeated,
  };
}
it.each([false, true])(
  "promotes cross-cell direction reverse=%s to the native rectangle",
  /** Checks actual cursor identity and rectangle. @param reverse - Direction. @returns Nothing. */ (
    reverse,
  ) => {
    const f = fixture(),
      a = required(f.nodes[0]),
      b = required(f.nodes[3]),
      ordinary = f.shell.GetCursor();
    expect(
      f.edit.SetSelection({ mark: hit(reverse ? b : a), point: hit(reverse ? a : b, 2) }),
    ).toBe(true);
    const c = f.shell.getShellCursor();
    expect(c).toBeInstanceOf(SwTableCursor);
    expect(c.GetPoint().GetNode()).toBe(reverse ? a : b);
    expect(c.GetMark().GetNode()).toBe(reverse ? b : a);
    expect((c as SwTableCursor).GetSelectedBoxes()).toEqual(
      f.table
        .GetTabLines()
        .slice(0, 2)
        .flatMap(
          /** Reads original native boxes. @param line - Source row. @returns Boxes. */ (line) =>
            line.GetTabBoxes(),
        ),
    );
    expect(f.shell.GetCursor()).toBe(ordinary);
    expect(ordinary.IsMultiSelection()).toBe(true);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  },
);
it.each(["point", "mark"] as const)(
  "collapses a new repeated headline cross-cell %s hit to its fixed mark",
  /** Checks actual native forbidden table admission. @param end - Repeated endpoint. @returns Nothing. */ (
    end,
  ) => {
    const f = fixture(),
      mark = required(f.nodes[end === "mark" ? 0 : 2]),
      point = required(f.nodes[end === "point" ? 0 : 2]);
    f.edit.SetSelection({
      mark: hit(mark, 2, end === "mark"),
      point: hit(point, 1, end === "point"),
    });
    expect(f.shell.HasBoxSelection()).toBe(false);
    expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(mark);
    expect(f.shell.GetCursor().GetPoint().GetContentIndex()).toBe(2);
    expect(f.shell.GetCursor().HasMark()).toBe(false);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  },
);
it.each([false, true])(
  "reduces existing native table cursor to fixed mark cell boundary reverse=%s",
  /** Checks actual native section traversal and mark ownership. @param reverse - Native source direction. @returns Nothing. */ (
    reverse,
  ) => {
    const f = fixture(),
      mark = required(f.nodes[2]),
      point = required(f.nodes[reverse ? 0 : 4]);
    f.edit.SetSelection({ mark: hit(mark, 2), point: hit(required(f.nodes[3]), 1) });
    expect(f.shell.HasBoxSelection()).toBe(true);
    f.edit.SetSelection({ mark: hit(mark, 2, !reverse), point: hit(point, 1, reverse) });
    expect(f.shell.HasBoxSelection()).toBe(false);
    const cursor = f.shell.getShellCursor();
    expect(cursor.GetPoint().GetNode()).toBe(mark);
    expect(cursor.GetPoint().GetContentIndex()).toBe(reverse ? 0 : 5);
    expect(cursor.GetMark().GetNode()).toBe(mark);
    expect(cursor.GetMark().GetContentIndex()).toBe(2);
    expect(cursor.IsMultiSelection()).toBe(false);
  },
);
it("retains same-cell repeated text range and collapsed caret without table mode", /** Checks ordinary text edits remain admitted. @returns Nothing. */ () => {
  const f = fixture(),
    node = required(f.nodes[0]);
  f.edit.SetSelection({ mark: hit(node, 1, true), point: hit(node, 3, true) });
  expect(f.shell.HasBoxSelection()).toBe(false);
  expect(f.shell.GetCursor().HasMark()).toBe(true);
  expect(f.edit.InsertText("X")).toBe(true);
  expect(node.GetText()).toBe("CXl0");
  expect(f.edit.Undo()).toBe(true);
  expect(node.GetText()).toBe("Cell0");
  f.edit.SetSelection({ point: hit(node, 2, true) });
  expect(f.shell.HasBoxSelection()).toBe(false);
  expect(f.shell.GetCursor().GetPoint().GetContentIndex()).toBe(2);
});
it.each(["body", "other"] as const)(
  "retains ordinary cross-section %s control",
  /** Checks bounded same-table condition. @param kind - Endpoint section. @returns Nothing. */ (
    kind,
  ) => {
    const f = fixture();
    f.edit.SetSelection({
      mark: hit(required(f.nodes[0])),
      point: hit(kind === "body" ? f.body : f.outside),
    });
    expect(f.shell.HasBoxSelection()).toBe(false);
    expect(f.shell.GetCursor().HasMark()).toBe(true);
  },
);
it("rejects invalid endpoints before repeated headline admission", /** Checks real position validation does not alter cursor or history. @returns Nothing. */ () => {
  const f = fixture(),
    before = f.shell.getShellCursor().GetPoint().GetNode();
  expect(
    f.edit.SetSelection({
      point: { nodeIndex: -1, contentIndex: 0, inRepeatedHeadline: true },
      mark: hit(required(f.nodes[0])),
    }),
  ).toBe(false);
  expect(
    f.edit.SetSelection({
      point: hit(required(f.nodes[0])),
      mark: {
        nodeIndex: required(f.nodes[1]).GetIndex(),
        contentIndex: 999,
        inRepeatedHeadline: true,
      },
    }),
  ).toBe(false);
  expect(f.shell.getShellCursor().GetPoint().GetNode()).toBe(before);
});
it("updates an unchanged low-level cross-cell PaM once without changing the existing table cursor twice", /** Checks source-shaped assignment and interactive update remain separate. @returns Nothing. */ () => {
  const f = fixture(),
    point = new SwPosition(required(f.nodes[3]), 2),
    mark = new SwPosition(required(f.nodes[0]), 1);
  try {
    f.shell.SetPaM(point, mark);
    expect(f.shell.HasBoxSelection()).toBe(false);
    expect(f.shell.UpdateCursor(point, mark)).toBe(true);
    const native = f.shell.getShellCursor();
    expect(native).toBeInstanceOf(SwTableCursor);
    expect(f.shell.UpdateCursor(point, mark)).toBe(false);
    expect(f.shell.getShellCursor()).toBe(native);
  } finally {
    point.Dispose();
    mark.Dispose();
  }
});
it("ignores a stale follow-headline flag after native repeat count becomes zero", /** Checks native table repeat ownership gates the view hit. @returns Nothing. */ () => {
  const f = fixture();
  f.table.SetRowsToRepeat(0);
  f.edit.SetSelection({
    mark: hit(required(f.nodes[0]), 1, true),
    point: hit(required(f.nodes[2]), 2),
  });
  expect(f.shell.HasBoxSelection()).toBe(true);
  expect(f.shell.getShellCursor().GetPoint().GetNode()).toBe(f.nodes[2]);
});
it("rejects foreign native point and mark before interactive table update", /** Checks ownership validation retains actual cursor. @returns Nothing. */ () => {
  const f = fixture(),
    other = fixture(),
    local = new SwPosition(f.body, 1),
    foreign = new SwPosition(other.body, 1);
  try {
    const cursor = f.shell.getShellCursor();
    expect(f.shell.UpdateCursor(foreign, local, true)).toBe(false);
    expect(f.shell.UpdateCursor(local, foreign, true)).toBe(false);
    expect(f.shell.getShellCursor()).toBe(cursor);
    expect(cursor.GetPoint().GetNode()).toBe(f.body);
  } finally {
    local.Dispose();
    foreign.Dispose();
  }
});
it("ignores a repeated mark when the moving point leaves the table", /** Checks native point-in-table admission condition. @returns Nothing. */ () => {
  const f = fixture();
  f.edit.SetSelection({ mark: hit(required(f.nodes[2])), point: hit(required(f.nodes[3])) });
  expect(f.shell.HasBoxSelection()).toBe(true);
  f.edit.SetSelection({ mark: hit(required(f.nodes[0]), 1, true), point: hit(f.body, 2) });
  expect(f.shell.HasBoxSelection()).toBe(false);
  expect(f.shell.getShellCursor().GetPoint().GetNode()).toBe(f.body);
});
it("keeps model-only edit-window cell ranges ordinary until actual table frame context arrives", /** Checks native frame admission independently from model coordinates. @returns Nothing. */ () => {
  const f = fixture(),
    point = required(f.nodes[3]),
    mark = required(f.nodes[0]);
  f.edit.SetSelection({
    point: { nodeIndex: point.GetIndex(), contentIndex: 2 },
    mark: { nodeIndex: mark.GetIndex(), contentIndex: 1 },
  });
  expect(f.shell.HasBoxSelection()).toBe(false);
  expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(point);
  f.edit.SetSelection({ point: hit(point, 2), mark: hit(mark, 1) });
  expect(f.shell.HasBoxSelection()).toBe(true);
  expect(f.shell.getShellCursor()).toBeInstanceOf(SwTableCursor);
});
it("rejects foreign table-frame endpoints while retaining an already active native box selection", /** Checks actual final ownership validation before changing a live table cursor. @returns Nothing. */ () => {
  const f = fixture(),
    other = fixture();
  f.edit.SetSelection({ point: hit(required(f.nodes[3])), mark: hit(required(f.nodes[0])) });
  const existing = f.shell.getShellCursor(),
    local = new SwPosition(required(f.nodes[0]), 1),
    foreign = new SwPosition(required(other.nodes[0]), 1);
  try {
    expect(f.shell.UpdateCursor(foreign, local, true)).toBe(false);
    expect(f.shell.UpdateCursor(local, foreign, true)).toBe(false);
    expect(f.shell.getShellCursor()).toBe(existing);
    expect(f.shell.HasBoxSelection()).toBe(true);
  } finally {
    local.Dispose();
    foreign.Dispose();
  }
});
