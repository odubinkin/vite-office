/** @fileoverview Projects one canonical Writer paragraph inside the browser editing host. */
import { WriterInlineGraphic } from "./WriterFloatingGraphic";
import { WriterCharacterGeometryText } from "./WriterCharacterGeometryText";
import { EscapementText } from "./EscapementText";

import { SvxCaseMap } from "../../../editeng/inc/svxenum";
import { browserCaseStyle, getTitleCaseParts } from "../presentation/writer-case-effects";
import { FontItalic, FontWeight } from "../../../tools/inc/fontenum";

import { StrikeoutText } from "../../../vcl/browser/strikeout-text";
import { Fragment, useLayoutEffect, useRef } from "react";
import { resolveSwNumberingTabPosition } from "../../source/core/text/txttab";
import {
  browserFontPaint,
  browserTextDecoration,
  browserTextEmphasis,
} from "../presentation/writer-font-paint";
import { splitWordLineText } from "../presentation/writer-view-projection";
import { browserFontFamily } from "./writer-font-family";
import { FontLineStyle } from "../../../editeng/source/items/textitem";

import type {
  WriterParagraphProjection as WriterParagraph,
  WriterTextLineProjection,
  WriterTextPortion,
} from "../presentation/writer-view-projection";

/** Immutable projection properties for one Writer text node. */
export interface WriterEditableParagraphProps {
  readonly cellPosition?: Readonly<{ rowIndex: number; cellIndex: number; paragraphIndex: number }>;
  readonly isActive: boolean;
  readonly readOnly?: boolean;
  readonly index: number;
  readonly listMarker: string | undefined;
  readonly paragraph: WriterParagraph;
  readonly fragmentEnd?: number;
  readonly fragmentStart?: number;
  readonly topSpacingPt?: number;
  readonly isFollow?: boolean;
  readonly lineNumbers?: readonly Readonly<{ number: number; topPt: number }>[];
  readonly retainElement: (paragraphId: string, element: HTMLParagraphElement | null) => void;
}

