/** @fileoverview Native text-cursor line ambiguity from itrtxt.cxx CharCursorToLine. */
import type { SwTextLine } from "./txtfrm";

/** Iterates measured native lines while retaining the source right-margin affinity. */
export class SwTextCursor {
  private static rightMargin = false;
  private index = 0;
  /** Creates a cursor over device-shaped lines of one text frame. @param lines - Complete frame lines. @param text - Native node text. @returns Iterator. */
  public constructor(
    private readonly lines: readonly SwTextLine[],
    private readonly text: string,
  ) {}
  /** Reads source right-margin ambiguity. @returns Whether a boundary belongs to its preceding line. */
  public static IsRightMargin(): boolean {
    return this.rightMargin;
  }
  /** Changes source right-margin ambiguity. @param value - New affinity. @returns Nothing. */
  public static SetRightMargin(value: boolean): void {
    this.rightMargin = value;
  }
  /** Resolves a UTF16 model position as CharCursorToLine does. @param position - Native content offset. @returns Current measured line, or no formatted line. */
  public CharCursorToLine(position: number): SwTextLine | undefined {
    while (
      this.index + 1 < this.lines.length &&
      (this.lines[this.index] as SwTextLine).end <= position
    )
      this.index++;
    while (this.index > 0 && (this.lines[this.index] as SwTextLine).start > position) this.index--;
    const current = this.lines[this.index];
    if (current === undefined) return undefined;
    if (position !== current.start) SwTextCursor.SetRightMargin(false);
    const previous = this.lines[this.index - 1];
    if (
      SwTextCursor.IsRightMargin() &&
      current.end > current.start &&
      previous !== undefined &&
      previous.end > previous.start &&
      this.text[position - 1] !== "\n"
    )
      this.index--;
    return this.lines[this.index];
  }
  /** Reports a following line within this frame. @returns Whether another line exists. */
  public GetNext(): boolean {
    return this.index + 1 < this.lines.length;
  }
}
