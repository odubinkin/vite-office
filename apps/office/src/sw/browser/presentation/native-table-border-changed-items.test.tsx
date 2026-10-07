/** @fileoverview Verifies native changed-item admission preserves heterogeneous cell borders, history and original selection. */
for (const mode of ["border-only", "row-split-only", "both"] as const)
  it(
    "native original cursor history before temporary border selection mode=" + mode,
    /** Checks nonzero original endpoints and pending attributes rather than temporary whole-table points. @returns Nothing. */ () => {
      const f = fixture();
      try {
        const node = required(required(f.boxes[2]).GetParagraphs()[0]);
        node.SetText("Other");
        f.shell.FocusNode(node);
        f.session.view
          .GetEditWin()
          .SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 2 } });
        expect(f.shell.SetRowSplit(true)).toBe(true);
        f.doc.GetUndoManager().Clear();
        const before = f.shell.CaptureCursorState(),
          cursor = f.shell.getShellCursor();
        expect(
          ItemSetToTableParam(f.shell, {
            width: 6000,
            columnWidths: [3000, 3000],
            minRowHeight: 0,
            headerRows: 0,
            repeatHeaderRows: false,
            ...(mode === "row-split-only" ? {} : { border: "none", padding: 0 }),
            ...(mode === "border-only" ? {} : { rowSplit: false }),
          }),
        ).toBe(true);
        expect(f.shell.getShellCursor()).toBe(cursor);
        expect(f.shell.CaptureCursorState().point).toEqual(before.point);
        expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
        for (let cycle = 0; cycle < 3; cycle++) {
          expect(f.shell.Undo()).toBe(true);
          expect(f.shell.CaptureCursorState().point).toEqual(before.point);
          expect(
            f.shell.GetPendingCharacterItems().Equals(before.pendingCharacterItems, true),
          ).toBe(true);
          expect(f.shell.Redo()).toBe(true);
          expect(f.shell.CaptureCursorState().point).toEqual(before.point);
          expect(node.GetText()).toBe("Other");
        }
      } finally {
        f.session.Close();
      }
    },
  );
import {
  nativeTableInputForTest,
  nativeBoxFormat,
  tableBorderItems,
} from "../../../test/table-box-test-helpers";
import { RES_BOX } from "../../inc/hintids";
import { SvxBoxItem } from "../../../editeng/source/items/frmitems";
import { exportBorderShorthand } from "../../../xmloff/source/style/bordrhdl";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterTableDialog } from "./WriterTableDialog";
import { ItemSetToTableParam } from "../../source/uibase/shells/tabsh";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { readOdtDocument } from "../../source/filter/xml/swxml";
afterEach(cleanup);
/** Requires a native owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing border owner");
  return value;
}
/** Creates independently authored cell formats over original native nodes. @param selected - Capture selected-row input before opening. @returns Actual owners. */
function fixture(selected = false) {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    table = doc.nodes.MakeTableNode("Borders", { width: 6000 }, doc.paragraphs[0]);
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  for (let r = 0; r < 2; r++)
    doc.nodes.AppendTableRow(table, 2, {}, [
      nativeBoxFormat({ padding: 567, border: "1pt solid #000000" }),
      nativeBoxFormat({ padding: 1134, border: "none" }),
    ]);
  const boxes = table
      .GetTabLines()
      .flatMap(
        /** Reads original cells. @param row - Original line. @returns Native boxes. */ (row) =>
          row.GetTabBoxes(),
      ),
    node = required(required(boxes[0]).GetParagraphs()[0]);
  node.SetText("Cell");
  doc.EnsureNumRule("Numbering", "numbered");
  node.SetNumRule("Numbering");
  node.SetListId("border-list");
  shell.FocusNode(node);
  shell.ToggleCharacterFormat("bold");
  doc.GetUndoManager().Clear();
  if (selected) expect(shell.SelectTableRow()).toBe(true);
  const submit = vi.fn();
  render(
    <WriterTableDialog
      table={table}
      borderItems={nativeTableInputForTest(table, selected ? shell.GetTableSel() : undefined)}
      availableWidth={6000}
      boxAlign={shell.GetBoxAlign()}
      onSubmit={submit}
      onCancel={vi.fn()}
    />,
  );
  return { session, doc, shell, table, boxes, node, submit };
}
/** Reads authored border and distance values. @param f - Actual fixture. @returns Independent scalar values. */
function values(f: ReturnType<typeof fixture>) {
  return f.boxes.map(
    /** Reads original box values. @param box - Original cell. @returns Authored values. */ (box) =>
      box.GetBox().QueryValue(),
  );
}
for (const mode of ["untouched", "reset", "change-back"] as const)
  it(
    "native border controls omit untouched fields mode=" + mode,
    /** Checks omission rather than clearing or homogeneous first-cell rewrites. @returns Nothing. */ () => {
      const f = fixture();
      try {
        const original = values(f),
          before = f.shell.CaptureCursorState(),
          setter = vi.spyOn(f.shell, "SetTabBorders");
        if (mode !== "untouched") {
          fireEvent.click(screen.getByRole("tab", { name: "Borders" }));
          fireEvent.click(screen.getByRole("button", { name: "No Borders" }));
          fireEvent.change(screen.getByRole("spinbutton", { name: "Top padding (cm)" }), {
            target: { value: "3" },
          });
          if (mode === "reset") fireEvent.click(screen.getByRole("button", { name: "Reset" }));
          else {
            fireEvent.click(screen.getByRole("button", { name: "Reset" }));
            fireEvent.change(screen.getByRole("spinbutton", { name: "Top padding (cm)" }), {
              target: { value: "0" },
            });
          }
        }
        fireEvent.click(screen.getByRole("button", { name: "OK" }));
        const input = required(f.submit.mock.calls[0]?.[0]);
        expect(input).not.toHaveProperty("border");
        expect(input).not.toHaveProperty("padding");
        expect(ItemSetToTableParam(f.shell, input)).toBe(true);
        expect(setter).toHaveBeenCalledOnce();
        expect(input.borderItems?.GetItemIfSet(RES_BOX)).toBeUndefined();
        expect(values(f)).toEqual(original);
        expect(f.shell.CaptureCursorState().point).toEqual(before.point);
        expect(f.shell.GetPendingCharacterItems().Equals(before.pendingCharacterItems, true)).toBe(
          true,
        );
      } finally {
        f.session.Close();
      }
    },
  );
