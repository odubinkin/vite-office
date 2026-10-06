/** @fileoverview Contains the optional browser geometry fallback for Writer pointer positions. */
import { getWriterTextCaretPoint } from "./writer-selection";

/** Browser caret endpoint resolved from viewport coordinates. */
export interface BrowserWriterCaretPoint {
  readonly node: Node;
  readonly offset: number;
  readonly paragraph: HTMLParagraphElement;
}

/** Minimal geometry surface injected for deterministic tests. */
export interface BrowserWriterCaretGeometry {
  readonly caretRangeFromPoint?: (x: number, y: number) => Range | null;
  readonly elementFromPoint?: (x: number, y: number) => Element | null;
}

/** Resolves viewport coordinates into a Writer paragraph caret when native range APIs are needed. @param geometry - Injected browser range API. @param x - Viewport x coordinate. @param y - Viewport y coordinate. @returns Writer caret or undefined outside the document projection. */
export function getBrowserWriterCaretFromPoint(
  geometry: BrowserWriterCaretGeometry,
  x: number,
  y: number,
): BrowserWriterCaretPoint | undefined {
  const range = geometry.caretRangeFromPoint?.(x, y);
  const cell = geometry.elementFromPoint?.(x, y)?.closest("[data-writer-table-box]");
  const point = range === null || range === undefined ? undefined : getParagraphCaret(range);
  if (cell === null || cell === undefined) return point;
  if (point !== undefined && cell.contains(point.paragraph)) return point;
  let nearest: HTMLParagraphElement | undefined;
  let distance = Infinity;
  for (const paragraph of cell.querySelectorAll<HTMLParagraphElement>(
    "[data-writer-paragraph-id]",
  )) {
    const bounds = paragraph.getBoundingClientRect();
    const current = Math.max(bounds.top - y, y - bounds.bottom, 0);
    if (current < distance) {
      nearest = paragraph;
      distance = current;
    }
  }
  if (nearest === undefined) return undefined;
  const bounds = nearest.getBoundingClientRect();
  const clipped = geometry.caretRangeFromPoint?.(
    Math.max(bounds.left, Math.min(x, bounds.right)),
    Math.max(bounds.top, Math.min(y, bounds.bottom)),
  );
  const clippedPoint =
    clipped === null || clipped === undefined ? undefined : getParagraphCaret(clipped);
  if (clippedPoint?.paragraph === nearest) return clippedPoint;
  const offset = y < bounds.top || x < bounds.left ? 0 : Number.MAX_SAFE_INTEGER;
  return { ...getWriterTextCaretPoint(nearest, offset), paragraph: nearest };
}

/** Resolves a browser range only through an actual projected paragraph. @param range - Native range. @returns Projected paragraph caret, or undefined. */
function getParagraphCaret(range: Range): BrowserWriterCaretPoint | undefined {
  const element =
    range.startContainer instanceof HTMLElement
      ? range.startContainer
      : range.startContainer.parentElement;
  const paragraph = element?.closest<HTMLParagraphElement>("[data-writer-paragraph-id]");
  return paragraph === null || paragraph === undefined
    ? undefined
    : { node: range.startContainer, offset: range.startOffset, paragraph };
}

/** Stabilizes pointer ranges when controlled DOM projection interrupts the browser drag lifecycle. */
export class BrowserWriterPointerSelectionController {
  private anchor: BrowserWriterCaretPoint | undefined;
  private focus: BrowserWriterCaretPoint | undefined;

  /** Creates a controller over injected geometry and the central selection adapter. @param geometry - Browser hit testing. @param setBaseAndExtent - Native selection writer. @returns Nothing. */
  public constructor(
    private readonly geometry: BrowserWriterCaretGeometry,
    private readonly setBaseAndExtent: (
      anchorNode: Node,
      anchorOffset: number,
      focusNode: Node,
      focusOffset: number,
    ) => boolean,
  ) {}

  /** Captures a primary-button pointer anchor and places its initial collapsed selection. @param button - Mouse button. @param x - Viewport x. @param y - Viewport y. @returns Whether an initial Writer caret was placed. */
  public Start(button: number, x: number, y: number): boolean {
    this.anchor = button === 0 ? getBrowserWriterCaretFromPoint(this.geometry, x, y) : undefined;
    this.focus = undefined;
    if (this.anchor !== undefined)
      return this.setBaseAndExtent(
        this.anchor.node,
        this.anchor.offset,
        this.anchor.node,
        this.anchor.offset,
      );
    return false;
  }

  /** Extends a range across paragraph projections. @param x - Viewport x. @param y - Viewport y. @returns Whether native selection was stabilized. */
  public Move(x: number, y: number): boolean {
    const focus = getBrowserWriterCaretFromPoint(this.geometry, x, y);
    if (
      this.anchor === undefined ||
      focus === undefined ||
      this.anchor.paragraph === focus.paragraph
    )
      return false;
    this.focus = focus;
    return this.setBaseAndExtent(this.anchor.node, this.anchor.offset, focus.node, focus.offset);
  }

  /** Places a collapsed native caret at a browser drop point. @param x - Viewport x. @param y - Viewport y. @returns Whether the point belongs to Writer. */
  public Place(x: number, y: number): boolean {
    const point = getBrowserWriterCaretFromPoint(this.geometry, x, y);
    return (
      point !== undefined &&
      this.setBaseAndExtent(point.node, point.offset, point.node, point.offset)
    );
  }

  /** Reapplies the completed cross-paragraph range and clears transient geometry state. @returns Whether a range was reapplied. */
  public End(): boolean {
    const completed = this.anchor !== undefined && this.focus !== undefined;
    const restored =
      completed &&
      this.setBaseAndExtent(
        (this.anchor as BrowserWriterCaretPoint).node,
        (this.anchor as BrowserWriterCaretPoint).offset,
        (this.focus as BrowserWriterCaretPoint).node,
        (this.focus as BrowserWriterCaretPoint).offset,
      );
    this.anchor = undefined;
    this.focus = undefined;
    return restored;
  }
}
