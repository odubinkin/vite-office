/** @fileoverview Calc address limits and reference flags from pinned sc/inc/address.hxx. Header-level exports share the original address owners with core/tool. */
import type { SCCOL, SCROW, SCTAB } from "./types";
import { ScAddress } from "../source/core/tool/address";
import type { ScRange } from "../source/core/tool/address";
export { ScAddress, ScRange } from "../source/core/tool/address";

/** Native integer-domain maxima, distinct from spreadsheet bounds. */
export const SCROW_MAX = 0x7fffffff;
export const SCCOL_MAX = 0x7fff;
export const SCTAB_MAX = 0x7fff;
export const SCCOLROW_MAX = SCROW_MAX;
/** Standard and experimental jumbo sheet capacities. */
export const MAXROWCOUNT = 1024 * 1024;
export const MAXCOLCOUNT = 16 * 1024;
export const INITIALCOLCOUNT = 1;
export const MAXTABCOUNT = 10000;
export const MAXROW = MAXROWCOUNT - 1;
export const MAXCOL = MAXCOLCOUNT - 1;
export const MAXTAB = MAXTABCOUNT - 1;
export const MAXCOLROW = MAXROW;
export const MAXROWCOUNT_JUMBO = 16 * 1024 * 1024;
export const MAXCOLCOUNT_JUMBO = 16 * 1024;
export const MAXROW_JUMBO = MAXROWCOUNT_JUMBO - 1;
export const MAXCOL_JUMBO = MAXCOLCOUNT_JUMBO - 1;
export const MAXTILEDROW = MAXROW;
export const MAXINITTAB = 1024;
export const MININITTAB = 1;
export const MAXROW_STRING = "1048575";
export const MAXCOL_STRING = "XFD";
export const MAXROW_JUMBO_STRING = "16777215";
export const MAXCOL_JUMBO_STRING = "XFD";
/** Native special coordinate sentinels. */
export const SC_TAB_APPEND = SCTAB_MAX;
export const TABLEID_DOC = SCTAB_MAX;
export const SCROWS32K = 32000;
export const SCCOL_REPEAT_NONE = SCCOL_MAX;
export const SCROW_REPEAT_NONE = SCROW_MAX;
export const SC_TABSTART_NONE = SCCOL_MAX;
export const MAXROW_30 = 8191;

/** Original unsigned 16-bit reference flags and compound masks. */
export enum ScRefFlags {
  ZERO = 0x0000,
  COL_ABS = 0x0001,
  ROW_ABS = 0x0002,
  TAB_ABS = 0x0004,
  TAB_3D = 0x0008,
  COL2_ABS = 0x0010,
  ROW2_ABS = 0x0020,
  TAB2_ABS = 0x0040,
  TAB2_3D = 0x0080,
  ROW_VALID = 0x0100,
  COL_VALID = 0x0200,
  TAB_VALID = 0x0400,
  BITS = 0x070f,
  FORCE_DOC = 0x0800,
  ROW2_VALID = 0x1000,
  COL2_VALID = 0x2000,
  TAB2_VALID = 0x4000,
  VALID = 0x8000,
  TAB_ABS_3D = 0x000c,
  ADDR_ABS = 0x8007,
  RANGE_ABS = 0x8077,
  ADDR_ABS_3D = 0x800f,
  RANGE_ABS_3D = 0x807f,
}

/** Applies native start-to-end shift, returning the reference-parameter result. @param target - Existing flags. @param source - Start flags, defaulting to target. @returns Unsigned 16-bit flags. */
export function applyStartToEndFlags(target: ScRefFlags, source: ScRefFlags = target): ScRefFlags {
  return (target | (source << 4)) & 0xffff;
}
/** Checks column bounds. @param col - Coordinate. @param maxCol - Document maximum. @returns Whether within bounds. */
export function ValidCol(col: SCCOL, maxCol: SCCOL): boolean {
  return col >= 0 && col <= maxCol;
}
/** Checks row bounds. @param row - Coordinate. @param maxRow - Document maximum. @returns Whether within bounds. */
export function ValidRow(row: SCROW, maxRow: SCROW): boolean {
  return row >= 0 && row <= maxRow;
}
/** Checks sheet bounds. @param tab - Coordinate. @param maxTab - Native global maximum by default. @returns Whether within bounds. */
export function ValidTab(tab: SCTAB, maxTab: SCTAB = MAXTAB): boolean {
  return tab >= 0 && tab <= maxTab;
}
/** Checks a two-dimensional coordinate. @param col - Column. @param row - Row. @param maxCol - Maximum column. @param maxRow - Maximum row. @returns Whether within bounds. */
export function ValidColRow(col: SCCOL, row: SCROW, maxCol: SCCOL, maxRow: SCROW): boolean {
  return ValidCol(col, maxCol) && ValidRow(row, maxRow);
}
/** Checks a three-dimensional coordinate. @param col - Column. @param row - Row. @param tab - Sheet. @param maxCol - Maximum column. @param maxRow - Maximum row. @returns Whether within bounds. */
export function ValidColRowTab(
  col: SCCOL,
  row: SCROW,
  tab: SCTAB,
  maxCol: SCCOL,
  maxRow: SCROW,
): boolean {
  return ValidColRow(col, row, maxCol, maxRow) && ValidTab(tab);
}
/** Clamps a column. @param col - Coordinate. @param maxCol - Maximum column. @returns Clamped coordinate. */
export function SanitizeCol(col: SCCOL, maxCol: SCCOL): SCCOL {
  return col < 0 ? 0 : col > maxCol ? maxCol : col;
}
/** Clamps a row. @param row - Coordinate. @param maxRow - Maximum row. @returns Clamped coordinate. */
export function SanitizeRow(row: SCROW, maxRow: SCROW): SCROW {
  return row < 0 ? 0 : row > maxRow ? maxRow : row;
}
/** Clamps a sheet. @param tab - Coordinate. @returns Clamped coordinate. */
export function SanitizeTab(tab: SCTAB): SCTAB {
  return tab < 0 ? 0 : tab > MAXTAB ? MAXTAB : tab;
}
/** Checks document-sized bounds, unlike address IsValid. @param address - Address. @param maxCol - Maximum column. @param maxRow - Maximum row. @returns Whether within bounds. */
export function ValidAddress(address: ScAddress, maxCol: SCCOL, maxRow: SCROW): boolean {
  return ValidColRowTab(address.Col(), address.Row(), address.Tab(), maxCol, maxRow);
}
/** Checks both range endpoints without sorting them. @param range - Range. @param maxCol - Maximum column. @param maxRow - Maximum row. @returns Whether within bounds. */
export function ValidRange(range: ScRange, maxCol: SCCOL, maxRow: SCROW): boolean {
  return ValidAddress(range.aStart, maxCol, maxRow) && ValidAddress(range.aEnd, maxCol, maxRow);
}

