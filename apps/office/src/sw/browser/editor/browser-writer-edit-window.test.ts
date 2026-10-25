/** @fileoverview Verifies that editing clicks do not navigate semantic links. */

import type React from "react";
import { describe, expect, it, vi } from "vitest";

import type { SwEditWin } from "../../source/uibase/docvw/edtwin";
import { WriterTransferError } from "../../source/uibase/dochdl/swdtflvr";
import { createWriterDocumentSession } from "../composition/writer-module";
import { BrowserWriterEditWindow } from "./browser-writer-edit-window";

describe("browser Writer edit window links", /** Groups browser Writer edit window links. @returns Test callback result. */ () => {
  it("prevents link navigation while leaving ordinary paragraph clicks alone", /** Checks prevents link navigation while leaving ordinary paragraph clicks alone. @returns Test callback result. */ () => {
    const adapter = new BrowserWriterEditWindow(
      {} as SwEditWin,
      {
        document,
        getSelection: /** Runs the test callback. @returns Test callback result. */ () =>
          window.getSelection(),
      },
      /** Runs the test callback. @returns Test callback result. */ () => undefined,
    );
    const link = document.createElement("a");
    link.dataset.writerHyperlink = "https://example.com";
    const text = document.createElement("span");
    link.append(text);
    const preventDefault = vi.fn();
    adapter.HandleClick({
      target: text,
      preventDefault,
    } as unknown as React.MouseEvent<HTMLElement>);
    expect(preventDefault).toHaveBeenCalledOnce();
    adapter.HandleClick({
      target: document.createElement("p"),
      preventDefault,
    } as unknown as React.MouseEvent<HTMLElement>);
    expect(preventDefault).toHaveBeenCalledOnce();
  });

  it("routes native editing intents to the platform-neutral edit window", /** Checks routes native editing intents to the platform-neutral edit window. @returns Test callback result. */ () => {
    const editWindow = {
      InsertText: vi.fn(),
      ReplaceSelection: vi.fn(),
      InsertParagraph: vi.fn(),
      SplitNode: vi.fn(),
      DeleteLeft: vi.fn(),
      DeleteRight: vi.fn(),
      DeleteSelection: vi.fn(),
      ToggleCharacterFormat: vi.fn(),
      SetParagraphListKind: vi.fn(),
      Undo: vi.fn(),
      Redo: vi.fn(),
    };
    const adapter = new BrowserWriterEditWindow(
      editWindow as unknown as SwEditWin,
      {
        document,
        getSelection: /** Runs the test callback. @returns Test callback result. */ () =>
          window.getSelection(),
      },
      /** Runs the test callback. @returns Test callback result. */ () => undefined,
    );
    vi.spyOn(
      adapter as unknown as { SynchronizeSelection: () => boolean },
      "SynchronizeSelection",
    ).mockReturnValue(true);
    const boundary = adapter as unknown as { HandleBeforeInput: (event: InputEvent) => void };
    for (const inputType of [
      "insertText",
      "insertReplacementText",
      "insertParagraph",
      "insertLineBreak",
      "deleteContentBackward",
      "deleteContentForward",
      "deleteByCut",
      "formatBold",
      "formatItalic",
      "formatUnderline",
      "insertOrderedList",
      "insertUnorderedList",
      "historyUndo",
      "historyRedo",
      "insertFromComposition",
      "insertFromDrop",
      "insertFromPaste",
      "unrecognizedInput",
    ]) {
      const event = new InputEvent("beforeinput", {
        cancelable: true,
        data: "x",
        inputType,
      });
      boundary.HandleBeforeInput(event);
      expect(event.defaultPrevented).toBe(true);
    }
    for (const inputType of ["insertText", "insertReplacementText"]) {
      const empty = new InputEvent("beforeinput", { cancelable: true, inputType });
      boundary.HandleBeforeInput(empty);
      expect(empty.defaultPrevented).toBe(true);
    }
    const cell = document.createElement("div");
    cell.dataset.writerTableCell = "0:0";
    cell.addEventListener("beforeinput", boundary.HandleBeforeInput.bind(adapter));
    const cellInput = new InputEvent("beforeinput", {
      cancelable: true,
      data: "cell",
      inputType: "insertText",
    });
    cell.dispatchEvent(cellInput);
    expect(cellInput.defaultPrevented).toBe(true);
    expect(editWindow.InsertText).toHaveBeenCalledWith("x");
    expect(editWindow.InsertText).toHaveBeenCalledWith("cell");
    expect(editWindow.ReplaceSelection).toHaveBeenCalledWith("x");
    expect(editWindow.InsertParagraph).toHaveBeenCalledOnce();
    expect(editWindow.SplitNode).toHaveBeenCalledOnce();
    expect(editWindow.DeleteSelection).toHaveBeenCalledOnce();
    expect(editWindow.ToggleCharacterFormat).toHaveBeenCalledTimes(3);
    expect(editWindow.SetParagraphListKind).toHaveBeenCalledTimes(2);
    expect(editWindow.Undo).toHaveBeenCalledOnce();
    expect(editWindow.Redo).toHaveBeenCalledOnce();
  });

  it("rejects stale DOM positions and empty browser transfers", /** Checks rejects stale DOM positions and empty browser transfers. @returns Test callback result. */ () => {
    const editWindow = {
      SetSelection: vi.fn(/** Runs the test callback. @returns Test callback result. */ () => true),
      CopyTransfer: vi.fn(),
      CreateSelectionTransfer: vi.fn(
        /** Runs the test callback. @returns Test callback result. */ () => undefined,
      ),
    };
    const adapter = new BrowserWriterEditWindow(
      editWindow as unknown as SwEditWin,
      {
        document,
        getSelection: /** Runs the test callback. @returns Test callback result. */ () =>
          window.getSelection(),
      },
      /** Runs the test callback. @returns Test callback result. */ () => undefined,
    );
    const boundary = adapter as unknown as {
      ApplySelection: (selection: {
        point: { paragraphId: string; offset: number; nodeIndex?: number };
        mark?: { paragraphId: string; offset: number; nodeIndex?: number };
      }) => boolean;
      WriteTransfer: (event: React.ClipboardEvent<HTMLElement>, cut: boolean) => void;
    };
    expect(boundary.ApplySelection({ point: { paragraphId: "missing", offset: 0 } })).toBe(false);
    expect(
      boundary.ApplySelection({
        point: { paragraphId: "p", offset: 0, nodeIndex: 1 },
        mark: { paragraphId: "missing", offset: 0 },
      }),
    ).toBe(false);
    expect(boundary.ApplySelection({ point: { paragraphId: "p", offset: 0, nodeIndex: 1 } })).toBe(
      true,
    );
    expect(editWindow.SetSelection).toHaveBeenCalledWith({
      point: { contentIndex: 0, nodeIndex: 1 },
    });
    const synchronize = vi
      .spyOn(adapter as unknown as { SynchronizeSelection: () => boolean }, "SynchronizeSelection")
      .mockReturnValue(true);
    const copyEvent = { preventDefault: vi.fn(), clipboardData: { setData: vi.fn() } };
    boundary.WriteTransfer(copyEvent as unknown as React.ClipboardEvent<HTMLElement>, false);
    expect(copyEvent.preventDefault).toHaveBeenCalledOnce();
    expect(editWindow.CopyTransfer).toHaveBeenCalledOnce();
    synchronize.mockReturnValue(false);
    const foreignCopy = { preventDefault: vi.fn(), clipboardData: { setData: vi.fn() } };
    boundary.WriteTransfer(foreignCopy as unknown as React.ClipboardEvent<HTMLElement>, false);
    boundary.WriteTransfer(foreignCopy as unknown as React.ClipboardEvent<HTMLElement>, true);
    expect(foreignCopy.preventDefault).not.toHaveBeenCalled();
    expect(editWindow.CopyTransfer).toHaveBeenCalledOnce();
    synchronize.mockReturnValue(true);
    editWindow.CopyTransfer.mockImplementationOnce(
      /** Represents a failed native clipboard writer. @returns Nothing. */ () => {
        throw new Error("native write failed");
      },
    );
    expect(
      /** Runs the failed native write. @returns Nothing. */ () =>
        boundary.WriteTransfer(copyEvent as unknown as React.ClipboardEvent<HTMLElement>, false),
    ).toThrow("native write failed");
    editWindow.CopyTransfer.mockImplementationOnce(
      /** Represents an empty Writer selection. @returns Nothing. */ () => {
        throw new WriterTransferError();
      },
    );
    expect(
      /** Runs a native Copy with no transferable selection. @returns Nothing. */ () =>
        boundary.WriteTransfer(copyEvent as unknown as React.ClipboardEvent<HTMLElement>, false),
    ).not.toThrow();
    const drag = {
      dataTransfer: {
        getData: /** Runs the test callback. @returns Test callback result. */ () => "",
      },
      clientX: 0,
      clientY: 0,
      preventDefault: vi.fn(),
    } as unknown as React.DragEvent<HTMLElement>;
    adapter.HandleDragStart(drag);
    adapter.HandleDrop(drag);
    expect(drag.preventDefault).toHaveBeenCalledOnce();
    const paste = {
      clipboardData: {
        getData: /** Runs the test callback. @returns Test callback result. */ () => "",
      },
      preventDefault: vi.fn(),
    } as unknown as React.ClipboardEvent<HTMLElement>;
    adapter.HandlePaste(paste);
    expect(paste.preventDefault).toHaveBeenCalledOnce();
    synchronize.mockReturnValue(false);
    adapter.HandleDragStart(drag);
    adapter.HandleDrop(drag);
    expect(drag.preventDefault).toHaveBeenCalledOnce();
  });

  it("writes HTML before plain text for Writer copy and drag", /** Checks upstream rich-before-string format order at the browser port. @returns Nothing. */ () => {
    const payload = { html: "<p>Writer</p>", plainText: "Writer" };
    const editWindow = {
      CopyTransfer: vi.fn(
        /** Writes the selected Writer payload. @param write - Browser clipboard writer. @returns Nothing. */ (
          write: (selection: typeof payload) => void,
        ): void => write(payload),
      ),
      CreateSelectionTransfer: vi.fn(
        /** Supplies the drag payload. @returns Writer selection. */ () => payload,
      ),
    };
    const adapter = new BrowserWriterEditWindow(
      editWindow as unknown as SwEditWin,
      {
        document,
        getSelection: /** Reads the active DOM selection. @returns Browser selection. */ () =>
          window.getSelection(),
      },
      /** Resolves no mounted paragraph for this transfer test. @returns No paragraph. */ () =>
        undefined,
    );
    vi.spyOn(
      adapter as unknown as { SynchronizeSelection: () => boolean },
      "SynchronizeSelection",
    ).mockReturnValue(true);
    const setData = vi.fn();
    adapter.HandleCopy({
      preventDefault: vi.fn(),
      clipboardData: { setData },
    } as unknown as React.ClipboardEvent<HTMLElement>);
    expect(setData.mock.calls).toEqual([
      ["text/html", payload.html],
      ["text/plain", payload.plainText],
    ]);
    setData.mockClear();
    adapter.HandleDragStart({
      dataTransfer: { setData },
    } as unknown as React.DragEvent<HTMLElement>);
    expect(setData.mock.calls).toEqual([
      ["text/html", payload.html],
      ["text/plain", payload.plainText],
    ]);
  });
});

