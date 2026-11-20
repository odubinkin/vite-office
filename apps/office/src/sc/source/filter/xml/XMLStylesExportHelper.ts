/** @fileoverview Selected cell style defaults for the Calc XML column and row writers. */
import { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import type { ScPatternAttr } from "../../../inc/patattr";

/** ScMyDefaultStyles uses the core column winner over the actual exported rows. */
export class ScMyDefaultStyles {
  private readonly names: string[] = [];
  private readonly tail: string;

  /** Selects each allocated column and the shared trailing column pattern. @param document - Format owner. @param tab - Sheet. @param lastRow - Inclusive export row. @param allocated - Number of real columns. @param styleName - ODF style lookup. @returns The column defaults. */
  constructor(
    document: ScDocument,
    tab: number,
    lastRow: number,
    allocated: number,
    styleName: (pattern: ScPatternAttr) => string,
  ) {
    /** Finds the ODF name at the core's winning row. @param col - Column. @returns Selected style. */
    const nameAt =
      /** Resolves the winning row style. @param col - Column. @returns ODF style name. */ (
        col: number,
      ): string => {
        const row = document.GetColDefault(tab, col, lastRow);
        const pattern = document.GetPattern(new ScAddress(col, row, tab));
        return pattern ? styleName(pattern) : "";
      };
    for (let col = 0; col < allocated; col++) this.names.push(nameAt(col));
    this.tail = nameAt(allocated);
  }

  /** Reads the assigned default for a real or shared column. @param col - Column. @returns Style name or empty standard. */
  Get(col: number): string {
    return this.names[col] ?? this.tail;
  }

  /** Stops a column group when its selected cell style changes. @param first - Start column. @param last - Maximum end column. @returns End of the same style run. */
  ClipRange(first: number, last: number): number {
    const name = this.Get(first);
    for (let col = first + 1; col <= last && col <= this.names.length; col++)
      if (this.Get(col) !== name) return col - 1;
    return last;
  }
}
