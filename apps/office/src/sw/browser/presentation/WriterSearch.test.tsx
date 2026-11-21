/** @fileoverview Ports the represented pinned Writer Find and Find & Replace UI scenarios. */
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { SvxSearchCmd } from "../../../svl/inc/srchitem";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { RndStdIds } from "../../../svx/inc/swframetypes";
import { Size } from "../../../tools/inc/gen";
import { Graphic } from "../../../vcl/source/gdi/graph";
import { CH_TXTATR_BREAKWORD, RES_FRMATR_BEGIN, RES_FRMATR_END } from "../../inc/hintids";
import { SwFormatFooter, SwFormatHeader } from "../../inc/fmthdft";
import { SwFormatFlyCnt } from "../../inc/fmtflcnt";
import { SwTextFlyCnt } from "../../inc/txtflcnt";
import { MakeFlySection } from "../../source/core/doc/doclay";
import { SwPaM, SwPosition } from "../../source/core/crsr/pam";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";

it("opens Find from Edit, wraps in both directions and restores document focus on Escape", /** Exercises directional traversal and focus. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  shell.Insert("third first third");
  const workbench = render(<WriterWorkbench isActive view={session.view} />);

  fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Find" }));
  const toolbar = within(screen.getByRole("toolbar", { name: "Find" }));
  const search = toolbar.getByLabelText("Find");
  expect(search).toHaveFocus();
  fireEvent.change(search, { target: { value: "third" } });
  fireEvent.keyDown(search, { key: "Enter" });
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(0);
  expect(toolbar.getByRole("status")).toHaveTextContent("Reached the end");
  fireEvent.keyDown(search, { key: "Enter", shiftKey: true });
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(12);
  expect(toolbar.getByRole("status")).toHaveTextContent("Reached the beginning");
  fireEvent.click(toolbar.getByRole("button", { name: "Find All" }));
  expect([...shell.GetCursor().GetRingContainer()]).toHaveLength(2);
  fireEvent.keyDown(search, { key: "Escape" });
  expect(screen.queryByRole("toolbar", { name: "Find" })).toBeNull();
  expect(workbench.container.querySelector("[data-writer-editing-host]")).toHaveFocus();
  workbench.unmount();
  session.view.Close();
});

it("finds whole words on both sides of an as-character image", /** Exercises the native inline separator through browser search commands and selections. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const node = shell.GetActiveParagraph();
  shell.Insert("needleneedle");
  const position = new SwPosition(node, 6);
  const range = new SwPaM(position);
  const gif = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
  const graphic = new Graphic(gif, "image/gif", new Size(120, 120));
  const format = node.GetDoc().GetDocumentContentOperationsManager().InsertGraphic(range, graphic);
  const inline = new SwTextFlyCnt(new SwFormatFlyCnt(format), 6);
  expect(node.InsertHint(inline)).toBe(true);
  range.Dispose();
  position.Dispose();
  shell.GetCursor().GetPoint().SetContent(0);

  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  expect(workbench.container.querySelector("[data-writer-inline-graphic] img")).toBeInTheDocument();
  const beforeImage = new SwPosition(node, 0);
  const afterImage = new SwPosition(node, 9);
  act(
    /** Selects text across the live inline image. @returns Nothing. */ () =>
      shell.SetPaM(afterImage, beforeImage),
  );
  fireEvent.keyDown(window, { key: "f", ctrlKey: true });
  const findbar = within(screen.getByRole("toolbar", { name: "Find" }));
  expect(findbar.getByLabelText("Find")).toHaveValue("needlene");
  fireEvent.keyDown(findbar.getByLabelText("Find"), { key: "Escape" });
  fireEvent.keyDown(window, { key: "h", ctrlKey: true });
  const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
  expect(dialog.getByLabelText("Find")).toHaveValue("needlene");
  act(
    /** Restores the starting caret for forward search. @returns Nothing. */ () =>
      shell.SetCursor(beforeImage),
  );
  beforeImage.Dispose();
  afterImage.Dispose();
  fireEvent.change(dialog.getByLabelText("Find"), { target: { value: "needle" } });
  fireEvent.click(dialog.getByRole("checkbox", { name: "Whole words only" }));

  const next = dialog.getByRole("button", { name: "Find Next" });
  fireEvent.click(next);
  expect([
    shell.GetCursor().Start().GetContentIndex(),
    shell.GetCursor().End().GetContentIndex(),
  ]).toEqual([0, 6]);
  fireEvent.click(next);
  expect([
    shell.GetCursor().Start().GetContentIndex(),
    shell.GetCursor().End().GetContentIndex(),
  ]).toEqual([7, 13]);
  expect(window.getSelection()?.toString()).toBe("needle");
  fireEvent.click(dialog.getByRole("button", { name: "Find Previous" }));
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(0);
  fireEvent.click(dialog.getByRole("button", { name: "Find All" }));
  expect([...shell.GetCursor().GetRingContainer()]).toHaveLength(2);

  fireEvent.change(dialog.getByLabelText("Replace with"), { target: { value: "match" } });
  fireEvent.click(dialog.getByRole("button", { name: "Replace All" }));
  expect(node.GetText()).toBe(`match${CH_TXTATR_BREAKWORD}match`);
  expect(node.GetpSwpHints()?.GetTextAttrForCharAt(5)).toBe(inline);
  expect(format.GetAnchor().GetAnchorContentOffset()).toBe(5);
  fireEvent.keyDown(dialog.getByLabelText("Find"), { key: "Escape" });
  fireEvent.keyDown(window, { key: "z", ctrlKey: true });
  expect(node.GetText()).toBe(`needle${CH_TXTATR_BREAKWORD}needle`);
  expect(node.GetpSwpHints()?.GetTextAttrForCharAt(6)).toBe(inline);
  expect(format.GetAnchor().GetAnchorContentOffset()).toBe(6);
  fireEvent.keyDown(window, { key: "y", ctrlKey: true });
  expect(node.GetText()).toBe(`match${CH_TXTATR_BREAKWORD}match`);
  expect(node.GetpSwpHints()?.GetTextAttrForCharAt(5)).toBe(inline);
  expect(format.GetAnchor().GetAnchorContentOffset()).toBe(5);

  const anchorStart = new SwPosition(node, 5);
  const anchorEnd = new SwPosition(node, 6);
  act(
    /** Selects only the anchor to check the empty expanded-text case. @returns Nothing. */ () =>
      shell.SetPaM(anchorEnd, anchorStart),
  );
  fireEvent.keyDown(window, { key: "h", ctrlKey: true });
  const reopened = within(screen.getByRole("dialog", { name: "Find and Replace" }));
  expect(reopened.getByLabelText("Find")).toHaveValue("needle");
  expect(reopened.getByRole("checkbox", { name: "Current selection only" })).toBeChecked();
  anchorStart.Dispose();
  anchorEnd.Dispose();
  workbench.unmount();
  session.view.Close();
});

