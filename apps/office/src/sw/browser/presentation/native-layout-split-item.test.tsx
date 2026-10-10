/** @fileoverview Verifies actual native split ItemSet input through mounted Text Flow and shell-owned properties. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { SwDoc } from "../../source/core/doc/doc";
import { SwFormatLayoutSplit } from "../../inc/fmtlsplt";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { WriterTableDialog } from "./WriterTableDialog";
import { WriterWorkbench } from "./writer-view";
import { createWriterDocumentSession } from "../composition/writer-module";
import { SwPosition } from "../../source/core/crsr/pam";
const label = "Allow table to split across pages and columns";
/** Requires an original native owner. @param value - Optional original owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing mounted split owner");
  return value;
}
it.each(["false", "true", "absent", "inherited", "invalid", "disabled"])(
  "mounted Text Flow honors native direct dialog input %s",
  /** Checks direct native input and changed-only original output. @param state - Native input state. @returns Nothing. */ (
    state,
  ) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("NativeInput", { width: 6000, layoutSplit: false }),
      input = new SfxItemSet(doc.GetAttrPool(), [[1, 32767]]),
      parent = new SfxItemSet(doc.GetAttrPool(), [[120, 120]]),
      submit = vi.fn(),
      cancel = vi.fn();
    table.AddColumnWidth(6000);
    doc.nodes.AppendTableRow(table, 1);
    parent.Put(new SwFormatLayoutSplit(false));
    input.SetParent(parent);
    if (state === "false" || state === "true") input.Put(new SwFormatLayoutSplit(state === "true"));
    if (state === "invalid") input.InvalidateItem(120);
    if (state === "disabled") input.DisableItem(120);
    if (state === "absent") input.SetParent(undefined);
    try {
      render(
        <WriterTableDialog
          table={table}
          borderItems={input}
          availableWidth={6000}
          onSubmit={submit}
          onCancel={cancel}
        />,
      );
      fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
      const checkbox = screen.getByRole("checkbox", { name: label });
      expect(checkbox).toHaveProperty("checked", state !== "false");
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      expect(submit.mock.calls[0]?.[0]).not.toHaveProperty("layoutSplit");
      expect(submit.mock.calls[0]?.[0].items.GetItemIfSet(120, false)).toBeUndefined();
      fireEvent.click(checkbox);
      fireEvent.click(screen.getByRole("tab", { name: "Table" }));
      fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
      expect(screen.getByRole("checkbox", { name: label })).toHaveProperty(
        "checked",
        state === "false",
      );
      fireEvent.click(screen.getByRole("button", { name: "Reset" }));
      expect(screen.getByRole("checkbox", { name: label })).toHaveProperty(
        "checked",
        state !== "false",
      );
      fireEvent.click(screen.getByRole("checkbox", { name: label }));
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      const output = submit.mock.calls.at(-1)?.[0];
      expect(output.layoutSplit).toBe(state === "false");
      expect(output.items.Get(120)).toBeInstanceOf(SwFormatLayoutSplit);
      expect(output.items.Get(120).GetValue()).toBe(state === "false");
      expect(table.GetFormat().layoutSplit).toBe(false);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    } finally {
      cleanup();
      doc.Dispose();
    }
  },
);
it.each([false, true])(
  "mounted properties receive shell effective native split input inherited=%s",
  /** Checks direct and inherited native bool through actual table properties acceptance/history. @param inherited - Original native parent owns false. @returns Nothing. */ (
    inherited,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    try {
      const table = doc.nodes.MakeTableNode(
        "MountedSplit",
        { width: 6000 },
        required(doc.paragraphs[0]),
      );
      table.AddColumnWidth(6000);
      const row = doc.nodes.AppendTableRow(table, 1),
        box = required(row.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]),
        owner = table.GetFrameFormat();
      node.SetText("Original mounted split");
      if (inherited) {
        const parent = doc.GetDfltFrameFormat();
        parent.SetFormatAttr(new SwFormatLayoutSplit(false));
        owner.SetDerivedFrom(parent);
      } else owner.SetFormatAttr(new SwFormatLayoutSplit(false));
      const position = new SwPosition(node, 2);
      shell.SetCursor(position);
      position.Dispose();
      const cursor = shell.CaptureCursorState();
      doc.GetUndoManager().Clear();
      render(<WriterWorkbench isActive view={session.view} />);
      fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
      fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
      expect(screen.getByRole("checkbox", { name: label })).not.toBeChecked();
      fireEvent.click(screen.getByRole("checkbox", { name: label }));
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      expect((owner.GetAttrSet().Get(120) as SwFormatLayoutSplit).GetValue()).toBe(true);
      expect(table.GetFormat().layoutSplit).toBe(true);
      expect(table.GetTabLines()[0]).toBe(row);
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(shell.CaptureCursorState()).toEqual(cursor);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    } finally {
      cleanup();
      session.Close();
    }
  },
);
