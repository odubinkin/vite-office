/** @fileoverview Adapts xmloff table SAX callbacks to canonical Writer SwTable sections, following pinned xmltbli.cxx. */

import type { OdfTableStyle } from "../../../../xmloff/source/table/XMLTableImport";
import type { SwDoc } from "../../core/doc/doc";
import type {
  SwTable,
  SwTableBox,
  SwTableLine,
  SwTableFormat,
  SwTableLineFormat,
  SwTableBoxFormat,
} from "../../core/table/swtable";

/** Keeps table import state scoped to one Writer XML stream coordinator. */
export class SwXMLTableImport {
  private readonly tableStyles = new Map<string, OdfTableStyle>();
  private activeTable: SwTable | undefined;
  private activeRow: SwTableLine | undefined;
  protected activeCell: SwTableBox | undefined;
  protected cellParagraphCount = 0;
  private rowCellIndex = 0;

  /** Binds the table callbacks to the temporary document. @param document - Canonical Writer graph. @returns Nothing. */
  public constructor(public readonly document: SwDoc) {}

  /** Retains a referenced table style until SAX body import. */
  /** Projects one canonical Writer table value. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ public registerTableStyle(
    name: string,
    style: OdfTableStyle,
  ): void {
    if (this.tableStyles.has(name)) throw new Error(`Duplicate ODF table style: ${name}`);
    this.tableStyles.set(name, style);
  }

  /** Opens one canonical table at the current body position. */
  /** Projects one canonical Writer table value. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ public beginTable(
    name: string,
    styleName: string,
  ): void {
    /* v8 ignore next -- SAX table contexts cannot nest under a table context. */
    if (this.activeTable !== undefined) throw new Error("Nested ODF tables are not supported.");
    const style = this.resolveTableStyle(styleName, "table");
    this.activeTable = this.document.nodes.MakeTableNode(
      name,
      tableStyleValues(style) as SwTableFormat,
    );
  }

  /** Appends one physical table column. */
  /** Projects one canonical Writer table value. @param argument1 - Callback input. @returns Callback result. */ public addTableColumn(
    styleName: string,
  ): void {
    const table = this.requireTable();
    const style = this.resolveTableStyle(styleName, "table-column") as Extract<
      OdfTableStyle,
      { family: "table-column" }
    >;
    table.AddColumnWidth(style.columnWidth ?? 0);
  }

  /** Opens one ordered table row with the declared column count. */
  /** Projects one canonical Writer table value. @param argument1 - Callback input. @returns Callback result. */ public beginTableRow(
    styleName: string,
  ): void {
    const table = this.requireTable();
    /* v8 ignore next -- SAX row contexts cannot nest under a row context. */
    if (this.activeRow !== undefined) throw new Error("Nested ODF table rows are not supported.");
    const style = this.resolveTableStyle(styleName, "table-row");
    const count = table.GetColumnWidths().length;
    if (count === 0) throw new Error("ODF table has no declared columns.");
    this.activeRow = this.document.nodes.AppendTableRow(
      table,
      count,
      tableStyleValues(style) as SwTableLineFormat,
    );
    this.rowCellIndex = 0;
  }

  /** Selects one canonical cell and its first paragraph. */
  /** Projects one canonical Writer table value. @param argument1 - Callback input. @returns Callback result. */ public beginTableCell(
    styleName: string,
  ): void {
    const row = this.activeRow;
    /* v8 ignore next -- SAX cell contexts are created only by an open row and cannot overlap. */
    if (row === undefined || this.activeCell !== undefined)
      throw new Error("ODF table cell is outside a row.");
    const cell = row.GetTabBoxes()[this.rowCellIndex];
    if (cell === undefined)
      throw new Error("ODF table row contains more cells than declared columns.");
    const style = this.resolveTableStyle(styleName, "table-cell");
    cell.SetFormat(tableStyleValues(style) as SwTableBoxFormat);
    this.activeCell = cell;
    this.cellParagraphCount = 0;
    this.rowCellIndex += 1;
  }

  /** Closes a cell after its paragraph contexts. */
  /** Projects one canonical Writer table value.  @returns Callback result. */ public endTableCell(): void {
    this.activeCell = undefined;
  }

  /** Validates the row's cell cardinality. */
  /** Projects one canonical Writer table value.  @returns Callback result. */ public endTableRow(): void {
    if (this.activeRow === undefined || this.rowCellIndex !== this.activeRow.GetTabBoxes().length)
      throw new Error("ODF table row cell count differs from declared columns.");
    this.activeRow = undefined;
  }

  /** Closes the current table. */
  /** Projects one canonical Writer table value.  @returns Callback result. */ public endTable(): void {
    this.activeTable = undefined;
  }

  /** Records a table-owned pagination marker at the next row boundary. */
  /** Projects one canonical Writer table value.  @returns Callback result. */ public addTableSoftPageBreak(): void {
    this.requireTable().AddSoftPageBreak();
  }

  /** Requires a currently open table. @returns Canonical table. */
  private requireTable(): SwTable {
    /* v8 ignore next -- Only descendants of the table SAX context call this method. */
    if (this.activeTable === undefined) throw new Error("ODF table content is outside a table.");
    return this.activeTable;
  }

  /** Resolves a table-family style or its omitted default. @param name - Style reference. @param family - Required family. @returns Table geometry. */
  private resolveTableStyle(name: string, family: OdfTableStyle["family"]): OdfTableStyle {
    if (name === "") return { family };
    const style = this.tableStyles.get(name);
    if (style === undefined) return { family };
    if (style.family !== family)
      throw new Error(`ODF ${family} style has the wrong family: ${name}`);
    return style;
  }
}

/** Removes the ODF style-family tag and absent optional values before assigning canonical geometry. @param style - Parsed table style. @returns Physical values. */
function tableStyleValues(style: OdfTableStyle): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(style).filter(
      /** Projects one canonical Writer table value. @param argument1 - Callback input. @returns Callback result. */ ([
        key,
        value,
      ]) => key !== "family" && value !== undefined,
    ),
  );
}