it("refreshes the Find Bar from the current model selection when the editor calls it again", /** Uses the ASCII writer for a two-paragraph selection and keeps the current entry while it has focus. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const first = shell.GetActiveParagraph();
  shell.Insert("first text");
  shell.SplitNode();
  const second = shell.GetActiveParagraph();
  shell.Insert("second text");
  const start = new SwPosition(first, 6);
  const end = new SwPosition(second, 6);
  const workbench = render(<WriterWorkbench isActive view={session.view} />);

  fireEvent.keyDown(window, { key: "f", ctrlKey: true });
  const search = within(screen.getByRole("toolbar", { name: "Find" })).getByLabelText("Find");
  fireEvent.change(search, { target: { value: "draft" } });

  act(
    /** Changes the registered selection while the toolbar is open. @returns Nothing. */ () =>
      shell.SetPaM(end, start),
  );
  fireEvent.keyDown(search, { key: "f", ctrlKey: true });
  expect(search).toHaveValue("draft");
  const editor = workbench.container.querySelector<HTMLElement>("[data-writer-editing-host]");
  editor?.focus();
  fireEvent.keyDown(editor ?? window, { key: "f", ctrlKey: true });
  expect(search).toHaveValue("textsecond");
  expect(search).toHaveFocus();
  expect(shell.GetCursor().Start().compare(start)).toBe(0);
  expect(shell.GetCursor().End().compare(end)).toBe(0);

  start.Dispose();
  end.Dispose();
  workbench.unmount();
  session.view.Close();
});

it("shares the query with Find and Replace, replaces the selected match and undoes Replace All atomically", /** Exercises the native replacement sequence and undo. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  shell.Insert("First first first third");
  const workbench = render(<WriterWorkbench isActive view={session.view} />);

  expect(fireEvent.keyDown(window, { key: "f", ctrlKey: true })).toBe(false);
  const toolbar = within(screen.getByRole("toolbar", { name: "Find" }));
  fireEvent.change(toolbar.getByLabelText("Find"), { target: { value: "third" } });
  fireEvent.click(toolbar.getByRole("button", { name: "Find and Replace" }));
  const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
  const search = dialog.getByLabelText("Find");
  expect(search).toHaveValue("third");
  fireEvent.change(search, { target: { value: "First" } });
  fireEvent.change(dialog.getByLabelText("Replace with"), {
    target: { value: "Replace" },
  });
  fireEvent.click(dialog.getByRole("checkbox", { name: "Match case" }));
  const replace = dialog.getByRole("button", { name: /^Replace$/ });
  fireEvent.click(replace);
  expect(shell.GetActiveParagraph().GetText()).toBe("First first first third");
  fireEvent.click(replace);
  expect(shell.GetActiveParagraph().GetText()).toBe("Replace first first third");

  fireEvent.change(dialog.getByLabelText("Replace with"), {
    target: { value: "aaa" },
  });
  fireEvent.click(dialog.getByRole("checkbox", { name: "Match case" }));
  fireEvent.click(dialog.getByRole("button", { name: "Replace All" }));
  expect(shell.GetActiveParagraph().GetText()).toBe("Replace aaa aaa third");
  expect(dialog.getByRole("status")).toHaveTextContent("Search key replaced 2 times.");

  fireEvent.keyDown(search, { key: "Escape" });
  expect(fireEvent.keyDown(window, { key: "z", ctrlKey: true })).toBe(false);
  expect(shell.GetActiveParagraph().GetText()).toBe("Replace first first third");
  workbench.unmount();
  session.view.Close();
});

it("keeps finding available when read-only Writer state disables replacement", /** Exercises command admission, dialog state, the repeat request, and the document history. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const owner = session.view.GetSearch();
  const paragraph = shell.GetActiveParagraph();
  const undo = paragraph.GetDoc().GetUndoManager();
  shell.Insert("cat cat cat");
  const undoCount = undo.GetUndoActionCount();
  shell.GetViewOptions().SetReadonly(true);
  const workbench = render(<WriterWorkbench isActive view={session.view} />);

  fireEvent.keyDown(window, { key: "h", ctrlKey: true });
  const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
  const replacement = dialog.getByLabelText("Replace with");
  const replace = dialog.getByRole("button", { name: /^Replace$/ });
  const replaceAll = dialog.getByRole("button", { name: "Replace All" });
  fireEvent.change(dialog.getByLabelText("Find"), { target: { value: "cat" } });
  expect(replacement).toBeDisabled();
  expect(replace).toBeDisabled();
  expect(replaceAll).toBeDisabled();

  fireEvent.click(dialog.getByRole("button", { name: "Find All" }));
  expect([...shell.GetCursor().GetRingContainer()]).toHaveLength(3);
  fireEvent.click(dialog.getByRole("button", { name: "Find Previous" }));
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(8);
  const request = { ...owner.GetSearchItem(), replacement: "dog" };
  for (const command of [SvxSearchCmd.REPLACE, SvxSearchCmd.REPLACE_ALL])
    expect(owner.ExecSearch(request, command)).toEqual({ matches: 0, wrapped: false });
  expect(paragraph.GetText()).toBe("cat cat cat");
  expect(undo.GetUndoActionCount()).toBe(undoCount);
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(8);
  act(
    /** Repeats the saved backward find after the refused replacement requests. @returns Nothing. */ () => {
      expect(owner.RepeatSearch()).toBe(true);
    },
  );
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(4);

  act(
    /** Publishes a Writer view update after returning to editable mode. @returns Nothing. */ () => {
      shell.GetViewOptions().SetReadonly(false);
      shell.NotifySelectionChanged();
    },
  );
  expect(replacement).toBeEnabled();
  expect(replace).toBeEnabled();
  fireEvent.change(replacement, { target: { value: "catdog" } });
  fireEvent.click(replaceAll);
  expect(paragraph.GetText()).toBe("catdog catdog catdog");
  expect(undo.GetUndoActionCount()).toBe(undoCount + 1);

  shell.GetViewOptions().SetReadonly(true);
  expect(owner.RepeatSearch()).toBe(false);
  expect(paragraph.GetText()).toBe("catdog catdog catdog");
  expect(undo.GetUndoActionCount()).toBe(undoCount + 1);

  workbench.unmount();
  session.view.Close();
});