it("preserves the native point during projection-driven paragraph focus and restores ordinary focus admission afterward", /** Uses an actual edit shell and native DOM focus instead of mocking its model operation. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell();
  shell.Insert("Retained caret");
  const node = shell.GetActiveParagraph(),
    root = document.createElement("div"),
    paragraph = document.createElement("p"),
    input = document.createElement("input");
  root.dataset.writerEditingHost = "true";
  root.contentEditable = "true";
  paragraph.dataset.writerParagraphId = "retained";
  paragraph.dataset.writerNodeIndex = String(node.GetIndex());
  paragraph.tabIndex = -1;
  paragraph.textContent = node.GetText();
  root.append(paragraph);
  document.body.append(root, input);
  const adapter = new BrowserWriterEditWindow(
    session.view.GetEditWin(),
    {
      document,
      getSelection:
        /** Reads the actual DOM selection. @returns Native selection. */
        () => window.getSelection(),
    },
    /** Resolves the mounted native node projection. @returns Original paragraph. */
    () => paragraph,
  );
  paragraph.addEventListener(
    "focus",
    /** Delivers synchronous DOM focus reentrancy exactly as the mounted React host does. @param event - Native focus. @returns Nothing. */
    (event) => adapter.HandleFocus(event as unknown as React.FocusEvent<HTMLElement>),
  );
  const unsubscribe = adapter.Subscribe(root);
  try {
    input.focus();
    const stale = document.createRange();
    stale.setStart(paragraph.firstChild as Node, 0);
    stale.collapse(true);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(stale);
    document.dispatchEvent(new Event("selectionchange"));
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(node.Len());
    window.getSelection()?.removeAllRanges();
    expect(
      adapter.RestoreSelection({
        point: { paragraphId: "retained", nodeIndex: node.GetIndex(), offset: node.Len() },
      }),
    ).toBe(true);
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(node.Len());
    input.focus();
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(stale);
    paragraph.focus();
    document.dispatchEvent(new Event("selectionchange"));
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(0);
  } finally {
    unsubscribe();
    window.getSelection()?.removeAllRanges();
    root.remove();
    input.remove();
    session.Close();
  }
});

