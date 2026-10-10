/** @fileoverview Original RowSpan and ColRowSpan value constructors from columnspanset.cxx. */
import type { SCROW, SCCOLROW } from "../../../inc/types";

/** Original inclusive row endpoint value. */
export class RowSpan {
  /** Initializes both original signed32 fields. @param row1 - First row. @param row2 - Last row. @returns Value. */
  public constructor(
    public mnRow1: SCROW,
    public mnRow2: SCROW,
  ) {
    this.mnRow1 |= 0;
    this.mnRow2 |= 0;
  }
}
/** Original inclusive column-or-row endpoint value. */
export class ColRowSpan {
  /** Initializes both original signed32 fields. @param start - First position. @param end - Last position. @returns Value. */
  public constructor(
    public mnStart: SCCOLROW,
    public mnEnd: SCCOLROW,
  ) {
    this.mnStart |= 0;
    this.mnEnd |= 0;
  }
}
