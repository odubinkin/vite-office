/** @fileoverview Browser device port supplying shaped visual lines to Writer text frames. */

import { measureBrowserTextLines } from "../../../vcl/browser/text-line-measurement";
import type { SwTextFrameMeasurement, SwTextLine } from "../../source/core/text/txtfrm";
import type { WriterParagraphProjection } from "../presentation/writer-view-projection";

/** Packages only browser line measurements for the core formatter. @param paragraphs - Immutable view paragraphs. @param measuredLines - DOM Range output by node identity. @returns Device geometry in document order. */
export function createWriterLineMeasurements(
  paragraphs: readonly WriterParagraphProjection[],
  measuredLines: ReadonlyMap<string, readonly SwTextLine[]>,
): readonly SwTextFrameMeasurement[] {
  return paragraphs.map(
    /** Converts one measured paragraph to device twips. @param paragraph - View paragraph. @returns Line measurement. */
    (paragraph) => ({
      id: paragraph.id,
      lines: measuredLines.get(paragraph.id) ?? [
        {
          start: 0,
          end: paragraph.text.length,
          height: paragraph.computedStyle.fontSizePt * paragraph.computedStyle.lineHeight * 20,
        },
      ],
    }),
  );
}

/** Reads line boundaries from the actual browser-shaped text, in Writer twips. @param paragraph - Canonical view paragraph. @param element - Offscreen browser layout paragraph. @returns Visual lines. */
export function measureWriterTextLines(
  paragraph: WriterParagraphProjection,
  element: HTMLParagraphElement,
): readonly SwTextLine[] {
  const height = paragraph.computedStyle.fontSizePt * paragraph.computedStyle.lineHeight * 20;
  return measureBrowserTextLines(element, paragraph.text, height, 0);
}

/** Measures a mounted master/follow paragraph for native cursor movement. @param element - Actual editing projection. @returns UTF16 device lines in source-node coordinates. */
export function measureWriterCursorTextLines(element: HTMLParagraphElement): readonly SwTextLine[] {
  const style = element.ownerDocument.defaultView?.getComputedStyle(element),
    height = (Number.parseFloat(style?.lineHeight ?? "") || 16) * 15;
  return measureBrowserTextLines(
    element,
    element.textContent ?? "",
    height,
    Number(element.dataset.writerFragmentStart ?? 0),
  );
}
