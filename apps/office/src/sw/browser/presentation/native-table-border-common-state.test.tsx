/** @fileoverview Checks native table-property input through the mounted workbench and owned dialog drafts. */
import { cleanup, fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { selectMountedTableRow } from "../../../../test-support/table-mouse-dom";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { WriterTableDialog } from "./WriterTableDialog";
import {
  SvxBoxItem,
  SvxBoxInfoItem,
  SvxBoxInfoItemValidFlags as Flags,
} from "../../../editeng/source/items/frmitems";
import { SvxBorderLine } from "../../../editeng/source/items/borderline";
import { RES_BOX } from "../../inc/hintids";
import { SID_ATTR_BORDER_INNER } from "../../../svx/inc/svxids";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { TableParamToItemSet } from "../../source/uibase/shells/tabsh";
import { exportBorderShorthand } from "../../../xmloff/source/style/bordrhdl";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases actual mounted owners. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Requires original connected values. @param value - Optional owner. @returns Actual value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing UI border owner");
  return value;
}
/** Creates visibly different rows with four authored distances. @returns Original document and editing shell. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    table = doc.nodes.MakeTableNode("CommonUI", { width: 6000 }, doc.paragraphs[0]);
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const boxes = [];
  for (let row = 0; row < 2; row++)
    for (const cell of doc.nodes.AppendTableRow(table, 2).GetTabBoxes()) {
      const box = new SvxBoxItem(RES_BOX);
      for (const edge of [0, 1, 2, 3]) {
        box.SetDistance((row + 1) * 100 + edge * 10, edge);
        box.SetLine(
          new SvxBorderLine(
            row === 0 ? (boxes.length === 0 ? 0x123456 : 0xabcdef) : 0x654321,
            row === 0 ? 20 : 40,
          ),
          edge,
        );
      }
      cell.SetFormat({ box });
      required(cell.GetParagraphs()[0]).SetText("Original " + boxes.length);
      boxes.push(cell);
    }
  shell.FocusNode(required(boxes[0]?.GetParagraphs()[0]));
  return { session, doc, shell, table, boxes };
}
/** Opens actual properties and its native Borders page. @returns Nothing. */
function openBorders(): void {
  fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
  fireEvent.click(screen.getByRole("tab", { name: "Borders" }));
}
for (const selected of [false, true])
  it(
    "reads native common input rather than first cell selected=" + selected,
    /** Checks actual command capture and cursor/history restoration. @returns Nothing. */ () => {
      const f = fixture();
      render(<WriterWorkbench isActive view={f.session.view} />);
      if (selected) selectMountedTableRow("CommonUI", 2);
      else fireEvent.focus(screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }));
      const cursor = f.shell.getShellCursor(),
        state = f.shell.CaptureCursorState(),
        revision = f.doc.GetDocumentStateManager().GetModelRevision();
      openBorders();
      expect(screen.getByRole("spinbutton", { name: "Top padding (cm)" })).toHaveValue(
        selected ? 0.35 : 0,
      );
      expect(screen.getByRole("button", { name: "Top border" })).toHaveAttribute(
        "data-writer-border-state",
        selected ? "0" : "2",
      );
      if (selected)
        expect(
          screen.getByRole("button", { name: "Top border" }).querySelector("span"),
        ).toHaveStyle({ borderTop: "2pt solid #654321" });
      expect(f.shell.getShellCursor()).toBe(cursor);
      expect(f.shell.CaptureCursorState()).toEqual(state);
      expect(f.doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(f.shell.IsTableMode()).toBe(selected);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    },
  );
