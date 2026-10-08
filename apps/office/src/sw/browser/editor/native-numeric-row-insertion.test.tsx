/** @fileoverview Mounted selected row menus recreate numeric native history and preserve top-border ownership. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
import { SvxBoxItem } from "../../../editeng/source/items/frmitems";
import { SvxBorderLine } from "../../../editeng/source/items/borderline";
import { RES_BOX } from "../../inc/hintids";
/** Requires an actual native owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing mounted numeric row owner");
  return value;
}
for (const behind of [false, true])
  it(
    "mounted numeric row menu behind=" + behind,
    /** Checks menu ingress, unequal rows, cursor selection, native borders and fresh redo owners. @returns Nothing. */ () => {
      const session = createWriterDocumentSession(),
        doc = session.docShell.GetDoc(),
        shell = session.view.GetWrtShell();
      try {
        const table = doc.nodes.MakeTableNode("NumericRows", { width: 6000, headerRows: 1 }),
          widths = [
            [1000, 5000],
            [1000, 1000, 4000],
            [4000, 2000],
          ];
        table.AddColumnWidth(1000);
        table.AddColumnWidth(5000);
        for (const [row, authored] of widths.entries()) {
          const line = doc.nodes.AppendTableRow(table, authored.length);
          for (const [column, box] of line.GetTabBoxes().entries()) {
            const size = box.GetFrameSize(),
              item = new SvxBoxItem(RES_BOX);
            size.SetWidth(required(authored[column]));
            item.SetLine(new SvxBorderLine(0x102030 + row, 12), 0);
            box.SetFormat({ frameSize: size, box: item });
            required(box.GetParagraphs()[0]).SetText("r" + row + "c" + column);
          }
        }
        const originals = [...table.GetTabLines()],
          first = required(required(required(originals[0]).GetTabBoxes()[1]).GetParagraphs()[0]),
          second = required(required(required(originals[1]).GetTabBoxes()[0]).GetParagraphs()[0]),
          point = new SwPosition(first, 1),
          mark = new SwPosition(second, 1);
        shell.UpdateCursor(point, mark);
        point.Dispose();
        mark.Dispose();
        doc.GetUndoManager().Clear();
        const before = shell.CaptureCursorState();
        render(<WriterWorkbench isActive view={session.view} />);
        const element = screen.getByRole("table", { name: "NumericRows" }),
          index = behind ? 2 : 0,
          source = required(originals[behind ? 1 : 0]);
        fireEvent.click(screen.getByRole("button", { name: "Table" }));
        fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Insert" }));
        fireEvent.click(
          screen.getByRole("menuitem", {
            name: behind ? "Insert Rows Below" : "Insert Rows Above",
          }),
        );
        let previous = table.GetTabLines().slice(index, index + 2);
        for (let cycle = 0; cycle < 3; cycle++) {
          expect(
            [...element.querySelectorAll("tr")].map(
              /** Counts rendered native boxes. @param row - DOM row. @returns Count. */ (row) =>
                row.querySelectorAll("[data-writer-table-box]").length,
            ),
          ).toEqual(behind ? [2, 3, 3, 3, 2] : [2, 2, 2, 3, 2]);
          expect(
            screen.getByLabelText("Row " + (behind ? 1 : 3) + " column 2 paragraph 1"),
          ).toHaveTextContent("r0c1");
          expect(
            screen.getByLabelText("Row " + (behind ? 2 : 4) + " column 1 paragraph 1"),
          ).toHaveTextContent("r1c0");
          expect(shell.CaptureCursorState()).toEqual(before);
          expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
          const inserted = table.GetTabLines().slice(index, index + 2),
            previousParagraphs = inserted.map(
              /** Saves actual paragraph identities before disconnecting their rows. @param line - Connected row. @returns Paragraph owners. */
              (line) =>
                line.GetTabBoxes().map(
                  /** Reads each still-connected paragraph. @param box - Actual box. @returns Paragraph. */
                  (box) => required(box.GetParagraphs()[0]),
                ),
            );
          for (const [offset, line] of inserted.entries()) {
            expect(
              line
                .GetTabBoxes()
                .map(
                  /** Reads copied source geometry. @param box - Native box. @returns Width. */ (
                    box,
                  ) => box.GetFrameSize().GetWidth(),
                ),
            ).toEqual(widths[behind ? 1 : 0]);
            for (const box of line.GetTabBoxes()) {
              expect(box.GetBox().GetTop() !== undefined).toBe(!behind && offset === 0);
              expect(required(box.GetParagraphs()[0]).GetText()).toBe("");
            }
          }
          for (const box of source.GetTabBoxes())
            expect(box.GetBox().GetTop() !== undefined).toBe(behind);
          const previousFormats = previous.map(
            /** Captures accepted values before native deletion. @param line - Original inserted row. @returns Complete box values. */ (
              line,
            ) =>
              line
                .GetTabBoxes()
                .map(
                  /** Reads accepted previous attributes. @param box - Prior box. @returns Format. */ (
                    box,
                  ) => box.GetFormat(),
                ),
          );
          act(
            /** Reverts the actual native row action. @returns Nothing. */ () => {
              expect(shell.Undo()).toBe(true);
            },
          );
          expect(table.GetTabLines()).toEqual(originals);
          expect(
            [...element.querySelectorAll("tr")].map(
              /** Counts restored original rows. @param row - DOM row. @returns Count. */ (row) =>
                row.querySelectorAll("[data-writer-table-box]").length,
            ),
          ).toEqual([2, 3, 2]);
          for (const box of source.GetTabBoxes()) expect(box.GetBox().GetTop()).toBeDefined();
          act(
            /** Recreates rows through the document owner. @returns Nothing. */ () => {
              expect(shell.Redo()).toBe(true);
            },
          );
          const current = table.GetTabLines().slice(index, index + 2);
          for (const [offset, line] of current.entries()) {
            expect(line).not.toBe(previous[offset]);
            expect(
              line
                .GetTabBoxes()
                .map(
                  /** Reads newly recreated complete attributes. @param box - Current box. @returns Format. */ (
                    box,
                  ) => box.GetFormat(),
                ),
            ).toEqual(previousFormats[offset]);
            for (const [column, box] of line.GetTabBoxes().entries()) {
              expect(box).not.toBe(required(previous[offset]).GetTabBoxes()[column]);
              expect(box.GetParagraphs()[0]).not.toBe(required(previousParagraphs[offset])[column]);
            }
          }
          expect(shell.CaptureCursorState()).toEqual(before);
          previous = current;
        }
      } finally {
        cleanup();
        session.Close();
      }
    },
  );
