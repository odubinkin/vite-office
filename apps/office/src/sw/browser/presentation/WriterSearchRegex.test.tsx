/** @fileoverview Verifies regular-expression search through the Writer browser session. */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { SEARCH_OPTIONS_KEY } from "../storage/writer-search-options-store";
import { WriterWorkbench } from "./writer-view";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { RndStdIds } from "../../../svx/inc/swframetypes";
import { Size } from "../../../tools/inc/gen";
import { Graphic } from "../../../vcl/source/gdi/graph";
import { SwFormatAnchor } from "../../inc/fmtanchr";
import { aFrameFormatSetRange } from "../../source/core/bastyp/init";
import { SwPaM, SwPosition } from "../../source/core/crsr/pam";

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

it("retains formatting criteria while similarity search disables their controls", /** Exercises the native algorithm transition with inclusive styles and existing formatting. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    const format = dialog.getByRole("button", { name: "Format…" });
    const attributes = dialog.getByRole("button", { name: "Attributes…" });
    const noFormat = dialog.getByRole("button", { name: "No Format" });
    fireEvent.click(attributes);
    const picker = within(screen.getByRole("dialog", { name: "Attributes" }));
    fireEvent.click(picker.getByRole("checkbox", { name: "Underline" }));
    fireEvent.click(picker.getByRole("button", { name: "OK" }));
    fireEvent.change(dialog.getByLabelText("Find"), { target: { value: "test" } });
    const styles = dialog.getByRole("checkbox", { name: "Including Styles" });
    const wholeWords = dialog.getByRole("checkbox", { name: "Whole words only" });
    const matchCase = dialog.getByRole("checkbox", { name: "Match case" });
    fireEvent.click(wholeWords);
    fireEvent.click(matchCase);
    fireEvent.click(styles);
    expect(styles).toBeChecked();
    expect(wholeWords).toBeChecked();
    expect(matchCase).toBeChecked();
    const similarity = dialog.getByRole("checkbox", { name: "Similarity search" });
    fireEvent.click(similarity);
    expect(styles).not.toBeChecked();
    expect(styles).toBeDisabled();
    expect(format).toBeDisabled();
    expect(attributes).toBeDisabled();
    expect(noFormat).toBeDisabled();
    expect(dialog.getByText("Underline")).toBeVisible();

    fireEvent.click(similarity);
    expect(styles).toBeEnabled();
    expect(format).toBeEnabled();
    expect(attributes).toBeEnabled();
    expect(noFormat).toBeEnabled();
    expect(dialog.getByText("Underline")).toBeVisible();
  } finally {
    workbench.unmount();
    session.view.Close();
  }
});

it.each([
  { variant: "inline", type: RndStdIds.FLY_AS_CHAR, pattern: "a.b" },
  { variant: "floating", type: RndStdIds.FLY_AT_CHAR, pattern: "ab" },
])(
  "updates a covered $variant graphic through Find and Replace and restores it on Undo",
  /** Runs normal search commands with a rendered graphic. @param scenario - Native anchor mode and find pattern. @returns Nothing. */
  (scenario) => {
    const session = createWriterDocumentSession();
    const shell = session.view.GetWrtShell();
    shell.Insert("ab tail");
    const node = shell.GetActiveParagraph();
    const doc = node.GetDoc();
    const point = new SwPosition(node, 1);
    const range = new SwPaM(point);
    const anchor = new SwFormatAnchor(scenario.type);
    const items = new SfxItemSet(doc.GetAttrPool(), aFrameFormatSetRange);
    const gif = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
    try {
      anchor.SetAnchor(point);
      items.Put(anchor);
      doc
        .GetDocumentContentOperationsManager()
        .InsertGraphic(range, new Graphic(gif, "image/gif", new Size(120, 120)), items);
    } finally {
      range.Dispose();
      point.Dispose();
      anchor.Dispose();
      items.Dispose();
    }
    const workbench = render(<WriterWorkbench isActive view={session.view} />);
    try {
      expect(screen.getByRole("img", { name: "Image1" })).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "h", ctrlKey: true });
      const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
      fireEvent.click(dialog.getByText("Other options"));
      fireEvent.click(dialog.getByRole("checkbox", { name: "Regular expressions" }));
      fireEvent.change(dialog.getByLabelText("Find"), { target: { value: scenario.pattern } });
      fireEvent.change(dialog.getByLabelText("Replace with"), { target: { value: "cat" } });
      fireEvent.click(dialog.getByRole("button", { name: "Replace All" }));
      expect(node.GetText()).toBe("cat tail");
      if (scenario.type === RndStdIds.FLY_AS_CHAR) {
        expect(screen.queryByRole("img", { name: "Image1" })).toBeNull();
      } else {
        expect(screen.getByRole("img", { name: "Image1" })).toBeInTheDocument();
        expect(doc.GetSpzFrameFormats().GetFormat(0).GetAnchor().GetAnchorContentOffset()).toBe(0);
      }
      fireEvent.keyDown(dialog.getByLabelText("Find"), { key: "Escape" });
      fireEvent.keyDown(window, { key: "z", ctrlKey: true });
      expect(screen.getByRole("img", { name: "Image1" })).toBeInTheDocument();
      expect(doc.GetSpzFrameFormats().GetFormat(0).GetAnchor().GetAnchorContentOffset()).toBe(1);
    } finally {
      workbench.unmount();
      session.view.Close();
    }
  },
);
