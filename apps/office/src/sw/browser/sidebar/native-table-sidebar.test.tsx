/** @fileoverview Checks actual table sidebar metric slots, alignment sensitivity and module unit display. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { TableEditPanel } from "./TableEditPanel";
import { createWriterDocumentSession } from "../composition/writer-module";
import { createBrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { getWriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { SwPosition } from "../../source/core/crsr/pam";
import { HoriOrientation as H } from "../../../offapi/com/sun/star/text/HoriOrientation";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases subscriptions before native views. @returns Nothing. */
  () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Mounts the production source over an actual current cell. @param unit - Module display unit. @returns Actual graph. */
function fixture(unit = FieldUnit.CM) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell(),
    doc = shell.GetDoc(),
    table = doc.nodes.MakeTableNode("UI", { width: 6000, horiOrient: H.LEFT });
  for (const width of [2000, 4000]) table.AddColumnWidth(width);
  doc.nodes.AppendTableRow(table, 2);
  const node = table.GetTabLines()[0]?.GetTabBoxes()[1]?.GetParagraphs()[0];
  if (!node) throw new Error("Missing table UI cell");
  const position = new SwPosition(node, 0);
  shell.SetCursor(position);
  position.Dispose();
  doc.GetUndoManager().Clear();
  render(
    <TableEditPanel
      title="Table"
      resolveArguments={
        /** Supplies no arguments for existing action buttons. @returns No payload. */
        () => undefined
      }
      unit={unit}
      commandSource={createBrowserCommandSource(session.view.GetViewFrame())}
      getCommandResource={getWriterCommandResource}
    />,
  );
  return { session, shell, table, doc };
}
it("changes current width and row height through native metric parsing" /** Checks inch suffix input and original model owners. @returns Nothing. */, () => {
  const f = fixture(FieldUnit.INCH);
  expect(screen.getByRole("spinbutton", { name: "Column width" })).toHaveValue("2.78″");
  fireEvent.change(screen.getByRole("spinbutton", { name: "Row height" }), {
    target: { value: "0.5 in" },
  });
  expect(f.shell.GetRowHeight()?.GetHeight()).toBe(720);
  fireEvent.change(screen.getByRole("spinbutton", { name: "Column width" }), {
    target: { value: "3 in" },
  });
  expect(f.table.GetColumnWidths()).toEqual([1680, 4320]);
});
it("preserves native alignment list order, field sensitivity and coupled spacing" /** Checks actual dispatcher state feedback. @returns Nothing. */, () => {
  const f = fixture();
  expect(
    screen.getAllByRole("option").map(
      /** Reads native choice labels. @param option - Option. @returns Label. */
      (option) => option.textContent,
    ),
  ).toEqual(["Automatic", "Left", "From left", "Right", "Center", "Manual"]);
  const alignment = screen.getByRole("combobox", { name: "Table alignment" });
  fireEvent.change(alignment, { target: { value: String(H.FULL) } });
  expect(screen.getByRole("spinbutton", { name: "Left spacing" })).toBeDisabled();
  expect(screen.getByRole("spinbutton", { name: "Right spacing" })).toBeDisabled();
  fireEvent.change(alignment, { target: { value: String(H.NONE) } });
  fireEvent.change(screen.getByRole("spinbutton", { name: "Left spacing" }), {
    target: { value: "1 cm" },
  });
  fireEvent.change(screen.getByRole("spinbutton", { name: "Right spacing" }), {
    target: { value: "2 cm" },
  });
  const lr = f.table.GetFrameFormat().GetLRSpace(),
    total = lr.ResolveLeft() + lr.ResolveRight();
  fireEvent.change(alignment, { target: { value: String(H.CENTER) } });
  expect(f.table.GetFrameFormat().GetLRSpace().ResolveLeft()).toBe(Math.trunc(total / 2));
  expect(screen.getByRole("spinbutton", { name: "Left spacing" })).toBeEnabled();
  expect(screen.getByRole("spinbutton", { name: "Right spacing" })).toBeDisabled();
});

