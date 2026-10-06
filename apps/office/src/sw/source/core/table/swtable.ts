/** @fileoverview Implements the bounded SwTable, SwTableLine and SwTableBox graph from pinned swtable.cxx. */

import type { SwTableBoxStartNode, SwTableNode } from "../docnode/node";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwTextNode } from "../txtnode/ndtxt";

/** Physical table geometry imported from Writer table style properties, in twips. */
export interface SwTableFormat {
  readonly headerRows?: number | undefined;
  readonly repeatHeaderRows?: boolean | undefined;
  readonly width?: number | undefined;
  readonly horiOrient?: HoriOrientation | undefined;
  readonly align?: "left" | "center" | "right" | "margins" | undefined;
  readonly marginLeft?: number | undefined;
  readonly marginRight?: number | undefined;
  readonly marginTop?: number | undefined;
  readonly marginBottom?: number | undefined;
  readonly borderModel?: "collapsing" | "separating" | undefined;
}

/** Bounded row geometry owned by SwTableLine. */
export interface SwTableLineFormat {
  readonly minHeight?: number | undefined;
  readonly keepTogether?: boolean | undefined;
}

/** Bounded cell geometry owned by SwTableBox. */
export interface SwTableBoxFormat {
  readonly padding?: number | undefined;
  readonly border?: string | undefined;
  readonly verticalAlign?: "top" | "middle" | "bottom" | undefined;
}

/** Owns one cell section and its ordered paragraphs. */
export class SwTableBox {
  /** Creates a cell. @param format - Imported cell geometry. @returns Nothing. */
  /** Projects one canonical Writer table value. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ public constructor(
    private readonly startNode: SwTableBoxStartNode,
    private format: SwTableBoxFormat = {},
  ) {}

  /** Returns the cell's node-array section. @returns Cell start node. */
  public GetStartNode(): SwTableBoxStartNode {
    return this.startNode;
  }

  /** Returns cell geometry. @returns Immutable values. */
  public GetFormat(): SwTableBoxFormat {
    return { ...this.format };
  }

  /** Replaces cell geometry. @param value - New values. @returns Nothing. */
  public SetFormat(value: SwTableBoxFormat): void {
    this.format = { ...value };
  }

  /** Reads the cell's current native node-array section, including split/join history changes. @returns Text nodes in document order. */
  public GetParagraphs(): readonly SwTextNode[] {
    const nodes = this.startNode.GetNodes();
    return nodes
      .entries()
      .slice(this.startNode.GetIndex() + 1, this.startNode.EndOfSectionNode().GetIndex())
      .filter(
        /** Selects actual cell text owners. @param node - Section member. @returns Whether text. */
        (node): node is SwTextNode => node instanceof SwTextNode,
      );
  }
}

/** Owns one ordered set of Writer table cells and row geometry. */
export class SwTableLine {
  private readonly boxes: SwTableBox[] = [];

  /** Creates a row. @param format - Imported row geometry. @returns Nothing. */
  public constructor(private format: SwTableLineFormat = {}) {}

  /** Returns row geometry. @returns Immutable values. */
  public GetFormat(): SwTableLineFormat {
    return { ...this.format };
  }

  /** Replaces row geometry. @param value - New values. @returns Nothing. */
  public SetFormat(value: SwTableLineFormat): void {
    this.format = { ...value };
  }

  /** Adds a cell to this row. @param box - Canonical cell. @returns Nothing. */
  public AddBox(box: SwTableBox): void {
    this.boxes.push(box);
  }

  /** Returns ordered cells. @returns Cell view. */
  public GetTabBoxes(): readonly SwTableBox[] {
    return this.boxes;
  }
}

/** Owns ordered rows, columns and a node-array section like upstream SwTable. */
export class SwTable {
  public static readonly SEARCH_NONE = 0;
  public static readonly SEARCH_ROW = 1;
  private readonly lines: SwTableLine[] = [];
  private readonly columnWidths: number[] = [];
  private readonly softPageBreakRows: number[] = [];

  /** Creates one table graph at its owning start node. @param tableNode - Node-array owner. @param name - ODF table name. @param format - Physical table geometry. @returns Nothing. */
  public constructor(
    private readonly tableNode: SwTableNode,
    private readonly name: string,
    private format: SwTableFormat = {},
  ) {}

  /** Returns the owning start node. @returns Table node. */
  public GetTableNode(): SwTableNode {
    return this.tableNode;
  }

  /** Returns the stable table name. @returns Name. */
  public GetName(): string {
    return this.name;
  }

  /** Returns table geometry. @returns Immutable values. */
  public GetFormat(): SwTableFormat {
    return { ...this.format };
  }

