/** @fileoverview Verifies native LR table attribute history and original geometry ItemSet dialog dispatch. */
import { SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SvxLRSpaceItem } from "../../../../editeng/source/items/frmitems";
import { RES_LR_SPACE } from "../../../inc/hintids";
import { SwFrameFormat } from "../layout/atrfrm";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwPtrItem } from "../../uibase/utlui/uiitems";
import { FN_TABLE_REP } from "../../../inc/cmdid";
import { SwTableRep } from "../../uibase/table/swtablerep";
import { ItemSetToTableParam } from "../../uibase/shells/tabsh";
/** Requires original native ownership. @param value - Candidate. @returns Present owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing original LR owner");
  return value;
}
it.each([false, true])(
  "complete original table LR history inherited=%s",
  /** Checks three real original graph history cycles. @param inherited - Native parent. @returns Nothing. */ (
    inherited,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell(),
      parent = new SwFrameFormat(doc.GetAttrPool(), "Parent");
    try {
      const table = doc.nodes.MakeTableNode("NativeLRHistory", { width: 3000, horiOrient: 0 }),
        format = table.GetFrameFormat();
      table.AddColumnWidth(3000);
      const row = doc.nodes.AppendTableRow(table, 1),
        box = required(row.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]);
      node.SetText("Original list cell");
      shell.FocusNode(node);
      shell.SetParagraphListKind("bullet");
      const before = new SvxLRSpaceItem(98);
      before.SetLeft(SvxIndentValue.twips(-120));
      before.SetRight(SvxIndentValue.twips(240));
      before.SetGutterMargin(41);
      before.SetRightGutterMargin(73);
      before.SetAutoFirst(true);
      before.SetPropTextFirstLineOffset(80);
      before.SetExplicitZeroMarginValLeft(true);
      if (inherited) {
        parent.SetFormatAttr(before);
        format.SetDerivedFrom(parent);
        format.ResetFormatAttr(98);
      } else format.SetFormatAttr(before);
      const cursor = shell.GetCursor(),
        nodes = [...doc.nodes.entries()],
        list = node.GetListId(),
        after = new SvxLRSpaceItem(98);
      after.SetLeft(SvxIndentValue.twips(400));
      after.SetRight(SvxIndentValue.twips(200));
      const input = new SfxItemSet(doc.GetAttrPool(), [[98, 98]]);
      input.Put(after);
      doc.GetUndoManager().Clear();
      const scalar = vi.spyOn(table, "SetFormat");
      expect(shell.SetTableAttr(input)).toBe(true);
      expect(scalar).not.toHaveBeenCalled();
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(shell.Undo()).toBe(true);
        expect(format.GetLRSpace()).toEqual(before);
        expect(format.GetAttrSet().GetItemIfSet(98, false) === undefined).toBe(inherited);
        expect(shell.Redo()).toBe(true);
        expect(format.GetLRSpace()).toEqual(after);
        expect(table.GetTabLines()[0]).toBe(row);
        expect(row.GetTabBoxes()[0]).toBe(box);
        expect(box.GetParagraphs()[0]).toBe(node);
        expect(node.GetListId()).toBe(list);
        expect(node.GetText()).toBe("Original list cell");
        expect(shell.GetCursor()).toBe(cursor);
        expect(doc.nodes.entries()).toEqual(nodes);
        expect(table.GetRegisteredIn()).toBe(format);
      }
      scalar.mockRestore();
    } finally {
      session.Close();
      parent.DisposeModify();
    }
  },
);
it("original dialog LR, orientation and width use one native geometry ItemSet", /** Checks native dispatch and complete fresh LR context. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  try {
    const doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell(),
      table = doc.nodes.MakeTableNode("NativeLRDialog", { width: 3000, horiOrient: 0 }),
      format = table.GetFrameFormat();
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1);
    shell.FocusNode(required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]));
    const old = new SvxLRSpaceItem(98);
    old.SetGutterMargin(41);
    old.SetAutoFirst(true);
    format.SetFormatAttr(old);
    const rep = new SwTableRep(table, 6000);
    rep.align = 7;
    rep.width = 4000;
    rep.left = 120;
    rep.right = 1880;
    const input = new SfxItemSet(doc.GetAttrPool(), [[FN_TABLE_REP, FN_TABLE_REP]]);
    input.Put(new SwPtrItem(FN_TABLE_REP, rep));
    const calls = vi.spyOn(shell, "SetTableAttr"),
      scalar = vi.spyOn(table, "SetFormat");
    expect(ItemSetToTableParam(shell, input)).toBe(true);
    expect(scalar).not.toHaveBeenCalled();
    expect(calls).toHaveBeenCalledTimes(1);
    const actual = calls.mock.calls[0]?.[0];
    expect(actual).toBeInstanceOf(SfxItemSet);
    expect((actual as SfxItemSet).GetItemIfSet(RES_LR_SPACE, false)).toBeInstanceOf(SvxLRSpaceItem);
    expect([
      format.GetLRSpace().ResolveLeft(),
      format.GetLRSpace().ResolveRight(),
      format.GetLRSpace().GetGutterMargin(),
      format.GetLRSpace().IsAutoFirst(),
      format.GetFrameSize().GetWidth(),
    ]).toEqual([120, 1880, 0, false, 4000]);
    expect(table.GetColumnWidths()).toEqual([4000]);
    expect(table.GetTabLines()[0]).toBe(row);
    scalar.mockRestore();
    calls.mockRestore();
  } finally {
    session.Close();
  }
});
