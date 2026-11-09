/** @fileoverview Adapts xmloff table SAX callbacks to canonical Writer SwTable sections, following pinned xmltbli.cxx. */
import type { XMLTextCursor } from "../../../../xmloff/inc/txtimp";
import type { XMLTextImportHelper } from "../../../../xmloff/source/text/txtimp";
import { SwXCell } from "../../core/unocore/unotbl";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { importBoxProperties } from "./xmlimpit";
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

/** Streaming view of one native XML table master's reserved slots and covered boxes. */
interface SwXMLVerticalSpan {
  readonly firstRow: number;
  readonly endRow: number;
  readonly columns: number;
  readonly styleName: string;
  readonly master: SwTableBox;
  readonly covered: SwTableBox[];
}

/** Active source table context. Rows, cursors and vertical reservations belong to this table only. */
class SwXMLTableContextState {
  activeRow: SwTableLine | undefined;
  activeCell: SwTableBox | undefined;
  oldCursor: XMLTextCursor | undefined;
  rowCellIndex = 0;
  readonly columnWidths: number[] = [];
  readonly verticalSpans = new Map<number, SwXMLVerticalSpan>();
  pendingCovered = 0;
  inHeaderRows = false;
  headerRowCount = 0;

  /** Binds the connected native table to its SAX import state. @param table - Actual table owner. @returns State. */
  constructor(readonly table: SwTable) {}
}

/** Keeps the native table contexts scoped to one Writer XML stream coordinator. */
export class SwXMLTableImport extends SvXMLImport {
  private readonly tableStyles = new Map<string, OdfTableStyle>();
  private readonly tableContexts: SwXMLTableContextState[] = [];
  protected textImport: XMLTextImportHelper | undefined;

  /** Borrows the innermost active table context. @returns Original row and cell state. */
  private get tableContext(): SwXMLTableContextState {
    const context = this.tableContexts.at(-1);
    if (!context) throw new Error("ODF table content is outside a table.");
    return context;
  }

  /** Releases saved parent cursors after an interrupted nested import. @returns Nothing. */
  protected DisposeTableContexts(): void {
    for (const context of this.tableContexts.splice(0).reverse()) context.oldCursor?.dispose();
  }

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
    const parent = this.tableContexts.at(-1);
    if (parent && !parent.activeCell) throw new Error("ODF nested table is outside a cell.");
    const style = this.resolveTableStyle(styleName, "table") as Extract<
      OdfTableStyle,
      { family: "table" }
    >;
    const cursor = this.textImport?.GetCursor() as
      import("../../core/unocore/unoobj").SwXTextCursor | undefined;
    const table = cursor
      ? this.document.nodes.MakeTableNodeBefore(
          cursor.GetPaM().GetPoint().GetNode() as SwTextNode,
          name,
          {},
        )
      : this.document.nodes.MakeTableNode(name);
    this.tableContexts.push(new SwXMLTableContextState(table));
    const frameFormat = table.GetFrameFormat();
    const hasMargins = style.marginLeft !== undefined || style.marginRight !== undefined;
    if (hasMargins) {
      const item = frameFormat.GetLRSpace().Clone();
      item.SetLeft(SvxIndentValue.twips(style.marginLeft ?? 0));
      item.SetRight(SvxIndentValue.twips(style.marginRight ?? 0));
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
  }

  /** Starts the repeated header row group. @returns Nothing. */
  public beginTableHeaderRows(): void {
    this.tableContext.inHeaderRows = true;
  }

  /** Persists the count of imported repeated header rows. @returns Nothing. */
  public endTableHeaderRows(): void {
    this.tableContext.inHeaderRows = false;
    const table = this.requireTable();
    table.SetRowsToRepeat(this.tableContext.headerRowCount);
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
    this.tableContext.columnWidths.push(style.columnWidth ?? 0);
  }

  /** Opens one ordered table row with the declared column count. */
  /** Projects one canonical Writer table value. @param argument1 - Callback input. @returns Callback result. */ public beginTableRow(
    styleName: string,
  ): void {
    const context = this.tableContext;
    const table = context.table;
    /* istanbul ignore next -- SAX row contexts cannot nest under a row context. */
    if (context.activeRow !== undefined)
      throw new Error("Nested ODF table rows are not supported.");
    const style = this.resolveTableStyle(styleName, "table-row") as Extract<
      OdfTableStyle,
      { family: "table-row" }
    >;
    const count = context.columnWidths.length;
    if (count === 0) throw new Error("ODF table has no declared columns.");
    const rowIndex = table.GetTabLines().length;
    for (const [column, span] of context.verticalSpans)
      if (span.endRow <= rowIndex) context.verticalSpans.delete(column);
    const frameFormat = table.GetTableNode().GetDoc().MakeTableLineFormat();
    context.activeRow = new SwTableLine(frameFormat);
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
    table.AddLine(context.activeRow);
    context.pendingCovered = 0;
    if (context.inHeaderRows) context.headerRowCount += 1;
    context.rowCellIndex = 0;
  }

