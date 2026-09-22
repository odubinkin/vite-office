/** @fileoverview Projects one canonical Writer paragraph inside the browser editing host. */

import { Fragment, useRef } from "react";

import type {
  WriterParagraphProjection as WriterParagraph,
  WriterProjectedTextRun,
} from "../presentation/writer-view-projection";

/** Immutable projection properties for one Writer text node. */
export interface WriterEditableParagraphProps {
  readonly isActive: boolean;
  readonly isLast: boolean;
  readonly index: number;
  readonly listMarker: string | undefined;
  readonly paragraph: WriterParagraph;
  readonly retainElement: (paragraphId: string, element: HTMLParagraphElement | null) => void;
}

/** Renders a paragraph projection that inherits editability from the one document root. @param props - Immutable paragraph projection state. @returns Rendered paragraph projection. */
export function WriterEditableParagraph({
  index,
  isActive,
  isLast,
  listMarker,
  paragraph,
  retainElement,
}: WriterEditableParagraphProps): React.JSX.Element {
  const paragraphElement = useRef<HTMLParagraphElement | null>(null);
  const styleDescriptionId = `writer-paragraph-style-${index + 1}`;
  const label = index === 0 ? "Writer document text" : `Writer paragraph ${index + 1}`;
  const listLayout = paragraph.listLayout;
  const markerStartPt =
    listLayout === undefined ? 0 : listLayout.indentAtPt + listLayout.firstLineIndentPt;
  const contentStartPt =
    listLayout?.labelFollowedBy === "listtab"
      ? listLayout.listTabPositionPt
      : (listLayout?.indentAtPt ?? 0);
  const markerWidthPt = Math.max(0, contentStartPt - markerStartPt);
  return (
    <div
      data-active={isActive}
      style={{
        marginBlockEnd: isLast ? undefined : `${paragraph.computedStyle.lowerSpacingPt}pt`,
        marginBlockStart: `${paragraph.computedStyle.upperSpacingPt}pt`,
      }}
    >
      <span className="sr-only" id={styleDescriptionId} contentEditable={false}>
        Paragraph style: {paragraph.styleDisplayName}
        {listMarker === undefined
          ? ""
          : ` Paragraph list: ${paragraph.list.kind === "bullet" ? "Unordered List" : "Ordered List"}.`}
      </span>
      <div
        className={listMarker === undefined ? "" : "flex items-start"}
        style={{ marginInlineStart: listMarker === undefined ? undefined : `${markerStartPt}pt` }}
      >
        {listMarker === undefined ? null : (
          <span
            aria-hidden="true"
            className="shrink-0 pt-0.5 text-right text-slate-700"
            contentEditable={false}
            data-testid={`writer-list-marker-${paragraph.id}`}
            data-writer-list-marker={paragraph.id}
            style={{
              /* v8 ignore next -- Space-follow numbering is imported but not exposed by the current command surface. */
              marginInlineEnd: listLayout?.labelFollowedBy === "space" ? "0.25em" : undefined,
              width: `${markerWidthPt}pt`,
            }}
          >
            {listMarker}
          </span>
        )}
        <p
          aria-describedby={styleDescriptionId}
          aria-label={label}
          aria-multiline="true"
          className={`min-h-7 whitespace-pre-wrap text-slate-950 outline-none ${listMarker === undefined ? "" : "min-w-0 flex-1"}`}
          data-alignment={paragraph.alignment}
          data-list-kind={paragraph.list.kind}
          data-list-level={paragraph.list.level}
          data-list-marker={listMarker}
          data-style={paragraph.style}
          data-writer-paragraph-id={paragraph.id}
          data-writer-node-index={paragraph.nodeIndex}
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
            backgroundColor:
              paragraph.computedStyle.highlight === "transparent"
                ? undefined
                : paragraph.computedStyle.highlight,
            color:
              paragraph.computedStyle.color === "auto" ? undefined : paragraph.computedStyle.color,
            fontFamily: paragraph.computedStyle.fontFamily,
            fontSize: `${paragraph.computedStyle.fontSizePt}pt`,
            fontStyle: paragraph.computedStyle.fontStyle,
            fontWeight: paragraph.computedStyle.fontWeight,
            lineHeight: paragraph.computedStyle.lineHeight,
            marginInlineStart:
              paragraph.list.kind === "none" && paragraph.textLeftMargin > 0
                ? `${paragraph.textLeftMargin / 20}pt`
                : undefined,
            marginInlineEnd: `${paragraph.computedStyle.rightMarginPt}pt`,
            textAlign: paragraph.alignment,
            textIndent: `${paragraph.computedStyle.firstLineIndentPt}pt`,
          }}
          tabIndex={-1}
        >
          {paragraph.runs.map(
            /** Projects one canonical text run with a deterministic view key. @param run - Immutable run. @returns Semantic run projection. */ (
              run,
            ) => (
              <Fragment key={getWriterRunProjectionKey(paragraph.id, run)}>
                <WriterTextRunProjection
                  inheritedBold={paragraph.computedStyle.fontWeight === 700}
                  inheritedItalic={paragraph.computedStyle.fontStyle === "italic"}
                  run={run}
                />
              </Fragment>
            ),
          )}
        </p>
      </div>
    </div>
  );
}

/** Projects one immutable Writer run through semantic browser elements. @param props - Canonical run and inherited paragraph flags. @returns React-owned run subtree. */
function WriterTextRunProjection({
  inheritedBold,
  inheritedItalic,
  run,
}: Readonly<{
  inheritedBold: boolean;
  inheritedItalic: boolean;
  run: WriterProjectedTextRun;
}>): React.ReactNode {
  let content: React.ReactNode = run.text;
  if (run.attributes.highlight !== undefined)
    content = (
      <span
        style={{
          backgroundColor:
            run.attributes.highlight === "transparent" ? "transparent" : run.attributes.highlight,
        }}
      >
        {content}
      </span>
    );
  if (run.attributes.color !== undefined)
    content = (
      <span style={{ color: run.attributes.color === "auto" ? "initial" : run.attributes.color }}>
        {content}
      </span>
    );
  if (run.attributes.underline)
    content = <span style={{ textDecoration: "underline" }}>{content}</span>;
  if (run.attributes.fontSizeTwips !== undefined)
    content = <span style={{ fontSize: `${run.attributes.fontSizeTwips / 20}pt` }}>{content}</span>;
  if (run.attributes.fontFamily !== undefined)
    content = <span style={{ fontFamily: run.attributes.fontFamily }}>{content}</span>;
  if (run.attributes.italic) content = <em>{content}</em>;
  else if (inheritedItalic) content = <span style={{ fontStyle: "normal" }}>{content}</span>;
  if (run.attributes.bold) content = <strong>{content}</strong>;
  else if (inheritedBold) content = <span style={{ fontWeight: 400 }}>{content}</span>;
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

/** Builds a deterministic view-only key from the projected run boundary and semantic state. @param paragraphId - Stable text-node identity. @param run - Projected run. @returns Stable projection key. */
function getWriterRunProjectionKey(paragraphId: string, run: WriterProjectedTextRun): string {
  const attributes = run.attributes;
  return `${paragraphId}:${run.startOffset}:${attributes.bold ? 1 : 0}${attributes.italic ? 1 : 0}${attributes.underline ? 1 : 0}:${attributes.color ?? ""}:${attributes.highlight ?? ""}:${attributes.fontFamily ?? ""}:${attributes.fontSizeTwips ?? ""}:${run.hyperlink?.url ?? ""}:${run.hyperlink?.targetFrame ?? ""}`;
}
