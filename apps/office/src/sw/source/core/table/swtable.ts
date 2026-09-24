/** @fileoverview Implements the bounded SwTable, SwTableLine and SwTableBox graph from pinned swtable.cxx. */

import type { SwTableBoxStartNode, SwTableNode } from "../docnode/node";
import type { SwTextNode } from "../txtnode/ndtxt";

/** Physical table geometry imported from Writer table style properties, in twips. */
export interface SwTableFormat {
  readonly width?: number | undefined;
  readonly align?: "left" | "center" | "right" | "margins" | undefined;
  readonly marginLeft?: number | undefined;
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
  private readonly paragraphs: SwTextNode[] = [];

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

  /** Adds one canonical text node to this cell. @param paragraph - Cell text node. @returns Nothing. */
  public AddParagraph(paragraph: SwTextNode): void {
    this.paragraphs.push(paragraph);
  }

  /** Returns cell text nodes in document order. @returns Paragraphs. */
  public GetParagraphs(): readonly SwTextNode[] {
    return this.paragraphs;
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

  /** Replaces table geometry. @param value - New values. @returns Nothing. */
  public SetFormat(value: SwTableFormat): void {
    this.format = { ...value };
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

  /** Returns ordered rows. @returns Rows. */
  public GetTabLines(): readonly SwTableLine[] {
    return this.lines;
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
