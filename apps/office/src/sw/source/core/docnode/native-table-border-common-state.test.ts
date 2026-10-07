/** @fileoverview Verifies native common border reads, selection scope, owned items and read-only shell input. */
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwCursor, SwTableCursor } from "../crsr/swcrsr";
import { SwPosition } from "../crsr/pam";
import {
  SvxBoxItem,
  SvxBoxInfoItem,
  SvxBoxInfoItemValidFlags as Flags,
} from "../../../../editeng/source/items/frmitems";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { RES_BOX } from "../../../inc/hintids";
import { SID_ATTR_BORDER_INNER } from "../../../../svx/inc/svxids";
import { ItemSetToTableParam, TableParamToItemSet } from "../../uibase/shells/tabsh";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Closes original document owners. @returns Nothing. */ () => {
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Requires an original owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing common border owner");
  return value;
}
/** Builds three rows so mixed validity must remain invalid after a matching third value. @returns Original owners and input. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  const table = doc.nodes.MakeTableNode("Common", { width: 6000 }, doc.paragraphs[0]);
  table.AddColumnWidth(2000);
  table.AddColumnWidth(2000);
  table.AddColumnWidth(2000);
  const boxes = [];
  for (let row = 0; row < 3; row++)
    for (const box of doc.nodes.AppendTableRow(table, 3).GetTabBoxes()) {
      const item = new SvxBoxItem(RES_BOX);
      for (const edge of [0, 1, 2, 3]) {
        item.SetLine(new SvxBorderLine(0x123456, 20), edge);
        item.SetDistance(40 + edge * 10, edge);
      }
      box.SetFormat({ box: item });
      required(box.GetParagraphs()[0]).SetText("Cell " + boxes.length);
      boxes.push(box);
    }
  const nodes = boxes.map(
    /** Reads original text. @param box - Cell owner. @returns Text node. */ (box) =>
      required(box.GetParagraphs()[0]),
  );
  const cursor = new SwCursor(new SwPosition(required(nodes[0]), 1));
  cursor.SetMark();
  cursor.GetMark().Assign(required(nodes[8]), 2);
  const items = new SfxItemSet(doc.GetAttrPool(), [
    [RES_BOX, RES_BOX],
    [SID_ATTR_BORDER_INNER, SID_ATTR_BORDER_INNER],
  ]);
  const info = new SvxBoxInfoItem(SID_ATTR_BORDER_INNER);
  info.SetTable(true);
  info.SetDist(false);
  info.SetMinDist(true);
  info.SetDefDist(91);
  info.SetValid(Flags.ALL, false);
  info.SetValid(Flags.DISABLE);
  items.Put(info);
  shell.FocusNode(required(nodes[4]));
  return { session, doc, shell, table, boxes, nodes, cursor, items, info };
}
/** Reads native output without scalar conversion. @param items - Owned input/output. @returns Native pair. */
function pair(items: SfxItemSet) {
  return {
    box: items.Get(RES_BOX) as SvxBoxItem,
    info: items.Get(SID_ATTR_BORDER_INNER) as SvxBoxInfoItem,
  };
}
it("reads six equal common lines and four independent distances while preserving caller policies", /** Checks deep native copies and the exact ResetFlags mask. @returns Nothing. */ () => {
  const f = fixture(),
    revision = f.doc.GetDocumentStateManager().GetModelRevision();
  const original = f.boxes.map(
    /** Captures original native items. @param box - Cell. @returns Owned item. */ (box) =>
      box.GetBox().QueryValue(),
  );
  f.doc.GetTabBorders(f.cursor, f.items);
  const { box, info } = pair(f.items);
  for (const flag of [
    Flags.TOP,
    Flags.BOTTOM,
    Flags.LEFT,
    Flags.RIGHT,
    Flags.HORI,
    Flags.VERT,
    Flags.DISTANCE,
  ])
    expect(info.IsValid(flag)).toBe(true);
  expect(info.IsValid(Flags.DISABLE)).toBe(false);
  expect([info.IsTable(), info.IsDist(), info.IsMinDist(), info.GetDefDist()]).toEqual([
    true,
    false,
    true,
    91,
  ]);
  for (const edge of [0, 1, 2, 3]) {
    expect(box.GetLine(edge)?.GetColor()).toBe(0x123456);
    expect(box.GetDistance(edge)).toBe(40 + edge * 10);
  }
  expect(info.GetHori()?.GetColor()).toBe(0x123456);
  expect(info.GetVert()?.GetColor()).toBe(0x123456);
  expect(f.doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  expect(f.cursor.GetPoint().GetContentIndex()).toBe(1);
  expect(f.cursor.GetMark().GetContentIndex()).toBe(2);
  box.SetAllDistances(999);
  box.GetTop()?.SetColor(0xffffff);
  info.SetDist(true);
  expect(
    f.boxes.map(
      /** Checks original ownership. @param cell - Original cell. @returns Native value. */ (
        cell,
      ) => cell.GetBox().QueryValue(),
    ),
  ).toEqual(original);
  expect(f.info.IsDist()).toBe(false);
  f.cursor.Dispose();
});
const components = [
  { flag: Flags.TOP, edge: 0, owner: 1, inner: false },
  { flag: Flags.BOTTOM, edge: 1, owner: 7, inner: false },
  { flag: Flags.LEFT, edge: 2, owner: 3, inner: false },
  { flag: Flags.RIGHT, edge: 3, owner: 5, inner: false },
  { flag: Flags.HORI, edge: 1, owner: 1, inner: true },
  { flag: Flags.VERT, edge: 2, owner: 2, inner: true },
];
for (const component of components)
  for (const difference of ["absent", "color", "width"] as const)
    it(
      "invalidates only mixed component=" + component.flag + " difference=" + difference,
      /** Checks absence and complete native equality, including a later matching line. @returns Nothing. */ () => {
        const f = fixture(),
          cell = required(f.boxes[component.owner]),
          item = cell.GetBox();
        item.SetLine(
          difference === "absent"
            ? undefined
            : new SvxBorderLine(
                difference === "color" ? 0x654321 : 0x123456,
                difference === "width" ? 40 : 20,
              ),
          component.edge,
        );
        cell.SetFormat({ box: item });
        f.doc.GetTabBorders(f.cursor, f.items);
        const { box, info } = pair(f.items);
        for (const c of components) expect(info.IsValid(c.flag)).toBe(c.flag !== component.flag);
        expect(
          component.inner
            ? info.GetLine(component.flag === Flags.HORI ? 0 : 1)
            : box.GetLine(component.edge),
        ).toBeUndefined();
        expect(info.IsValid(Flags.DISTANCE)).toBe(true);
        f.cursor.Dispose();
      },
    );
for (const edge of [0, 1, 2, 3])
  it(
    "clears all four distances on one mixed native distance edge=" + edge,
    /** Checks joint distance validity without changing border validity. @returns Nothing. */ () => {
      const f = fixture(),
        cell = required(f.boxes[4]),
        item = cell.GetBox();
      item.SetDistance(300, edge);
      cell.SetFormat({ box: item });
      f.doc.GetTabBorders(f.cursor, f.items);
      const { box, info } = pair(f.items);
      expect(info.IsValid(Flags.DISTANCE)).toBe(false);
      for (const side of [0, 1, 2, 3]) expect(box.GetDistance(side)).toBe(0);
      for (const c of components) expect(info.IsValid(c.flag)).toBe(true);
      f.cursor.Dispose();
    },
  );
it("retains common absent lines and clamps negative distance reads", /** Checks first absent capture and source nonnegative getter semantics. @returns Nothing. */ () => {
  const f = fixture();
  for (const cell of f.boxes) {
    const item = new SvxBoxItem(RES_BOX);
    item.SetAllDistances(-20);
    cell.SetFormat({ box: item });
  }
  f.doc.GetTabBorders(f.cursor, f.items);
  const { box, info } = pair(f.items);
  for (const edge of [0, 1, 2, 3]) {
    expect(box.GetLine(edge)).toBeUndefined();
    expect(box.GetDistance(edge)).toBe(0);
  }
  for (const c of components) expect(info.IsValid(c.flag)).toBe(true);
  expect(info.IsValid(Flags.DISTANCE)).toBe(true);
  f.cursor.Dispose();
});
for (const kind of ["ordinary-ring", "selected-list"] as const)
  it(
    "uses point/mark rectangle independently of " + kind,
    /** Checks native endpoint scope rather than editing membership. @returns Nothing. */ () => {
      const f = fixture();
      f.cursor.Dispose();
      const cursor =
        kind === "selected-list"
          ? new SwTableCursor(new SwPosition(required(f.nodes[4])))
          : new SwCursor(new SwPosition(required(f.nodes[4])));
      const extra =
        kind === "ordinary-ring"
          ? new SwCursor(new SwPosition(required(f.nodes[0])), undefined, cursor)
          : undefined;
      if (cursor instanceof SwTableCursor) cursor.ActualizeSelection([required(f.boxes[0])]);
      const cell = required(f.boxes[4]),
        item = cell.GetBox();
      item.SetAllDistances(99);
      cell.SetFormat({ box: item });
      f.doc.GetTabBorders(cursor, f.items);
      expect(pair(f.items).box.GetDistance(0)).toBe(99);
      expect(pair(f.items).info.IsValid(Flags.DISTANCE)).toBe(true);
      extra?.Dispose();
      cursor.Dispose();
    },
  );
for (const kind of [
  "body",
  "structural",
  "foreign",
  "other-table",
  "detached-point",
  "detached-mark",
] as const)
  it(
    "leaves supplied items untouched for rejected " + kind,
    /** Checks source admission before any output publication. @returns Nothing. */ () => {
      const f = fixture(),
        before = f.items.Clone();
      if (kind === "body") f.cursor.GetPoint().Assign(required(f.doc.paragraphs[0]));
      if (kind === "structural") f.cursor.GetPoint().Assign(f.table.GetTableNode());
      if (kind === "foreign") {
        const other = createWriterDocumentSession();
        sessions.push(other);
        f.cursor.GetPoint().Assign(required(other.docShell.GetDoc().paragraphs[0]));
      }
      if (kind === "other-table") {
        const other = f.doc.nodes.MakeTableNode("Other");
        other.AddColumnWidth(1000);
        f.cursor
          .GetMark()
          .Assign(
            required(f.doc.nodes.AppendTableRow(other, 1).GetTabBoxes()[0]?.GetParagraphs()[0]),
          );
      }
      if (kind === "detached-point") f.table.RemoveLine(required(f.table.GetTabLines()[0]));
      if (kind === "detached-mark") f.table.RemoveLine(required(f.table.GetTabLines()[2]));
      f.doc.GetTabBorders(f.cursor, f.items);
      expect(f.items.Equals(before, true)).toBe(true);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
      f.cursor.Dispose();
    },
  );
for (const selected of [false, true])
  it(
    "captures native dialog input and preserves actual cursors selected=" + selected,
    /** Checks common whole-table versus selected-row scope and native default policy. @returns Nothing. */ () => {
      const f = fixture();
      for (const cell of f.boxes.slice(3, 6)) {
        const item = cell.GetBox();
        item.SetAllDistances(99);
        cell.SetFormat({ box: item });
      }
      if (selected) expect(f.shell.SelTableRow()).toBe(true);
      const cursor = f.shell.getShellCursor(),
        ordinary = f.shell.GetCursor(false),
        state = f.shell.CaptureCursorState(),
        revision = f.doc.GetDocumentStateManager().GetModelRevision();
      const { box, info } = pair(TableParamToItemSet(f.shell));
      expect(box.GetDistance(0)).toBe(selected ? 99 : 0);
      expect(info.IsValid(Flags.DISTANCE)).toBe(selected);
      expect([info.IsTable(), info.IsDist(), info.IsMinDist(), info.GetDefDist()]).toEqual([
        true,
        true,
        true,
        28,
      ]);
      expect(f.shell.getShellCursor()).toBe(cursor);
      expect(f.shell.GetCursor(false)).toBe(ordinary);
      expect(f.shell.IsTableMode()).toBe(selected);
      expect(f.shell.CaptureCursorState()).toEqual(state);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
      expect(f.doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
      f.cursor.Dispose();
    },
  );
it("returns pool defaults outside a table and applies owned native payload ahead of legacy ingress", /** Checks default input and preferred complete item carrier through grouped history. @returns Nothing. */ () => {
  const f = fixture();
  f.shell.FocusNode(required(f.doc.paragraphs[0]));
  const empty = pair(TableParamToItemSet(f.shell));
  expect(empty.box.GetDistance(0)).toBe(0);
  expect(empty.info.IsTable()).toBe(false);
  expect(empty.info.GetDefDist()).toBe(28);
  f.shell.FocusNode(required(f.nodes[4]));
  const input = TableParamToItemSet(f.shell),
    { box } = pair(input);
  box.SetAllDistances(77);
  input.Put(box);
  const original = f.boxes.map(
    /** Retains original native formats. @param cell - Owner. @returns Complete item. */ (cell) =>
      cell.GetBox(),
  );
  expect(
    ItemSetToTableParam(f.shell, {
      width: 6000,
      columnWidths: [2000, 2000, 2000],
      minRowHeight: 0,
      headerRows: 0,
      repeatHeaderRows: false,
      borderItems: input,
      padding: 999,
      border: "none",
    }),
  ).toBe(true);
  box.SetAllDistances(1000);
  input.Put(box);
  for (const cell of f.boxes) expect(cell.GetBox().GetDistance(0)).toBe(77);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.shell.Undo()).toBe(true);
  for (const [i, cell] of f.boxes.entries())
    expect(cell.GetBox().equals(required(original[i]))).toBe(true);
  expect(f.shell.Redo()).toBe(true);
  for (const cell of f.boxes) expect(cell.GetBox().GetDistance(0)).toBe(77);
  f.cursor.Dispose();
});

it("retains cell-mode inner policy for one selected native cell", /** Checks actual cursor materialization and source count policy without fabricated cursor counts. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    table = doc.nodes.MakeTableNode("Single", { width: 3000 }, doc.paragraphs[0]);
  table.AddColumnWidth(3000);
  const cell = required(doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]),
    node = required(cell.GetParagraphs()[0]),
    box = new SvxBoxItem(RES_BOX);
  box.SetAllDistances(80);
  cell.SetFormat({ box });
  node.SetText("Single cell");
  shell.FocusNode(node);
  expect(shell.SelTableRow()).toBe(true);
  const original = shell.CaptureCursorState(),
    input = pair(TableParamToItemSet(shell));
  expect(input.info.IsTable()).toBe(false);
  expect(input.box.GetDistance(0)).toBe(80);
  expect(input.info.GetDefDist()).toBe(28);
  expect(shell.CaptureCursorState()).toEqual(original);
  expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