  /** Creates one native box over declared grid columns. @param styleName - Cell style. @param columnSpan - Number of source grid columns. @param rowSpan - Number of source grid rows. @returns Nothing. */ public beginTableCell(
    styleName: string,
    columnSpan = 1,
    rowSpan = 1,
  ): void {
    const context = this.tableContext;
    /* istanbul ignore next -- SAX cell contexts are created only by an open row and cannot overlap. */
    if (context.activeRow === undefined || context.activeCell !== undefined)
      throw new Error("ODF table cell is outside a row.");
    this.InsertImplicitCoveredBoxes();
    if (
      context.pendingCovered !== 0 ||
      context.rowCellIndex + columnSpan > context.columnWidths.length
    )
      throw new Error("ODF table row contains more cells than declared columns.");
    const firstColumn = context.rowCellIndex;
    for (const column of context.verticalSpans.keys())
      if (firstColumn < column && column < firstColumn + columnSpan)
        throw new Error("ODF table cell overlaps a covered cell.");
    const cell = this.CreateBox(styleName, columnSpan);
    if (rowSpan > 1) {
      const firstRow = context.table.GetTabLines().length - 1;
      const endRow = Math.min(firstRow + rowSpan, 65535);
      cell.setRowSpan(endRow - firstRow);
      context.verticalSpans.set(firstColumn, {
        firstRow,
        endRow,
        columns: columnSpan,
        styleName,
        master: cell,
        covered: [],
      });
    }
    context.activeCell = cell;
    if (this.textImport) {
      context.oldCursor = this.textImport.GetCursor();
      this.textImport.SetCursor(new SwXCell(cell).createTextCursor());
    }
    context.pendingCovered = columnSpan - 1;
  }

  /** Appends a real cell over the declared width of its original grid slots. @param styleName - Native style name. @param columnSpan - Source column count. @returns Actual core box. */
  private CreateBox(styleName: string, columnSpan: number): SwTableBox {
    const context = this.tableContext;
    const row = context.activeRow;
    if (row === undefined) throw new Error("ODF table cell is outside a row.");
    const width = context.columnWidths
        .slice(context.rowCellIndex, context.rowCellIndex + columnSpan)
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
    context.rowCellIndex += columnSpan;
    return cell;
  }

  /** Inserts the native empty box for a vertically covered position. @param span - Actual owning master reservation. @returns Nothing. */
  private InsertCoveredBox(span: SwXMLVerticalSpan): void {
    const rowIndex = this.requireTable().GetTabLines().length - 1;
    const cell = this.CreateBox(span.styleName, span.columns);
    cell.setRowSpan(rowIndex - span.endRow);
    span.covered.push(cell);
  }

  /** Materializes reserved vertical boxes without requiring a redundant covered-cell tag. @returns Nothing. */
  private InsertImplicitCoveredBoxes(): void {
    const context = this.tableContext;
    if (context.pendingCovered) return;
    let span = context.verticalSpans.get(context.rowCellIndex);
    while (span !== undefined) {
      this.InsertCoveredBox(span);
      span = context.verticalSpans.get(context.rowCellIndex);
    }
  }

  /** Consumes a covered grid slot. The default native TABLE_ROW_KEEP setting ignores authored covered-cell styles. @returns Nothing. */
  public coveredTableCell(): void {
    const context = this.tableContext;
    if (context.pendingCovered > 0) {
      context.pendingCovered--;
      return;
    }
    const span = context.verticalSpans.get(context.rowCellIndex);
    if (span === undefined) throw new Error("ODF covered table cell has no spanning cell.");
    this.InsertCoveredBox(span);
    context.pendingCovered = span.columns - 1;
  }

  /** Closes a cell after its paragraph contexts. */
  /** Projects one canonical Writer table value.  @returns Callback result. */ public endTableCell(): void {
    const context = this.tableContext;
    if (this.textImport && context.oldCursor) {
      const cursor = this.textImport.GetCursor();
      const content = context.activeCell?.GetContentNodes();
      if (content?.at(-2)?.IsTextNode()) this.textImport.DeleteParagraph();
      this.textImport.SetCursor(context.oldCursor);
      cursor.dispose();
      context.oldCursor = undefined;
    }
    context.activeCell = undefined;
  }

  /** Validates the row's cell cardinality. */
  /** Projects one canonical Writer table value.  @returns Callback result. */ public endTableRow(): void {
    const context = this.tableContext;
    this.InsertImplicitCoveredBoxes();
    if (
      context.activeRow === undefined ||
      context.rowCellIndex !== context.columnWidths.length ||
      context.pendingCovered !== 0
    )
      throw new Error("ODF table row cell count differs from declared columns.");
    context.activeRow = undefined;
  }

  /** Closes the current table. */
  /** Projects one canonical Writer table value.  @returns Callback result. */ public endTable(): void {
    const context = this.tableContext;
    const table = context.table;
    const rows = table.GetTabLines().length;
    for (const span of context.verticalSpans.values()) {
      if (span.endRow <= rows) continue;
      const adjusted = rows - span.firstRow;
      span.master.setRowSpan(adjusted);
      for (const [index, box] of span.covered.entries()) box.setRowSpan(index + 1 - adjusted);
    }
    context.verticalSpans.clear();
    table.SetRowsToRepeat(context.headerRowCount);
    this.tableContexts.pop();
  }

  /** Records a table-owned pagination marker at the next row boundary. */
  /** Projects one canonical Writer table value.  @returns Callback result. */ public addTableSoftPageBreak(): void {
    this.requireTable().AddSoftPageBreak();
  }

  /** Requires a currently open table. @returns Canonical table. */
  private requireTable(): SwTable {
    return this.tableContext.table;
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
