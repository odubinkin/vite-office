/** @fileoverview Owns represented table dialog geometry from native SwTableRep and tabsh.cxx. */
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import type { SwTable } from "../../core/table/swtable";
import { SwTabFrame } from "../../core/layout/tabfrm";
import { SwTabCols } from "../../core/bastyp/tabcol";

/** Native table-dialog column interval ending at a visible or hidden separator. */
export interface TColumn {
  nWidth: number;
  bVisible: boolean;
}

/** Native table-dialog draft retains all interval widths and separator visibility. */
export class SwTableRep {
  public width = 0;
  public left = 0;
  public right = 0;
  public align = HoriOrientation.NONE;
  public space = 0;
  public readonly columns: TColumn[] = [];
  private lineSelected = false;
  private widthChanged = false;
  private colsChanged = false;

  /** Assigns represented native values while retaining the shared draft and vector owners. @param source - Original draft. @returns This owner. */
  public Assign(source: SwTableRep): this {
    this.width = source.width;
    this.left = source.left;
    this.right = source.right;
    this.align = source.align;
    this.space = source.space;
    this.lineSelected = source.IsLineSelected();
    this.widthChanged = source.HasWidthChanged();
    this.colsChanged = source.HasColsChanged();
    this.columns.splice(
      0,
      this.columns.length,
      ...source.columns.map(
        /** Copies complete native column values. @param column - Source interval. @returns Independent interval. */
        (column) => ({ ...column }),
      ),
    );
    return this;
  }
  /** Reads native partial-table selection state. @returns Whether individual cells or rows are selected. */
  public IsLineSelected(): boolean {
    return this.lineSelected;
  }
  /** Writes the native shell selection classification. @param value - Partial table selection. @returns Nothing. */
  public SetLineSelected(value: boolean): void {
    this.lineSelected = value;
  }
  /** Reads accepted native width changes. @returns Width flag. */
  public HasWidthChanged(): boolean {
    return this.widthChanged;
  }
  /** Marks native width/spacing changes. @returns Nothing. */
  public SetWidthChanged(): void {
    this.widthChanged = true;
  }
  /** Reads accepted native column changes. @returns Column flag. */
  public HasColsChanged(): boolean {
    return this.colsChanged;
  }
  /** Marks accepted native column changes. @returns Nothing. */
  public SetColsChanged(): void {
    this.colsChanged = true;
  }

  /** Reads all native intervals, including hidden separators. @returns Native column entries. */
  public GetColumns(): TColumn[] {
    return this.columns;
  }
  /** Reads native visible column count. @returns Visible intervals. */
  public GetColCount(): number {
    return this.columns.filter(
      /** Counts native visible interval ends. @param column - Interval. @returns Visibility. */
      (column) => column.bVisible,
    ).length;
  }
  /** Reads all native interval count. @returns Total intervals. */
  public GetAllColCount(): number {
    return this.columns.length;
  }

  /** Merges accepted visible positions with original hidden constraints using native ordering and rounding. @param result - Original native geometry. @returns Whether the source requires a single-row operation. */
  public FillTabCols(result: SwTabCols): boolean {
    const oldLeft = result.GetLeft(),
      oldRight = result.GetRight();
    let singleLine = false;
    for (let i = 0; i < result.Count(); i++)
      if (!(this.columns[i] as TColumn).bVisible) {
        singleLine = true;
        break;
      }
    result.SetLeft(this.left);
    let position = 0;
    if (singleLine) {
      const old: TColumn[] = [];
      let start = 0;
      for (let i = 0; i < this.GetAllColCount() - 1; i++) {
        const end = result.GetEntry(i).nPos - result.GetLeft();
        old.push({ nWidth: end - start, bVisible: !result.IsHidden(i) });
        start = end;
      }
      old.push({ nWidth: result.GetRight() - result.GetLeft() - start, bVisible: true });
      let oldPosition = 0,
        newPosition = 0,
        oldSum = 0,
        newSum = 0,
        useOld = false,
        first = true;
      for (let i = 0; i < this.GetAllColCount() - 1; i++) {
        while ((first || useOld) && oldPosition < this.GetAllColCount()) {
          oldSum += (old[oldPosition] as TColumn).nWidth;
          oldPosition++;
          if (!(old[oldPosition - 1] as TColumn).bVisible) break;
        }
        while ((first || !useOld) && newPosition < this.GetAllColCount()) {
          newSum += (this.columns[newPosition] as TColumn).nWidth;
          newPosition++;
          if ((old[newPosition - 1] as TColumn).bVisible) break;
        }
        first = false;
        useOld = oldSum < newSum;
        position = useOld ? oldSum : newSum;
        result.GetEntry(i).nPos = position + this.left;
        result.SetHidden(i, useOld);
      }
      result.SetRight(this.left + this.width);
    } else {
      for (let i = 0; i < this.GetAllColCount() - 1; i++) {
        position += (this.columns[i] as TColumn).nWidth;
        result.GetEntry(i).nPos = position + result.GetLeft();
        result.SetHidden(i, !(this.columns[i] as TColumn).bVisible);
        result.SetRight(this.left + (this.columns.at(-1) as TColumn).nWidth + position);
      }
    }
    if (Math.abs(oldLeft - result.GetLeft()) < 3) result.SetLeft(oldLeft);
    if (Math.abs(oldRight - result.GetRight()) < 3) result.SetRight(oldRight);
    if (this.right >= 0 && result.GetRight() > result.GetRightMax())
      result.SetRight(result.GetRightMax());
    return singleLine;
  }

