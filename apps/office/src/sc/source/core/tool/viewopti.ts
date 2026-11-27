/** @fileoverview Calc display and drawing-grid options with native defaults and value copying. */
import { COL_GRAY3, Color } from "../../../../tools/inc/color";
import { ScGridOptions } from "./viewopti.grid";

/** Native sc::ViewOption ordinals from viewopti.hxx. */
export enum ViewOption {
  FORMULAS = 0,
  NULLVALS,
  SYNTAX,
  NOTES,
  NOTEAUTHOR,
  FORMULAS_MARKS,
  VSCROLL,
  HSCROLL,
  TABCONTROLS,
  OUTLINER,
  HEADER,
  GRID,
  GRID_ONTOP,
  HELPLINES,
  ANCHOR,
  PAGEBREAKS,
  SUMMARY,
  COPY_SHEET,
  THEMEDCURSOR,
}
/** Native value owner for display flags and the drawing grid. */
export class ScViewOptions {
  private aOptArr: boolean[] = [];
  private readonly aGridOpt = new ScGridOptions();
  private readonly aGridCol = new Color();
  /** Original default or independent copy construction. @param source - Optional source options. @returns Options. */
  constructor(source?: ScViewOptions) {
    if (source) this.copy_assign(source);
    else this.SetDefaults();
  }
  /** Restores the defaults for display flags and drawing geometry. @returns Nothing. */
  SetDefaults(): void {
    this.aOptArr = [
      false,
      true,
      false,
      true,
      true,
      false,
      true,
      true,
      true,
      true,
      true,
      true,
      false,
      false,
      true,
      true,
      true,
      false,
      false,
    ];
    this.aGridCol.assign(COL_GRAY3);
    this.aGridOpt.SetDefaults();
  }
  /** Original array assignment copies values into the existing owner. @param source - Source. @returns This. */
  copy_assign(source: ScViewOptions): this {
    this.aOptArr = [...source.aOptArr];
    this.aGridOpt.copy_assign(source.aGridOpt);
    this.aGridCol.assign(source.aGridCol);
    return this;
  }
  /** Original indexed option getter. @param option - Native valid ordinal. @returns Stored value. */
  GetOption(option: ViewOption): boolean {
    return this.aOptArr[option] as boolean;
  }
  /** Original indexed option setter. @param option - Native valid ordinal. @param value - State. @returns Nothing. */
  SetOption(option: ViewOption, value: boolean): void {
    this.aOptArr[option] = value;
  }

  /** Returns the original document grid line color. @returns Independent color. */
  GetGridColor(): Color {
    return new Color(this.aGridCol);
  }

  /** Sets the original document grid line color. @param color - Native grid color. @returns Nothing. */
  SetGridColor(color: Readonly<Color>): void {
    this.aGridCol.assign(color);
  }

  /** Borrows the native drawing-grid options. @returns Read-only grid options. */
  GetGridOptions(): Readonly<ScGridOptions> {
    return this.aGridOpt;
  }

  /** Copies drawing-grid options into the existing owner. @param options - Native grid value. @returns Nothing. */
  SetGridOptions(options: Readonly<ScGridOptions>): void {
    this.aGridOpt.copy_assign(options);
  }
}
