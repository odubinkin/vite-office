/** @fileoverview Consumed sw::mark::UnoMark from pinned bookmark.cxx: document-managed UNO range positions remain distinct from editing cursors and user bookmarks. */
import type { SwPaM, SwPosition } from "./pam";
/** Internal UNO bookmark owns native mark positions without entering the user bookmark catalog. */
export class UnoMark {
  private point!: SwPosition;
  private other: SwPosition | undefined;
  private valid = true;
  /** Binds the represented native owner and its declared inputs. @param range - Registered canonical range. @returns Nothing. */
  constructor(range: SwPaM) {
    this.SetPositions(range);
  }
  /** Implements the represented native GetMarkPos operation. @returns The represented native operation result. */
  GetMarkPos(): SwPosition {
    return this.point;
  }
  /** Implements the represented native GetOtherMarkPos operation. @returns The represented native operation result. */
  GetOtherMarkPos(): SwPosition {
    if (!this.other) throw new Error("assert(UnoMark has an expanded other position)");
    return this.other;
  }
  /** Original MarkBase start query preserves the other endpoint's reference on an expanded equality tie. @returns Borrowed actual start position. */
  GetMarkStart(): SwPosition {
    return !this.other || this.point.compare(this.other) < 0 ? this.point : this.other;
  }
  /** Original MarkBase end query preserves the primary endpoint's reference on equality. @returns Borrowed actual end position. */
  GetMarkEnd(): SwPosition {
    return !this.other || this.point.compare(this.other) >= 0 ? this.point : this.other;
  }
  /** Original ordered pair contains original endpoint references, including distinct equal-coordinate positions. @returns Native borrowed start/end pair. */
  GetMarkStartEnd(): readonly [SwPosition, SwPosition] {
    return [this.GetMarkStart(), this.GetMarkEnd()];
  }
  /** Original MarkBase endpoint removal releases the owned other position without replacing the primary one. @returns Nothing. */
  ClearOtherMarkPos(): void {
    this.other?.Dispose();
    this.other = undefined;
  }
  /** Implements the represented native IsExpanded operation. @returns The represented native operation result. */
  IsExpanded(): boolean {
    return this.other !== undefined;
  }
  /** Copies registered native positions into the caller range. @param output - Original output input. @returns The represented native operation result. */
  GetPositions(output: SwPaM): boolean {
    if (!this.valid) return false;
    output.Assign(this.point, this.other);
    return true;
  }
  /** Updates registered native range positions. @param input - Original input input. @returns The represented native operation result. */
  SetPositions(input: SwPaM): boolean {
    if (!this.valid) return false;
    const point = input.GetPoint().clone("mark"),
      other = input.HasMark() ? input.GetMark().clone("mark") : undefined;
    this.point?.Dispose();
    this.other?.Dispose();
    this.point = point;
    this.other = other;
    const first = other && other.compare(point) < 0 ? other : point,
      last = first === point ? (other ?? point) : point;
    first.nContent.SetAffinity("after");
    last.nContent.SetAffinity("before");
    return true;
  }
  /** Implements the represented native Dispose operation. @returns The represented native operation result. */
  Dispose(): void {
    if (this.valid) {
      this.point.Dispose();
      this.other?.Dispose();
      this.valid = false;
    }
  }
}
