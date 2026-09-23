/** @fileoverview Browser device port supplying shaped visual lines to Writer text frames. */

import type { SwTextLine } from "../../source/core/text/txtfrm";
import type { WriterParagraphProjection } from "../presentation/writer-view-projection";

/** Reads line boundaries from the actual browser-shaped text, in Writer twips. @param paragraph - Canonical view paragraph. @param element - Offscreen browser layout paragraph. @returns Visual lines. */
export function measureWriterTextLines(
  paragraph: WriterParagraphProjection,
  element: HTMLParagraphElement,
): readonly SwTextLine[] {
  const height = paragraph.computedStyle.fontSizePt * paragraph.computedStyle.lineHeight * 20;
  const fallback = Object.freeze([{ start: 0, end: paragraph.text.length, height }]);
  if (paragraph.text.length === 0) return fallback;
  const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const range = element.ownerDocument.createRange();
  if (typeof range.getClientRects !== "function") return fallback;
  const lines: SwTextLine[] = [];
  let textNode = walker.nextNode();
  let offset = 0;
  let lineStart = 0;
  let lineTop: number | undefined;
  let lastTop: number | undefined;
  let lineHeight = height;
  while (textNode instanceof Text) {
    for (let index = 0; index < textNode.length;) {
      const size = String.fromCodePoint(textNode.data.codePointAt(index) as number).length;
      range.setStart(textNode, index);
      range.setEnd(textNode, index + size);
      const rect = range.getClientRects()[0];
      if (rect !== undefined && rect.height > 0) {
        if (lineTop !== undefined && Math.abs(rect.top - lineTop) > 1) {
          lines.push({
            start: lineStart,
            end: offset,
            height: Math.max(lineHeight, (rect.top - lineTop) * 15),
          });
          lineStart = offset;
          lineHeight = height;
        }
        lineTop = rect.top;
        lastTop = rect.top;
        lineHeight = Math.max(lineHeight, rect.height * 15);
      }
      index += size;
      offset += size;
    }
    textNode = walker.nextNode();
  }
  if (lastTop === undefined || offset !== paragraph.text.length) return fallback;
  lines.push({ start: lineStart, end: offset, height: lineHeight });
  return Object.freeze(
    lines.map(
      /** Freezes one measured line. @param line - Browser-shaped line. @returns Immutable line. */ (
        line,
      ) => Object.freeze(line),
    ),
  );
}
