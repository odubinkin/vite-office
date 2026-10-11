/** @fileoverview Native SwLinePortion text length; full portion shaping, painting and geometry remain unrepresented. */
/** Base native portion supplying the UTF-16 character count of a line. */
export class SwLinePortion {
  private mnLineLength = 0;
  /** Reads the source length. @returns UTF-16 length. */
  public GetLen(): number {
    return this.mnLineLength;
  }
  /** Stores the source length. @param length - Character count. @returns Nothing. */
  public SetLen(length: number): void {
    this.mnLineLength = length;
  }
}
