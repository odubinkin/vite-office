/**
 * @fileoverview Renders one document-integrated editable Writer paragraph while leaving document mutation and selection policy to the parent editor.
 */

import type { WriterParagraph } from "../../core/doc/writer";

/** Defines the immutable state and browser callbacks needed by one Writer editable paragraph. */
export interface WriterEditableParagraphProps {
  /** Whether this paragraph is the current target of Writer formatting commands. */
  readonly isActive: boolean;
  /** Whether this paragraph is the final visible Writer body entry. */
  readonly isLast: boolean;
  /** Zero-based body position used only for stable accessibility labels. */
  readonly index: number;
  /** Visible list marker kept outside the editable paragraph text and omitted for non-list paragraphs. */
  readonly listMarker: string | undefined;
  /** Records that the browser focused this paragraph for later command targeting. */
  readonly onFocus: (paragraphId: string) => void;
  /** Delegates native key handling for the stable paragraph identity. */
  readonly onKeyDown: (
    paragraphId: string,
    event: React.KeyboardEvent<HTMLParagraphElement>,
  ) => void;
  /** Delegates pointer-anchor capture to the document editor. */
  readonly onMouseDown: (event: React.MouseEvent<HTMLParagraphElement>) => void;
  /** Delegates browser input to the immutable Writer document owner. */
  readonly onTextInput: (paragraphId: string, event: React.FormEvent<HTMLParagraphElement>) => void;
  /** Immutable serializable paragraph rendered by this editing host. */
  readonly paragraph: WriterParagraph;
  /** Retains or clears the DOM paragraph element for caret restoration. */
  readonly retainElement: (paragraphId: string, element: HTMLParagraphElement | null) => void;
}

/**
 * Renders a semantic contenteditable paragraph without adding controls that do not exist in LibreOffice Writer's document body.
 *
 * @param props - Serialized paragraph state and browser-event callbacks owned by the document editor.
 * @param props.isActive - Whether formatting currently targets the paragraph.
 * @param props.isLast - Whether document spacing follows the paragraph.
 * @param props.index - Zero-based visible body position used for accessible naming.
 * @param props.listMarker - Current visible marker excluded from the editable text and clipboard paragraph payload.
 * @param props.onFocus - Parent callback invoked when the paragraph gains focus.
 * @param props.onKeyDown - Parent callback invoked for native paragraph keys.
 * @param props.onMouseDown - Parent callback invoked to start pointer selection tracking.
 * @param props.onTextInput - Parent callback invoked when editable text changes.
 * @param props.paragraph - Immutable Writer paragraph content and bounded formatting.
 * @param props.retainElement - Parent callback that stores the mounted editable element.
 * @returns One page-integrated editable paragraph with stable Writer DOM attributes.
 */
export function WriterEditableParagraph({
  index,
  isActive,
  isLast,
  listMarker,
  onFocus,
  onKeyDown,
  onMouseDown,
  onTextInput,
  paragraph,
  retainElement,
}: WriterEditableParagraphProps): React.JSX.Element {
  const styleDescriptionId = `writer-paragraph-style-${index + 1}`;
  const label = index === 0 ? "Writer document text" : `Writer paragraph ${index + 1}`;
  const listIndent = listMarker === undefined ? undefined : `${paragraph.list.level * 2}rem`;
  return (
    <div className={isLast ? "" : "mb-4"} data-active={isActive}>
      <span className="sr-only" id={styleDescriptionId}>
        Paragraph style: {paragraph.style === "heading-1" ? "Heading 1" : "Default Paragraph Style"}
        {listMarker === undefined
          ? ""
          : ` Paragraph list: ${paragraph.list.kind === "bullet" ? "Unordered List" : "Ordered List"}.`}
      </span>
      <div
        className={listMarker === undefined ? "" : "flex items-start gap-3"}
        style={{ marginInlineStart: listIndent }}
      >
        {listMarker === undefined ? null : (
          <span
            aria-hidden="true"
            className="w-5 shrink-0 pt-0.5 text-right text-slate-700"
            data-testid={`writer-list-marker-${paragraph.id}`}
            data-writer-list-marker={paragraph.id}
          >
            {listMarker}
          </span>
        )}
        <p
          aria-describedby={styleDescriptionId}
          aria-label={label}
          aria-multiline="true"
          className={`min-h-7 text-slate-950 outline-none ${listMarker === undefined ? "" : "min-w-0 flex-1"} ${
            paragraph.style === "heading-1" ? "text-2xl font-bold leading-9" : "text-base leading-7"
          }`}
          contentEditable
          data-alignment={paragraph.alignment}
          data-list-kind={paragraph.list.kind}
          data-list-level={paragraph.list.level}
          data-list-marker={listMarker}
          data-style={paragraph.style}
          data-writer-paragraph-id={paragraph.id}
          onFocus={
            /** Selects this paragraph for subsequent Writer formatting. @returns Nothing; the parent records paragraph.id. */
            function selectParagraph(): void {
              onFocus(paragraph.id);
            }
          }
          onInput={
            /** Delegates browser input without losing the stable paragraph identity. @param event - Native editable input event. @returns Nothing; the parent schedules document state. */
            function updateParagraph(event: React.FormEvent<HTMLParagraphElement>): void {
              onTextInput(paragraph.id, event);
            }
          }
          onKeyDown={
            /** Delegates native Writer keyboard handling without adding UI-owned behavior. @param event - Native editable keyboard event. @returns Nothing; the parent may prevent the event. */
            function handleWriterParagraphKeyDown(
              event: React.KeyboardEvent<HTMLParagraphElement>,
            ): void {
              onKeyDown(paragraph.id, event);
            }
          }
          onMouseDown={onMouseDown}
          ref={
            /** Retains the mounted element for later caret restoration. @param element - Current mounted paragraph or null after unmount. @returns Nothing; the parent updates its ref map. */
            function retainParagraphElement(element: HTMLParagraphElement | null): void {
              retainElement(paragraph.id, element);
            }
          }
          role="textbox"
          style={{ textAlign: paragraph.alignment }}
          suppressContentEditableWarning
        >
          {paragraph.text}
        </p>
      </div>
    </div>
  );
}