it("keeps the browser-created moving caret and reversed range when Chromium focuses the owning host", /** Host focus is part of native selection creation;it must not restore an older shell cursor before selectionchange. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell(),
    node = shell.GetActiveParagraph();
  shell.Insert("abcdefgh");
  const root = document.createElement("article"),
    paragraph = document.createElement("p");
  paragraph.dataset.writerParagraphId = "focus-original";
  paragraph.dataset.writerNodeIndex = String(node.GetIndex());
  paragraph.textContent = "abcdefgh";
  root.append(paragraph);
  document.body.append(root);
  const adapter = new BrowserWriterEditWindow(
    session.view.GetEditWin(),
    {
      document,
      getSelection: /** Uses the actual host Selection. @returns Browser selection. */ () =>
        window.getSelection(),
    },
    /** Resolves the real mounted paragraph. @returns Paragraph. */ () => paragraph,
  );
  const retained = {
    point: { paragraphId: "focus-original", nodeIndex: node.GetIndex(), offset: 8 },
  };
  const text = paragraph.firstChild;
  if (text === null) throw new Error("Focus fixture text is missing.");
  try {
    window.getSelection()?.setBaseAndExtent(text, 3, text, 3);
    adapter.HandleFocus(
      {
        target: root,
        currentTarget: root,
        relatedTarget: paragraph,
      } as unknown as React.FocusEvent<HTMLElement>,
      retained,
    );
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(3);
    window.getSelection()?.setBaseAndExtent(text, 6, text, 2);
    adapter.HandleFocus(
      {
        target: root,
        currentTarget: root,
        relatedTarget: paragraph,
      } as unknown as React.FocusEvent<HTMLElement>,
      retained,
    );
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(2);
    expect(shell.GetCursor().GetMark().GetContentIndex()).toBe(6);
    window.getSelection()?.removeAllRanges();
    const current = {
      point: { ...retained.point, offset: 2 },
      mark: { ...retained.point, offset: 6 },
    };
    adapter.HandleFocus(
      {
        target: root,
        currentTarget: root,
        relatedTarget: null,
      } as unknown as React.FocusEvent<HTMLElement>,
      current,
    );
    expect(window.getSelection()?.focusOffset).toBe(2);
    const input = document.createElement("input");
    document.body.append(input);
    input.focus();
    window.getSelection()?.setBaseAndExtent(text, 0, text, 0);
    adapter.HandleFocus(
      {
        target: root,
        currentTarget: root,
        relatedTarget: input,
      } as unknown as React.FocusEvent<HTMLElement>,
      current,
    );
    expect(window.getSelection()?.focusOffset).toBe(2);
    input.remove();
    // Synthetic boundary only: a connected foreground editing host cannot receive focus with no active document element.
    const active = vi.spyOn(document, "activeElement", "get").mockReturnValue(null);
    try {
      window.getSelection()?.setBaseAndExtent(text, 1, text, 1);
      adapter.HandleFocus(
        {
          target: root,
          currentTarget: root,
          relatedTarget: null,
        } as unknown as React.FocusEvent<HTMLElement>,
        current,
      );
      expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(1);
    } finally {
      active.mockRestore();
    }
    window.getSelection()?.removeAllRanges();
    adapter.HandleFocus({
      target: root,
      currentTarget: root,
      relatedTarget: null,
    } as unknown as React.FocusEvent<HTMLElement>);
    expect(window.getSelection()?.rangeCount).toBe(0);
    const decoration = document.createElement("button");
    decoration.contentEditable = "false";
    root.append(decoration);
    const point = shell.CaptureCursorState().point;
    adapter.HandleFocus({
      target: decoration,
      currentTarget: root,
      relatedTarget: null,
    } as unknown as React.FocusEvent<HTMLElement>);
    expect(shell.CaptureCursorState().point).toEqual(point);
  } finally {
    window.getSelection()?.removeAllRanges();
    root.remove();
    session.Close();
  }
});
