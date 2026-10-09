/** @fileoverview Calc address limits and reference flags from pinned sc/inc/address.hxx. Header-level exports share the original address owners with core/tool. */
import type { SCCOL, SCROW, SCTAB } from "./types";
import type { ScAddress, ScRange } from "../source/core/tool/address";
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
