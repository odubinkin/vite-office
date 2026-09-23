/** @fileoverview Implements the single browser/DOM adapter for Writer's platform-neutral SwEditWin. */

import type React from "react";

import type { SwEditWin, SwEditWindowSelection } from "../../source/uibase/docvw/edtwin";
import {
  createBrowserWriterPaste,
  readBrowserWriterClipboardPaste,
} from "./writer-clipboard-events";
import { BrowserWriterPointerSelectionController } from "./writer-geometry";
import { BrowserWriterSelectionMapper } from "./writer-selection";
import type { WriterCursorSelection } from "./writer-selection-types";

/** Mounted paragraph lookup retained by the browser edit window. */
export type BrowserWriterParagraphResolver = (
  paragraphId: string,
  offset?: number,
) => HTMLParagraphElement | undefined;

/** Browser surfaces injected for deterministic edit-window tests. */
export interface BrowserWriterEditWindowEnvironment {
  readonly document: Document;
  readonly getSelection: () => Selection | null;
}

/**
 * Owns DOM selection, Input Events, composition, pointer geometry, transfer, and focus translation.
 *
 * The class is the only browser layer allowed to translate DOM coordinates into SwNodes positions;
 * all document operations are forwarded to the DOM-neutral SwEditWin.
 */
export class BrowserWriterEditWindow {
  private readonly selectionMapper: BrowserWriterSelectionMapper;
  private readonly pointerSelection: BrowserWriterPointerSelectionController;
  private suppressNextCommittedInput = false;

  /** Creates a browser edit window. @param editWindow - Writer-owned operation boundary. @param environment - Browser selection surface. @param resolveParagraph - Mounted projection lookup. @returns Nothing. */
  public constructor(
    private readonly editWindow: SwEditWin,
    private readonly environment: BrowserWriterEditWindowEnvironment,
    resolveParagraph: BrowserWriterParagraphResolver,
  ) {
    this.selectionMapper = new BrowserWriterSelectionMapper(environment, resolveParagraph);
    /* c8 ignore start -- JSDOM lacks caretRangeFromPoint; geometry has isolated coverage. */
    const caretRangeFromPoint = environment.document.caretRangeFromPoint?.bind(
      environment.document,
    );
    this.pointerSelection = new BrowserWriterPointerSelectionController(
      caretRangeFromPoint === undefined ? {} : { caretRangeFromPoint },
      this.selectionMapper.SetBaseAndExtent.bind(this.selectionMapper),
    );
    /* c8 ignore stop */
  }

  /** Installs native event subscriptions not represented faithfully by React synthetic events. @param root - Editing host. @returns Cleanup callback. */
  public Subscribe(root: HTMLElement): () => void {
    const handleBeforeInput =
      /** Routes one cancelable pre-mutation input event. @param event - Native input event. @returns Nothing. */ (
        event: Event,
      ): void => this.HandleBeforeInput(event as InputEvent);
    root.addEventListener("beforeinput", handleBeforeInput);
    const unsubscribeSelection = this.selectionMapper.Subscribe(
      /** Publishes one native selection to SwEditWin. @param selection - DOM selection projection. @returns Nothing. */ (
        selection,
      ) => void this.ApplySelection(selection),
    );
    return /** Removes native edit-window subscriptions. @returns Nothing. */ () => {
      root.removeEventListener("beforeinput", handleBeforeInput);
      unsubscribeSelection();
    };
  }

  /** Restores shell-owned cursor state into the DOM projection. @param selection - Current cursor projection. @returns Whether restoration succeeded. */
  public RestoreSelection(selection: WriterCursorSelection): boolean {
    return this.selectionMapper.Restore(selection);
  }

  public readonly HandleFocus =
    /** Handles root focus by resolving the current SwNodes coordinate. @param event - React focus event. @returns Nothing. */ (
      event: React.FocusEvent<HTMLElement>,
    ): void => {
      const paragraph = (event.target as HTMLElement).closest<HTMLParagraphElement>(
        "[data-writer-node-index]",
      );
      if (paragraph !== null) this.editWindow.FocusNode(Number(paragraph.dataset.writerNodeIndex));
    };