it("applies every native alignment conversion and enters enabled content from its title" /** Checks left/right sums and source sensitivity through real state notifications. @returns Nothing. */, () => {
  const f = fixture(),
    selector = screen.getByRole("combobox", { name: "Table alignment" });
  fireEvent.keyDown(screen.getByRole("button", { name: "Table" }), {
    key: "Enter",
  });
  expect(screen.getByRole("button", { name: "Insert Rows Above" })).toHaveFocus();
  for (const alignment of [H.LEFT, H.RIGHT, H.LEFT_AND_WIDTH, H.NONE]) {
    fireEvent.change(selector, { target: { value: String(alignment) } });
    expect(f.table.GetFrameFormat().GetHoriOrient().GetHoriOrient()).toBe(alignment);
    expect(screen.getByRole("spinbutton", { name: "Left spacing" })).toHaveProperty(
      "disabled",
      alignment === H.LEFT,
    );
    expect(screen.getByRole("spinbutton", { name: "Right spacing" })).toHaveProperty(
      "disabled",
      alignment === H.RIGHT || alignment === H.LEFT_AND_WIDTH,
    );
  }
});
it("shows empty disabled native metrics outside a represented table context" /** Checks unset binding values rather than synthesized defaults. @returns Nothing. */, () => {
  const session = createWriterDocumentSession();
  sessions.push(session);
  render(
    <TableEditPanel
      title="Table"
      unit={FieldUnit.CM}
      resolveArguments={
        /** Supplies no action payload. @returns Nothing. */
        () => undefined
      }
      commandSource={createBrowserCommandSource(session.view.GetViewFrame())}
      getCommandResource={getWriterCommandResource}
    />,
  );
  expect(screen.getByRole("spinbutton", { name: "Row height" })).toBeDisabled();
  expect(screen.getByRole("spinbutton", { name: "Row height" })).toHaveValue("");
  expect(screen.getByRole("combobox", { name: "Table alignment" })).toHaveValue("");
  fireEvent.keyDown(screen.getByRole("button", { name: "Table" }), {
    key: "Enter",
  });
});

it("preserves blank native state defaults at the browser controller boundary" /** Checks incomplete enabled controller items and equivalent saved spacing values. @returns Nothing. */, () => {
  const execute = vi.fn(
    /** Captures typed browser dispatch without substituting core behavior. @param commandId - Slot. @returns Result. */
    (commandId: string) => ({ commandId, status: "executed" as const, value: true }),
  );
  const state = { enabled: true };
  render(
    <TableEditPanel
      title="Table"
      unit={FieldUnit.CM}
      resolveArguments={
        /** Supplies no toolbar payload. @returns Nothing. */
        () => undefined
      }
      commandSource={{
        Execute: execute,
        QueryCommand:
          /** No toolbar descriptor is required for the metric boundary. @returns No command. */
          () => undefined,
        CreateControllerItem:
          /** Supplies a real adapter contract with unset state. @returns Controller. */
          () => ({
            GetState:
              /** Reads stable blank state. @returns State. */
              () => state,
            Subscribe:
              /** Retains no model subscription in this port-level fixture. @returns Cleanup. */
              () =>
                /** Disposes the fixture observer. @returns Nothing. */
                () =>
                  undefined,
            Dispose:
              /** Disposes the controller. @returns Nothing. */
              () => undefined,
          }),
      }}
      getCommandResource={getWriterCommandResource}
    />,
  );
  fireEvent.change(screen.getByRole("combobox", { name: "Table alignment" }), {
    target: { value: String(H.NONE) },
  });
  fireEvent.change(screen.getByRole("spinbutton", { name: "Left spacing" }), {
    target: { value: "1 cm" },
  });
  fireEvent.change(screen.getByRole("spinbutton", { name: "Right spacing" }), {
    target: { value: "2 cm" },
  });
  expect(execute).toHaveBeenCalledTimes(3);
  const last = execute.mock.calls[2];
  expect(last?.[0]).toBe(".uno:TableAlignment");
});
it("does not dispatch a saved spacing value under another valid unit suffix" /** Checks native get_value_changed_from_saved behavior. @returns Nothing. */, () => {
  const f = fixture();
  fireEvent.change(screen.getByRole("combobox", { name: "Table alignment" }), {
    target: { value: String(H.NONE) },
  });
  fireEvent.change(screen.getByRole("spinbutton", { name: "Left spacing" }), {
    target: { value: "1 cm" },
  });
  const before = f.doc.GetUndoManager().GetUndoActionCount();
  fireEvent.change(screen.getByRole("spinbutton", { name: "Left spacing" }), {
    target: { value: "10 mm" },
  });
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(before);
});
