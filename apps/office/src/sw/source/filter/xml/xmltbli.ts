/** @fileoverview Adapts xmloff table SAX callbacks to canonical Writer SwTable sections, following pinned xmltbli.cxx. */
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { importBoxProperties } from "../../../../xmloff/source/style/bordrhdl";
import { RES_BOX, RES_UL_SPACE, RES_COLLAPSING_BORDERS } from "../../../inc/hintids";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SvxULSpaceItem } from "../../../../editeng/source/items/frmitems";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import { SvXMLImport } from "../../../../xmloff/source/core/xmlimp";

import type { OdfTableStyle } from "../../../../xmloff/source/table/XMLTableImport";
import type { SwDoc } from "../../core/doc/doc";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { type SwTable, type SwTableBox, SwTableLine } from "../../core/table/swtable";

/** Keeps table import state scoped to one Writer XML stream coordinator. */
export class SwXMLTableImport extends SvXMLImport {
  private readonly tableStyles = new Map<string, OdfTableStyle>();
  private activeTable: SwTable | undefined;
  private activeRow: SwTableLine | undefined;
  protected activeCell: SwTableBox | undefined;
  protected cellParagraphCount = 0;
  private rowCellIndex = 0;
  private readonly columnWidths: number[] = [];
  private pendingCovered = 0;
  private inHeaderRows = false;
  private headerRowCount = 0;