  /** Initializes complete native intervals from current shell geometry. @param geometry - Native separators. @returns Nothing. */
  private InitializeColumns(geometry: SwTabCols): void {
    let start = 0;
    for (let i = 0; i < geometry.Count(); i++) {
      const end = geometry.GetEntry(i).nPos - geometry.GetLeft();
      this.columns.push({ nWidth: end - start, bVisible: !geometry.IsHidden(i) });
      start = end;
    }
    this.columns.push({ nWidth: geometry.GetRight() - geometry.GetLeft() - start, bVisible: true });
  }

  /** Initializes native separators with source scalar defaults or copies an independent draft. @param source - Current separators or original draft. @returns Nothing. */
  public constructor(source: SwTabCols | SwTableRep);
  /** Reads the native table-parameter input geometry. @param table - Original table. @param space - Upper print width. @param geometry - Current native separators. @returns Nothing. */
  public constructor(table: SwTable, space: number, geometry?: SwTabCols);
  /** Implements table initialization and source copy construction. @param table - Actual table or original draft. @param space - Upper print width for a table. @param geometry - Current native separators. @returns Nothing. */
  public constructor(table: SwTable | SwTableRep | SwTabCols, space = 0, geometry?: SwTabCols) {
    if (table instanceof SwTableRep) {
      this.Assign(table);
      return;
    }
    if (table instanceof SwTabCols) {
      this.InitializeColumns(table);
      return;
    }
    this.space = space;
    const format = table.GetFormat();
    this.align = table.GetHoriOrient();
    this.width = format.width ?? space;
    const lr = table.GetFrameFormat().GetLRSpace();
    this.left = lr.ResolveLeft();
    this.right = lr.ResolveRight();
    const rest = space - this.width;
    switch (this.align) {
      case HoriOrientation.CENTER:
        this.left = this.right = Math.trunc(rest / 2);
        break;
      case HoriOrientation.LEFT:
        this.left = 0;
        this.right = rest;
        break;
      case HoriOrientation.RIGHT:
        this.left = rest;
        this.right = 0;
        break;
      case HoriOrientation.LEFT_AND_WIDTH:
        this.right = rest - this.left;
        break;
      case HoriOrientation.NONE:
        this.width = space - this.left - this.right;
        break;
      case HoriOrientation.FULL:
        this.width = space;
        break;
    }
    const start = table.GetTabLines()[0]?.GetTabBoxes()[0];
    if (geometry !== undefined) {
      this.left = geometry.GetLeft();
      this.right = space - geometry.GetRight();
      this.width = geometry.GetRight() - geometry.GetLeft();
      this.InitializeColumns(geometry);
    } else if (start === undefined)
      this.columns.push(
        ...table.GetColumnWidths().map(
          /** Preserves explicit builder declarations without connected row owners. @param width - Declared width. @returns Visible native entry. */
          (width) => ({ nWidth: width, bVisible: true }),
        ),
      );
    else {
      const frame = new SwTabFrame(table);
      let area;
      try {
        area = frame.Format(space);
      } finally {
        frame.DestroyImpl();
      }
      const geometry = new SwTabCols();
      this.left = area.left;
      this.right = area.right;
      this.width = area.width;
      geometry.SetLeft(area.left);
      geometry.SetRight(area.left + area.width);
      geometry.SetRightMax(space);
      table.GetTabCols(geometry, start);
      this.InitializeColumns(geometry);
    }
  }
}
