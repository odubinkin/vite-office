/** @fileoverview Verifies native split policy changes physical pages while retaining canonical editable cells. */
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases mounted native owners. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Reads real physical page ownership. @returns Page indexes. */
function pages() {
  return [...document.querySelectorAll('table[aria-label="Split"]')].map(
    /** Reads the owning physical page. @param table - Rendered table. @returns Page number. */ (
      table,
    ) => Number(table.closest("[data-writer-page]")?.getAttribute("data-writer-page")),
  );
}
it.each([undefined, true, false])(
  "native split policy paints original cells on source pages original=%s",
  /** Checks page placement, original document graph and repeated native history. @param original - Existing item. @returns Nothing. */ (
    original,
  ) => {
    const session = createWriterDocumentSession();
    sessions.push(session);
    const doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell(),
      body = doc.paragraphs[0];
    if (body === undefined) throw new Error("Missing native body");
    body.SetText("Before");
    const table = doc.nodes.MakeTableNode(
      "Split",
      { width: 4000, ...(original === undefined ? {} : { layoutSplit: original }) },
      body,
    );
    table.AddColumnWidth(4000);
    for (let r = 0; r < 3; r++) {
      const node = doc.nodes
        .AppendTableRow(
          table,
          1,
          { frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 200) },
          [{ padding: 0, border: "none" }],
        )
        .GetTabBoxes()[0]
        ?.GetParagraphs()[0];
      if (node === undefined) throw new Error("Missing native cell");
      node.SetText("Cell" + r);
    }
    const row = table.GetTabLines()[0],
      box = row?.GetTabBoxes()[0],
      node = box?.GetParagraphs()[0];
    if (row === undefined || box === undefined || node === undefined)
      throw new Error("Missing original graph");
    shell.SetPageDescriptor({
      ...doc.GetPageDesc().GetValue(),
      height: 1000,
      topMargin: 100,
      bottomMargin: 100,
      width: 6000,
      leftMargin: 100,
      rightMargin: 100,
    });
    shell.FocusNode(node);
    doc.GetUndoManager().Clear();
    render(<WriterWorkbench isActive view={session.view} />);
    expect(pages()).toEqual(original === false ? [2] : [1, 2]);
    expect(screen.getAllByRole("textbox", { name: "Row 1 column 1 paragraph 1" })).toHaveLength(1);
    expect(screen.getByRole("textbox", { name: "Row 3 column 1 paragraph 1" })).toHaveTextContent(
      "Cell2",
    );
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    act(
      /** Changes only the canonical table item. @returns Nothing. */ () => {
        expect(shell.SetTableAttr({ layoutSplit: !(original ?? true) })).toBe(true);
      },
    );
    expect(pages()).toEqual(original === false ? [1, 2] : [2]);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    for (let cycle = 0; cycle < 3; cycle++) {
      act(
        /** Restores native item and frame flow. @returns Nothing. */ () => {
          expect(shell.Undo()).toBe(true);
        },
      );
      expect(pages()).toEqual(original === false ? [2] : [1, 2]);
      act(
        /** Reapplies original native history. @returns Nothing. */ () => {
          expect(shell.Redo()).toBe(true);
        },
      );
      expect(pages()).toEqual(original === false ? [1, 2] : [2]);
      expect(table.GetTabLines()[0]).toBe(row);
      expect(row.GetTabBoxes()[0]).toBe(box);
      expect(box.GetParagraphs()[0]).toBe(node);
    }
    const editor = screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }),
      text = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT).nextNode();
    if (text === null) throw new Error("Missing real editing text");
    window.getSelection()?.setBaseAndExtent(text, 2, text, 2);
    fireEvent(document, new Event("selectionchange"));
    act(
      /** Inserts through the existing native root input listener. @returns Nothing. */ () => {
        editor.dispatchEvent(
          new InputEvent("beforeinput", {
            bubbles: true,
            cancelable: true,
            inputType: "insertText",
            data: "X",
          }),
        );
      },
    );
    expect(node.GetText()).toBe("CeXll0");
    expect(table.GetFormat().layoutSplit).toBe(!(original ?? true));
  },
);
