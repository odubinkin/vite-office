/** @fileoverview Native global PaMCorrAbs uses actual persistent editing shells, shared view rings, saved cursor rings and UNO owners. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "./doc";
import { SwPaM, SwPosition } from "../crsr/pam";
import { PaMCorrAbs } from "./doccorr";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { SwDocShell } from "../../uibase/app/docsh";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwView } from "../../uibase/uiview/view";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { PopMode } from "../crsr/trvltbl";
/** Checks a real optional fixture owner. @param value - Actual value. @returns Checked owner. */
function present<T>(value: T | undefined): T {
  assert(value !== undefined);
  return value;
}
/** Creates real document shell and cursor-shell owners. @returns Native fixture. */
function fixture() {
  const doc = new SwDoc(),
    node = present(doc.paragraphs[0]);
  node.SetText("abcdefgh");
  const docShell = new SwDocShell(
    doc,
    createDocument({ id: "correction", suiteId: "writer", title: "Correction" }),
  );
  const shells: SwWrtShell[] = [],
    positions: SwPosition[] = [];
  return {
    doc,
    node,
    docShell,
    /** Constructs a real persistent shell in this document view ring. @returns Actual shell. */
    shell() {
      const shell = new SwWrtShell(docShell);
      shells.push(shell);
      return shell;
    },
    /** Retains a native operand snapshot until fixture close. @param offset - Actual text offset. @returns Position. */
    at(offset: number) {
      const pos = new SwPosition(node, offset);
      positions.push(pos);
      return pos;
    },
    /** Releases actual view and document ownership. @returns Nothing. */
    close() {
      for (const shell of shells) shell.Close();
      for (const pos of positions) pos.Dispose();
      docShell.Close();
    },
  };
}
it("owns native current-view/layout pointers and chooses the next actual view on close", /** Exercises original manager defaults, ring order and current-view teardown. @returns Nothing. */ () => {
  const f = fixture(),
    access = f.doc.getIDocumentLayoutAccess();
  expect(access.GetCurrentViewShell()).toBeUndefined();
  expect(access.GetCurrentLayout()).toBeUndefined();
  expect(access.HasLayout()).toBe(false);
  expect(f.doc.GetEditShell()).toBeUndefined();
  const a = f.shell(),
    b = f.shell(),
    c = f.shell();
  expect(access.GetCurrentViewShell()).toBe(a);
  expect(access.GetCurrentLayout()).toBe(a.GetLayout());
  expect(access.HasLayout()).toBe(true);
  expect([...a.GetRingContainer()]).toEqual([a, b, c]);
  expect(f.doc.GetEditShell()).toBe(a);
  access.SetCurrentViewShell(b);
  expect(f.doc.GetEditShell()).toBe(b);
  b.Close();
  expect(access.GetCurrentViewShell()).toBe(c);
  expect([...c.GetRingContainer()]).toEqual([c, a]);
  a.Close();
  expect(access.GetCurrentViewShell()).toBe(c);
  c.Close();
  expect(access.GetCurrentViewShell()).toBeUndefined();
  expect(access.HasLayout()).toBe(false);
  f.docShell.Close();
});
it("corrects ordinary selections and every saved stack cursor across all actual document views", /** Original global traversal does not stop after the current shell or first saved range. @returns Nothing. */ () => {
  const f = fixture(),
    a = f.shell(),
    b = f.shell();
  a.SetPaM(f.at(2), f.at(4));
  a.Push();
  a.Push();
  b.SetPaM(f.at(3), f.at(1));
  b.Push();
  b.Push();
  const peer = new SwPaM(f.at(3), f.at(4), a.GetCursor_());
  const start = f.at(1),
    end = f.at(4),
    range = new SwPaM(start, end);
  PaMCorrAbs(range, f.at(7));
  for (const cursor of [a.GetCursor_(), peer, b.GetCursor_()]) {
    expect(cursor.GetPoint().GetContentIndex()).toBe(7);
    expect(cursor.GetMark().GetContentIndex()).toBe(7);
  }
  for (const shell of [a, b]) {
    expect(present(shell.GetStackCursor()).GetRingContainer().size()).toBe(2);
    for (const cursor of present(shell.GetStackCursor()).GetRingContainer()) {
      expect(cursor.GetPoint().GetContentIndex()).toBe(7);
      expect(cursor.GetMark().GetContentIndex()).toBe(7);
    }
    expect(shell.Pop(PopMode.DeleteCurrent)).toBe(true);
    expect(shell.GetCursor_().GetPoint().GetContentIndex()).toBe(7);
  }
  range.Dispose();
  f.close();
});
it("captures both range values before correcting the same source cursor bounds", /** Aliased lower-bound movement must not shrink the native correction range midway through traversal. @returns Nothing. */ () => {
  const f = fixture(),
    a = f.shell(),
    b = f.shell();
  a.SetPaM(f.at(2), f.at(4));
  b.SetPaM(f.at(3));
  const range = a.GetCursor_();
  PaMCorrAbs(range, f.at(7));
  expect(range.GetPoint().GetContentIndex()).toBe(7);
  expect(range.GetMark().GetContentIndex()).toBe(7);
  expect(b.GetCursor_().GetPoint().GetContentIndex()).toBe(7);
  f.close();
});
it("corrects the actual displayed table cursor and ordinary cell-selection ring", /** Uses real table selection production rather than a substitute cursor provider. @returns Nothing. */ () => {
  const f = fixture(),
    table = f.doc.nodes.MakeTableNode("cells");
  const row = f.doc.nodes.AppendTableRow(table, 2),
    first = present(present(row.GetTabBoxes()[0]).GetParagraphs()[0]);
  const second = present(present(row.GetTabBoxes()[1]).GetParagraphs()[0]);
  first.SetText("first");
  second.SetText("second");
  const shell = f.shell();
  shell.FocusNode(first);
  shell.SelTable();
  shell.GetCursor();
  const displayed = present(shell.GetTableCrs()),
    ordinary = shell.GetCursor_();
  expect(shell.IsTableMode()).toBe(true);
  expect(ordinary.GetRingContainer().size()).toBe(2);
  const start = new SwPosition(first, 0),
    end = new SwPosition(second, second.Len()),
    range = new SwPaM(start, end);
  PaMCorrAbs(range, f.at(5));
  for (const cursor of [displayed, ...ordinary.GetRingContainer()]) {
    expect(cursor.GetPoint().GetNode()).toBe(f.node);
    expect(cursor.GetPoint().GetContentIndex()).toBe(5);
    expect(cursor.GetMark().GetNode()).toBe(f.node);
    expect(cursor.GetMark().GetContentIndex()).toBe(5);
  }
  range.Dispose();
  start.Dispose();
  end.Dispose();
  f.close();
});
it("reaches actual API UNO cursors without an edit shell and without touching another document", /** Native global correction does not require UI or invent a shell when none exists. @returns Nothing. */ () => {
  const f = fixture(),
    other = fixture(),
    model = new SwXTextDocument(f.doc),
    api = model.getText().createTextCursor();
  api.goRight(3, false);
  const foreign = other.doc.CreateUnoCursor(other.at(3)),
    range = new SwPaM(f.at(1), f.at(4));
  expect(f.doc.GetEditShell()).toBeUndefined();
  PaMCorrAbs(range, f.at(6));
  expect(api.GetCursor().GetPoint().GetContentIndex()).toBe(6);
  expect(present(foreign.get()).GetPoint().GetContentIndex()).toBe(3);
  api.dispose();
  model.dispose();
  foreign.reset();
  range.Dispose();
  other.close();
  f.close();
});
it("rebinds existing persistent browser views on New and removes them on Close", /** Preserves the authorized browser document-replacement workflow while transferring actual native view-ring ownership. @returns Nothing. */ () => {
  const f = fixture(),
    view = new SwView(f.docShell),
    shell = view.GetWrtShell();
  expect(f.doc.GetEditShell()).toBe(shell);
  const next = f.docShell.InitNew(createDocument({ id: "new", suiteId: "writer", title: "New" }));
  expect(next.GetEditShell()).toBe(shell);
  expect(next.getIDocumentLayoutAccess().GetCurrentViewShell()).toBe(shell);
  expect(shell.GetDoc()).toBe(next);
  expect([...shell.GetRingContainer()]).toEqual([shell]);
  view.Close();
  expect(next.getIDocumentLayoutAccess().GetCurrentViewShell()).toBeUndefined();
});
it("runs UI cursor correction before the document UNO branch", /** Both real owner families receive the original global range snapshot. @returns Nothing. */ () => {
  const f = fixture(),
    shell = f.shell(),
    model = new SwXTextDocument(f.doc),
    api = model.getText().createTextCursor();
  shell.SetPaM(f.at(2), f.at(4));
  api.goRight(3, false);
  PaMCorrAbs(shell.GetCursor_(), f.at(7));
  expect(shell.GetCursor_().GetPoint().GetContentIndex()).toBe(7);
  expect(shell.GetCursor_().GetMark().GetContentIndex()).toBe(7);
  expect(api.GetCursor().GetPoint().GetContentIndex()).toBe(7);
  api.dispose();
  model.dispose();
  f.close();
});