it("uses the current selection and whole-word option without replacing outside the range", /** Checks selection seeding and the bounded replacement path. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  shell.Insert("cat scatter CAT cat");
  const paragraph = shell.GetActiveParagraph();
  const point = new SwPosition(paragraph, 11);
  const mark = new SwPosition(paragraph, 0);
  shell.SetPaM(point, mark);
  point.Dispose();
  mark.Dispose();
  const workbench = render(<WriterWorkbench isActive view={session.view} />);

  expect(fireEvent.keyDown(window, { key: "h", ctrlKey: true })).toBe(false);
  const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
  const search = dialog.getByLabelText("Find");
  expect(search).toHaveValue("cat scatter");
  fireEvent.change(search, { target: { value: "cat" } });
  fireEvent.change(dialog.getByLabelText("Replace with"), {
    target: { value: "dog" },
  });
  fireEvent.click(dialog.getByRole("checkbox", { name: "Whole words only" }));
  fireEvent.click(dialog.getByText("Other options"));
  fireEvent.click(dialog.getByRole("checkbox", { name: "Current selection only" }));
  fireEvent.click(dialog.getByRole("button", { name: "Replace All" }));
  expect(paragraph.GetText()).toBe("dog scatter CAT cat");

  const selection = dialog.getByRole("checkbox", { name: "Current selection only" });
  expect(selection).toBeChecked();
  fireEvent.click(dialog.getByRole("button", { name: "Close" }));
  const caret = new SwPosition(paragraph, 0);
  act(
    /** Leaves the former search range for the caret. @returns Nothing. */ () => {
      shell.SetCursor(caret);
    },
  );
  expect(session.view.GetSearch().RepeatSearch()).toBe(false);
  expect(shell.GetCursor().HasMark()).toBe(false);

  fireEvent.keyDown(window, { key: "h", ctrlKey: true });
  const reopened = within(screen.getByRole("dialog", { name: "Find and Replace" }));
  fireEvent.click(reopened.getByText("Other options"));
  const scope = reopened.getByRole("checkbox", { name: "Current selection only" });
  expect(scope).toBeDisabled();
  const tail = new SwPosition(paragraph, 3);
  act(
    /** Supplies a new selection while the dialog remains open. @returns Nothing. */ () => {
      shell.SetPaM(tail, caret);
    },
  );
  fireEvent.click(scope);
  expect(scope).toBeChecked();
  act(
    /** Clears the selection and its active search scope. @returns Nothing. */ () => {
      shell.SetCursor(caret);
    },
  );
  expect(scope).toBeDisabled();
  act(
    /** Selects another range after losing the original scope. @returns Nothing. */ () => {
      shell.SetPaM(tail, caret);
    },
  );
  expect(scope).toBeEnabled();
  expect(scope).not.toBeChecked();
  caret.Dispose();
  tail.Dispose();
  workbench.unmount();
  session.view.Close();
});

