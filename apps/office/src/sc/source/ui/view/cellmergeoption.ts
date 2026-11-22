/** @fileoverview Original ScCellMergeOption rectangle and selected tab set. */
import { ScRange } from "../../../inc/address";

/** Native merge selection stores cell coordinates separately from its selected sheets. */
export class ScCellMergeOption {
  readonly maTabs = new Set<number>();
  mnStartCol: number;
  mnStartRow: number;
  mnEndCol: number;
  mnEndRow: number;
  mbCenter: boolean;

  /** Copies an option or builds one for every tab in the source range. @param source - Native range or option. @returns Option. */
  constructor(source: ScRange | ScCellMergeOption);
  /** Builds a coordinate option with an initially empty tab set. @param col - First column. @param row - First row. @param endCol - Last column. @param endRow - Last row. @param center - Center content. @returns Option. */
  constructor(col: number, row: number, endCol: number, endRow: number, center?: boolean);
  /** Dispatches source constructors by coordinate or range. @param first - Range or first column. @param row - First row. @param endCol - Last column. @param endRow - Last row. @param center - Center content. @returns Option. */
  constructor(
    first: ScRange | ScCellMergeOption | number,
    row = 0,
    endCol = 0,
    endRow = 0,
    center = false,
  ) {
    if (first instanceof ScCellMergeOption) {
      this.mnStartCol = first.mnStartCol;
      this.mnStartRow = first.mnStartRow;
      this.mnEndCol = first.mnEndCol;
      this.mnEndRow = first.mnEndRow;
      this.mbCenter = first.mbCenter;
      for (const tab of first.maTabs) this.maTabs.add(tab);
    } else if (first instanceof ScRange) {
      this.mnStartCol = first.aStart.Col();
      this.mnStartRow = first.aStart.Row();
      this.mnEndCol = first.aEnd.Col();
      this.mnEndRow = first.aEnd.Row();
      this.mbCenter = false;
      for (let tab = first.aStart.Tab(); tab <= first.aEnd.Tab(); tab++) this.maTabs.add(tab);
    } else {
      this.mnStartCol = first;
      this.mnStartRow = row;
      this.mnEndCol = endCol;
      this.mnEndRow = endRow;
      this.mbCenter = center;
    }
  }

  /** Applies the rectangle to one source sheet. @param tab - Sheet index. @returns Single-sheet range. */
  getSingleRange(tab: number): ScRange {
    return new ScRange(this.mnStartCol, this.mnStartRow, tab, this.mnEndCol, this.mnEndRow, tab);
  }

  /** Resolves the first source sheet, defaulting to zero. @returns Single-sheet range. */
  getFirstSingleRange(): ScRange {
    return this.getSingleRange(this.maTabs.size ? Math.min(...this.maTabs) : 0);
  }
}
