/** @fileoverview Verifies SaveTable restores original item sets without scalar transport capture or replay. */
import { SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwFrameFormat } from "../layout/atrfrm";
import { SwTabFrame, SwRowFrame, SwCellFrame } from "../layout/tabfrm";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatHoriOrient } from "../../../inc/fmtornt";
import { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import { SvxULSpaceItem, SvxLRSpaceItem } from "../../../../editeng/source/items/frmitems";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwUndoAttrTable } from "./untbl";
/** Requires an original connected owner. @param value - Candidate. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native restore owner");
  return value;
}
it.each([false, true])(
  "restores full native items and graph owners without scalar history inherited=%s",
  /** Exercises actual native attribute capture, swapping and paint clients. @param inherited - Parent context. @returns Nothing. */ (
    inherited,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell(),
      parent = new SwFrameFormat(doc.GetAttrPool(), "RestoreParent");
    let frame: SwTabFrame | undefined;
    try {
      const table = doc.nodes.MakeTableNode("NativeRestore", { width: 6000 }),
        format = table.GetFrameFormat();
      table.AddColumnWidth(3000);
      table.AddColumnWidth(3000);
      const row = doc.nodes.AppendTableRow(table, 2),
        box = required(row.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]);
      node.SetText("Original list and selection");
      shell.FocusNode(node);
      shell.SetParagraphListKind("bullet");
      const size = new SwFormatFrameSize(SwFrameSize.Minimum, 6000, 777);
      size.SetWidthSizeType(SwFrameSize.Variable);
      size.SetWidthPercent(75);
      size.SetHeightPercent(37);
      size.SetWidthPercentRelation(3);
      size.SetHeightPercentRelation(4);
      const lr = new SvxLRSpaceItem(98);
      lr.SetLeft(SvxIndentValue.twips(-120));
      lr.SetRight(SvxIndentValue.twips(240));
      lr.SetGutterMargin(31);
      lr.SetRightGutterMargin(47);
      lr.SetAutoFirst(true);
      lr.SetPropTextFirstLineOffset(80);
      lr.SetExplicitZeroMarginValLeft(true);
      const items = [
        size,
        lr,
        new SvxULSpaceItem(120, 240, 99, true),
        new SwFormatHoriOrient(77, 0, 3, true),
        new SwFormatLayoutSplit(false),
        new SfxBoolItem(132, true),
      ];
      const owner = inherited ? parent : format;
      if (inherited) format.SetDerivedFrom(parent);
      for (const item of items) {
        owner.SetFormatAttr(item);
        if (inherited) format.ResetFormatAttr(item.Which());
      }
      table.SetRowsToRepeat(1);
      const nodes = [...doc.nodes.entries()],
        cursor = shell.CaptureCursorState(),
        list = node.GetListId(),
        originalParent = format.DerivedFrom();
      frame = new SwTabFrame(table);
      const physicalRow = frame.Lower() as SwRowFrame,
        physicalCell = physicalRow.Lower() as SwCellFrame;
      const invalidate = vi.spyOn(frame, "InvalidateAll"),
        paint = vi.spyOn(frame, "SetCompletePaint"),
        project = vi.spyOn(table, "GetFormat"),
        replay = vi.spyOn(table, "SetFormat");
      const after = new SfxItemSet(doc.GetAttrPool(), [
        [90, 90],
        [98, 99],
        [110, 110],
        [120, 120],
        [132, 132],
      ]);
      const resized = size.Clone();
      resized.SetWidth(9000);
      after.Put(resized);
      after.Put(new SvxULSpaceItem(360, 480, 99));
      after.Put(new SwFormatLayoutSplit(true));
      doc.GetUndoManager().Clear();
      expect(shell.SetTableAttr(after)).toBe(true);
      expect(doc.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoAttrTable);
      expect(doc.GetUndoManager().GetUndoAction()?.GetPayloadSize()).toBe(4);
      invalidate.mockClear();
      paint.mockClear();
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(shell.Undo()).toBe(true);
        for (const item of items) {
          expect(format.GetAttrSet().Get(item.Which())).toEqual(item);
          expect(format.GetAttrSet().GetItemIfSet(item.Which(), false) === undefined).toBe(
            inherited,
          );
        }
        expect(table.GetColumnWidths()).toEqual([3000, 3000]);
        expect(shell.Redo()).toBe(true);
        expect(format.GetFrameSize()).toEqual(resized);
        expect(ulValues(format.GetULSpace())).toEqual([360, 480]);
        expect(table.GetColumnWidths()).toEqual([4500, 4500]);
        expect(table.GetRowsToRepeat()).toBe(1);
        expect(table.GetFrameFormat()).toBe(format);
        expect(table.GetRegisteredIn()).toBe(format);
        expect(table.GetTabLines()[0]).toBe(row);
        expect(row.GetTabBoxes()[0]).toBe(box);
        expect(box.GetParagraphs()[0]).toBe(node);
        expect(node.GetText()).toBe("Original list and selection");
        expect(node.GetListId()).toBe(list);
        expect(doc.nodes.entries()).toEqual(nodes);
        expect(shell.CaptureCursorState()).toEqual(cursor);
        expect(format.DerivedFrom()).toBe(originalParent);
        expect(physicalRow.GetTabLine()).toBe(row);
        expect(physicalCell.GetTabBox()).toBe(box);
        expect(physicalCell.GetFormat()).toBe(box.GetFrameFormat());
      }
      expect(project).not.toHaveBeenCalled();
      expect(replay).not.toHaveBeenCalled();
      expect(invalidate).toHaveBeenCalledTimes(6);
      expect(paint).toHaveBeenCalledTimes(6);
      expect(format.IsModifyLocked()).toBe(false);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      if (inherited)
        for (const item of items) expect(parent.GetAttrSet().Get(item.Which())).toEqual(item);
    } finally {
      vi.restoreAllMocks();
      frame?.DestroyImpl();
      session.Close();
      parent.DisposeModify();
    }
  },
);

/** Observes unchanged native measure/context acceptance through explicit UNO members after removing the core browser tuple. @param item - Original native spacing or direct absence. @returns Native member values for historical acceptance. */
function ulValues(item: SvxULSpaceItem | undefined): readonly unknown[] | undefined {
  if (item === undefined) return undefined;
  const values = [item.QueryValue(3), item.QueryValue(4)];
  return item.QueryValue(7) === true ? [...values, 1] : values;
}
