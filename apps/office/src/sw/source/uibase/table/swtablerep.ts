/** @fileoverview Owns represented table dialog geometry from native SwTableRep and tabsh.cxx. */
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import type { SwTable } from "../../core/table/swtable";

/** Flat visible-column dialog draft; the canonical table remains owned by SwDoc. */
export class SwTableRep {
  public width: number;
  public left: number;
  public right: number;
  public align: HoriOrientation;
  public readonly columns: number[];

  /** Reads the native table-parameter input geometry. @param table - Original table. @param space - Upper print width. @returns Nothing. */
  public constructor(
    table: SwTable,
    public readonly space: number,
  ) {
    const format = table.GetFormat();
    this.align = table.GetHoriOrient();
    this.width = format.width ?? space;
    this.left = format.marginLeft ?? 0;
    this.right = format.marginRight ?? 0;
    const rest = space - this.width;
    switch (this.align) {
      case HoriOrientation.CENTER:
        this.left = this.right = Math.trunc(rest / 2);
        break;
      case HoriOrientation.LEFT:
        this.left = 0;
        this.right = rest;
        break;
      case HoriOrientation.RIGHT:
        this.left = rest;
        this.right = 0;
        break;
      case HoriOrientation.LEFT_AND_WIDTH:
        this.right = rest - this.left;
        break;
      case HoriOrientation.NONE:
        this.width = space - this.left - this.right;
        break;
      case HoriOrientation.FULL:
        this.width = space;
        break;
    }
    this.columns = [...table.GetColumnWidths()];
  }
}
