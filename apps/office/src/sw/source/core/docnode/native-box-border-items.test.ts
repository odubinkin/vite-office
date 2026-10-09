/** @fileoverview Verifies native item-set edge distribution and original graph/history ownership. */
import { expect, it } from "vitest";
import {
  SvxBoxItem,
  SvxBoxInfoItem,
  SvxBoxInfoItemValidFlags,
} from "../../../../editeng/source/items/frmitems";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxPoolItemValue } from "../../../../svl/source/items/poolitem";
import { RES_BOX } from "../../../inc/hintids";
import { SID_ATTR_BORDER_INNER } from "../../../../svx/inc/svxids";
import { SwCursor } from "../crsr/swcrsr";
import { SwPosition } from "../crsr/pam";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { ItemSetToTableParam } from "../../uibase/shells/tabsh";

it("preserves existing interior edges when native inner validity is disabled", /** Checks independent outer validity against retained original interior lines. @returns Nothing. */ () => {
  const f = fixture();
  try {
    f.inner.SetValid(SvxBoxInfoItemValidFlags.HORI, false);
    f.inner.SetValid(SvxBoxInfoItemValidFlags.VERT, false);
    f.items.Put(f.outer);
    f.items.Put(f.inner);
    expect(f.doc.SetTabBorders(f.cursor, f.items)).toBe(true);
    expect(
      f.boxes.map(
        /** Reads complete source-owned edge state. @param box - Original owner. @returns Four edges. */ (
          box,
        ) => lines(box.GetBox()),
      ),
    ).toEqual([
      [
        [0xff0000, 20],
        [0x112233, 10],
        [0x0000ff, 40],
        [0x112233, 10],
      ],
      [
        [0xff0000, 20],
        [0x112233, 10],
        [0x112233, 10],
        [0xffff00, 50],
      ],
      [
        [0x112233, 10],
        [0x00ff00, 30],
        [0x0000ff, 40],
        [0x112233, 10],
      ],
      [
        [0x112233, 10],
        [0x00ff00, 30],
        [0x112233, 10],
        [0xffff00, 50],
      ],
    ]);
  } finally {
    f.session.Close();
  }
});
it("applies padding-only and border-only presentation ingress through original native items", /** Checks omitted fields retain native current values and padding-only updates retain independent edges. @returns Nothing. */ () => {
  for (const field of ["padding", "border"] as const) {
    const f = fixture(),
      shell = f.session.view.GetWrtShell();
    try {
      shell.FocusNode(required(f.boxes[0]?.GetParagraphs()[0]));
      const original = f.boxes.map(
        /** Retains complete native box state. @param box - Original owner. @returns Owned item. */ (
          box,
        ) => box.GetBox(),
      );
      const input = {
        width: 6000,
        columnWidths: [3000, 3000],
        headerRows: 0,
        repeatHeaderRows: false,
        ...(field === "padding" ? { padding: 42 } : { border: "none" }),
      };
      expect(ItemSetToTableParam(shell, input)).toBe(true);
      for (const [i, box] of f.boxes.entries())
        for (const edge of [0, 1, 2, 3]) {
          expect(box.GetBox().GetDistance(edge)).toBe(field === "padding" ? 42 : 80 + edge);
          if (field === "padding")
            expect(box.GetBox().GetLine(edge)?.toJSON()).toEqual(
              required(original[i]).GetLine(edge)?.toJSON(),
            );
          else expect(box.GetBox().GetLine(edge)).toBeUndefined();
        }
      expect(shell.Undo()).toBe(true);
      for (const [i, box] of f.boxes.entries())
        expect(box.GetBox().equals(required(original[i]))).toBe(true);
    } finally {
      f.session.Close();
    }
  }
});

