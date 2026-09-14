/** @fileoverview Projects Writer paragraphs into one browser editing host. */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { getWriterParagraphListMarker, type WriterParagraph } from "../../core/doc/writer";
import { WriterEditableParagraph } from "./edtwin-paragraph";
import {
  BrowserWriterSelectionMapper,
  getWriterCollapsedCaretOffset,
} from "../../../browser/editor/writer-selection";
import { BrowserWriterEditController } from "../../../browser/editor/writer-edit-controller";
import { BrowserWriterCompositionAdapter } from "../../../browser/editor/writer-composition";
import { BrowserWriterClipboardEvents } from "../../../browser/editor/writer-clipboard-events";
import { BrowserWriterPointerSelectionController } from "../../../browser/editor/writer-geometry";
import type { WriterCursorSelection } from "../wrtsh/wrtsh";

/** Defines immutable projection state and model-facing Writer operations. */
export interface WriterPlainTextEditorProps {
  readonly activeParagraphId: string;
  readonly cursorSelection: WriterCursorSelection;
  readonly onBeforeInput: (inputType: string, data: string | null) => boolean;
  readonly onCompositionEnd: () => boolean;
  readonly onCompositionStart: () => void;
  readonly onCompositionUpdate: (text: string) => void;
  readonly onParagraphFocus: (paragraphId: string) => void;
  readonly onSelectAll: () => void;
  readonly onSelectionChange: (selection: WriterCursorSelection) => boolean;
  readonly paragraphs: readonly WriterParagraph[];
  readonly projectionVersion: number;
  readonly onTextChange: (
    paragraphId: string,
    text: string,
    caretOffset: number | undefined,
    inputType: string,
  ) => void;
  readonly onTextCut: (selection: WriterCursorSelection) => void;
  readonly onTextPaste: (selection: WriterCursorSelection, clipboardData: DataTransfer) => void;
}

/** Renders one root `contenteditable` while paragraph nodes remain semantic model projections. @param props - Immutable projection state and Writer operations. @returns Logical Writer document editing host. */
export function WriterPlainTextEditor(props: WriterPlainTextEditorProps): React.JSX.Element {
  const {
    onBeforeInput,
    onCompositionEnd,
    onCompositionStart,
    onCompositionUpdate,
    onParagraphFocus,
    onSelectAll,
    onSelectionChange,
    onTextChange,
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
        executeIntent: onBeforeInput,
        reportFallback:
          /** Exposes guarded DOM reconciliation in host diagnostics. @param inputType - Unsupported browser input type. @returns Nothing. */ (
            inputType,
          ) => {
            const root = globalThis.document.querySelector<HTMLElement>(
              "[data-writer-editing-host]",
            );
            /* c8 ignore next -- fallback input can only bubble from a mounted editing host. */
            if (root !== null) {
              const count = Number(root.dataset.writerFallbackCount ?? "0") + 1;
              root.dataset.writerFallbackCount = String(count);
              root.dataset.writerFallbackInputType = inputType;
            }
            /* c8 ignore next -- production builds intentionally omit development diagnostics. */
            if (import.meta.env.DEV)
              console.warn(
                `Writer used guarded DOM reconciliation for ${inputType || "unknown input"}.`,
              );
          },
        synchronizeSelection:
          /** Commits browser endpoints into the shell before editing. @returns Whether a Writer selection was available. */ () => {
            const selection = selectionMapper.Read();
            /* c8 ignore next -- beforeinput is installed only on the mounted Writer editing host. */
            if (selection === undefined) return false;
            onSelectionChange(selection);
            return true;
          },
      }),
    [onBeforeInput, onSelectionChange, selectionMapper],
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
        cut: onTextCut,
        getSelection:
          /** Reads the native selection for clipboard text. @returns Current browser selection. */ () =>
            globalThis.getSelection(),
        mapSelection:
          /** Reads canonical Writer clipboard endpoints. @returns Current Writer selection, if mapped. */ () =>
            selectionMapper.Read(),
        paste: onTextPaste,
      }),
    [onTextCut, onTextPaste, selectionMapper],
  );
  /* c8 ignore start -- JSDOM has no caretRangeFromPoint; the isolated adapter has unit coverage and Chromium covers the bound event flow. */
  const pointerSelection = useMemo(
    /** Creates the root-level pointer geometry adapter. @returns Stable pointer controller. */ () => {
      const caretRangeFromPoint = globalThis.document.caretRangeFromPoint?.bind(
        globalThis.document,
      );
      return new BrowserWriterPointerSelectionController(
        caretRangeFromPoint === undefined ? {} : { caretRangeFromPoint },
        /** Reads the native selection to extend. @returns Current browser selection. */ () =>
          globalThis.getSelection(),
      );
    },
    [],
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
          if (disposition === "handled") input.preventDefault();
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

  /** Runs guarded compatibility reconciliation only after an unsupported native mutation. @param event - Root input event. @returns Nothing. */
  function handleInput(event: React.FormEvent<HTMLElement>): void {
    const input = event.nativeEvent as InputEvent;
    if (composition.ConsumeInput(input.inputType)) return;
    const paragraph = resolveEventParagraph(event.target);
    /* c8 ignore next -- input bubbling from the editing host has a projected paragraph target. */
    if (paragraph === undefined) return;
    editController.ReportFallback(input.inputType);
    onTextChange(
      paragraph.dataset.writerParagraphId as string,
      paragraph.textContent,
      getWriterCollapsedCaretOffset(paragraph),
      input.inputType,
    );
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
    pointerSelection.Start(event.button, event.clientX, event.clientY);
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
        ) => composition.End(event.data)
      }
      onCompositionStart={
        /** Starts transient IME state. @returns Nothing. */ () => composition.Start()
      }
      onCompositionUpdate={
        /** Updates transient IME text. @param event - Composition update event. @returns Nothing. */ (
          event,
        ) => composition.Update(event.data)
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
      onFocus={
        /** Focuses the projected paragraph containing the event target. @param event - Root focus event. @returns Nothing. */ (
          event,
        ) => {
          const paragraph = resolveEventParagraph(event.target);
          if (paragraph !== undefined)
            onParagraphFocus(paragraph.dataset.writerParagraphId as string);
        }
      }
      onInput={handleInput}
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
            listMarker={getWriterParagraphListMarker(props.paragraphs, paragraph.id)}
            paragraph={paragraph}
            projectionVersion={props.projectionVersion}
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