it("retains four native distances on border-only selected-row acceptance and original graph through history", /** Checks preferred item carrier rather than scalar reconstruction. @returns Nothing. */ () => {
  const f = fixture();
  render(<WriterWorkbench isActive view={f.session.view} />);
  selectMountedTableRow("CommonUI", 2);
  const original = f.boxes.map(
    /** Retains original complete item. @param cell - Owner. @returns Item. */ (cell) =>
      cell.GetBox(),
  );
  openBorders();
  fireEvent.click(screen.getByRole("button", { name: "No Borders" }));
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  for (const [i, cell] of f.boxes.entries())
    for (const edge of [0, 1, 2, 3]) {
      expect(cell.GetBox().GetDistance(edge)).toBe(required(original[i]).GetDistance(edge));
      if (i >= 2) expect(cell.GetBox().GetLine(edge)).toBeUndefined();
      else expect(cell.GetBox().equals(required(original[i]))).toBe(true);
    }
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  for (let cycle = 0; cycle < 3; cycle++) {
    act(
      /** Restores original graph and selected row. @returns Nothing. */ () => {
        expect(f.shell.Undo()).toBe(true);
      },
    );
    for (const [i, cell] of f.boxes.entries())
      expect(cell.GetBox().equals(required(original[i]))).toBe(true);
    act(
      /** Reapplies native output. @returns Nothing. */ () => {
        expect(f.shell.Redo()).toBe(true);
      },
    );
    expect(f.shell.IsTableMode()).toBe(true);
    expect(f.table.GetTabLines()[1]?.GetTabBoxes()[0]).toBe(f.boxes[2]);
  }
});
it("Reset restores mixed input and unrelated acceptance publishes no border payload", /** Checks source saved-value semantics without erasing heterogeneous boxes. @returns Nothing. */ () => {
  const f = fixture(),
    submit = vi.fn();
  const input = TableParamToItemSet(f.shell);
  render(
    <WriterTableDialog
      table={f.table}
      borderItems={input}
      availableWidth={6000}
      onCancel={vi.fn()}
      onSubmit={submit}
    />,
  );
  fireEvent.click(screen.getByRole("tab", { name: "Borders" }));
  fireEvent.click(screen.getByRole("button", { name: "No Borders" }));
  fireEvent.change(screen.getByRole("spinbutton", { name: "Top padding (cm)" }), {
    target: { value: "1" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Reset" }));
  expect(screen.getByRole("button", { name: "Top border" })).toHaveAttribute(
    "data-writer-border-state",
    "2",
  );
  expect(screen.getByRole("spinbutton", { name: "Top padding (cm)" })).toHaveValue(0);
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(submit.mock.calls[0]?.[0]?.borderItems?.GetItemIfSet(RES_BOX)).toBeUndefined();
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
for (const nativeInput of ["absent", "box-only", "mixed"] as const)
  it(
    "owns native dialog fallback and partial output input=" + nativeInput,
    /** Checks pool defaults, optional info, unknown lines and mixed draft restoration. @returns Nothing. */ () => {
      const f = fixture(),
        submit = vi.fn(),
        input = new SfxItemSet(f.doc.GetAttrPool(), [
          [RES_BOX, RES_BOX],
          [SID_ATTR_BORDER_INNER, SID_ATTR_BORDER_INNER],
        ]),
        box = new SvxBoxItem(RES_BOX),
        info = new SvxBoxInfoItem(SID_ATTR_BORDER_INNER);
      box.SetLine(new SvxBorderLine(0x13579b, 13), 0);
      for (const edge of [0, 1, 2, 3]) box.SetDistance(50 + edge * 20, edge);
      input.Put(box);
      info.SetDist(true);
      info.SetTable(true);
      if (nativeInput === "mixed") {
        info.SetValid(Flags.TOP, false);
        input.Put(info);
      }
      render(
        <WriterTableDialog
          table={f.table}
          {...(nativeInput === "absent" ? {} : { borderItems: input })}
          availableWidth={6000}
          onCancel={vi.fn()}
          onSubmit={submit}
        />,
      );
      fireEvent.click(screen.getByRole("tab", { name: "Borders" }));
      expect(screen.getByRole("button", { name: "Top border" })).toHaveAttribute(
        "data-writer-border-state",
        nativeInput === "absent" ? "1" : nativeInput === "mixed" ? "2" : "0",
      );
      if (nativeInput === "box-only")
        expect(
          screen.getByRole("button", { name: "Top border" }).querySelector("span"),
        ).toHaveStyle({ borderTop: exportBorderShorthand(box.GetTop()) });
      if (!(screen.getByRole("checkbox", { name: "Synchronize" }) as HTMLInputElement).checked)
        fireEvent.click(screen.getByRole("checkbox", { name: "Synchronize" }));
      fireEvent.change(screen.getByRole("spinbutton", { name: "Top padding (cm)" }), {
        target: { value: "0.2" },
      });
      if (nativeInput === "mixed") {
        fireEvent.click(screen.getByRole("button", { name: "Top border" }));
        fireEvent.click(screen.getByRole("button", { name: "Top border" }));
      }
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      const output = required(submit.mock.calls[0]?.[0]?.borderItems as SfxItemSet | undefined),
        next = output.Get(RES_BOX) as SvxBoxItem,
        flags = (output.GetItemIfSet(SID_ATTR_BORDER_INNER) ??
          input.Get(SID_ATTR_BORDER_INNER)) as SvxBoxInfoItem;
      for (const edge of [0, 1, 2, 3]) expect(next.GetDistance(edge)).toBe(113);
      expect(next.GetTop()?.toJSON()).toEqual(
        nativeInput === "absent" || nativeInput === "mixed" ? undefined : box.GetTop()?.toJSON(),
      );
      expect(flags.IsValid(Flags.TOP)).toBe(nativeInput !== "mixed");
      expect(flags.IsValid(Flags.DISTANCE)).toBe(true);
      expect(box.GetDistance(0)).toBe(50);
      expect(submit.mock.calls[0]?.[0]).not.toHaveProperty("padding");
      expect(submit.mock.calls[0]?.[0]).not.toHaveProperty("border");
    },
  );
