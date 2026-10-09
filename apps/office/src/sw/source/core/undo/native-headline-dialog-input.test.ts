/** @fileoverview Verifies shell headline input capture, original owners and real native history. */
import { expect, it, vi } from "vitest";
import { SwClient } from "../../../inc/calbck";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwPosition } from "../crsr/pam";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { TableParamToItemSet, ItemSetToTableParam } from "../../uibase/shells/tabsh";
import { SwTextFlowPage } from "../../ui/table/tabledlg";
import { SwTabFrame, SwRowFrame, SwCellFrame } from "../layout/tabfrm";
/** Requires an original native owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native headline input owner");
  return value;
}
it.each([false, true])(
  "shell captures headline before temporary whole-table selection selected=%s",
  /** Checks source selection boundary and three original-owner history cycles. @param selected - Existing row selection. @returns Nothing. */ (
    selected,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    let frame: SwTabFrame | undefined;
    try {
      expect(TableParamToItemSet(shell).GetItemIfSet(21150, false)).toBeUndefined();
      const table = doc.nodes.MakeTableNode("HeadlineInputHistory", {
        width: 3000,
        headerRows: 2,
        repeatHeaderRows: true,
      });
      table.AddColumnWidth(3000);
      for (let row = 0; row < 3; row++) doc.nodes.AppendTableRow(table, 1);
      const rows = [...table.GetTabLines()],
        first = required(rows[0]),
        box = required(first.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]);
      node.SetText("Original headline capture and history");
      const position = new SwPosition(node, 3);
      shell.SetCursor(position);
      position.Dispose();
      if (selected) expect(shell.SelectTableRow()).toBe(true);
      const cursor = shell.CaptureCursorState(),
        originalCursor = shell.GetCursor(),
        selectedBoxes = [...shell.GetTableSel()],
        count = doc.nodes.entries().length,
        nativeGet = table.GetRowsToRepeat.bind(table);
      const spy = vi.spyOn(table, "GetRowsToRepeat").mockImplementation(
        /** Observes actual source pre-selection capture and delegates to original owner. @returns Native count. */ () => {
          expect(shell.IsTableMode()).toBe(selected);
          expect(shell.GetTableSel()).toEqual(selectedBoxes);
          return nativeGet();
        },
      );
      const input = TableParamToItemSet(shell);
      expect(spy).toHaveBeenCalledOnce();
      spy.mockRestore();
      const item = required(input.GetItemIfSet(21150, false)) as SfxUInt16Item;
      expect(item).toBeInstanceOf(SfxUInt16Item);
      expect(item.GetValue()).toBe(2);
      expect(shell.GetCursor()).toBe(originalCursor);
      expect(shell.CaptureCursorState()).toEqual(cursor);
      expect(shell.GetTableSel()).toEqual(selectedBoxes);
      const page = new SwTextFlowPage(table, undefined, input),
        output = new SfxItemSet(doc.GetAttrPool(), [[1, 32767]]);
      page.ValueChangedHdl(1);
      page.FillItemSet(output);
      frame = new SwTabFrame(table);
      const row = required(frame.Lower()) as SwRowFrame,
        cell = required(row.Lower()) as SwCellFrame;
      doc.GetUndoManager().Clear();
      expect(ItemSetToTableParam(shell, output)).toBe(true);
      expect(table.GetRowsToRepeat()).toBe(1);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(shell.Undo()).toBe(true);
        expect(table.GetRowsToRepeat()).toBe(2);
        expect(shell.Redo()).toBe(true);
        expect(table.GetRowsToRepeat()).toBe(1);
        expect(table.GetTabLines()).toEqual(rows);
        expect(row.GetTabLine()).toBe(first);
        expect(cell.GetTabBox()).toBe(box);
        expect(cell.GetFormat()).toBe(box.GetFrameFormat());
        expect(cell.FindTabFrame()).toBe(frame);
        expect(box.GetParagraphs()[0]).toBe(node);
        expect(node.GetText()).toBe("Original headline capture and history");
        expect(doc.nodes.entries()).toHaveLength(count);
        expect(shell.GetCursor()).toBe(originalCursor);
        expect(shell.CaptureCursorState()).toEqual(cursor);
        expect(shell.GetTableSel()).toEqual(selectedBoxes);
      }
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      expect(item.GetValue()).toBe(2);
    } finally {
      vi.restoreAllMocks();
      frame?.DestroyImpl();
      session.Close();
    }
  },
);
it("shell captures native getter cap and disabled headline without draft projection", /** Checks original getter semantics and detached item ownership. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = doc.nodes.MakeTableNode("CappedHeadline", {
      headerRows: 9,
      repeatHeaderRows: true,
    });
    const row = doc.nodes.AppendTableRow(table, 1),
      node = required(row.GetTabBoxes()[0]?.GetParagraphs()[0]),
      position = new SwPosition(node, 0);
    shell.SetCursor(position);
    position.Dispose();
    const original = required(
      TableParamToItemSet(shell).GetItemIfSet(21150, false),
    ) as SfxUInt16Item;
    expect(original.GetValue()).toBe(1);
    table.SetRowsToRepeat(0);
    expect(
      (required(TableParamToItemSet(shell).GetItemIfSet(21150, false)) as SfxUInt16Item).GetValue(),
    ).toBe(0);
    expect(original.GetValue()).toBe(1);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  } finally {
    session.Close();
  }
});

it("native row and cell name broadcasts retain headline capture and original owners", /** Checks actual table-owned format notifications rather than calling protected overrides. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  const observers: SwClient[] = [];
  try {
    const table = doc.nodes.MakeTableNode("HeadlineNamedOwners", {
        headerRows: 1,
        repeatHeaderRows: true,
      }),
      row = doc.nodes.AppendTableRow(table, 1),
      box = required(row.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]),
      position = new SwPosition(node, 0);
    shell.SetCursor(position);
    position.Dispose();
    const input = TableParamToItemSet(shell),
      cursor = shell.CaptureCursorState(),
      rowHints: unknown[] = [],
      cellHints: unknown[] = [],
      formats = [row.GetFrameFormat(), box.GetFrameFormat()];
    for (const [index, format] of formats.entries()) {
      const hints = index === 0 ? rowHints : cellHints;
      const observer = new SwClient(
        /** Observes original owner publication. @param source - Actual native format. @param hint - Native notification. @returns Nothing. */ (
          source,
          hint,
        ) => {
          expect(source).toBe(format);
          hints.push(hint);
        },
      );
      observer.RegisterToModify(format);
      observers.push(observer);
      format.SetFormatName(index === 0 ? "Source row owner" : "Source cell owner", true);
      expect(hints).toEqual([{ kind: "format-inheritance-changed", formatId: format.GetName() }]);
    }
    expect(row.GetFrameFormat()).toBe(formats[0]);
    expect(box.GetFrameFormat()).toBe(formats[1]);
    expect(row.GetTabBoxes()).toEqual([box]);
    expect(box.GetParagraphs()[0]).toBe(node);
    expect(table.GetRowsToRepeat()).toBe(1);
    expect((required(input.GetItemIfSet(21150, false)) as SfxUInt16Item).GetValue()).toBe(1);
    expect(shell.CaptureCursorState()).toEqual(cursor);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  } finally {
    for (const observer of observers) observer.Dispose();
    session.Close();
  }
});
