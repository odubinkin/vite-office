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
  return measureBrowserTextLines(element, paragraph.text, height, 0, measureDevicePortion);
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
    measureDevicePortion,
  );
}

/** Measures one frame-level portion, including the full box shared by the characters of rotated text. @param text - Rendered text node for the source position. @returns Actual inline box, if any. */
function measureDevicePortion(text: Text): DOMRect | undefined {
  return text.parentElement
    ?.closest(
      '[data-writer-inline-graphic], [data-writer-character-rotation="900"], [data-writer-character-rotation="2700"]',
    )
    ?.getBoundingClientRect();
}

/** Applies the scaled glyph advance and matching inline reservation to an actual text portion. @param element - Real text host. @param scaleWidth - Original Writer width percentage. @param rotation - Native rotation in tenths of a degree. @returns Device observer cleanup. */
export function connectWriterCharacterGeometry(
  element: HTMLSpanElement,
  scaleWidth: number,
  rotation = 0,
): () => void {
  const rotated = rotation === 900 || rotation === 2700;
  const factor = scaleWidth / 100;
  const style = element.style;
  style.display = "inline-block";
  style.whiteSpace = "pre";
  style.inlineSize = "max-content";
  style.writingMode = rotated ? (rotation === 900 ? "sideways-lr" : "sideways-rl") : "";
  style.transform = "";
  style.transformOrigin = "";
  style.marginInlineEnd = "";
  style.marginBottom = "";
  if (factor === 1)
    return /** Unscaled text needs no resize subscription. @returns Nothing. */ () => {};
  style.transform = rotated ? `scaleY(${factor})` : `scaleX(${factor})`;
  const update =
    /** Matches the layout advance to the untransformed shaped text, including font loading changes. @returns Nothing. */ (): void => {
      const computed = getComputedStyle(element);
      const advance = Number.parseFloat(rotated ? computed.height : computed.width);
      if (!Number.isFinite(advance)) return;
      style.transformOrigin = rotated || computed.direction !== "rtl" ? "left top" : "right top";
      const margin = `${advance * (factor - 1)}px`;
      if (rotated) style.marginBottom = margin;
      else style.marginInlineEnd = margin;
    };
  update();
  const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(update);
  observer?.observe(element);
  return /** Releases the observed glyph geometry. @returns Nothing. */ () =>
    observer?.disconnect();
}
