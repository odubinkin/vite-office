/** @fileoverview Mounted column menus mutate independent native rows and replay document insertion. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
/** Requires an actual owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing mounted independent column owner");
  return value;
}
for (const behind of [false, true])
  it(
    "mounted independent column menu behind=" + behind,
    /** Checks actual menu ingress, independent row counts, original text and native repeated history. @returns Nothing. */ () => {
      const session = createWriterDocumentSession(),
        doc = session.docShell.GetDoc(),
        shell = session.view.GetWrtShell();
      try {
        const table = doc.nodes.MakeTableNode("Independent", { width: 6000, headerRows: 1 }),
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
            const size = box.GetFrameSize();
            size.SetWidth(required(authored[column]));
            box.SetFrameSize(size);
            required(box.GetParagraphs()[0]).SetText("r" + row + "c" + column);
          }
        }
        const source = required(
            required(required(table.GetTabLines()[1]).GetTabBoxes()[2]).GetParagraphs()[0],
          ),
          pos = new SwPosition(source, 2);
        shell.SetCursor(pos);
        pos.Dispose();
        doc.GetUndoManager().Clear();
        const before = shell.CaptureCursorState();
        render(<WriterWorkbench isActive view={session.view} />);
        const element = screen.getByRole("table", { name: "Independent" }),
          width = element.style.width;
        fireEvent.click(screen.getByRole("button", { name: "Table" }));
        fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Insert" }));
        fireEvent.click(
          screen.getByRole("menuitem", {
            name: behind ? "Insert Columns After" : "Insert Columns Before",
          }),
        );
        expect(
          [...element.querySelectorAll("tr")].map(
            /** Reads actual rendered native row cells. @param row - DOM row. @returns Count. */ (
              row,
            ) => row.querySelectorAll("[data-writer-table-box]").length,
          ),
        ).toEqual([3, 4, 3]);
        expect(
          screen.getByLabelText("Row 2 column " + (behind ? 3 : 4) + " paragraph 1"),
        ).toHaveTextContent("r1c2");
        expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
        expect(shell.CaptureCursorState()).toEqual(before);
        const expected = behind
          ? [
              [545, 2728, 2727],
              [545, 546, 2182, 2727],
              [2182, 1091, 2727],
            ]
          : [
              [545, 2727, 2728],
              [545, 546, 2727, 2182],
              [2727, 2182, 1091],
            ];
        for (let cycle = 0; cycle < 3; cycle++) {
          expect(
            table
              .GetTabLines()
              .map(
                /** Reads actual UI core geometry. @param line - Native row. @returns Widths. */ (
                  line,
                ) =>
                  line
                    .GetTabBoxes()
                    .map(
                      /** Reads owned box size. @param box - Cell. @returns Width. */ (box) =>
                        box.GetFrameSize().GetWidth(),
                    ),
              ),
          ).toEqual(expected);
          act(
            /** Reverts the native action. @returns Nothing. */ () => {
              expect(shell.Undo()).toBe(true);
            },
          );
          expect(
            [...element.querySelectorAll("tr")].map(
              /** Reads restored native row counts. @param row - DOM row. @returns Count. */ (
                row,
              ) => row.querySelectorAll("[data-writer-table-box]").length,
            ),
          ).toEqual([2, 3, 2]);
          act(
            /** Recreates columns through native document insertion. @returns Nothing. */ () => {
              expect(shell.Redo()).toBe(true);
            },
          );
          expect(
            [...element.querySelectorAll("tr")].map(
              /** Reads recreated native row counts. @param row - DOM row. @returns Count. */ (
                row,
              ) => row.querySelectorAll("[data-writer-table-box]").length,
            ),
          ).toEqual([3, 4, 3]);
          expect(element.style.width).toBe(width);
          expect(shell.CaptureCursorState()).toEqual(before);
        }
      } finally {
        cleanup();
        session.Close();
      }
    },
  );
