/** @fileoverview Exercises Writer's annotation-mode Character dialog and bulk note history. */
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { DateTime } from "../../../tools/source/datetime/datetime";
import { EE_CHAR_FONTHEIGHT } from "../../../editeng/inc/eeitem";
import { SvxFontHeightItem } from "../../../editeng/inc/fhgtitem";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import { FN_PARAM_1 } from "../../inc/cmdid";
import { SwFormatField } from "../../inc/fmtfld";
import { SwTextField } from "../../inc/txtfld";
import { SwPostItField, SwPostItFieldType } from "../../source/core/fields/docufld";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";

/** Creates two anchored comments over a plain Writer paragraph. @returns Writer session view and document shell. */
function openCommentFormattingDocument() {
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
  return { view, shell };
}

it("uses the active note's attributes and formats all notes in one Writer undo action", /** Exercises dialog tabs, cancel, seed merging and bulk history from the native comment popup. @returns Completion. */ async () => {
  const { view, shell } = openCommentFormattingDocument();
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

it("opens Character from the Format menu and applies only the selected annotation range", /** Verifies the original menu placement, selection formatting, local history and note focus. @returns Completion. */ async () => {
  const { view, shell } = openCommentFormattingDocument();
  const workbench = render(<WriterWorkbench isActive view={view} />);
  try {
    const ada = screen.getByRole("textbox", { name: "Comment — Ada" });
    const grace = screen.getByRole("textbox", { name: "Comment — Grace" });
    act(
      /** Makes Ada's final two letters the active selection. @returns Nothing. */ () => {
        ada.focus();
        const text = ada.querySelector("span")?.firstChild;
        if (!text) throw new Error("Missing annotation text.");
        document.getSelection()?.setBaseAndExtent(text, 1, text, 3);
        fireEvent(document, new Event("selectionchange"));
      },
    );
    expect(document.getSelection()?.toString()).toBe("da");
    expect(
      view.GetPostItMgr().GetActiveSidebarWin()?.view.getImpl().GetEditSelection().HasRange(),
    ).toBe(true);
    expect(view.QueryState(WRITER_COMMAND_IDS.fontDialog).enabled).toBe(true);
    fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /^Character/u }));
    const character = screen.getByRole("dialog", { name: "Character" });
    expect(within(character).getByRole("tab", { name: "Font" })).toHaveFocus();
    fireEvent.change(within(character).getByRole("spinbutton", { name: "Size" }), {
      target: { value: "20" },
    });
    await act(
      /** Completes the real annotation Character request. @returns Completion. */ async () => {
        fireEvent.click(within(character).getByRole("button", { name: "OK" }));
      },
    );
    expect(ada).toHaveFocus();
    expect(within(ada).getByText("da").style.fontSize).toBe("20pt");
    expect(within(ada).getByText("A").style.fontSize).not.toBe("20pt");
    expect(within(grace).getByText("Grace").style.fontSize).not.toBe("20pt");
    expect(document.getSelection()?.toString()).toBe("da");
    act(
      /** Undoes only this selected range edit. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(within(ada).getByText("Ada").style.fontSize).not.toBe("20pt");
  } finally {
    workbench.unmount();
    view.Close();
  }
});

it("honors the original Character page slots and applies direct EditEngine items", /** Exercises the explicit Page string, specialized slots and direct attribute request. @returns Completion. */ async () => {
  const { view } = openCommentFormattingDocument();
  const page = new SfxStringItem(FN_PARAM_1, "background");
  const height = new SvxFontHeightItem(460, 100, EE_CHAR_FONTHEIGHT);
  const workbench = render(<WriterWorkbench isActive view={view} />);
  try {
    const ada = screen.getByRole("textbox", { name: "Comment — Ada" });
    act(
      /** Selects the complete first annotation. @returns Nothing. */ () => {
        ada.focus();
        view.Execute(WRITER_COMMAND_IDS.selectAll);
      },
    );
    for (const [command, args, tab] of [
      [WRITER_COMMAND_IDS.fontEffectsDialog, [], "Font Effects"],
      [WRITER_COMMAND_IDS.fontPositionDialog, [page], "Position"],
      [WRITER_COMMAND_IDS.fontDialog, [page], "Background"],
    ] as const) {
      act(
        /** Opens one of the native Character routes. @returns Nothing. */ () => {
          view.Execute(command, args);
        },
      );
      const character = screen.getByRole("dialog", { name: "Character" });
      expect(within(character).getByRole("tab", { name: tab })).toHaveFocus();
      await act(
        /** Closes the modal before invoking the next native command. @returns Completion. */ async () => {
          fireEvent.click(within(character).getByRole("button", { name: "Cancel" }));
        },
      );
      expect(ada).toHaveFocus();
    }
    await act(
      /** Dispatches original formatting arguments without opening a modal. @returns Completion. */ async () => {
        view.Execute(WRITER_COMMAND_IDS.fontPositionDialog, [height]);
      },
    );
    expect(screen.queryByRole("dialog", { name: "Character" })).toBeNull();
    expect(within(ada).getByText("Ada").style.fontSize).toBe("23pt");
  } finally {
    height.Dispose();
    page.Dispose();
    workbench.unmount();
    view.Close();
  }
});