it("uses separate upstream diacritic defaults and applies each control to the document search", /** Ports the supported Match Case and Match Diacritics Find Bar UI sequence. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  session.view.GetWrtShell().Insert("libre Libre Libré Libre");
  const workbench = render(<WriterWorkbench isActive view={session.view} />);

  fireEvent.keyDown(window, { key: "f", ctrlKey: true });
  const toolbar = within(screen.getByRole("toolbar", { name: "Find" }));
  fireEvent.change(toolbar.getByLabelText("Find"), { target: { value: "Libre" } });
  fireEvent.click(toolbar.getByRole("checkbox", { name: "Match case" }));
  const matchDiacritics = toolbar.getByRole("checkbox", { name: "Match Diacritics" });
  expect(matchDiacritics).not.toBeChecked();
  fireEvent.click(toolbar.getByRole("button", { name: "Find All" }));
  expect(toolbar.getByRole("status")).toHaveTextContent("3 results");
  fireEvent.click(matchDiacritics);
  fireEvent.click(toolbar.getByRole("button", { name: "Find All" }));
  expect(toolbar.getByRole("status")).toHaveTextContent("2 results");
  fireEvent.change(toolbar.getByLabelText("Find"), { target: { value: "Libré" } });
  fireEvent.click(toolbar.getByRole("button", { name: "Find All" }));
  expect(toolbar.getByRole("status")).toHaveTextContent("One match found.");

  fireEvent.click(toolbar.getByRole("button", { name: "Find and Replace" }));
  const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
  fireEvent.click(dialog.getByText("Other options"));
  const sensitive = dialog.getByRole("checkbox", { name: "Diacritic-sensitive" });
  expect(sensitive).toBeChecked();
  fireEvent.click(sensitive);
  fireEvent.click(dialog.getByRole("button", { name: "Find All" }));
  expect(dialog.getByRole("status")).toHaveTextContent("3 results");
  workbench.unmount();
  session.view.Close();
});

it("repeats the dispatched search direction through the Writer accelerator", /** Drives native RepeatSearch while the Find toolbar is closed. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  shell.Insert("one ONE one");
  const workbench = render(<WriterWorkbench isActive view={session.view} />);

  fireEvent.keyDown(window, { key: "f", ctrlKey: true });
  const toolbar = within(screen.getByRole("toolbar", { name: "Find" }));
  const search = toolbar.getByLabelText("Find");
  fireEvent.change(search, { target: { value: "one" } });
  fireEvent.click(toolbar.getByRole("checkbox", { name: "Match case" }));
  fireEvent.keyDown(search, { key: "Enter", shiftKey: true });
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(8);
  expect(fireEvent.keyDown(search, { key: "f", ctrlKey: true, shiftKey: true })).toBe(false);
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(0);
  expect(toolbar.getByRole("status")).toBeEmptyDOMElement();

  fireEvent.change(search, { target: { value: "ONE" } });
  expect(fireEvent.keyDown(search, { key: "f", ctrlKey: true, shiftKey: true })).toBe(false);
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(8);
  expect(toolbar.getByRole("status")).toHaveTextContent("Reached the beginning of the document");
  expect(search).toHaveValue("ONE");
  expect(search).toHaveFocus();
  fireEvent.keyDown(search, { key: "Escape" });

  expect(fireEvent.keyDown(window, { key: "f", ctrlKey: true, shiftKey: true })).toBe(false);
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(0);
  expect(screen.queryByRole("toolbar", { name: "Find" })).toBeNull();
  expect(fireEvent.keyDown(window, { key: "f", ctrlKey: true, shiftKey: true })).toBe(false);
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(8);
  workbench.unmount();
  session.view.Close();
});

it("updates the open dialog when the dispatcher repeats Find All", /** Verifies the shared native feedback for changed counts and a missing match. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  shell.Insert("one two one");
  const paragraph = shell.GetActiveParagraph();
  const workbench = render(<WriterWorkbench isActive view={session.view} />);

  fireEvent.keyDown(window, { key: "h", ctrlKey: true });
  const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
  const search = dialog.getByLabelText("Find");
  const status = dialog.getByRole("status");
  fireEvent.change(search, { target: { value: "one" } });
  fireEvent.click(dialog.getByRole("button", { name: "Find All" }));
  expect(status).toHaveTextContent("2 results");

  act(
    /** Changes the model before repeating the same Find All request. @returns Nothing. */ () => {
      paragraph.SetText("two one");
      expect(session.view.Execute(".uno:RepeatSearch")).toMatchObject({ value: true });
    },
  );
  expect(status).toHaveTextContent("One match found.");
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(4);

  act(
    /** Removes the final occurrence while keeping the dialog open. @returns Nothing. */ () => {
      paragraph.SetText("two");
      expect(session.view.Execute(".uno:RepeatSearch")).toMatchObject({ value: false });
    },
  );
  expect(status).toHaveTextContent("Search key not found");
  expect(search).toBeInvalid();
  fireEvent.change(search, { target: { value: "two" } });
  expect(status).toBeEmptyDOMElement();
  expect(search).toBeValid();
  workbench.unmount();
  session.view.Close();
});

it("keeps the upstream ten most recent distinct Find Bar entries across reopening", /** Ports tdf154269 and checks move-to-front for a remembered entry. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const workbench = render(<WriterWorkbench isActive view={session.view} />);

  for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    fireEvent.keyDown(window, { key: "f", ctrlKey: true });
    const toolbar = within(screen.getByRole("toolbar", { name: "Find" }));
    const search = toolbar.getByLabelText("Find");
    fireEvent.change(search, { target: { value: letter } });
    fireEvent.keyDown(search, { key: "Enter" });
    fireEvent.click(toolbar.getByRole("button", { name: "Close" }));
  }

  fireEvent.keyDown(window, { key: "f", ctrlKey: true });
  const toolbar = screen.getByRole("toolbar", { name: "Find" });
  const search = within(toolbar).getByLabelText("Find");
  /** Reads the native datalist's ordered entries. @returns The stored terms. */
  function terms(): string[] {
    return Array.from(
      toolbar.querySelectorAll<HTMLOptionElement>("datalist option"),
      /** Projects the actual Browser option. @param option - History option. @returns Term. */ (
        option,
      ) => option.value,
    );
  }
  expect(terms()).toEqual(Array.from("ZYXWVUTSRQ"));
  fireEvent.change(search, { target: { value: "U" } });
  fireEvent.keyDown(search, { key: "Enter" });
  expect(terms()).toEqual(Array.from("UZYXWVTSRQ"));
  workbench.unmount();
  session.view.Close();
});

