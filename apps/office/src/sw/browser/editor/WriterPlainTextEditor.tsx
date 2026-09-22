/** @fileoverview Projects Writer paragraphs into one browser editing host outside upstream paths. */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import type { WriterParagraphProjection as WriterParagraph } from "../presentation/writer-view-projection";
import { WriterEditableParagraph } from "./WriterEditableParagraph";
import { BrowserWriterSelectionMapper } from "./writer-selection";
import { BrowserWriterEditController, type BrowserWriterEditPort } from "./writer-edit-controller";
import { BrowserWriterCompositionAdapter } from "./writer-composition";
import { BrowserWriterClipboardEvents } from "./writer-clipboard-events";
import { BrowserWriterPointerSelectionController } from "./writer-geometry";
import type { WriterCursorSelection } from "./writer-selection-types";
import type { WriterClipboardSelection } from "../../source/uibase/dochdl/swdtflvr";

/** Defines immutable projection state and model-facing Writer operations. */
export interface WriterPlainTextEditorProps {
  readonly activeParagraphId: string;
  readonly cursorSelection: WriterCursorSelection;
  readonly editPort: Omit<BrowserWriterEditPort, "synchronizeSelection">;
  readonly onCompositionEnd: () => boolean;
  readonly onCompositionStart: () => void;
  readonly onCompositionUpdate: (text: string) => void;
  readonly onParagraphFocus: (paragraphId: string) => void;
  readonly onSelectAll: () => void;
  readonly onSelectionChange: (selection: WriterCursorSelection) => boolean;
  readonly paragraphs: readonly WriterParagraph[];
  readonly onCreateTransfer: () => WriterClipboardSelection | undefined;
  readonly onTextCut: () => void;
  readonly onTextPaste: (clipboardData: DataTransfer) => void;
}