it("uses native default box distances while the retained ordinary cursor is outside a displayed table selection", /** Checks original display selection and ordinary cursor phases without replacing native owners. @returns Nothing. */ () => {
  const f = fixture(),
    shell = f.session.view.GetWrtShell();
  try {
    shell.FocusNode(required(f.boxes[0]?.GetParagraphs()[0]));
    expect(shell.SelTableRow()).toBe(true);
    const ordinary = shell.GetCursor(false);
    ordinary.GetPoint().Assign(required(f.doc.paragraphs[0]));
    expect(shell.IsCursorInTable()?.GetTable()).toBe(f.table);
    expect(shell.GetCursor(false)).toBe(ordinary);
    expect(
      ItemSetToTableParam(shell, {
        width: 6000,
        columnWidths: [3000, 3000],
        headerRows: 0,
        repeatHeaderRows: false,
        border: "none",
      }),
    ).toBe(true);
    for (const box of f.boxes.slice(0, 2))
      for (const edge of [0, 1, 2, 3]) {
        expect(box.GetBox().GetDistance(edge)).toBe(0);
        expect(box.GetBox().GetLine(edge)).toBeUndefined();
      }
    for (const [i, box] of f.boxes.slice(2).entries())
      for (const edge of [0, 1, 2, 3]) {
        expect(box.GetBox().GetDistance(edge)).toBe(82 + i + edge);
        expect(box.GetBox().GetLine(edge)?.GetColor()).toBe(0x112233);
      }
    expect(shell.Undo()).toBe(true);
    for (const [i, box] of f.boxes.entries())
      for (const edge of [0, 1, 2, 3]) {
        expect(box.GetBox().GetDistance(edge)).toBe(80 + i + edge);
        expect(box.GetBox().GetLine(edge)?.GetColor()).toBe(0x112233);
      }
  } finally {
    f.session.Close();
  }
});

it("restores native box pool values and rejects non-box snapshots and missing table owners", /** Checks the actual registered pool and document entry point. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc();
  try {
    const box = new SvxBoxItem(RES_BOX);
    box.SetAllDistances(42);
    box.SetLine(new SvxBorderLine(0x112233, 20), 0);
    const restored = doc
      .GetAttrPool()
      .CreateItem({ which: RES_BOX, value: box.QueryValue() as SfxPoolItemValue });
    expect(restored).toBeInstanceOf(SvxBoxItem);
    expect(restored.equals(box)).toBe(true);
    expect(
      /** Rejects malformed box sequence values through the real pool factory. @returns Attempted item. */ () =>
        doc.GetAttrPool().CreateItem({ which: RES_BOX, value: false }),
    ).toThrow("Stored Writer box is invalid.");
    expect(
      session.view
        .GetWrtShell()
        .SetTabBorders(new SfxItemSet(doc.GetAttrPool(), [[RES_BOX, RES_BOX]])),
    ).toBe(false);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  } finally {
    session.Close();
  }
});

