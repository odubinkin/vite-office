/** @fileoverview Verifies complete original horizontal item history and native table-representation orientation/size delivery. */
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwFormatHoriOrient } from "../../../inc/fmtornt";
import { RES_HORI_ORIENT, RES_FRM_SIZE } from "../../../inc/hintids";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwFrameFormat } from "../layout/atrfrm";
import { SwPtrItem } from "../../uibase/utlui/uiitems";
import { FN_TABLE_REP } from "../../../inc/cmdid";
import { SwTableRep } from "../../uibase/table/swtablerep";
import { ItemSetToTableParam } from "../../uibase/shells/tabsh";
/** Requires the original graph owner. @param value - Owner. @returns Present owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing horizontal history owner");
  return value;
}
it.each([false, true])(
  "complete original horizontal native history inherited=%s",
  /** Checks three actual cycles and original text/list/client/cursor identities. @param inherited - Parent input. @returns Nothing. */ (
    inherited,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    let parent: SwFrameFormat | undefined;
    try {
      const table = doc.nodes.MakeTableNode("NativeHoriHistory", { width: 3000 }),
        format = table.GetFrameFormat();
      table.AddColumnWidth(3000);
      const row = doc.nodes.AppendTableRow(table, 1),
        box = required(row.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]);
      node.SetText("Original list cell");
      shell.FocusNode(node);
      shell.SetParagraphListKind("bullet");
      const before = new SwFormatHoriOrient(41, 3, 7, true);
      if (inherited) {
        parent = new SwFrameFormat(doc.GetAttrPool(), "Parent");
        parent.SetFormatAttr(before);
        format.SetDerivedFrom(parent);
        format.ResetFormatAttr(RES_HORI_ORIENT);
      } else format.SetFormatAttr(before);
      const cursor = shell.GetCursor(),
        nodes = [...doc.nodes.entries()],
        list = node.GetListId(),
        width = format.GetFrameSize().Clone();
      doc.GetUndoManager().Clear();
      const after = new SwFormatHoriOrient(-72, 1, 8, false),
        set = new SfxItemSet(doc.GetAttrPool(), [[RES_HORI_ORIENT, RES_HORI_ORIENT]]),
        scalar = vi.spyOn(table, "SetFormat");
      set.Put(after);
      expect(shell.SetTableAttr(set)).toBe(true);
      expect(scalar).not.toHaveBeenCalled();
      expect(format.GetHoriOrient()).toEqual(after);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(shell.Undo()).toBe(true);
        expect(format.GetHoriOrient()).toEqual(before);
        expect(format.GetAttrSet().GetItemIfSet(RES_HORI_ORIENT, false) === undefined).toBe(
          inherited,
        );
        expect(shell.Redo()).toBe(true);
        expect(format.GetHoriOrient()).toEqual(after);
        expect(format.GetFrameSize()).toEqual(width);
        expect(table.GetRegisteredIn()).toBe(format);
        expect(table.GetTabLines()[0]).toBe(row);
        expect(row.GetTabBoxes()[0]).toBe(box);
        expect(box.GetParagraphs()[0]).toBe(node);
        expect(node.GetText()).toBe("Original list cell");
        expect(node.GetListId()).toBe(list);
        expect(shell.GetCursor()).toBe(cursor);
        expect(doc.nodes.entries()).toEqual(nodes);
      }
      scalar.mockRestore();
      expect(after.GetPos()).toBe(-72);
      expect(set.Get(RES_HORI_ORIENT)).toEqual(after);
    } finally {
      session.Close();
      parent?.DisposeModify();
    }
  },
);
it("native dialog representation applies orientation and size as owned native items", /** Checks original shell native payload and original pointer ownership. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  try {
    const doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell(),
      table = doc.nodes.MakeTableNode("NativeDialogHori", { width: 3000 }),
      format = table.GetFrameFormat();
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1);
    shell.FocusNode(required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]));
    format.SetFormatAttr(new SwFormatHoriOrient(41, 3, 7, true));
    const rep = new SwTableRep(table, 6000),
      input = new SfxItemSet(doc.GetAttrPool(), [[FN_TABLE_REP, FN_TABLE_REP]]),
      apply = vi.spyOn(shell, "SetTableAttr");
    rep.align = 1;
    rep.width = 4500;
    rep.left = 1500;
    rep.right = 0;
    input.Put(new SwPtrItem(FN_TABLE_REP, rep));
    expect(ItemSetToTableParam(shell, input)).toBe(true);
    const native = apply.mock.calls
      .map(
        /** Reads actual native calls. @param call - Shell input. @returns Native payload. */ (
          call,
        ) => call[0],
      )
      .find(
        /** Identifies represented original horizontal items. @param value - Shell input. @returns Whether native owner payload. */ (
          value,
        ) =>
          value instanceof SfxItemSet && value.GetItemIfSet(RES_HORI_ORIENT, false) !== undefined,
      ) as SfxItemSet;
    expect(native.GetItemIfSet(RES_FRM_SIZE, false)).toBeDefined();
    expect(format.GetFrameSize().GetWidth()).toBe(4500);
    expect(table.GetColumnWidths()).toEqual([4500]);
    expect(table.GetTabLines()[0]).toBe(row);
    expect([
      format.GetHoriOrient().GetPos(),
      format.GetHoriOrient().GetHoriOrient(),
      format.GetHoriOrient().GetRelationOrient(),
      format.GetHoriOrient().IsPosToggle(),
    ]).toEqual([0, 1, 1, false]);
    expect((input.Get(FN_TABLE_REP) as SwPtrItem).GetValue()).toBe(rep);
    apply.mockRestore();
  } finally {
    session.Close();
  }
});