/** Renders one root `contenteditable` while paragraph nodes remain semantic model projections. @param props - Immutable projection state and Writer operations. @returns Logical Writer document editing host. */
export function WriterPlainTextEditor(props: WriterPlainTextEditorProps): React.JSX.Element {
  const {
    editPort,
    onCompositionEnd,
    onCompositionStart,
    onCompositionUpdate,
    onCreateTransfer,
    onParagraphFocus,
    onSelectAll,
    onSelectionChange,
    onTextCut,
    onTextPaste,
  } = props;
  const rootElement = useRef<HTMLElement | null>(null);
  const [paragraphElements] = useState(
    /** Creates the stable paragraph projection registry. @returns Empty paragraph registry. */ () =>
      new Map<string, HTMLParagraphElement>(),
  );

  const selectionMapper = useMemo(
    /** Creates the browser selection bridge for the mounted projection. @returns Stable selection mapper. */
    () =>
      new BrowserWriterSelectionMapper(
        {
          document: globalThis.document,
          getSelection:
            /** Reads the active browser selection. @returns Current browser selection. */ () =>
              globalThis.getSelection(),
        },
        /** Resolves a projected paragraph. @param paragraphId - Stable Writer paragraph ID. @returns Mounted paragraph, if present. */ (
          paragraphId,
        ) => paragraphElements.get(paragraphId),
      ),
    [paragraphElements],
  );

  const editController = useMemo(
    /** Creates the explicit edit-intent controller. @returns Stable edit controller. */
    () =>
      new BrowserWriterEditController({
        ...editPort,
        synchronizeSelection:
          /** Commits browser endpoints into the shell before editing. @returns Whether a Writer selection was available. */ () => {
            const selection = selectionMapper.Read();
            /* c8 ignore next -- beforeinput is installed only on the mounted Writer editing host. */
            if (selection === undefined) return false;
            onSelectionChange(selection);
            return true;
          },
      }),
    [editPort, onSelectionChange, selectionMapper],
  );

  const composition = useMemo(
    /** Creates the transient IME adapter. @returns Stable composition adapter. */
    () =>
      new BrowserWriterCompositionAdapter({
        end: onCompositionEnd,
        start: onCompositionStart,
        synchronizeSelection:
          /** Commits browser endpoints into the shell before composition. @returns Whether a Writer selection was available. */ () => {
            const selection = selectionMapper.Read();
            /* c8 ignore next -- composition starts only from the mounted Writer editing host. */
            if (selection === undefined) return false;
            onSelectionChange(selection);
            return true;
          },
        update: onCompositionUpdate,
      }),
    [onCompositionEnd, onCompositionStart, onCompositionUpdate, onSelectionChange, selectionMapper],
  );

  const clipboard = useMemo(
    /** Creates native clipboard event bindings. @returns Stable clipboard adapter. */
    () =>
      new BrowserWriterClipboardEvents({
        createSelection: onCreateTransfer,
        cut: onTextCut,
        paste: onTextPaste,
        synchronizeSelection:
          /** Commits the one native selection into the shell before transfer. @returns Whether it belongs to Writer. */ () => {
            const selection = selectionMapper.Read();
            if (selection === undefined) return false;
            onSelectionChange(selection);
            return true;
          },
      }),
    [onCreateTransfer, onSelectionChange, onTextCut, onTextPaste, selectionMapper],
  );
  /* c8 ignore start -- JSDOM has no caretRangeFromPoint; the isolated adapter has unit coverage and Chromium covers the bound event flow. */
  const pointerSelection = useMemo(
    /** Creates the root-level pointer geometry adapter. @returns Stable pointer controller. */ () => {
      const caretRangeFromPoint = globalThis.document.caretRangeFromPoint?.bind(
        globalThis.document,
      );
      return new BrowserWriterPointerSelectionController(
        caretRangeFromPoint === undefined ? {} : { caretRangeFromPoint },
        selectionMapper.SetBaseAndExtent.bind(selectionMapper),
      );
    },
    [selectionMapper],
  );
  /* c8 ignore stop */

  useLayoutEffect(
    /** Restores the shell-owned selection after canonical paragraph projection. @returns Nothing. */
    function restoreCanonicalSelection(): void {
      selectionMapper.Restore(props.cursorSelection);
    },
    [props.cursorSelection, props.paragraphs, selectionMapper],
  );

  useEffect(
    /** Keeps browser selection synchronized with the registered shell PaM. @returns Listener cleanup. */
    function subscribeSelection(): () => void {
      return selectionMapper.Subscribe(onSelectionChange);
    },
    [onSelectionChange, selectionMapper],
  );

  useEffect(
    /** Installs one native `beforeinput` listener on the logical document host. @returns Listener cleanup. */
    function subscribeBeforeInput(): () => void {
      const root = rootElement.current as HTMLElement;
      const handleBeforeInput =
        /** Dispatches a native edit intent into Writer. @param event - Native beforeinput event. @returns Nothing. */ (
          event: Event,
        ): void => {
          const input = event as InputEvent;
          if (composition.ConsumeBeforeInput(input.inputType)) {
            input.preventDefault();
            return;
          }
          const disposition = editController.HandleIntent({
            data: input.data,
            inputType: input.inputType,
          });
          if (disposition !== "native-composition") input.preventDefault();
        };
      root.addEventListener("beforeinput", handleBeforeInput);
      return /** Removes the root native listener. @returns Nothing. */ () =>
        root.removeEventListener("beforeinput", handleBeforeInput);
    },
    [composition, editController],
  );

  /** Resolves the paragraph projection associated with an editor event. @param target - Native event target. @returns Paragraph element or undefined. */
  function resolveEventParagraph(target: EventTarget | null): HTMLParagraphElement | undefined {
    const element = target as HTMLElement;
    return element.closest<HTMLParagraphElement>("[data-writer-paragraph-id]") ?? undefined;
  }

  /** Keeps Select All command identity shared with menus and shortcuts. @param event - Root keyboard event. @returns Nothing. */
  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>): void {
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "a") {
      event.preventDefault();
      onSelectAll();
    }
  }

  /* c8 ignore start -- Pointer geometry is covered by the isolated adapter and Chromium E2E. */
  /** Starts root-level pointer selection stabilization. @param event - Native mouse-down event. @returns Nothing. */
  function handlePointerDown(event: React.MouseEvent<HTMLElement>): void {
    if (!pointerSelection.Start(event.button, event.clientX, event.clientY)) return;
    const selection = selectionMapper.Read();
    if (selection !== undefined) onSelectionChange(selection);
  }
  /** Extends root-level pointer selection stabilization. @param event - Native mouse-move event. @returns Nothing. */
  function handlePointerMove(event: React.MouseEvent<HTMLElement>): void {
    if (pointerSelection.Move(event.clientX, event.clientY)) event.preventDefault();
  }
  /** Completes root-level pointer selection stabilization. @param event - Native mouse-up event. @returns Nothing. */
  function handlePointerUp(event: React.MouseEvent<HTMLElement>): void {
    if (pointerSelection.End()) event.preventDefault();
  }
  /* c8 ignore stop */

  return (
    <article
      aria-label="Writer document body"
      className="min-h-[600px] text-slate-950 outline-none"
      contentEditable
      data-writer-editing-host="true"
      onCompositionEnd={
        /** Commits one IME transaction. @param event - Composition end event. @returns Whether Writer changed. */ (
          event,
        ) => {
          composition.End(event.data);
        }
      }
      onCompositionStart={
        /** Starts transient IME state. @returns Nothing. */ () => composition.Start()
      }
      onCompositionUpdate={
        /** Updates transient IME text. @param event - Composition update event. @returns Nothing. */ (
          event,
        ) => composition.Update(event.data)
      }
      onClick={
        /** Keeps link activation out of the editable surface while retaining semantic anchors. @param event - Editor click. @returns Nothing. */ (
          event,
        ) => {
          if ((event.target as HTMLElement).closest("a[data-writer-hyperlink]") !== null)
            event.preventDefault();
        }
      }
      onCopy={
        /** Handles native copy. @param event - Clipboard event. @returns Whether copy was handled. */ (
          event,
        ) => clipboard.Copy(event)
      }
      onCut={
        /** Handles native cut. @param event - Clipboard event. @returns Whether cut was handled. */ (
          event,
        ) => clipboard.Cut(event)
      }
      onDragOver={
        /** Allows a bounded textual drop to reach the Writer adapter. @param event - Native drag event. @returns Nothing. */ (
          event,
        ) => event.preventDefault()
      }
      onDragStart={
        /** Seeds native drag formats from the shell-owned SwPaM. @param event - Native drag event. @returns Nothing. */ (
          event,
        ) => {
          clipboard.DragStart(event.dataTransfer);
        }
      }
      onDrop={
        /** Maps the drop point to Writer and inserts filtered transfer content through the shell. @param event - Native drag event. @returns Nothing. */ (
          event,
        ) => {
          pointerSelection.Place(event.clientX, event.clientY);
          clipboard.Drop(
            event.dataTransfer,
            /** Cancels browser-owned drop insertion. @returns Nothing. */ () =>
              event.preventDefault(),
          );
        }
      }
      onFocus={
        /** Focuses the projected paragraph containing the event target. @param event - Root focus event. @returns Nothing. */ (
          event,
        ) => {
          const paragraph = resolveEventParagraph(event.target);
          if (paragraph !== undefined)
            onParagraphFocus(paragraph.dataset.writerParagraphId as string);
        }
      }
      onKeyDown={handleKeyDown}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onPaste={
        /** Handles native paste. @param event - Clipboard event. @returns Whether paste was handled. */ (
          event,
        ) => clipboard.Paste(event)
      }
      ref={rootElement}
      suppressContentEditableWarning
    >
      {props.paragraphs.map(
        /** Projects one Writer paragraph. @param paragraph - Canonical paragraph. @param index - Paragraph order. @returns Paragraph projection. */ (
          paragraph,
          index,
        ) => (
          <WriterEditableParagraph
            index={index}
            isActive={paragraph.id === props.activeParagraphId}
            isLast={index === props.paragraphs.length - 1}
            key={paragraph.id}
            listMarker={paragraph.listMarker}
            paragraph={paragraph}
            retainElement={
              /** Maintains the paragraph registry. @param paragraphId - Stable Writer ID. @param element - Mounted paragraph or null on unmount. @returns Nothing. */ (
                paragraphId,
                element,
              ) => {
                if (element === null) paragraphElements.delete(paragraphId);
                else paragraphElements.set(paragraphId, element);
              }
            }
          />
        ),
      )}
    </article>
  );
}
