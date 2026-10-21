/** @fileoverview Original ScViewOptions boolean array/default/copy responsibility. Object modes,grid color,drawing-grid members and configuration services remain explicitly unported. */
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
/** Original view-option owner for the consumed boolean fields;this is not a replacement for unported rendering/configuration members. */
export class ScViewOptions {
  private aOptArr: boolean[] = [];
  /** Original default or independent copy construction. @param source - Optional source options. @returns Options. */
  constructor(source?: ScViewOptions) {
    if (source) this.copy_assign(source);
    else this.SetDefaults();
  }
  /** Original19boolean defaults in enum order;other native members are not represented by this partial owner. @returns Nothing. */
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
  }
  /** Original array assignment copies values into the existing owner. @param source - Source. @returns This. */
  copy_assign(source: ScViewOptions): this {
    this.aOptArr = [...source.aOptArr];
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
}