/** Renders a paragraph projection that inherits editability from the one document root. @param props - Immutable paragraph projection state. @returns Rendered paragraph projection. */
export function WriterEditableParagraph({
  index,
  readOnly = false,
  cellPosition,
  isActive,
  listMarker,
  paragraph,
  fragmentEnd = paragraph.text.length,
  fragmentStart = 0,
  topSpacingPt,
  isFollow = false,
  lineNumbers,
  retainElement,
}: WriterEditableParagraphProps): React.JSX.Element {
  const paragraphElement = useRef<HTMLParagraphElement | null>(null);
  const labelElement = useRef<HTMLSpanElement | null>(null);
  const label =
    cellPosition === undefined
      ? index === 0
        ? "Writer document text"
        : `Writer paragraph ${index + 1}`
      : `Row ${cellPosition.rowIndex + 1} column ${cellPosition.cellIndex + 1} paragraph ${cellPosition.paragraphIndex + 1}`;
  const listLayout = paragraph.listLayout;
  const markerFont = paragraph.listMarkerFont;
  let markerContent: React.ReactNode = listMarker;
  if (markerFont?.strikeout !== undefined)
    markerContent = <StrikeoutText value={markerFont.strikeout}>{markerContent}</StrikeoutText>;
  if (markerFont?.escapement !== undefined)
    markerContent = <EscapementText value={markerFont.escapement}>{markerContent}</EscapementText>;
  const markerStartPt =
    listLayout === undefined ? 0 : listLayout.indentAtPt + listLayout.firstLineIndentPt;
  const contentStartPt =
    listLayout?.labelFollowedBy === "listtab"
      ? listLayout.listTabPositionPt
      : (listLayout?.indentAtPt ?? 0);
  const markerWidthPt = Math.max(0, contentStartPt - markerStartPt);
  useLayoutEffect(
    /** Measures glyph advance in the browser device before applying native strict-after-label tab lookup. @returns Font/geometry subscription cleanup or nothing for unmeasured/legacy/follow frames. */
    () => {
      const glyph = labelElement.current;
      const settings = paragraph.listTabSettings;
      if (glyph === null) return;
      const label = glyph.parentElement as HTMLElement;
      label.style.width = listLayout?.labelFollowedBy === "listtab" ? `${markerWidthPt}pt` : "";
      if (settings === undefined || listLayout === undefined) return;
      let active = true;
      const measure =
        /** Converts actual glyph advance to native twips without retaining mutable model state. @returns Nothing. */ (): void => {
          if (!active) return;
          const width = glyph.getBoundingClientRect().width;
          if (width <= 0) return;
          // Device rectangles include page transforms; computed widths retain CSS layout units.
          const layoutWidth = Number.parseFloat(getComputedStyle(label).width);
          const scale = layoutWidth > 0 ? label.getBoundingClientRect().width / layoutWidth : 1;
          const advance = Math.round((width / scale) * 15);
          const start = markerStartPt * 20;
          const next = resolveSwNumberingTabPosition(
            start + advance,
            listLayout.indentAtPt * 20,
            contentStartPt * 20,
            settings,
          );
          label.style.width = `${Math.max(advance, next - start) / 20}pt`;
        };
      measure();
      const observer =
        typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
      observer?.observe(glyph);
      const fonts = glyph.ownerDocument.fonts;
      void fonts?.ready.then(measure);
      fonts?.addEventListener("loadingdone", measure);
      globalThis.addEventListener("resize", measure);
      return /** Stops measurements after this immutable projection is released. @returns Nothing. */ () => {
        active = false;
        observer?.disconnect();
        fonts?.removeEventListener("loadingdone", measure);
        globalThis.removeEventListener("resize", measure);
      };
    },
    [paragraph, isFollow, markerStartPt, contentStartPt, markerWidthPt, listLayout],
  );
  // DrawText maps the complete paragraph first, then starts a new case scan for an expanding snippet.
  const expandingTitleCase =
    paragraph.runs.some(
      /** Checks whether any run uses title case. @param run - Native portion. @returns Whether title casing participates. */
      (run) => run.attributes.caseMap === SvxCaseMap.Capitalize,
    ) &&
    getTitleCaseParts(paragraph.text, undefined).some(
      /** Checks the width-changing uppercase mapping before drawing a fragment. @param part - Case portion. @returns Whether the number of code units changes. */
      (part) => part.uppercase && part.text.toUpperCase().length !== part.text.length,
    );
  return (
    <div
      className="relative shrink-0"
      data-active={isActive}
      style={{
        backgroundColor: paragraph.computedStyle.backgroundColor,
        marginBlockStart: `${topSpacingPt ?? (cellPosition === undefined ? 0 : paragraph.computedStyle.upperSpacingPt)}pt`,
        marginBlockEnd:
          cellPosition === undefined ? undefined : `${paragraph.computedStyle.lowerSpacingPt}pt`,
      }}
    >
      {lineNumbers?.map(
        /** Handles Writer formatting state. @param entry - Input value. @returns Callback result. */ (
          entry,
        ) => (
          <span
            aria-hidden="true"
            className="absolute -left-10 w-8 text-right text-xs text-slate-400"
            contentEditable={false}
            key={entry.number}
            style={{ top: `${entry.topPt}pt` }}
          >
            {entry.number}
          </span>
        ),
      )}
      <div
        className={listMarker === undefined ? "" : "flex items-start"}
        style={{
          marginInlineStart: listMarker === undefined ? undefined : `${markerStartPt}pt`,
          caretColor: paragraph.inFrontOfLabel ? "transparent" : undefined,
        }}
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
              position: "relative",
              backgroundColor: paragraph.listMarkerBackgroundColor,
              marginInlineEnd: listLayout?.labelFollowedBy === "space" ? "0.25em" : undefined,
              width: listLayout?.labelFollowedBy === "listtab" ? `${markerWidthPt}pt` : undefined,
              // SwNumberPortion::Format never reserves less than the measured
              // label plus its native minimum distance, even at a narrow tab.
              minWidth: "max-content",
              paddingInlineEnd: `${paragraph.listMarkerMinimumDistancePt ?? 0}pt`,
              textAlign: "left",
              fontFamily: browserFontFamily(
                markerFont?.familyName ?? paragraph.computedStyle.fontFamily,
                markerFont === undefined
                  ? paragraph.computedStyle.fontFamilyGeneric
                  : markerFont.genericFamily,
              ),
              fontSize: `${markerFont === undefined ? paragraph.computedStyle.fontSizePt : markerFont.heightTwips / 20}pt`,
              fontStyle:
                markerFont === undefined
                  ? paragraph.computedStyle.fontStyle
                  : markerFont.posture === FontItalic.ITALIC_OBLIQUE
                    ? "oblique"
                    : markerFont.posture === FontItalic.ITALIC_NORMAL
                      ? "italic"
                      : "normal",
              fontWeight:
                markerFont === undefined
                  ? paragraph.computedStyle.fontWeight
                  : markerFont.weight >= FontWeight.WEIGHT_BOLD
                    ? 700
                    : 400,
              textDecorationLine:
                markerFont === undefined || markerFont.underline === FontLineStyle.LINESTYLE_NONE
                  ? undefined
                  : "underline",
              color:
                markerFont === undefined
                  ? undefined
                  : markerFont.color === "auto"
                    ? "initial"
                    : markerFont.color,
              lineHeight: paragraph.computedStyle.lineHeight,
            }}
          >
            {paragraph.inFrontOfLabel ? (
              <span
                data-writer-label-caret={paragraph.id}
                style={{
                  position: "absolute",
                  insetInlineStart: 0,
                  top: "0.15em",
                  height: "1em",
                  borderInlineStart: "1px solid currentColor",
                  pointerEvents: "none",
                }}
              />
            ) : null}
            <span ref={labelElement} data-writer-list-label>
              {markerContent}
            </span>
          </span>
        )}
        <p
          aria-label={readOnly ? undefined : label}
          aria-multiline={readOnly ? undefined : "true"}
          data-writer-table-cell={
            cellPosition === undefined
              ? undefined
              : `${cellPosition.rowIndex}:${cellPosition.cellIndex}`
          }
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
          role={readOnly ? undefined : "textbox"}
          style={{
            caretColor: paragraph.inFrontOfLabel ? "transparent" : undefined,
            whiteSpace: cellPosition === undefined ? undefined : "pre-wrap",
            overflowWrap: cellPosition === undefined ? undefined : "break-word",
            backgroundColor:
              paragraph.computedStyle.highlight === "transparent"
                ? undefined
                : paragraph.computedStyle.highlight,
            color:
              paragraph.computedStyle.color === "auto" ? undefined : paragraph.computedStyle.color,
            fontFamily: browserFontFamily(
              paragraph.computedStyle.fontFamily,
              paragraph.computedStyle.fontFamilyGeneric,
            ),
            fontSize: `${paragraph.computedStyle.fontSizePt}pt`,
            fontKerning: paragraph.computedStyle.autoKerning === true ? "normal" : "none",
            fontOpticalSizing: paragraph.computedStyle.opticalSizing === true ? "auto" : "none",
            hyphenateLimitChars: paragraph.computedStyle.hyphenationLimits,
            hyphens: paragraph.computedStyle.autoHyphenation === true ? "auto" : "manual",
            fontStyle: paragraph.computedStyle.fontStyle,
            fontWeight: paragraph.computedStyle.fontWeight,
            lineHeight: paragraph.computedStyle.lineHeight,
            minHeight: `${paragraph.computedStyle.fontSizePt * paragraph.computedStyle.lineHeight}pt`,
            marginInlineStart:
              paragraph.uncountedListTextLeftPt !== undefined
                ? `${paragraph.uncountedListTextLeftPt}pt`
                : paragraph.list.kind === "none" && paragraph.textLeftMargin > 0
                  ? `${paragraph.textLeftMargin / 20}pt`
                  : undefined,
            marginInlineEnd: `${paragraph.computedStyle.rightMarginPt}pt`,
            textAlign: paragraph.computedStyle.logicalAlignment ?? paragraph.alignment,
            textAlignLast:
              paragraph.computedStyle.lastLineAlignment === undefined
                ? undefined
                : fragmentEnd === paragraph.text.length
                  ? paragraph.computedStyle.lastLineAlignment
                  : "justify",
            // SwNumFormat already places a list's first line; applying the
            // paragraph indent here moves its text back into the marker slot.
            textIndent:
              paragraph.uncountedListTextLeftPt !== undefined
                ? "0pt"
                : paragraph.list.kind === "none"
                  ? `${isFollow ? 0 : (paragraph.computedStyle.resolvedFirstLineIndentPt ?? paragraph.computedStyle.firstLineIndentPt)}pt`
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
              /** Projects one canonical text run with a deterministic view key.
               * @param run - Immutable run.
               * @param index - Run index in the visible fragment.
               * @param runs - Runs intersecting the visible fragment.
               * @returns Semantic run projection.
               */ (run, index, runs) => (
                <Fragment key={getWriterPortionProjectionKey(paragraph.id, run)}>
                  <WriterTextPortionProjection
                    inheritedBold={paragraph.computedStyle.fontWeight === 700}
                    inheritedFontFamily={paragraph.computedStyle.fontFamily}
                    inheritedItalic={paragraph.computedStyle.fontStyle === "italic"}
                    precedingCharacter={
                      expandingTitleCase
                        ? undefined
                        : paragraph.text[Math.max(fragmentStart, run.startOffset) - 1]
                    }
                    joinLeftBorder={index > 0 && run.attributes.joinsPreviousCharacterBox === true}
                    joinRightBorder={runs[index + 1]?.attributes.joinsPreviousCharacterBox === true}
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
          {cellPosition !== undefined && paragraph.text.length === 0 ? <br /> : null}
        </p>
      </div>
    </div>
  );
}

/** Paints one selected decoration independently from the other line. @param line - Decoration position. @param value - Native line projection. @param content - Existing text portion. @returns Platform decoration. */
function paintTextLine(
  line: "underline" | "overline",
  value: WriterTextLineProjection,
  content: React.ReactNode,
): React.ReactNode {
  return <span style={browserTextDecoration(line, value)}>{content}</span>;
}

/** Paints independently authored underline and overline styles. @param attributes - Source portion attributes. @param content - Text or previously decorated content. @returns Decorated text. */
function paintWriterLines(
  attributes: WriterTextPortion["attributes"],
  content: React.ReactNode,
): React.ReactNode {
  if (attributes.underlineLine !== undefined)
    content = paintTextLine("underline", attributes.underlineLine, content);
  else if (attributes.underline)
    content = <span style={{ textDecoration: "underline" }}>{content}</span>;
  if (attributes.overlineLine !== undefined)
    content = paintTextLine("overline", attributes.overlineLine, content);
  return content;
}

/** Renders the original text with uppercase paint on native title-case initials. @param mode - Effective case effect. @param value - Original text. @param preceding - Previous character in the source paragraph. @returns Original text and paint wrappers. */
function renderCaseText(
  mode: SvxCaseMap | undefined,
  value: string,
  preceding: string | undefined,
): React.ReactNode {
  if (mode !== SvxCaseMap.Capitalize) return value;
  return getTitleCaseParts(value, preceding).map(
    /** Applies uppercase to a selected original unit. @param part - Paint portion. @param index - Portion index. @returns Original text with optional CSS. */
    (part, index) =>
      part.uppercase ? (
        <span key={index} style={{ textTransform: "uppercase" }}>
          {part.text}
        </span>
      ) : (
        part.text
      ),
  );
}

/** Projects one immutable Writer run through semantic browser elements. @param props - Canonical run and inherited paragraph flags. @returns React-owned run subtree. */
export function WriterTextPortionProjection({
  inheritedBold,
  inheritedFontFamily,
  inheritedItalic,
  precedingCharacter,
  joinLeftBorder = false,
  joinRightBorder = false,
  run,
}: Readonly<{
  inheritedBold: boolean;
  inheritedFontFamily: string | undefined;
  inheritedItalic: boolean;
  precedingCharacter?: string | undefined;
  joinLeftBorder?: boolean;
  joinRightBorder?: boolean;
  run: Pick<WriterTextPortion, "text" | "attributes" | "hyperlink" | "inlineGraphic">;
}>): React.ReactNode {
  let content: React.ReactNode = run.inlineGraphic ? (
    <WriterInlineGraphic value={run.inlineGraphic} marker={run.text} />
  ) : (
    renderCaseText(run.attributes.caseMap, run.text, precedingCharacter)
  );
  const { attributes } = run;
  const rotation = run.inlineGraphic === undefined ? (attributes.rotation ?? 0) : 0;
  const scaleWidth = run.inlineGraphic === undefined ? (attributes.scaleWidth ?? 100) : 100;
  const wordLines =
    run.inlineGraphic === undefined &&
    attributes.wordLineMode &&
    (attributes.underline ||
      attributes.overlineLine !== undefined ||
      Boolean(attributes.strikeout));
  if (wordLines) {
    let offset = 0;
    content = splitWordLineText(run.text).map(
      /** Paints nonspacing fragments without duplicating model text. @param part - Original text fragment. @param index - Fragment index. @returns Decorated word or untouched spacing. */
      (part, index) => {
        const preceding = offset === 0 ? precedingCharacter : run.text[offset - 1];
        offset += part.length;
        if (index % 2 !== 0 || part === "") return part;
        const text = renderCaseText(attributes.caseMap, part, preceding);
        const word =
          attributes.strikeout === undefined ? (
            text
          ) : (
            <StrikeoutText value={attributes.strikeout}>{text}</StrikeoutText>
          );
        const lines = paintWriterLines(attributes, word);
        if (scaleWidth !== 100 && rotation === 0)
          return (
            <WriterCharacterGeometryText key={index} rotation={0} scaleWidth={scaleWidth}>
              {lines}
            </WriterCharacterGeometryText>
          );
        return <Fragment key={index}>{lines}</Fragment>;
      },
    );
  }
  if (rotation !== 0) {
    content = (
      <WriterCharacterGeometryText rotation={rotation} scaleWidth={scaleWidth}>
        {content}
      </WriterCharacterGeometryText>
    );
  } else if (scaleWidth !== 100 && !wordLines) {
    let offset = 0;
    content = run.text.split(/([\r\n\t]+| +)/u).map(
      /** Keeps whitespace and the text's original offsets between scaled word advances. @param part - Original source segment. @param index - Stable segment index. @returns Scaled inline text or mandatory break controls. */
      (part, index) => {
        const preceding = offset === 0 ? precedingCharacter : run.text[offset - 1];
        offset += part.length;
        if (part === "" || /[\r\n\t]/u.test(part)) return part;
        return (
          <WriterCharacterGeometryText key={index} rotation={0} scaleWidth={scaleWidth}>
            {renderCaseText(attributes.caseMap, part, preceding)}
          </WriterCharacterGeometryText>
        );
      },
    );
  }
  if (!wordLines && attributes.strikeout !== undefined)
    content = <StrikeoutText value={attributes.strikeout}>{content}</StrikeoutText>;
  if (run.attributes.escapement !== undefined)
    content = <EscapementText value={run.attributes.escapement}>{content}</EscapementText>;
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
  const emphasis = browserTextEmphasis(run.attributes.emphasisMark);
  if (emphasis !== undefined) content = <span style={emphasis}>{content}</span>;
  if (!wordLines) content = paintWriterLines(attributes, content);
  const caseStyle =
    run.inlineGraphic === undefined ? browserCaseStyle(attributes.caseMap) : undefined;
  if (caseStyle !== undefined) content = <span style={caseStyle}>{content}</span>;
  const effect = browserFontPaint(attributes, attributes.color);
  if (effect !== undefined && run.inlineGraphic === undefined)
    content = <span style={effect}>{content}</span>;
  if (run.attributes.color !== undefined)
    content = (
      <span style={{ color: run.attributes.color === "auto" ? "initial" : run.attributes.color }}>
        {content}
      </span>
    );
  if (run.attributes.fontSizeTwips !== undefined)
    content = <span style={{ fontSize: `${run.attributes.fontSizeTwips / 20}pt` }}>{content}</span>;
  const { autoKerning, kerningTwips, opticalSizing, noHyphenation, language } = run.attributes;
  if (
    autoKerning !== undefined ||
    kerningTwips !== undefined ||
    opticalSizing !== undefined ||
    noHyphenation ||
    language
  )
    content = (
      <span
        lang={language}
        style={{
          hyphens: noHyphenation ? "manual" : undefined,
          fontOpticalSizing:
            opticalSizing === undefined ? undefined : opticalSizing ? "auto" : "none",
          fontKerning: autoKerning === undefined ? undefined : autoKerning ? "normal" : "none",
          letterSpacing: kerningTwips === undefined ? undefined : `${kerningTwips / 20}pt`,
        }}
      >
        {content}
      </span>
    );
  const runFamily = run.attributes.fontFamily ?? inheritedFontFamily;
  if (run.attributes.fontFamily !== undefined)
    content = (
      <span style={{ fontFamily: browserFontFamily(runFamily, run.attributes.fontFamilyGeneric) }}>
        {content}
      </span>
    );
  if (run.attributes.italic) content = <em>{content}</em>;
  else if (inheritedItalic) content = <span style={{ fontStyle: "normal" }}>{content}</span>;
  if (run.attributes.bold) content = <strong>{content}</strong>;
  else if (inheritedBold) content = <span style={{ fontWeight: 400 }}>{content}</span>;
  const box = run.attributes.characterBox;
  if (box !== undefined)
    content = (
      <span
        style={{
          borderTop: box.Top.line,
          borderBottom: box.Bottom.line,
          borderLeft: joinLeftBorder ? "none" : box.Left.line,
          borderRight: joinRightBorder ? "none" : box.Right.line,
          paddingTop: `${box.Top.padding}pt`,
          paddingBottom: `${box.Bottom.padding}pt`,
          paddingLeft: joinLeftBorder ? 0 : `${box.Left.padding}pt`,
          paddingRight: joinRightBorder ? 0 : `${box.Right.padding}pt`,
          boxDecorationBreak: "clone",
          WebkitBoxDecorationBreak: "clone",
        }}
      >
        {content}
      </span>
    );
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
function getWriterPortionProjectionKey(paragraphId: string, run: WriterTextPortion): string {
  const attributes = run.attributes;
  return `${paragraphId}:${run.startOffset}:${attributes.bold ? 1 : 0}${attributes.italic ? 1 : 0}${attributes.underline ? 1 : 0}:${attributes.strikeout ?? 0}:${attributes.escapement?.offset ?? 0}/${attributes.escapement?.height ?? 100}:${attributes.color ?? ""}:${attributes.highlight ?? ""}:${attributes.fontFamily ?? ""}:${attributes.fontFamilyGeneric ?? ""}:${attributes.fontSizeTwips ?? ""}:${attributes.kerningTwips ?? ""}:${JSON.stringify(attributes.characterBox) ?? ""}:${run.hyperlink?.url ?? ""}:${run.hyperlink?.targetFrame ?? ""}`;
}
