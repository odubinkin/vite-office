/**
 * @fileoverview Renders ordered Writer paragraphs as accessible editable blocks integrated directly into the document page.
 */

import type { WriterParagraph } from "../domain/writer";

/** Defines the immutable state and callback required by the integrated Writer document editor. */
export interface WriterPlainTextEditorProps {
  /** Stable identity of the paragraph whose formatting controls are currently active. */
  readonly activeParagraphId: string;
  /** Receives a stable paragraph identity when an editable paragraph gains focus. */
  readonly onParagraphFocus: (paragraphId: string) => void;
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
 * @param props.onParagraphFocus - Callback that selects a paragraph for formatting after it gains focus.
 * @param props.paragraphs - Ordered Writer paragraphs displayed in the bounded document body.
 * @param props.onTextChange - Callback receiving a paragraph identity and complete user-entered text.
 * @returns A page-integrated accessible Writer document body without contextual paragraph buttons.
 */
export function WriterPlainTextEditor({
  activeParagraphId,
  onParagraphFocus,
  onTextChange,
  paragraphs,
}: WriterPlainTextEditorProps): React.JSX.Element {
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
