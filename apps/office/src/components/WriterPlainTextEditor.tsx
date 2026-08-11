/**
 * @fileoverview Renders ordered Writer paragraphs as accessible editable blocks integrated directly into the document page.
 */

import { useEffect, useRef } from "react";

import type { WriterParagraph } from "../domain/writer";

/** Defines the immutable state and callback required by the integrated Writer document editor. */
export interface WriterPlainTextEditorProps {
  /** Stable identity of the paragraph whose formatting controls are currently active. */
  readonly activeParagraphId: string;
  /** Stable identity of a newly inserted paragraph that should receive browser focus at its beginning. */
  readonly focusParagraphId: string | undefined;
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
 * @param props.onParagraphBreak - Callback that creates a new paragraph from a collapsed native Enter caret.
 * @param props.onParagraphMerge - Callback that merges a non-first paragraph into its preceding sibling.
 * @param props.onParagraphMergeNext - Callback that merges a following paragraph into the selected paragraph.
 * @param props.onParagraphFocus - Callback that selects a paragraph for formatting after it gains focus.
 * @param props.selectAllRequestId - Explicit request identity for browser selection of all rendered paragraphs.
 * @param props.paragraphs - Ordered Writer paragraphs displayed in the bounded document body.
 * @param props.onTextChange - Callback receiving a paragraph identity and complete user-entered text.
 * @returns A page-integrated accessible Writer document body without contextual paragraph buttons.
 */
export function WriterPlainTextEditor({
  activeParagraphId,
  focusParagraphId,
  onParagraphBreak,
  onParagraphMerge,
  onParagraphMergeNext,
  onParagraphFocus,
  onTextChange,
  paragraphs,
  selectAllRequestId,
}: WriterPlainTextEditorProps): React.JSX.Element {
  const paragraphElements = useRef(new Map<string, HTMLParagraphElement>());
  const paragraphsRef = useRef(paragraphs);

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
     * Focuses a newly inserted paragraph after React has mounted its document-integrated editable block.
     *
     * @returns Nothing; browser focus is moved only when the requested paragraph is present.
     */
    function focusInsertedParagraph(): void {
      if (focusParagraphId !== undefined) paragraphElements.current.get(focusParagraphId)?.focus();
    },
    [focusParagraphId],
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
    onTextChange(paragraphId, event.currentTarget.textContent);
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
    if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
    const offset = getCollapsedCaretOffset(event.currentTarget);
    if (offset === undefined) return;
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
          className={`min-h-7 -mx-1 rounded-sm px-1 text-slate-950 outline-none transition focus:bg-indigo-50 focus:ring-2 focus:ring-indigo-200 ${
            paragraph.style === "heading-1" ? "text-2xl font-bold leading-9" : "text-base leading-7"
          }`}
          contentEditable
          data-alignment={paragraph.alignment}
          data-style={paragraph.style}
          onKeyDown={
            /**
             * Routes a native paragraph-break key event through the stable paragraph identity.
             *
             * @param event - Browser keyboard event emitted by the rendered editable paragraph.
             * @returns Nothing; the owner receives a split request when appropriate.
             */
            function breakParagraph(event: React.KeyboardEvent<HTMLParagraphElement>): void {
              handleParagraphKeyDown(paragraph.id, event);
            }
          }
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
    <article aria-label="Writer document body" className="min-h-[600px] text-slate-950">
      {paragraphs.map(renderParagraph)}
    </article>
  );
}