  /** Reads native orientation, admitting historical ODF geometry at the table boundary. @returns Frame orientation. */
  public GetHoriOrient(): HoriOrientation {
    if (this.format.horiOrient !== undefined) return this.format.horiOrient;
    switch (this.format.align) {
      case "left":
        return this.format.width === undefined
          ? this.format.marginLeft !== undefined || this.format.marginRight !== undefined
            ? HoriOrientation.NONE
            : HoriOrientation.FULL
          : this.format.marginLeft !== undefined || this.format.marginRight !== undefined
            ? HoriOrientation.LEFT_AND_WIDTH
            : HoriOrientation.LEFT;
      case "center":
        return this.format.width === undefined ? HoriOrientation.FULL : HoriOrientation.CENTER;
      case "right":
        return this.format.width === undefined ? HoriOrientation.FULL : HoriOrientation.RIGHT;
      case "margins":
        return this.format.marginLeft !== undefined || this.format.marginRight !== undefined
          ? HoriOrientation.NONE
          : HoriOrientation.FULL;
      default:
        return HoriOrientation.FULL;
    }
  }

  /** Replaces table geometry. @param value - New values. @returns Nothing. */
  public SetFormat(value: SwTableFormat): void {
    this.format = { ...value };
  }

  /** Returns the native headline count capped by actual table lines. @returns Repeated line count. */
  public GetRowsToRepeat(): number {
    return Math.min(
      this.lines.length,
      this.format.repeatHeaderRows === true ? (this.format.headerRows ?? 0) & 0xffff : 0,
    );
  }

  /** Sets the native unsigned headline count in the existing table format. @param count - Authored count. @returns Nothing. */
  public SetRowsToRepeat(count: number): void {
    const rows = count & 0xffff;
    this.format = { ...this.format, headerRows: rows, repeatHeaderRows: rows !== 0 };
  }

  /** Appends one defined column width. @param twips - Width in twips. @returns Nothing. */
  public AddColumnWidth(twips: number): void {
    this.columnWidths.push(twips);
  }

  /** Returns ordered column widths. @returns Widths in twips. */
  public GetColumnWidths(): readonly number[] {
    return this.columnWidths;
  }

  /** Changes one existing column's physical width. @param index - Zero-based column. @param twips - Positive width. @returns Nothing. */
  public SetColumnWidth(index: number, twips: number): void {
    if (index < 0 || index >= this.columnWidths.length || !Number.isFinite(twips) || twips <= 0)
      throw new Error("Writer table column width is invalid.");
    this.columnWidths[index] = twips;
  }

  /** Adds one row to the canonical table. @param line - Row. @returns Nothing. */
  public AddLine(line: SwTableLine): void {
    this.lines.push(line);
  }

  /** Removes a retained row during native table history. @param line - Connected row. @returns Nothing. */
  public RemoveLine(line: SwTableLine): void {
    const index = this.lines.indexOf(line);
    if (index < 0) throw new Error("Writer table row is not connected.");
    this.lines.splice(index, 1);
  }

  /** Returns ordered rows. @returns Rows. */
  public GetTabLines(): readonly SwTableLine[] {
    return this.lines;
  }

  /** Collects native boxes for the represented flat shared-column grid. @param start - First endpoint section. @param end - Other endpoint section. @param boxes - Replaced sorted selection. @param search - Rectangle or complete rows. @returns Nothing. */
  public CreateSelection(
    start: SwTableBoxStartNode,
    end: SwTableBoxStartNode,
    boxes: SwTableBox[],
    search: 0 | 1,
  ): void {
    boxes.length = 0;
    const endpoints: { row: number; column: number }[] = [];
    for (const [row, line] of this.lines.entries())
      for (const [column, box] of line.GetTabBoxes().entries())
        if (box.GetStartNode() === start || box.GetStartNode() === end) {
          boxes.push(box);
          endpoints.push({ row, column });
          if (start === end) endpoints.push({ row, column });
        }
    if (endpoints.length !== 2) return;
    const first = endpoints[0] as { row: number; column: number },
      last = endpoints[1] as { row: number; column: number };
    const left = Math.min(first.column, last.column),
      right = Math.max(first.column, last.column);
    boxes.length = 0;
    for (let row = first.row; row <= last.row; row++)
      for (const [column, box] of (this.lines[row] as SwTableLine).GetTabBoxes().entries())
        if (search === SwTable.SEARCH_ROW || (column >= left && column <= right)) boxes.push(box);
  }

  /** Stores the table-owned soft pagination hint. @returns Nothing. */
  public AddSoftPageBreak(): void {
    this.softPageBreakRows.push(this.lines.length);
  }

  /** Returns the table-owned soft pagination hint. @returns Whether present. */
  public GetSoftPageBreakRows(): readonly number[] {
    return this.softPageBreakRows;
  }
}