  /** Binds the table callbacks to the temporary document. @param document - Canonical Writer graph. @returns Nothing. */
  public constructor(public readonly document: SwDoc) {
    super();
  }

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
    /* istanbul ignore next -- SAX table contexts cannot nest under a table context. */
    if (this.activeTable !== undefined) throw new Error("Nested ODF tables are not supported.");
    const style = this.resolveTableStyle(styleName, "table") as Extract<
      OdfTableStyle,
      { family: "table" }
    >;
    this.activeTable = this.document.nodes.MakeTableNode(name);
    const frameFormat = this.activeTable.GetFrameFormat();
    const hasMargins = style.marginLeft !== undefined || style.marginRight !== undefined;
    if (hasMargins) {
      const item = frameFormat.GetLRSpace().Clone();
      item.SetLeft(style.marginLeft ?? 0);
      item.SetRight(style.marginRight ?? 0);
      frameFormat.SetFormatAttr(item);
    }
    if (style.align !== undefined) {
      const item = frameFormat.GetHoriOrient().Clone();
      switch (style.align) {
        case "left":
          item.SetHoriOrient(
            style.width === undefined
              ? hasMargins
                ? HoriOrientation.NONE
                : HoriOrientation.FULL
              : hasMargins
                ? HoriOrientation.LEFT_AND_WIDTH
                : HoriOrientation.LEFT,
          );
          break;
        case "center":
          item.SetHoriOrient(
            style.width === undefined ? HoriOrientation.FULL : HoriOrientation.CENTER,
          );
          break;
        case "right":
          item.SetHoriOrient(
            style.width === undefined ? HoriOrientation.FULL : HoriOrientation.RIGHT,
          );
          break;
        case "margins":
          item.SetHoriOrient(hasMargins ? HoriOrientation.NONE : HoriOrientation.FULL);
          break;
      }
      frameFormat.SetFormatAttr(item);
    }
    if (style.marginTop !== undefined || style.marginBottom !== undefined)
      frameFormat.SetFormatAttr(
        new SvxULSpaceItem(
          style.marginTop ?? 0,
          style.marginBottom ?? 0,
          RES_UL_SPACE,
          frameFormat.GetULSpace().GetContext(),
        ),
      );
    if (style.width !== undefined) {
      const item = frameFormat.GetFrameSize().Clone();
      item.SetWidth(style.width);
      frameFormat.SetFormatAttr(item);
    }
    if (style.borderModel !== undefined)
      frameFormat.SetFormatAttr(
        new SfxBoolItem(RES_COLLAPSING_BORDERS, style.borderModel === "collapsing"),
      );
    if (style.layoutSplit !== undefined)
      frameFormat.SetFormatAttr(new SwFormatLayoutSplit(style.layoutSplit));
    this.columnWidths.length = 0;
    this.headerRowCount = 0;
    this.inHeaderRows = false;
  }

  /** Starts the repeated header row group. @returns Nothing. */
  public beginTableHeaderRows(): void {
    this.inHeaderRows = true;
  }

  /** Persists the count of imported repeated header rows. @returns Nothing. */
  public endTableHeaderRows(): void {
    this.inHeaderRows = false;
    const table = this.requireTable();
    table.SetRowsToRepeat(this.headerRowCount);
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
    this.columnWidths.push(style.columnWidth ?? 0);
  }

  /** Opens one ordered table row with the declared column count. */
  /** Projects one canonical Writer table value. @param argument1 - Callback input. @returns Callback result. */ public beginTableRow(
    styleName: string,
  ): void {
    const table = this.requireTable();
    /* istanbul ignore next -- SAX row contexts cannot nest under a row context. */
    if (this.activeRow !== undefined) throw new Error("Nested ODF table rows are not supported.");
    const style = this.resolveTableStyle(styleName, "table-row") as Extract<
      OdfTableStyle,
      { family: "table-row" }
    >;
    const count = this.columnWidths.length;
    if (count === 0) throw new Error("ODF table has no declared columns.");
    const frameFormat = table.GetTableNode().GetDoc().MakeTableLineFormat();
    this.activeRow = new SwTableLine(frameFormat);
    if (style.keepTogether !== undefined)
      frameFormat.SetFormatAttr(new SwFormatRowSplit(!style.keepTogether));
    if (style.minHeight !== undefined)
      frameFormat.SetFormatAttr(
        new SwFormatFrameSize(
          SwFrameSize.Minimum,
          0,
          Math.min(65535, Math.max(1, style.minHeight)),
        ),
      );
    else if (style.height !== undefined)
      frameFormat.SetFormatAttr(
        new SwFormatFrameSize(SwFrameSize.Fixed, 0, Math.min(65535, Math.max(1, style.height))),
      );
    table.AddLine(this.activeRow);
    this.pendingCovered = 0;
    if (this.inHeaderRows) this.headerRowCount += 1;
    this.rowCellIndex = 0;
  }

  /** Selects one canonical cell and its first paragraph. */
  /** Creates one native box over declared grid columns. @param styleName - Cell style. @param columnSpan - Number of source grid columns. @returns Nothing. */ public beginTableCell(
    styleName: string,
    columnSpan = 1,
  ): void {
    const row = this.activeRow;
    /* istanbul ignore next -- SAX cell contexts are created only by an open row and cannot overlap. */
    if (row === undefined || this.activeCell !== undefined)
      throw new Error("ODF table cell is outside a row.");
    if (this.pendingCovered !== 0 || this.rowCellIndex + columnSpan > this.columnWidths.length)
      throw new Error("ODF table row contains more cells than declared columns.");
    const width = this.columnWidths
        .slice(this.rowCellIndex, this.rowCellIndex + columnSpan)
        .reduce(
          /** Sums native declared columns for this source cell span. @param sum - Prior extent. @param value - Native grid width. @returns Cell width. */ (
            sum,
            value,
          ) => sum + value,
          0,
        ),
      cell = this.document.nodes.AppendTableBox(this.requireTable(), row, {
        frameSize: new SwFormatFrameSize(SwFrameSize.Variable, width, 0),
      });
    const style = this.resolveTableStyle(styleName, "table-cell") as Extract<
      OdfTableStyle,
      { family: "table-cell" }
    >;
    const frameFormat = cell.GetFrameFormat(),
      box = importBoxProperties(style, RES_BOX);
    if (box !== undefined) frameFormat.SetFormatAttr(box);
    if (style.verticalAlign !== undefined)
      frameFormat.SetFormatAttr(
        new SwFormatVertOrient(
          0,
          style.verticalAlign === "middle"
            ? VertOrientation.CENTER
            : style.verticalAlign === "bottom"
              ? VertOrientation.BOTTOM
              : style.verticalAlign === "top"
                ? VertOrientation.TOP
                : VertOrientation.NONE,
        ),
      );
    this.activeCell = cell;
    this.cellParagraphCount = 0;
    this.rowCellIndex += columnSpan;
    this.pendingCovered = columnSpan - 1;
  }

  /** Consumes one covered union-grid slot without creating a duplicate native box. @returns Nothing. */
  public coveredTableCell(): void {
    if (this.pendingCovered === 0) throw new Error("ODF covered table cell has no spanning cell.");
    this.pendingCovered--;
  }

  /** Closes a cell after its paragraph contexts. */
  /** Projects one canonical Writer table value.  @returns Callback result. */ public endTableCell(): void {
    this.activeCell = undefined;
  }

  /** Validates the row's cell cardinality. */
  /** Projects one canonical Writer table value.  @returns Callback result. */ public endTableRow(): void {
    if (
      this.activeRow === undefined ||
      this.rowCellIndex !== this.columnWidths.length ||
      this.pendingCovered !== 0
    )
      throw new Error("ODF table row cell count differs from declared columns.");
    this.activeRow = undefined;
  }

  /** Closes the current table. */
  /** Projects one canonical Writer table value.  @returns Callback result. */ public endTable(): void {
    this.requireTable().SetRowsToRepeat(this.headerRowCount);
    this.activeTable = undefined;
  }

  /** Records a table-owned pagination marker at the next row boundary. */
  /** Projects one canonical Writer table value.  @returns Callback result. */ public addTableSoftPageBreak(): void {
    this.requireTable().AddSoftPageBreak();
  }

  /** Requires a currently open table. @returns Canonical table. */
  private requireTable(): SwTable {
    /* istanbul ignore next -- Only descendants of the table SAX context call this method. */
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
