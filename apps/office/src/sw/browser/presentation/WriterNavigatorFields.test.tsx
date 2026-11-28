/** @fileoverview Verifies the Navigator over native hyperlink hints and annotation fields. */
import { readFileSync } from "node:fs";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { assert, expect, it } from "vitest";
import { DateTime } from "../../../tools/source/datetime/datetime";
import { SwPaM, SwPosition } from "../../source/core/crsr/pam";
import { SwPostItField, SwPostItFieldType } from "../../source/core/fields/docufld";
import { InsertPostIt } from "../../source/uibase/wrtsh/wrtsh-editing";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";

it("orders the pinned tdf134960 hyperlinks by document and frame-anchor position", /** Opens the exact native Writer sample through the ordinary ODT filter. @returns Completion. */ async () => {
  const session = createWriterDocumentSession();
  try {
    const sample = "../../vendor/libreoffice-reference/sw/qa/uitest/data/tdf134960.odt";
    await session.docShell.Load(
      new Uint8Array(readFileSync(sample)),
      session.docShell.GetDocumentState(),
    );
    const tree = session.view.GetNavigator();
    /** Reads the displayed link sequence after the latest layout edit. @returns Navigator labels. */
    function getLabels(): string[] | undefined {
      return tree
        .GetContents()
        .find(
          /** Selects the native hyperlink category. @param group - Navigator group. @returns Whether it contains hyperlinks. */
          (group) => group.type === "hyperlink",
        )
        ?.contents.map(
          /** Reads the label rendered by Navigator. @param row - Native link. @returns Link label. */
          (row) => row.title,
        );
    }
    const expected = [1, 2, 8, 9, 7, 10, 11, 3, 12, 4, 5, 6].map(
      /** Reconstructs the original named fixture link. @param n - Fixture link number. @returns Label. */
      (n) => `Hyperlink ${n}`,
    );
    expect(getLabels()).toEqual(expected);
    const shell = session.view.GetWrtShell();
    const second = shell.GetDoc().paragraphs[1];
    assert(second);
    const cursor = new SwPosition(second, 0);
    shell.SetCursor(cursor);
    cursor.Dispose();
    expect(shell.GetTextShell().InsertHardPageBreak()).toBe(true);
    expect(getLabels()).toEqual(expected);
  } finally {
    session.Close();
  }
});

it("tracks repeated hyperlink labels by address and removes only the chosen attribute", /** Verifies source link identity and the existing Remove Hyperlink slot through the mounted menu. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const node = shell.GetDoc().paragraphs[0];
  assert(node);
  node.SetText("Same and Same");
  node.SetHyperlink(0, 4, { url: "https://example.test/first" });
  node.SetHyperlink(9, 13, { url: "https://example.test/second" });
  try {
    session.view.ToggleNavigator();
    render(<WriterWorkbench view={session.view} isActive />);
    const navigator = within(screen.getByRole("dialog", { name: "Navigator" }));
    const editor = screen.getByRole("textbox", { name: "Writer document text" });
    act(
      /** Moves the focused caret into the second attribute. @returns Nothing. */ () => {
        editor.focus();
        const point = new SwPosition(node, 10);
        shell.SetCursor(point);
        point.Dispose();
      },
    );
    const same = navigator.getAllByRole("treeitem", { name: "Same" });
    expect(same[0]).toHaveAttribute("aria-selected", "false");
    expect(same[1]).toHaveAttribute("aria-selected", "true");
    assert(same[1]);
    fireEvent.contextMenu(same[1]);
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Hyperlink Tracking" }));
    try {
      act(
        /** When native hyperlink tracking is disabled, the current tree selection is retained. @returns Nothing. */
        () => {
          editor.focus();
          const point = new SwPosition(node, 1);
          shell.SetCursor(point);
          point.Dispose();
        },
      );
      expect(same[1]).toHaveAttribute("aria-selected", "true");
    } finally {
      session.view.GetNavigator().SetContentTypeTracking("hyperlink", true);
    }
    fireEvent.contextMenu(same[1]);
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete Hyperlink" }));
    expect(navigator.getAllByRole("treeitem", { name: "Same" })).toHaveLength(1);
    expect(node.GetText()).toBe("Same and Same");
    act(
      /** Checks that normal Writer undo restores the removed attribute. @returns Nothing. */ () => {
        shell.Undo();
      },
    );
    expect(navigator.getAllByRole("treeitem", { name: "Same" })).toHaveLength(2);
  } finally {
    cleanup();
    session.Close();
  }
});

it("updates the collapsed comments category for the pinned tdf137274 sequence", /** Inserts two original annotation values and tests the resulting contextual actions. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const doc = shell.GetDoc();
  const paragraph = doc.paragraphs[0];
  assert(paragraph);
  paragraph.SetText("Test");
  const type = SwPostItFieldType.Get(doc);
  /** Inserts the same prefilled annotation as the native test. @param text - Comment value. @returns Nothing. */
  function insert(text: string): void {
    assert(paragraph);
    const point = new SwPosition(paragraph, paragraph.Len());
    const range = new SwPaM(point);
    try {
      assert(
        InsertPostIt(
          shell,
          range,
          new SwPostItField(type, {
            author: "Author",
            initials: "",
            text,
            name: "",
            dateTime: new DateTime(DateTime.SYSTEM),
          }),
        ),
      );
    } finally {
      range.Dispose();
      point.Dispose();
    }
  }
  try {
    insert("C1");
    session.view.ToggleNavigator();
    render(<WriterWorkbench view={session.view} isActive />);
    const navigator = within(screen.getByRole("dialog", { name: "Navigator" }));
    const group = navigator.getByRole("treeitem", { name: "Comments" });
    expect(navigator.getByRole("treeitem", { name: "C1" })).toBeVisible();
    fireEvent.click(group);
    expect(navigator.queryByRole("treeitem", { name: "C1" })).toBeNull();
    act(
      /** Updates the document while the comments category stays collapsed. @returns Nothing. */ () => {
        insert("C2");
      },
    );
    if (group.getAttribute("aria-expanded") === "false") fireEvent.click(group);
    expect(
      navigator.getAllByRole("treeitem", { name: /^C[12]$/u }).map(
        /** Reads the names of both anchored comments. @param row - Visible Navigator item. @returns Label. */
        (row) => row.textContent,
      ),
    ).toEqual(["C1", "C2"]);
    fireEvent.contextMenu(navigator.getByRole("treeitem", { name: "C2" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Go to" }));
    const notes = [...type.GatherFields()];
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(
      notes[1]?.GetTextField()?.GetStart(),
    );
    fireEvent.contextMenu(navigator.getByRole("treeitem", { name: "C2" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete Comment" }));
    expect(navigator.queryByRole("treeitem", { name: "C2" })).toBeNull();
    expect(navigator.getByRole("treeitem", { name: "C1" })).toBeVisible();
  } finally {
    cleanup();
    session.Close();
  }
});
