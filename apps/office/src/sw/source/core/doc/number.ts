/**
 * @fileoverview Calculates browser-visible Writer list markers at the `sw/source/core/doc/number.cxx` ownership boundary without changing editable paragraph text.
 */

import type { WriterParagraphList } from "./list";

/** Describes the list subset of a Writer paragraph needed for deterministic marker calculation. */
export interface WriterNumberingParagraph {
  /** Stable paragraph identity used to locate a marker request. */
  readonly id: string;
  /** Serializable list state applied to the paragraph. */
  readonly list: WriterParagraphList;
}

/**
 * Produces the visible marker for one current Writer paragraph without changing its plain editable text.
 *
 * @param paragraphs - Ordered list-capable Writer paragraphs rendered in the browser document body.
 * @param paragraphId - Stable identity of the paragraph whose marker is requested.
 * @returns A bullet, one-based numbering marker, or undefined when the paragraph is not a list item.
 */
export function getWriterParagraphListMarker(
  paragraphs: readonly WriterNumberingParagraph[],
  paragraphId: string,
): string | undefined {
  const paragraphIndex = paragraphs.findIndex(
    /** Finds the numbered paragraph owning paragraphId. @param paragraph - Current list-capable paragraph. @returns True only for the requested identity. */
    function hasParagraphId(paragraph): boolean {
      return paragraph.id === paragraphId;
    },
  );
  const paragraph = paragraphs[paragraphIndex];
  if (paragraph === undefined || paragraph.list.kind === "none") return undefined;
  if (paragraph.list.kind === "bullet") return "•";
  let itemNumber = 1;
  for (let index = paragraphIndex - 1; index >= 0; index -= 1) {
    const previousParagraph = paragraphs[index] as WriterNumberingParagraph;
    if (
      previousParagraph.list.kind !== "numbered" ||
      previousParagraph.list.level !== paragraph.list.level
    )
      break;
    itemNumber += 1;
  }
  return `${itemNumber}.`;
}
