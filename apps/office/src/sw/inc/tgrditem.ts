/** @fileoverview Native SwTextGridItem defaults, typed Any members, paper-mode switching, cloning and complete browser snapshot binding from tgrditem.hxx/atrfrm.cxx. */
import { SfxPoolItem, CONVERT_TWIPS } from "../../svl/inc/poolitem";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { Color, COL_LIGHTGRAY, insertColor, extractColor } from "../../tools/inc/color";
import { convertTwipToMm100 } from "../../tools/inc/UnitConversion";
import { toTwips, Length } from "../../o3tl/inc/unit_conversion";
import { TextGridMode } from "../../offapi/com/sun/star/text/TextGridMode";
import { RES_TEXTGRID } from "./hintids";
import * as M from "./unomid";

/** Original grid enum order. */
export enum SwTextGrid {
  NONE,
  LinesOnly,
  LinesAndChars,
}
/** Complete persisted item payload; native getters/Any interfaces remain authoritative at runtime. */
export type TextGridSnapshot = readonly [
  number,
  number,
  number,
  number,
  number,
  boolean,
  boolean,
  boolean,
  number,
  boolean,
  boolean,
];

/** Original pooled grid item owns its mutable Color and scalar fields. */
export class SwTextGridItem extends SfxPoolItem {
  private m_aColor = new Color(COL_LIGHTGRAY);
  private m_nLines = 20;
  private m_nBaseHeight = 400;
  private m_nRubyHeight = 200;
  private m_eGridType: SwTextGrid = SwTextGrid.NONE;
  private m_bRubyTextBelow = false;
  private m_bPrintGrid = true;
  private m_bDisplayGrid = true;
  private m_nBaseWidth = 400;
  private m_bSnapToChars = true;
  private m_bSquaredMode = true;
  /** Native default/copy constructors preserve the complete item. @param source - Optional native copy. @returns Item. */
  constructor(source?: SwTextGridItem) {
    super(source?.Which() ?? RES_TEXTGRID);
    if (source) {
      this.m_aColor.assign(source.m_aColor);
      this.m_nLines = source.m_nLines;
      this.m_nBaseHeight = source.m_nBaseHeight;
      this.m_nRubyHeight = source.m_nRubyHeight;
      this.m_eGridType = source.m_eGridType;
      this.m_bRubyTextBelow = source.m_bRubyTextBelow;
      this.m_bPrintGrid = source.m_bPrintGrid;
      this.m_bDisplayGrid = source.m_bDisplayGrid;
      this.m_nBaseWidth = source.m_nBaseWidth;
      this.m_bSnapToChars = source.m_bSnapToChars;
      this.m_bSquaredMode = source.m_bSquaredMode;
    }
  }
  /** Original independent copy. @returns Item. */ override Clone(): SwTextGridItem {
    return new SwTextGridItem(this);
  }
  /** Original concrete-field equality. @param other - Candidate item. @returns Equality. */ override equals(
    other: SfxPoolItem,
  ): boolean {
    return (
      other instanceof SwTextGridItem &&
      this.m_aColor.equals(other.m_aColor) &&
      this.m_nLines === other.m_nLines &&
      this.m_nBaseHeight === other.m_nBaseHeight &&
      this.m_nRubyHeight === other.m_nRubyHeight &&
      this.m_eGridType === other.m_eGridType &&
      this.m_bRubyTextBelow === other.m_bRubyTextBelow &&
      this.m_bPrintGrid === other.m_bPrintGrid &&
      this.m_bDisplayGrid === other.m_bDisplayGrid &&
      this.m_nBaseWidth === other.m_nBaseWidth &&
      this.m_bSnapToChars === other.m_bSnapToChars &&
      this.m_bSquaredMode === other.m_bSquaredMode
    );
  }
  /** Borrows original const color. @returns Color. */ GetColor(): Readonly<Color> {
    return this.m_aColor;
  }
  /** Original color copy assignment. @param value - Color. @returns Nothing. */ SetColor(
    value: Readonly<Color>,
  ): void {
    this.m_aColor.assign(value);
  }
  /** Original signed16 line count. @returns Count. */ GetLines(): number {
    return this.m_nLines;
  }
  /** Original scalar assignment. @param value - Count. @returns Nothing. */ SetLines(
    value: number,
  ): void {
    this.m_nLines = (value << 16) >> 16;
  }
  /** Original unsigned16 base height. @returns Twips. */ GetBaseHeight(): number {
    return this.m_nBaseHeight;
  }
  /** Original scalar assignment. @param value - Twips. @returns Nothing. */ SetBaseHeight(
    value: number,
  ): void {
    this.m_nBaseHeight = value & 0xffff;
  }
  /** Original unsigned16 ruby height. @returns Twips. */ GetRubyHeight(): number {
    return this.m_nRubyHeight;
  }
  /** Original scalar assignment. @param value - Twips. @returns Nothing. */ SetRubyHeight(
    value: number,
  ): void {
    this.m_nRubyHeight = value & 0xffff;
  }
  /** Original grid enum. @returns Type. */ GetGridType(): SwTextGrid {
    return this.m_eGridType;
  }
  /** Original enum assignment. @param value - Type. @returns Nothing. */ SetGridType(
    value: SwTextGrid,
  ): void {
    this.m_eGridType = value;
  }
  /** Original ruby flag. @returns Flag. */ IsRubyTextBelow(): boolean {
    return this.m_bRubyTextBelow;
  }
  /** Original ruby flag alias. @returns Flag. */ GetRubyTextBelow(): boolean {
    return this.m_bRubyTextBelow;
  }
  /** Original ruby assignment. @param value - Flag. @returns Nothing. */ SetRubyTextBelow(
    value: boolean,
  ): void {
    this.m_bRubyTextBelow = value;
  }
  /** Original print flag. @returns Flag. */ IsPrintGrid(): boolean {
    return this.m_bPrintGrid;
  }
  /** Original print flag alias. @returns Flag. */ GetPrintGrid(): boolean {
    return this.m_bPrintGrid;
  }
  /** Original print assignment. @param value - Flag. @returns Nothing. */ SetPrintGrid(
    value: boolean,
  ): void {
    this.m_bPrintGrid = value;
  }
  /** Original display flag. @returns Flag. */ IsDisplayGrid(): boolean {
    return this.m_bDisplayGrid;
  }
  /** Original display flag alias. @returns Flag. */ GetDisplayGrid(): boolean {
    return this.m_bDisplayGrid;
  }
  /** Original display assignment. @param value - Flag. @returns Nothing. */ SetDisplayGrid(
    value: boolean,
  ): void {
    this.m_bDisplayGrid = value;
  }
  /** Original unsigned16 base width. @returns Twips. */ GetBaseWidth(): number {
    return this.m_nBaseWidth;
  }
  /** Original scalar assignment. @param value - Twips. @returns Nothing. */ SetBaseWidth(
    value: number,
  ): void {
    this.m_nBaseWidth = value & 0xffff;
  }
  /** Original snapping flag. @returns Flag. */ IsSnapToChars(): boolean {
    return this.m_bSnapToChars;
  }
  /** Original snapping flag alias. @returns Flag. */ GetSnapToChars(): boolean {
    return this.m_bSnapToChars;
  }
  /** Original snapping assignment. @param value - Flag. @returns Nothing. */ SetSnapToChars(
    value: boolean,
  ): void {
    this.m_bSnapToChars = value;
  }
  /** Original squared mode. @returns Flag. */ IsSquaredMode(): boolean {
    return this.m_bSquaredMode;
  }
  /** Original squared mode alias. @returns Flag. */ GetSquaredMode(): boolean {
    return this.m_bSquaredMode;
  }
  /** Original mode assignment without reinitializing other fields. @param value - Flag. @returns Nothing. */ SetSquaredMode(
    value: boolean,
  ): void {
    this.m_bSquaredMode = value;
  }
  /** Complete browser persistence binding, not a native UNO member query. @returns Snapshot. */ override QueryValue(): TextGridSnapshot;
  /** Original member query. @param output - Actual Any. @param member - Native member. @returns Success. */ override QueryValue(
    output: Any,
    member?: number,
  ): boolean;
  /** Implements the existing snapshot overload beside original typed queries. @param output - Optional native output. @param member - Member. @returns Snapshot or success. */ override QueryValue(
    output?: Any,
    member = 0,
  ): TextGridSnapshot | boolean {
    if (!output)
      return [
        this.m_aColor.toInt32(),
        this.m_nLines,
        this.m_nBaseHeight,
        this.m_nRubyHeight,
        this.m_eGridType,
        this.m_bRubyTextBelow,
        this.m_bPrintGrid,
        this.m_bDisplayGrid,
        this.m_nBaseWidth,
        this.m_bSnapToChars,
        this.m_bSquaredMode,
      ];
    switch (member & ~CONVERT_TWIPS) {
      case M.MID_GRID_COLOR:
        insertColor(output, this.m_aColor);
        break;
      case M.MID_GRID_LINES:
        output.insert([this.m_nLines], "sal_Int16");
        break;
      case M.MID_GRID_RUBY_BELOW:
        output.insert([this.m_bRubyTextBelow], "bool");
        break;
      case M.MID_GRID_PRINT:
        output.insert([this.m_bPrintGrid], "bool");
        break;
      case M.MID_GRID_DISPLAY:
        output.insert([this.m_bDisplayGrid], "bool");
        break;
      case M.MID_GRID_BASEHEIGHT:
        output.insert([Number(convertTwipToMm100(BigInt(this.m_nBaseHeight)))], "sal_Int32");
        break;
      case M.MID_GRID_BASEWIDTH:
        output.insert([Number(convertTwipToMm100(BigInt(this.m_nBaseWidth)))], "sal_Int32");
        break;
      case M.MID_GRID_RUBYHEIGHT:
        output.insert([Number(convertTwipToMm100(BigInt(this.m_nRubyHeight)))], "sal_Int32");
        break;
      case M.MID_GRID_TYPE:
        if (
          this.m_eGridType !== SwTextGrid.NONE &&
          this.m_eGridType !== SwTextGrid.LinesOnly &&
          this.m_eGridType !== SwTextGrid.LinesAndChars
        )
          return false;
        output.insert(
          [
            this.m_eGridType === SwTextGrid.NONE
              ? TextGridMode.NONE
              : this.m_eGridType === SwTextGrid.LinesOnly
                ? TextGridMode.LINES
                : TextGridMode.LINES_AND_CHARS,
          ],
          "sal_Int16",
        );
        break;
      case M.MID_GRID_SNAPTOCHARS:
        output.insert([this.m_bSnapToChars], "bool");
        break;
      case M.MID_GRID_STANDARD_MODE:
        output.insert([!this.m_bSquaredMode], "bool");
        break;
      default:
        return false;
    }
    return true;
  }
  /** Original Any admission and conversion, including five-point base-size minimum and unchecked bool-access preconditions. @param input - Actual Any. @param member - Member. @returns Success. */ override PutValue(
    input: unknown,
    member: number,
  ): boolean {
    if (!(input instanceof Any)) return false;
    const id = member & ~CONVERT_TWIPS,
      integer: [number] = [0];
    switch (id) {
      case M.MID_GRID_COLOR: {
        const color = new Color();
        const ok = extractColor(input, color);
        if (ok) this.SetColor(color);
        return ok;
      }
      case M.MID_GRID_LINES:
        if (!input.extract(integer, "sal_Int16") || integer[0] < 0) return false;
        this.SetLines(integer[0]);
        return true;
      case M.MID_GRID_BASEHEIGHT:
      case M.MID_GRID_BASEWIDTH:
      case M.MID_GRID_RUBYHEIGHT: {
        const ok = input.extract(integer, "sal_Int32"),
          twips = Number(toTwips(BigInt(integer[0]), Length.mm100));
        if (!ok || twips < 0 || twips > 0xffff) return false;
        if (id === M.MID_GRID_BASEHEIGHT) this.SetBaseHeight(Math.max(twips, 100));
        else if (id === M.MID_GRID_BASEWIDTH) this.SetBaseWidth(Math.max(twips, 100));
        else this.SetRubyHeight(twips);
        return true;
      }
      case M.MID_GRID_TYPE:
        if (!input.extract(integer, "sal_Int16")) return false;
        switch (integer[0]) {
          case TextGridMode.NONE:
            this.SetGridType(SwTextGrid.NONE);
            break;
          case TextGridMode.LINES:
            this.SetGridType(SwTextGrid.LinesOnly);
            break;
          case TextGridMode.LINES_AND_CHARS:
            this.SetGridType(SwTextGrid.LinesAndChars);
            break;
          default:
            return false;
        }
        return true;
      case M.MID_GRID_RUBY_BELOW:
      case M.MID_GRID_PRINT:
      case M.MID_GRID_DISPLAY:
      case M.MID_GRID_SNAPTOCHARS:
      case M.MID_GRID_STANDARD_MODE: {
        const value: [boolean] = [false];
        if (!input.extract(value, "bool"))
          throw new Error("SwTextGridItem native bool-access precondition failed.");
        if (id === M.MID_GRID_RUBY_BELOW) this.SetRubyTextBelow(value[0]);
        else if (id === M.MID_GRID_PRINT) this.SetPrintGrid(value[0]);
        else if (id === M.MID_GRID_DISPLAY) this.SetDisplayGrid(value[0]);
        else if (id === M.MID_GRID_SNAPTOCHARS) this.SetSnapToChars(value[0]);
        else this.SetSquaredMode(!value[0]);
        return true;
      }
      default:
        return false;
    }
  }
  /** Original paper-mode transition preserves native uint16 narrowing and default reset for disabled grids. @param value - Squared mode. @returns Nothing. */ SwitchPaperMode(
    value: boolean,
  ): void {
    if (value === this.m_bSquaredMode) return;
    if (this.m_eGridType === SwTextGrid.NONE) {
      this.m_bSquaredMode = value;
      this.Init();
      return;
    }
    if (this.m_bSquaredMode) {
      this.m_nBaseWidth = this.m_nBaseHeight;
      this.SetBaseHeight(this.m_nBaseHeight + this.m_nRubyHeight);
      this.m_nRubyHeight = 0;
    } else {
      this.m_nRubyHeight = Math.trunc(this.m_nBaseHeight / 3);
      this.m_nBaseHeight -= this.m_nRubyHeight;
      this.m_nBaseWidth = this.m_nBaseHeight;
    }
    this.m_bSquaredMode = !this.m_bSquaredMode;
  }
  /** Native mode defaults deliberately retain the existing color. @returns Nothing. */ Init(): void {
    this.m_nLines = this.m_bSquaredMode ? 20 : 44;
    this.m_nBaseHeight = this.m_bSquaredMode ? 400 : 312;
    this.m_nRubyHeight = this.m_bSquaredMode ? 200 : 0;
    this.m_eGridType = SwTextGrid.NONE;
    this.m_bRubyTextBelow = false;
    this.m_bPrintGrid = true;
    this.m_bDisplayGrid = true;
    this.m_bSnapToChars = true;
    this.m_nBaseWidth = this.m_bSquaredMode ? 400 : 210;
  }
}