it("matches kashida and character width only when those dialog options are selected", /** Checks the pinned CTL/CJK defaults and the independent Find Bar behavior. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  session.view.GetWrtShell().Insert("كـتب كتب ＡＢ AB");
  const workbench = render(<WriterWorkbench isActive view={session.view} />);

  fireEvent.keyDown(window, { key: "h", ctrlKey: true });
  const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
  const search = dialog.getByLabelText("Find");
  fireEvent.click(dialog.getByText("Other options"));
  const matchKashida = dialog.getByRole("checkbox", { name: "Kashida-sensitive" });
  const matchWidth = dialog.getByRole("checkbox", { name: "Match character width" });
  const all = dialog.getByRole("button", { name: "Find All" });
  expect(matchKashida).not.toBeChecked();
  expect(matchWidth).not.toBeChecked();

  fireEvent.change(search, { target: { value: "كتب" } });
  fireEvent.click(all);
  expect(dialog.getByRole("status")).toHaveTextContent("2 results");
  fireEvent.click(matchKashida);
  fireEvent.click(all);
  expect(dialog.getByRole("status")).toHaveTextContent("One match found.");
  fireEvent.change(search, { target: { value: "AB" } });
  fireEvent.click(all);
  expect(dialog.getByRole("status")).toHaveTextContent("2 results");
  fireEvent.click(matchWidth);
  fireEvent.click(all);
  expect(dialog.getByRole("status")).toHaveTextContent("One match found.");

  fireEvent.keyDown(search, { key: "Escape" });
  fireEvent.keyDown(window, { key: "f", ctrlKey: true });
  const toolbar = within(screen.getByRole("toolbar", { name: "Find" }));
  fireEvent.change(toolbar.getByLabelText("Find"), { target: { value: "كتب" } });
  fireEvent.click(toolbar.getByRole("button", { name: "Find All" }));
  expect(toolbar.getByRole("status")).toHaveTextContent("2 results");
  workbench.unmount();
  session.view.Close();
});

it("opens the search dialog scoped to a selection across paragraphs", /** Preserves the Writer search item behavior for a selection without a single-paragraph search term. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  shell.Insert("cat cat");
  const first = shell.GetActiveParagraph();
  shell.SplitNode();
  shell.Insert("cat cat");
  const second = shell.GetActiveParagraph();
  const mark = new SwPosition(first, 4);
  const point = new SwPosition(second, 3);
  shell.SetPaM(point, mark);
  point.Dispose();
  mark.Dispose();
  const workbench = render(<WriterWorkbench isActive view={session.view} />);

  fireEvent.keyDown(window, { key: "h", ctrlKey: true });
  const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
  const search = dialog.getByLabelText("Find");
  expect(search).toHaveValue("");
  expect(dialog.getByRole("checkbox", { name: "Current selection only" })).toBeChecked();
  fireEvent.change(search, { target: { value: "cat" } });
  fireEvent.click(dialog.getByRole("button", { name: "Find All" }));
  expect(dialog.getByRole("status")).toHaveTextContent("2 results");
  workbench.unmount();
  session.view.Close();
});

it("uses Japanese search defaults and applies or cancels the Sounds options draft", /** Exercises the Japanese option groups, submission and independent complex matching. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  session.view.GetWrtShell().Insert("xファ ハ");
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  fireEvent.keyDown(window, { key: "h", ctrlKey: true });
  const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
  fireEvent.click(dialog.getByText("Other options"));
  const search = dialog.getByLabelText("Find");
  const all = dialog.getByRole("button", { name: "Find All" });
  const enable = dialog.getByRole("checkbox", { name: "Sounds like (Japanese)" });
  const sounds = dialog.getByRole("button", { name: "Sounds…" });
  expect(sounds).toBeDisabled();
  fireEvent.change(search, { target: { value: "ハ" } });
  fireEvent.click(all);
  expect(dialog.getByRole("status")).toHaveTextContent("One match found.");

  fireEvent.click(enable);
  expect(dialog.getByRole("checkbox", { name: "Match case" })).toBeDisabled();
  expect(dialog.getByRole("checkbox", { name: "Match character width" })).toBeDisabled();
  fireEvent.click(all);
  expect(dialog.getByRole("status")).toHaveTextContent("2 results");

  fireEvent.click(sounds);
  let options = within(screen.getByRole("dialog", { name: "Japanese Search Options" }));
  expect(options.getByRole("group", { name: "Treat as Equal" })).toBeInTheDocument();
  expect(options.getByRole("group", { name: "Ignore" })).toBeInTheDocument();
  fireEvent.click(options.getByRole("checkbox", { name: "ba/va, ha/fa" }));
  fireEvent.click(options.getByRole("button", { name: "Cancel" }));
  fireEvent.click(all);
  expect(dialog.getByRole("status")).toHaveTextContent("2 results");

  fireEvent.click(sounds);
  options = within(screen.getByRole("dialog", { name: "Japanese Search Options" }));
  fireEvent.click(options.getByRole("checkbox", { name: "ba/va, ha/fa" }));
  fireEvent.click(options.getByRole("button", { name: "OK" }));
  fireEvent.click(all);
  expect(dialog.getByRole("status")).toHaveTextContent("One match found.");
  workbench.unmount();
  session.view.Close();
});

it("uses and commits the native similarity limits for document search and replacement", /** Exercises dialog defaults, cancellation, word matches, and grouped Writer undo. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  shell.Insert("dog кот cot cat");
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  fireEvent.keyDown(window, { key: "h", ctrlKey: true });
  const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
  fireEvent.click(dialog.getByText("Other options"));
  const toggle = dialog.getByRole("checkbox", { name: "Similarity search" });
  const settings = dialog.getByRole("button", { name: "Similarities…" });
  expect(settings).toBeDisabled();
  fireEvent.click(toggle);

  fireEvent.click(settings);
  let modal = within(screen.getByRole("dialog", { name: "Similarity Search" }));
  expect(modal.getByRole("spinbutton", { name: "Exchange characters" })).toHaveValue(2);
  expect(modal.getByRole("checkbox", { name: "Combine" })).toBeChecked();
  fireEvent.change(modal.getByRole("spinbutton", { name: "Exchange characters" }), {
    target: { value: "0" },
  });
  fireEvent.click(modal.getByRole("button", { name: "Cancel" }));

  fireEvent.click(settings);
  modal = within(screen.getByRole("dialog", { name: "Similarity Search" }));
  expect(modal.getByRole("spinbutton", { name: "Exchange characters" })).toHaveValue(2);
  fireEvent.change(modal.getByRole("spinbutton", { name: "Exchange characters" }), {
    target: { value: "1" },
  });
  fireEvent.change(modal.getByRole("spinbutton", { name: "Add characters" }), {
    target: { value: "0" },
  });
  fireEvent.change(modal.getByRole("spinbutton", { name: "Remove characters" }), {
    target: { value: "0" },
  });
  fireEvent.click(modal.getByRole("checkbox", { name: "Combine" }));
  fireEvent.click(modal.getByRole("button", { name: "OK" }));

  fireEvent.change(dialog.getByLabelText("Find"), { target: { value: "cat" } });
  fireEvent.change(dialog.getByLabelText("Replace with"), { target: { value: "new" } });
  fireEvent.click(dialog.getByRole("button", { name: "Find All" }));
  expect(dialog.getByRole("status")).toHaveTextContent("2 results");
  fireEvent.click(dialog.getByRole("button", { name: "Replace All" }));
  expect(shell.GetActiveParagraph().GetText()).toBe("dog кот new new");
  fireEvent.keyDown(dialog.getByLabelText("Find"), { key: "Escape" });
  fireEvent.keyDown(window, { key: "z", ctrlKey: true });
  expect(shell.GetActiveParagraph().GetText()).toBe("dog кот cot cat");
  workbench.unmount();
  session.view.Close();
});

it("searches used paragraph styles and replaces matched collections in one undo action", /** Exercises native collection selection and grouped style replacement through the modeless dialog. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  shell.Insert("Alpha heading");
  shell.SetParagraphStyle("heading-1");
  const first = shell.GetActiveParagraph();
  shell.SplitNode();
  shell.Insert("Ordinary text");
  shell.SetParagraphStyle("default");
  const middle = shell.GetActiveParagraph();
  shell.SplitNode();
  shell.Insert("Beta heading");
  shell.SetParagraphStyle("heading-1");
  const last = shell.GetActiveParagraph();
  const workbench = render(<WriterWorkbench isActive view={session.view} />);

  fireEvent.keyDown(window, { key: "h", ctrlKey: true });
  const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
  fireEvent.click(dialog.getByText("Other options"));
  fireEvent.click(dialog.getByRole("checkbox", { name: "Search for styles" }));
  const find = dialog.getByRole("combobox", { name: "Find" });
  const replacement = dialog.getByRole("combobox", { name: "Replace with" });
  expect(within(find).queryByRole("option", { name: "Heading 2" })).toBeNull();
  expect(within(replacement).getByRole("option", { name: "Heading 2" })).toBeInTheDocument();
  fireEvent.change(find, { target: { value: "heading-1" } });
  fireEvent.click(dialog.getByRole("button", { name: "Find All" }));
  expect(dialog.getByRole("status")).toHaveTextContent("2 results");
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(0);
  expect(shell.GetCursor().End().GetContentIndex()).toBe(shell.GetActiveParagraph().Len());

  fireEvent.change(replacement, { target: { value: "heading-2" } });
  fireEvent.click(dialog.getByRole("button", { name: "Replace All" }));
  expect(first.GetParagraphStyle()).toBe("heading-2");
  expect(middle.GetParagraphStyle()).toBe("default");
  expect(last.GetParagraphStyle()).toBe("heading-2");
  fireEvent.click(dialog.getByRole("button", { name: "Close" }));
  fireEvent.keyDown(window, { key: "z", ctrlKey: true });
  expect(first.GetParagraphStyle()).toBe("heading-1");
  expect(last.GetParagraphStyle()).toBe("heading-1");
  workbench.unmount();
  session.view.Close();
});

it("clears the Find Bar failure when the search term changes", /** Ports tdf88608 from the pinned Find Bar UI tests. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  shell.Insert("Hello World");
  const workbench = render(<WriterWorkbench isActive view={session.view} />);

  fireEvent.keyDown(window, { key: "f", ctrlKey: true });
  const toolbar = within(screen.getByRole("toolbar", { name: "Find" }));
  const search = toolbar.getByLabelText("Find");
  const next = toolbar.getByRole("button", { name: "Find Next" });
  const status = toolbar.getByRole("status");
  fireEvent.change(search, { target: { value: "X" } });
  expect(status).toBeEmptyDOMElement();
  fireEvent.click(next);
  expect(status).toHaveTextContent("Search key not found");
  expect(shell.GetCursor().HasMark()).toBe(false);

  fireEvent.change(search, { target: { value: "World" } });
  expect(status).toBeEmptyDOMElement();
  fireEvent.click(next);
  expect(status).toHaveTextContent("Reached the end of the document");
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(6);
  expect(shell.GetCursor().End().GetContentIndex()).toBe(11);
  workbench.unmount();
  session.view.Close();
});

it("keeps the dialog draft on refocus and applies the backwards option only to Replace", /** Exercises the default button, refocus, and the pinned command directions. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  shell.Insert("cat cat cat");
  const exec = vi.spyOn(session.view.GetSearch(), "ExecSearch");
  const workbench = render(<WriterWorkbench isActive view={session.view} />);

  fireEvent.keyDown(window, { key: "h", ctrlKey: true });
  const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
  const search = dialog.getByLabelText("Find");
  const replacement = dialog.getByLabelText("Replace with");
  fireEvent.change(search, { target: { value: "missing" } });
  fireEvent.keyDown(search, { key: "Enter" });
  expect(search).toBeInvalid();
  fireEvent.change(search, { target: { value: "cat" } });
  expect(search).toBeValid();
  fireEvent.change(replacement, { target: { value: "catapult" } });
  fireEvent.click(dialog.getByText("Other options"));
  const backwards = dialog.getByRole("checkbox", { name: "Replace backwards" });
  fireEvent.click(backwards);
  replacement.focus();
  fireEvent.keyDown(window, { key: "h", ctrlKey: true });
  expect(search).toHaveFocus();
  expect(backwards).toBeChecked();
  expect(replacement).toHaveValue("catapult");

  fireEvent.keyDown(replacement, { key: "Enter" });
  expect(exec).toHaveBeenLastCalledWith(expect.anything(), SvxSearchCmd.FIND, false);
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(0);
  fireEvent.click(dialog.getByRole("button", { name: "Find Previous" }));
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(8);
  fireEvent.click(dialog.getByRole("button", { name: /^Replace$/ }));
  expect(exec).toHaveBeenLastCalledWith(expect.anything(), SvxSearchCmd.REPLACE, true);
  expect(shell.GetActiveParagraph().GetText()).toBe("cat cat catapult");
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(4);

  fireEvent.change(replacement, { target: { value: "dog" } });
  fireEvent.click(dialog.getByRole("button", { name: "Replace All" }));
  expect(exec).toHaveBeenLastCalledWith(expect.anything(), SvxSearchCmd.REPLACE_ALL, false);
  expect(shell.GetActiveParagraph().GetText()).toBe("dog dog dogapult");
  workbench.unmount();
  session.view.Close();
});

it("searches and replaces the selected table row through the native editing ring", /** Checks cell scope, displayed table selection, and undo through Writer controls. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const body = shell.GetActiveParagraph();
  body.SetText("needle in body");
  const table = shell.InsertTable({ mnInsMode: 0, mnRowsToRepeat: 0 }, 2, 2);
  if (table === undefined) throw new Error("Missing Writer search table");
  const row = table.GetTabLines()[0];
  const left = row?.GetTabBoxes()[0]?.GetParagraphs()[0];
  const right = row?.GetTabBoxes()[1]?.GetParagraphs()[0];
  const outside = table.GetTabLines()[1]?.GetTabBoxes()[0]?.GetParagraphs()[0];
  if (!left || !right || !outside) throw new Error("Missing Writer search cells");
  left.SetText("needle left");
  right.SetText("right needle");
  outside.SetText("needle outside");
  const point = new SwPosition(left, 0);
  shell.SetCursor(point);
  point.Dispose();
  expect(shell.SelectTableRow()).toBe(true);
  const workbench = render(<WriterWorkbench isActive view={session.view} />);

  fireEvent.keyDown(window, { key: "h", ctrlKey: true });
  const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
  expect(dialog.getByRole("checkbox", { name: "Current selection only" })).toBeChecked();
  fireEvent.change(dialog.getByLabelText("Find"), { target: { value: "needle" } });
  fireEvent.change(dialog.getByLabelText("Replace with"), { target: { value: "new" } });
  fireEvent.click(dialog.getByRole("button", { name: "Replace All" }));
  expect(dialog.getByRole("status")).toHaveTextContent("Search key replaced 2 times.");
  expect([left.GetText(), right.GetText(), outside.GetText(), body.GetText()]).toEqual([
    "new left",
    "right new",
    "needle outside",
    "needle in body",
  ]);
  expect(shell.HasBoxSelection()).toBe(true);
  fireEvent.click(dialog.getByRole("button", { name: "Close" }));
  fireEvent.keyDown(window, { key: "z", ctrlKey: true });
  expect([left.GetText(), right.GetText()]).toEqual(["needle left", "right needle"]);
  act(
    /** Reselects the cells after Undo has installed its own text cursor. @returns Nothing. */ () => {
      const start = new SwPosition(left, 0);
      shell.SetCursor(start);
      start.Dispose();
      expect(shell.SelectTableRow()).toBe(true);
    },
  );

  fireEvent.keyDown(window, { key: "h", ctrlKey: true });
  const reopened = within(screen.getByRole("dialog", { name: "Find and Replace" }));
  fireEvent.click(reopened.getByRole("button", { name: "Find All" }));
  expect(reopened.getByRole("status")).toHaveTextContent("2 results");
  expect(shell.HasBoxSelection()).toBe(false);
  expect(
    new Set(
      [...shell.GetCursor().GetRingContainer()].map(
        /** Reads each matched node from the published selection. @param range - Text match. @returns Actual cell text node. */ (
          range,
        ) => range.GetPoint().GetNode(),
      ),
    ),
  ).toEqual(new Set([left, right]));

  fireEvent.click(reopened.getByRole("checkbox", { name: "Current selection only" }));
  fireEvent.change(reopened.getByLabelText("Find"), { target: { value: "missing" } });
  fireEvent.click(reopened.getByRole("button", { name: "Find Next" }));
  expect(reopened.getByRole("status")).toHaveTextContent("Search key not found");
  expect(shell.GetCursor().HasMark()).toBe(false);
  expect(shell.GetCursor().IsMultiSelection()).toBe(false);
  workbench.unmount();
  session.view.Close();
});