/** Requires a connected native owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native box owner");
  return value;
}
/** Creates a two-by-two table with independently authored native values. @returns Original owners and native request items. */
function fixture() {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode("NativeBox", { width: 6000 }, doc.paragraphs[0]);
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const boxes = [];
  for (let row = 0; row < 2; row++)
    for (const box of doc.nodes.AppendTableRow(table, 2).GetTabBoxes()) {
      const item = new SvxBoxItem(RES_BOX);
      for (const edge of [0, 1, 2, 3]) {
        item.SetLine(new SvxBorderLine(0x112233, 10), edge);
        item.SetDistance(80 + boxes.length + edge, edge);
      }
      box.SetFormat({ box: item });
      required(box.GetParagraphs()[0]).SetText("Native " + boxes.length);
      boxes.push(box);
    }
  const nodes = boxes.map(
    /** Reads original text owner. @param box - Cell. @returns Native node. */ (box) =>
      required(box.GetParagraphs()[0]),
  );
  const cursor = new SwCursor(new SwPosition(required(nodes[0]), 2));
  cursor.SetMark();
  cursor.GetMark().Assign(required(nodes[3]), 3);
  const outer = new SvxBoxItem(RES_BOX),
    inner = new SvxBoxInfoItem(SID_ATTR_BORDER_INNER);
  for (const [edge, color] of [0xff0000, 0x00ff00, 0x0000ff, 0xffff00].entries()) {
    outer.SetLine(new SvxBorderLine(color, 20 + edge * 10), edge);
    outer.SetDistance((edge + 1) * 11, edge);
  }
  inner.SetTable(true);
  inner.SetLine(new SvxBorderLine(0xff00ff, 60), 0);
  inner.SetLine(new SvxBorderLine(0x00ffff, 70), 1);
  const items = new SfxItemSet(doc.GetAttrPool(), [
    [RES_BOX, RES_BOX],
    [SID_ATTR_BORDER_INNER, SID_ATTR_BORDER_INNER],
  ]);
  return { session, doc, table, boxes, nodes, cursor, outer, inner, items };
}
/** Reads independent numeric native lines, retaining absence. @param box - Native item. @returns Top/bottom/left/right colors and widths. */
function lines(box: SvxBoxItem) {
  return [0, 1, 2, 3].map(
    /** Reads one source line. @param edge - Side. @returns Native authored values or null. */ (
      edge,
    ) => {
      const line = box.GetLine(edge);
      return line === undefined ? null : [line.GetColor(), line.GetWidth()];
    },
  );
}
it("distributes native outer and inner lines over the endpoint union and preserves the original graph through history", /** Checks independent source-defined edge expectations and deep owner copies. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const before = f.boxes.map(
        /** Retains complete authored items. @param box - Native cell. @returns Format. */ (box) =>
          box.GetFormat(),
      ),
      revision = f.doc.GetDocumentStateManager().GetModelRevision();
    f.items.Put(f.outer);
    f.items.Put(f.inner);
    expect(f.doc.SetTabBorders(f.cursor, f.items)).toBe(true);
    expect(
      f.boxes.map(
        /** Reads complete native lines. @param box - Cell. @returns Edges. */ (box) =>
          lines(box.GetBox()),
      ),
    ).toEqual([
      [[0xff0000, 20], [0xff00ff, 60], [0x0000ff, 40], null],
      [
        [0xff0000, 20],
        [0xff00ff, 60],
        [0x00ffff, 70],
        [0xffff00, 50],
      ],
      [null, [0x00ff00, 30], [0x0000ff, 40], null],
      [null, [0x00ff00, 30], [0x00ffff, 70], [0xffff00, 50]],
    ]);
    for (const box of f.boxes)
      expect(
        [0, 1, 2, 3].map(
          /** Reads all distances. @param edge - Side. @returns Twips. */ (edge) =>
            box.GetBox().GetDistance(edge),
        ),
      ).toEqual([11, 22, 33, 44]);
    expect(f.doc.GetDocumentStateManager().GetModelRevision()).toBe(revision + 1);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    const after = f.boxes.map(
      /** Captures complete new items. @param box - Native cell. @returns Format. */ (box) =>
        box.GetFormat(),
    );
    f.outer.SetAllDistances(999);
    f.inner.GetHori()?.SetColor(0);
    expect(
      f.boxes.map(
        /** Reads independent applied formats. @param box - Cell. @returns Format. */ (box) =>
          box.GetFormat(),
      ),
    ).toEqual(after);
    for (let cycle = 0; cycle < 2; cycle++) {
      expect(f.session.view.GetWrtShell().Undo()).toBe(true);
      expect(
        f.boxes.map(
          /** Reads undo formats. @param box - Cell. @returns Format. */ (box) => box.GetFormat(),
        ),
      ).toEqual(before);
      expect(f.session.view.GetWrtShell().Redo()).toBe(true);
      expect(
        f.boxes.map(
          /** Reads redo formats. @param box - Cell. @returns Format. */ (box) => box.GetFormat(),
        ),
      ).toEqual(after);
      for (const [index, box] of f.boxes.entries())
        expect(box.GetParagraphs()[0]).toBe(f.nodes[index]);
    }
  } finally {
    f.cursor.Dispose();
    f.session.Close();
  }
});
it("invalid line components retain authored edges while complete distances apply even with invalid DISTANCE", /** Checks native validity and negative-read policy independently. @returns Nothing. */ () => {
  const f = fixture();
  try {
    f.inner.SetValid(SvxBoxInfoItemValidFlags.ALL, false);
    f.outer.SetDistance(-40, 0);
    f.items.Put(f.outer);
    f.items.Put(f.inner);
    expect(f.doc.SetTabBorders(f.cursor, f.items)).toBe(true);
    for (const box of f.boxes) {
      expect(lines(box.GetBox())).toEqual([
        [0x112233, 10],
        [0x112233, 10],
        [0x112233, 10],
        [0x112233, 10],
      ]);
      expect(
        [0, 1, 2, 3].map(
          /** Reads native complete distances. @param edge - Side. @returns Twips. */ (edge) =>
            box.GetBox().GetDistance(edge, true),
        ),
      ).toEqual([0, 22, 33, 44]);
    }
  } finally {
    f.cursor.Dispose();
    f.session.Close();
  }
});
it("inner-only native input modifies bottom and left interior lines without replacing outer or distance items", /** Checks native absent-outer branches and asymmetric clearing ownership. @returns Nothing. */ () => {
  const f = fixture();
  try {
    f.items.Put(f.inner);
    expect(f.doc.SetTabBorders(f.cursor, f.items)).toBe(true);
    expect(
      f.boxes.map(
        /** Reads all native edges. @param box - Cell. @returns Edges. */ (box) =>
          lines(box.GetBox()),
      ),
    ).toEqual([
      [
        [0x112233, 10],
        [0xff00ff, 60],
        [0x112233, 10],
        [0x112233, 10],
      ],
      [
        [0x112233, 10],
        [0xff00ff, 60],
        [0x00ffff, 70],
        [0x112233, 10],
      ],
      [
        [0x112233, 10],
        [0x112233, 10],
        [0x112233, 10],
        [0x112233, 10],
      ],
      [
        [0x112233, 10],
        [0x112233, 10],
        [0x00ffff, 70],
        [0x112233, 10],
      ],
    ]);
    for (const [index, box] of f.boxes.entries())
      expect(
        [0, 1, 2, 3].map(
          /** Reads retained distances. @param edge - Side. @returns Twips. */ (edge) =>
            box.GetBox().GetDistance(edge),
        ),
      ).toEqual([80 + index, 81 + index, 82 + index, 83 + index]);
  } finally {
    f.cursor.Dispose();
    f.session.Close();
  }
});
it("absent info enables source default validity and clears the opposite internal edges", /** Checks native default info behavior without synthesizing inner lines. @returns Nothing. */ () => {
  const f = fixture();
  try {
    f.items.Put(f.outer);
    expect(f.doc.SetTabBorders(f.cursor, f.items)).toBe(true);
    expect(
      f.boxes.map(
        /** Reads all native edges. @param box - Cell. @returns Edges. */ (box) =>
          lines(box.GetBox()),
      ),
    ).toEqual([
      [[0xff0000, 20], null, [0x0000ff, 40], null],
      [[0xff0000, 20], null, null, [0xffff00, 50]],
      [null, [0x00ff00, 30], [0x0000ff, 40], null],
      [null, [0x00ff00, 30], null, [0xffff00, 50]],
    ]);
  } finally {
    f.cursor.Dispose();
    f.session.Close();
  }
});

it("preserves all independent native box attributes for layout-only presentation ingress", /** Checks omitted border declarations bypass all cell box updates while recording layout history. @returns Nothing. */ () => {
  const f = fixture(),
    shell = f.session.view.GetWrtShell();
  try {
    shell.FocusNode(required(f.boxes[0]?.GetParagraphs()[0]));
    const before = f.boxes.map(
      /** Captures independently authored native items. @param box - Original owner. @returns Owned item. */ (
        box,
      ) => box.GetBox(),
    );
    expect(
      ItemSetToTableParam(shell, {
        width: 6000,
        columnWidths: [2000, 4000],
        headerRows: 0,
        repeatHeaderRows: false,
      }),
    ).toBe(true);
    expect(f.table.GetColumnWidths()).toEqual([2000, 4000]);
    for (const [i, box] of f.boxes.entries())
      expect(box.GetBox().equals(required(before[i]))).toBe(true);
    expect(shell.Undo()).toBe(true);
    expect(f.table.GetColumnWidths()).toEqual([4320, 4320]);
    for (const [i, box] of f.boxes.entries())
      expect(box.GetBox().equals(required(before[i]))).toBe(true);
  } finally {
    f.session.Close();
  }
});