  public readonly HandleKeyDown =
    /** Handles Select All and leaves other keyboard commands to Sfx accelerators. @param event - React keyboard event. @returns Nothing. */ (
      event: React.KeyboardEvent<HTMLElement>,
    ): void => {
      if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        this.editWindow.SelectAll();
      }
    };

  public readonly HandleCompositionStart =
    /** Starts extended-text input at the synchronized Writer selection. @returns Nothing. */ (): void => {
      this.SynchronizeSelection();
      this.suppressNextCommittedInput = false;
      this.editWindow.StartExtTextInput();
    };

  public readonly HandleCompositionUpdate =
    /** Updates transient extended text. @param event - React composition event. @returns Nothing. */ (
      event: React.CompositionEvent<HTMLElement>,
    ): void => this.editWindow.UpdateExtTextInput(event.data);

  public readonly HandleCompositionEnd =
    /** Commits one extended-text-input action. @param event - React composition event. @returns Nothing. */ (
      event: React.CompositionEvent<HTMLElement>,
    ): void => {
      this.suppressNextCommittedInput = true;
      this.editWindow.UpdateExtTextInput(event.data);
      this.editWindow.EndExtTextInput();
    };

  public readonly HandleCopy =
    /** Replaces native copy serialization with the Writer transfer. @param event - React clipboard event. @returns Nothing. */ (
      event: React.ClipboardEvent<HTMLElement>,
    ): void => {
      this.WriteTransfer(event);
    };

  public readonly HandleCut =
    /** Writes and deletes the current Writer selection. @param event - React clipboard event. @returns Nothing. */ (
      event: React.ClipboardEvent<HTMLElement>,
    ): void => {
      if (this.WriteTransfer(event)) this.editWindow.DeleteSelection();
    };

  public readonly HandlePaste =
    /** Inserts a sanitized native paste at the canonical Writer PaM. @param event - React clipboard event. @returns Nothing. */ (
      event: React.ClipboardEvent<HTMLElement>,
    ): void => {
      if (!this.SynchronizeSelection()) return;
      const paste = readBrowserWriterClipboardPaste(event.clipboardData, this.environment.document);
      event.preventDefault();
      if (paste !== undefined)
        this.editWindow.PasteTransfer(
          /** Converts the browser record through the target item pool. @param paragraph - Active Writer paragraph. @returns Native paste document. */ (
            paragraph,
          ) => createBrowserWriterPaste(paragraph, paste),
        );
    };

  public readonly HandleDragStart =
    /** Writes the current Writer transfer into a native drag operation. @param event - React drag event. @returns Nothing. */ (
      event: React.DragEvent<HTMLElement>,
    ): void => {
      if (!this.SynchronizeSelection()) return;
      const payload = this.editWindow.CreateSelectionTransfer();
      if (payload !== undefined) this.SetTransferData(event.dataTransfer, payload);
    };

  public readonly HandleDragOver =
    /** Allows the native drop event to reach the Writer adapter. @param event - React drag event. @returns Nothing. */ (
      event: React.DragEvent<HTMLElement>,
    ): void => event.preventDefault();

  public readonly HandleDrop =
    /** Places the Writer cursor and inserts sanitized drop data. @param event - React drag event. @returns Nothing. */ (
      event: React.DragEvent<HTMLElement>,
    ): void => {
      this.pointerSelection.Place(event.clientX, event.clientY);
      if (!this.SynchronizeSelection()) return;
      const paste = readBrowserWriterClipboardPaste(event.dataTransfer, this.environment.document);
      event.preventDefault();
      if (paste !== undefined)
        this.editWindow.PasteTransfer(
          /** Converts the browser record through the target item pool. @param paragraph - Active Writer paragraph. @returns Native paste document. */ (
            paragraph,
          ) => createBrowserWriterPaste(paragraph, paste),
        );
    };

  public readonly HandleClick =
    /** Prevents activation of semantic hyperlinks inside the editable surface. @param event - React click event. @returns Nothing. */ (
      event: React.MouseEvent<HTMLElement>,
    ): void => {
      if ((event.target as HTMLElement).closest("a[data-writer-hyperlink]") !== null)
        event.preventDefault();
    };

  /* c8 ignore start -- Pointer geometry is covered by its isolated adapter and Chromium E2E. */
  public readonly HandlePointerDown =
    /** Starts pointer selection stabilization. @param event - React mouse event. @returns Nothing. */ (
      event: React.MouseEvent<HTMLElement>,
    ): void => {
      if (this.pointerSelection.Start(event.button, event.clientX, event.clientY))
        this.SynchronizeSelection();
    };

  public readonly HandlePointerMove =
    /** Extends pointer selection stabilization. @param event - React mouse event. @returns Nothing. */ (
      event: React.MouseEvent<HTMLElement>,
    ): void => {
      if (this.pointerSelection.Move(event.clientX, event.clientY)) event.preventDefault();
    };

  public readonly HandlePointerUp =
    /** Completes pointer selection stabilization. @param event - React mouse event. @returns Nothing. */ (
      event: React.MouseEvent<HTMLElement>,
    ): void => {
      if (this.pointerSelection.End()) event.preventDefault();
    };
  /* c8 ignore stop */

  /** Routes one native input intent before browser DOM mutation. @param input - Native input event. @returns Nothing. */
  private HandleBeforeInput(input: InputEvent): void {
    if (input.inputType === "insertFromComposition" && this.suppressNextCommittedInput) {
      this.suppressNextCommittedInput = false;
      input.preventDefault();
      return;
    }
    if (input.inputType === "insertCompositionText" || input.inputType === "deleteCompositionText")
      return;
    if (!this.SynchronizeSelection()) {
      input.preventDefault();
      return;
    }
    const text = input.data;
    switch (input.inputType) {
      case "insertText":
        if (text !== null && text.length > 0) this.editWindow.InsertText(text);
        break;
      case "insertReplacementText":
        if (text !== null && text.length > 0) this.editWindow.ReplaceSelection(text);
        break;
      case "insertLineBreak":
      case "insertParagraph":
        this.editWindow.SplitNode();
        break;
      case "deleteContentBackward":
        this.editWindow.DeleteLeft();
        break;
      case "deleteContentForward":
        this.editWindow.DeleteRight();
        break;
      case "deleteByCut":
      case "deleteByDrag":
      case "deleteContent":
        this.editWindow.DeleteSelection();
        break;
      case "formatBold":
        this.editWindow.ToggleCharacterFormat("bold");
        break;
      case "formatItalic":
        this.editWindow.ToggleCharacterFormat("italic");
        break;
      case "formatUnderline":
        this.editWindow.ToggleCharacterFormat("underline");
        break;
      case "insertOrderedList":
        this.editWindow.SetParagraphListKind("numbered");
        break;
      case "insertUnorderedList":
        this.editWindow.SetParagraphListKind("bullet");
        break;
      case "historyUndo":
        this.editWindow.Undo();
        break;
      case "historyRedo":
        this.editWindow.Redo();
        break;
      case "insertFromComposition":
      case "insertFromDrop":
      case "insertFromPaste":
        break;
      default:
        input.preventDefault();
        return;
    }
    input.preventDefault();
  }

  /** Synchronizes the current DOM selection through SwNodes coordinates. @returns Whether the selection belongs to Writer. */
  private SynchronizeSelection(): boolean {
    const selection = this.selectionMapper.Read();
    return selection !== undefined && this.ApplySelection(selection);
  }

  /** Converts one DOM projection into the edit-window contract. @param selection - Browser selection. @returns Whether every endpoint was current. */
  private ApplySelection(selection: WriterCursorSelection): boolean {
    const point = this.ToEditPosition(selection.point);
    const mark = selection.mark === undefined ? undefined : this.ToEditPosition(selection.mark);
    if (point === undefined || (selection.mark !== undefined && mark === undefined)) return false;
    return this.editWindow.SetSelection({ ...(mark === undefined ? {} : { mark }), point });
  }

  /** Converts one DOM endpoint to current SwNodes coordinates. @param position - Browser endpoint. @returns Edit-window endpoint or undefined. */
  private ToEditPosition(
    position: WriterCursorSelection["point"],
  ): SwEditWindowSelection["point"] | undefined {
    return position.nodeIndex === undefined
      ? undefined
      : { contentIndex: position.offset, nodeIndex: position.nodeIndex };
  }

  /** Writes a Writer selection into a clipboard event. @param event - React clipboard event. @returns Whether transfer data was written. */
  private WriteTransfer(event: React.ClipboardEvent<HTMLElement>): boolean {
    if (!this.SynchronizeSelection()) return false;
    const payload = this.editWindow.CreateSelectionTransfer();
    if (payload === undefined) return false;
    event.preventDefault();
    this.SetTransferData(event.clipboardData, payload);
    return true;
  }

  /** Writes supported Writer MIME representations. @param data - Native transfer. @param payload - Writer transfer payload. @returns Nothing. */
  private SetTransferData(
    data: DataTransfer,
    payload: Readonly<{ html: string; plainText: string }>,
  ): void {
    data.setData("text/plain", payload.plainText);
    data.setData("text/html", payload.html);
  }
}
