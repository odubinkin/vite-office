/** @fileoverview Collects flat native box boundaries and column spans from SwXMLTableLines_Impl in xmltble.cxx. */
import type { SwTable, SwTableBox } from "../../core/table/swtable";

/** Native Writer XML union of cell boundaries, borrowed also by the browser table device. */
export class SwXMLTableLines {
  private readonly columns: number[] = [];
  private readonly widths: number[];
  private readonly spans = new Map<SwTableBox, number>();
  /** Collects all original flat-row boundaries without replacing any model owners. @param table - Original table. @returns Nothing. */
  public constructor(table: SwTable) {
    const rows = table.GetTabLines();
    let total = 0;
    for (const row of rows) {
      let position = 0;
      const boxes = row.GetTabBoxes();
      boxes.forEach(
        /** Collects source cumulative boundaries, retaining the first row's final extent. @param box - Original box. @param index - Cell coordinate. @returns Nothing. */
        (box, index) => {
          if (index < boxes.length - 1 || total === 0) position += box.GetFrameSize().GetWidth();
          else position = total;
          const column = this.FindColumn(position);
          if (column === this.columns.length || position + 20 < (this.columns[column] as number))
            this.columns.splice(column, 0, position);
          if (index === boxes.length - 1 && total === 0) total = position;
        },
      );
    }
    if (total === 0) {
      this.widths = [...table.GetColumnWidths()];
      for (const row of rows) for (const box of row.GetTabBoxes()) this.spans.set(box, 1);
    } else {
      let previous = 0;
      this.widths = this.columns.map(
        /** Converts native cumulative edges to physical column widths. @param position - End edge. @returns Width. */
        (position) => {
          const width = position - previous;
          previous = position;
          return width;
        },
      );
      for (const row of rows) {
        let position = 0,
          previousColumn = -1;
        const boxes = row.GetTabBoxes();
        boxes.forEach(
          /** Captures each original cell's span over the source union grid. @param box - Original box. @param index - Cell coordinate. @returns Nothing. */
          (box, index) => {
            position =
              index === boxes.length - 1 ? total : position + box.GetFrameSize().GetWidth();
            const column = this.FindColumn(position);
            this.spans.set(box, column - previousColumn);
            previousColumn = column;
          },
        );
      }
    }
  }
  /** Finds the native sorted-vector lower bound using SwWriteTableCol fuzzy20 ordering. @param position - Original cumulative box edge. @returns Source column index. */
  private FindColumn(position: number): number {
    let low = 0,
      high = this.columns.length;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if ((this.columns[middle] as number) + 20 < position) low = middle + 1;
      else high = middle;
    }
    return low;
  }
  /** Reads native union-grid column widths. @returns Source widths in twips. */
  public GetColumnWidths(): readonly number[] {
    return this.widths;
  }
  /** Reads a connected original box's native union-grid span. @param box - Original cell. @returns Column span. */
  public GetColumnSpan(box: SwTableBox): number {
    return this.spans.get(box) as number;
  }
}
