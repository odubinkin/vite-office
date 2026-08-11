/**
 * @fileoverview Renders ordered Writer paragraphs as accessible editable blocks integrated directly into the document page.
 */

import { useEffect, useRef } from "react";

import type { WriterParagraph } from "../domain/writer";
import { createWriterClipboardSelection } from "./writer-clipboard-selection";

/** Stores one browser caret endpoint used to extend a pointer selection across Writer paragraph editing hosts. */
interface WriterPointerCaret {
  /** Paragraph that owns the browser caret endpoint. */
  readonly paragraph: HTMLParagraphElement;
  /** DOM node that owns the browser caret endpoint. */
  readonly node: Node;
  /** UTF-16 offset within the caret endpoint node. */
  readonly offset: number;
}

/** Stores the text offset that must survive React's immutable paragraph re-render after browser input. */
interface WriterPendingCaret {
  /** Stable identity of the paragraph that owns the browser caret. */
  readonly paragraphId: string;
  /** UTF-16 caret offset to restore after the paragraph text is committed. */
  readonly offset: number;
}

/** Defines the immutable state and callback required by the integrated Writer document editor. */
export interface WriterPlainTextEditorProps {
  /** Stable identity of the paragraph whose formatting controls are currently active. */
  readonly activeParagraphId: string;
  /** Stable identity of a newly inserted paragraph that should receive browser focus at its beginning. */
  readonly focusParagraphId: string | undefined;
  /** UTF-16 offset where a requested post-transaction paragraph focus must place its caret. */
  readonly focusParagraphOffset: number | undefined;
  /** Receives a paragraph identity and collapsed caret offset when native Enter requests a paragraph break. */
  readonly onParagraphBreak: (paragraphId: string, offset: number) => void;
  /** Receives a non-first paragraph identity when Backspace requests removal of its preceding paragraph break. */
  readonly onParagraphMerge: (paragraphId: string) => void;
  /** Receives a non-last paragraph identity when Delete requests removal of its following paragraph break. */
  readonly onParagraphMergeNext: (paragraphId: string) => void;
  /** Receives a stable paragraph identity when an editable paragraph gains focus. */
  readonly onParagraphFocus: (paragraphId: string) => void;
  /** Explicit request identity that asks the mounted editor to select its complete body. */
  readonly selectAllRequestId: number | undefined;
  /** Requests the same complete-document selection used by Edit Select All. */
  readonly onSelectAll: () => void;
  /** Ordered immutable Writer paragraphs bound to document-integrated editable controls. */
  readonly paragraphs: readonly WriterParagraph[];
  /** Receives a stable paragraph identity and its complete next text after a browser input event. */
  readonly onTextChange: (paragraphId: string, text: string) => void;
}

/**
 * Renders editable paragraph blocks directly on the Writer page rather than as card-like form fields.
 *
 * @param props - Immutable Writer state and callbacks for complete-text replacement and focused formatting.
 * @param props.activeParagraphId - Stable identity of the paragraph targeted by formatting controls.
 * @param props.focusParagraphId - Newly inserted paragraph that should receive browser focus at offset zero.
 * @param props.focusParagraphOffset - Caret offset restored after a split or paragraph-boundary merge.
 * @param props.onParagraphBreak - Callback that creates a new paragraph from a collapsed native Enter caret.
 * @param props.onParagraphMerge - Callback that merges a non-first paragraph into its preceding sibling.
 * @param props.onParagraphMergeNext - Callback that merges a following paragraph into the selected paragraph.
 * @param props.onParagraphFocus - Callback that selects a paragraph for formatting after it gains focus.
 * @param props.selectAllRequestId - Explicit request identity for browser selection of all rendered paragraphs.
 * @param props.onSelectAll - Callback that requests the document-wide browser selection.
 * @param props.paragraphs - Ordered Writer paragraphs displayed in the bounded document body.
 * @param props.onTextChange - Callback receiving a paragraph identity and complete user-entered text.
 * @returns A page-integrated accessible Writer document body without contextual paragraph buttons.
 */