it("searches and replaces text in connected frames in document search order", /** Uses native fly content and checks cursor projection, wrap, and grouped replacement. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const doc = session.docShell.GetDoc();
  const shell = session.view.GetWrtShell();
  const body = shell.GetActiveParagraph();
  body.SetText("needle body");
  const anchor = new SwPosition(body, 0);
  const items = new SfxItemSet(doc.GetAttrPool(), [[RES_FRMATR_BEGIN, RES_FRMATR_END - 1]]);
  const format = MakeFlySection(doc, RndStdIds.FLY_AT_PARA, anchor, items);
  shell.SetCursor(anchor);
  anchor.Dispose();
  items.Dispose();
  const start = format?.GetContent().GetContentIdx()?.GetNode();
  const frame = start && doc.nodes.at(start.GetIndex() + 1).GetTextNode();
  if (!frame) throw new Error("Missing Writer text frame paragraph");
  frame.SetText("needle and needle");
  const detached = doc.nodes.MakeTextNode(
    doc.nodes.GetEndOfAutotext(),
    doc.GetDfltTextFormatColl(),
  );
  detached.SetText("needle outside layout");
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  expect(workbench.container.querySelector("[data-writer-fly-frame]")).toHaveTextContent(
    "needle and needle",
  );

  fireEvent.keyDown(window, { key: "f", ctrlKey: true });
  const toolbar = within(screen.getByRole("toolbar", { name: "Find" }));
  const next = toolbar.getByRole("button", { name: "Find Next" });
  const previous = toolbar.getByRole("button", { name: "Find Previous" });
  const status = toolbar.getByRole("status");
  fireEvent.change(toolbar.getByLabelText("Find"), { target: { value: "needle" } });
  fireEvent.click(next);
  expect(shell.GetCursor().Start().GetNodeIndex()).toBe(body.GetIndex());
  fireEvent.click(next);
  expect(shell.GetCursor().Start().GetNodeIndex()).toBe(frame.GetIndex());
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(0);
  expect(shell.GetCursor().IsMultiSelection()).toBe(false);
  const selection = window.getSelection();
  expect(selection?.toString()).toBe("needle");
  expect(selection?.focusNode?.parentElement?.closest("[data-writer-fly-frame]")).not.toBeNull();
  expect(status).toBeEmptyDOMElement();
  fireEvent.click(next);
  expect(shell.GetCursor().Start().GetNodeIndex()).toBe(frame.GetIndex());
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(11);
  fireEvent.click(next);
  expect(shell.GetCursor().Start().GetNodeIndex()).toBe(body.GetIndex());
  expect(status).toHaveTextContent("Reached the end of the document");
  fireEvent.click(previous);
  expect(shell.GetCursor().Start().GetNodeIndex()).toBe(frame.GetIndex());
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(11);

  fireEvent.click(toolbar.getByRole("button", { name: "Find All" }));
  expect(status).toHaveTextContent("3 results");
  fireEvent.click(toolbar.getByRole("button", { name: "Find and Replace" }));
  const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
  fireEvent.change(dialog.getByLabelText("Replace with"), { target: { value: "new" } });
  fireEvent.click(dialog.getByRole("button", { name: "Replace All" }));
  expect(dialog.getByRole("status")).toHaveTextContent("Search key replaced 3 times.");
  expect(frame.GetText()).toBe("new and new");
  expect(body.GetText()).toBe("new body");
  expect(detached.GetText()).toBe("needle outside layout");
  fireEvent.click(dialog.getByRole("button", { name: "Close" }));
  fireEvent.keyDown(window, { key: "z", ctrlKey: true });
  expect(frame.GetText()).toBe("needle and needle");
  expect(body.GetText()).toBe("needle body");

  act(
    /** Restarts at the body before the style search. @returns Nothing. */ () => {
      const point = new SwPosition(body, 0);
      shell.SetCursor(point);
      point.Dispose();
    },
  );
  fireEvent.keyDown(window, { key: "h", ctrlKey: true });
  const styles = within(screen.getByRole("dialog", { name: "Find and Replace" }));
  fireEvent.click(styles.getByText("Other options"));
  fireEvent.click(styles.getByRole("checkbox", { name: "Search for styles" }));
  fireEvent.change(styles.getByLabelText("Find"), { target: { value: "frame-contents" } });
  fireEvent.click(styles.getByRole("button", { name: "Find Next" }));
  expect(shell.GetCursor().Start().GetNodeIndex()).toBe(frame.GetIndex());
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(0);
  expect(shell.GetCursor().End().GetContentIndex()).toBe(frame.Len());

  workbench.unmount();
  session.view.Close();
});

