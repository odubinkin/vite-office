/**
 * @fileoverview Renders the bounded, accessible plain-text editing surface for an ordered Writer paragraph body without implementing layout or rich-text behavior.
 */

import type { OfficeDocument } from "../domain/document";
import type { WriterParagraph } from "../domain/writer";

/** Defines the immutable state and callback required by the Writer plain-text editor. */
export interface WriterPlainTextEditorProps {
  /** Shared Writer header whose lifecycle feedback is rendered without mutation. */
  readonly document: OfficeDocument;
  /** Ordered immutable Writer paragraphs bound to accessible editing controls. */
  readonly paragraphs: readonly WriterParagraph[];
  /** Requests immutable removal of the paragraph identified by the supplied stable ID. */
  readonly onRemoveParagraph: (paragraphId: string) => void;
  /** Receives a stable paragraph identity and its complete next text after an editing event. */
  readonly onTextChange: (paragraphId: string, text: string) => void;
}

/**
 * Renders labelled textareas backed by an immutable ordered Writer paragraph model.
 *
 * @param props - Immutable Writer state and callback for a complete-text replacement.
 * @param props.document - Header providing lifecycle and revision feedback.
 * @param props.onRemoveParagraph - Callback that removes an eligible paragraph from the immutable body.
 * @param props.paragraphs - Ordered Writer paragraphs displayed by this bounded editor.
 * @param props.onTextChange - Callback receiving a paragraph identity and complete user-entered text.
 * @returns A Writer-only accessible editing region without formatting or persistence controls.
 */
export function WriterPlainTextEditor({
  document,
  onRemoveParagraph,
  onTextChange,
  paragraphs,
}: WriterPlainTextEditorProps): React.JSX.Element {
  const lifecycleLabel = document.lifecycle === "new" ? "New document" : "Unsaved changes";
  const canRemoveParagraph = paragraphs.length > 1;

  /**
   * Passes one complete textarea value to the owning immutable document state.
   *
   * @param paragraphId - Stable identity of the paragraph edited by the textarea.
   * @param event - Browser change event emitted by the controlled textarea.
   * @returns Nothing; the parent schedules the immutable state transition.
   */
  function handleTextChange(
    paragraphId: string,
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ): void {
    onTextChange(paragraphId, event.target.value);
  }

  /**
   * Renders one stable Writer paragraph as a labelled controlled textarea.
   *
   * @param paragraph - Immutable Writer paragraph rendered without mutation.
   * @param index - Zero-based paragraph position used only for human-facing labels.
   * @returns Accessible paragraph editing controls for the supplied body entry.
   */
  function renderParagraph(paragraph: WriterParagraph, index: number): React.JSX.Element {
    const isFirstParagraph = index === 0;
    const textareaId = `writer-editor-text-${index + 1}`;
    const label = isFirstParagraph ? "Writer document text" : `Writer paragraph ${index + 1}`;
    return (
      <div className="mt-5" key={paragraph.id}>
        <label className="block text-sm font-semibold text-slate-800" htmlFor={textareaId}>
          {label}
        </label>
        <textarea
          aria-describedby="writer-editor-help"
          className="mt-2 min-h-40 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-base leading-7 text-slate-950 shadow-sm outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
          id={textareaId}
          onChange={
            /**
             * Connects the current textarea event to its immutable paragraph identity.
             *
             * @param event - Browser change event emitted for this paragraph textarea.
             * @returns Nothing; the owning workbench schedules the update.
             */
            function updateParagraph(event: React.ChangeEvent<HTMLTextAreaElement>): void {
              handleTextChange(paragraph.id, event);
            }
          }
          placeholder={isFirstParagraph ? "Start writing…" : "Continue writing…"}
          value={paragraph.text}
        />
        {canRemoveParagraph ? (
          <button
            className="mt-2 rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm font-semibold text-rose-800 shadow-sm transition hover:border-rose-500"
            onClick={
              /**
               * Connects this paragraph removal control to its immutable identity.
               *
               * @returns Nothing; the owning workbench schedules the removal.
               */
              function removeParagraph(): void {
                onRemoveParagraph(paragraph.id);
              }
            }
            type="button"
          >
            Remove paragraph {index + 1}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <section
      aria-labelledby="writer-editor-heading"
      className="mt-8 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">
            Writer plain-text editor
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950" id="writer-editor-heading">
            Write a paragraph
          </h2>
        </div>
        <p aria-live="polite" className="text-sm font-medium text-slate-700" role="status">
          {lifecycleLabel} · revision {document.revision}
        </p>
      </div>

      {paragraphs.map(renderParagraph)}
      <p className="mt-3 text-sm leading-6 text-slate-600" id="writer-editor-help">
        This workbench edits ordered plain-text paragraphs in memory. Formatting, deletion,
        reordering, and document file formats are separate features.
      </p>
    </section>
  );
}
