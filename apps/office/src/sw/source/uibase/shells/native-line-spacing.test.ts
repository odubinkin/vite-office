/** @fileoverview Complete native line-spacing slot items, actual history and ODT, replacing percentage-only state. */
import { expect, it } from "vitest";
import { SwPosition } from "../../core/crsr/pam";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { ParaLineSpacingControl as Control } from "../../../../svx/source/sidebar/paragraph/ParaLineSpacingControl";
import { RES_PARATR_LINESPACING } from "../../../inc/hintids";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";
it("dispatches all eight original native item modes, retains typed inactive fields and restores actual history", /** Uses actual view, shell, native items and package. @returns Completion. */ async () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell();
  try {
    shell.Insert("Native interval");
    for (let mode = 0; mode < 8; mode++) {
      const item = new SvxLineSpacingItem(200, 10033);
      Control.SetLineSpace(item, mode, mode === 4 ? 137 : 420);
      const baseline = (
        shell.GetActiveParagraph().GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem
      ).Clone();
      session.view.Execute(".uno:LineSpacing", [item]);
      const state = session.view.QueryState(".uno:LineSpacing").value as SvxLineSpacingItem;
      expect(state).toBeInstanceOf(SvxLineSpacingItem);
      expect(state.Which()).toBe(10033);
      expect(state.equals(item)).toBe(true);
      if (!baseline.equals(item)) {
        shell.Undo();
        expect(
          (shell.GetActiveParagraph().GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem).equals(
            baseline,
          ),
        ).toBe(true);
        shell.Redo();
      }
      const original = item.Which();
      expect(original).toBe(10033);
      const bytes = await writeOdtDocument(shell.GetDoc(), { title: "Native interval" });
      const loaded = await readOdtDocument(bytes, { title: "Spacing" });
      try {
        expect(
          (
            loaded.document.paragraphs[0]?.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem
          ).equals(item),
        ).toBe(true);
      } finally {
        loaded.document.Dispose();
      }
    }
    expect(session.view.Execute(".uno:LineSpacing")).toMatchObject({ value: false });
  } finally {
    session.Close();
  }
});

it("uses actual uniform and mixed paragraph states and native selected table-cell ranges with one history action", /** Native item state drives mixed popup state and selected paragraph application. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell(),
    doc = shell.GetDoc();
  try {
    const first = doc.paragraphs[0] as SwTextNode,
      second = doc.nodes.MakeTextNode("second");
    first.SetText("first");
    const left = new SvxLineSpacingItem(200, RES_PARATR_LINESPACING),
      right = left.Clone();
    right.SetPropLineSpace(150);
    first.SetAttr(left);
    second.SetAttr(right);
    const point = new SwPosition(second, second.Len()),
      mark = new SwPosition(first, 0);
    shell.SetPaM(point, mark);
    point.Dispose();
    mark.Dispose();
    expect(session.view.QueryState(".uno:LineSpacing")).toMatchObject({
      mixed: true,
      value: undefined,
    });
    const item = new SvxLineSpacingItem(400, RES_PARATR_LINESPACING);
    item.SetLineHeight(400);
    const count = doc.GetUndoManager().GetUndoActionCount();
    expect(session.view.Execute(".uno:LineSpacing", [item])).toMatchObject({ value: true });
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(count + 1);
    expect(
      (session.view.QueryState(".uno:LineSpacing").value as SvxLineSpacingItem).GetLineHeight(),
    ).toBe(400);
    shell.Undo();
    expect(session.view.QueryState(".uno:LineSpacing").mixed).toBe(true);
    shell.Redo();
    expect(item.Which()).toBe(RES_PARATR_LINESPACING);
    const table = doc.nodes.MakeTableNode("Spacing table");
    table.AddColumnWidth(2000);
    table.AddColumnWidth(2000);
    const row = doc.nodes.AppendTableRow(table, 2),
      cells = row
        .GetTabBoxes()
        .map(
          /** Borrows original table text. @param box - Real cell. @returns Its paragraph. */ (
            box,
          ) => box.GetParagraphs()[0] as SwTextNode,
        );
    (cells[0] as SwTextNode).SetAttr(left);
    (cells[1] as SwTextNode).SetAttr(right);
    const position = new SwPosition(cells[0] as SwTextNode, 0);
    shell.SetCursor(position);
    position.Dispose();
    expect(shell.SelectTableRow()).toBe(true);
    expect(session.view.QueryState(".uno:LineSpacing").mixed).toBe(true);
    const before = doc.GetUndoManager().GetUndoActionCount();
    session.view.Execute(".uno:LineSpacing", [item]);
    expect(
      cells.map(
        /** Reads real cell paragraph height. @param cell - Original text owner. @returns Height. */ (
          cell,
        ) => (cell.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem).GetLineHeight(),
      ),
    ).toEqual([400, 400]);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(before + 1);
    expect(shell.IsTableMode()).toBe(true);
    shell.Undo();
    expect(session.view.QueryState(".uno:LineSpacing").mixed).toBe(true);
  } finally {
    session.Close();
  }
});
