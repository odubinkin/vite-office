/** @fileoverview Formats represented horizontal table print areas from native SwTabFrame::Format. */
import type { SwTable } from "../table/swtable";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";

/** Table print bounds relative to its upper frame, in twips. */
export interface SwTablePrintArea {
  readonly left: number;
  readonly right: number;
  readonly width: number;
}

/** Owns horizontal print geometry over the actual canonical table. */
export class SwTabFrame {
  /** Binds this layout frame to its original table. @param table - Canonical table. @returns Nothing. */
  public constructor(private readonly table: SwTable) {}

  /** Resolves native orientation spacing without fly or outer-border offsets. @param upperWidth - Actual upper print width. @returns Table print area. */
  public Format(upperWidth: number): SwTablePrintArea {
    const format = this.table.GetFormat();
    const wished = Math.min(
      65535,
      Math.max(this.table.GetColumnWidths().length * 23, format.width ?? 0),
    );
    let left = 0;
    let right = 0;
    const orient = this.table.GetHoriOrient();
    if (orient === HoriOrientation.NONE) {
      left = format.marginLeft ?? 0;
      right = format.marginRight ?? 0;
    } else {
      switch (orient) {
        case HoriOrientation.LEFT_AND_WIDTH:
          left = format.marginLeft ?? 0;
          right = upperWidth - left - wished;
          break;
        case HoriOrientation.LEFT:
          right = upperWidth - wished;
          break;
        case HoriOrientation.CENTER:
          left = right = Math.trunc((upperWidth - wished) / 2);
          break;
        case HoriOrientation.RIGHT:
          left = upperWidth - wished;
          break;
      }
    }
    if (upperWidth - 23 < left + right) left = right = 0;
    return Object.freeze({ left, right, width: upperWidth - left - right });
  }
}
