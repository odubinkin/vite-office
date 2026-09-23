/** @fileoverview Verifies the DOM-neutral Writer edit-window ownership boundary. */

import { describe, expect, it, vi } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createWriterDocument } from "../../core/doc/doc";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "../wrtsh/wrtsh";
import { SwEditWin } from "./edtwin";

/** Creates one edit window over a canonical Writer shell. @returns Edit-window fixture. */
function createEditWindow(): Readonly<{
  editWindow: SwEditWin;
  invalidate: ReturnType<typeof vi.fn>;
  shell: SwWrtShell;
}> {
  const document = createWriterDocument();
  const shell = new SwWrtShell(
    new SwDocShell(
      document,
      createDocument({ id: "edtwin", suiteId: "writer", title: "Edit window" }),
    ),
  );
  const invalidate = vi.fn();
  return { editWindow: new SwEditWin(shell, invalidate), invalidate, shell };
}

describe("SwEditWin", /** Registers platform-neutral edit-window tests. @returns Nothing. */ () => {
  it("owns SwNodes coordinate conversion and Writer operations without DOM or React", /** Verifies cursor, text, formatting, list, history, composition, and transfer operations. @returns Nothing. */ () => {
    const { editWindow, invalidate, shell } = createEditWindow();
    const nodeIndex = shell.GetActiveParagraph().GetIndex();
    expect(editWindow.SetSelection({ point: { contentIndex: 0, nodeIndex: 0.5 } })).toBe(false);
    expect(editWindow.SetSelection({ point: { contentIndex: 0, nodeIndex: 0 } })).toBe(false);
    expect(editWindow.SetSelection({ point: { contentIndex: 0, nodeIndex: -1 } })).toBe(false);
    expect(
      editWindow.SetSelection({
        mark: { contentIndex: 1, nodeIndex },
        point: { contentIndex: 0, nodeIndex },
      }),
    ).toBe(false);
    expect(editWindow.FocusNode(-1)).toBe(false);
    expect(editWindow.SetSelection({ point: { contentIndex: 0, nodeIndex } })).toBe(true);
    expect(editWindow.InsertText("Body")).toBe(true);
    expect(editWindow.Paste({ isBlock: false, paragraphs: [] })).toBe(false);
    expect(
      editWindow.SetSelection({
        mark: { contentIndex: 0, nodeIndex },
        point: { contentIndex: 4, nodeIndex },
      }),
    ).toBe(true);
    expect(editWindow.ToggleCharacterFormat("bold")).toBe(true);
    expect(editWindow.CreateSelectionTransfer()?.plainText).toBe("Body");
    expect(editWindow.SetSelection({ point: { contentIndex: 4, nodeIndex } })).toBe(true);
    expect(editWindow.SetParagraphListKind("numbered")).toBe(true);
    expect(editWindow.SplitNode()).toBe(true);
    expect(editWindow.FocusNode(nodeIndex)).toBe(true);
    editWindow.SelectAll();
    expect(editWindow.CreateSelectionTransfer()?.plainText).toContain("Body");
    expect(editWindow.DeleteSelection()).toBe(true);
    expect(editWindow.Undo()).toBe(true);
    expect(editWindow.Redo()).toBe(true);
    editWindow.StartExtTextInput();
    editWindow.UpdateExtTextInput("IME");
    expect(editWindow.EndExtTextInput()).toBe(true);
    expect(invalidate).toHaveBeenCalled();
    const detached = new SwEditWin(shell);
    detached.SelectAll();
    expect(detached.InsertText("")).toBe(false);
  });
});
