/** @fileoverview Verifies document-owned box selection, complete item history and native asymmetric getter scope. */
import { nativeBoxFormat, tableBorderItems } from "../../../../test/table-box-test-helpers";
import { expect, it, vi } from "vitest";
import { SwFormatFrameSize } from "../../../inc/fmtfsize";
import { SwDoc } from "../doc/doc";
import { SwPosition } from "../crsr/pam";
import { SwCursor, SwTableCursor } from "../crsr/swcrsr";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
/** Requires an actual owner. @param value - Optional native owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing box owner");
  return value;
}
/** Builds a native graph. @returns Native owners. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Align");
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 2),
    boxes = row.GetTabBoxes(),
    a = required(boxes[0]),
    b = required(boxes[1]);
  const first = required(a.GetParagraphs()[0]),
    second = required(b.GetParagraphs()[0]);
  first.SetText("First");
  second.SetText("Second");
  return { doc, table, row, a, b, first, second };
}
it("ordinary setters traverse ring points while getters ignore ring and mark; table getters use canonical selected boxes", /** Checks native asymmetric collection and complete common values. @returns Nothing. */ () => {
  const f = fixture(),
    cursor = new SwCursor(new SwPosition(f.first)),
    ring = new SwCursor(new SwPosition(f.second), undefined, cursor);
  cursor.SetMark();
  cursor.GetMark().Assign(f.second, 2);
  const item = new SwFormatVertOrient(720, 3, 7);
  expect(f.doc.SetBoxAttr(cursor, item)).toBe(true);
  item.SetPos(99);
  expect(f.a.GetVertOrient().GetPos()).toBe(720);
  expect(f.b.GetVertOrient().GetPos()).toBe(720);
  f.b.SetFormat({ vertOrient: new SwFormatVertOrient(1440, 2, 9) });
  expect(SwDoc.GetBoxAlign(cursor)).toBe(3);
  expect(SwDoc.GetBoxAttr(cursor)?.GetPos()).toBe(720);
  const selected = new SwTableCursor(new SwPosition(f.first));
  selected.ActualizeSelection([f.a, f.b]);
  expect(SwDoc.GetBoxAlign(selected)).toBe(65535);
  expect(SwDoc.GetBoxAttr(selected)).toBeUndefined();
  f.b.SetFormat({ vertOrient: new SwFormatVertOrient(1440, 3, 9) });
  expect(SwDoc.GetBoxAlign(selected)).toBe(3);
  expect(SwDoc.GetBoxAttr(selected)).toBeUndefined();
  expect(f.doc.SetBoxAlign(selected, 2)).toBe(true);
  const common = required(SwDoc.GetBoxAttr(selected));
  common.SetPos(88);
  expect(f.a.GetVertOrient().GetPos()).toBe(0);
  expect(f.b.GetVertOrient().GetRelationOrient()).toBe(1);
  expect(SwDoc.GetBoxAlign(selected)).toBe(2);
  selected.ActualizeSelection([]);
  expect(SwDoc.GetBoxAlign(selected)).toBe(65535);
  expect(f.doc.SetBoxAlign(selected, 3)).toBe(false);
  selected.Dispose();
  ring.Dispose();
  cursor.Dispose();
});
it("rejects body, foreign and disconnected table owners without mutation", /** Checks real document admission. @returns Nothing. */ () => {
  const f = fixture(),
    body = new SwCursor(new SwPosition(required(f.doc.paragraphs[0]))),
    foreign = new SwDoc();
  expect(SwDoc.GetBoxAlign(body)).toBe(65535);
  expect(SwDoc.GetBoxAttr(body)).toBeUndefined();
  expect(f.doc.SetBoxAlign(body, 3)).toBe(false);
  const point = new SwCursor(new SwPosition(f.first));
  expect(foreign.SetBoxAlign(point, 3)).toBe(false);
  const tables = vi.spyOn(f.doc, "GetTables").mockReturnValue([]);
  expect(f.doc.SetBoxAlign(point, 3)).toBe(false);
  tables.mockRestore();
  point.Dispose();
  body.Dispose();
});
it("thin native shell delegates preserve original boxes and cursor through repeated attribute history", /** Checks full item reset, same-value history and actual shell publication. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    table = doc.nodes.MakeTableNode("History");
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 1),
    box = required(row.GetTabBoxes()[0]),
    node = required(box.GetParagraphs()[0]);
  box.SetFormat({ vertOrient: new SwFormatVertOrient(720, 3, 7) });
  shell.FocusNode(node);
  const setter = vi.spyOn(doc, "SetBoxAlign");
  expect(shell.GetBoxAlign()).toBe(3);
  expect(shell.SetBoxAlign(2)).toBe(true);
  expect(setter).toHaveBeenCalledOnce();
  expect([box.GetVertOrient().GetPos(), box.GetVertOrient().GetRelationOrient()]).toEqual([0, 1]);
  for (let cycle = 0; cycle < 3; cycle++) {
    expect(shell.Undo()).toBe(true);
    expect(box.GetVertOrient().GetPos()).toBe(720);
    expect(shell.GetBoxAlign()).toBe(3);
    expect(shell.Redo()).toBe(true);
    expect(shell.GetBoxAlign()).toBe(2);
    expect(row.GetTabBoxes()[0]).toBe(box);
    expect(box.GetParagraphs()[0]).toBe(node);
    expect(shell.GetCursor().GetPoint().GetNode()).toBe(node);
  }
  expect(shell.SetBoxAlign(2)).toBe(true);
  expect(shell.Undo()).toBe(true);
  expect(shell.GetBoxAlign()).toBe(2);
  setter.mockRestore();
  session.Close();
});

it("insertion history copies the complete box item before caller mutation", /** Checks full native item ownership across graph reconstruction. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell(),
    item = new SwFormatVertOrient(720, 3, 7);
  const table = required(
    shell.InsertTable({ mnInsMode: 2, mnRowsToRepeat: 0 }, 1, 1, "Copied", { vertOrient: item }),
  );
  item.SetPos(999);
  expect(table.GetTabLines()[0]?.GetTabBoxes()[0]?.GetVertOrient().GetPos()).toBe(720);
  expect(shell.Undo()).toBe(true);
  expect(shell.Redo()).toBe(true);
  const copy = required(
    session.docShell.GetDoc().GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes()[0],
  );
  expect(copy.GetVertOrient()).toEqual(new SwFormatVertOrient(720, 3, 7));
  session.Close();
});

it("body shell alignment and border requests retain absent table admission", /** Checks the separate native shell document delegate and represented border branch. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell();
  expect(shell.GetBoxAlign()).toBe(65535);
  expect(shell.SetBoxAlign(2)).toBe(false);
  expect(
    shell.SetTabBorders(
      tableBorderItems(shell.GetDoc(), { padding: 44, border: "none" }, shell.GetCursor(false)),
    ),
  ).toBe(false);
  session.Close();
});
it("insertion history retains absent native orientation independently of authored padding", /** Checks optional complete-item cloning admission and original default across redo. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell(),
    box = nativeBoxFormat({ padding: 42 });
  const table = required(
    shell.InsertTable({ mnInsMode: 2, mnRowsToRepeat: 0 }, 1, 1, "DefaultAlign", box),
  );
  required(box.box).SetAllDistances(99);
  const expected = {
    ...nativeBoxFormat({ padding: 42 }),
    frameSize: new SwFormatFrameSize(undefined, 65535, 0),
  };
  expect(table.GetTabLines()[0]?.GetTabBoxes()[0]?.GetFormat()).toEqual(expected);
  expect(shell.Undo()).toBe(true);
  expect(shell.Redo()).toBe(true);
  const cell = required(
    session.docShell.GetDoc().GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes()[0],
  );
  expect(cell.GetFormat()).toEqual(expected);
  expect(cell.GetVertOrient().GetVertOrient()).toBe(0);
  session.Close();
});

it("native alignment getter narrows signed items to ushort and retains its mixed sentinel selection order", /** Checks native source scalar widths and valid orientations over actual selected boxes. @returns Nothing. */ () => {
  const f = fixture(),
    point = new SwCursor(new SwPosition(f.first)),
    selected = new SwTableCursor(new SwPosition(f.first));
  selected.ActualizeSelection([f.a, f.b]);
  f.a.SetFormat({ vertOrient: new SwFormatVertOrient(0, -32768) });
  f.b.SetFormat({ vertOrient: new SwFormatVertOrient(0, 2) });
  expect(SwDoc.GetBoxAlign(point)).toBe(32768);
  expect(SwDoc.GetBoxAlign(selected)).toBe(65535);
  f.a.SetFormat({ vertOrient: new SwFormatVertOrient(0, -1) });
  expect(SwDoc.GetBoxAlign(point)).toBe(65535);
  expect(SwDoc.GetBoxAlign(selected)).toBe(2);
  f.a.SetFormat({ vertOrient: new SwFormatVertOrient(0, 0) });
  expect(SwDoc.GetBoxAlign(point)).toBe(0);
  expect(SwDoc.GetBoxAlign(selected)).toBe(65535);
  f.a.SetFormat({ vertOrient: new SwFormatVertOrient(0, 2) });
  expect(SwDoc.GetBoxAlign(selected)).toBe(2);
  f.a.SetFormat({ vertOrient: new SwFormatVertOrient(0, 3) });
  f.b.SetFormat({ vertOrient: new SwFormatVertOrient(0, 3) });
  expect(SwDoc.GetBoxAlign(selected)).toBe(3);
  selected.ActualizeSelection([]);
  expect(SwDoc.GetBoxAlign(selected)).toBe(65535);
  selected.Dispose();
  point.Dispose();
});