it("finds each rendered header and footer owner once and restores the result on the current page", /** Exercises page-story layout admission, browser selection, and replacement history. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const doc = session.docShell.GetDoc();
  const shell = session.view.GetWrtShell();
  const page = doc.GetPageDesc();
  page.SetValue({ ...page.GetValue(), height: 1200, topMargin: 500, bottomMargin: 500 });
  const master = page.GetMaster();
  master.SetFormatAttr(new SwFormatHeader(true));
  master.SetFormatAttr(new SwFormatFooter(true));
  const unused = doc.MakePageDesc("Unused search style").GetMaster();
  unused.SetFormatAttr(new SwFormatHeader(true));
  const [headerText, footerText, unusedText] = [
    master.GetHeader().GetHeaderFormat(),
    master.GetFooter().GetFooterFormat(),
    unused.GetHeader().GetHeaderFormat(),
  ].map(
    /** Resolves the original article text node from the page-frame format. @param story - Native story format. @returns Text owner. */ (
      story,
    ) => {
      const start = story?.GetContent().GetContentIdx()?.GetNode();
      if (start === undefined) throw new Error("Missing page story section");
      const text = doc.nodes.at(start.GetIndex() + 1).GetTextNode();
      if (text === null) throw new Error("Missing page story text");
      return text;
    },
  );
  if (!headerText || !footerText || !unusedText) throw new Error("Missing search fixture stories");
  headerText.SetText("needle header");
  footerText.SetText("needle footer");
  unusedText.SetText("needle unused");
  shell.Insert("First body paragraph");
  shell.SplitNode();
  shell.Insert("Second body paragraph");
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  const secondPage = screen.getByRole("document", { name: "Page 2" });
  expect(workbench.container.querySelectorAll('[data-writer-page-story="header"]')).toHaveLength(2);
  expect(secondPage.querySelector('[data-writer-page-story="footer"]')).toHaveTextContent(
    "needle footer",
  );
  expect(window.getSelection()?.focusNode?.parentElement?.closest("[data-writer-page]")).toBe(
    secondPage,
  );

  fireEvent.keyDown(window, { key: "h", ctrlKey: true });
  const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
  fireEvent.change(dialog.getByLabelText("Find"), { target: { value: "needle" } });
  fireEvent.click(dialog.getByRole("button", { name: "Find Next" }));
  const selection = window.getSelection();
  expect(selection?.toString()).toBe("needle");
  expect(selection?.focusNode?.parentElement?.closest("[data-writer-page-story]")).not.toBeNull();
  expect(selection?.focusNode?.parentElement?.closest("[data-writer-page]")).toBe(secondPage);
  fireEvent.click(dialog.getByRole("button", { name: "Find All" }));
  expect(dialog.getByRole("status")).toHaveTextContent("2 results");

  fireEvent.change(dialog.getByLabelText("Replace with"), { target: { value: "new" } });
  fireEvent.click(dialog.getByRole("button", { name: "Replace All" }));
  expect(dialog.getByRole("status")).toHaveTextContent("Search key replaced 2 times.");
  expect([headerText.GetText(), footerText.GetText(), unusedText.GetText()]).toEqual([
    "new header",
    "new footer",
    "needle unused",
  ]);
  fireEvent.click(dialog.getByRole("button", { name: "Close" }));
  fireEvent.keyDown(window, { key: "z", ctrlKey: true });
  expect([headerText.GetText(), footerText.GetText()]).toEqual(["needle header", "needle footer"]);
  workbench.unmount();
  session.view.Close();
});
