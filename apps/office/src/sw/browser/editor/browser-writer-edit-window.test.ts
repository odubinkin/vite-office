/** @fileoverview Verifies the single browser edit-window maps native intents to SwEditWin. */

import { describe, expect, it, vi } from "vitest";

import type { SwEditWin } from "../../source/uibase/docvw/edtwin";
import { BrowserWriterEditWindow } from "./browser-writer-edit-window";

/** Creates a spy-backed DOM-neutral edit-window fixture. @returns Complete SwEditWin test double. */
function createEditWindow(): SwEditWin {
  return {
    CreateSelectionTransfer: vi.fn(),
    DeleteLeft: vi.fn(),
    DeleteRight: vi.fn(),
    DeleteSelection: vi.fn(),
    EndExtTextInput: vi.fn(),
    FocusNode: vi.fn(),
    InsertText: vi.fn(),
    Paste: vi.fn(),
    PasteTransfer: vi.fn(),
    Redo: vi.fn(),
    ReplaceSelection: vi.fn(),
    SelectAll: vi.fn(),
    SetParagraphListKind: vi.fn(),
    SetSelection: vi.fn(/** Accepts fixture SwNodes coordinates. @returns True. */ () => true),
    SplitNode: vi.fn(),
    StartExtTextInput: vi.fn(),
    ToggleCharacterFormat: vi.fn(),
    Undo: vi.fn(),
    UpdateExtTextInput: vi.fn(),
  } as unknown as SwEditWin;
}

/** Places a collapsed native selection in one paragraph. @param paragraph - Target paragraph. @param offset - Text offset. @returns Nothing. */
function placeCaret(paragraph: HTMLParagraphElement, offset: number): void {
  const range = document.createRange();
  range.setStart(paragraph.firstChild as Text, offset);
  range.collapse(true);
  const selection = globalThis.getSelection() as Selection;
  selection.removeAllRanges();
  selection.addRange(range);
}

describe("BrowserWriterEditWindow", /** Groups native event mapping tests. @returns Nothing. */ () => {
  it("routes the complete supported beforeinput vocabulary through one SwNodes selection", /** Verifies every native input disposition independently of React. @returns Nothing. */ () => {
    document.body.innerHTML =
      '<article data-writer-editing-host="true"><p data-writer-paragraph-id="p-1" data-writer-node-index="1">abc</p><p data-writer-paragraph-id="outside">x</p></article>';
    const root = document.querySelector("article") as HTMLElement;
    const paragraph = document.querySelector(
      '[data-writer-paragraph-id="p-1"]',
    ) as HTMLParagraphElement;
    const outside = document.querySelector(
      '[data-writer-paragraph-id="outside"]',
    ) as HTMLParagraphElement;
    const editWindow = createEditWindow();
    const controller = new BrowserWriterEditWindow(
      editWindow,
      {
        document,
        getSelection: /** Reads the fixture native selection. @returns Current selection. */ () =>
          globalThis.getSelection(),
      },
      /** Resolves the one mounted fixture paragraph. @returns Fixture paragraph. */ () =>
        paragraph,
    );
    const unsubscribe = controller.Subscribe(root);
    placeCaret(paragraph, 1);

    const dispatch =
      /** Dispatches one native beforeinput intent. @param inputType - Native intent. @param data - Optional input text. @returns Dispatched event. */ (
        inputType: string,
        data: string | null = null,
      ): InputEvent => {
        const event = new InputEvent("beforeinput", {
          bubbles: true,
          cancelable: true,
          data,
          inputType,
        });
        root.dispatchEvent(event);
        return event;
      };

    dispatch("insertText", "x");
    dispatch("insertText", "");
    dispatch("insertReplacementText", "y");
    dispatch("insertReplacementText");
    for (const inputType of [
      "insertLineBreak",
      "insertParagraph",
      "deleteContentBackward",
      "deleteContentForward",
      "deleteByCut",
      "deleteByDrag",
      "deleteContent",
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
    ])
      expect(dispatch(inputType).defaultPrevented).toBe(true);
    expect(dispatch("insertCompositionText", "i").defaultPrevented).toBe(false);
    expect(dispatch("deleteCompositionText").defaultPrevented).toBe(false);
    expect(dispatch("insertTranspose").defaultPrevented).toBe(true);

    expect(editWindow.InsertText).toHaveBeenCalledWith("x");
    expect(editWindow.ReplaceSelection).toHaveBeenCalledWith("y");
    expect(editWindow.SplitNode).toHaveBeenCalledTimes(2);
    expect(editWindow.DeleteSelection).toHaveBeenCalledTimes(3);
    expect(editWindow.ToggleCharacterFormat).toHaveBeenCalledWith("italic");
    expect(editWindow.ToggleCharacterFormat).toHaveBeenCalledWith("underline");
    expect(editWindow.SetParagraphListKind).toHaveBeenCalledWith("numbered");
    expect(editWindow.SetParagraphListKind).toHaveBeenCalledWith("bullet");
    expect(editWindow.Undo).toHaveBeenCalledOnce();
    expect(editWindow.Redo).toHaveBeenCalledOnce();

    const dataTransfer = {
      getData: vi.fn(/** Returns no transferable content. @returns Empty MIME value. */ () => ""),
      setData: vi.fn(),
    } as unknown as DataTransfer;
    const transferEvent = {
      clientX: 0,
      clientY: 0,
      clipboardData: dataTransfer,
      dataTransfer,
      preventDefault: vi.fn(),
    };
    controller.HandleCopy(transferEvent as unknown as Parameters<typeof controller.HandleCopy>[0]);
    controller.HandleDragStart(
      transferEvent as unknown as Parameters<typeof controller.HandleDragStart>[0],
    );

    placeCaret(outside, 0);
    controller.HandleDragStart(
      transferEvent as unknown as Parameters<typeof controller.HandleDragStart>[0],
    );
    controller.HandleDrop(transferEvent as unknown as Parameters<typeof controller.HandleDrop>[0]);
    expect(dispatch("insertText", "blocked").defaultPrevented).toBe(true);
    expect(editWindow.InsertText).not.toHaveBeenCalledWith("blocked");
    placeCaret(paragraph, 1);
    controller.HandleDrop(transferEvent as unknown as Parameters<typeof controller.HandleDrop>[0]);
    expect(transferEvent.preventDefault).toHaveBeenCalledOnce();
    unsubscribe();
    dispatch("insertText", "detached");
    expect(editWindow.InsertText).not.toHaveBeenCalledWith("detached");
  });
});
