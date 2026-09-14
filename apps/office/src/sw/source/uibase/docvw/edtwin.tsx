/**
 * @fileoverview Renders ordered Writer paragraphs as accessible editable blocks integrated directly into the document page.
 */

import { useEffect, useLayoutEffect, useRef } from "react";

import { getWriterParagraphListMarker, type WriterParagraph } from "../../core/doc/writer";
import { WriterEditableParagraph } from "./edtwin-paragraph";
import { createWriterClipboardSelection } from "../dochdl/swdtflvr";
import {
  getWriterCollapsedCaretOffset,
  getWriterDomSelection,
  getWriterSameParagraphSelection,
  restoreWriterCollapsedCaret,
  restoreWriterDomSelection,
} from "../../../browser/editor/writer-selection";
import type { WriterCursorSelection, WriterParagraphTextRange } from "../wrtsh/wrtsh";

/** Stores one browser caret endpoint used to extend a pointer selection across Writer paragraph editing hosts. */
interface WriterPointerCaret {
  /** Paragraph that owns the browser caret endpoint. */
  readonly paragraph: HTMLParagraphElement;
  /** DOM node that owns the browser caret endpoint. */
  readonly node: Node;
  /** UTF-16 offset within the caret endpoint node. */
  readonly offset: number;
}

/** Defines the immutable state and callback required by the integrated Writer document editor. */
export interface WriterPlainTextEditorProps {
  /** Stable identity of the paragraph whose formatting controls are currently active. */
  readonly activeParagraphId: string;
  /** Persistent shell cursor projected back into browser selection after rendering. */
  readonly cursorSelection: WriterCursorSelection;
  /** Executes one supported edit intent before browser DOM mutation. */
  readonly onBeforeInput: (inputType: string, data: string | null) => boolean;
  /** Commits or cancels one shell-owned extended-text-input unit. */
  readonly onCompositionEnd: () => boolean;
  /** Starts one shell-owned extended-text-input unit. */
  readonly onCompositionStart: () => void;
  /** Updates temporary extended-text-input data without changing SwDoc. */
  readonly onCompositionUpdate: (text: string) => void;
  /** Applies a paragraph focus fallback before selectionchange supplies an exact caret. */
  readonly onParagraphFocus: (paragraphId: string) => void;
  /** Requests the same complete-document selection used by Edit Select All. */
  readonly onSelectAll: () => void;
  /** Synchronizes an externally changed native selection into the persistent SwPaM. */
  readonly onSelectionChange: (selection: WriterCursorSelection) => boolean;
  /** Ordered immutable Writer paragraphs bound to document-integrated editable controls. */
  readonly paragraphs: readonly WriterParagraph[];
  /** Monotonic view invalidation used to remove transient native composition markup. */
  readonly projectionVersion: number;
  /** Receives a stable paragraph identity, complete next text, caret, and native edit kind after browser input. */
  readonly onTextChange: (
    paragraphId: string,
    text: string,
    caretOffset: number | undefined,
    inputType: string,
  ) => void;
  /** Removes a copied native same-paragraph selection after its clipboard payload is safely prepared. */
  readonly onTextCut: (range: WriterParagraphTextRange) => void;
  /** Replaces a native same-paragraph selection or caret with safe clipboard data. */
  readonly onTextPaste: (range: WriterParagraphTextRange, clipboardData: DataTransfer) => void;
}

/**
 * Renders editable paragraph blocks directly on the Writer page rather than as card-like form fields.
 *
 * @param props - Immutable Writer state and callbacks for complete-text replacement and focused formatting.
 * @param props.activeParagraphId - Stable identity of the paragraph targeted by formatting controls.
 * @param props.cursorSelection - Persistent SwPaM projection restored after rendering.
 * @param props.onBeforeInput - Callback executing supported edit intent before DOM mutation.
 * @param props.onCompositionEnd - Callback committing or canceling extended text input.
 * @param props.onCompositionStart - Callback starting extended text input.
 * @param props.onCompositionUpdate - Callback updating temporary extended text input.
 * @param props.onParagraphFocus - Callback handling cross-paragraph focus fallback.
 * @param props.onSelectAll - Callback that requests the document-wide browser selection.
 * @param props.onSelectionChange - Callback synchronizing native selection into the persistent SwPaM.
 * @param props.paragraphs - Ordered Writer paragraphs displayed in the bounded document body.
 * @param props.projectionVersion - View invalidation used for canonical DOM reconciliation.
 * @param props.onTextChange - Callback receiving a paragraph identity and complete user-entered text.
 * @param props.onTextCut - Callback removing a native copied same-paragraph selection.
 * @param props.onTextPaste - Callback inserting parsed native clipboard data at a Writer range.
 * @returns A page-integrated accessible Writer document body without contextual paragraph buttons.
 */
