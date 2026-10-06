/** @fileoverview Owns represented table dialog geometry from native SwTableRep and tabsh.cxx. */
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import type { SwTable } from "../../core/table/swtable";
import { SwTabFrame } from "../../core/layout/tabfrm";
import { SwTabCols } from "../../core/bastyp/tabcol";

/** Flat visible-column dialog draft; the canonical table remains owned by SwDoc. */
export class SwTableRep {
  public width = 0;
  public left = 0;
  public right = 0;
  public align = HoriOrientation.NONE;
  public space = 0;
  public readonly columns: number[] = [];
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
    this.columns.splice(0, this.columns.length, ...source.columns);
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

  /** Fills native visible flat separators from the accepted dialog, preserving source edge rounding. @param result - Original native geometry. @returns Whether hidden columns require a single-row operation. */
  public FillTabCols(result: SwTabCols): boolean {
    const oldLeft = result.GetLeft(),
      oldRight = result.GetRight();
    result.SetLeft(this.left);
    let position = 0;
    for (let i = 0; i < result.Count(); i++) {
      position += this.columns[i] as number;
      result.GetEntry(i).nPos = position + result.GetLeft();
      result.SetHidden(i, false);
      result.SetRight(this.left + (this.columns.at(-1) as number) + position);
    }
    if (Math.abs(oldLeft - result.GetLeft()) < 3) result.SetLeft(oldLeft);
    if (Math.abs(oldRight - result.GetRight()) < 3) result.SetRight(oldRight);
    if (this.right >= 0 && result.GetRight() > result.GetRightMax())
      result.SetRight(result.GetRightMax());
    return false;
  }

  /** Copies an independent represented native table draft. @param source - Original draft. @returns Nothing. */
  public constructor(source: SwTableRep);
  /** Reads the native table-parameter input geometry. @param table - Original table. @param space - Upper print width. @returns Nothing. */
  public constructor(table: SwTable, space: number);
  /** Implements table initialization and source copy construction. @param table - Actual table or original draft. @param space - Upper print width for a table. @returns Nothing. */
  public constructor(table: SwTable | SwTableRep, space = 0) {
    if (table instanceof SwTableRep) {
      this.Assign(table);
      return;
    }
    this.space = space;
    const format = table.GetFormat();
    this.align = table.GetHoriOrient();
    this.width = format.width ?? space;
    this.left = format.marginLeft ?? 0;
    this.right = format.marginRight ?? 0;
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
    if (start === undefined) this.columns = [...table.GetColumnWidths()];
    else {
      const area = new SwTabFrame(table).Format(space),
        geometry = new SwTabCols();
      this.left = area.left;
      this.right = area.right;
      this.width = area.width;
      geometry.SetLeft(area.left);
      geometry.SetRight(area.left + area.width);
      geometry.SetRightMax(space);
      table.GetTabCols(geometry, start);
      this.columns = [];
      let previous = 0;
      for (let i = 0; i < geometry.Count(); i++) {
        const position = geometry.GetEntry(i).nPos - geometry.GetLeft();
        this.columns.push(position - previous);
        previous = position;
      }
      this.columns.push(geometry.GetRight() - geometry.GetLeft() - previous);
    }
  }
}