for (const field of ["border", "padding"] as const)
  for (const selected of [false, true])
    it(
      "native represented complete box item history field=" + field + " selected=" + selected,
      /** Checks explicit field admission, selected scope, original graph and repeated history. @returns Completion. */ async () => {
        const f = fixture(selected);
        try {
          const cursor = f.shell.getShellCursor(),
            before = f.shell.CaptureCursorState(),
            original = values(f);
          fireEvent.click(screen.getByRole("tab", { name: "Borders" }));
          if (field === "border")
            fireEvent.click(screen.getByRole("button", { name: "No Borders" }));
          else
            fireEvent.change(screen.getByRole("spinbutton", { name: "Top padding (cm)" }), {
              target: { value: "0" },
            });
          fireEvent.click(screen.getByRole("button", { name: "OK" }));
          const input = required(f.submit.mock.calls[0]?.[0]);
          const boxItem = input.borderItems?.GetItemIfSet(RES_BOX) as SvxBoxItem;
          if (field === "border") {
            expect(boxItem).toBeInstanceOf(SvxBoxItem);
            expect(exportBorderShorthand(boxItem.GetTop())).toBe("none");
            for (const edge of [0, 1, 2, 3]) expect(boxItem.GetDistance(edge)).toBe(0);
          } else expect(boxItem).toBeUndefined();
          expect(ItemSetToTableParam(f.shell, input)).toBe(true);
          expect(f.shell.getShellCursor()).toBe(cursor);
          expect(f.shell.IsTableMode()).toBe(selected);
          expect(f.shell.CaptureCursorState().point).toEqual(before.point);
          expect(f.shell.CaptureCursorState().mark).toEqual(before.mark);
          expect(
            f.shell.GetPendingCharacterItems().Equals(before.pendingCharacterItems, true),
          ).toBe(true);
          expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
          const expected = original.map(
            /** Computes literal selected field expectations. @param pair - Original values. @param i - Original box index. @returns Expected values. */ (
              pair,
              i,
            ) =>
              field === "border" && (!selected || i < 2)
                ? required(
                    nativeBoxFormat(
                      {
                        border: field === "border" || i % 2 === 1 ? "none" : "1pt solid #000000",
                        padding: 0,
                      },
                      field === "border" || i % 2 === 1 ? [] : [3],
                    ).box,
                  ).QueryValue()
                : pair,
          );
          for (let cycle = 0; cycle < 3; cycle++) {
            expect(values(f)).toEqual(expected);
            expect(f.shell.Undo()).toBe(true);
            expect(values(f)).toEqual(original);
            expect(f.shell.Redo()).toBe(true);
            expect(f.boxes[0]?.GetParagraphs()[0]).toBe(f.node);
            expect(f.shell.IsTableMode()).toBe(selected);
          }
          const reopened = await readOdtDocument(writeOdtDocument(f.doc, { title: "Borders" }), {
              title: "Borders",
            }),
            restored = required(reopened.document.GetTables()[0])
              .GetTabLines()
              .flatMap(
                /** Reads restored boxes. @param row - Native line. @returns Restored boxes. */ (
                  row,
                ) => row.GetTabBoxes(),
              );
          expect(
            restored.map(
              /** Reads independent persisted fields. @param box - Restored owner. @returns Values. */ (
                box,
              ) => box.GetBox().QueryValue(),
            ),
          ).toEqual(expected);
          f.shell.ClearMark();
          f.session.view
            .GetEditWin()
            .SetSelection({ point: { nodeIndex: f.node.GetIndex(), contentIndex: 2 } });
          f.session.view.GetEditWin().InsertText("X");
          expect([f.node.GetText(), f.node.GetListId(), f.node.GetNumRuleName()]).toEqual([
            "CeXll",
            "border-list",
            "Numbering",
          ]);
        } finally {
          f.session.Close();
        }
      },
    );
