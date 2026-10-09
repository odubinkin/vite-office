/** @fileoverview Verifies native resolved border paint over original mounted cell owners and history. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { SvxBoxItem } from "../../../editeng/source/items/frmitems";
import { SvxBorderLine } from "../../../editeng/source/items/borderline";
import { RES_BOX } from "../../inc/hintids";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { readOdtDocument } from "../../source/filter/xml/swxml";
afterEach(cleanup);
it.each([false, true])(
  "native collapsing paint preserves original cell lines and grouped history fixed=%s",
  /** Checks real mounted table state and continued editing across three native history cycles. @param fixed - Existing row sizing. @returns Completion. */ async (
    fixed,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell(),
      table = doc.nodes.MakeTableNode("NativeConflict", { width: 6000, borderModel: "collapsing" });
    table.AddColumnWidth(3000);
    table.AddColumnWidth(3000);
    for (let r = 0; r < 2; r++) {
      const row = doc.nodes.AppendTableRow(table, 2, {
        frameSize: new SwFormatFrameSize(fixed ? SwFrameSize.Fixed : SwFrameSize.Minimum, 0, 900),
      });
      for (const [c, cell] of row.GetTabBoxes().entries()) {
        const box = new SvxBoxItem(RES_BOX);
        box.SetLine(new SvxBorderLine(c === 0 ? 0xff0000 : 0x0000ff, 20), c === 0 ? 3 : 2);
        box.SetLine(
          new SvxBorderLine(r === 0 ? 0x00ff00 : 0xff00ff, r === 0 ? 40 : 10),
          r === 0 ? 1 : 0,
        );
        box.SetAllDistances(28);
        cell.SetFormat({ box });
        const node = cell.GetParagraphs()[0];
        if (node === undefined) throw Error("Missing conflict paragraph");
        node.SetText("Original " + r + c);
      }
    }
    const boxes = table.GetTabLines().flatMap(
        /** Captures original cell owners. @param row - Native row. @returns Owners. */
        (row) => row.GetTabBoxes(),
      ),
      original = boxes.map(
        /** Captures original native line payloads. @param box - Cell owner. @returns Payload. */
        (box) => box.GetBox().QueryValue(),
      ),
      node = boxes[0]?.GetParagraphs()[0];
    if (node === undefined) throw Error("Missing original cell");
    shell.FocusNode(node);
    try {
      render(<WriterWorkbench isActive view={session.view} />);
      /** Finds the actual native row paint device. @param r - Row index. @param c - Column index. @returns Device. */
      function paint(r: number, c: number): HTMLElement {
        const cell = screen
          .getByRole("textbox", { name: `Row ${r + 1} column ${c + 1} paragraph 1` })
          .closest<HTMLTableCellElement>("td,th");
        if (cell === null) throw Error("Missing native cell device");
        const view = fixed
          ? (cell.querySelector<HTMLElement>("[data-writer-fixed-row-content]") ?? cell)
          : cell;
        if (view === null) throw Error("Missing native paint device");
        return view;
      }
      /** Checks source shared winner while original table attributes remain independent. @returns Nothing. */
      function collapsed(): void {
        if (fixed)
          expect(
            screen
              .getByRole("textbox", { name: "Row 1 column 1 paragraph 1" })
              .closest("[data-writer-fixed-row-content]"),
          ).not.toBeNull();
        expect(paint(0, 0)).toHaveStyle({
          borderRightColor: "rgb(0, 0, 255)",
          borderBottomColor: "rgb(0, 255, 0)",
        });
        expect(paint(0, 1)).toHaveStyle({ borderLeftColor: "rgb(0, 0, 255)" });
        expect(paint(1, 0)).toHaveStyle({ borderTopColor: "rgb(0, 255, 0)" });
        for (const [i, box] of boxes.entries())
          expect(box.GetBox().QueryValue()).toEqual(original[i]);
      }
      collapsed();
      fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
      fireEvent.click(screen.getByRole("tab", { name: "Borders" }));
      fireEvent.click(screen.getByRole("checkbox", { name: "Merge adjacent line styles" }));
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      expect(table.GetFormat().borderModel).toBe("separating");
      expect(paint(0, 0)).toHaveStyle({ borderRightColor: "rgb(255, 0, 0)" });
      expect(paint(1, 0)).toHaveStyle({ borderTopColor: "rgb(255, 0, 255)" });
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      for (let cycle = 0; cycle < 3; cycle++) {
        act(
          /** Restores original native collapsing mode. @returns Nothing. */ () => {
            expect(shell.Undo()).toBe(true);
          },
        );
        collapsed();
        act(
          /** Reapplies source table mode. @returns Nothing. */ () => {
            expect(shell.Redo()).toBe(true);
          },
        );
        expect(paint(0, 0)).toHaveStyle({ borderRightColor: "rgb(255, 0, 0)" });
        expect(boxes[0]?.GetParagraphs()[0]).toBe(node);
      }
      const reopened = await readOdtDocument(writeOdtDocument(doc, { title: "NativeConflict" }), {
        title: "NativeConflict",
      });
      expect(
        reopened.document.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes()[0]?.GetBox().QueryValue(),
      ).toEqual(original[0]);
      act(
        /** Continues editing on the original native paragraph owner. @returns Nothing. */ () => {
          session.view.GetEditWin().InsertText("!");
        },
      );
      expect(node.GetText()).toContain("!");
    } finally {
      cleanup();
      session.Close();
    }
  },
);
