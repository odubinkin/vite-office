/** @fileoverview Native HTMLTable container construction, grid placement/span repair and layout-value creation from htmltab.cxx; token reading and core materialization are separate consumers. */
import { HTMLTableRow } from "./htmltab.row";
import { HTMLTableColumn } from "./htmltab.column";
import type { HTMLTableCell } from "./htmltab.cell";
import type { HTMLTableCnts } from "./htmltab.contents";
import type { HTMLTableOptions } from "./htmltab.options";
import type { HTMLTableContext } from "./htmltab.context";
import { SwHTMLParser } from "./swhtml";
import { SwHTMLTableLayout } from "../../../inc/htmltbl";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import type { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import {
  SvxBorderLine,
  SvxBorderLineStyle,
  SvxBorderLineWidth,
} from "../../../../editeng/source/items/borderline";
import { SvxAdjust as A } from "../../../../editeng/inc/svxenum";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import type { SwStartNode } from "../../core/docnode/node";
import type { SwTable, SwTableBox } from "../../core/table/swtable";
import type { SwTableBoxFormat, SwTableLineFormat } from "../../../inc/swtblfmt";
import { MIN_BORDER_DIST } from "../../../inc/swtypes";
import { InsertTableContents } from "./htmltab.sections";
import { MakeTable } from "./htmltab.make";
import { HTMLTableFrame as F, HTMLTableRules as R } from "../../../../svtools/inc/parhtml";
/** Native table owns its intermediate grid and original options; protected fields keep future source method fragments on this same owner rather than a parallel DTO. */
export class HTMLTable {
  protected readonly m_aRows: HTMLTableRow[] = [];
  protected readonly m_aColumns: HTMLTableColumn[] = [];
  protected m_nRows = 0;
  protected m_nCols: number;
  protected m_nFilledColumns = 0;
  protected m_nCurrentRow = 0;
  protected m_nCurrentColumn = 0;
  protected m_nLeftMargin = 0;
  protected m_nRightMargin = 0;
  protected m_nCellPadding: number;
  protected m_nCellSpacing: number;
  protected m_nHSpace: number;
  protected m_nVSpace: number;
  protected m_nBoxes = 1;
  protected m_pPrevStartNode: SwStartNode | null = null;
  protected m_pSwTable: SwTable | null = null;
  m_xBox1: SwTableBox | null = null;
  protected m_pBoxFormat: SwTableBoxFormat | null = null;
  protected m_pLineFormat: SwTableLineFormat | null = null;
  protected m_pLineFrameFormatNoHeight: SwTableLineFormat | null = null;
  protected m_xBackgroundBrush: SvxBrushItem | null;
  protected m_xInheritedBackgroundBrush: SvxBrushItem | null = null;
  protected m_pCaptionStartNode: SwStartNode | null = null;
  protected m_aTopBorderLine = new SvxBorderLine();
  protected m_aBottomBorderLine: SvxBorderLine;
  protected m_aLeftBorderLine = new SvxBorderLine();
  protected m_aRightBorderLine: SvxBorderLine;
  protected m_aBorderLine = new SvxBorderLine();
  protected m_aInheritedLeftBorderLine = new SvxBorderLine();
  protected m_aInheritedRightBorderLine = new SvxBorderLine();
  protected m_bTopBorder = false;
  protected m_bRightBorder = false;
  protected m_bTopAllowed = true;
  protected m_bRightAllowed = true;
  protected m_bFillerTopBorder = false;
  protected m_bFillerBottomBorder = false;
  protected m_bInheritedLeftBorder = false;
  protected m_bInheritedRightBorder = false;
  protected m_bBordersSet = false;
  protected m_bForceFrame = false;
  protected readonly m_bTableAdjustOfTag: boolean;
  protected m_nHeadlineRepeat = 0;
  protected readonly m_bFixedCols: boolean;
  protected m_bColSpec = false;
  protected readonly m_bPercentWidth: boolean;
  protected m_xParentContents: HTMLTableCnts | null = null;
  protected m_pContext: HTMLTableContext | null = null;
  protected m_xLayoutInfo: SwHTMLTableLayout | null = null;
  protected readonly m_nWidth: number;
  protected readonly m_nHeight: number;
  protected readonly m_eTableAdjust: A;
  protected readonly m_eVertOrientation: number;
  protected m_nBorder: number;
  protected readonly m_eFrame: HTMLTableOptions["eFrame"];
  protected readonly m_eRules: HTMLTableOptions["eRules"];
  protected m_bTopCaption = false;
  protected readonly m_aId: string;
  protected readonly m_aStyle: string;
  protected readonly m_aClass: string;
  protected readonly m_aDir: string;
  m_bFirstCell = true;
  /** Original constructor and InitCtor copy source options, construct border values and register with the actual parser. @param m_pParser - Actual importer. @param m_bIsParentHead - Native parent header flag. @param m_bHasParentSection - Source section admission. @param m_bHasToFly - Native frame admission. @param options - Native parsed options. @returns Table. */
  constructor(
    protected readonly m_pParser: SwHTMLParser,
    protected readonly m_bIsParentHead: boolean,
    protected m_bHasParentSection: boolean,
    protected readonly m_bHasToFly: boolean,
    options: HTMLTableOptions,
  ) {
    this.m_nCols = options.nCols;
    for (let i = 0; i < this.m_nCols; ++i) this.m_aColumns.push(new HTMLTableColumn());
    this.m_bFixedCols = this.m_nCols > 0;
    this.m_bTableAdjustOfTag = options.bTableAdjust;
    this.m_bPercentWidth = options.bPercentWidth;
    this.m_nWidth = options.nWidth;
    this.m_nHeight = options.nHeight;
    this.m_eTableAdjust = options.eAdjust;
    this.m_eVertOrientation = options.eVertOri;
    this.m_eFrame = options.eFrame;
    this.m_eRules = options.eRules;
    let width = (options.nBorder === 65535 ? 1 : options.nBorder) * 15;
    const height = (options.nBorder === 65535 ? 0 : options.nBorder) * 15;
    this.m_nBorder = width & 65535;
    if (options.nBorder === 65535) width = 0;
    if (options.nCellSpacing !== 0)
      this.m_aTopBorderLine.SetBorderLineStyle(SvxBorderLineStyle.DOUBLE);
    this.m_aTopBorderLine.SetWidth(height);
    this.m_aTopBorderLine.SetColor(options.aBorderColor);
    this.m_aBottomBorderLine = this.m_aTopBorderLine.Clone();
    if (width === height) this.m_aLeftBorderLine = this.m_aTopBorderLine.Clone();
    else {
      if (options.nCellSpacing !== 0)
        this.m_aLeftBorderLine.SetBorderLineStyle(SvxBorderLineStyle.DOUBLE);
      this.m_aLeftBorderLine.SetWidth(width);
      this.m_aLeftBorderLine.SetColor(options.aBorderColor);
    }
    this.m_aRightBorderLine = this.m_aLeftBorderLine.Clone();
    if (options.nCellSpacing !== 0)
      this.m_aBorderLine.SetBorderLineStyle(SvxBorderLineStyle.DOUBLE);
    this.m_aBorderLine.SetWidth(SvxBorderLineWidth.Hairline);
    this.m_aBorderLine.SetColor(options.aBorderColor);
    this.m_nCellPadding = options.nCellPadding;
    if (this.m_nCellPadding)
      this.m_nCellPadding =
        this.m_nCellPadding === 65535
          ? MIN_BORDER_DIST
          : Math.max(MIN_BORDER_DIST, SwHTMLParser.ToTwips(this.m_nCellPadding));
    this.m_nCellSpacing = options.nCellSpacing;
    if (this.m_nCellSpacing)
      this.m_nCellSpacing = SwHTMLParser.ToTwips(
        this.m_nCellSpacing === 65535 ? 2 : this.m_nCellSpacing,
      );
    this.m_nHSpace = (options.nHSpace * 15) & 65535;
    this.m_nVSpace = (options.nVSpace * 15) & 65535;
    this.m_xBackgroundBrush = m_pParser.CreateBrushItem(
      options.bBGColor ? options.aBGColor : null,
      options.aBGImage,
      "",
      "",
      "",
    );
    this.m_aId = options.aId;
    this.m_aStyle = options.aStyle;
    this.m_aClass = options.aClass;
    this.m_aDir = options.aDir;
    m_pParser.RegisterHTMLTable(this);
  }
  /** Original destructor deregisters and releases its uniquely owned context. Layouts already borrowed by core survive independently. @returns Nothing. */
  SourceDispose(): void {
    this.m_pParser.DeregisterHTMLTable(this);
    this.m_pContext?.SourceDispose();
    this.m_pContext = null;
  }
  /** Native row vector/index precondition and checked per-row access. @param row - Row index. @param column - Column index. @returns Actual cell. */
  GetCell(row: number, column: number): HTMLTableCell {
    const value = this.m_aRows[row & 65535];
    if (!value) throw new RangeError("HTMLTable row index is out of range");
    return value.GetCell(column);
  }
  /** Original caption assignment. @param node - Actual caption section. @param top - Top flag. @returns Nothing. */
  SetCaption(node: SwStartNode | null, top: boolean): void {
    this.m_pCaptionStartNode = node;
    this.m_bTopCaption = top;
  }
  /** Original caption section. @returns Borrowed node. */
  GetCaptionStartNode(): SwStartNode | null {
    return this.m_pCaptionStartNode;
  }
  /** Original caption side. @returns Flag. */
  IsTopCaption(): boolean {
    return this.m_bTopCaption;
  }
  /** Original explicit-tag selector. @param any - Permit inherited adjustment. @returns Native enum. */
  GetTableAdjust(any: boolean): A {
    return this.m_bTableAdjustOfTag || any ? this.m_eTableAdjust : A.End;
  }
  /** Original horizontal spacing. @returns Native uint16 twips. */
  GetHSpace(): number {
    return this.m_nHSpace;
  }
  /** Original vertical spacing. @returns Native uint16 twips. */
  GetVSpace(): number {
    return this.m_nVSpace;
  }
  /** Original column-first adjustment inheritance. @returns Native enum. */
  GetInheritedAdjust(): A {
    const adjustment =
      this.m_nCurrentColumn < this.m_nCols
        ? (this.m_aColumns[this.m_nCurrentColumn] as HTMLTableColumn).GetAdjust()
        : A.End;
    return adjustment === A.End
      ? (this.m_aRows[this.m_nCurrentRow] as HTMLTableRow).GetAdjust()
      : adjustment;
  }
  /** Original row-first vertical inheritance uses TOP as unset, while NONE represents HTML top. @returns Orientation. */
  GetInheritedVertOri(): number {
    let value = (this.m_aRows[this.m_nCurrentRow] as HTMLTableRow).GetVertOri();
    if (value === V.TOP && this.m_nCurrentColumn < this.m_nCols)
      value = (this.m_aColumns[this.m_nCurrentColumn] as HTMLTableColumn).GetVertOri();
    return value === V.TOP ? this.m_eVertOrientation : value;
  }
  /** Original new-document mode borrows the parser flag. @returns Flag. */
  IsNewDoc(): boolean {
    return this.m_pParser.IsNewDoc();
  }
  /** Original column-tag flag. @returns Flag. */
  HasColTags(): boolean {
    return this.m_bColSpec;
  }
  /** Original parent-section mutation. @param value - Flag. @returns Nothing. */
  SetHasParentSection(value: boolean): void {
    this.m_bHasParentSection = value;
  }
  /** Original parent-section query. @returns Flag. */
  HasParentSection(): boolean {
    return this.m_bHasParentSection;
  }
  /** Original parent chain unique-pointer assignment. @param value - Owned contents. @returns Nothing. */
  SetParentContents(value: HTMLTableCnts | null): void {
    this.m_xParentContents = value;
  }
  /** Original parent chain borrow. @returns Actual contents. */
  GetParentContents(): HTMLTableCnts | null {
    return this.m_xParentContents;
  }
  /** Original parent-content admission; the explicit outer table borrows the parser current-table reference across the source responsibility split. @param current - Actual outer table. @returns Nothing. */
  MakeParentContents(current: HTMLTable): void {
    if (!this.GetContext() && !this.HasParentSection()) {
      this.SetParentContents(InsertTableContents(this.m_pParser, current, this.m_bIsParentHead));
      this.SetHasParentSection(true);
    }
  }
  /** Original frame admission. @returns Flag. */
  HasToFly(): boolean {
    return this.m_bHasToFly;
  }
  /** Original table binding transfers context and borrows the top-level core table. @param node - Previous section. @param context - Owned context. @param left - Native margin. @param right - Native margin. @param table - Borrowed top-level table. @param forceFrame - Native frame flag. @returns Nothing. */
  SetTable(
    node: SwStartNode | null,
    context: HTMLTableContext | null,
    left: number,
    right: number,
    table: SwTable | null = null,
    forceFrame = false,
  ): void {
    this.m_pPrevStartNode = node;
    this.m_pSwTable = table;
    if (this.m_pContext !== context) this.m_pContext?.SourceDispose();
    this.m_pContext = context;
    this.m_nLeftMargin = left & 65535;
    this.m_nRightMargin = right & 65535;
    this.m_bForceFrame = forceFrame;
  }
  /** Original table context borrow. @returns Actual context. */
  GetContext(): HTMLTableContext | null {
    return this.m_pContext;
  }
  /** Original top-level core table borrow. @returns Actual table. */
  GetSwTable(): SwTable | null {
    return this.m_pSwTable;
  }
  /** Runs the original table materialization at the import boundary. @param upper - Containing box or null. @param absolute - Native browse width. @param relative - Parent relative width. @param left - Parent left space. @param right - Parent right space. @param inherited - Parent inherited space. @returns Nothing. */
  MakeTable(
    upper: SwTableBox | null,
    absolute: number,
    relative = 0,
    left = 0,
    right = 0,
    inherited = 0,
  ): void {
    MakeTable.call(this, upper, absolute, relative, left, right, inherited);
  }
  /** Original brush value copy. @param value - Actual brush. @returns Nothing. */
  SetBGBrush(value: SvxBrushItem): void {
    this.m_xBackgroundBrush = new SvxBrushItem(value);
  }
  /** Original borrowed table background. @returns Actual brush or null. */
  protected GetBGBrush(): SvxBrushItem | null {
    return this.m_xBackgroundBrush;
  }
  /** Original borrowed inherited cell background. @returns Actual brush or null. */
  protected GetInhBGBrush(): SvxBrushItem | null {
    return this.m_xInheritedBackgroundBrush;
  }
  /** Original recursive border completion flag, published after visiting all nested contents. @returns Flag. */
  protected BordersSet(): boolean {
    return this.m_bBordersSet;
  }
  /** Original Netscape top spacing does not inspect actual border admission. @param row - Row. @returns Native uint16 twips. */
  protected GetTopCellSpace(row: number): number {
    return (this.m_nCellPadding + (row === 0 ? this.m_nBorder + this.m_nCellSpacing : 0)) & 65535;
  }
  /** Original Netscape bottom spacing includes one row gap and the outer border only at the final span. @param row - Start row. @param span - Row span. @returns Native uint16 twips. */
  protected GetBottomCellSpace(row: number, span: number): number {
    return (
      (this.m_nCellSpacing +
        this.m_nCellPadding +
        (row + span === this.m_nRows ? this.m_nBorder : 0)) &
      65535
    );
  }
  /** Original nested-table horizontal inheritance and background fallback preserve first/last content boundaries. @param parent - Actual parent grid, including the native self domain. @param row - Parent start row. @param column - Parent start column. @param span - Parent row span. @param first - First content in cell. @param last - Last content in cell. @returns Nothing. */
  protected InheritBorders(
    parent: HTMLTable,
    row: number,
    column: number,
    span: number,
    first: boolean,
    last: boolean,
  ): void {
    if (!this.m_nRows || !this.m_nCols || this.m_nCurrentRow !== this.m_nRows)
      throw new Error("assert(closed HTML table grid)");
    const end = parent.m_aRows[row + span - 1],
      bottom = this.m_aRows[this.m_nRows - 1];
    if (!end || !bottom) throw new Error("assert(HTML table border row)");
    if (row === 0 && parent.m_bTopBorder && first) {
      this.m_bTopBorder = true;
      this.m_bFillerTopBorder = true;
      this.m_aTopBorderLine = parent.m_aTopBorderLine.Clone();
    }
    if (end.GetBottomBorder() && last) {
      bottom.SetBottomBorder(true);
      this.m_bFillerBottomBorder = true;
      this.m_aBottomBorderLine = (
        row + span === parent.m_nRows ? parent.m_aBottomBorderLine : parent.m_aBorderLine
      ).Clone();
    }
    const preceding = row ? parent.m_aRows[row - 1] : null;
    if (row && !preceding) throw new Error("assert(HTML preceding border row)");
    this.m_bTopAllowed =
      !first || (parent.m_bTopAllowed && (row === 0 || !preceding?.GetBottomBorder()));
    let brush = parent.GetCell(row, column).GetBGBrush();
    if (!brush && parent !== this && parent.GetCell(row, column).GetRowSpan() === parent.m_nRows) {
      const sourceRow = parent.m_aRows[row];
      if (!sourceRow) throw new Error("assert(HTML background row)");
      brush = sourceRow.GetBGBrush() ?? parent.GetBGBrush() ?? parent.GetInhBGBrush();
    }
    if (brush) this.m_xInheritedBackgroundBrush = new SvxBrushItem(brush);
  }
  /** Original vertical inheritance records actual line values before the width pass decides whether filler cells are needed. @param parent - Actual parent grid. @param column - Parent start column. @param span - Parent column span. @returns Nothing. */
  protected InheritVertBorders(parent: HTMLTable, column: number, span: number): void {
    let left = 0,
      right = 0;
    if (column + span === parent.m_nCols && parent.m_bRightBorder) {
      this.m_bInheritedRightBorder = true;
      this.m_aInheritedRightBorderLine = parent.m_aRightBorderLine.Clone();
      right =
        (this.GetBorderWidth(this.m_aInheritedRightBorderLine, true) + MIN_BORDER_DIST) & 65535;
    }
    const first = parent.m_aColumns[column];
    if (!first) throw new Error("assert(HTML border column)");
    if (first.m_bLeftBorder) {
      this.m_bInheritedLeftBorder = true;
      this.m_aInheritedLeftBorderLine = (
        column === 0 ? parent.m_aLeftBorderLine : parent.m_aBorderLine
      ).Clone();
      left = (this.GetBorderWidth(this.m_aInheritedLeftBorderLine, true) + MIN_BORDER_DIST) & 65535;
    }
    if (!this.m_bInheritedLeftBorder && (this.m_bFillerTopBorder || this.m_bFillerBottomBorder))
      left = 2 * MIN_BORDER_DIST;
    if (!this.m_bInheritedRightBorder && (this.m_bFillerTopBorder || this.m_bFillerBottomBorder))
      right = 2 * MIN_BORDER_DIST;
    if (!this.m_xLayoutInfo) throw new Error("assert(HTML border layout)");
    this.m_xLayoutInfo.SetInhBorderWidths(left, right);
    const following = parent.m_aColumns[column + span];
    if (column + span !== parent.m_nCols && !following)
      throw new Error("assert(HTML following border column)");
    this.m_bRightAllowed =
      parent.m_bRightAllowed && (column + span === parent.m_nCols || !following?.m_bLeftBorder);
  }
  /** Original FRAME/RULES/group boundary assignment followed by same-owner recursive nested-content inheritance. Repeated calls retain source flags and the nested BordersSet admission. @returns Nothing. */
  protected SetBorders(): void {
    for (let i = 1; i < this.m_nCols; ++i) {
      const previous = this.m_aColumns[i - 1],
        current = this.m_aColumns[i];
      if (!previous || !current) throw new Error("assert(HTML rule column)");
      if (
        this.m_eRules === R.All ||
        this.m_eRules === R.Cols ||
        ((this.m_eRules === R.Rows || this.m_eRules === R.Groups) && previous.IsEndOfGroup())
      )
        current.m_bLeftBorder = true;
    }
    for (let i = 0; i < this.m_nRows - 1; ++i) {
      const row = this.m_aRows[i];
      if (!row) throw new Error("assert(HTML rule row)");
      if (
        this.m_eRules === R.All ||
        this.m_eRules === R.Rows ||
        ((this.m_eRules === R.Cols || this.m_eRules === R.Groups) && row.IsEndOfGroup())
      )
        row.SetBottomBorder(true);
    }
    if (
      this.m_bTopAllowed &&
      (this.m_eFrame === F.Above || this.m_eFrame === F.HSides || this.m_eFrame === F.Box)
    )
      this.m_bTopBorder = true;
    if (this.m_eFrame === F.Below || this.m_eFrame === F.HSides || this.m_eFrame === F.Box) {
      const row = this.m_aRows[this.m_nRows - 1];
      if (!row) throw new Error("assert(HTML final border row)");
      row.SetBottomBorder(true);
    }
    if (this.m_eFrame === F.RHS || this.m_eFrame === F.VSides || this.m_eFrame === F.Box)
      this.m_bRightBorder = true;
    if (this.m_eFrame === F.LHS || this.m_eFrame === F.VSides || this.m_eFrame === F.Box) {
      const column = this.m_aColumns[0];
      if (!column) throw new Error("assert(HTML first border column)");
      column.m_bLeftBorder = true;
    }
    for (let i = 0; i < this.m_nRows; ++i)
      for (let j = 0; j < this.m_nCols; ++j) {
        let content = this.GetCell(i, j).GetContents(),
          first = true;
        while (content) {
          const table = content.GetTable();
          if (table && !table.BordersSet()) {
            table.InheritBorders(
              this,
              i,
              j,
              this.GetCell(i, j).GetRowSpan(),
              first,
              content.Next() === null,
            );
            table.SetBorders();
          }
          first = false;
          content = content.Next();
        }
      }
    this.m_bBordersSet = true;
  }
  /** Original ID. @returns String. */
  GetId(): string {
    return this.m_aId;
  }
  /** Original class. @returns String. */
  GetClass(): string {
    return this.m_aClass;
  }
  /** Original inline style. @returns String. */
  GetStyle(): string {
    return this.m_aStyle;
  }
  /** Original direction. @returns String. */
  GetDirection(): string {
    return this.m_aDir;
  }
  /** Original uint16 box counter. @returns Nothing. */
  IncBoxCount(): void {
    this.m_nBoxes = (this.m_nBoxes + 1) & 65535;
  }
  /** Original overflow threshold. @returns Flag. */
  IsOverflowing(): boolean {
    return this.m_nBoxes > 64000;
  }
  /** Original border width with optional content distance, narrowing each assignment. @param line - Actual border line. @param withDistance - Include padding/minimum distance. @returns Native uint16. */
  protected GetBorderWidth(line: SvxBorderLine, withDistance = false): number {
    let width = line.GetWidth() & 65535;
    if (withDistance) {
      if (this.m_nCellPadding) width = (width + this.m_nCellPadding) & 65535;
      else if (width) width = (width + MIN_BORDER_DIST) & 65535;
    }
    return width;
  }
  /** Original CreateLayoutInfo rebuilds the table layout; content nodes independently cache their own layouts. @returns Actual layout owner. */
  CreateLayoutInfo(): SwHTMLTableLayout {
    const first = this.m_aColumns[0];
    if (!first) throw new Error("assert(nonempty HTML table grid)");
    const layout = (this.m_xLayoutInfo = new SwHTMLTableLayout(
      this.m_pSwTable,
      this.m_nRows,
      this.m_nCols,
      this.m_bFixedCols,
      this.m_bColSpec,
      this.m_bPercentWidth ? this.m_nWidth : SwHTMLParser.ToTwips(this.m_nWidth),
      this.m_bPercentWidth,
      this.m_nBorder,
      this.m_nCellPadding,
      this.m_nCellSpacing,
      this.m_eTableAdjust,
      this.m_nLeftMargin,
      this.m_nRightMargin,
      this.GetBorderWidth(this.m_aBorderLine, true),
      first.m_bLeftBorder ? this.GetBorderWidth(this.m_aLeftBorderLine, true) : 0,
      this.m_bRightBorder ? this.GetBorderWidth(this.m_aRightBorderLine, true) : 0,
    ));
    let exportable = true;
    for (let i = 0; i < this.m_nRows; ++i)
      for (let j = 0; j < this.m_nCols; ++j) {
        const cell = this.GetCell(i, j).CreateLayoutInfo();
        layout.SetCell(cell, i, j);
        if (exportable) {
          const contents = cell.GetContents();
          exportable = !contents || (!!contents.GetStartNode() && !contents.GetNext());
        }
      }
    layout.SetExportable(exportable);
    for (let i = 0; i < this.m_nCols; ++i)
      layout.SetColumn((this.m_aColumns[i] as HTMLTableColumn).CreateLayoutInfo(), i);
    return layout;
  }
  /** Original predecessor selection consults previous-row spans, then the preceding content chain and deepest trailing nested table. The all-uint16-max pair requests the last cell. @param row - Native row or sentinel. @param column - Native column or sentinel. @returns Actual previous section or null. */
  protected GetPrevBoxStartNode(row: number, column: number): SwStartNode | null {
    let previous: HTMLTableCnts | null = null;
    if (row === 0) {
      if (column) previous = this.GetCell(0, column - 1).GetContents();
      else return this.m_pPrevStartNode;
    } else if (row === 65535 && column === 65535)
      previous = this.GetCell(this.m_nRows - 1, this.m_nCols - 1).GetContents();
    else {
      const preceding = this.m_aRows[row - 1];
      if (!preceding) throw new Error("assert(HTML previous row)");
      let i = column;
      while (i) {
        if (preceding.GetCell(--i).GetRowSpan() === 1) {
          previous = this.GetCell(row, i).GetContents();
          break;
        }
      }
      if (!previous) {
        i = this.m_nCols;
        while (!previous && i) previous = preceding.GetCell(--i).GetContents();
      }
    }
    if (!previous) {
      previous = this.GetCell(0, 0).GetContents();
      if (!previous) return this.m_pPrevStartNode;
    }
    while (previous.Next()) {
      const next = previous.Next();
      if (!next) throw new Error("assert(HTML next content)");
      previous = next;
    }
    const start = previous.GetStartNode();
    return start ?? previous.GetTable()?.GetPrevBoxStartNode(65535, 65535) ?? null;
  }
  /** Original upward identity-based rowspan repair updates an existing layout in parallel. @param row - Last matching row. @param column - Column. @param contents - Native content identity. @returns Nothing. */
  protected FixRowSpan(row: number, column: number, contents: HTMLTableCnts | null): void {
    let span = 1;
    for (;;) {
      const cell = this.GetCell(row, column);
      if (cell.GetContents() !== contents) break;
      cell.SetRowSpan(span);
      if (this.m_xLayoutInfo) {
        const layoutCell = this.m_xLayoutInfo.GetCell(row, column);
        if (!layoutCell) throw new Error("assert(layout cell)");
        layoutCell.SetRowSpan(span);
      }
      if (!row) break;
      ++span;
      --row;
    }
  }
  /** Original protection resets matching grid/layout cells. @param row - First row. @param column - Column. @param span - Number of rows. @returns Nothing. */
  protected ProtectRowSpan(row: number, column: number, span: number): void {
    for (let i = 0; i < span; ++i) {
      this.GetCell(row + i, column).SetProtected();
      if (this.m_xLayoutInfo) {
        const layoutCell = this.m_xLayoutInfo.GetCell(row + i, column);
        if (!layoutCell) throw new Error("assert(layout cell)");
        layoutCell.SetProtected();
      }
    }
  }
  /** Original InsertCell grows rows/columns, repairs overlaps and fills decreasing covered spans. @param contents - Shared native chain. @param rowSpan - Native span. @param colSpan - Native span. @param width - Native pixels or percent. @param relative - Percent selector. @param height - Native pixels. @param vertical - Native orientation. @param brush - Shared brush. @param box - Shared border item. @param hasFormat - Numeric presence. @param format - Native format ID. @param hasValue - Numeric presence. @param value - Numeric value. @param noWrap - Native option. @returns Nothing. */
  InsertCell(
    contents: HTMLTableCnts | null,
    rowSpan: number,
    colSpan: number,
    width: number,
    relative: boolean,
    height: number,
    vertical: number,
    brush: SvxBrushItem | null,
    box: SvxBoxItem | null,
    hasFormat: boolean,
    format: number,
    hasValue: boolean,
    value: number,
    noWrap: boolean,
  ): void {
    rowSpan &= 65535;
    colSpan &= 65535;
    width &= 65535;
    height &= 65535;
    if (!rowSpan || this.m_nCurrentRow + rowSpan > 65535) rowSpan = 1;
    if (!colSpan || this.m_nCurrentColumn + colSpan > 65535) colSpan = 1;
    const colsReq = (this.m_nCurrentColumn + colSpan) & 65535,
      rowsReq = (this.m_nCurrentRow + rowSpan) & 65535;
    if (this.m_nCols < colsReq) {
      for (let i = this.m_nCols; i < colsReq; ++i) this.m_aColumns.push(new HTMLTableColumn());
      for (let i = 0; i < this.m_nRows; ++i)
        (this.m_aRows[i] as HTMLTableRow).Expand(colsReq, i < this.m_nCurrentRow);
      this.m_nCols = colsReq;
    }
    if (colsReq > this.m_nFilledColumns) this.m_nFilledColumns = colsReq;
    if (this.m_nRows < rowsReq) {
      for (let i = this.m_nRows; i < rowsReq; ++i)
        this.m_aRows.push(new HTMLTableRow(this.m_nCols));
      this.m_nRows = rowsReq;
    }
    let spannedCols = 0;
    if (this.m_nCurrentRow > 0) {
      for (let i = this.m_nCurrentColumn; i < colsReq; ++i) {
        const cell = this.GetCell(this.m_nCurrentRow, i);
        if (cell.GetContents()) {
          spannedCols = (i + cell.GetColSpan()) & 65535;
          this.FixRowSpan(this.m_nCurrentRow - 1, i, cell.GetContents());
          if (cell.GetRowSpan() > rowSpan)
            this.ProtectRowSpan(rowsReq, i, cell.GetRowSpan() - rowSpan);
        }
      }
      for (let i = colsReq; i < spannedCols; ++i) {
        const cell = this.GetCell(this.m_nCurrentRow, i);
        this.FixRowSpan(this.m_nCurrentRow - 1, i, cell.GetContents());
        this.ProtectRowSpan(this.m_nCurrentRow, i, cell.GetRowSpan());
      }
    }
    for (let i = colSpan; i > 0; --i)
      for (let j = rowSpan; j > 0; --j)
        this.GetCell(rowsReq - j, colsReq - i).Set(
          contents,
          j,
          i,
          vertical,
          brush,
          box,
          hasFormat,
          format,
          hasValue,
          value,
          noWrap,
          i !== colSpan || j !== rowSpan,
        );
    if (width)
      this.GetCell(this.m_nCurrentRow, this.m_nCurrentColumn).SetWidth(
        relative ? width : (width * 15) & 65535,
        relative,
      );
    if (height && rowSpan === 1)
      (this.m_aRows[this.m_nCurrentRow] as HTMLTableRow).SetHeight((height * 15) & 65535);
    this.m_nCurrentColumn = Math.max(colsReq, spannedCols);
    while (
      this.m_nCurrentColumn < this.m_nCols &&
      this.GetCell(this.m_nCurrentRow, this.m_nCurrentColumn).IsUsed()
    )
      ++this.m_nCurrentColumn;
  }
  /** Original section-end marker and header-repeat count. @param head - Header section. @returns Nothing. */
  CloseSection(head: boolean): void {
    if (this.m_nCurrentRow > 0 && this.m_nCurrentRow <= this.m_nRows)
      (this.m_aRows[this.m_nCurrentRow - 1] as HTMLTableRow).SetEndOfGroup();
    if (head) this.m_nHeadlineRepeat = this.m_nCurrentRow;
  }
  /** Original row opening transfers an optional brush and skips occupied rowspan cells. @param adjust - Row adjustment. @param vertical - Row orientation. @param brush - Native unique pointer reference. @returns Nothing. */
  OpenRow(adjust: A, vertical: number, brush: [SvxBrushItem | null]): void {
    const required = (this.m_nCurrentRow + 1) & 65535;
    if (this.m_nRows < required) {
      for (let i = this.m_nRows; i < required; ++i)
        this.m_aRows.push(new HTMLTableRow(this.m_nCols));
      this.m_nRows = required;
    }
    const row = this.m_aRows[this.m_nCurrentRow] as HTMLTableRow;
    row.SetAdjust(adjust);
    row.SetVertOri(vertical);
    if (brush[0]) row.SetBGBrush(brush);
    this.m_nCurrentColumn = 0;
    while (
      this.m_nCurrentColumn < this.m_nCols &&
      this.GetCell(this.m_nCurrentRow, this.m_nCurrentColumn).IsUsed()
    )
      ++this.m_nCurrentColumn;
  }
  /** Original empty rows reuse the current index; otherwise trailing contentless cells form decreasing spans. @param empty - Native empty-row flag. @returns Nothing. */
  CloseRow(empty: boolean): void {
    if (empty) {
      if (this.m_nCurrentRow > 0)
        (this.m_aRows[this.m_nCurrentRow - 1] as HTMLTableRow).IncEmptyRows();
      return;
    }
    const row = this.m_aRows[this.m_nCurrentRow] as HTMLTableRow;
    let i = this.m_nCols;
    while (i) {
      const cell = row.GetCell(--i);
      if (cell.GetContents()) break;
      const span = this.m_nCols - i;
      if (span > 1) cell.SetColSpan(span);
    }
    this.m_nCurrentRow = (this.m_nCurrentRow + 1) & 65535;
  }
  /** Original column-group close optionally creates columns then marks the last one. @param span - Native count. @param width - Original width. @param relative - Width family. @param adjust - Adjustment. @param vertical - Orientation. @returns Nothing. */
  CloseColGroup(span: number, width: number, relative: boolean, adjust: A, vertical: number): void {
    span &= 65535;
    if (span) this.InsertCol(span, width, relative, adjust, vertical);
    if (this.m_nCurrentColumn > 0 && this.m_nCurrentColumn <= this.m_nCols)
      (this.m_aColumns[this.m_nCurrentColumn - 1] as HTMLTableColumn).SetEndOfGroup();
  }
  /** Original column creation is ignored after any row exists. @param span - Native count. @param width - Pixels or relative width. @param relative - Width family. @param adjust - Column adjustment. @param vertical - Orientation. @returns Nothing. */
  InsertCol(span: number, width: number, relative: boolean, adjust: A, vertical: number): void {
    if (this.m_nRows > 0) return;
    span &= 65535;
    width &= 65535;
    if (!span) span = 1;
    const required = (this.m_nCurrentColumn + span) & 65535;
    if (this.m_nCols < required) {
      for (let i = this.m_nCols; i < required; ++i) this.m_aColumns.push(new HTMLTableColumn());
      this.m_nCols = required;
    }
    const twips = (width * 15) & 65535;
    for (let i = this.m_nCurrentColumn; i < required; ++i) {
      const col = this.m_aColumns[i] as HTMLTableColumn;
      col.SetWidth(relative ? width : twips, relative);
      col.SetAdjust(adjust);
      col.SetVertOri(vertical);
    }
    this.m_bColSpec = true;
    this.m_nCurrentColumn = required;
  }
  /** Original finalization trims rows created only by rowspan, adds missing dimensions, then trims unfilled columns. Empty fixed-column tables retain the source zero-column edge case. @returns Nothing. */
  CloseTable(): void {
    if (this.m_nRows > this.m_nCurrentRow) {
      const row = this.m_aRows[this.m_nCurrentRow - 1] as HTMLTableRow;
      for (let i = 0; i < this.m_nCols; ++i) {
        const cell = row.GetCell(i);
        if (cell.GetRowSpan() > 1) {
          this.FixRowSpan(this.m_nCurrentRow - 1, i, cell.GetContents());
          this.ProtectRowSpan(
            this.m_nCurrentRow,
            i,
            this.GetCell(this.m_nCurrentRow, i).GetRowSpan(),
          );
        }
      }
      this.m_aRows.splice(this.m_nCurrentRow);
      this.m_nRows = this.m_nCurrentRow;
    }
    if (!this.m_nCols) {
      this.m_aColumns.push(new HTMLTableColumn());
      for (let i = 0; i < this.m_nRows; ++i) (this.m_aRows[i] as HTMLTableRow).Expand(1);
      this.m_nCols = this.m_nFilledColumns = 1;
    }
    if (!this.m_nRows) {
      this.m_aRows.push(new HTMLTableRow(this.m_nCols));
      this.m_nRows = this.m_nCurrentRow = 1;
    }
    if (this.m_nFilledColumns < this.m_nCols) {
      this.m_aColumns.splice(this.m_nFilledColumns);
      for (let i = 0; i < this.m_nRows; ++i)
        (this.m_aRows[i] as HTMLTableRow).Shrink(this.m_nFilledColumns);
      this.m_nCols = this.m_nFilledColumns;
    }
  }
}
