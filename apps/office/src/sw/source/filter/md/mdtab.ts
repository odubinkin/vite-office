/** @fileoverview Native Markdown table callback cursor from sw/source/filter/md/mdtab.cxx. */
import type { SwMarkdownParser } from "./swmd";
import type { SwTable } from "../../core/table/swtable";
/** One native table and callback row/column counters, initially -1. */
export class MDTable {
  private table: SwTable | null = null;
  private row = -1;
  private column = -1;
  /** Original constructor registers this actual cursor with its parser. @param parser - Borrowed native parser, which outlives this table cursor. @returns Cursor. */
  public constructor(private readonly parser: SwMarkdownParser) {
    parser.RegisterTable(this);
  }
  /** Original destructor removes this actual borrowed cursor from its parser's table list. @returns Nothing. */
  public SourceDispose(): void {
    this.parser.DeRegisterTable(this);
  }
  /** Stores the actual document-owned table. @param table - Native table. @returns Nothing. */
  public SetTable(table: SwTable | null): void {
    this.table = table;
  }
  /** Reads the actual table. @returns Native owner. */
  public GetTable(): SwTable | null {
    return this.table;
  }
  /** Reads the current row. @returns Row. */
  public GetCurRow(): number {
    return this.row;
  }
  /** Reads the current column. @returns Column. */
  public GetCurCol(): number {
    return this.column;
  }
  /** Advances row and resets column. @returns Nothing. */
  public IncCurRow(): void {
    this.row++;
    this.column = -1;
  }
  /** Advances column. @returns Nothing. */
  public IncCurCol(): void {
    this.column++;
  }
}
