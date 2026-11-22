/** @fileoverview Pinned Writer dialog ranges and synthetic page-model criteria. */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { RES_KEEP } from "../../inc/hintids";
import { SwFormatPageDesc } from "../../source/core/attr/fmtpdsc";
import { createWriterDocumentSession } from "../composition/writer-module";
import { SEARCH_OPTIONS_KEY } from "../storage/writer-search-options-store";
import { WriterWorkbench } from "./writer-view";

it("drops out-of-range format output and handles the raw Page Style presence criterion", /** Exercises the two dialog routes and a native slot without a paragraph Which mapping. @returns Nothing. */ () => {
  localStorage.removeItem(SEARCH_OPTIONS_KEY);
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const node = shell.GetActiveParagraph();
  shell.Insert("Styled paragraph");
  node.SetAttr(new SwFormatPageDesc("Standard"));
  node.SetAttr(new SfxBoolItem(RES_KEEP, true));
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    fireEvent.click(dialog.getByRole("button", { name: "Format…" }));
    const format = within(screen.getByRole("dialog", { name: "Search" }));
    fireEvent.click(format.getByRole("tab", { name: "Position" }));
    const pairKerning = format.getByRole("checkbox", { name: "Pair kerning" });
    expect(pairKerning).not.toBeChecked();
    expect(pairKerning).not.toBePartiallyChecked();
    fireEvent.click(pairKerning);
    fireEvent.click(format.getByRole("button", { name: "OK" }));
    expect(dialog.getByRole("button", { name: "No Format" })).toBeDisabled();

    fireEvent.click(dialog.getByRole("button", { name: "Attributes…" }));
    const attributes = within(screen.getByRole("dialog", { name: "Attributes" }));
    expect(attributes.queryByRole("checkbox", { name: "Brush" })).toBeNull();
    fireEvent.click(attributes.getByRole("checkbox", { name: "Page Style" }));
    fireEvent.click(attributes.getByRole("button", { name: "OK" }));

    expect(dialog.getByText("Page Style", { exact: true })).toBeVisible();
    fireEvent.change(dialog.getByLabelText("Find", { exact: true }), {
      target: { value: "Styled" },
    });
    fireEvent.click(dialog.getByRole("button", { name: "Find All" }));
    expect(dialog.getByRole("status")).toHaveTextContent("Search key not found");

    fireEvent.click(dialog.getByRole("button", { name: "Attributes…" }));
    const combined = within(screen.getByRole("dialog", { name: "Attributes" }));
    expect(combined.getByRole("checkbox", { name: "Page Style" })).toBeChecked();
    fireEvent.click(combined.getByRole("checkbox", { name: "Keep with next paragraph" }));
    fireEvent.click(combined.getByRole("button", { name: "OK" }));
    fireEvent.click(dialog.getByRole("button", { name: "Find All" }));
    expect(shell.GetCursor().HasMark()).toBe(true);
    expect(shell.GetCursor().Start().GetContentIndex()).toBe(0);
    expect(shell.GetCursor().End().GetContentIndex()).toBe(6);
  } finally {
    workbench.unmount();
    session.view.Close();
  }
});
