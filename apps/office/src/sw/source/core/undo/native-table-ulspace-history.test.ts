/** @fileoverview Verifies native spacing ItemSet application and complete original attribute history without scalar replay. */
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SvxULSpaceItem } from "../../../../editeng/source/items/frmitems";
import { RES_UL_SPACE } from "../../../inc/hintids";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { ItemSetToTableParam, TableParamToItemSet } from "../../uibase/shells/tabsh";
import { SwFrameFormat } from "../layout/atrfrm";
/** Requires the original owner. @param value - Possible native owner. @returns Native owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing original UL history owner");
  return value;
}
it.each([false, true])(
  "native UL ItemSet/history retains complete item inherited=%s",
  /** Checks three actual native cycles with graph/list/cursor ownership. @param inherited - Parent input. @returns Nothing. */ (
    inherited,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    let parent: SwFrameFormat | undefined;
    try {
      const table = doc.nodes.MakeTableNode("SpacingHistory", { width: 3000 }),
        format = table.GetFrameFormat();
      table.AddColumnWidth(3000);
      const row = doc.nodes.AppendTableRow(table, 1),
        box = required(row.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]);
      node.SetText("Original bulleted cell");
      shell.FocusNode(node);
      shell.SetParagraphListKind("bullet");
      const before = new SvxULSpaceItem(120, 240, RES_UL_SPACE, true);
      if (inherited) {
        parent = new SwFrameFormat(doc.GetAttrPool(), "Parent");
        parent.SetFormatAttr(before);
        format.SetDerivedFrom(parent);
      } else format.SetFormatAttr(before);
      const input = TableParamToItemSet(shell),
        inputItem = input.Get(RES_UL_SPACE) as SvxULSpaceItem;
      expect(inputItem).toEqual(before);
      expect(inputItem).not.toBe(format.GetULSpace());
      const width = format.GetFrameSize().Clone(),
        cursor = shell.GetCursor(),
        nodes = [...doc.nodes.entries()],
        list = node.GetListId();
      doc.GetUndoManager().Clear();
      const item = new SvxULSpaceItem(360, 480, RES_UL_SPACE, true),
        output = new SfxItemSet(doc.GetAttrPool(), [[RES_UL_SPACE, RES_UL_SPACE]]),
        setFormat = vi.spyOn(table, "SetFormat");
      output.Put(item);
      try {
        expect(ItemSetToTableParam(shell, output)).toBe(true);
        expect(setFormat).not.toHaveBeenCalled();
        expect(format.GetULSpace().QueryValue()).toEqual([360, 480, 1]);
        expect(format.GetFrameSize()).toEqual(width);
        expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
        for (let cycle = 0; cycle < 3; cycle++) {
          expect(shell.Undo()).toBe(true);
          expect(format.GetULSpace()).toEqual(before);
          expect(format.GetAttrSet().GetItemIfSet(RES_UL_SPACE, false) === undefined).toBe(
            inherited,
          );
          expect(shell.Redo()).toBe(true);
          expect(format.GetULSpace()).toEqual(item);
          expect(format.GetFrameSize()).toEqual(width);
          expect(table.GetFrameFormat()).toBe(format);
          expect(table.GetRegisteredIn()).toBe(format);
          expect(table.GetTabLines()[0]).toBe(row);
          expect(row.GetTabBoxes()[0]).toBe(box);
          expect(box.GetParagraphs()[0]).toBe(node);
          expect(node.GetText()).toBe("Original bulleted cell");
          expect(node.GetListId()).toBe(list);
          expect(shell.GetCursor()).toBe(cursor);
          expect(doc.nodes.entries()).toEqual(nodes);
        }
        expect(item.QueryValue()).toEqual([360, 480, 1]);
        expect(inputItem).toEqual(before);
        expect(output.Get(RES_UL_SPACE)).toEqual(item);
      } finally {
        setFormat.mockRestore();
      }
    } finally {
      session.Close();
      parent?.DisposeModify();
    }
  },
);
it("native item set rejects a body cursor and preserves empty document history", /** Checks actual SetTableAttr cursor admission. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  try {
    const doc = session.docShell.GetDoc(),
      input = new SfxItemSet(doc.GetAttrPool(), [[RES_UL_SPACE, RES_UL_SPACE]]);
    input.Put(new SvxULSpaceItem(30, 60, RES_UL_SPACE));
    expect(session.view.GetWrtShell().SetTableAttr(input)).toBe(false);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  } finally {
    session.Close();
  }
});
