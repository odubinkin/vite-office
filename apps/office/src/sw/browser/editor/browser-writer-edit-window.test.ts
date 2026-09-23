/** @fileoverview Verifies that editing clicks do not navigate semantic links. */

import type React from "react";
import { describe, expect, it, vi } from "vitest";

import type { SwEditWin } from "../../source/uibase/docvw/edtwin";
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
    expect(editWindow.InsertText).toHaveBeenCalledWith("x");
    expect(editWindow.ReplaceSelection).toHaveBeenCalledWith("x");
    expect(editWindow.SplitNode).toHaveBeenCalledTimes(2);
    expect(editWindow.DeleteSelection).toHaveBeenCalledOnce();
    expect(editWindow.ToggleCharacterFormat).toHaveBeenCalledTimes(3);
    expect(editWindow.SetParagraphListKind).toHaveBeenCalledTimes(2);
    expect(editWindow.Undo).toHaveBeenCalledOnce();
    expect(editWindow.Redo).toHaveBeenCalledOnce();
  });

  it("rejects stale DOM positions and empty browser transfers", /** Checks rejects stale DOM positions and empty browser transfers. @returns Test callback result. */ () => {
    const editWindow = {
      SetSelection: vi.fn(/** Runs the test callback. @returns Test callback result. */ () => true),
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
      WriteTransfer: (event: React.ClipboardEvent<HTMLElement>) => boolean;
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
    expect(
      boundary.WriteTransfer({
        preventDefault: vi.fn(),
      } as unknown as React.ClipboardEvent<HTMLElement>),
    ).toBe(false);
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
});
