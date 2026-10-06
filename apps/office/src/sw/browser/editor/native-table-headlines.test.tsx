/** @fileoverview Verifies repeated table headlines paint and edit the same native nodes through one existing edit window. */
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { encodeWriterDocument } from "../filter/xml/writer-document-codec";
import { applyWriterParagraphList } from "../../source/core/doc/list";
import { SwPosition } from "../../source/core/crsr/pam";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases DOM before actual document owners. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Mounts a real multi-page flat table. @param repeat - Existing repeat setting. @param list - Numbered header. @param bodyText - Actual preceding paragraph. @returns Actual model and DOM owners. */
function fixture(repeat = true, list = false, bodyText = "Before") {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    body = doc.paragraphs[0];
  if (body === undefined) throw new Error("Missing native body");
  body.SetText(bodyText);
  const table = doc.nodes.MakeTableNode(
    "Headlines",
    { headerRows: 1, repeatHeaderRows: repeat, width: 4000 },
    body,
  );
  table.AddColumnWidth(4000);
  const nodes = Array.from(
    { length: 4 },
    /** Creates native original rows. @param _slot - Array slot. @param index - Original row. @returns Text owner. */ (
      _slot,
      index,
    ) => {
      const node = doc.nodes
        .AppendTableRow(table, 1, { minHeight: 300 })
        .GetTabBoxes()[0]
        ?.GetParagraphs()[0];
      if (node === undefined) throw new Error("Missing native header");
      node.SetText(index === 0 ? "Header" : "Body" + index);
      return node;
    },
  );
  const header = nodes[0];
  if (header === undefined) throw new Error("Missing actual header");
  if (list)
    applyWriterParagraphList(header, {
      kind: "numbered",
      styleId: "HeaderRule",
      listId: "header-list",
    });
  const after = doc.nodes.MakeTextNode("After");
  shell.SetPageDescriptor({
    ...doc.GetPageDesc().GetValue(),
    height: 1000,
    topMargin: 100,
    bottomMargin: 100,
    width: 6000,
    leftMargin: 100,
    rightMargin: 100,
  });
  shell.FocusNode(body);
  doc.GetUndoManager().Clear();
  const mounted = render(
    <WriterWorkbench
      isActive
      view={session.view}
      fileDialogs={session.fileDialogs}
      services={session.services}
    />,
  );
  return { session, doc, shell, table, body, after, header, nodes, mounted };
}
/** Gets all actual visible header occurrences. @returns Master plus follow paragraphs. */
function headers() {
  return screen.getAllByRole("textbox", { name: "Row 1 column 1 paragraph 1" });
}
/** Installs actual local DOM endpoints in one header occurrence. @param element - Mounted occurrence. @param offset - Moving UTF16 offset. @param mark - Fixed UTF16 offset. @returns Nothing. */
function select(element: HTMLElement, offset: number, mark = offset) {
  const text = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode();
  if (text === null) throw new Error("Missing projected text");
  window.getSelection()?.setBaseAndExtent(text, mark, text, offset);
}
/** Sends actual cancelable browser input through the existing root listener. @param element - Current header occurrence. @returns Nothing. */
function type(element: HTMLElement) {
  const input = new InputEvent("beforeinput", {
    bubbles: true,
    cancelable: true,
    inputType: "insertText",
    data: "X",
  });
  act(
    /** Delivers one native intent. @returns Nothing. */ () => {
      element.dispatchEvent(input);
    },
  );
  expect(input.defaultPrevented).toBe(true);
}
describe("native repeated table headline UI", /** Registers actual shared-node display and history contracts. @returns Nothing. */ () => {
  it("moves from a focused follow text frame to a lower source offset while preserving repeated headline owners", /** Checks the focused occurrence is admitted only when it contains the source offset. @returns Completion. */ async () => {
    const original = Object.getOwnPropertyDescriptor(Range.prototype, "getClientRects");
    Object.defineProperty(Range.prototype, "getClientRects", {
      configurable: true,
      /** Supplies independent two-character device lines. @param this - Device range. @returns Line geometry. */
      value: function (this: Range) {
        return [{ top: Math.floor(this.startOffset / 2) * 20, height: 20 }];
      },
    });
    try {
      const f = fixture(true, false, "BeforeAB");
      await waitFor(
        /** Waits for actual measured source fragments. @returns Nothing. */ () =>
          expect(screen.getAllByRole("textbox", { name: "Writer document text" })).toHaveLength(2),
      );
      const parts = screen.getAllByRole("textbox", { name: "Writer document text" }),
        first = parts[0],
        follow = parts[1];
      if (first === undefined || follow === undefined)
        throw new Error("Missing actual source follow text frame");
      expect(first.textContent).toBe("Befo");
      expect(follow.textContent).toBe("reAB");
      select(follow, 2);
      fireEvent(document, new Event("selectionchange"));
      expect(f.shell.GetCursor().GetPoint().GetContentIndex()).toBe(6);
      const point = new SwPosition(f.body, 1);
      try {
        act(
          /** Sets an earlier actual source coordinate. @returns Nothing. */ () => {
            f.shell.SetCursor(point);
          },
        );
      } finally {
        point.Dispose();
      }
      expect(first.contains(window.getSelection()?.focusNode ?? null)).toBe(true);
      expect(window.getSelection()?.focusOffset).toBe(1);
      expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(f.body);
      expect(headers()).toHaveLength(3);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    } finally {
      if (original === undefined) Reflect.deleteProperty(Range.prototype, "getClientRects");
      else Object.defineProperty(Range.prototype, "getClientRects", original);
    }
  });
  it("paints shared original rows with empty descriptions and no repeated row gutter", /** Checks native frame/model and DOM ownership. @returns Nothing. */ () => {
    const f = fixture(),
      copies = headers();
    expect(copies).toHaveLength(3);
    for (const element of copies) {
      expect(element).toHaveTextContent("Header");
      expect(element).toHaveAttribute("data-writer-node-index", String(f.header.GetIndex()));
      expect(element).not.toHaveAttribute("aria-describedby");
      expect(element).not.toHaveAccessibleDescription();
    }
    expect(
      f.mounted.container.querySelectorAll('[data-writer-repeated-headline="true"]'),
    ).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Select row 1 in Headlines" })).toHaveLength(1);
    expect(f.table.GetTabLines()).toHaveLength(4);
    expect(
      f.doc.nodes
        .entries()
        .filter(
          /** Identifies actual original header. @param node - Text owner. @returns Whether identical. */ (
            node,
          ) => node === f.header,
        ),
    ).toHaveLength(1);
    expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(f.body);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  });
  it.each([0, 1, 2])(
    "edits original node through occurrence %s and restores actual occurrence with UndoRedo",
    /** Checks native input and persistent cursor ownership. @param index - Render occurrence. @returns Nothing. */ (
      index,
    ) => {
      const f = fixture(),
        copy = headers()[index];
      if (copy === undefined) throw new Error("Missing header occurrence");
      const count = f.doc.nodes.entries().length,
        before = encodeWriterDocument(f.doc),
        cursor = f.shell.GetCursor();
      select(copy, 2);
      type(copy);
      expect(f.header.GetText()).toBe("HeXader");
      expect(
        headers().every(
          /** Checks each updated native projection. @param element - Header occurrence. @returns Match. */ (
            element,
          ) => element.textContent === "HeXader",
        ),
      ).toBe(true);
      expect(f.shell.GetCursor()).toBe(cursor);
      expect(cursor.GetPoint().GetNode()).toBe(f.header);
      expect(cursor.GetPoint().GetContentIndex()).toBe(3);
      expect(copy.contains(window.getSelection()?.focusNode ?? null)).toBe(true);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      expect(f.doc.nodes.entries()).toHaveLength(count);
      act(
        /** Undoes shared-node typing. @returns Nothing. */ () => {
          expect(f.shell.Undo()).toBe(true);
        },
      );
      expect(f.header.GetText()).toBe("Header");
      expect(
        headers().every(
          /** Checks all undo projections. @param element - Header occurrence. @returns Match. */ (
            element,
          ) => element.textContent === "Header",
        ),
      ).toBe(true);
      expect(encodeWriterDocument(f.doc)).toEqual(before);
      act(
        /** Redoes native original-node typing. @returns Nothing. */ () => {
          expect(f.shell.Redo()).toBe(true);
        },
      );
      expect(f.header.GetText()).toBe("HeXader");
      expect(copy.contains(window.getSelection()?.focusNode ?? null)).toBe(true);
      expect(
        f.nodes
          .slice(1)
          .map(
            /** Reads unaffected original body rows. @param node - Owner. @returns Text. */ (
              node,
            ) => node.GetText(),
          ),
      ).toEqual(["Body1", "Body2", "Body3"]);
      expect(f.body.GetText()).toBe("Before");
      expect(f.after.GetText()).toBe("After");
    },
  );
  it("formats all header occurrences through the same native paragraph and history", /** Checks numbering/style copies are display only. @returns Nothing. */ () => {
    const f = fixture(true, true),
      copy = headers()[1];
    if (copy === undefined) throw new Error("Missing follow header");
    const rule = f.header.GetNumRule(),
      listId = f.header.GetListId();
    fireEvent.focus(copy);
    select(copy, 6, 0);
    fireEvent(document, new Event("selectionchange"));
    fireEvent.keyDown(copy, { key: "b", ctrlKey: true });
    expect(
      headers().every(
        /** Checks actual shared character formatting. @param element - Occurrence. @returns Match. */ (
          element,
        ) => element.querySelector("strong") !== null,
      ),
    ).toBe(true);
    expect(f.header.GetNumRule()).toBe(rule);
    expect(f.header.GetListId()).toBe(listId);
    expect(screen.getAllByTestId(/writer-list-marker-/)).toHaveLength(3);
    act(
      /** Undoes original header formatting. @returns Nothing. */ () => {
        expect(f.shell.Undo()).toBe(true);
      },
    );
    expect(
      headers().every(
        /** Checks actual normal portions. @param element - Occurrence. @returns Match. */ (
          element,
        ) => element.querySelector("strong") === null,
      ),
    ).toBe(true);
  });
  it("keeps disabled headline repetition as a single master and ordinary body rows", /** Checks stored false setting remains effective. @returns Nothing. */ () => {
    const f = fixture(false);
    expect(headers()).toHaveLength(1);
    expect(f.mounted.container.querySelector("[data-writer-repeated-headline]")).toBeNull();
    expect(f.table.GetRowsToRepeat()).toBe(0);
    expect(screen.getAllByRole("textbox", { name: "Row 4 column 1 paragraph 1" })).toHaveLength(1);
  });
});
