/** @fileoverview Contains the optional browser geometry fallback for Writer pointer positions. */

/** Browser caret endpoint resolved from viewport coordinates. */
export interface BrowserWriterCaretPoint {
  readonly node: Node;
  readonly offset: number;
  readonly paragraph: HTMLParagraphElement;
}

/** Minimal geometry surface injected for deterministic tests. */
export interface BrowserWriterCaretGeometry {
  readonly caretRangeFromPoint?: (x: number, y: number) => Range | null;
}

/** Resolves viewport coordinates into a Writer paragraph caret when native range APIs are needed. @param geometry - Injected browser range API. @param x - Viewport x coordinate. @param y - Viewport y coordinate. @returns Writer caret or undefined outside the document projection. */
export function getBrowserWriterCaretFromPoint(
  geometry: BrowserWriterCaretGeometry,
  x: number,
  y: number,
): BrowserWriterCaretPoint | undefined {
  const range = geometry.caretRangeFromPoint?.(x, y);
  if (range === null || range === undefined) return undefined;
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

  /** Creates a controller over injected geometry and selection surfaces. @param geometry - Browser hit testing. @param getSelection - Native selection getter. @returns Nothing. */
  public constructor(
    private readonly geometry: BrowserWriterCaretGeometry,
    private readonly getSelection: () => Selection | null,
  ) {}

  /** Captures a primary-button pointer anchor. @param button - Mouse button. @param x - Viewport x. @param y - Viewport y. @returns Nothing. */
  public Start(button: number, x: number, y: number): void {
    this.anchor = button === 0 ? getBrowserWriterCaretFromPoint(this.geometry, x, y) : undefined;
    this.focus = undefined;
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
    const selection = this.getSelection();
    if (selection === null) return false;
    this.focus = focus;
    selection.setBaseAndExtent(this.anchor.node, this.anchor.offset, focus.node, focus.offset);
    return true;
  }

  /** Reapplies the completed cross-paragraph range and clears transient geometry state. @returns Whether a range was reapplied. */
  public End(): boolean {
    const selection = this.getSelection();
    const completed = this.anchor !== undefined && this.focus !== undefined && selection !== null;
    if (completed)
      selection.setBaseAndExtent(
        (this.anchor as BrowserWriterCaretPoint).node,
        (this.anchor as BrowserWriterCaretPoint).offset,
        (this.focus as BrowserWriterCaretPoint).node,
        (this.focus as BrowserWriterCaretPoint).offset,
      );
    this.anchor = undefined;
    this.focus = undefined;
    return completed;
  }
}
