/** @fileoverview Checks actual native table editing cursor rings and formatting history. */
import { selectTableRow } from "../../../../../test-support/table-mouse";
import { it, expect, describe } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPosition, getWriterSelectedTextRanges } from "../../core/crsr/pam";
import { SwCursor, SwTableCursor } from "../../core/crsr/swcrsr";
import { SwWrtShell } from "./wrtsh1";
import { SwDocShell } from "../app/docsh";
import { SwEditWin } from "../docvw/edtwin";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { projectWriterCharacterAttributes } from "../../core/txtnode/txatbase";
/** Requires an actual test owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing cursor-ring owner");
  return value;
}
/** Builds a real grid with multiple paragraphs and text in unselected columns. @returns Native owners. */
function fixture() {
  const doc = new SwDoc(),
    body = required(doc.paragraphs[0]);
  body.SetText("Body");
  const table = doc.nodes.MakeTableNode("Grid", {}, body);
  for (const width of [2000, 2000, 2000]) table.AddColumnWidth(width);
  for (let row = 0; row < 3; row++) doc.nodes.AppendTableRow(table, 3);
  const boxes = table
      .GetTabLines()
      .flatMap(
        /** Checks actual table selection behavior. @param row - Current owner. @returns Operation result. */ (
          row,
        ) => row.GetTabBoxes(),
      ),
    nodes = boxes.map(
      /** Checks actual table selection behavior. @param box - Current owner. @returns Operation result. */ (
        box,
      ) => required(box.GetParagraphs()[0]),
    );
  nodes.forEach(
    /** Checks actual table selection behavior. @param node - Current owner. @param i - Current owner. @returns Operation result. */ (
      node,
      i,
    ) => node.SetText("Cell" + i),
  );
  const tail = doc.nodes.AppendTableCellParagraph(required(boxes[4]));
  tail.SetText("Tail");
  const empty = doc.nodes.AppendTableCellParagraph(required(boxes[7]));
  const shell = new SwWrtShell(
      new SwDocShell(doc, createDocument({ id: "rings", suiteId: "writer", title: "Rings" })),
    ),
    edit = new SwEditWin(shell);
  return { doc, body, table, boxes, nodes, tail, empty, shell, edit };
}
/** Selects the real middle column without selecting neighboring columns. @param f - Owners. @returns Displayed table owner. */
function column(f: ReturnType<typeof fixture>) {
  selectTableRow(f.edit, required(f.nodes[1]).GetIndex());
  const display = f.shell.getShellCursor() as SwTableCursor;
  display.GetPoint().Assign(required(f.nodes[1]), 0);
  display.GetMark().Assign(f.empty, 0);
  f.shell.NotifySelectionChanged();
  return display;
}
it("native circular owners attach traverse detach and retain registered endpoints", /** Checks actual table selection behavior.  @returns Operation result. */ () => {
  const f = fixture(),
    p = new SwPosition(f.body, 1),
    first = new SwCursor(p),
    second = first.Create(first),
    third = first.Create(first);
  p.Dispose();
  expect([...first.GetRingContainer()]).toEqual([first, second, third]);
  expect(first.GetPrev()).toBe(third);
  expect(third.GetNext()).toBe(first);
  expect(first.IsMultiSelection()).toBe(true);
  second.Dispose();
  expect([...first.GetRingContainer()]).toEqual([first, third]);
  third.Dispose();
  expect(first.GetPrev()).toBe(first);
  expect(first.IsMultiSelection()).toBe(false);
  expect(getWriterSelectedTextRanges(first)).toBeUndefined();
  first.Dispose();
  f.shell.Close();
});
it("default editing cursor materializes complete cell ranges separate from displayed endpoints", /** Checks actual table selection behavior.  @returns Operation result. */ () => {
  const f = fixture(),
    display = column(f),
    editing = f.shell.GetCursor(),
    ranges = [...editing.GetRingContainer()];
  expect(editing).not.toBe(display);
  expect(ranges).toHaveLength(3);
  expect(
    ranges.map(
      /** Checks actual table selection behavior. @param range - Current owner. @returns Operation result. */ (
        range,
      ) => range.GetMark().GetNode(),
    ),
  ).toEqual([f.nodes[1], f.nodes[4], f.nodes[7]]);
  expect(
    ranges.map(
      /** Checks actual table selection behavior. @param range - Current owner. @returns Operation result. */ (
        range,
      ) => range.GetPoint().GetNode(),
    ),
  ).toEqual([f.nodes[1], f.tail, f.empty]);
  expect(
    ranges.map(
      /** Checks actual table selection behavior. @param range - Current owner. @returns Operation result. */ (
        range,
      ) => range.GetMark().GetContentIndex(),
    ),
  ).toEqual([0, 0, 0]);
  expect(
    ranges.map(
      /** Checks actual table selection behavior. @param range - Current owner. @returns Operation result. */ (
        range,
      ) => range.GetPoint().GetContentIndex(),
    ),
  ).toEqual([5, 4, 0]);
  expect(
    getWriterSelectedTextRanges(editing)?.map(
      /** Checks actual table selection behavior. @param range - Current owner. @returns Operation result. */ (
        range,
      ) => [range.node, range.start, range.end],
    ),
  ).toEqual([
    [f.nodes[1], 0, 5],
    [f.nodes[4], 0, 5],
    [f.tail, 0, 4],
    [f.nodes[7], 0, 5],
  ]);
  expect(display.GetPoint().GetNode()).toBe(f.nodes[1]);
  expect(display.GetPoint().GetContentIndex()).toBe(0);
  expect(display.GetMark().GetNode()).toBe(f.empty);
  expect(display.IsChgd()).toBe(false);
  expect(display.IsCursorMovedUpdate()).toBe(false);
  expect(f.shell.GetCursor()).toBe(editing);
  expect(f.shell.GetCursor(false)).toBe(editing);
  expect(display.MakeBoxSels(editing)).toBe(editing);
  f.edit.SetSelection({ point: { nodeIndex: f.body.GetIndex(), contentIndex: 1 } });
  expect(f.shell.GetCursor().IsMultiSelection()).toBe(false);
  expect(f.shell.getShellCursor()).toBe(f.shell.GetCursor());
  expect(f.shell.HasBoxSelection()).toBe(false);
  f.shell.Close();
});
it("retains matching full-cell cursors and removes deselected or newly empty selections", /** Checks actual table selection behavior.  @returns Operation result. */ () => {
  const f = fixture(),
    display = column(f),
    editing = f.shell.GetCursor(),
    middle = required([...editing.GetRingContainer()][1]);
  display.GetPoint().Assign(required(f.nodes[4]), 1);
  display.GetMark().Assign(f.tail, 2);
  f.shell.NotifySelectionChanged();
  const retained = f.shell.GetCursor();
  expect(retained).toBe(middle);
  expect([...retained.GetRingContainer()]).toEqual([middle]);
  expect(retained.GetMark().GetNode()).toBe(f.nodes[4]);
  expect(retained.GetMark().GetContentIndex()).toBe(0);
  expect(retained.GetPoint().GetNode()).toBe(f.tail);
  expect(retained.GetPoint().GetContentIndex()).toBe(4);
  display.ActualizeSelection([]);
  expect(display.MakeBoxSels(retained)).toBe(retained);
  expect(retained.HasMark()).toBe(false);
  expect(display.IsChgd()).toBe(false);
  f.shell.Close();
});
it("false refresh keeps represented selected boxes until default endpoint refresh", /** Checks actual table selection behavior.  @returns Operation result. */ () => {
  const f = fixture(),
    display = column(f),
    editing = f.shell.GetCursor();
  display.GetPoint().Assign(required(f.nodes[0]), 0);
  expect(f.shell.GetCursor(false)).toBe(editing);
  expect([...editing.GetRingContainer()]).toHaveLength(3);
  expect([...f.shell.GetCursor().GetRingContainer()]).toHaveLength(6);
  expect(display.GetSelectedBoxes()).toEqual([
    f.boxes[0],
    f.boxes[1],
    f.boxes[3],
    f.boxes[4],
    f.boxes[6],
    f.boxes[7],
  ]);
  f.shell.Close();
});
it("mixed native rings ignore collapsed owners without expanding selected text", /** Checks native marked and collapsed ownership. @returns Nothing. */ () => {
  const f = fixture(),
    position = new SwPosition(f.body, 1),
    selected = new SwCursor(position),
    collapsed = selected.Create(selected);
  position.Dispose();
  selected.SetMark();
  selected.GetPoint().Assign(f.body, 3);
  expect(getWriterSelectedTextRanges(selected)).toEqual([{ node: f.body, start: 1, end: 3 }]);
  expect(collapsed.HasMark()).toBe(false);
  collapsed.Dispose();
  selected.Dispose();
  f.shell.Close();
});
it("dirty duplicate boxes retain selected owners and detach an unrelated marked range", /** Checks native dirty reconciliation. @returns Nothing. */ () => {
  const f = fixture(),
    display = column(f),
    editing = f.shell.GetCursor(),
    selected = [...editing.GetRingContainer()],
    unrelated = editing.Create(editing);
  unrelated.GetPoint().Assign(f.body, 1);
  unrelated.SetMark();
  unrelated.GetPoint().Assign(f.body, 3);
  display.InsertBox(required(f.boxes[1]));
  expect(display.IsChgd()).toBe(true);
  expect(display.GetSelectedBoxesCount()).toBe(3);
  expect(display.MakeBoxSels(editing)).toBe(editing);
  expect([...editing.GetRingContainer()]).toEqual(selected);
  expect(unrelated.GetNext()).toBe(unrelated);
  expect(display.IsChgd()).toBe(false);
  f.shell.Close();
});
describe("native table character ring history", /** Checks actual table selection behavior.  @returns Operation result. */ () => {
  it.each(["bold", "italic"] as const)(
    "formats full selected cells with %s and one history unit",
    /** Checks actual table selection behavior. @param format - Current owner. @returns Operation result. */ (
      format,
    ) => {
      const f = fixture(),
        display = column(f),
        point = display.GetPoint().GetNode(),
        mark = display.GetMark().GetNode();
      expect(f.shell.ToggleCharacterFormat(format)).toBe(true);
      for (const node of [required(f.nodes[1]), required(f.nodes[4]), f.tail, required(f.nodes[7])])
        expect(node.GetTextRangeFormatState(0, node.Len(), format)).toBe("on");
      for (const i of [0, 2, 3, 5, 6, 8])
        expect(required(f.nodes[i]).GetTextRangeFormatState(0, 5, format)).toBe("off");
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      expect(f.shell.HasBoxSelection()).toBe(true);
      expect(f.shell.getShellCursor().GetPoint().GetNode()).toBe(point);
      expect(f.shell.getShellCursor().GetMark().GetNode()).toBe(mark);
      expect(f.shell.Undo()).toBe(true);
      expect(f.shell.HasBoxSelection()).toBe(true);
      expect([...f.shell.GetCursor().GetRingContainer()]).toHaveLength(3);
      for (const node of [required(f.nodes[1]), required(f.nodes[4]), f.tail, required(f.nodes[7])])
        expect(node.GetTextRangeFormatState(0, node.Len(), format)).toBe("off");
      expect(f.shell.Redo()).toBe(true);
      for (const node of [required(f.nodes[1]), required(f.nodes[4]), f.tail, required(f.nodes[7])])
        expect(node.GetTextRangeFormatState(0, node.Len(), format)).toBe("on");
      expect(f.shell.getShellCursor().GetPoint().GetNode()).toBe(point);
      expect(f.shell.getShellCursor().GetMark().GetNode()).toBe(mark);
      expect(f.shell.HasBoxSelection()).toBe(true);
      f.shell.Close();
    },
  );
  it.each(["family", "size", "color", "highlight"] as const)(
    "applies %s to full native selected cell text and restores history",
    /** Checks actual table selection behavior. @param property - Current owner. @returns Operation result. */ (
      property,
    ) => {
      const f = fixture();
      column(f);
      expect(
        property === "family"
          ? f.shell.SetFontFamily("Liberation Sans")
          : property === "size"
            ? f.shell.SetFontSize(18)
            : f.shell.SetCharacterColor(property === "color" ? "color" : "highlight", "#123456"),
      ).toBe(true);
      const value =
        /** Checks actual table selection behavior. @param node - Current owner. @returns Operation result. */ (
          node: typeof f.body,
        ) => projectWriterCharacterAttributes(node.GetCharacterItemsAt(1));
      for (const node of [
        required(f.nodes[1]),
        required(f.nodes[4]),
        f.tail,
        required(f.nodes[7]),
      ]) {
        const attributes = value(node);
        expect(
          property === "family"
            ? attributes.fontFamily
            : property === "size"
              ? attributes.fontSizeTwips
              : attributes[property],
        ).toBe(property === "family" ? "Liberation Sans" : property === "size" ? 360 : "#123456");
      }
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      expect(f.shell.Undo()).toBe(true);
      expect(f.shell.HasBoxSelection()).toBe(true);
      expect(f.shell.Redo()).toBe(true);
      expect(f.shell.HasBoxSelection()).toBe(true);
      expect(required(f.nodes[0]).GetText()).toBe("Cell0");
      expect(value(required(f.nodes[0]))).not.toEqual(value(required(f.nodes[1])));
      f.shell.Close();
    },
  );
});
