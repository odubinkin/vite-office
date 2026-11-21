/** @fileoverview Tests the mounted annotation surface and the native Find and Replace comment option. */
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { DateTime } from "../../../tools/source/datetime/datetime";
import { SwFormatField } from "../../inc/fmtfld";
import { SwTextField } from "../../inc/txtfld";
import { SwPostItField, SwPostItFieldType } from "../../source/core/fields/docufld";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";

/** Opens a Writer session with one native annotation attached to a body paragraph. @param note - Initial comment text. @returns Mounted workbench and native field. */
function openAnnotatedDocument(note: string) {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  shell.Insert("Document text");
  const node = shell.GetActiveParagraph();
  const field = new SwPostItField(SwPostItFieldType.Get(node.GetDoc()), {
    author: "Ada",
    initials: "A",
    text: note,
    name: "comment1",
    dateTime: new DateTime(DateTime.EMPTY),
  });
  const format = new SwFormatField(field);
  field.Dispose();
  expect(node.InsertHint(new SwTextField(format, 4))).toBe(true);
  return { session, shell, format };
}

it("focuses the matched comment, replaces its selection and undoes through Writer", /** Exercises the mounted sidebar, dialog option, selection, document field and undo. @returns Nothing. */ () => {
  const { session, shell, format } = openAnnotatedDocument("prefix target suffix");
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    const sidebar = screen.getByRole("complementary", { name: "Comments" });
    const comment = within(sidebar).getByRole<HTMLTextAreaElement>("textbox", {
      name: "Comment — Ada",
    });
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    const styles = dialog.getByRole("checkbox", { name: "Search for styles" });
    const comments = dialog.getByRole("checkbox", { name: "Comments" });
    fireEvent.click(styles);
    expect(comments).toBeDisabled();
    fireEvent.click(styles);
    expect(comments).toBeEnabled();
    fireEvent.click(comments);
    expect(styles).toBeDisabled();
    expect(dialog.getByRole("button", { name: "Find All" })).toBeDisabled();
    expect(dialog.getByRole("button", { name: "Replace All" })).toBeDisabled();
    fireEvent.change(dialog.getByLabelText("Find"), { target: { value: "target" } });
    fireEvent.change(dialog.getByLabelText("Replace with"), { target: { value: "new" } });
    fireEvent.click(dialog.getByRole("button", { name: "Find Next" }));
    expect(comment).toHaveFocus();
    expect(comment.selectionStart).toBe(7);
    expect(comment.selectionEnd).toBe(13);
    fireEvent.click(dialog.getByRole("button", { name: /^Replace$/ }));
    expect(comment).toHaveValue("prefix new suffix");
    expect(format.GetField().GetPar2()).toBe("prefix new suffix");
    act(
      /** Undoes through the document's native undo owner. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(format.GetField().GetPar2()).toBe("prefix target suffix");
    expect(comment).toHaveValue("prefix target suffix");
    act(
      /** Redoes through the same document history. @returns Nothing. */ () => {
        expect(shell.Redo()).toBe(true);
      },
    );
    expect(comment).toHaveValue("prefix new suffix");
  } finally {
    workbench.unmount();
    session.view.Close();
  }
});

it("searches from the focused comment caret and releases it on document input", /** Exercises native annotation activation and continued match visibility. @returns Nothing. */ () => {
  const { session, shell, format } = openAnnotatedDocument("target between target");
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    const comment = screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Comment — Ada" });
    const manager = session.view.GetPostItMgr();
    act(
      /** Focuses the note and puts the caret after its first match. @returns Nothing. */ () => {
        comment.focus();
        comment.setSelectionRange(6, 6);
        fireEvent.select(comment);
      },
    );
    expect(manager.GetActiveField() === format).toBe(true);
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(4);
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    const comments = dialog.getByRole<HTMLInputElement>("checkbox", { name: "Comments" });
    if (!comments.checked) fireEvent.click(comments);
    fireEvent.change(dialog.getByLabelText("Find"), { target: { value: "target" } });
    const findNext = dialog.getByRole("button", { name: "Find Next" });
    act(
      /** Mimics the browser moving focus to a clicked dialog button. @returns Nothing. */ () =>
        findNext.focus(),
    );
    expect(manager.GetActiveField() === format).toBe(true);
    fireEvent.click(findNext);
    expect(comment).toHaveFocus();
    expect(comment.selectionStart).toBe(15);
    expect(comment.selectionEnd).toBe(21);

    const close = dialog.getByRole("button", { name: "Close" });
    act(/** Moves focus to the dialog's Close button. @returns Nothing. */ () => close.focus());
    fireEvent.click(close);
    expect(comment).toHaveFocus();
    fireEvent.mouseDown(screen.getByLabelText("Writer document body"));
    expect(manager.GetActiveField()).toBeUndefined();
  } finally {
    workbench.unmount();
    session.view.Close();
  }
});

it("preserves the inactive comment selection when it has no match", /** Exercises the failed sidebar probe followed by a body match. @returns Nothing. */ () => {
  const { session, shell } = openAnnotatedDocument("miss between words");
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    const comment = screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Comment — Ada" });
    act(
      /** Leaves a noncollapsed selection in the inactive annotation. @returns Nothing. */ () => {
        comment.focus();
        comment.setSelectionRange(5, 12);
        fireEvent.select(comment);
      },
    );
    fireEvent.mouseDown(screen.getByLabelText("Writer document body"));
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    const comments = dialog.getByRole<HTMLInputElement>("checkbox", { name: "Comments" });
    if (!comments.checked) fireEvent.click(comments);
    fireEvent.change(dialog.getByLabelText("Find"), { target: { value: "text" } });
    fireEvent.click(dialog.getByRole("button", { name: "Find Next" }));
    expect(shell.GetSelText()).toBe("text");
    expect(comment.selectionStart).toBe(5);
    expect(comment.selectionEnd).toBe(12);
  } finally {
    workbench.unmount();
    session.view.Close();
  }
});

it("finds a Unicode regex in a later note paragraph and replaces its selection literally", /** Verifies native EditEngine replacement and Writer document undo. @returns Nothing. */ () => {
  const previous = "intro\n😀7 tail";
  const replacement = "intro\n$1\nnext tail";
  const { session, shell, format } = openAnnotatedDocument(previous);
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    const comment = screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Comment — Ada" });
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    const comments = dialog.getByRole<HTMLInputElement>("checkbox", { name: "Comments" });
    const regex = dialog.getByRole<HTMLInputElement>("checkbox", { name: "Regular expressions" });
    if (!comments.checked) fireEvent.click(comments);
    if (!regex.checked) fireEvent.click(regex);
    fireEvent.change(dialog.getByLabelText("Find"), { target: { value: "(😀)7" } });
    fireEvent.change(dialog.getByLabelText("Replace with"), { target: { value: "$1" } });
    fireEvent.click(dialog.getByRole("button", { name: "Find Next" }));
    expect(comment).toHaveFocus();
    expect(comment.selectionStart).toBe(6);
    expect(comment.selectionEnd).toBe(9);
    fireEvent.click(dialog.getByRole("button", { name: /^Replace$/ }));
    expect(format.GetField().GetPar2()).toBe("intro\n$1 tail");
    expect(comment).toHaveValue("intro\n$1 tail");
    fireEvent.change(comment, { target: { value: replacement } });
    expect(format.GetField().GetPar2()).toBe(replacement);
    act(
      /** Reverses the note edit and then the regex replacement. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(comment).toHaveValue(previous);
    expect(format.GetField().GetPar2()).toBe(previous);
  } finally {
    workbench.unmount();
    session.view.Close();
  }
});
