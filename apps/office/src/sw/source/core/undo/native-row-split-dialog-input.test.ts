/** @fileoverview Verifies shell source selection capture and native row-split history with original cursor/frame owners. */
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwPosition } from "../crsr/pam";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { TableParamToItemSet, ItemSetToTableParam } from "../../uibase/shells/tabsh";
import { SwTextFlowPage } from "../../ui/table/tabledlg";
import { SwTabFrame, SwRowFrame, SwCellFrame } from "../layout/tabfrm";
/** Requires an original native owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native row capture owner");
  return value;
}
it.each([false, true])(
  "shell captures original rows inside source selection before restoring cursors selected=%s",
  /** Checks whole temporary selection and retained native subset through three history cycles. @param selected - Existing first-row selection. @returns Nothing. */ (
    selected,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    let frame: SwTabFrame | undefined;
    try {
      const table = doc.nodes.MakeTableNode("RowInputHistory", { width: 3000 });
      table.AddColumnWidth(3000);
      const first = doc.nodes.AppendTableRow(table, 1, { rowSplit: new SwFormatRowSplit(false) }),
        last = doc.nodes.AppendTableRow(table, 1, { rowSplit: new SwFormatRowSplit(true) }),
        box = required(first.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]);
      node.SetText("Original row-split input history");
      const position = new SwPosition(node, 3);
      shell.SetCursor(position);
      position.Dispose();
      if (selected) expect(shell.SelectTableRow()).toBe(true);
      const cursor = shell.CaptureCursorState(),
        originalCursor = shell.GetCursor(),
        selectedBoxes = [...shell.GetTableSel()],
        rows = [...table.GetTabLines()],
        count = doc.nodes.entries().length,
        nativeGet = shell.GetRowSplit.bind(shell),
        scopes: unknown[][] = [];
      const spy = vi.spyOn(shell, "GetRowSplit").mockImplementation(
        /** Observes actual native selection and delegates to original common-item aggregation. @returns Original item or mixed absence. */ () => {
          expect(shell.IsTableMode()).toBe(true);
          scopes.push([...shell.GetTableSel()]);
          return nativeGet();
        },
      );
      const input = TableParamToItemSet(shell);
      spy.mockRestore();
      expect(scopes).toHaveLength(1);
      expect(scopes[0]).toEqual(selected ? [box] : [box, required(last.GetTabBoxes()[0])]);
      expect((input.GetItemIfSet(129, false) as SwFormatRowSplit | undefined)?.GetValue()).toBe(
        selected ? false : undefined,
      );
      expect(shell.GetCursor()).toBe(originalCursor);
      expect(shell.CaptureCursorState()).toEqual(cursor);
      expect(shell.GetTableSel()).toEqual(selectedBoxes);
      expect(shell.IsTableMode()).toBe(selected);
      const page = new SwTextFlowPage(table, undefined, input),
        output = new SfxItemSet(doc.GetAttrPool(), [[1, 32767]]);
      expect(page.GetRowSplitState()).toBe(selected ? false : undefined);
      page.SetRowSplitState(true);
      page.FillItemSet(output);
      expect(output.GetItemIfSet(129, false)).toBeInstanceOf(SwFormatRowSplit);
      frame = new SwTabFrame(table);
      const row = required(frame.Lower()) as SwRowFrame,
        cell = required(row.Lower()) as SwCellFrame;
      doc.GetUndoManager().Clear();
      expect(ItemSetToTableParam(shell, output)).toBe(true);
      expect(first.GetRowSplit().GetValue()).toBe(true);
      expect(last.GetRowSplit().GetValue()).toBe(true);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(shell.Undo()).toBe(true);
        expect(first.GetRowSplit().GetValue()).toBe(false);
        expect(last.GetRowSplit().GetValue()).toBe(true);
        expect(shell.Redo()).toBe(true);
        expect(first.GetRowSplit().GetValue()).toBe(true);
        expect(last.GetRowSplit().GetValue()).toBe(true);
        expect(table.GetTabLines()).toEqual(rows);
        expect(row.GetTabLine()).toBe(first);
        expect(cell.GetTabBox()).toBe(box);
        expect(cell.GetFormat()).toBe(box.GetFrameFormat());
        expect(cell.FindTabFrame()).toBe(frame);
        expect(box.GetParagraphs()[0]).toBe(node);
        expect(node.GetText()).toBe("Original row-split input history");
        expect(doc.nodes.entries()).toHaveLength(count);
        expect(shell.CaptureCursorState()).toEqual(cursor);
        expect(shell.GetTableSel()).toEqual(selectedBoxes);
      }
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    } finally {
      vi.restoreAllMocks();
      frame?.DestroyImpl();
      session.Close();
    }
  },
);
it.each([undefined, false, true])(
  "shell captures default and uniform original row items value=%s",
  /** Checks optional common-item native branch and borrowed item independence. @param value - Native authored bool or pool default. @returns Nothing. */ (
    value,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    try {
      expect(TableParamToItemSet(shell).GetItemIfSet(129, false)).toBeUndefined();
      const table = doc.nodes.MakeTableNode("UniformNativeRows");
      table.AddColumnWidth(3000);
      const rows = [
          doc.nodes.AppendTableRow(
            table,
            1,
            value === undefined ? {} : { rowSplit: new SwFormatRowSplit(value) },
          ),
          doc.nodes.AppendTableRow(
            table,
            1,
            value === undefined ? {} : { rowSplit: new SwFormatRowSplit(value) },
          ),
        ],
        node = required(rows[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]);
      const position = new SwPosition(node, 0);
      shell.SetCursor(position);
      position.Dispose();
      const cursor = shell.CaptureCursorState(),
        item = required(TableParamToItemSet(shell).GetItemIfSet(129, false)) as SwFormatRowSplit;
      expect(item).toBeInstanceOf(SwFormatRowSplit);
      expect(item.GetValue()).toBe(value ?? true);
      expect(item).not.toBe(rows[0]?.GetRowSplit());
      expect(shell.CaptureCursorState()).toEqual(cursor);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    } finally {
      session.Close();
    }
  },
);
