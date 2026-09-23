/** @fileoverview Estimates physical Writer page breaks for the bounded browser paragraph projection. */

import type { WriterPageDescriptorValue } from "../../source/core/layout/pagedesc";
import type { WriterParagraphProjection as WriterParagraph } from "../presentation/writer-view-projection";

/** Computes the effective gap between Writer paragraphs, including contextual spacing. @param previous - Previous paragraph when present. @param current - Current paragraph. @returns Gap in points. */
export function getWriterParagraphGap(
  previous: WriterParagraph | undefined,
  current: WriterParagraph,
): number {
  if (previous === undefined) return current.computedStyle.upperSpacingPt;
  const prev = previous.computedStyle;
  const next = current.computedStyle;
  const sameStyle = previous.style === current.style;
  if (sameStyle && prev.contextualSpacing && next.contextualSpacing) return 0;
  return Math.max(
    sameStyle && prev.contextualSpacing ? 0 : prev.lowerSpacingPt,
    sameStyle && next.contextualSpacing ? 0 : next.upperSpacingPt,
  );
}

/** Produces a stable bounded page projection without adding layout state to SwDoc. @param paragraphs - Immutable paragraphs. @param page - Physical page geometry. @param measuredHeights - Optional browser paragraph heights. @returns Ordered page groups. */
export function paginateWriterParagraphs(
  paragraphs: readonly WriterParagraph[],
  page: WriterPageDescriptorValue,
  measuredHeights?: ReadonlyMap<string, number>,
): readonly (readonly WriterParagraph[])[] {
  const contentWidthPt = Math.max(1, (page.width - page.leftMargin - page.rightMargin) / 20);
  const contentHeightPixels = Math.max(1, (page.height - page.topMargin - page.bottomMargin) / 15);
  const pages: WriterParagraph[][] = [[]];
  let usedHeightPixels = 0;
  for (const [index, paragraph] of paragraphs.entries()) {
    const style = paragraph.computedStyle;
    const previous = index === 0 ? undefined : paragraphs[index - 1];
    const usableWidthPt = Math.max(
      style.fontSizePt * 4,
      contentWidthPt - paragraph.textLeftMargin / 20 - style.rightMarginPt,
    );
    const averageGlyphWidthPt = Math.max(1, style.fontSizePt * 0.52);
    const charactersPerLine = Math.max(1, Math.floor(usableWidthPt / averageGlyphWidthPt));
    const visualLines = Math.max(
      1,
      paragraph.text
        .split("\n")
        .reduce(
          /** Accumulates wrapped visual lines. @param total - Current line count. @param line - Logical text line. @returns Updated line count. */ (
            total,
            line,
          ) => total + Math.max(1, Math.ceil(line.length / charactersPerLine)),
          0,
        ),
    );
    const estimatedHeightPt =
      getWriterParagraphGap(previous, paragraph) +
      visualLines * style.fontSizePt * style.lineHeight;
    const heightPixels = measuredHeights?.get(paragraph.id) ?? (estimatedHeightPt * 4) / 3;
    const current = pages[pages.length - 1] as WriterParagraph[];
    if (current.length > 0 && usedHeightPixels + heightPixels > contentHeightPixels) {
      pages.push([paragraph]);
      usedHeightPixels = heightPixels;
    } else {
      current.push(paragraph);
      usedHeightPixels += heightPixels;
    }
  }
  return pages;
}
