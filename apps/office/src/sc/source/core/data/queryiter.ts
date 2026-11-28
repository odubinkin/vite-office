/** @fileoverview Original direct Calc lookup iterator over nonempty worksheet cells. */
import { ScAddress, type ScRange } from "../../../inc/address";
import { ScHorizontalCellIterator } from "../../../inc/dociter";
import type { ScDocument } from "../../../inc/document";
import { SearchParam } from "../../../../unotools/source/i18n/textsearch";
import type { ScQueryEntry } from "../tool/queryentry";
import { ScQueryEvaluator } from "./queryevaluator";

/** Searches only the first column or first row of the lookup area. */
export class ScQueryCellIteratorDirect {
  private readonly cells: ScHorizontalCellIterator;
  private readonly evaluator: ScQueryEvaluator;
  private readonly column: [number] = [0];
  private readonly row: [number] = [0];

  /** Binds the direct query to one axis of an existing sheet. @param document - Worksheet owner. @param range - Lookup table. @param horizontal - Search across the first row. @param entry - Active criterion. @returns Iterator. */
  constructor(
    document: ScDocument,
    private readonly range: ScRange,
    horizontal: boolean,
    private readonly entry: ScQueryEntry,
  ) {
    const start = range.aStart;
    this.cells = new ScHorizontalCellIterator(
      document,
      start.Tab(),
      start.Col(),
      start.Row(),
      horizontal ? range.aEnd.Col() : start.Col(),
      horizontal ? start.Row() : range.aEnd.Row(),
    );
    this.evaluator = new ScQueryEvaluator(document, entry);
  }

  /** Returns the first existing cell meeting the equality criterion. @returns Found position or absence. */
  GetFirst(): ScAddress | undefined {
    for (
      let cell = this.cells.GetNext(this.column, this.row);
      cell;
      cell = this.cells.GetNext(this.column, this.row)
    ) {
      const address = new ScAddress(this.column[0], this.row[0], this.range.aStart.Tab());
      if (this.evaluator.evaluate(cell, address, false).equal) return address;
    }
    return undefined;
  }

  /** Stops at the first ordered mismatch and advances to the last equal entry if found. @param descending - Whether the vector is sorted largest first. @returns Position or absence. */
  FindEqualOrSortedLastInRange(descending = false): ScAddress | undefined {
    const patterned = this.entry.searchType !== SearchParam.SearchType.Normal;
    let found: ScAddress | undefined;
    let equal = false;
    let stoppedOnMismatch = false;
    for (
      let cell = this.cells.GetNext(this.column, this.row);
      cell;
      cell = this.cells.GetNext(this.column, this.row)
    ) {
      const address = new ScAddress(this.column[0], this.row[0], this.range.aStart.Tab());
      const result = this.evaluator.evaluate(cell, address, true);
      const matches = patterned || equal ? result.equal : result.order === 0;
      if (matches) {
        equal = true;
        found = address;
      } else if (equal) break;
      else if (!stoppedOnMismatch && result.order !== undefined) {
        if (descending ? result.order > 0 : result.order < 0) found = address;
        else if (typeof this.entry.item === "number" || !address.equals(this.range.aStart)) {
          if (!patterned) break;
          stoppedOnMismatch = true;
        }
      }
    }
    return found;
  }
}
