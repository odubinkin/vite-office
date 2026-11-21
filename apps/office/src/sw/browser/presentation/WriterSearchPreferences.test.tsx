/** @fileoverview Tests the config-backed Writer search lifecycle. */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import {
  SEARCH_OPTIONS_KEY,
  WriterSearchOptionsStore,
} from "../storage/writer-search-options-store";
import { WriterWorkbench } from "./writer-view";

it("commits CTL changes immediately and restores close-time settings in a new Writer session", /** Tests the source dialog's two configuration commit points. @returns Nothing. */ () => {
  const previous = localStorage.getItem(SEARCH_OPTIONS_KEY);
  localStorage.removeItem(SEARCH_OPTIONS_KEY);
  const session = createWriterDocumentSession();
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    const diacritics = dialog.getByRole("checkbox", { name: "Diacritic-sensitive" });
    expect(diacritics).toBeChecked();
    fireEvent.click(diacritics);
    const storage = new WriterSearchOptionsStore(localStorage);
    expect(storage.GetProperties().IsIgnoreDiacritics_CTL).toBe(true);
    fireEvent.click(dialog.getByRole("checkbox", { name: "Whole words only" }));
    expect(storage.GetProperties().IsWholeWordsOnly).toBe(false);
    fireEvent.click(dialog.getByRole("button", { name: "Close" }));
    expect(storage.GetProperties().IsWholeWordsOnly).toBe(true);
    const reopened = createWriterDocumentSession();
    try {
      expect(reopened.view.GetSearch().GetSearchItem()).toMatchObject({
        matchDiacritics: false,
        wholeWords: true,
      });
    } finally {
      reopened.Close();
    }
  } finally {
    workbench.unmount();
    session.Close();
    if (previous === null) localStorage.removeItem(SEARCH_OPTIONS_KEY);
    else localStorage.setItem(SEARCH_OPTIONS_KEY, previous);
  }
});
