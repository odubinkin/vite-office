/** @fileoverview Verifies original frame-only print normalization and source native column history. */
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwFrameFormat } from "../layout/atrfrm";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatHoriOrient } from "../../../inc/fmtornt";
import { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import { SwTabCols } from "../bastyp/tabcol";
import { SvxLRSpaceItem, SvxULSpaceItem } from "../../../../editeng/source/items/frmitems";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import {
  RES_FRM_SIZE,
  RES_LR_SPACE,
  RES_UL_SPACE,
  RES_HORI_ORIENT,
  RES_LAYOUT_SPLIT,
  RES_COLLAPSING_BORDERS,
} from "../../../inc/hintids";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwDoc } from "../doc/doc";
import { SwTabFrame } from "../layout/tabfrm";
/** Requires an original native owner. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native normalization owner");
  return value;
}
it.each([
  [false, false],
  [false, true],
  [true, false],
  [true, true],
] as const)(
  "native frame-only normalization preserves parent attributes inherited=%s currentRow=%s",
  /** Checks complete original fields, source pre-history normalization and three native cycles. @param inherited - Parent input. @param currentRow - Independent row change. @returns Nothing. */ (
    inherited,
    currentRow,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell(),
      parent = new SwFrameFormat(doc.GetAttrPool(), "NormalizationParent");
    try {
      const table = doc.nodes.MakeTableNode("Normalize", { width: 6000 }),
        format = table.GetFrameFormat();
      table.AddColumnWidth(3000);
      table.AddColumnWidth(3000);
      const row = doc.nodes.AppendTableRow(table, 2),
        other = doc.nodes.AppendTableRow(table, 2),
        box = required(row.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]);
      node.SetText("Original normalized list");
      shell.FocusNode(node);
      shell.SetParagraphListKind("bullet");
      const owner = inherited ? parent : format;
      if (inherited) format.SetDerivedFrom(parent);
      const size = new SwFormatFrameSize(SwFrameSize.Minimum, 6000, 480);
      size.SetWidthSizeType(SwFrameSize.Variable);
      size.SetWidthPercent(75);
      size.SetWidthPercentRelation(3);
      size.SetHeightPercent(37);
      size.SetHeightPercentRelation(4);
      const lr = new SvxLRSpaceItem(RES_LR_SPACE);
      lr.SetLeft(0, 80);
      lr.SetRight(0, 90);
      lr.SetAutoFirst(true);
      lr.SetPropTextFirstLineOffset(70);
      lr.SetGutterMargin(75);
      lr.SetRightGutterMargin(90);
      const items = [
        lr,
        new SvxULSpaceItem(120, 240, RES_UL_SPACE, true),
        new SwFormatHoriOrient(77, HoriOrientation.FULL, 3),
        new SwFormatLayoutSplit(false),
        new SfxBoolItem(RES_COLLAPSING_BORDERS, true),
      ];
      owner.SetFormatAttr(size);
      for (const item of items) owner.SetFormatAttr(item);
      if (inherited) {
        format.ResetFormatAttr(RES_FRM_SIZE);
        for (const item of items) format.ResetFormatAttr(item.Which());
      }
      const inputSize = owner.GetFrameSize().Clone(),
        originalItems = items.map(
          /** Captures effective original complete item values. @param item - Original input. @returns Value. */ (
            item,
          ) => format.GetAttrSet().Get(item.Which()).Clone(),
        ),
        cursor = shell.CaptureCursorState(),
        nodes = [...doc.nodes.entries()],
        list = node.GetListId();
      const previous = new SwTabCols();
      expect(shell.GetTabCols(previous)).toBe(true);
      expect(previous.GetRight() - previous.GetLeft()).toBe(8640);
      const next = new SwTabCols(previous);
      next.GetEntry(0).nPos = 2000;
      const normalized = size.Clone();
      normalized.SetWidth(8640);
      doc.GetUndoManager().Clear();
      const scalar = vi.spyOn(table, "SetFormat");
      expect(shell.SetTabCols(next, currentRow)).toBe(true);
      expect(scalar).not.toHaveBeenCalled();
      expect(format.GetFrameSize()).toEqual(normalized);
      expect(owner === format || owner.GetFrameSize().equals(inputSize)).toBe(true);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(shell.Undo()).toBe(true);
        expect(table.GetColumnWidths()).toEqual([4320, 4320]);
        expect(format.GetFrameSize()).toEqual(normalized);
        expect(shell.Redo()).toBe(true);
        expect(table.GetColumnWidths()).toEqual([2000, 6640]);
        expect(
          other
            .GetTabBoxes()
            .map(
              /** Reads original second-row widths. @param cell - Native owner. @returns Twips. */ (
                cell,
              ) => cell.GetFrameSize().GetWidth(),
            ),
        ).toEqual(currentRow ? [4320, 4320] : [2000, 6640]);
        for (const [index, item] of items.entries()) {
          expect(format.GetAttrSet().Get(item.Which())).toEqual(originalItems[index]);
          expect(format.GetAttrSet().GetItemIfSet(item.Which(), false) === undefined).toBe(
            inherited,
          );
        }
        expect(format.GetFrameSize()).toEqual(normalized);
        expect(format.GetAttrSet().GetItemIfSet(RES_FRM_SIZE, false)).toBeDefined();
        expect(table.GetFrameFormat()).toBe(format);
        expect(table.GetTabLines()).toEqual([row, other]);
        expect(row.GetTabBoxes()[0]).toBe(box);
        expect(box.GetParagraphs()[0]).toBe(node);
        expect(node.GetText()).toBe("Original normalized list");
        expect(node.GetListId()).toBe(list);
        expect(shell.CaptureCursorState()).toEqual(cursor);
        expect(doc.nodes.entries()).toEqual(nodes);
      }
      expect(scalar.mock.calls).toEqual([[{}], [{}], [{}], [{}], [{}], [{}]]);
      expect(size).toEqual(inputSize);
      if (inherited) expect(parent.GetFrameSize()).toEqual(inputSize);
    } finally {
      vi.restoreAllMocks();
      session.Close();
      parent.DisposeModify();
    }
  },
);
it("native width normalization leaves unrelated absent and disabled items unmaterialized", /** Checks original default admission and complete native default-size copy. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = doc.nodes.MakeTableNode("Defaults", { width: 6000 }),
      format = table.GetFrameFormat();
    table.AddColumnWidth(3000);
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 2),
      box = required(row.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]);
    shell.FocusNode(node);
    format.GetAttrSet().DisableItem(RES_UL_SPACE);
    format.GetAttrSet().InvalidateItem(RES_LAYOUT_SPLIT);
    const ids = [
        RES_LR_SPACE,
        RES_UL_SPACE,
        RES_HORI_ORIENT,
        RES_LAYOUT_SPLIT,
        RES_COLLAPSING_BORDERS,
      ],
      states = ids.map(
        /** Captures exact direct item admission state. @param id - Native Which ID. @returns State. */ (
          id,
        ) => format.GetAttrSet().GetItemState(id, false),
      ),
      previous = new SwTabCols();
    shell.GetTabCols(previous);
    const next = new SwTabCols(previous);
    next.GetEntry(0).nPos = 2000;
    const size = format.GetFrameSize().Clone();
    size.SetWidth(previous.GetRight() - previous.GetLeft());
    doc.GetUndoManager().Clear();
    const scalar = vi.spyOn(table, "SetFormat");
    expect(shell.SetTabCols(next, false)).toBe(true);
    expect(scalar).not.toHaveBeenCalled();
    expect(format.GetFrameSize()).toEqual(size);
    expect(
      ids.map(
        /** Reads exact direct item admission after normalization. @param id - Native Which ID. @returns State. */ (
          id,
        ) => format.GetAttrSet().GetItemState(id, false),
      ),
    ).toEqual(states);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  } finally {
    vi.restoreAllMocks();
    session.Close();
  }
});
it.each([SwFrameSize.Minimum, SwFrameSize.Fixed])(
  "original authored row sizing mode survives native frame resize and history %s",
  /** Checks actual physical row history retains an existing native size type. @param mode - Original authored height mode. @returns Nothing. */ (
    mode,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    let frame: SwTabFrame | undefined;
    try {
      const table = doc.nodes.MakeTableNode("SizedRow", {
        width: 3000,
        horiOrient: HoriOrientation.LEFT,
      });
      table.AddColumnWidth(1500);
      table.AddColumnWidth(1500);
      const row = doc.nodes.AppendTableRow(table, 2),
        box = required(row.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]);
      node.SetText("Original sized row");
      shell.FocusNode(node);
      row.SetFormat({ frameSize: new SwFormatFrameSize(mode, 0, 600) });
      frame = new SwTabFrame(table, {
        rect: { left: 100, right: 300, top: 100, bottom: 150 },
        cells: row.GetTabBoxes().map(
          /** Supplies independent native physical cell bounds. @param cell - Original owner. @param index - Column. @returns Physical cell. */ (
            cell,
            index,
          ) => ({
            box: cell,
            rect: { left: 100 + index * 100, right: 200 + index * 100, top: 100, bottom: 150 },
          }),
        ),
      });
      const next = new SwTabCols();
      expect(SwDoc.GetTabRows(next, frame, box)).toBe(true);
      next.SetRight(900);
      doc.GetUndoManager().Clear();
      expect(doc.SetTabRows(next, false, frame, box)).toBe(true);
      expect(row.GetFrameSize().GetHeight()).toBe(900);
      expect(row.GetFrameSize().GetHeightSizeType()).toBe(mode);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(shell.Undo()).toBe(true);
        expect(row.GetFrameSize().GetHeight()).toBe(600);
        expect(row.GetFrameSize().GetHeightSizeType()).toBe(mode);
        expect(shell.Redo()).toBe(true);
        expect(row.GetFrameSize().GetHeight()).toBe(900);
        expect(row.GetFrameSize().GetHeightSizeType()).toBe(mode);
        expect(table.GetTabLines()[0]).toBe(row);
        expect(row.GetTabBoxes()[0]).toBe(box);
        expect(box.GetParagraphs()[0]).toBe(node);
        expect(node.GetText()).toBe("Original sized row");
      }
    } finally {
      frame?.DestroyImpl();
      session.Close();
    }
  },
);