export function WriterPlainTextEditor({
  activeParagraphId,
  cursorSelection,
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
  paragraphs,
  projectionVersion,
}: WriterPlainTextEditorProps): React.JSX.Element {
  const paragraphElements = useRef(new Map<string, HTMLParagraphElement>());
  const paragraphsRef = useRef(paragraphs);
  const ignoreCompositionInput = useRef(false);
  const isComposing = useRef(false);
  const pointerSelectionAnchor = useRef<WriterPointerCaret | undefined>(undefined);
  const pointerSelectionFocus = useRef<WriterPointerCaret | undefined>(undefined);

  useEffect(
    /**
     * Retains the latest immutable paragraph list for a later explicit browser-selection request.
     *
     * @returns Nothing; the non-rendering ref tracks the current displayed paragraph identities.
     */
    function retainCurrentParagraphs(): void {
      paragraphsRef.current = paragraphs;
    },
    [paragraphs],
  );

  useLayoutEffect(
    /** Restores native selection only after every paragraph has projected canonical text runs. @returns Nothing. */
    function restoreCanonicalSelection(): void {
      restoreWriterDomSelection(
        cursorSelection,
        /** Resolves one currently mounted Writer paragraph. @param paragraphId - Stable text-node identity. @returns Mounted editable host. */ (
          paragraphId,
        ) => paragraphElements.current.get(paragraphId),
      );
    },
    [cursorSelection, paragraphs],
  );

  useEffect(
    /** Subscribes the shell to pointer, keyboard, and accessibility selection changes made outside model commands. @returns Listener cleanup. */
    function subscribeNativeSelection(): () => void {
      /** Converts one live browser Selection to the persistent Writer SwPaM. @returns Nothing. */
      function synchronizeNativeSelection(): void {
        const selection = getWriterDomSelection(globalThis.getSelection());
        if (selection !== undefined) onSelectionChange(selection);
      }
      document.addEventListener("selectionchange", synchronizeNativeSelection);
      return /** Removes the document-level selection bridge. @returns Nothing. */ () =>
        document.removeEventListener("selectionchange", synchronizeNativeSelection);
    },
    [onSelectionChange],
  );

  /**
   * Passes one complete editable paragraph text value to the owning immutable document state.
   *
   * @param paragraphId - Stable identity of the paragraph edited by the browser.
   * @param event - Browser input event emitted by the editable paragraph element.
   * @returns Nothing; the parent schedules the immutable state transition.
   */
  function handleTextChange(
    paragraphId: string,
    event: React.FormEvent<HTMLParagraphElement>,
  ): void {
    const nativeInput = event.nativeEvent as InputEvent;
    if (
      isComposing.current ||
      nativeInput.inputType === "insertCompositionText" ||
      nativeInput.inputType === "deleteCompositionText" ||
      nativeInput.inputType === "insertFromComposition" ||
      ignoreCompositionInput.current
    ) {
      ignoreCompositionInput.current = false;
      return;
    }
    const offset = getWriterCollapsedCaretOffset(event.currentTarget);
    onTextChange(
      paragraphId,
      event.currentTarget.textContent,
      offset,
      /* c8 ignore next -- React's contenteditable onInput always wraps a native InputEvent. */
      typeof nativeInput.inputType === "string" ? nativeInput.inputType : "",
    );
  }

  /** Routes supported beforeinput intent through SwWrtShell while the DOM still matches SwDoc. @param paragraphId - Event paragraph identity. @param event - React beforeinput wrapper. @returns Nothing. */
  function handleBeforeInput(paragraphId: string, event: InputEvent): void {
    void paragraphId;
    const selection = getWriterDomSelection(globalThis.getSelection());
    if (selection === undefined) return;
    onSelectionChange(selection);
    if (event.inputType === "insertCompositionText" || event.inputType === "deleteCompositionText")
      return;
    if (event.inputType === "insertFromComposition" && ignoreCompositionInput.current) {
      ignoreCompositionInput.current = false;
      event.preventDefault();
      return;
    }
    ignoreCompositionInput.current = false;
    if (onBeforeInput(event.inputType, event.data)) event.preventDefault();
  }

  /** Captures the canonical SwPaM before native IME starts its temporary DOM projection. @returns Nothing. */
  function handleCompositionStart(): void {
    const selection = getWriterDomSelection(globalThis.getSelection());
    if (selection !== undefined) onSelectionChange(selection);
    isComposing.current = true;
    onCompositionStart();
  }

  /** Retains the latest complete native IME text outside the canonical document. @param event - Composition update. @returns Nothing. */
  function handleCompositionUpdate(event: React.CompositionEvent<HTMLParagraphElement>): void {
    onCompositionUpdate(event.data);
  }

  /** Commits or cancels native IME as one shell transaction and suppresses its trailing input echo. @param event - Composition end. @returns Nothing. */
  function handleCompositionEnd(event: React.CompositionEvent<HTMLParagraphElement>): void {
    isComposing.current = false;
    ignoreCompositionInput.current = true;
    onCompositionUpdate(event.data);
    onCompositionEnd();
  }

  /**
   * Replaces browser-native copy data with the bounded Writer selection payload before it reaches another editor.
   *
   * @param event - Native copy event bubbled from the integrated Writer document body.
   * @returns Nothing; default browser serialization is prevented only for a visible Writer selection.
   */
  function handleNativeWriterCopy(event: React.ClipboardEvent<HTMLElement>): void {
    const selection = createWriterClipboardSelection(globalThis.getSelection());
    if (selection === undefined) return;
    event.preventDefault();
    event.clipboardData.setData("text/plain", selection.plainText);
    event.clipboardData.setData("text/html", selection.html);
  }

  /**
   * Replaces native Cut clipboard data and delegates deletion only for a safe Writer same-paragraph selection.
   *
   * @param event - Browser Cut event bubbled from the integrated Writer document body.
   * @returns Nothing; unsupported selections retain the browser default behavior without document mutation.
   */
  function handleNativeWriterCut(event: React.ClipboardEvent<HTMLElement>): void {
    const selection = globalThis.getSelection();
    const range = getWriterSameParagraphSelection(selection);
    const clipboardSelection = createWriterClipboardSelection(selection);
    if (range === undefined || clipboardSelection === undefined) return;
    event.preventDefault();
    event.clipboardData.setData("text/plain", clipboardSelection.plainText);
    event.clipboardData.setData("text/html", clipboardSelection.html);
    onTextCut(range);
  }

  /**
   * Converts a native Paste event to a Writer range without allowing browser HTML mutation of the editable paragraph.
   *
   * @param event - Browser Paste event bubbled from a focused Writer editable paragraph.
   * @returns Nothing; safe text is delegated when the target has a collapsed caret or same-paragraph selection.
   */
  function handleNativeWriterPaste(event: React.ClipboardEvent<HTMLElement>): void {
    const selection = globalThis.getSelection();
    const selectedRange = getWriterSameParagraphSelection(selection);
    /* c8 ignore next 3 -- Browser clipboard events dispatched by an editable host always target an Element; a non-Element target is defensive DOM-boundary handling. */
    const paragraph =
      event.target instanceof HTMLElement
        ? event.target.closest<HTMLParagraphElement>("[data-writer-paragraph-id]")
        : null;
    const collapsedOffset =
      paragraph === null ? undefined : getWriterCollapsedCaretOffset(paragraph);
    /* c8 ignore next 9 -- JSDOM does not reliably retain a collapsed contenteditable ClipboardEvent target after React rerenders; Chromium E2E covers that browser-native branch. */
    const range =
      selectedRange ??
      (paragraph === null || collapsedOffset === undefined
        ? undefined
        : {
            end: collapsedOffset,
            paragraphId: paragraph.dataset.writerParagraphId as string,
            start: collapsedOffset,
          });
    if (range === undefined) return;
    event.preventDefault();
    onTextPaste(range, event.clipboardData);
  }

  /**
   * Moves a collapsed boundary caret into an adjacent Writer paragraph without creating a document-history transaction.
   *
   * @param paragraphId - Stable identity of the paragraph that currently owns the boundary caret.
   * @param offset - Current UTF-16 caret offset inside the source paragraph.
   * @param key - Native arrow key that requested movement through the bounded document body.
   * @returns True when a neighboring paragraph accepts the browser caret; otherwise false so native in-paragraph movement remains available.
   */
  function moveCaretAcrossParagraphBoundary(
    paragraphId: string,
    offset: number,
    key: string,
  ): boolean {
    const paragraphIndex = paragraphsRef.current.findIndex(
      /**
       * Finds the rendered paragraph position that owns the arrow-key boundary caret.
       *
       * @param paragraph - Immutable Writer paragraph inspected in document order.
       * @returns True only for the paragraph that received the arrow key.
       */
      function hasParagraphId(paragraph): boolean {
        return paragraph.id === paragraphId;
      },
    );
    const sourceParagraph = paragraphsRef.current[paragraphIndex];
    /* c8 ignore next -- a rendered keyboard event always names a current Writer paragraph. */
    if (sourceParagraph === undefined) return false;
    const movesBackward = (key === "ArrowLeft" || key === "ArrowUp") && offset === 0;
    const movesForward =
      (key === "ArrowRight" || key === "ArrowDown") && offset === sourceParagraph.text.length;
    if (!movesBackward && !movesForward) return false;
    const targetParagraph = paragraphsRef.current[paragraphIndex + (movesBackward ? -1 : 1)] as
      WriterParagraph | undefined;
    /* c8 ignore next -- adjacent-boundary movement has no target only at document edges, where the browser retains native behavior. */
    if (targetParagraph === undefined) return false;
    const targetElement = paragraphElements.current.get(targetParagraph.id);
    /* c8 ignore next -- paragraph refs exist for every paragraph rendered into the active Writer document. */
    if (targetElement === undefined) return false;
    const targetOffset = movesBackward ? targetParagraph.text.length : 0;
    onSelectionChange({ point: { offset: targetOffset, paragraphId: targetParagraph.id } });
    restoreWriterCollapsedCaret(targetElement, targetOffset);
    return true;
  }

  /** Handles only selection/navigation keys; document mutations are owned by beforeinput. @param paragraphId - Event paragraph. @param event - Browser keyboard event. @returns Nothing. */
  function handleParagraphKeyDown(
    paragraphId: string,
    event: React.KeyboardEvent<HTMLParagraphElement>,
  ): void {
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "a") {
      event.preventDefault();
      onSelectAll();
      return;
    }
    if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
    const offset = getWriterCollapsedCaretOffset(event.currentTarget);
    if (offset === undefined) return;
    if (moveCaretAcrossParagraphBoundary(paragraphId, offset, event.key)) {
      event.preventDefault();
    }
  }

  /* c8 ignore start -- Pointer geometry APIs are unavailable in JSDOM; both drag directions are covered in production Chromium E2E. */
  /**
   * Resolves a browser caret position only when a pointer event targets one rendered Writer paragraph.
   *
   * @param event - Browser mouse event used to read a caret from the current viewport coordinates.
   * @returns Writer caret endpoint, or undefined when the browser cannot map the point into a Writer paragraph.
   */
  function getPointerCaret(event: React.MouseEvent<HTMLElement>): WriterPointerCaret | undefined {
    const caretRange = document.caretRangeFromPoint?.(event.clientX, event.clientY);
    if (caretRange === null || caretRange === undefined) return undefined;
    const caretElement =
      caretRange.startContainer instanceof HTMLElement
        ? caretRange.startContainer
        : caretRange.startContainer.parentElement;
    const paragraph = caretElement?.closest<HTMLParagraphElement>("[data-writer-paragraph-id]");
    if (paragraph === null || paragraph === undefined) return undefined;
    return { node: caretRange.startContainer, offset: caretRange.startOffset, paragraph };
  }

  /**
   * Captures the initial Writer caret before a pointer drag can leave its originating paragraph editing host.
   *
   * @param event - Browser mouse-down event emitted by one editable Writer paragraph.
   * @returns Nothing; a left-button Writer caret is retained for a later cross-paragraph drag.
   */
  function handleParagraphMouseDown(event: React.MouseEvent<HTMLParagraphElement>): void {
    pointerSelectionAnchor.current = event.button === 0 ? getPointerCaret(event) : undefined;
    pointerSelectionFocus.current = undefined;
  }

  /**
   * Extends a left-button pointer drag from one Writer paragraph into another without changing document text.
   *
   * @param event - Browser mouse-move event bubbled through the document body.
   * @returns Nothing; a cross-paragraph native selection replaces the browser's isolated editing-host selection.
   */
  function handleDocumentMouseMove(event: React.MouseEvent<HTMLElement>): void {
    const anchor = pointerSelectionAnchor.current;
    const focus = getPointerCaret(event);
    if (anchor === undefined || focus === undefined || anchor.paragraph === focus.paragraph) return;
    pointerSelectionFocus.current = focus;
    const selection = globalThis.getSelection();
    if (selection === null) return;
    event.preventDefault();
    selection.setBaseAndExtent(anchor.node, anchor.offset, focus.node, focus.offset);
  }

  /**
   * Clears the transient pointer-drag anchor after selection interaction ends anywhere in the Writer body.
   *
   * @returns Nothing; a later mouse drag always captures a fresh Writer caret anchor.
   */
  function clearPointerSelectionAnchor(): void {
    pointerSelectionAnchor.current = undefined;
    pointerSelectionFocus.current = undefined;
  }

  /**
   * Reapplies a cross-paragraph pointer range on mouse-up so native isolated editing-host selection cannot replace it.
   *
   * @param event - Browser mouse-up event ending a Writer pointer interaction.
   * @returns Nothing; a completed cross-paragraph selection is retained and transient pointer state is cleared.
   */
  function finalizePointerSelection(event: React.MouseEvent<HTMLElement>): void {
    const anchor = pointerSelectionAnchor.current;
    const focus = pointerSelectionFocus.current;
    if (anchor !== undefined && focus !== undefined) {
      const selection = globalThis.getSelection();
      if (selection !== null) {
        event.preventDefault();
        selection.setBaseAndExtent(anchor.node, anchor.offset, focus.node, focus.offset);
      }
    }
    clearPointerSelectionAnchor();
  }
  /* c8 ignore stop */

  return (
    <article
      aria-label="Writer document body"
      className="min-h-[600px] text-slate-950"
      onCopy={handleNativeWriterCopy}
      onCut={handleNativeWriterCut}
      onMouseMove={handleDocumentMouseMove}
      onMouseUp={finalizePointerSelection}
      onPaste={handleNativeWriterPaste}
    >
      {paragraphs.map(
        /** Renders one serializable paragraph through the focused editable presentation component. @param paragraph - Current Writer paragraph. @param index - Zero-based document position. @returns One keyed editable paragraph. */
        function renderParagraph(paragraph, index): React.JSX.Element {
          return (
            <WriterEditableParagraph
              index={index}
              isActive={paragraph.id === activeParagraphId}
              isLast={index === paragraphs.length - 1}
              key={paragraph.id}
              listMarker={getWriterParagraphListMarker(paragraphs, paragraph.id)}
              onBeforeInput={handleBeforeInput}
              onCompositionEnd={handleCompositionEnd}
              onCompositionStart={handleCompositionStart}
              onCompositionUpdate={handleCompositionUpdate}
              onFocus={onParagraphFocus}
              onKeyDown={handleParagraphKeyDown}
              onMouseDown={handleParagraphMouseDown}
              onTextInput={handleTextChange}
              paragraph={paragraph}
              projectionVersion={projectionVersion}
              retainElement={
                /** Stores mounted editor elements for later caret restoration. @param paragraphId - Stable paragraph identity. @param element - Mounted element or null after unmount. @returns Nothing; the ref map is updated. */
                function retainParagraphElement(paragraphId, element): void {
                  if (element === null) paragraphElements.current.delete(paragraphId);
                  else paragraphElements.current.set(paragraphId, element);
                }
              }
            />
          );
        },
      )}
    </article>
  );
}
