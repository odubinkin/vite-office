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
