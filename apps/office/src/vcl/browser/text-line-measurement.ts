/** @fileoverview Shared VCL browser device measurement of real shaped UTF16 text lines;no document or pagination state is retained. */
/** Device-measured UTF16 range and height in document twips. */
export interface BrowserTextLine {
  readonly start: number;
  readonly end: number;
  readonly height: number;
}

/** Reads browser-shaped lines without selecting a cursor target. @param element - Device paragraph. @param text - Actual projection text. @param height - Fallback twip height. @param base - Native fragment offset. @returns Measured native lines. */
export function measureBrowserTextLines(
  element: HTMLElement,
  text: string,
  height: number,
  base: number,
): readonly BrowserTextLine[] {
  const fallback = Object.freeze([{ start: base, end: base + text.length, height }]);
  if (text.length === 0) return fallback;
  const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const range = element.ownerDocument.createRange();
  if (typeof range.getClientRects !== "function") return fallback;
  const lines: BrowserTextLine[] = [];
  let textNode = walker.nextNode();
  let offset = base;
  let lineStart = base;
  let lineTop: number | undefined;
  let lineBottom: number | undefined;
  let lastTop: number | undefined;
  let lineHeight = height;
  while (textNode instanceof Text) {
    for (let index = 0; index < textNode.length;) {
      const size = String.fromCodePoint(textNode.data.codePointAt(index) as number).length;
      range.setStart(textNode, index);
      range.setEnd(textNode, index + size);
      const rect = range.getClientRects()[0];
      if (rect !== undefined && rect.height > 0) {
        const overlap =
          lineTop === undefined || lineBottom === undefined
            ? 0
            : Math.min(lineBottom, rect.top + rect.height) - Math.max(lineTop, rect.top);
        if (
          lineTop !== undefined &&
          lineBottom !== undefined &&
          overlap < Math.min(lineBottom - lineTop, rect.height) * 0.5
        ) {
          lines.push({
            start: lineStart,
            end: offset,
            height: Math.max(lineHeight, (rect.top - lineTop) * 15),
          });
          lineStart = offset;
          lineHeight = height;
          lineTop = rect.top;
          lineBottom = rect.top + rect.height;
        } else {
          lineTop = Math.min(lineTop ?? rect.top, rect.top);
          lineBottom = Math.max(lineBottom ?? rect.top + rect.height, rect.top + rect.height);
        }
        lastTop = rect.top;
        lineHeight = Math.max(lineHeight, rect.height * 15);
      }
      index += size;
      offset += size;
    }
    textNode = walker.nextNode();
  }
  if (lastTop === undefined || offset !== base + text.length) return fallback;
  lines.push({ start: lineStart, end: offset, height: lineHeight });
  return Object.freeze(
    lines.map(
      /** Freezes one measured line. @param line - Browser-shaped line. @returns Immutable line. */ (
        line,
      ) => Object.freeze(line),
    ),
  );
}
