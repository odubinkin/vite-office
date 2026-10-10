/** @fileoverview Verifies mounted column acceptance retains the complete original native table frame-size context. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { SwFrameFormat } from "../../source/core/layout/atrfrm";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { SwFormatHoriOrient } from "../../inc/fmtornt";
import { SwFormatLayoutSplit } from "../../inc/fmtlsplt";
import { SvxULSpaceItem } from "../../../editeng/source/items/frmitems";
import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { RES_UL_SPACE, RES_LAYOUT_SPLIT, RES_COLLAPSING_BORDERS } from "../../inc/hintids";
import { HoriOrientation } from "../../../offapi/com/sun/star/text/HoriOrientation";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { readOdtDocument } from "../../source/filter/xml/swxml";
/** Requires an original native owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing mounted normalization owner");
  return value;
}
it.each([false, true])(
  "mounted column changes preserve complete native frame-size inherited=%s",
  /** Checks real controls, Reset/Cancel, source normalization and three original history cycles. @param inherited - Parent input. @returns Completion. */ async (
    inherited,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell(),
      parent = new SwFrameFormat(doc.GetAttrPool(), "MountedNormalizationParent");
    try {
      const table = doc.nodes.MakeTableNode(
          "ColumnFrameUI",
          { width: 6000 },
          required(doc.paragraphs[0]),
        ),
        format = table.GetFrameFormat();
      table.AddColumnWidth(3000);
      table.AddColumnWidth(3000);
      const row = doc.nodes.AppendTableRow(table, 2),
        second = doc.nodes.AppendTableRow(table, 2),
        box = required(row.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]);
      node.SetText("Original column frame UI");
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
      owner.SetFormatAttr(size);
      owner.SetFormatAttr(new SwFormatHoriOrient(77, HoriOrientation.FULL, 3));
      owner.SetFormatAttr(new SvxULSpaceItem(120, 240, RES_UL_SPACE, true));
      owner.SetFormatAttr(new SwFormatLayoutSplit(false));
      owner.SetFormatAttr(new SfxBoolItem(RES_COLLAPSING_BORDERS, true));
      if (inherited) format.ResetFormatAttr(size.Which());
      const cursor = shell.CaptureCursorState(),
        nodes = [...doc.nodes.entries()],
        list = node.GetListId(),
        before = format.GetFrameSize().Clone();
      doc.GetUndoManager().Clear();
      render(<WriterWorkbench isActive view={session.view} />);
      fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
      fireEvent.click(screen.getByRole("tab", { name: "Columns" }));
      const first = screen.getByRole("spinbutton", { name: "Column 1 width (cm)" }),
        savedWidth = (first as HTMLInputElement).value;
      fireEvent.change(first, { target: { value: "3" } });
      fireEvent.click(screen.getByRole("button", { name: "Reset" }));
      expect(screen.getByRole("spinbutton", { name: "Column 1 width (cm)" })).toHaveValue(
        Number(savedWidth),
      );
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(format.GetFrameSize()).toEqual(before);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
      const scalar = vi.spyOn(table, "SetFormat");
      fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
      fireEvent.click(screen.getByRole("tab", { name: "Columns" }));
      fireEvent.change(screen.getByRole("spinbutton", { name: "Column 1 width (cm)" }), {
        target: { value: "3" },
      });
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      const normalized = before.Clone();
      normalized.SetWidth(8640);
      expect(scalar).not.toHaveBeenCalled();
      expect(format.GetFrameSize()).toEqual(normalized);
      expect(table.GetColumnWidths()).toEqual([1701, 6939]);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      for (let cycle = 0; cycle < 3; cycle++) {
        act(
          /** Restores original normalized separators. @returns Nothing. */ () => {
            expect(shell.Undo()).toBe(true);
          },
        );
        expect(table.GetColumnWidths()).toEqual([4320, 4320]);
        expect(format.GetFrameSize()).toEqual(normalized);
        act(
          /** Replays accepted native column items. @returns Nothing. */ () => {
            expect(shell.Redo()).toBe(true);
          },
        );
        expect(table.GetColumnWidths()).toEqual([1701, 6939]);
        expect(format.GetFrameSize()).toEqual(normalized);
        expect(ulValues(format.GetULSpace())).toEqual([120, 240, 1]);
        expect((format.GetAttrSet().Get(RES_LAYOUT_SPLIT) as SwFormatLayoutSplit).GetValue()).toBe(
          false,
        );
        expect((format.GetAttrSet().Get(RES_COLLAPSING_BORDERS) as SfxBoolItem).GetValue()).toBe(
          true,
        );
        for (const id of [RES_UL_SPACE, RES_LAYOUT_SPLIT, RES_COLLAPSING_BORDERS])
          expect(format.GetAttrSet().GetItemIfSet(id, false) === undefined).toBe(inherited);
        expect(table.GetTabLines()).toEqual([row, second]);
        expect(row.GetTabBoxes()[0]).toBe(box);
        expect(box.GetParagraphs()[0]).toBe(node);
        expect(node.GetText()).toBe("Original column frame UI");
        expect(node.GetListId()).toBe(list);
        expect(shell.CaptureCursorState()).toEqual(cursor);
        expect(doc.nodes.entries()).toEqual(nodes);
        expect(
          screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }),
        ).toHaveTextContent("Original column frame UI");
        expect(screen.getByRole("table", { name: "ColumnFrameUI" })).toHaveStyle({
          borderCollapse: "collapse",
        });
      }
      if (inherited) expect(parent.GetFrameSize()).toEqual(before);
      const reopened = await readOdtDocument(writeOdtDocument(doc, { title: "ColumnFrameUI" }), {
        title: "ColumnFrameUI",
      });
      try {
        const restored = required(reopened.document.GetTables()[0]);
        expect(restored.GetColumnWidths()).toEqual([1701, 6939]);
        expect(restored.GetFrameFormat().GetFrameSize().GetWidth()).toBe(8640);
        // Inherited parent export remains a separate unported transport responsibility.
        if (!inherited) {
          expect(ulValues(restored.GetFrameFormat().GetULSpace())).toEqual([120, 240]);
          expect(
            (
              restored.GetFrameFormat().GetAttrSet().Get(RES_LAYOUT_SPLIT) as SwFormatLayoutSplit
            ).GetValue(),
          ).toBe(false);
          expect(
            (
              restored.GetFrameFormat().GetAttrSet().Get(RES_COLLAPSING_BORDERS) as SfxBoolItem
            ).GetValue(),
          ).toBe(true);
        }
      } finally {
        reopened.document.Dispose();
      }
    } finally {
      cleanup();
      vi.restoreAllMocks();
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
