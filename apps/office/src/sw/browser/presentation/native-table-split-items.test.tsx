/** @fileoverview Verifies native concrete Text Flow items on the mounted UI-to-shell path with original owners and Undo/Redo. */
import { nativeRowFormatForTest } from "../../../test/table-row-test-helpers";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
import { SwFormatLayoutSplit } from "../../inc/fmtlsplt";
import { SwFormatRowSplit } from "../../inc/fmtrowsplt";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { HoriOrientation } from "../../../offapi/com/sun/star/text/HoriOrientation";
import * as tableShell from "../../source/uibase/shells/tabsh";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases original mounted owners. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Requires an original connected owner. @param value - Optional value. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing split owner");
  return value;
}
/** Mounts a real view with mixed original row attributes. @param selected - Current-row selection. @returns Original native graph and captured input. */
function fixture(selected = false) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    table = doc.nodes.MakeTableNode("NativeSplit", {
      width: 6000,
      horiOrient: HoriOrientation.LEFT,
    });
  table.AddColumnWidth(6000);
  for (const keepTogether of [true, false, true])
    doc.nodes.AppendTableRow(table, 1, nativeRowFormatForTest({ keepTogether }));
  const rows = [...table.GetTabLines()],
    boxes = rows.map(
      /** Reads original cells. @param row - Original line. @returns Original box. */ (row) =>
        required(row.GetTabBoxes()[0]),
    ),
    node = required(required(boxes[0]).GetParagraphs()[0]);
  node.SetText("Original cell");
  const pos = new SwPosition(node, 2);
  shell.SetCursor(pos);
  pos.Dispose();
  if (selected) expect(shell.SelectTableRow()).toBe(true);
  doc.GetUndoManager().Clear();
  const cursor = shell.CaptureCursorState(),
    format = table.GetFormat(),
    rowFormats = rows.map(
      /** Captures exact original row values. @param row - Native line. @returns Complete format. */ (
        row,
      ) => row.GetFormat(),
    ),
    acceptance = vi.spyOn(tableShell, "ItemSetToTableParam");
  render(<WriterWorkbench isActive view={session.view} />);
  fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
  fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
  return { doc, shell, table, rows, boxes, node, cursor, format, rowFormats, acceptance };
}
/** Reads actual main UI native output. @param f - Original mounted fixture. @returns Native set. */
function accepted(f: ReturnType<typeof fixture>): SfxItemSet {
  const input = required(f.acceptance.mock.calls[0]?.[1]);
  expect(input).toBeInstanceOf(SfxItemSet);
  if (!(input instanceof SfxItemSet)) throw new Error("Legacy split DTO input");
  return input;
}
for (const selected of [false, true])
  for (const mode of ["table", "row", "both"] as const) {
    it(
      "mounted concrete split items preserve native graph/history " +
        mode +
        " selected=" +
        selected,
      /** Checks real explicit items and exact original-owner history. @returns Nothing. */ () => {
        const f = fixture(selected);
        if (mode !== "table")
          fireEvent.click(
            screen.getByRole("checkbox", { name: "Allow row to break across pages and columns" }),
          );
        if (mode !== "row")
          fireEvent.click(
            screen.getByRole("checkbox", { name: "Allow table to split across pages and columns" }),
          );
        fireEvent.click(screen.getByRole("button", { name: "OK" }));
        const input = accepted(f);
        expect(input.Count()).toBe(mode === "both" ? 2 : 1);
        if (mode !== "row") {
          expect(input.GetItemIfSet(120, false)).toBeInstanceOf(SwFormatLayoutSplit);
          expect(input.Get(120).QueryValue()).toBe(false);
        } else expect(input.GetItemIfSet(120, false)).toBeUndefined();
        if (mode !== "table") {
          expect(input.GetItemIfSet(129, false)).toBeInstanceOf(SwFormatRowSplit);
          expect(input.Get(129).QueryValue()).toBe(true);
        } else expect(input.GetItemIfSet(129, false)).toBeUndefined();
        const finalFormat = mode === "row" ? f.format : { ...f.format, layoutSplit: false },
          finalRows =
            mode === "table"
              ? f.rowFormats
              : f.rowFormats.map(
                  /** Computes independent expected native row attributes. @param format - Original format. @param index - Row index. @returns Expected format. */ (
                    format,
                    index,
                  ) =>
                    selected && index !== 0
                      ? format
                      : nativeRowFormatForTest({ ...format, keepTogether: false }),
                );
        expect(f.table.GetFormat()).toStrictEqual(finalFormat);
        expect(
          f.rows.map(
            /** Reads actual row attributes. @param row - Original owner. @returns Format. */ (
              row,
            ) => row.GetFormat(),
          ),
        ).toStrictEqual(finalRows);
        expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
        for (let cycle = 0; cycle < 2; cycle++) {
          act(
            /** Undoes one original native transaction. @returns Nothing. */ () => {
              expect(f.shell.Undo()).toBe(true);
            },
          );
          expect(f.table.GetFormat()).toStrictEqual(f.format);
          expect(
            f.rows.map(
              /** Reads restored original attributes. @param row - Native line. @returns Format. */ (
                row,
              ) => row.GetFormat(),
            ),
          ).toStrictEqual(f.rowFormats);
          act(
            /** Redoes one original native transaction. @returns Nothing. */ () => {
              expect(f.shell.Redo()).toBe(true);
            },
          );
          expect(f.table.GetFormat()).toStrictEqual(finalFormat);
          expect(
            f.rows.map(
              /** Reads redone row attributes. @param row - Native line. @returns Format. */ (
                row,
              ) => row.GetFormat(),
            ),
          ).toStrictEqual(finalRows);
          expect(f.shell.CaptureCursorState()).toEqual(f.cursor);
          for (const [i, row] of f.rows.entries()) {
            expect(f.table.GetTabLines()[i]).toBe(row);
            expect(row.GetTabBoxes()[0]).toBe(f.boxes[i]);
          }
          expect(required(f.boxes[0]).GetParagraphs()[0]).toBe(f.node);
          expect(f.node.GetText()).toBe("Original cell");
        }
      },
    );
  }
it.each([false, true])(
  "mounted split Reset retains omitted defaults and zero history selected=%s",
  /** Checks changed native items are removed before acceptance. @param selected - Original selection. @returns Nothing. */ (
    selected,
  ) => {
    const f = fixture(selected);
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Allow row to break across pages and columns" }),
    );
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Allow table to split across pages and columns" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(accepted(f).Count()).toBe(0);
    expect(f.table.GetFormat()).toStrictEqual(f.format);
    expect(
      f.rows.map(
        /** Reads unchanged original row attributes. @param row - Native owner. @returns Format. */ (
          row,
        ) => row.GetFormat(),
      ),
    ).toStrictEqual(f.rowFormats);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(f.shell.CaptureCursorState()).toEqual(f.cursor);
  },
);
