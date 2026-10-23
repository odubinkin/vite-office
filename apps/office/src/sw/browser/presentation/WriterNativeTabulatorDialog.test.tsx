/** @fileoverview Real Writer request, native CUI controls, complete paragraph history and ODT transport in one UI flow. */
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { TabulatorDialogSession } from "../../../cui/browser/tabpages/tabstpge-session";
import { WriterParagraphDialog } from "./WriterParagraphDialog";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { RES_PARATR_TABSTOP as T } from "../../inc/hintids";
import { SvxTabStopItem, SvxTabAdjust as A } from "../../../editeng/inc/tstpitem";
import { FieldUnit as U } from "../../../tools/inc/fldunit";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { readOdtDocument } from "../../source/filter/xml/swxml";
/** Opens a real asynchronous Writer command and renders its actual pending request. @param unit - Module unit. @returns Real owners and command completion. */
function open(unit = U.CM) {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell(),
    dialogs = session.view.GetDialogController();
  shell.Insert("Native\ttabs");
  const result = session.view.Execute(WRITER_COMMAND_IDS.paragraphDialog);
  if (result.status !== "executed") throw new Error("Missing actual paragraph command");
  const pending = dialogs.GetSnapshot();
  if (pending?.request.kind !== "paragraph") throw new Error("Missing actual paragraph request");
  render(
    <WriterParagraphDialog
      dialogRequest={{ id: pending.id, request: pending.request }}
      fontSizePt={12}
      unit={unit}
      onDialogSubmit={
        /** Completes actual request. @param id - Request ID. @param value - Complete result. @returns Nothing. */ (
          id,
          value,
        ) => {
          dialogs.Complete(id, value);
        }
      }
      onDialogCancel={
        /** Cancels actual request. @param id - Request ID. @returns Nothing. */ (id) => {
          dialogs.Cancel(id);
        }
      }
    />,
  );
  return { session, shell, result, pending: { id: pending.id, request: pending.request } };
}
it("accepts pending Decimal/custom fill through the real dialog, retains controls across tabs and roundtrips native fields", /** Uses production command/item/history/filter owners. @returns Completion. */ async () => {
  const f = open(U.INCH);
  try {
    const before = f.shell.GetDoc().GetUndoManager().GetUndoActionCount();
    fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Position" }), {
      target: { value: "1 in" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Decimal" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Decimal character" }), {
      target: { value: ";suffix" },
    });
    fireEvent.blur(screen.getByRole("textbox", { name: "Decimal character" }));
    fireEvent.click(screen.getByRole("radio", { name: "Character" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Fill character" }), {
      target: { value: "·extra" },
    });
    fireEvent.blur(screen.getByRole("textbox", { name: "Fill character" }));
    fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
    fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
    expect(screen.getByRole("option", { name: "1.00″" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Decimal" })).toBeChecked();
    expect(screen.getByRole("textbox", { name: "Decimal character" })).toHaveValue(";suffix");
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(await f.result.value).toBe(true);
    const item = f.shell.GetActiveParagraph().GetAttr(T) as SvxTabStopItem;
    expect(item.Count()).toBe(1);
    expect(item.At(0).GetTabPos()).toBe(1440);
    expect(item.At(0).GetAdjustment()).toBe(A.Decimal);
    expect(item.At(0).GetDecimal()).toBe(";");
    expect(item.At(0).GetFill()).toBe("·");
    expect(f.shell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(before + 1);
    f.shell.Undo();
    expect((f.shell.GetActiveParagraph().GetAttr(T) as SvxTabStopItem).At(0).GetAdjustment()).toBe(
      A.Default,
    );
    f.shell.Redo();
    const loaded = await readOdtDocument(writeOdtDocument(f.shell.GetDoc(), { title: "Tabs" }), {
      title: "Reopen",
    });
    try {
      const reopened = loaded.document.paragraphs[0]?.GetAttr(T) as SvxTabStopItem;
      expect(reopened.At(0).GetTabPos()).toBe(1440);
      expect(reopened.At(0).GetDecimal()).toBe(";");
      expect(reopened.At(0).GetFill()).toBe("·");
    } finally {
      loaded.document.Dispose();
    }
  } finally {
    cleanup();
    f.session.Close();
  }
});
it("retains native defaults when Tabs is unvisited and cancellation discards pending page output", /** Uses native lazy page and actual command cancellation. @returns Completion. */ async () => {
  for (const visit of [false, true]) {
    const f = open();
    try {
      const before = (f.shell.GetActiveParagraph().GetAttr(T) as SvxTabStopItem).Clone();
      if (visit) {
        fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
        fireEvent.change(screen.getByRole("combobox", { name: "Position" }), {
          target: { value: "2 cm" },
        });
        fireEvent.click(screen.getByRole("button", { name: "New" }));
        fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
      }
      fireEvent.click(screen.getByRole("button", { name: visit ? "Cancel" : "OK" }));
      await f.result.value;
      expect((f.shell.GetActiveParagraph().GetAttr(T) as SvxTabStopItem).equals(before)).toBe(true);
    } finally {
      cleanup();
      f.session.Close();
    }
  }
});
it("supports explicit zero and selected native row deletion with centimeter positions", /** Exercises native source New zero and actual list activation. @returns Completion. */ async () => {
  const f = open();
  try {
    fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
    fireEvent.click(screen.getByRole("button", { name: "New" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Position" }), {
      target: { value: "2.54 cm" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Right" }));
    fireEvent.click(screen.getByRole("button", { name: "New" }));
    fireEvent.change(screen.getByRole("listbox", { name: "Tab stops" }), {
      target: { value: "0" },
    });
    expect(screen.getByRole("combobox", { name: "Position" })).toHaveValue("0.00 cm");
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    await f.result.value;
    const tabs = f.shell.GetActiveParagraph().GetAttr(T) as SvxTabStopItem;
    expect(tabs.Count()).toBe(1);
    expect(tabs.At(0).GetTabPos()).toBe(1440);
    expect(tabs.At(0).GetAdjustment()).toBe(A.Right);
  } finally {
    cleanup();
    f.session.Close();
  }
});

it("routes actual tree activation and entry blur independently and retains committed filler choices", /** Exercises real DOM keyboard/double-click/focus events. @returns Completion. */ async () => {
  const f = open();
  try {
    fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
    const position = screen.getByRole("combobox", { name: "Position" });
    fireEvent.change(position, { target: { value: "2 cm" } });
    fireEvent.blur(position);
    expect(position).toHaveValue("2.00 cm");
    fireEvent.click(screen.getByRole("radio", { name: "Centered" }));
    fireEvent.click(screen.getByRole("radio", { name: "........" }));
    fireEvent.click(screen.getByRole("button", { name: "New" }));
    const list = screen.getByRole("listbox", { name: "Tab stops" });
    fireEvent.doubleClick(list);
    fireEvent.keyDown(list, { key: "ArrowDown" });
    fireEvent.keyDown(list, { key: "Enter" });
    expect(screen.getByRole("radio", { name: "Centered" })).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Delete All" }));
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    await f.result.value;
    expect((f.shell.GetActiveParagraph().GetAttr(T) as SvxTabStopItem).At(0).GetAdjustment()).toBe(
      A.Default,
    );
  } finally {
    cleanup();
    f.session.Close();
  }
});

it("keeps an uncreated tab page inert and maps an empty actual tree selection to empty entry text", /** Uses actual session owners and DOM selection without a fake provider. @returns Completion. */ async () => {
  const f = open();
  try {
    const tabs = new TabulatorDialogSession(f.pending.request.tabContext, U.CM);
    tabs.Deactivate(0);
    expect(tabs.output.Count()).toBe(0);
    fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
    fireEvent.change(screen.getByRole("listbox", { name: "Tab stops" }), { target: { value: "" } });
    expect(screen.getByRole("combobox", { name: "Position" })).toHaveValue("");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await f.result.value;
  } finally {
    cleanup();
    f.session.Close();
  }
});

it("selects the complete reformatted position after native New updates the actual entry", /** React commits the source text before the deferred browser focus/select operation. @returns Completion. */ async () => {
  const f = open(U.INCH);
  try {
    fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
    const entry = screen.getByRole("combobox", { name: "Position" }) as HTMLInputElement;
    fireEvent.change(entry, { target: { value: "1 in" } });
    fireEvent.click(screen.getByRole("button", { name: "New" }));
    expect(entry).toHaveValue("1.00″");
    expect(document.activeElement).toBe(entry);
    expect(entry.selectionStart).toBe(0);
    expect(entry.selectionEnd).toBe(entry.value.length);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await f.result.value;
  } finally {
    cleanup();
    f.session.Close();
  }
});

it("synthetic-only: pins browser focus without selection for the native unreachable deletion request", /** The actual registered browser callback receives false explicitly; this verifies its contract without claiming that normal native handlers emit it. @returns Completion. */ async () => {
  const registration = vi.spyOn(TabulatorDialogSession.prototype, "SetFocus");
  const f = open();
  try {
    fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
    const callback = registration.mock.calls.find(
      /** Borrows the actual mounted browser callback. @param call - Real registration. @returns Whether installed. */
      (call) => call[0] !== undefined,
    )?.[0];
    if (!callback) throw new Error("Missing actual browser focus callback");
    const entry = screen.getByRole("combobox", { name: "Position" }) as HTMLInputElement;
    callback(false);
    fireEvent.change(entry, { target: { value: "3 cm" } });
    expect(document.activeElement).toBe(entry);
    expect(entry.selectionStart).toBe(entry.selectionEnd);
    expect(entry.selectionEnd).toBe(entry.value.length);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await f.result.value;
  } finally {
    cleanup();
    f.session.Close();
    registration.mockRestore();
  }
});
