/**
 * @fileoverview Renders the bounded, accessible plain-text editing surface for one Writer paragraph without implementing layout or rich-text behavior.
 */

import type { OfficeDocument } from "../domain/document";
import type { WriterParagraph } from "../domain/writer";

/** Defines the immutable state and callback required by the Writer plain-text editor. */
export interface WriterPlainTextEditorProps {
  /** Shared Writer header whose lifecycle feedback is rendered without mutation. */
  readonly document: OfficeDocument;
  /** Immutable paragraph whose complete text is bound to the editing control. */
  readonly paragraph: WriterParagraph;
  /** Receives the complete next paragraph text after a user editing event. */
  readonly onTextChange: (text: string) => void;
}

/**
 * Renders one labelled textarea backed by an immutable Writer paragraph model.
 *
 * @param props - Immutable Writer state and callback for a complete-text replacement.
 * @param props.document - Header providing lifecycle and revision feedback.
 * @param props.paragraph - First Writer paragraph displayed by this bounded editor.
 * @param props.onTextChange - Callback receiving complete user-entered paragraph text.
 * @returns A Writer-only accessible editing region without formatting or persistence controls.
 */
export function WriterPlainTextEditor({
  document,
  onTextChange,
  paragraph,
}: WriterPlainTextEditorProps): React.JSX.Element {
  const lifecycleLabel = document.lifecycle === "new" ? "New document" : "Unsaved changes";

  /**
   * Passes the complete textarea value to the owning immutable document state.
   *
   * @param event - Browser change event emitted by the controlled textarea.
   * @returns Nothing; the parent schedules the immutable state transition.
   */
  function handleTextChange(event: React.ChangeEvent<HTMLTextAreaElement>): void {
    onTextChange(event.target.value);
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

      <label
        className="mt-5 block text-sm font-semibold text-slate-800"
        htmlFor="writer-editor-text"
      >
        Writer document text
      </label>
      <textarea
        aria-describedby="writer-editor-help"
        className="mt-2 min-h-40 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-base leading-7 text-slate-950 shadow-sm outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
        id="writer-editor-text"
        onChange={handleTextChange}
        placeholder="Start writing…"
        value={paragraph.text}
      />
      <p className="mt-3 text-sm leading-6 text-slate-600" id="writer-editor-help">
        This workbench edits one plain-text paragraph in memory. Formatting, additional paragraphs,
        save, and file formats are separate features.
      </p>
    </section>
  );
}
