/** @fileoverview Verifies regular-expression search through the Writer browser session. */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { SEARCH_OPTIONS_KEY } from "../storage/writer-search-options-store";
import { WriterWorkbench } from "./writer-view";

beforeEach(localStorage.removeItem.bind(localStorage, SEARCH_OPTIONS_KEY));

it("runs Unicode regular expressions through the Find and Replace dialog", /** Exercises the browser matcher and grouped replacement through the production view. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  shell.Insert("a1 b2 C3");
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    fireEvent.click(dialog.getByRole("checkbox", { name: "Regular expressions" }));
    expect(dialog.getByRole("checkbox", { name: "Whole words only" })).toBeDisabled();
    expect(dialog.getByRole("checkbox", { name: "Similarity search" })).toBeDisabled();
    fireEvent.change(dialog.getByLabelText("Find"), { target: { value: "([a-z])([0-9])" } });
    fireEvent.change(dialog.getByLabelText("Replace with"), { target: { value: "$2$1" } });
    fireEvent.click(dialog.getByRole("button", { name: "Find All" }));
    expect(dialog.getByRole("status")).toHaveTextContent("3 results");
    fireEvent.click(dialog.getByRole("button", { name: "Replace All" }));
    expect(shell.GetActiveParagraph().GetText()).toBe("1a 2b 3C");
    expect(shell.Undo()).toBe(true);
    expect(shell.GetActiveParagraph().GetText()).toBe("a1 b2 C3");
  } finally {
    workbench.unmount();
    session.view.Close();
  }
});

it("replaces multiple regex matches with paragraph breaks and undoes them together", /** Exercises Replace All cursor progress as matches move to newly split nodes. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const doc = session.view.GetDocShell().GetDoc();
  shell.Insert("a1 b2");
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  const texts = /** Reads actual model paragraphs. @returns Body texts. */ () =>
    doc.paragraphs.map(
      /** Reads a native text node. @param node - Body paragraph. @returns Text. */ (node) =>
        node.GetText(),
    );
  try {
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    fireEvent.click(dialog.getByRole("checkbox", { name: "Regular expressions" }));
    fireEvent.change(dialog.getByLabelText("Find"), { target: { value: "([a-z])([0-9])" } });
    fireEvent.change(dialog.getByLabelText("Replace with"), {
      target: { value: String.raw`$2\n$1` },
    });
    fireEvent.click(dialog.getByRole("button", { name: "Replace All" }));
    expect(texts()).toEqual(["1", "a 2", "b"]);
    expect(shell.Undo()).toBe(true);
    expect(texts()).toEqual(["a1 b2"]);
    expect(shell.Redo()).toBe(true);
    expect(texts()).toEqual(["1", "a 2", "b"]);
  } finally {
    workbench.unmount();
    session.view.Close();
  }
});

it("joins matching paragraph ends and restores the original paragraphs with one undo", /** Exercises paragraph markers through the dialog's Replace All command. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const doc = session.view.GetDocShell().GetDoc();
  shell.Insert("a");
  shell.SplitNode();
  shell.Insert("b");
  shell.SplitNode();
  shell.Insert("c");
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    fireEvent.click(dialog.getByRole("checkbox", { name: "Regular expressions" }));
    fireEvent.change(dialog.getByLabelText("Find"), { target: { value: "$" } });
    fireEvent.change(dialog.getByLabelText("Replace with"), { target: { value: "-" } });
    fireEvent.click(dialog.getByRole("button", { name: "Replace All" }));
    expect(doc.paragraphs).toHaveLength(1);
    expect(doc.paragraphs[0]?.GetText()).toBe("a-b-c");
    expect(shell.Undo()).toBe(true);
    expect(doc.paragraphs).toHaveLength(3);
    expect(doc.paragraphs[0]?.GetText()).toBe("a");
    expect(doc.paragraphs[1]?.GetText()).toBe("b");
    expect(doc.paragraphs[2]?.GetText()).toBe("c");
  } finally {
    workbench.unmount();
    session.view.Close();
  }
});
