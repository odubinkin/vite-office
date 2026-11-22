/** @fileoverview Verifies the native Text Flow criteria through Writer Find and Replace. */
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { SvxOrphansItem, SvxWidowsItem } from "../../../editeng/source/items/paraitem.controls";
import { RES_PARATR_ORPHANS, RES_PARATR_WIDOWS } from "../../inc/hintids";
import { createWriterDocumentSession } from "../composition/writer-module";
import { SEARCH_OPTIONS_KEY } from "../storage/writer-search-options-store";
import { WriterWorkbench } from "./writer-view";

it("searches by split and orphan values, then replaces Text Flow with one undo", /** Exercises native paragraph item exchange and the restored dialog state. @returns Nothing. */ () => {
  localStorage.removeItem(SEARCH_OPTIONS_KEY);
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  shell.Insert("word");
  shell.SplitNode();
  const second = shell.GetActiveParagraph();
  shell.Insert("word");
  second.SetAttr(new SvxOrphansItem(4, RES_PARATR_ORPHANS));
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    const format = dialog.getByRole("button", { name: "Format…" });
    const orphanName = "Don’t split at beginning of paragraph";
    const widowName = "Don’t split at end of paragraph";

    fireEvent.click(format);
    const search = within(screen.getByRole("dialog", { name: "Search" }));
    fireEvent.click(search.getByRole("tab", { name: "Text Flow" }));
    expect(search.getByRole("checkbox", { name: "Keep with next paragraph" })).toBeDisabled();
    const split = search.getByRole("checkbox", { name: "Allow to split paragraph" });
    const orphan = search.getByRole("checkbox", { name: orphanName });
    expect(split).toBePartiallyChecked();
    expect(orphan).toBeDisabled();
    fireEvent.click(split);
    expect(split).not.toBeChecked();
    expect(orphan).toBeDisabled();
    fireEvent.click(split);
    fireEvent.click(orphan);
    const lines = search.getByRole("spinbutton", { name: orphanName });
    expect(lines).toBeDisabled();
    fireEvent.click(orphan);
    expect(lines).toHaveValue(2);
    fireEvent.change(lines, { target: { value: "4" } });
    fireEvent.click(orphan);
    expect(orphan).toBePartiallyChecked();
    expect(lines).toBeDisabled();
    fireEvent.click(orphan);
    fireEvent.click(orphan);
    expect(lines).toHaveValue(4);
    fireEvent.click(search.getByRole("button", { name: "OK" }));
    expect(dialog.getByText(/Orphans 4/)).toBeVisible();

    fireEvent.click(dialog.getByRole("button", { name: "Find All" }));
    const matches = [...shell.GetCursor().GetRingContainer()];
    expect(matches).toHaveLength(1);
    expect(matches[0]?.Start().GetNode()).toBe(second);

    fireEvent.click(format);
    const reopened = within(screen.getByRole("dialog", { name: "Search" }));
    fireEvent.click(reopened.getByRole("tab", { name: "Text Flow" }));
    fireEvent.click(reopened.getByRole("checkbox", { name: orphanName }));
    fireEvent.click(reopened.getByRole("button", { name: "Reset" }));
    expect(reopened.getByRole("checkbox", { name: orphanName })).toBeChecked();
    expect(reopened.getByRole("spinbutton", { name: orphanName })).toHaveValue(4);
    fireEvent.click(reopened.getByRole("button", { name: "Cancel" }));

    fireEvent.focus(dialog.getByLabelText("Replace with"));
    fireEvent.click(format);
    const replace = within(screen.getByRole("dialog", { name: "Replace" }));
    fireEvent.click(replace.getByRole("tab", { name: "Text Flow" }));
    fireEvent.click(replace.getByRole("checkbox", { name: "Allow to split paragraph" }));
    fireEvent.click(replace.getByRole("checkbox", { name: "Allow to split paragraph" }));
    const replaceOrphan = replace.getByRole("checkbox", { name: orphanName });
    fireEvent.click(replaceOrphan);
    fireEvent.click(replace.getByRole("checkbox", { name: widowName }));
    expect(replace.getByRole("checkbox", { name: "Allow to split paragraph" })).toBeDisabled();
    fireEvent.click(replace.getByRole("button", { name: "OK" }));
    fireEvent.click(dialog.getByRole("button", { name: "Replace All" }));

    expect((second.GetAttr(RES_PARATR_ORPHANS) as SvxOrphansItem).GetValue()).toBe(0);
    expect((second.GetAttr(RES_PARATR_WIDOWS) as SvxWidowsItem).GetValue()).toBe(0);
    act(
      /** Undoes both formatting changes. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    expect((second.GetAttr(RES_PARATR_ORPHANS) as SvxOrphansItem).GetValue()).toBe(4);
    expect((second.GetAttr(RES_PARATR_WIDOWS) as SvxWidowsItem).GetValue()).toBe(2);
  } finally {
    workbench.unmount();
    session.view.Close();
  }
});
