/** @fileoverview Adapts xmloff table SAX callbacks to canonical Writer SwTable sections, following pinned xmltbli.cxx. */
import type { XMLTextCursor } from "../../../../xmloff/inc/txtimp";
import type { XMLTextImportHelper } from "../../../../xmloff/source/text/txtimp";
import { SwXCell } from "../../core/unocore/unotbl";
import { CopyNodes } from "../../core/docnode/ndcopy";
import { MINLAY } from "../../../inc/swtypes";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { importBoxProperties, importFrameVisualProperties } from "./xmlimpit";
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
  activeCellStyleName = "";
  activeCellColumnSpan = 1;
  oldCursor: XMLTextCursor | undefined;
  rowCellIndex = 0;
  readonly columnWidths: number[] = [];
  columnDefaultCellStyleNames: string[] | undefined;
  rowStyleName = "";
  rowDefaultCellStyleName = "";
  readonly rowCellStyles = new Map<
    number,
    {
      styleName: string;
      columns: number;
      coveredBox?: SwTableBox;
    }
  >();
  readonly coveredCellStyles = new Map<number, string>();
  readonly verticalSpans = new Map<number, SwXMLVerticalSpan>();
  nonMergedCellIndex = 0;
  inHeaderRows = false;
  headerRowCount = 0;

  /** Binds the connected native table to its SAX import state. @param table - Actual table owner. @param defaultCellStyleName - Table fallback for cells. @returns State. */
  constructor(
    readonly table: SwTable,
    readonly defaultCellStyleName: string,
  ) {}
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

  /** Starts a package XML stream with its own automatic table style names. @returns Nothing. */
  protected ResetTableStyles(): void {
    this.tableStyles.clear();
  }

  /** Retains a referenced table style until SAX body import. */
  /** Projects one canonical Writer table value. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ public registerTableStyle(
    name: string,
    style: OdfTableStyle,
  ): void {
    const key = `${style.family}:${name}`;
    if (this.tableStyles.has(key)) throw new Error(`Duplicate ODF table style: ${name}`);
    this.tableStyles.set(key, style);
  }

  /** Opens one canonical table at the current body position. @param name - Table name. @param styleName - ODF table style. @param defaultCellStyleName - Table fallback for cells. @returns Nothing. */
  public beginTable(name: string, styleName: string, defaultCellStyleName = ""): void {
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
    this.tableContexts.push(new SwXMLTableContextState(table, defaultCellStyleName));
    const frameFormat = table.GetFrameFormat();
    importFrameVisualProperties(frameFormat, style);
    const hasMargins = style.marginLeft !== undefined || style.marginRight !== undefined;
    const hasWidth = style.width !== undefined || style.relativeWidth !== undefined;
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
            !hasWidth
              ? hasMargins
                ? HoriOrientation.NONE
                : HoriOrientation.FULL
              : hasMargins
                ? HoriOrientation.LEFT_AND_WIDTH
                : HoriOrientation.LEFT,
          );
          break;
        case "center":
          item.SetHoriOrient(!hasWidth ? HoriOrientation.FULL : HoriOrientation.CENTER);
          break;
        case "right":
          item.SetHoriOrient(!hasWidth ? HoriOrientation.FULL : HoriOrientation.RIGHT);
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
    if (hasWidth) {
      const item = frameFormat.GetFrameSize().Clone();
      if (style.width !== undefined) item.SetWidth(style.width);
      if (style.relativeWidth !== undefined) item.SetWidthPercent(style.relativeWidth);
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

  /** Inserts a declared column and its optional default. @param styleName - ODF column style. @param defaultCellStyleName - Column fallback for cells. @returns Nothing. */
  public addTableColumn(styleName: string, defaultCellStyleName = ""): void {
    const context = this.tableContext;
    const style = this.resolveTableStyle(styleName, "table-column") as Extract<
      OdfTableStyle,
      { family: "table-column" }
    >;
    const relative = context.table.GetFrameFormat().GetFrameSize().GetWidthPercent() !== 0;
    const width = relative
      ? (style.relativeColumnWidth ?? style.columnWidth)
      : (style.columnWidth ?? style.relativeColumnWidth);
    if (width !== 0) this.InsertColumn(width ?? MINLAY, defaultCellStyleName);
  }

  /** Appends the physical grid width and creates the optional default list on first use. @param width - Imported width in twips. @param defaultCellStyleName - Default for this column. @returns Nothing. */
  private InsertColumn(width: number, defaultCellStyleName: string): void {
    const context = this.tableContext;
    if (context.columnWidths.length >= 65535) return;
    if (defaultCellStyleName && context.columnDefaultCellStyleNames === undefined)
      context.columnDefaultCellStyleNames = Array<string>(context.columnWidths.length).fill("");
    context.columnDefaultCellStyleNames?.push(defaultCellStyleName);
    context.table.AddColumnWidth(width);
    context.columnWidths.push(width);
  }

  /** Opens one ordered table row. @param styleName - ODF row style. @param defaultCellStyleName - Row fallback for cells. @param inHeader - Whether to consider this row for the repeated header. @returns Nothing. */
  public beginTableRow(
    styleName: string,
    defaultCellStyleName = "",
    inHeader = this.tableContext.inHeaderRows,
  ): void {
    const context = this.tableContext;
    const table = context.table;
    if (!context.columnWidths.length) this.InsertColumn(65535, "");
    const format = table.GetFrameFormat();
    const size = format.GetFrameSize();
    if (size.GetWidthPercent() && !size.GetWidth()) {
      let baseWidth = 0;
      for (const width of context.columnWidths) baseWidth += width;
      if (baseWidth) {
        const item = size.Clone();
        item.SetWidth(baseWidth);
        format.SetFormatAttr(item);
      }
    }
    /* istanbul ignore next -- SAX row contexts cannot nest under a row context. */
    if (context.activeRow !== undefined)
      throw new Error("Nested ODF table rows are not supported.");
    const style = this.resolveTableStyle(styleName, "table-row") as Extract<
      OdfTableStyle,
      { family: "table-row" }
    >;
    context.rowStyleName = styleName;
    context.rowDefaultCellStyleName = defaultCellStyleName;
    context.rowCellStyles.clear();
    const rowIndex = table.GetTabLines().length;
    for (const [column, span] of context.verticalSpans)
      if (span.endRow <= rowIndex) context.verticalSpans.delete(column);
    const frameFormat = table.GetTableNode().GetDoc().MakeTableLineFormat();
    importFrameVisualProperties(frameFormat, style);
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
    context.nonMergedCellIndex = 0;
    context.coveredCellStyles.clear();
    if (inHeader && context.headerRowCount === rowIndex) context.headerRowCount++;
    context.rowCellIndex = 0;
  }

  /** Advances past reserved positions and checks whether the row can admit another anchored cell. @returns Whether a column is available. */
  public canInsertTableCell(): boolean {
    this.InsertImplicitCoveredBoxes();
    return this.tableContext.rowCellIndex < this.tableContext.columnWidths.length;
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
    const firstColumn = context.rowCellIndex;
    const actualColumnSpan = this.ClipColumnSpan(columnSpan);
    if (!actualColumnSpan) throw new Error("ODF table cell is outside the declared columns.");
    context.activeCellStyleName = styleName;
    context.activeCellColumnSpan = columnSpan;
    styleName = this.GetCellStyleName(styleName);
    const cell = this.CreateBox(styleName, actualColumnSpan);
    context.nonMergedCellIndex = context.rowCellIndex;
    if (rowSpan > 1) {
      const firstRow = context.table.GetTabLines().length - 1;
      const endRow = Math.min(firstRow + rowSpan, 65535);
      cell.setRowSpan(endRow - firstRow);
      context.verticalSpans.set(firstColumn, {
        firstRow,
        endRow,
        columns: actualColumnSpan,
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
  }

  /** Truncates a span at the declared grid edge or the next occupied slot. @param count - Source column count. @returns Admitted column count. */
  private ClipColumnSpan(count: number): number {
    const context = this.tableContext;
    const start = context.rowCellIndex;
    let end = Math.min(start + count, context.columnWidths.length);
    for (const column of context.verticalSpans.keys())
      if (column > start && column < end) end = column;
    return end - start;
  }

  /** Resolves fallback names in the same order as SwXMLTableContext::InsertCell. @param styleName - Explicit cell style. @returns Resolved name. */
  private GetCellStyleName(styleName: string): string {
    const context = this.tableContext;
    return (
      styleName ||
      context.rowDefaultCellStyleName ||
      (context.columnDefaultCellStyleNames === undefined
        ? ""
        : context.columnDefaultCellStyleNames[context.rowCellIndex] || context.defaultCellStyleName)
    );
  }

  /** Appends a real cell over the declared width of its original grid slots. @param styleName - Native style name. @param columnSpan - Source column count. @param covered - Whether style attachment waits for covered markers. @returns Actual core box. */
  private CreateBox(styleName: string, columnSpan: number, covered = false): SwTableBox {
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
    context.rowCellStyles.set(context.rowCellIndex, {
      styleName,
      columns: columnSpan,
      ...(covered ? { coveredBox: cell } : {}),
    });
    context.rowCellIndex += columnSpan;
    if (!covered) this.ApplyBoxStyle(cell, styleName);
    return cell;
  }

  /** Applies direct ODF items to the actual box format. @param cell - Canonical box. @param styleName - Resolved cell style. @returns Nothing. */
  private ApplyBoxStyle(cell: SwTableBox, styleName: string): void {
    const style = this.resolveTableStyle(styleName, "table-cell") as Extract<
      OdfTableStyle,
      { family: "table-cell" }
    >;
    const frameFormat = cell.GetFrameFormat(),
      box = importBoxProperties(style, RES_BOX);
    importFrameVisualProperties(frameFormat, style);
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
  }

  /** Inserts the native empty box for a vertically covered position. @param span - Actual owning master reservation. @returns Nothing. */
  private InsertCoveredBox(span: SwXMLVerticalSpan): void {
    const rowIndex = this.requireTable().GetTabLines().length - 1;
    const cell = this.CreateBox(span.styleName, span.columns, true);
    cell.setRowSpan(rowIndex - span.endRow);
    span.covered.push(cell);
  }

  /** Materializes reserved vertical boxes without requiring a redundant covered-cell tag. @returns Nothing. */
  private InsertImplicitCoveredBoxes(): void {
    const context = this.tableContext;
    let span = context.verticalSpans.get(context.rowCellIndex);
    while (span !== undefined) {
      this.InsertCoveredBox(span);
      span = context.verticalSpans.get(context.rowCellIndex);
    }
  }

  /** Records an authored style at the source's independent covered-cell cursor. @param styleName - Authored style name. @returns Nothing. */
  public coveredTableCell(styleName = ""): void {
    const context = this.tableContext;
    if (
      !styleName ||
      context.nonMergedCellIndex >= context.columnWidths.length ||
      !this.document.GetDocumentSettingManager().get("TABLE_ROW_KEEP")
    )
      return;
    context.coveredCellStyles.set(context.nonMergedCellIndex++, styleName);
  }

  /** Closes the active text section and copies single-column repeated cells. @param repeat - Parsed cell repetition count. @returns Nothing. */
  public endTableCell(repeat = 1): void {
    const context = this.tableContext;
    const source = context.activeCell;
    if (this.textImport && context.oldCursor) {
      const cursor = this.textImport.GetCursor();
      const content = source?.GetContentNodes();
      if (content?.at(-2)?.IsTextNode()) this.textImport.DeleteParagraph();
      this.textImport.SetCursor(context.oldCursor);
      cursor.dispose();
      context.oldCursor = undefined;
    }
    context.activeCell = undefined;
    if (source === undefined || context.activeCellColumnSpan !== 1 || repeat === 1) return;
    const span = context.verticalSpans.get(context.rowCellIndex - 1);
    for (let index = 1; index < repeat; index++) {
      this.InsertImplicitCoveredBoxes();
      if (context.rowCellIndex >= context.columnWidths.length) break;
      const column = context.rowCellIndex;
      const styleName = this.GetCellStyleName(context.activeCellStyleName);
      const box = this.CreateBox(styleName, 1);
      context.nonMergedCellIndex = context.rowCellIndex;
      if (span !== undefined) {
        box.setRowSpan(source.getRowSpan());
        context.verticalSpans.set(column, { ...span, styleName, master: box, covered: [] });
      }
      const start = box.GetStartNode();
      const nodes = start.GetNodes();
      const placeholder = nodes.at(start.GetIndex() + 1) as SwTextNode;
      if (CopyNodes(source.GetStartNode(), start, placeholder)) nodes.removeTextNode(placeholder);
    }
  }

  /** Finishes an incomplete row and inserts the native repeated row sections. @param repeat - Parsed row repetition count. @returns Nothing. */
  public endTableRow(repeat = 1): void {
    const context = this.tableContext;
    this.FinishRow();
    for (let index = 1; index < repeat && context.table.GetTabLines().length < 65535; index++) {
      const previous = new Map(context.rowCellStyles);
      this.beginTableRow(context.rowStyleName, context.rowDefaultCellStyleName, false);
      while (context.rowCellIndex < context.columnWidths.length) {
        this.InsertImplicitCoveredBoxes();
        if (context.rowCellIndex >= context.columnWidths.length) break;
        const source = previous.get(context.rowCellIndex);
        const columnSpan = this.ClipColumnSpan(source?.columns ?? 1);
        this.CreateBox(this.GetCellStyleName(source?.styleName ?? ""), columnSpan);
      }
      this.FinishRow();
    }
  }

  /** Completes the row with a default empty cell across trailing unoccupied columns. @returns Nothing. */
  private FinishRow(): void {
    const context = this.tableContext;
    while (context.rowCellIndex < context.columnWidths.length) {
      this.InsertImplicitCoveredBoxes();
      if (context.rowCellIndex >= context.columnWidths.length) break;
      this.CreateBox(this.GetCellStyleName(""), this.ClipColumnSpan(context.columnWidths.length));
    }
    for (const [column, state] of context.rowCellStyles) {
      if (!state.coveredBox) continue;
      state.styleName = context.coveredCellStyles.get(column) ?? state.styleName;
      this.ApplyBoxStyle(state.coveredBox, state.styleName);
    }
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
    return this.tableStyles.get(`${family}:${name}`) ?? { family };
  }
}
