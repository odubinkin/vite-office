/** @fileoverview Projects one canonical Writer paragraph inside the shared editing host. */

import { Fragment, useRef } from "react";

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
  void projectionVersion;
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
        >
          {paragraph.runs.map(
            /** Projects one canonical text run with a deterministic view key. @param run - Immutable run. @param runIndex - Run order. @returns Semantic run projection. */ (
              run,
              runIndex,
            ) => (
              <Fragment key={getWriterRunProjectionKey(paragraph.id, paragraph.runs, runIndex)}>
                <WriterTextRunProjection run={run} />
              </Fragment>
            ),
          )}
        </p>
      </div>
    </div>
  );
}

/** Projects one immutable Writer run through semantic browser elements. @param props - Canonical run. @returns React-owned run subtree. */
function WriterTextRunProjection({ run }: Readonly<{ run: WriterTextRun }>): React.ReactNode {
  let content: React.ReactNode = run.text;
  if (run.attributes.underline)
    content = <span style={{ textDecoration: "underline" }}>{content}</span>;
  if (run.attributes.fontFamily !== undefined)
    content = <span style={{ fontFamily: run.attributes.fontFamily }}>{content}</span>;
  if (run.attributes.italic) content = <em>{content}</em>;
  if (run.attributes.bold) content = <strong>{content}</strong>;
  if (run.hyperlink !== undefined)
    content = (
      <a
        data-writer-hyperlink={run.hyperlink.url}
        href={run.hyperlink.url}
        rel="noopener noreferrer"
        {...(run.hyperlink.targetFrame === undefined ? {} : { target: run.hyperlink.targetFrame })}
      >
        {content}
      </a>
    );
  return content;
}

/** Builds a deterministic view-only key from the run boundary and semantic state. @param paragraphId - Stable text-node identity. @param runs - Canonical paragraph runs. @param index - Current run index. @returns Stable projection key. */
function getWriterRunProjectionKey(
  paragraphId: string,
  runs: readonly WriterTextRun[],
  index: number,
): string {
  let offset = 0;
  for (const run of runs.slice(0, index)) offset += run.text.length;
  const run = runs[index] as WriterTextRun;
  const attributes = run.attributes;
  return `${paragraphId}:${offset}:${attributes.bold ? 1 : 0}${attributes.italic ? 1 : 0}${attributes.underline ? 1 : 0}:${attributes.fontFamily ?? ""}:${run.hyperlink?.url ?? ""}:${run.hyperlink?.targetFrame ?? ""}`;
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