it("native absent border payload never invokes shell mutation for undefined keys", /** Checks explicit compatibility carriers cannot erase authored attributes. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const original = values(f),
      setter = vi.spyOn(f.shell, "SetTabBorders");
    expect(
      ItemSetToTableParam(f.shell, {
        width: 6000,
        columnWidths: [3000, 3000],
        minRowHeight: 0,
        headerRows: 0,
        repeatHeaderRows: false,
        padding: undefined,
        border: undefined,
      }),
    ).toBe(true);
    expect(setter).not.toHaveBeenCalled();
    expect(values(f)).toEqual(original);
  } finally {
    f.session.Close();
  }
});

it("native untouched acceptance skips temporary selection with nonzero original history endpoints", /** Checks changed-item omission feeds source conditional caller admission and stable grouped cursor history. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const node = required(required(f.boxes[2]).GetParagraphs()[0]);
    node.SetText("Other");
    f.shell.FocusNode(node);
    f.session.view
      .GetEditWin()
      .SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 2 } });
    const before = f.shell.CaptureCursorState(),
      original = values(f),
      push = vi.spyOn(f.shell, "Push"),
      border = vi.spyOn(f.shell, "SetTabBorders"),
      split = vi.spyOn(f.shell, "SetRowSplit");
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    const input = required(f.submit.mock.calls[0]?.[0]);
    expect(input).not.toHaveProperty("border");
    expect(input).not.toHaveProperty("padding");
    expect(ItemSetToTableParam(f.shell, input)).toBe(true);
    expect(push).toHaveBeenCalledOnce();
    expect(border).toHaveBeenCalledOnce();
    expect(input.borderItems?.GetItemIfSet(RES_BOX)).toBeUndefined();
    expect(split).not.toHaveBeenCalled();
    expect(values(f)).toEqual(original);
    expect(f.shell.Undo()).toBe(true);
    expect(f.shell.CaptureCursorState().point).toEqual(before.point);
    expect(f.shell.Redo()).toBe(true);
    expect(f.shell.CaptureCursorState().point).toEqual(before.point);
    expect(values(f)).toEqual(original);
  } finally {
    f.session.Close();
  }
});
it("represented direct border admission retains nonzero ordinary history and original cell identities", /** Checks the existing scalar shell entry point still records displayed cursor without temporary selection. @returns Nothing. */ () => {
  const f = fixture();
  try {
    f.session.view
      .GetEditWin()
      .SetSelection({ point: { nodeIndex: f.node.GetIndex(), contentIndex: 2 } });
    const before = f.shell.CaptureCursorState(),
      original = values(f);
    expect(
      f.shell.SetTabBorders(
        tableBorderItems(
          f.shell.GetDoc(),
          { border: "none", padding: 0 },
          f.shell.GetCursor(false),
        ),
      ),
    ).toBe(true);
    expect(f.shell.IsTableMode()).toBe(false);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(f.shell.Undo()).toBe(true);
    expect(values(f)).toEqual(original);
    expect(f.shell.CaptureCursorState().point).toEqual(before.point);
    expect(f.shell.Redo()).toBe(true);
    expect(f.shell.CaptureCursorState().point).toEqual(before.point);
    expect(f.boxes[0]?.GetParagraphs()[0]).toBe(f.node);
  } finally {
    f.session.Close();
  }
});
