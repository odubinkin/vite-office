/**
 * @fileoverview Prepares a bounded Writer transfer document from SwPaM, mirroring
 * LibreOffice `sw/source/uibase/dochdl/swdtflvr.cxx` ownership.
 */

import { serializeWriterClipboardPlainText } from "../../filter/ascii/ascatr";
import { serializeWriterClipboardHtml } from "../../filter/html/htmlnumwriter";
import type { WriterTransferParagraph } from "../../filter/basflt/writer-transfer";
import type { SwPaM, SwPosition } from "../../core/crsr/pam";
import type { SwDoc } from "../../core/doc/doc";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import {
  projectWriterTextRuns,
  splitWriterTextRuns,
  type WriterTextRun,
} from "../../core/txtnode/text-run-projection";

/** Describes the two clipboard representations emitted for a visible Writer selection. */
export interface WriterClipboardSelection {
  readonly html: string;
  readonly plainText: string;
}

/** Model-owned transferable created from the shell SwPaM, independent of rendered DOM. */
export class SwTransferable {
  /** Creates transfer serialization over the canonical document and shell cursor. @param document - Writer document model. @param pam - Persistent point-and-mark selection. @returns Nothing. */
  public constructor(
    private readonly document: SwDoc,
    private readonly pam: SwPaM,
  ) {}

  /** Serializes the canonical Writer selection through the bounded HTML/ASCII writers. @returns Paired MIME payload or undefined for an empty selection. */
  public CreateSelection(): WriterClipboardSelection | undefined {
    if (!this.pam.HasMark()) return undefined;
    const ordered = orderPositions(this.document, this.pam.GetPoint(), this.pam.GetMark());
    const startIndex = this.document.paragraphs.indexOf(ordered.start.GetNode() as SwTextNode);
    const endIndex = this.document.paragraphs.indexOf(ordered.end.GetNode() as SwTextNode);
    if (startIndex < 0 || endIndex < 0) return undefined;
    const paragraphs = this.document.paragraphs.slice(startIndex, endIndex + 1).map(
      /** Prepares one selected model paragraph. @param paragraph - Selected text node. @param relativeIndex - Index within the selected slice. @returns Format-writer paragraph input. */ (
        paragraph,
        relativeIndex,
      ): WriterTransferParagraph => {
        const index = startIndex + relativeIndex;
        const start = index === startIndex ? ordered.start.GetContentIndex() : 0;
        const end = index === endIndex ? ordered.end.GetContentIndex() : paragraph.Len();
        const runs = getSelectedRuns(paragraph, start, end);
        const complete = start === 0 && end === paragraph.Len();
        const listKind = complete ? paragraph.GetListKind() : "none";
        const number = listKind === "numbered" ? paragraph.GetListItemNumber() : undefined;
        const marker =
          listKind === "bullet"
            ? paragraph.GetNumRule()?.GetNumFormat(paragraph.GetAttrListLevel()).GetBulletChar()
            : number === undefined
              ? undefined
              : `${number}.`;
        return {
          html: serializeRuns(runs),
          listKind,
          listLevel: complete ? paragraph.GetAttrListLevel() : 0,
          marker,
          style: getModelParagraphStyle(paragraph),
          text: runs
            .map(
              /** Reads one selected run's text. @param run - Selected run. @returns Visible text. */ (
                run,
              ) => run.text,
            )
            .join(""),
        };
      },
    );
    if (
      paragraphs.every(
        /** Tests whether one prepared paragraph has no visible text. @param paragraph - Prepared transfer paragraph. @returns Whether its text is empty. */ (
          paragraph,
        ) => paragraph.text.length === 0,
      )
    )
      return undefined;
    return {
      html: serializeWriterClipboardHtml(paragraphs),
      plainText: serializeWriterClipboardPlainText(paragraphs),
    };
  }
}

/** Orders persistent Writer positions in document order. @param document - Owning Writer document. @param left - First endpoint. @param right - Second endpoint. @returns Ordered start and end positions. */
function orderPositions(
  document: SwDoc,
  left: SwPosition,
  right: SwPosition,
): Readonly<{ end: SwPosition; start: SwPosition }> {
  const leftIndex = document.paragraphs.indexOf(left.GetNode() as SwTextNode);
  const rightIndex = document.paragraphs.indexOf(right.GetNode() as SwTextNode);
  const leftFirst =
    leftIndex < rightIndex ||
    (leftIndex === rightIndex && left.GetContentIndex() <= right.GetContentIndex());
  return leftFirst ? { end: right, start: left } : { end: left, start: right };
}

/** Copies a normalized run slice without mutating the source node. @param paragraph - Source text node. @param start - Inclusive UTF-16 offset. @param end - Exclusive UTF-16 offset. @returns Selected normalized runs. */
function getSelectedRuns(
  paragraph: SwTextNode,
  start: number,
  end: number,
): readonly WriterTextRun[] {
  const fromStart = splitWriterTextRuns(projectWriterTextRuns(paragraph), start).suffix;
  return splitWriterTextRuns(fromStart, end - start).prefix;
}

/** Serializes modeled inline attributes without consulting DOM descendants. @param runs - Canonical selected runs. @returns Escaped bounded HTML fragment. */
function serializeRuns(runs: readonly WriterTextRun[]): string {
  return runs
    .map(
      /** Serializes one canonical run. @param run - Selected text run. @returns Escaped semantic HTML. */ (
        run,
      ) => {
        let html = escapeWriterClipboardHtml(run.text);
        if (run.attributes.bold) html = `<strong>${html}</strong>`;
        if (run.attributes.italic) html = `<em>${html}</em>`;
        const styles = [
          run.attributes.color === undefined || run.attributes.color === "auto"
            ? ""
            : `color: ${run.attributes.color}`,
          getClipboardHighlightStyle(run.attributes.highlight),
          run.attributes.underline ? "text-decoration: underline" : "",
          run.attributes.fontFamily === undefined
            ? ""
            : `font-family: ${escapeWriterClipboardHtml(run.attributes.fontFamily)}`,
        ].filter(Boolean);
        return styles.length === 0 ? html : `<span style="${styles.join("; ")}">${html}</span>`;
      },
    )
    .join("");
}

/** Serializes one Writer highlight for bounded HTML transfer. @param highlight - Effective Writer highlight. @returns CSS declaration or empty text. */
function getClipboardHighlightStyle(highlight: string | undefined): string {
  if (highlight === undefined) return "";
  /* v8 ignore next -- Transparent highlight omission is exercised at the ODT and browser-render boundaries; native clipboard selection cannot author this state directly. */
  if (highlight === "transparent") return "";
  return `background-color: ${highlight}`;
}

/** Projects the bounded paragraph attributes used by the clipboard writer. @param paragraph - Canonical text node. @returns Inline paragraph CSS used by the HTML writer. */
function getModelParagraphStyle(paragraph: SwTextNode): string {
  const heading = paragraph.GetParagraphStyle() === "heading-1";
  return `text-align: ${paragraph.GetParagraphAlignment()}; font-size: ${heading ? "1.5rem" : "1rem"}; font-weight: ${heading ? "700" : "400"}; line-height: ${heading ? "2.25rem" : "1.75rem"};`;
}

/** Escapes canonical Writer text before it becomes clipboard HTML. @param text - Untrusted model text. @returns HTML-safe text. */
function escapeWriterClipboardHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
