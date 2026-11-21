/** @fileoverview Exercises Writer's annotation-mode Character dialog and bulk note history. */
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { DateTime } from "../../../tools/source/datetime/datetime";
import { SwFormatField } from "../../inc/fmtfld";
import { SwTextField } from "../../inc/txtfld";
import { SwPostItField, SwPostItFieldType } from "../../source/core/fields/docufld";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";

it("uses the active note's attributes and formats all notes in one Writer undo action", /** Exercises dialog tabs, cancel, seed merging and bulk history from the native comment popup. @returns Completion. */ async () => {
  const { view } = createWriterDocumentSession();
  const shell = view.GetWrtShell();
  shell.Insert("Document text");
  const node = shell.GetActiveParagraph();
  const fieldType = SwPostItFieldType.Get(shell.GetDoc());
  for (const [author, offset] of [
    ["Ada", 2],
    ["Grace", 7],
  ] as const) {
    const field = new SwPostItField(fieldType, {
      author,
      initials: "",
      text: author,
      name: author,
      dateTime: new DateTime(DateTime.EMPTY),
    });
    const format = new SwFormatField(field);
    field.Dispose();
    expect(node.InsertHint(new SwTextField(format, offset))).toBe(true);
  }
  const workbench = render(<WriterWorkbench isActive view={view} />);
  try {
    const ada = screen.getByRole("textbox", { name: "Comment — Ada" });
    const grace = screen.getByRole("textbox", { name: "Comment — Grace" });
    act(
      /** Seeds the second note with bold formatting. @returns Nothing. */ () => {
        grace.focus();
        view.Execute(WRITER_COMMAND_IDS.selectAll);
        view.Execute(WRITER_COMMAND_IDS.bold);
      },
    );
    const card = grace.closest("article");
    if (!card) throw new Error("Missing annotation card.");
    /** Opens the original comment popup action. @returns Open dialog. */
    function openFormatAll(): HTMLElement {
      if (!card) throw new Error("Missing annotation card.");
      fireEvent.click(within(card).getByLabelText("Comment actions"));
      fireEvent.click(within(card).getByRole("button", { name: "Format All Comments…" }));
      return screen.getByRole("dialog", { name: "Character" });
    }
    const undo = shell.GetDoc().GetUndoManager();
    const before = undo.GetUndoActionCount();
    const cancelled = openFormatAll();
    expect(within(cancelled).getByRole("combobox", { name: "Style" })).toHaveValue("2");
    expect(within(cancelled).getAllByRole("tab")).toHaveLength(4);
    fireEvent.change(within(cancelled).getByRole("spinbutton", { name: "Size" }), {
      target: { value: "28" },
    });
    fireEvent.click(within(cancelled).getByRole("button", { name: "Cancel" }));
    expect(undo.GetUndoActionCount()).toBe(before);

    const dialog = openFormatAll();
    fireEvent.change(within(dialog).getByRole("spinbutton", { name: "Size" }), {
      target: { value: "18" },
    });
    fireEvent.click(within(dialog).getByRole("tab", { name: "Position" }));
    fireEvent.change(within(dialog).getByRole("combobox", { name: "Position" }), {
      target: { value: "2" },
    });
    await act(
      /** Finishes the asynchronous Character request before checking the notes. @returns Completion. */ async () => {
        fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
      },
    );
    expect(within(ada).getByText("Ada").style.fontSize).toBe("10.44pt");
    expect(within(ada).getByText("Ada").style.verticalAlign).toBe("sub");
    expect(within(ada).getByText("Ada").style.fontWeight).toBe("bold");
    expect(within(grace).getByText("Grace").style.fontSize).toBe("10.44pt");
    expect(within(grace).getByText("Grace").style.fontWeight).toBe("bold");
    expect(undo.GetUndoActionCount()).toBe(before + 1);
    expect(screen.getByLabelText("Writer document body")).toHaveFocus();
    act(
      /** Replays the entire native bulk-formatting group. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(within(ada).getByText("Ada").style.fontWeight).not.toBe("bold");
    expect(within(grace).getByText("Grace").style.fontWeight).toBe("bold");
    act(
      /** Reapplies the entire native bulk-formatting group. @returns Nothing. */ () => {
        expect(shell.Redo()).toBe(true);
      },
    );
    expect(within(ada).getByText("Ada").style.fontWeight).toBe("bold");
  } finally {
    workbench.unmount();
    view.Close();
  }
});
