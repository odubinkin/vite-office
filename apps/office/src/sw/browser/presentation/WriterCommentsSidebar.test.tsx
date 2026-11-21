/** @fileoverview Tests the mounted annotation surface and the native Find and Replace comment option. */
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { DateTime } from "../../../tools/source/datetime/datetime";
import { SwFormatField } from "../../inc/fmtfld";
import { SwTextField } from "../../inc/txtfld";
import { SwPostItField, SwPostItFieldType } from "../../source/core/fields/docufld";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";

it("focuses the matched comment, replaces its selection and undoes through Writer", /** Exercises the mounted sidebar, dialog option, selection, document field and undo. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  shell.Insert("Document text");
  const node = shell.GetActiveParagraph();
  const field = new SwPostItField(SwPostItFieldType.Get(node.GetDoc()), {
    author: "Ada",
    initials: "A",
    text: "prefix target suffix",
    name: "comment1",
    dateTime: new DateTime(DateTime.EMPTY),
  });
  const format = new SwFormatField(field);
  field.Dispose();
  node.InsertHint(new SwTextField(format, 4));
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    const sidebar = screen.getByRole("complementary", { name: "Comments" });
    const comment = within(sidebar).getByRole<HTMLTextAreaElement>("textbox", {
      name: "Comment — Ada",
    });
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    fireEvent.click(dialog.getByRole("checkbox", { name: "Comments" }));
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
