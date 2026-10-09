/** @fileoverview Verifies actual mounted table paint, dialog and shell read the original native collapsing-border item. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
import { TableParamToItemSet } from "../../source/uibase/shells/tabsh";
import { RES_BOX, RES_COLLAPSING_BORDERS } from "../../inc/hintids";
import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { SvxBoxItem } from "../../../editeng/source/items/frmitems";
import { SvxBorderLine } from "../../../editeng/source/items/borderline";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { SwFormatVertOrient } from "../../inc/fmtornt";
import { VertOrientation } from "../../../offapi/com/sun/star/text/VertOrientation";
/** Requires an original model or DOM owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw Error("Missing mounted native border owner");
  return value;
}
it("native border-mode changes preserve fixed bottom cell layout through actual alignment history", /** Checks original fixed-height clipping, native alignment and three history cycles. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = doc.nodes.MakeTableNode(
      "FixedNativeBorder",
      { width: 3000 },
      required(doc.paragraphs[0]),
    );
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1, {
        frameSize: new SwFormatFrameSize(SwFrameSize.Fixed, 0, 900),
      }),
      box = required(row.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]);
    node.SetText("Original fixed bottom owner");
    box.GetFrameFormat().SetFormatAttr(new SwFormatVertOrient(0, VertOrientation.BOTTOM, 0));
    const position = new SwPosition(node, 2);
    shell.SetCursor(position);
    position.Dispose();
    const cursor = shell.CaptureCursorState();
    doc.GetUndoManager().Clear();
    render(<WriterWorkbench isActive view={session.view} />);
    /** Reads the current actual clipping device. @returns Original DOM device. */
    function clip(): HTMLElement {
      return required(
        screen
          .getByRole("textbox", { name: "Row 1 column 1 paragraph 1" })
          .closest<HTMLElement>("[data-writer-fixed-row-content]"),
      );
    }
    expect(clip()).toHaveStyle({
      height: "60px",
      overflow: "hidden",
      justifyContent: "safe flex-end",
    });
    act(
      /** Switches the actual native table mode and cell alignment. @returns Nothing. */ () => {
        table.GetFrameFormat().SetFormatAttr(new SfxBoolItem(RES_COLLAPSING_BORDERS, true));
        expect(
          doc.SetBoxAttr(shell.GetCursor(), new SwFormatVertOrient(0, VertOrientation.CENTER, 0)),
        ).toBe(true);
      },
    );
    expect(screen.getByRole("table", { name: "FixedNativeBorder" })).toHaveStyle({
      borderCollapse: "collapse",
    });
    expect(clip()).toHaveStyle({ height: "60px", justifyContent: "safe center" });
    for (let cycle = 0; cycle < 3; cycle++) {
      act(
        /** Reverts original native cell alignment. @returns Nothing. */ () => {
          expect(shell.Undo()).toBe(true);
        },
      );
      expect(clip()).toHaveStyle({ height: "60px", justifyContent: "safe flex-end" });
      act(
        /** Restores original native cell alignment. @returns Nothing. */ () => {
          expect(shell.Redo()).toBe(true);
        },
      );
      expect(clip()).toHaveStyle({ height: "60px", justifyContent: "safe center" });
      expect(
        (table.GetFrameFormat().GetAttrSet().Get(RES_COLLAPSING_BORDERS) as SfxBoolItem).GetValue(),
      ).toBe(true);
      expect(table.GetTabLines()[0]).toBe(row);
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(node.GetText()).toBe("Original fixed bottom owner");
      expect(shell.CaptureCursorState()).toEqual(cursor);
    }
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  } finally {
    cleanup();
    session.Close();
  }
});
it.each([false, true])(
  "direct native table border mode updates resolved paint and mounted controls inherited=%s",
  /** Checks accepted native values without document-model device signals. @param inherited - Native parent owns the mode. @returns Nothing. */ (
    inherited,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    try {
      const table = doc.nodes.MakeTableNode(
        "NativeItem",
        { width: 6000 },
        required(doc.paragraphs[0]),
      );
      table.AddColumnWidth(3000);
      table.AddColumnWidth(3000);
      const row = doc.nodes.AppendTableRow(table, 2),
        first = required(row.GetTabBoxes()[0]),
        second = required(row.GetTabBoxes()[1]),
        node = required(first.GetParagraphs()[0]);
      node.SetText("Original native border item");
      const left = new SvxBoxItem(RES_BOX),
        right = new SvxBoxItem(RES_BOX);
      left.SetLine(new SvxBorderLine(0xff0000, 20), 3);
      right.SetLine(new SvxBorderLine(0x0000ff, 60), 2);
      first.GetFrameFormat().SetFormatAttr(left);
      second.GetFrameFormat().SetFormatAttr(right);
      const format = table.GetFrameFormat(),
        owner = inherited ? doc.GetDfltFrameFormat() : format;
      if (inherited) format.SetDerivedFrom(owner);
      const position = new SwPosition(node, 2);
      shell.SetCursor(position);
      position.Dispose();
      const cursor = shell.CaptureCursorState(),
        modelRevision = doc.GetDocumentStateManager().GetModelRevision();
      render(<WriterWorkbench isActive view={session.view} />);
      const signal = vi.spyOn(doc.GetDocumentStateManager(), "CallSwClientNotify"),
        element = screen.getByRole("table", { name: "NativeItem" });
      /** Reads the current original first-cell device. @returns Actual DOM cell. */
      function cell(): HTMLElement {
        return required(
          screen
            .getByRole("textbox", { name: "Row 1 column 1 paragraph 1" })
            .closest<HTMLTableCellElement>("td,th"),
        );
      }
      expect(element).toHaveStyle({ borderCollapse: "separate" });
      expect(cell()).toHaveStyle({ borderRightColor: "rgb(255, 0, 0)" });
      act(
        /** Sets the original native bool item directly. @returns Nothing. */ () => {
          owner.SetFormatAttr(new SfxBoolItem(RES_COLLAPSING_BORDERS, true));
        },
      );
      expect(element).toHaveStyle({ borderCollapse: "collapse" });
      expect(cell()).toHaveStyle({ borderRightColor: "rgb(0, 0, 255)" });
      expect(
        (TableParamToItemSet(shell).Get(RES_COLLAPSING_BORDERS) as SfxBoolItem).GetValue(),
      ).toBe(true);
      fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
      fireEvent.click(screen.getByRole("tab", { name: "Borders" }));
      expect(screen.getByRole("checkbox", { name: "Merge adjacent line styles" })).toHaveProperty(
        "checked",
        true,
      );
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(signal).not.toHaveBeenCalled();
      expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(modelRevision);
      expect(first.GetFrameFormat().GetBox().GetRight()?.GetColor()).toBe(0xff0000);
      expect(second.GetFrameFormat().GetBox().GetLeft()?.GetColor()).toBe(0x0000ff);
      expect(first.GetParagraphs()[0]).toBe(node);
      expect(node.GetText()).toBe("Original native border item");
      expect(shell.CaptureCursorState()).toEqual(cursor);
      act(
        /** Restores the actual native bool pool default. @returns Nothing. */ () => {
          owner.ResetFormatAttr(RES_COLLAPSING_BORDERS);
        },
      );
      expect(element).toHaveStyle({ borderCollapse: "separate" });
      expect(cell()).toHaveStyle({ borderRightColor: "rgb(255, 0, 0)" });
      expect(signal).not.toHaveBeenCalled();
      expect(table.GetFormat().borderModel).toBeUndefined();
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    } finally {
      cleanup();
      vi.restoreAllMocks();
      session.Close();
    }
  },
);