export function WriterPlainTextEditor({
  activeParagraphId,
  focusParagraphId,
  focusParagraphOffset,
  onParagraphBreak,
  onParagraphMerge,
  onParagraphMergeNext,
  onParagraphFocus,
  onSelectAll,
  onTextChange,
  paragraphs,
  selectAllRequestId,
}: WriterPlainTextEditorProps): React.JSX.Element {
  const paragraphElements = useRef(new Map<string, HTMLParagraphElement>());
  const paragraphsRef = useRef(paragraphs);
  const pendingInputCaret = useRef<WriterPendingCaret | undefined>(undefined);
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

  useEffect(
    /**
     * Restores a typing caret after React commits immutable paragraph text, preventing it from jumping to the line start.
     *
     * @returns Nothing; the pending caret is consumed whether or not the browser can restore it safely.
     */
    function restorePendingInputCaret(): void {
      const pendingCaret = pendingInputCaret.current;
      pendingInputCaret.current = undefined;
      if (pendingCaret === undefined) return;
      const paragraph = paragraphElements.current.get(pendingCaret.paragraphId);
      /* c8 ignore next -- the pending identity belongs to the rendered paragraph that emitted the input event. */
      if (paragraph !== undefined) restoreCollapsedCaret(paragraph, pendingCaret.offset);
    },
    [paragraphs],
  );

  /* c8 ignore next -- Post-transaction focus is exercised in production Chromium because JSDOM does not model empty contenteditable caret focus. */
  useEffect(
    /**
     * Focuses a transaction-target paragraph after React has mounted its document-integrated editable block.
     *
     * @returns Nothing; browser focus and its requested caret offset are restored only when the paragraph is present.
     */
    function focusInsertedParagraph(): void {
      if (focusParagraphId === undefined || focusParagraphOffset === undefined) return;
      const paragraph = paragraphElements.current.get(focusParagraphId);
      /* c8 ignore next -- a transaction target remains rendered after Writer split or merge operations. */
      if (paragraph !== undefined) restoreCollapsedCaret(paragraph, focusParagraphOffset);
    },
    [focusParagraphId, focusParagraphOffset],
  );

  useEffect(
    /**
     * Selects the rendered Writer body after an explicit Edit Select All request without mutating paragraph state.
     *
     * @returns Nothing; the browser selection covers the first through last editable paragraph when available.
     */
    function selectCompleteWriterDocument(): void {
      if (selectAllRequestId === undefined) return;
      const selection = globalThis.getSelection();
      if (selection === null) return;
      const firstWriterParagraph = paragraphsRef.current[0] as WriterParagraph;
      const lastWriterParagraph = paragraphsRef.current[
        paragraphsRef.current.length - 1
      ] as WriterParagraph;
      const firstParagraph = paragraphElements.current.get(
        firstWriterParagraph.id,
      ) as HTMLParagraphElement;
      const lastParagraph = paragraphElements.current.get(
        lastWriterParagraph.id,
      ) as HTMLParagraphElement;
      const range = document.createRange();
      range.setStartBefore(firstParagraph);
      range.setEndAfter(lastParagraph);
      selection.removeAllRanges();
      selection.addRange(range);
    },
    [selectAllRequestId],
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
    const offset = getCollapsedCaretOffset(event.currentTarget);
    if (offset !== undefined) pendingInputCaret.current = { paragraphId, offset };
    onTextChange(paragraphId, event.currentTarget.textContent);
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
   * Reads a collapsed browser selection as a UTF-16 offset relative to one editable Writer paragraph.
   *
   * @param paragraphElement - Editable paragraph that must contain the selection's caret endpoint.
   * @returns Caret offset for a collapsed in-paragraph selection, or undefined when the browser selection cannot be safely split.
   */
  function getCollapsedCaretOffset(paragraphElement: HTMLParagraphElement): number | undefined {
    const selection = globalThis.getSelection();
    if (selection === null || !selection.isCollapsed || selection.rangeCount !== 1)
      return undefined;
    const caretRange = selection.getRangeAt(0);
    if (!paragraphElement.contains(caretRange.startContainer)) return undefined;
    const precedingRange = caretRange.cloneRange();
    precedingRange.selectNodeContents(paragraphElement);
    precedingRange.setEnd(caretRange.startContainer, caretRange.startOffset);
    return precedingRange.toString().length;
  }

  /**
   * Focuses one Writer paragraph and restores a bounded collapsed caret offset inside its plain-text body.
   *
   * @param paragraph - Rendered Writer paragraph that should receive browser focus.
   * @param offset - Requested UTF-16 caret offset, clamped to the currently rendered text length.
   * @returns Nothing; selection is left unchanged when the browser cannot safely restore a text caret.
   */
  function restoreCollapsedCaret(paragraph: HTMLParagraphElement, offset: number): void {
    const textNode = paragraph.firstChild;
    const selection = globalThis.getSelection();
    /* c8 ignore next -- Writer requires browser selection support to mount its editable document body. */
    if (selection === null) return;
    paragraph.focus();
    const range = document.createRange();
    if (textNode instanceof Text) range.setStart(textNode, Math.min(offset, textNode.length));
    else range.setStart(paragraph, 0);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
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
    restoreCollapsedCaret(targetElement, movesBackward ? targetParagraph.text.length : 0);
    return true;
  }

  /**
   * Intercepts an unmodified Enter key only when the browser exposes a safe collapsed caret for paragraph splitting.
   *
   * @param paragraphId - Stable identity of the paragraph that received the keyboard event.
   * @param event - Browser keyboard event emitted by that editable paragraph.
   * @returns Nothing; native Enter is prevented only for the modeled paragraph-break transition.
   */
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
    const offset = getCollapsedCaretOffset(event.currentTarget);
    if (offset === undefined) return;
    if (moveCaretAcrossParagraphBoundary(paragraphId, offset, event.key)) {
      event.preventDefault();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      onParagraphBreak(paragraphId, offset);
    } else if (event.key === "Backspace" && offset === 0) {
      event.preventDefault();
      onParagraphMerge(paragraphId);
    } else if (event.key === "Delete" && offset === event.currentTarget.textContent.length) {
      event.preventDefault();
      onParagraphMergeNext(paragraphId);
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
    const range = document.createRange();
    range.setStartBefore(anchor.paragraph);
    range.setEndAfter(focus.paragraph);
    if (range.collapsed) {
      range.setStartBefore(focus.paragraph);
      range.setEndAfter(anchor.paragraph);
    }
    selection.removeAllRanges();
    selection.addRange(range);
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
        const range = document.createRange();
        range.setStartBefore(anchor.paragraph);
        range.setEndAfter(focus.paragraph);
        if (range.collapsed) {
          range.setStartBefore(focus.paragraph);
          range.setEndAfter(anchor.paragraph);
        }
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    clearPointerSelectionAnchor();
  }
  /* c8 ignore stop */

  /**
   * Renders one stable Writer paragraph as an editable block inside the document page.
   *
   * @param paragraph - Immutable Writer paragraph rendered without mutation.
   * @param index - Zero-based paragraph position used only for assistive-technology labels.
   * @returns Accessible page-integrated editable block for the supplied body entry.
   */
  function renderParagraph(paragraph: WriterParagraph, index: number): React.JSX.Element {
    const isActiveParagraph = paragraph.id === activeParagraphId;
    const isLastParagraph = index === paragraphs.length - 1;
    const styleDescriptionId = `writer-paragraph-style-${index + 1}`;
    const label = index === 0 ? "Writer document text" : `Writer paragraph ${index + 1}`;
    return (
      <div
        className={isLastParagraph ? "" : "mb-4"}
        data-active={isActiveParagraph}
        key={paragraph.id}
      >
        <span className="sr-only" id={styleDescriptionId}>
          Paragraph style:{" "}
          {paragraph.style === "heading-1" ? "Heading 1" : "Default Paragraph Style"}
        </span>
        <p
          aria-describedby={styleDescriptionId}
          aria-label={label}
          aria-multiline="true"
          className={`min-h-7 text-slate-950 outline-none ${
            paragraph.style === "heading-1" ? "text-2xl font-bold leading-9" : "text-base leading-7"
          }`}
          contentEditable
          data-alignment={paragraph.alignment}
          data-writer-paragraph-id={paragraph.id}
          data-style={paragraph.style}
          onFocus={
            /**
             * Selects this paragraph so formatting controls target its immutable identity.
             *
             * @returns Nothing; the owning workbench records the active paragraph identity.
             */
            function selectParagraph(): void {
              onParagraphFocus(paragraph.id);
            }
          }
          onInput={
            /**
             * Connects browser text input to this immutable paragraph identity.
             *
             * @param event - Browser input event emitted for this editable paragraph.
             * @returns Nothing; the owning workbench schedules the update.
             */
            function updateParagraph(event: React.FormEvent<HTMLParagraphElement>): void {
              handleTextChange(paragraph.id, event);
            }
          }
          onKeyDown={
            /**
             * Routes a native paragraph command or Ctrl/Cmd+A through the stable paragraph identity.
             *
             * @param event - Browser keyboard event emitted by the rendered editable paragraph.
             * @returns Nothing; the owner receives the matching bounded Writer action when appropriate.
             */
            function handleWriterParagraphKeyDown(
              event: React.KeyboardEvent<HTMLParagraphElement>,
            ): void {
              handleParagraphKeyDown(paragraph.id, event);
            }
          }
          onMouseDown={handleParagraphMouseDown}
          role="textbox"
          ref={
            /**
             * Retains the mounted paragraph element so a completed split can focus its trailing sibling.
             *
             * @param element - Mounted editable paragraph or null when React unmounts it.
             * @returns Nothing; the ref map is updated without document-state mutation.
             */
            function retainParagraphElement(element: HTMLParagraphElement | null): void {
              if (element === null) paragraphElements.current.delete(paragraph.id);
              else paragraphElements.current.set(paragraph.id, element);
            }
          }
          style={{ textAlign: paragraph.alignment }}
          suppressContentEditableWarning
        >
          {paragraph.text}
        </p>
      </div>
    );
  }

  return (
    <article
      aria-label="Writer document body"
      className="min-h-[600px] text-slate-950"
      onCopy={handleNativeWriterCopy}
      onMouseMove={handleDocumentMouseMove}
      onMouseUp={finalizePointerSelection}
    >
      {paragraphs.map(renderParagraph)}
    </article>
  );
}
