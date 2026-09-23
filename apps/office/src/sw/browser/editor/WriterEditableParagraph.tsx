/** @fileoverview Projects one canonical Writer paragraph inside the browser editing host. */

import { Fragment, useRef } from "react";

import type {
  WriterParagraphProjection as WriterParagraph,
  WriterProjectedTextRun,
} from "../presentation/writer-view-projection";
import { getWriterParagraphGap } from "./writer-page-pagination";
import type { SwTextFrameSettings } from "../../source/core/text/txtfrm";

/** Immutable projection properties for one Writer text node. */
export interface WriterEditableParagraphProps {
  readonly isActive: boolean;
  readonly index: number;
  readonly listMarker: string | undefined;
  readonly paragraph: WriterParagraph;
  readonly paragraphSpacingSettings?: SwTextFrameSettings | undefined;
  readonly previousParagraph?: WriterParagraph | undefined;
  readonly fragmentEnd?: number;
  readonly fragmentStart?: number;
  readonly topSpacingPt?: number;
  readonly isFollow?: boolean;
  readonly retainElement: (paragraphId: string, element: HTMLParagraphElement | null) => void;
}

/** Renders a paragraph projection that inherits editability from the one document root. @param props - Immutable paragraph projection state. @returns Rendered paragraph projection. */
export function WriterEditableParagraph({
  index,
  isActive,
  listMarker,
  paragraph,
  paragraphSpacingSettings,
  previousParagraph,
  fragmentEnd = paragraph.text.length,
  fragmentStart = 0,
  topSpacingPt,
  isFollow = false,
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
      className="shrink-0"
      data-active={isActive}
      style={{
        marginBlockStart: `${topSpacingPt ?? getWriterParagraphGap(previousParagraph, paragraph, paragraphSpacingSettings)}pt`,
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
        {listMarker !== undefined && isFollow ? (
          <span
            aria-hidden="true"
            className="shrink-0"
            contentEditable={false}
            style={{ width: `${markerWidthPt}pt` }}
          />
        ) : null}
        {listMarker === undefined || isFollow ? null : (
          <span
            aria-hidden="true"
            className="shrink-0 self-start text-slate-700"
            contentEditable={false}
            data-testid={`writer-list-marker-${paragraph.id}`}
            data-writer-list-marker={paragraph.id}
            style={{
              /* v8 ignore next -- Space-follow numbering is imported but not exposed by the current command surface. */
              marginInlineEnd: listLayout?.labelFollowedBy === "space" ? "0.25em" : undefined,
              width: listLayout?.labelFollowedBy === "listtab" ? `${markerWidthPt}pt` : undefined,
              textAlign: "left",
              fontFamily: paragraph.computedStyle.fontFamily,
              fontSize: `${paragraph.computedStyle.fontSizePt}pt`,
              fontStyle: paragraph.computedStyle.fontStyle,
              fontWeight: paragraph.computedStyle.fontWeight,
              lineHeight: paragraph.computedStyle.lineHeight,
            }}
          >
            {listMarker}
          </span>
        )}
        <p
          aria-describedby={styleDescriptionId}
          aria-label={label}
          aria-multiline="true"
          className={`whitespace-pre-wrap text-slate-950 outline-none ${listMarker === undefined ? "" : "min-w-0 flex-1"}`}
          data-alignment={paragraph.alignment}
          data-list-kind={paragraph.list.kind}
          data-list-level={paragraph.list.level}
          data-list-marker={listMarker}
          data-style={paragraph.style}
          data-writer-paragraph-id={paragraph.id}
          data-writer-node-index={paragraph.nodeIndex}
          data-writer-fragment-start={fragmentStart}
          data-writer-fragment-end={fragmentEnd}
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
            minHeight: `${paragraph.computedStyle.fontSizePt * paragraph.computedStyle.lineHeight}pt`,
            marginInlineStart:
              paragraph.list.kind === "none" && paragraph.textLeftMargin > 0
                ? `${paragraph.textLeftMargin / 20}pt`
                : undefined,
            marginInlineEnd: `${paragraph.computedStyle.rightMarginPt}pt`,
            textAlign: paragraph.alignment,
            // SwNumFormat already places a list's first line; applying the
            // paragraph indent here moves its text back into the marker slot.
            textIndent:
              paragraph.list.kind === "none"
                ? `${paragraph.computedStyle.firstLineIndentPt}pt`
                : undefined,
          }}
          tabIndex={-1}
        >
          {paragraph.runs
            .filter(
              /** Keeps runs intersecting this text-frame fragment. @param run - Source run. @returns Whether the run is visible. */
              (run) =>
                run.startOffset < fragmentEnd && run.startOffset + run.text.length > fragmentStart,
            )
            .map(
              /** Projects one canonical text run with a deterministic view key. @param run - Immutable run. @returns Semantic run projection. */ (
                run,
              ) => (
                <Fragment key={getWriterRunProjectionKey(paragraph.id, run)}>
                  <WriterTextRunProjection
                    inheritedBold={paragraph.computedStyle.fontWeight === 700}
                    inheritedItalic={paragraph.computedStyle.fontStyle === "italic"}
                    run={{
                      ...run,
                      text: run.text.slice(
                        Math.max(0, fragmentStart - run.startOffset),
                        Math.min(run.text.length, fragmentEnd - run.startOffset),
                      ),
                    }}
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