/** Native address value with independent relative-coordinate flags. */
export class ScRefAddress {
  private readonly aAdr: ScAddress;
  private bRelCol = false;
  private bRelRow = false;
  private bRelTab = false;

  /** Constructs the original zero, explicit or copied reference. @param args - Native constructor arguments. @returns New reference address. */
  public constructor(...args: [] | [ScRefAddress] | [SCCOL, SCROW, SCTAB]) {
    const [source, row, tab] = args;
    if (source instanceof ScRefAddress) {
      this.aAdr = new ScAddress(source.aAdr);
      this.bRelCol = source.bRelCol;
      this.bRelRow = source.bRelRow;
      this.bRelTab = source.bRelTab;
    } else this.aAdr = new ScAddress(source, row, tab);
  }
  /** Assigns without replacing the owned address. @param other - Source. @returns Recipient. */
  public assign(other: ScRefAddress): this {
    this.aAdr.assign(other.aAdr);
    this.bRelCol = other.bRelCol;
    this.bRelRow = other.bRelRow;
    this.bRelTab = other.bRelTab;
    return this;
  }
  /** Reads column relativity. @returns Relative column flag. */
  public IsRelCol(): boolean {
    return this.bRelCol;
  }
  /** Reads row relativity. @returns Relative row flag. */
  public IsRelRow(): boolean {
    return this.bRelRow;
  }
  /** Reads sheet relativity. @returns Relative sheet flag. */
  public IsRelTab(): boolean {
    return this.bRelTab;
  }
  /** Sets only column relativity. @param value - Flag. @returns Nothing. */
  public SetRelCol(value: boolean): void {
    this.bRelCol = value;
  }
  /** Sets only row relativity. @param value - Flag. @returns Nothing. */
  public SetRelRow(value: boolean): void {
    this.bRelRow = value;
  }
  /** Sets only sheet relativity. @param value - Flag. @returns Nothing. */
  public SetRelTab(value: boolean): void {
    this.bRelTab = value;
  }
  /** Assigns coordinates and all three flags through either native overload. @param args - Address/flags or coordinates/flags. @returns Nothing. */
  public Set(
    ...args:
      [ScAddress, boolean, boolean, boolean] | [SCCOL, SCROW, SCTAB, boolean, boolean, boolean]
  ): void {
    if (args[0] instanceof ScAddress) {
      const [address, colRel, rowRel, tabRel] = args as [ScAddress, boolean, boolean, boolean];
      this.aAdr.assign(address);
      this.bRelCol = colRel;
      this.bRelRow = rowRel;
      this.bRelTab = tabRel;
    } else {
      const [col, row, tab, colRel, rowRel, tabRel] = args as [
        SCCOL,
        SCROW,
        SCTAB,
        boolean,
        boolean,
        boolean,
      ];
      this.aAdr.Set(col, row, tab);
      this.bRelCol = colRel;
      this.bRelRow = rowRel;
      this.bRelTab = tabRel;
    }
  }
  /** Exposes the stable owned value, corresponding to a native const reference. @returns Address owner. */
  public GetAddress(): ScAddress {
    return this.aAdr;
  }
  /** Reads column. @returns Column. */
  public Col(): SCCOL {
    return this.aAdr.Col();
  }
  /** Reads row. @returns Row. */
  public Row(): SCROW {
    return this.aAdr.Row();
  }
  /** Reads sheet. @returns Sheet. */
  public Tab(): SCTAB {
    return this.aAdr.Tab();
  }
  /** Compares coordinates and each independent flag. @param other - Reference. @returns Equality. */
  public equals(other: ScRefAddress): boolean {
    return (
      this.aAdr.equals(other.aAdr) &&
      this.bRelCol === other.bRelCol &&
      this.bRelRow === other.bRelRow &&
      this.bRelTab === other.bRelTab
    );
  }
}
