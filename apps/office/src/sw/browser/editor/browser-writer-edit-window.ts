/** @fileoverview Implements the single browser/DOM adapter for Writer's platform-neutral SwEditWin. */

import type React from "react";

import type { SwEditWin, SwEditWindowSelection } from "../../source/uibase/docvw/edtwin";
import {
  createWriterTransferDocument,
  readBrowserWriterClipboardPaste,
} from "./writer-clipboard-events";
import { WriterTransferError } from "../../source/uibase/dochdl/swdtflvr";
import { BrowserWriterPointerSelectionController } from "./writer-geometry";
import { BrowserWriterSelectionMapper } from "./writer-selection";
import type { WriterCursorSelection } from "./writer-selection-types";
import { SwTab } from "../../inc/fesh";
import { browserPointerStyle } from "../../../vcl/browser/pointer";
import { SwTabFrame, type SwTableMouseCell } from "../../source/core/layout/tabfrm";
import { measureWriterCursorTextLines } from "./writer-line-measurement";

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
  private root: HTMLElement | undefined;
  private tableCapture = false;
  private tableBorderGuide: HTMLDivElement | undefined;
  private suppressBorderClick = false;

  /** Creates a browser edit window. @param editWindow - Writer-owned operation boundary. @param environment - Browser selection surface. @param resolveParagraph - Mounted projection lookup. @returns Nothing. */
  public constructor(
    private readonly editWindow: SwEditWin,
    private readonly environment: BrowserWriterEditWindowEnvironment,
    private readonly resolveParagraph: BrowserWriterParagraphResolver,
  ) {
    this.selectionMapper = new BrowserWriterSelectionMapper(environment, resolveParagraph);
    /* c8 ignore start -- JSDOM lacks caretRangeFromPoint; geometry has isolated coverage. */
    const caretRangeFromPoint = environment.document.caretRangeFromPoint?.bind(
      environment.document,
    );
    this.pointerSelection = new BrowserWriterPointerSelectionController(
      {
        ...(caretRangeFromPoint === undefined ? {} : { caretRangeFromPoint }),
        ...(environment.document.elementFromPoint === undefined
          ? {}
          : {
              elementFromPoint: environment.document.elementFromPoint.bind(environment.document),
            }),
      },
      this.selectionMapper.SetBaseAndExtent.bind(this.selectionMapper),
    );
    /* c8 ignore stop */
  }

  /** Installs native event subscriptions not represented faithfully by React synthetic events. @param root - Editing host. @returns Cleanup callback. */
  public Subscribe(root: HTMLElement): () => void {
    this.root = root;
    const handleBeforeInput =
      /** Routes one cancelable pre-mutation input event. @param event - Native input event. @returns Nothing. */ (
        event: Event,
      ): void => this.HandleBeforeInput(event as InputEvent);
    root.addEventListener("beforeinput", handleBeforeInput);
    const move =
      /** Delivers captured table drags outside the editing host. @param event - Device event. @returns Nothing. */
      (event: MouseEvent): void => {
        if (!this.tableCapture) return;
        this.MeasureTableFrames();
        this.editWindow.MouseMove({ x: event.clientX, y: event.clientY });
        this.PaintColumnGuide();
        event.preventDefault();
      };
    const up =
      /** Accepts the final native mouse position and releases browser capture. @param event - Device release. @returns Nothing. */
      (event: MouseEvent): void => {
        if (this.tableCapture) event.preventDefault();
        this.EndTableCapture(false, { x: event.clientX, y: event.clientY });
      };
    const cancel =
      /** Discards a preview when platform focus is lost. @returns Nothing. */
      (): void => this.EndTableCapture(true);
    const key =
      /** Gives native border tracking priority over document editing and shortcuts. @param event - Platform key. @returns Nothing. */
      (event: KeyboardEvent): void => {
        if (this.editWindow.GetTableBorderDragPosition() === undefined) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.key === "Escape" || event.key === "Enter")
          this.EndTableCapture(event.key === "Escape");
      };
    const click =
      /** Suppresses the release-generated click that would refocus text after a border gesture. @param event - Native click. @returns Nothing. */
      (event: MouseEvent): void => {
        if (!this.suppressBorderClick) return;
        this.suppressBorderClick = false;
        event.preventDefault();
        event.stopImmediatePropagation();
      };
    root.addEventListener("click", click, true);
    this.environment.document.addEventListener("keydown", key, true);
    this.environment.document.addEventListener("mousemove", move);
    this.environment.document.addEventListener("mouseup", up);
    this.environment.document.defaultView?.addEventListener("blur", cancel);
    const unsubscribeSelection = this.selectionMapper.Subscribe(
      /** Publishes one native selection to SwEditWin. @param selection - DOM selection projection. @returns Nothing. */ (
        selection,
      ) => {
        if (!this.tableCapture) this.ApplySelection(selection);
      },
    );
    return /** Removes native edit-window subscriptions. @returns Nothing. */ () => {
      root.removeEventListener("beforeinput", handleBeforeInput);
      this.environment.document.removeEventListener("mousemove", move);
      this.environment.document.removeEventListener("mouseup", up);
      this.environment.document.defaultView?.removeEventListener("blur", cancel);
      this.environment.document.removeEventListener("keydown", key, true);
      root.removeEventListener("click", click, true);
      cancel();
      this.suppressBorderClick = false;
      this.root = undefined;
      this.editWindow.SetTableMouseFrames([]);
      unsubscribeSelection();
    };
  }

  /** Restores shell-owned cursor state into the DOM projection. @param selection - Current cursor projection. @returns Whether restoration succeeded. */
  public RestoreSelection(selection: WriterCursorSelection): boolean {
    return this.selectionMapper.Restore(selection);
  }

  public readonly HandleFocus =
    /** Preserves native cursor on menu refocus; ordinary paragraph focus resolves its SwNodes coordinate. @param event - React focus event. @returns Nothing. */ (
      event: React.FocusEvent<HTMLElement>,
    ): void => {
      if (event.relatedTarget !== null && event.relatedTarget.closest('[role="menu"]') !== null)
        return;
      const paragraph = (event.target as HTMLElement).closest<HTMLParagraphElement>(
        "[data-writer-node-index]",
      );
      if (paragraph !== null) this.editWindow.FocusNode(Number(paragraph.dataset.writerNodeIndex));
    };

  public readonly HandleKeyDown =
    /** Translates selection, deletion and table traversal keys to the platform-neutral edit-window owner. @param event - React keyboard event. @returns Nothing. */ (
      event: React.KeyboardEvent<HTMLElement>,
    ): void => {
      if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        this.SynchronizeSelection();
        this.editWindow.SelectAll();
      } else if (
        (event.key === "Home" || event.key === "End") &&
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        !event.nativeEvent.isComposing
      ) {
        if (this.SynchronizeSelection()) {
          this.editWindow.MoveSectionBoundary(event.key === "Home", event.shiftKey);
          event.preventDefault();
        }
      } else if (
        (event.key === "Home" || event.key === "End") &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.nativeEvent.isComposing
      ) {
        const selection = this.selectionMapper.Read(),
          point = selection?.point,
          element =
            point === undefined
              ? undefined
              : this.resolveParagraph(point.paragraphId, point.offset);
        if (
          selection !== undefined &&
          point?.nodeIndex !== undefined &&
          element !== undefined &&
          this.ApplySelection(selection)
        ) {
          const start = Number(element.dataset.writerFragmentStart ?? 0),
            end = Number(element.dataset.writerFragmentEnd ?? element.textContent?.length ?? 0);
          if (
            this.editWindow.SetCursorTextFrame(
              point.nodeIndex,
              measureWriterCursorTextLines(element),
              start,
              end,
            )
          ) {
            this.editWindow.MoveLineBoundary(event.key === "Home", event.shiftKey);
            event.preventDefault();
          }
        }
      } else if (
        event.key === "Tab" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.nativeEvent.isComposing
      ) {
        if (this.SynchronizeSelection() && this.editWindow.HandleTab(event.shiftKey))
          event.preventDefault();
      } else if (
        event.key === "Backspace" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.nativeEvent.isComposing
      ) {
        event.preventDefault();
        if (this.SynchronizeSelection()) this.editWindow.DeleteLeft(event.shiftKey);
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
      this.WriteTransfer(event, false);
    };

  public readonly HandleCut =
    /** Writes and deletes the current Writer selection. @param event - React clipboard event. @returns Nothing. */ (
      event: React.ClipboardEvent<HTMLElement>,
    ): void => {
      this.WriteTransfer(event, true);
    };

  public readonly HandlePaste =
    /** Inserts a sanitized native paste at the canonical Writer PaM. @param event - React clipboard event. @returns Nothing. */ (
      event: React.ClipboardEvent<HTMLElement>,
    ): void => {
      if (!this.SynchronizeSelection()) return;
      const paste = readBrowserWriterClipboardPaste(event.clipboardData, this.environment.document);
      event.preventDefault();
      if (paste !== undefined) this.editWindow.PasteTransfer(createWriterTransferDocument(paste));
    };

  public readonly HandleDragStart =
    /** Writes the current Writer transfer into a native drag operation. @param event - React drag event. @returns Nothing. */ (
      event: React.DragEvent<HTMLElement>,
    ): void => {
      if (this.tableCapture) {
        event.preventDefault();
        return;
      }
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
      if (paste !== undefined) this.editWindow.PasteTransfer(createWriterTransferDocument(paste));
    };

  public readonly HandleClick =
    /** Prevents activation of semantic hyperlinks inside the editable surface. @param event - React click event. @returns Nothing. */ (
      event: React.MouseEvent<HTMLElement>,
    ): void => {
      if ((event.target as HTMLElement).closest("a[data-writer-hyperlink]") !== null)
        event.preventDefault();
    };

  public readonly HandlePointerDown =
    /** Starts pointer selection stabilization. @param event - React mouse event. @returns Nothing. */ (
      event: React.MouseEvent<HTMLElement>,
    ): void => {
      this.EndTableCapture(true);
      this.suppressBorderClick = false;
      this.MeasureTableFrames();
      this.pointerSelection.End();
      if (
        this.editWindow.MouseButtonDown(
          { x: event.clientX, y: event.clientY },
          event.button,
          event.detail || 1,
        )
      ) {
        this.tableCapture =
          this.editWindow.WhichMouseTabCol({ x: event.clientX, y: event.clientY }) !==
          SwTab.SEL_HORI;
        if (this.editWindow.GetTableBorderDragPosition() !== undefined) {
          this.suppressBorderClick = true;
          event.currentTarget.focus({ preventScroll: true });
          this.PaintColumnGuide();
        }
        event.preventDefault();
        return;
      }
      /* c8 ignore start -- Native text caret geometry retains its isolated adapter and Chromium checks. */
      if (this.pointerSelection.Start(event.button, event.clientX, event.clientY))
        this.SynchronizeSelection();
      /* c8 ignore stop */
    };

  public readonly HandlePointerMove =
    /** Extends pointer selection stabilization. @param event - React mouse event. @returns Nothing. */ (
      event: React.MouseEvent<HTMLElement>,
    ): void => {
      if (this.tableCapture) return;
      this.MeasureTableFrames();
      this.editWindow.changeMousePointer({ x: event.clientX, y: event.clientY });
      event.currentTarget.style.cursor = browserPointerStyle(this.editWindow.GetPointer());
      /* c8 ignore start -- Text caret extension is covered by isolated geometry and Chromium. */
      if (this.pointerSelection.Move(event.clientX, event.clientY)) event.preventDefault();
      /* c8 ignore stop */
    };

  public readonly HandlePointerUp =
    /** Completes pointer selection stabilization. @param event - React mouse event. @returns Nothing. */ (
      event: React.MouseEvent<HTMLElement>,
    ): void => {
      if (this.tableCapture) event.preventDefault();
      /* c8 ignore start -- Text pointer completion retains isolated geometry and Chromium coverage. */
      if (this.pointerSelection.End()) event.preventDefault();
      /* c8 ignore stop */
    };

  /** Releases the native draft and its device-only guide together. @param cancelled - Discard the draft. @param point - Final mouse position. @returns Nothing. */
  private EndTableCapture(
    cancelled: boolean,
    point?: { readonly x: number; readonly y: number },
  ): void {
    this.tableCapture = false;
    this.editWindow.MouseButtonUp(cancelled, point);
    this.tableBorderGuide?.remove();
    this.tableBorderGuide = undefined;
  }

  /** Paints only the transient native drag coordinate; table widths remain document-owned. @returns Nothing. */
  private PaintColumnGuide(): void {
    const position = this.editWindow.GetTableBorderDragPosition();
    if (position === undefined) return;
    if (this.tableBorderGuide === undefined) {
      const guide = this.environment.document.createElement("div");
      guide.setAttribute("aria-hidden", "true");
      if (position.axis === "column") guide.dataset.writerTableColumnGuide = "true";
      else guide.dataset.writerTableRowGuide = "true";
      guide.style.cssText =
        position.axis === "column"
          ? "position:fixed;top:0;bottom:0;width:1px;background:#4f46e5;pointer-events:none;z-index:40"
          : "position:fixed;left:0;right:0;height:1px;background:#4f46e5;pointer-events:none;z-index:40";
      this.environment.document.body.append(guide);
      this.tableBorderGuide = guide;
    }
    if (position.axis === "column") this.tableBorderGuide.style.left = position.position + "px";
    else this.tableBorderGuide.style.top = position.position + "px";
  }

  /** Measures live table frames over canonical model boxes; the browser owns only device rectangles. @returns Nothing. */
  private MeasureTableFrames(): void {
    const frames: SwTabFrame[] = [];
    if (this.root !== undefined)
      for (const element of this.root.querySelectorAll<HTMLTableElement>("table")) {
        const table = this.editWindow
          .GetDoc()
          .GetTables()
          .find(
            /** Resolves the existing mounted owner. @param owner - Canonical table. @returns Whether named by the frame. */
            (owner) => owner.GetName() === element.getAttribute("aria-label"),
          );
        if (table === undefined) continue;
        const rect = element.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;
        const boxes = table.GetTabLines().flatMap(
            /** Reads original box owners. @param row - Native table row. @returns Native cells. */
            (row) => row.GetTabBoxes(),
          ),
          cells: SwTableMouseCell[] = [];
        for (const cell of element.querySelectorAll<HTMLElement>("[data-writer-table-box]")) {
          const box = boxes.find(
            /** Resolves current section identity. @param owner - Actual box. @returns Whether mounted here. */
            (owner) => owner.GetStartNode().GetIndex() === Number(cell.dataset.writerTableBox),
          );
          if (box !== undefined)
            cells.push({
              box,
              rect: cell.getBoundingClientRect(),
              repeatedHeadline: cell.closest("[data-writer-repeated-headline]") !== null,
            });
        }
        if (cells.length === 0) continue;
        const printArea = {
          left: Math.min(
            ...cells.map(
              /** Reads physical cell-frame left edges. @param cell - Actual measured frame. @returns Device edge. */
              (cell) => cell.rect.left,
            ),
          ),
          right: Math.max(
            ...cells.map(
              /** Reads physical cell-frame right edges. @param cell - Actual measured frame. @returns Device edge. */
              (cell) => cell.rect.right,
            ),
          ),
          top: Math.min(
            ...cells.map(
              /** Reads physical cell-frame top edges. @param cell - Actual measured frame. @returns Device edge. */
              (cell) => cell.rect.top,
            ),
          ),
          bottom: Math.max(
            ...cells.map(
              /** Reads physical cell-frame bottom edges. @param cell - Actual measured frame. @returns Device edge. */
              (cell) => cell.rect.bottom,
            ),
          ),
        };
        const previous = element.parentElement?.previousElementSibling;
        frames.push(
          new SwTabFrame(table, {
            rect: printArea,
            cells,
            pageTop: element.closest("[data-writer-page]")?.getBoundingClientRect().top ?? 0,
            ...(previous === null || previous === undefined
              ? {}
              : { previous: previous.getBoundingClientRect() }),
          }),
        );
      }
    this.editWindow.SetTableMouseFrames(frames);
  }

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
        this.editWindow.SplitNode();
        break;
      case "insertParagraph":
        this.editWindow.InsertParagraph();
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
      : {
          contentIndex: position.offset,
          nodeIndex: position.nodeIndex,
          ...(position.inRepeatedHeadline === undefined
            ? {}
            : { inRepeatedHeadline: position.inRepeatedHeadline }),
        };
  }

  /** Writes a Writer selection into a clipboard event. @param event - React clipboard event. @param cut - Whether to remove the selection after writing. @returns Nothing. */
  private WriteTransfer(event: React.ClipboardEvent<HTMLElement>, cut: boolean): void {
    if (!this.SynchronizeSelection()) return;
    event.preventDefault();
    try {
      const write =
        /** Writes both native MIME representations. @param payload - Writer transfer pair. @returns Nothing. */ (
          payload: Readonly<{ html: string; plainText: string }>,
        ): void => this.SetTransferData(event.clipboardData, payload);
      if (cut) this.editWindow.CutTransfer(write);
      else this.editWindow.CopyTransfer(write);
    } catch (error) {
      if (!(error instanceof WriterTransferError)) throw error;
    }
  }

  /** Writes supported Writer MIME representations. @param data - Native transfer. @param payload - Writer transfer payload. @returns Nothing. */
  private SetTransferData(
    data: DataTransfer,
    payload: Readonly<{ html: string; plainText: string }>,
  ): void {
    data.setData("text/html", payload.html);
    data.setData("text/plain", payload.plainText);
  }
}
