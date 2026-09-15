/** @fileoverview Projects one canonical Writer paragraph inside the shared editing host. */

import { useLayoutEffect, useRef } from "react";

import type { WriterTextRun } from "../../core/txtnode/ndtxt";
import type { WriterParagraphProjection as WriterParagraph } from "../../../browser/presentation/writer-view-projection";

/** Immutable projection properties for one Writer text node. */
export interface WriterEditableParagraphProps {
  readonly isActive: boolean;
  readonly isLast: boolean;
  readonly index: number;
  readonly listMarker: string | undefined;
  readonly paragraph: WriterParagraph;
  readonly projectionVersion: number;
  readonly retainElement: (paragraphId: string, element: HTMLParagraphElement | null) => void;
}

/** Renders a paragraph projection that inherits editability from the one document root. @param props - Immutable paragraph projection state. @returns Rendered paragraph projection. */
export function WriterEditableParagraph({
  index,
  isActive,
  isLast,
  listMarker,
  paragraph,
  projectionVersion,
  retainElement,
}: WriterEditableParagraphProps): React.JSX.Element {
  const paragraphElement = useRef<HTMLParagraphElement | null>(null);
  const styleDescriptionId = `writer-paragraph-style-${index + 1}`;
  const label = index === 0 ? "Writer document text" : `Writer paragraph ${index + 1}`;
  const listIndent = listMarker === undefined ? undefined : `${paragraph.list.level * 2}rem`;
  useLayoutEffect(
    /** Reprojects canonical runs after accepted commands or guarded fallback. @returns Nothing. */
    function synchronizeEditableContent(): void {
      /* c8 ignore next -- React assigns the paragraph ref before running its layout effect. */
      if (paragraphElement.current !== null)
        synchronizeWriterParagraphContent(paragraphElement.current, paragraph.runs);
    },
    [paragraph.runs, projectionVersion],
  );
  return (
    <div className={isLast ? "" : "mb-4"} data-active={isActive}>
      <span className="sr-only" id={styleDescriptionId} contentEditable={false}>
        Paragraph style: {paragraph.styleDisplayName}
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
            contentEditable={false}
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
          className={`min-h-7 whitespace-pre-wrap text-slate-950 outline-none ${listMarker === undefined ? "" : "min-w-0 flex-1"} ${getParagraphStyleClass(paragraph.style)}`}
          data-alignment={paragraph.alignment}
          data-list-kind={paragraph.list.kind}
          data-list-level={paragraph.list.level}
          data-list-marker={listMarker}
          data-style={paragraph.style}
          data-writer-paragraph-id={paragraph.id}
          ref={
            /** Retains the mounted paragraph projection. @param element - Mounted paragraph or null. @returns Nothing. */ (
              element,
            ) => {
              paragraphElement.current = element;
              retainElement(paragraph.id, element);
            }
          }
          role="textbox"
          style={{
            fontFamily: paragraph.runs[0]?.attributes.fontFamily,
            textAlign: paragraph.alignment,
          }}
          tabIndex={-1}
        />
      </div>
    </div>
  );
}

/** Projects canonical direct-format runs without making React the editor mutation owner. @param paragraph - Paragraph projection. @param runs - Canonical Writer runs. @returns Nothing. */
function synchronizeWriterParagraphContent(
  paragraph: HTMLParagraphElement,
  runs: readonly WriterTextRun[],
): void {
  const expected = paragraph.ownerDocument.createElement("p");
  for (const run of runs) {
    let content: Node = paragraph.ownerDocument.createTextNode(run.text);
    if (run.attributes.underline) {
      const underline = paragraph.ownerDocument.createElement("span");
      underline.style.textDecoration = "underline";
      underline.append(content);
      content = underline;
    }
    if (run.attributes.fontFamily !== undefined) {
      const font = paragraph.ownerDocument.createElement("span");
      font.style.fontFamily = run.attributes.fontFamily;
      font.append(content);
      content = font;
    }
    if (run.attributes.italic) {
      const italic = paragraph.ownerDocument.createElement("em");
      italic.append(content);
      content = italic;
    }
    if (run.attributes.bold) {
      const bold = paragraph.ownerDocument.createElement("strong");
      bold.append(content);
      content = bold;
    }
    if (run.hyperlink !== undefined) {
      const hyperlink = paragraph.ownerDocument.createElement("a");
      hyperlink.href = run.hyperlink.url;
      hyperlink.dataset.writerHyperlink = run.hyperlink.url;
      hyperlink.rel = "noopener noreferrer";
      if (run.hyperlink.targetFrame !== undefined) hyperlink.target = run.hyperlink.targetFrame;
      hyperlink.append(content);
      content = hyperlink;
    }
    expected.append(content);
  }
  if (paragraph.innerHTML !== expected.innerHTML) paragraph.replaceChildren(...expected.childNodes);
}

/** Maps visible built-ins. @param style - Style identity. @returns CSS classes. */
function getParagraphStyleClass(style: string): string {
  if (style === "title") return "text-3xl font-bold leading-10 text-center";
  if (style === "subtitle") return "text-xl italic leading-8 text-center";
  const heading = /^heading-(\d+)$/.exec(style);
  if (heading !== null) {
    const level = Number(heading[1]);
    return level <= 2
      ? "text-2xl font-bold leading-9"
      : level <= 4
        ? "text-xl font-bold leading-8"
        : "text-lg font-semibold leading-7";
  }
  if (style === "heading" || style.endsWith("-heading")) return "text-xl font-bold leading-8";
  if (style === "preformatted-text") return "font-mono text-sm leading-6";
  if (style === "quotations") return "italic ms-8 text-base leading-7";
  if (style === "caption" || ["illustration", "table", "text", "figure", "drawing"].includes(style))
    return "text-sm italic leading-6";
  if (style === "footnote" || style === "endnote" || style === "comment")
    return "text-sm leading-6";
  return "text-base leading-7";
}
